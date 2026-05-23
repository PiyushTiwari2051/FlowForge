"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, ArrowRight, Table, Check, AlertTriangle, RefreshCw, Layers, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

interface DBField {
  name: string;
  type: string;
  required: boolean;
  label: string;
}

function CSVImportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = searchParams.get("appId") || "";
  const initialTable = searchParams.get("table") || "";

  const [step, setStep] = useState(1);
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [uploading, setUploading] = useState(false);
  
  // CSV details
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [fileName, setFileName] = useState("");

  // Column mappings
  const [mappings, setMappings] = useState<Record<string, string>>({}); // csvHeader -> dbField
  const [mode, setMode] = useState<"skip" | "overwrite" | "error">("skip");

  // SSE tracking state
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{ imported: number; skipped: number; errorsCount: number } | null>(null);

  // Fetch target application tables
  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ["app-config", appId],
    queryFn: async () => {
      if (!appId) return null;
      const res = await fetch(`/api/apps/${appId}`);
      if (!res.ok) throw new Error("Failed to load app config");
      const json = await res.json();
      return json;
    },
    enabled: !!appId,
  });

  const appConfig = appData?.config ? JSON.parse(appData.config) : null;
  const tables = appConfig?.database?.tables || [];
  const activeTableDef = tables.find((t: any) => t.name === selectedTable);
  const dbFields: DBField[] = activeTableDef?.fields || [];

  // Dropzone setup
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/csv-import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to parse CSV");
        return;
      }

      setHeaders(data.headers);
      setPreviewRows(data.preview);
      setTotalRows(data.totalRows);
      setCsvText(data.csvText);

      // Initialize mapping values
      const initialMap: Record<string, string> = {};
      data.headers.forEach((h: string) => {
        // Simple name matcher
        const match = dbFields.find((f) => f.name.toLowerCase() === h.toLowerCase().trim());
        if (match) {
          initialMap[h] = match.name;
        }
      });
      setMappings(initialMap);
      setStep(2);
      toast.success("CSV parsed successfully!");
    } catch (err) {
      toast.error("An error occurred during file upload");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const handleAutoMap = () => {
    const autoMap: Record<string, string> = {};
    headers.forEach((h) => {
      const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = dbFields.find((f) => f.name.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanHeader);
      if (match) {
        autoMap[h] = match.name;
      }
    });
    setMappings(autoMap);
    toast.success("Headers auto-mapped!");
  };

  const startImport = async () => {
    // Check mapping fields required mapping validation
    const unmappedRequiredFields = dbFields.filter(
      (f) => f.required && !Object.values(mappings).includes(f.name)
    );

    if (unmappedRequiredFields.length > 0) {
      toast.error(
        `Map required columns: ${unmappedRequiredFields.map((f) => f.label || f.name).join(", ")}`
      );
      return;
    }

    setStep(3);
    setImporting(true);
    setProgress(0);
    setStats(null);

    const mappingList = Object.entries(mappings).map(([csvHeader, dbField]) => ({
      csvHeader,
      dbField,
    }));

    try {
      const res = await fetch("/api/csv-import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          table: selectedTable,
          mapping: mappingList,
          csvText,
          mode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Execution failed");
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              toast.error(data.error);
              setImporting(false);
              finished = true;
              break;
            }

            setProgress(data.percent);
            
            if (data.complete) {
              setStats({
                imported: data.imported,
                skipped: data.skipped,
                errorsCount: data.errorsCount,
              });
              setImporting(false);
              toast.success("Bulk import completed!");
              finished = true;
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed execution");
      setImporting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#080C14] text-text-primary p-8 font-sans flex items-center justify-center">
      {/* Dynamic Shifts BG */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent-cyan/5 via-[#080C14] to-[#080C14] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-background-surface/30 backdrop-blur-[20px] border border-white/5 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl tracking-wide text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-accent-cyan" />
              CSV Import Wizard
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Import table data into app database collections dynamically.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background-surface/50 text-text-secondary hover:text-white transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>

        {/* Wizard step progress */}
        <div className="flex items-center justify-center gap-4 max-w-lg mx-auto mb-10 text-xs font-semibold select-none">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-accent-cyan" : "text-text-muted"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${step >= 1 ? "border-accent-cyan bg-accent-cyan/10" : "border-text-muted"}`}>1</span>
            <span>Upload File</span>
          </div>
          <div className="w-12 h-px bg-white/5" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-accent-cyan" : "text-text-muted"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${step >= 2 ? "border-accent-cyan bg-accent-cyan/10" : "border-text-muted"}`}>2</span>
            <span>Map Fields</span>
          </div>
          <div className="w-12 h-px bg-white/5" />
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-accent-cyan" : "text-text-muted"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${step >= 3 ? "border-accent-cyan bg-accent-cyan/10" : "border-text-muted"}`}>3</span>
            <span>Import Results</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-white text-xs uppercase tracking-wider font-semibold">Select Destination Table</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-[#080C14]/60 border border-border/80 focus:border-accent-cyan/80 focus:ring-1 focus:ring-accent-cyan/40 outline-none rounded-lg p-3 text-sm text-white"
                >
                  <option value="" disabled>-- Select a target collection --</option>
                  {tables.map((t: any) => (
                    <option key={t.name} value={t.name}>{t.displayName || t.name}</option>
                  ))}
                </select>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragActive ? "border-accent-cyan bg-accent-cyan/5" : "border-white/10 hover:border-accent-cyan/40"
                } ${!selectedTable ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-secondary">
                  {uploading ? <RefreshCw className="w-6 h-6 animate-spin text-accent-cyan" /> : <Upload className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {isDragActive ? "Drop your CSV here" : "Drag & drop CSV file"}
                  </p>
                  <p className="text-text-muted text-xs mt-1">Only .csv files up to 10MB are supported</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-white font-semibold text-sm">
                  Column Mapping Matrix ({fileName})
                </span>
                <button
                  onClick={handleAutoMap}
                  className="bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20 px-3 py-1 rounded text-xs font-semibold text-accent-cyan transition-colors"
                >
                  Auto-Map Fields
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[300px] overflow-y-auto pr-2">
                {headers.map((header) => (
                  <div key={header} className="bg-background-elevated/40 border border-white/5 rounded-xl p-3.5 flex justify-between items-center gap-4 text-sm">
                    <span className="text-white font-mono text-xs max-w-[150px] truncate">{header}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <select
                      value={mappings[header] || ""}
                      onChange={(e) => setMappings((prev) => ({ ...prev, [header]: e.target.value }))}
                      className="bg-[#080C14]/80 border border-border/80 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-accent-cyan/80 w-[180px]"
                    >
                      <option value="">-- Unmapped --</option>
                      {dbFields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.label || f.name} {f.required ? "*" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Rows preview table */}
              <div className="flex flex-col gap-2">
                <span className="text-white text-xs uppercase tracking-wider font-semibold">First 5 Rows Preview</span>
                <div className="w-full overflow-x-auto border border-white/5 rounded-lg max-h-[160px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/40 text-accent-cyan">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="py-2.5 px-3 font-semibold font-mono border-b border-white/5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary font-mono">
                      {previewRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/[0.01] border-b border-white/5">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 truncate max-w-[150px]">
                              {cell || <span className="text-text-muted/30 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-3">
                  <label className="text-text-secondary text-xs font-semibold">Conflict Resolve Mode:</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="bg-[#080C14]/80 border border-border/80 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-accent-cyan/80"
                  >
                    <option value="skip">Skip duplicates</option>
                    <option value="overwrite">Overwrite / Upsert</option>
                    <option value="error">Stop on duplicate error</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg border border-border/80 text-text-secondary hover:text-white transition-colors text-xs font-bold"
                  >
                    Back
                  </button>
                  <button
                    onClick={startImport}
                    className="bg-accent-cyan text-background font-bold text-xs px-5 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(0,200,224,0.3)] transition-all flex items-center gap-1.5"
                  >
                    <span>Execute Import</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 items-center justify-center py-10"
            >
              {importing ? (
                <div className="w-full max-w-md flex flex-col items-center gap-5">
                  <RefreshCw className="w-10 h-10 text-accent-cyan animate-spin" />
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-base">Bulk insertion in progress</h3>
                    <p className="text-text-muted text-xs mt-1">Transmitting records to the database collection...</p>
                  </div>
                  <div className="w-full bg-[#080C14] h-2.5 rounded-full overflow-hidden border border-white/5 relative mt-2">
                    <div className="h-full bg-accent-cyan transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-mono text-xs text-accent-cyan font-bold">{progress}% completed</span>
                </div>
              ) : stats ? (
                <div className="w-full max-w-md bg-[#0F172A]/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-5 text-sm font-sans shadow-lg">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Import Completed Successfully</h4>
                      <p className="text-text-muted text-[10px]">{totalRows} rows processed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 font-mono text-center">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-text-muted uppercase block">Created</span>
                      <span className="text-white font-bold text-lg">{stats.imported}</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-text-muted uppercase block">Skipped</span>
                      <span className="text-accent-amber font-bold text-lg">{stats.skipped}</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-text-muted uppercase block">Errors</span>
                      <span className="text-accent-red font-bold text-lg">{stats.errorsCount}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-lg border border-border/80 text-text-secondary hover:text-white transition-colors text-xs font-bold"
                    >
                      Import Another
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard?appId=${appId}`)} // Navigate to data table browser
                      className="bg-accent-cyan text-background font-bold text-xs px-5 py-2 rounded-lg transition-all"
                    >
                      Browse Table
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-accent-red" />
                  <div>
                    <h3 className="text-white font-bold text-base">Import Execution Failed</h3>
                    <p className="text-text-muted text-xs mt-1">An error prevented the CSV pipeline from finalizing data.</p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="mt-2 bg-background-elevated hover:bg-background-elevated/80 border border-white/5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors"
                  >
                    Back to mapper
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function CSVImportPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center text-accent-cyan gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="font-mono text-xs uppercase tracking-wider">Loading Import Wizard...</span>
      </div>
    }>
      <CSVImportContent />
    </React.Suspense>
  );
}
