import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Papa from "papaparse";
import { getPhysicalTableName } from "@/lib/db/schema-gen";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { appId, table, mapping, csvText, mode } = body; // mode: "skip" | "overwrite" | "error"

    if (!appId || !table || !mapping || !csvText) {
      return NextResponse.json({ error: "Missing required import parameters" }, { status: 422 });
    }

    const appRecord = await prisma.app.findUnique({ where: { id: appId } });
    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const physicalName = getPhysicalTableName(appId, table);
    const userId = (session.user as any).id;

    // Determine database dialect
    let dialect: "sqlite" | "postgresql" = "sqlite";
    try {
      await prisma.$queryRawUnsafe("SELECT version()");
      dialect = "postgresql";
    } catch (e) {
      dialect = "sqlite";
    }

    // Parse full CSV
    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    const rows = parsed.data as string[][];

    if (rows.length <= 1) {
      return NextResponse.json({ error: "CSV has no data rows" }, { status: 422 });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const total = dataRows.length;

    // Create a ReadableStream for SSE progress reporting
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (payload: any) => {
          controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
        };

        try {
          let imported = 0;
          let skipped = 0;
          let errorsCount = 0;
          const errorDetails: string[] = [];

          // Process rows in batches of 10 for interactive updates
          const batchSize = 10;

          for (let i = 0; i < total; i += batchSize) {
            const batch = dataRows.slice(i, i + batchSize);

            for (const row of batch) {
              // Construct record values mapping headers to db columns
              const record: Record<string, any> = {};
              mapping.forEach((map: { csvHeader: string; dbField: string }) => {
                const colIdx = headers.indexOf(map.csvHeader);
                if (colIdx !== -1) {
                  record[map.dbField] = row[colIdx];
                }
              });

              // Construct insert SQL
              const recordId = require("crypto").randomUUID();
              const keys = ["id", "userId", ...Object.keys(record)];
              const values = [recordId, userId, ...Object.values(record)];

              // For overwriting conflict modes, check if record with unique field already exists
              // We'll search by the first unique column if any exist in the row
              let conflictExists = false;
              let existingId = "";

              // To check unique constraints, let's look for matching entries
              // Let's run a query for rows that match any of the key fields
              for (const [k, v] of Object.entries(record)) {
                if (v === "" || v === null) continue;
                const checkSql = dialect === "sqlite"
                  ? `SELECT id FROM ${physicalName} WHERE ${k} = ? AND userId = ? AND deletedAt IS NULL LIMIT 1`
                  : `SELECT id FROM ${physicalName} WHERE "${k}" = $1 AND "userId" = $2 AND "deletedAt" IS NULL LIMIT 1`;
                
                const checkRes: any = await prisma.$queryRawUnsafe(checkSql, v, userId);
                if (Array.isArray(checkRes) && checkRes.length > 0) {
                  conflictExists = true;
                  existingId = checkRes[0].id;
                  break;
                }
              }

              if (conflictExists) {
                if (mode === "skip") {
                  skipped++;
                  continue;
                } else if (mode === "error") {
                  errorsCount++;
                  errorDetails.push(`Record already exists matching unique field constraint.`);
                  continue;
                } else if (mode === "overwrite") {
                  // Execute SQL UPDATE DDL
                  const updateKeys = Object.keys(record);
                  const updateVals = [...Object.values(record), existingId, userId];
                  let updateSql = "";
                  
                  if (dialect === "sqlite") {
                    const clause = updateKeys.map((k) => `${k} = ?`).join(", ");
                    updateSql = `UPDATE ${physicalName} SET ${clause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;
                  } else {
                    const clause = updateKeys.map((k, idx) => `"${k}" = $${idx + 1}`).join(", ");
                    updateSql = `UPDATE ${physicalName} SET ${clause}, "updatedAt" = NOW() WHERE id = $${updateKeys.length + 1} AND "userId" = $${updateKeys.length + 2}`;
                  }
                  await prisma.$executeRawUnsafe(updateSql, ...updateVals);
                  imported++;
                  continue;
                }
              }

              // Normal insert
              let insertSql = "";
              if (dialect === "sqlite") {
                const placeholders = keys.map(() => "?").join(", ");
                insertSql = `INSERT INTO ${physicalName} (${keys.join(", ")}) VALUES (${placeholders})`;
              } else {
                const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(", ");
                insertSql = `INSERT INTO ${physicalName} ("${keys.join('", "')}") VALUES (${placeholders})`;
              }

              try {
                await prisma.$executeRawUnsafe(insertSql, ...values);
                imported++;
              } catch (err: any) {
                errorsCount++;
                errorDetails.push(err.message || "Failed database insertion.");
              }
            }

            // Stream progress back
            const percent = Math.min(100, Math.round(((i + batch.length) / total) * 100));
            sendProgress({
              percent,
              imported,
              skipped,
              errorsCount,
              current: i + batch.length,
              total,
            });
          }

          // Complete stream
          sendProgress({
            percent: 100,
            complete: true,
            imported,
            skipped,
            errorsCount,
            errorDetails: errorDetails.slice(0, 10), // Send first 10 errors for dashboard summary
          });

          // Write Audit Log
          await prisma.auditLog.create({
            data: {
              appId,
              userId,
              table,
              action: "create",
              recordId: "bulk_csv_import",
              after: JSON.stringify({ count: imported, mode }),
            },
          });

          controller.close();
        } catch (streamErr: any) {
          sendProgress({ error: streamErr.message });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[CSV Import Execution Error]:", error);
    return NextResponse.json({ error: "Failed to initialize bulk import execution" }, { status: 500 });
  }
}
