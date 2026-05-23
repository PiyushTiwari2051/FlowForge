import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { parseConfig } from "@/lib/config/parser";
import { ensureTablesExist } from "@/lib/db/schema-gen";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;

    const app = await prisma.app.findUnique({
      where: { id, userId },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error: any) {
    console.error("[App Detail GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;
    const body = await req.json();

    const appRecord = await prisma.app.findUnique({
      where: { id, userId },
    });

    if (!appRecord) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Validate and parse the config JSON
    let parsedConfig;
    try {
      const rawConfig = typeof body.config === "string" ? JSON.parse(body.config) : body.config;
      parsedConfig = parseConfig(rawConfig);
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: "Invalid JSON configuration format", details: parseErr.message },
        { status: 422 }
      );
    }

    // Trigger Database schema drift migration
    const migration = await ensureTablesExist(parsedConfig, id);
    if (!migration.success) {
      return NextResponse.json(
        { error: "Schema migration failed. Revert config changes.", details: migration.error },
        { status: 409 }
      );
    }

    // Update database configuration text
    const updatedApp = await prisma.app.update({
      where: { id, userId },
      data: {
        name: parsedConfig.app.name,
        config: JSON.stringify(parsedConfig, null, 2),
      },
    });

    return NextResponse.json({
      success: true,
      app: updatedApp,
      migration,
    });
  } catch (error: any) {
    console.error("[App Detail PUT Error]:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
