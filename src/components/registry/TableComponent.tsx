"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ArrowLeft, ArrowRight, Upload, AlertCircle, Inbox } from "lucide-react";
import { ComponentProps } from "./index";
import Link from "next/link";

export default function TableComponent({ appId, table, config }: ComponentProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Look up the table structure from config
  const tableDef = config.database.tables.find((t) => t.name === table);

  // Query records
  const { data, isLoading, error } = useQuery({
    queryKey: ["table-data", appId, table, page, limit],
    queryFn: async () => {
      if (!table) return { data: [], total: 0 };
      const res = await fetch(`/api/dynamic/${appId}/${table}?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
    enabled: !!table,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dynamic/${appId}/${table}?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete record");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-data", appId, table] });
      queryClient.invalidateQueries({ queryKey: ["card-data", appId, table] });
      queryClient.invalidateQueries({ queryKey: ["chart-data", appId, table] });
    },
  });

  if (!tableDef) {
    return (
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 text-center text-zinc-500 text-xs font-mono">
        Table error: Select a valid database table in configuration.
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteMutation.mutate(id);
    }
  };

  const records = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Loading skeleton layout
  if (isLoading) {
    return (
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 animate-pulse flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-36 bg-zinc-800 rounded" />
          <div className="h-8 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="w-full overflow-hidden border border-zinc-900 rounded-lg">
          <div className="h-9 bg-zinc-900 w-full mb-1" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-zinc-950/40 w-full mb-1" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-950/20 bg-zinc-950 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center text-red-400 border border-red-900/30">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-zinc-200 font-semibold text-sm">Data loading failed</h4>
          <p className="text-zinc-500 text-xs mt-1">Failed to read records from database table &apos;{table}&apos;.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 flex flex-col gap-4 font-sans">
      <div className="flex justify-between items-center gap-3 pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-zinc-150 font-bold text-sm tracking-tight">
            {tableDef.displayName || table}
          </span>
          <span className="text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 font-mono px-2 py-0.5 rounded-full">
            {total} rows
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/import?appId=${appId}&table=${table}`}
            className="flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-550" />
            <span>Import CSV</span>
          </Link>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-zinc-850 rounded-xl">
          <Inbox className="w-8 h-8 text-zinc-700 mb-3" />
          <h5 className="text-zinc-300 font-semibold text-xs">No records found</h5>
          <p className="text-zinc-500 text-[10px] mt-1 max-w-[280px] leading-relaxed">
            This collection is currently empty. Submit records via Form or import a CSV to populate.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-zinc-400 select-none">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-300 font-mono text-[10px] uppercase tracking-wider bg-zinc-950/40">
                {tableDef.fields.map((f) => (
                  <th key={f.name} className="py-2.5 px-4 font-semibold text-zinc-400">
                    {f.label || f.name}
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((row: any) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-900/50 hover:bg-zinc-900/20 transition-colors duration-150"
                >
                  {tableDef.fields.map((f) => {
                    const val = row[f.name];
                    return (
                      <td key={f.name} className="py-3 px-4 font-mono truncate max-w-[200px]">
                        {f.type === "boolean" ? (
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[9px] font-sans font-semibold ${
                              val ? "bg-emerald-950/20 text-emerald-450 border border-emerald-900/25" : "bg-zinc-900 text-zinc-500 border border-zinc-850"
                            }`}
                          >
                            {val ? "TRUE" : "FALSE"}
                          </span>
                        ) : f.type === "date" && val ? (
                          new Date(val).toLocaleDateString()
                        ) : val !== null && val !== undefined ? (
                          String(val)
                        ) : (
                          <span className="text-zinc-650 font-sans italic">null</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center border-t border-zinc-900 pt-3.5 text-[10px] font-mono text-zinc-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded border border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
