import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validation: must be .csv, max 10MB
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Invalid file format. Only CSV files are allowed." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 413 });
    }

    const text = await file.text();
    
    // Parse using PapaParse
    const parsed = Papa.parse(text, {
      header: false,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json({ error: "Failed to parse CSV file", details: parsed.errors }, { status: 422 });
    }

    const rows = parsed.data as string[][];
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 422 });
    }

    const headers = rows[0];
    const preview = rows.slice(1, 6); // First 5 rows for mapping validation preview
    const totalRows = Math.max(0, rows.length - 1);

    return NextResponse.json({
      headers,
      preview,
      totalRows,
      // Temporarily save file text in memory or send it back so the execute step has it (saves server disk write)
      csvText: text,
    });
  } catch (error: any) {
    console.error("[CSV Parse API Error]:", error);
    return NextResponse.json({ error: "Failed to process CSV file", details: error.message }, { status: 500 });
  }
}
