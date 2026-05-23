import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { parseConfig } from "@/lib/config/parser";
import { getPhysicalTableName, ensureTablesExist } from "@/lib/db/schema-gen";

// Helper to determine if DB is SQLite or PostgreSQL
async function getDialect(): Promise<"sqlite" | "postgresql"> {
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("postgres") || dbUrl.includes("postgresql") || dbUrl.includes("postgres:")) {
    return "postgresql";
  }
  return "sqlite";
}

export async function GET(
  req: Request,
  { params }: { params: { appId: string; table: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { appId, table } = params;

    // Load App configuration
    const appRecord = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const config = parseConfig(JSON.parse(appRecord.config));
    const tableDef = config.database.tables.find((t) => t.name === table);

    if (!tableDef) {
      return NextResponse.json({ error: `Table '${table}' not found in configuration` }, { status: 404 });
    }

    // Ensure physical tables are created / synchronized (drift check)
    await ensureTablesExist(config, appId);

    const physicalName = getPhysicalTableName(appId, table);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Fetch session check
    const endpointConfig = config.api.endpoints.find(
      (ep) => ep.table === table && ep.method === "GET"
    );

    const authRequired = endpointConfig ? endpointConfig.auth : true;
    if (authRequired && (!session || !session.user)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session?.user ? (session.user as any).id : "anonymous";
    const dialect = await getDialect();

    if (id) {
      // Fetch single record
      const sql = dialect === "sqlite"
        ? `SELECT * FROM ${physicalName} WHERE id = ? AND (userId = ? OR ? = 'anonymous') AND deletedAt IS NULL LIMIT 1`
        : `SELECT * FROM ${physicalName} WHERE id = $1 AND (userId = $2 OR $3 = 'anonymous') AND deletedAt IS NULL LIMIT 1`;

      const records: any = await prisma.$queryRawUnsafe(sql, id, userId, userId);

      if (!Array.isArray(records) || records.length === 0) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }

      return NextResponse.json(records[0]);
    } else {
      // Fetch list with pagination
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      const listSql = dialect === "sqlite"
        ? `SELECT * FROM ${physicalName} WHERE (userId = ? OR ? = 'anonymous') AND deletedAt IS NULL ORDER BY createdAt DESC LIMIT ? OFFSET ?`
        : `SELECT * FROM ${physicalName} WHERE ("userId" = $1 OR $2 = 'anonymous') AND "deletedAt" IS NULL ORDER BY "createdAt" DESC LIMIT $3 OFFSET $4`;

      const countSql = dialect === "sqlite"
        ? `SELECT COUNT(*) as count FROM ${physicalName} WHERE (userId = ? OR ? = 'anonymous') AND deletedAt IS NULL`
        : `SELECT COUNT(*) as count FROM ${physicalName} WHERE ("userId" = $1 OR $2 = 'anonymous') AND "deletedAt" IS NULL`;

      const dataPromise = prisma.$queryRawUnsafe(listSql, userId, userId, limit, offset);
      const countPromise = prisma.$queryRawUnsafe(countSql, userId, userId);

      const [records, countRes]: [any, any] = await Promise.all([dataPromise, countPromise]);
      
      const total = countRes && countRes[0] ? Number(countRes[0].count) : 0;

      return NextResponse.json({
        data: records || [],
        total,
        page,
        limit,
      });
    }
  } catch (error: any) {
    console.error("[Dynamic GET API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { appId: string; table: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { appId, table } = params;

    const appRecord = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const config = parseConfig(JSON.parse(appRecord.config));
    const tableDef = config.database.tables.find((t) => t.name === table);

    if (!tableDef) {
      return NextResponse.json({ error: `Table '${table}' not found in configuration` }, { status: 404 });
    }

    // Endpoint config
    const endpointConfig = config.api.endpoints.find(
      (ep) => ep.table === table && ep.method === "POST"
    );
    const authRequired = endpointConfig ? endpointConfig.auth : true;
    if (authRequired && (!session || !session.user)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session?.user ? (session.user as any).id : "anonymous";
    const body = await req.json();

    // Field validations
    const validatedData: Record<string, any> = {};
    for (const field of tableDef.fields) {
      const val = body[field.name];
      if (field.required && (val === undefined || val === null || val === "")) {
        return NextResponse.json({ error: `Field '${field.label || field.name}' is required` }, { status: 422 });
      }

      if (val !== undefined && val !== null) {
        if (field.type === "number") {
          const num = Number(val);
          if (isNaN(num)) return NextResponse.json({ error: `Field '${field.name}' must be a number` }, { status: 422 });
          validatedData[field.name] = num;
        } else if (field.type === "boolean") {
          validatedData[field.name] = Boolean(val) ? 1 : 0;
        } else {
          validatedData[field.name] = String(val);
        }
      } else {
        validatedData[field.name] = field.default !== undefined ? field.default : null;
      }
    }

    await ensureTablesExist(config, appId);
    const physicalName = getPhysicalTableName(appId, table);
    const dialect = await getDialect();

    // Compile insert query
    // Unique ID generation
    const recordId = typeof window === "undefined"
      ? require("crypto").randomUUID()
      : Math.random().toString(36).substring(2);

    const keys = ["id", "userId", ...Object.keys(validatedData)];
    const values = [recordId, userId, ...Object.values(validatedData)];

    let sql = "";
    if (dialect === "sqlite") {
      const placeholders = keys.map(() => "?").join(", ");
      sql = `INSERT INTO ${physicalName} (${keys.join(", ")}) VALUES (${placeholders})`;
    } else {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      sql = `INSERT INTO ${physicalName} ("${keys.join('", "')}") VALUES (${placeholders})`;
    }

    try {
      await prisma.$executeRawUnsafe(sql, ...values);
    } catch (dbError: any) {
      // Catch unique violations
      if (dbError.message.includes("UNIQUE") || dbError.message.includes("constraint") || dbError.code === "P2002") {
        return NextResponse.json(
          { error: "A record with matching unique values already exists" },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        appId,
        userId: userId !== "anonymous" ? userId : appRecord.userId,
        table,
        action: "create",
        recordId,
        after: JSON.stringify(validatedData),
      },
    });

    // Check Trigger Event-based Notifications
    if (config.notifications?.triggers) {
      const trigger = config.notifications.triggers.find((tr) => tr.on === "record_created");
      if (trigger) {
        // Create in-app notification in database
        if (trigger.type === "in_app" && userId !== "anonymous") {
          await prisma.notification.create({
            data: {
              userId,
              title: `New record created in ${tableDef.displayName}`,
              message: trigger.message || `A new record was successfully compiled.`,
              type: "in_app",
            },
          });
        }
        // Mock email output
        if (trigger.type === "email") {
          console.log(`\n📧 [MOCK EMAIL SENT] To: user@company.com\nSubject: Event trigger active: record_created\nMessage: ${trigger.message}\n`);
        }
      }
    }

    return NextResponse.json({ success: true, id: recordId, data: validatedData }, { status: 201 });
  } catch (error: any) {
    console.error("[Dynamic POST API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { appId: string; table: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { appId, table } = params;

    const appRecord = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const config = parseConfig(JSON.parse(appRecord.config));
    const tableDef = config.database.tables.find((t) => t.name === table);

    if (!tableDef) {
      return NextResponse.json({ error: `Table '${table}' not found in configuration` }, { status: 404 });
    }

    const endpointConfig = config.api.endpoints.find(
      (ep) => ep.table === table && ep.method === "PUT"
    );
    const authRequired = endpointConfig ? endpointConfig.auth : true;
    if (authRequired && (!session || !session.user)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session?.user ? (session.user as any).id : "anonymous";
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Record 'id' parameter is required for update" }, { status: 422 });
    }

    // Clean update fields
    const updateData: Record<string, any> = {};
    for (const field of tableDef.fields) {
      if (body[field.name] !== undefined) {
        const val = body[field.name];
        if (field.type === "number") {
          updateData[field.name] = Number(val);
        } else if (field.type === "boolean") {
          updateData[field.name] = Boolean(val) ? 1 : 0;
        } else {
          updateData[field.name] = String(val);
        }
      }
    }

    const physicalName = getPhysicalTableName(appId, table);
    const dialect = await getDialect();

    // Check existing before update
    const selectSql = dialect === "sqlite"
      ? `SELECT * FROM ${physicalName} WHERE id = ? AND userId = ? AND deletedAt IS NULL LIMIT 1`
      : `SELECT * FROM ${physicalName} WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL LIMIT 1`;
    
    const checkRecords: any = await prisma.$queryRawUnsafe(selectSql, id, userId);
    if (!Array.isArray(checkRecords) || checkRecords.length === 0) {
      return NextResponse.json({ error: "Record not found or access denied" }, { status: 404 });
    }

    const beforeState = checkRecords[0];

    // Build UPDATE statements dynamically
    const updateKeys = Object.keys(updateData);
    if (updateKeys.length > 0) {
      let setClause = "";
      const queryValues = [...Object.values(updateData), id, userId];

      if (dialect === "sqlite") {
        setClause = updateKeys.map((k) => `${k} = ?`).join(", ");
        const updateSql = `UPDATE ${physicalName} SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
        await prisma.$executeRawUnsafe(updateSql, ...queryValues);
      } else {
        setClause = updateKeys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
        const updateSql = `UPDATE ${physicalName} SET ${setClause}, "updatedAt" = NOW() WHERE id = $${updateKeys.length + 1} AND "userId" = $${updateKeys.length + 2}`;
        await prisma.$executeRawUnsafe(updateSql, ...queryValues);
      }
    }

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        appId,
        userId: userId !== "anonymous" ? userId : appRecord.userId,
        table,
        action: "update",
        recordId: id,
        before: JSON.stringify(beforeState),
        after: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ success: true, message: "Record updated successfully" });
  } catch (error: any) {
    console.error("[Dynamic PUT API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { appId: string; table: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { appId, table } = params;

    const appRecord = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const config = parseConfig(JSON.parse(appRecord.config));
    const tableDef = config.database.tables.find((t) => t.name === table);

    if (!tableDef) {
      return NextResponse.json({ error: `Table '${table}' not found in configuration` }, { status: 404 });
    }

    const endpointConfig = config.api.endpoints.find(
      (ep) => ep.table === table && ep.method === "DELETE"
    );
    const authRequired = endpointConfig ? endpointConfig.auth : true;
    if (authRequired && (!session || !session.user)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session?.user ? (session.user as any).id : "anonymous";
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Record 'id' parameter is required for deletion" }, { status: 422 });
    }

    const physicalName = getPhysicalTableName(appId, table);
    const dialect = await getDialect();

    // Check record exists before deleting
    const selectSql = dialect === "sqlite"
      ? `SELECT * FROM ${physicalName} WHERE id = ? AND userId = ? AND deletedAt IS NULL LIMIT 1`
      : `SELECT * FROM ${physicalName} WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL LIMIT 1`;
    
    const checkRecords: any = await prisma.$queryRawUnsafe(selectSql, id, userId);
    if (!Array.isArray(checkRecords) || checkRecords.length === 0) {
      return NextResponse.json({ error: "Record not found or access denied" }, { status: 404 });
    }

    const beforeState = checkRecords[0];

    // SOFT DELETE query execution
    const deleteSql = dialect === "sqlite"
      ? `UPDATE ${physicalName} SET deletedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`
      : `UPDATE ${physicalName} SET "deletedAt" = NOW() WHERE id = $1 AND "userId" = $2`;

    await prisma.$executeRawUnsafe(deleteSql, id, userId);

    // Audit Logging
    await prisma.auditLog.create({
      data: {
        appId,
        userId: userId !== "anonymous" ? userId : appRecord.userId,
        table,
        action: "delete",
        recordId: id,
        before: JSON.stringify(beforeState),
      },
    });

    return NextResponse.json({ success: true, message: "Record soft deleted successfully" });
  } catch (error: any) {
    console.error("[Dynamic DELETE API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
