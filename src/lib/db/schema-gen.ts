import { prisma } from "./prisma";
import { NormalizedConfig } from "../config/types";

export interface MigrationResult {
  success: boolean;
  error?: string;
  dialect: "sqlite" | "postgresql";
}

export function getPhysicalTableName(appId: string, tableName: string): string {
  // SQLite and Postgres table names should start with letters, swap non-alphanumeric with underscores
  const cleanAppId = appId.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanTableName = tableName.replace(/[^a-zA-Z0-9]/g, "_");
  return `app_${cleanAppId}_${cleanTableName}`;
}

export async function ensureTablesExist(
  config: NormalizedConfig,
  appId: string
): Promise<MigrationResult> {
  const tables = config.database.tables;
  
  // Detect current database dialect dynamically based on connection string
  let dialect: "sqlite" | "postgresql" = "sqlite";
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("postgres") || dbUrl.includes("postgresql") || dbUrl.includes("postgres:")) {
    dialect = "postgresql";
  } else {
    dialect = "sqlite";
  }

  try {
    for (const table of tables) {
      const physicalName = getPhysicalTableName(appId, table.name);
      
      // Check if table exists
      let exists = false;
      if (dialect === "sqlite") {
        const query: any = await prisma.$queryRawUnsafe(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='${physicalName}'`
        );
        exists = Array.isArray(query) && query.length > 0;
      } else {
        const query: any = await prisma.$queryRawUnsafe(
          `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='${physicalName}'`
        );
        exists = Array.isArray(query) && query.length > 0;
      }

      if (!exists) {
        // Table does not exist. Create it!
        // Base system columns
        let ddl = `CREATE TABLE ${physicalName} (\n`;
        if (dialect === "sqlite") {
          ddl += `  id TEXT PRIMARY KEY,\n`;
          ddl += `  userId TEXT NOT NULL,\n`;
          ddl += `  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
          ddl += `  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
          ddl += `  deletedAt DATETIME\n`;
        } else {
          ddl += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
          ddl += `  userId VARCHAR(255) NOT NULL,\n`;
          ddl += `  createdAt TIMESTAMPTZ DEFAULT NOW(),\n`;
          ddl += `  updatedAt TIMESTAMPTZ DEFAULT NOW(),\n`;
          ddl += `  deletedAt TIMESTAMPTZ\n`;
        }
        ddl += `)`;
        
        await prisma.$executeRawUnsafe(ddl);
        console.log(`[SchemaGen] Created physical table: ${physicalName}`);
      }

      // Handle Schema Drift (Add missing columns dynamically)
      // Retrieve columns list from physical DB
      let existingColumns: string[] = [];
      if (dialect === "sqlite") {
        const info: any = await prisma.$queryRawUnsafe(`PRAGMA table_info(${physicalName})`);
        if (Array.isArray(info)) {
          existingColumns = info.map((col: any) => col.name);
        }
      } else {
        const info: any = await prisma.$queryRawUnsafe(
          `SELECT column_name FROM information_schema.columns WHERE table_name='${physicalName}'`
        );
        if (Array.isArray(info)) {
          existingColumns = info.map((col: any) => col.column_name);
        }
      }

      // Alter table for any missing fields in the configuration
      for (const field of table.fields) {
        if (!existingColumns.includes(field.name)) {
          let columnType = "";
          if (dialect === "sqlite") {
            switch (field.type) {
              case "number":
                columnType = "REAL";
                break;
              case "boolean":
                columnType = "BOOLEAN DEFAULT 0";
                break;
              default:
                columnType = "TEXT";
            }
          } else {
            switch (field.type) {
              case "number":
                columnType = "NUMERIC";
                break;
              case "boolean":
                columnType = "BOOLEAN DEFAULT FALSE";
                break;
              case "date":
                columnType = "TIMESTAMPTZ";
                break;
              case "text":
                columnType = "TEXT";
                break;
              default:
                columnType = "VARCHAR(255)";
            }
          }

          const alterDdl = `ALTER TABLE ${physicalName} ADD COLUMN ${field.name} ${columnType}`;
          await prisma.$executeRawUnsafe(alterDdl);
          console.log(`[SchemaGen] Added missing column '${field.name}' (${field.type}) to table '${physicalName}'`);
        }
      }

      // Add unique constraints index if not exist
      for (const field of table.fields) {
        if (field.unique) {
          const indexName = `idx_${physicalName}_${field.name}_unique`;
          if (dialect === "sqlite") {
            const idxDdl = `CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${physicalName}(${field.name})`;
            await prisma.$executeRawUnsafe(idxDdl);
          } else {
            const idxDdl = `CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON public.${physicalName}(${field.name})`;
            await prisma.$executeRawUnsafe(idxDdl);
          }
        }
      }
    }

    return { success: true, dialect };
  } catch (error: any) {
    console.error("[SchemaGen Error] Migration failed:", error);
    return { success: false, error: error.message, dialect };
  }
}
