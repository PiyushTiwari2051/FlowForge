"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { ComponentProps } from "./index";

export default function CardComponent({ appId, table, componentConfig }: ComponentProps) {
  const title = componentConfig.title || "Total Records";
  const fieldName = componentConfig.field || "id";

  const { data, isLoading, error } = useQuery({
    queryKey: ["card-data", appId, table, fieldName],
    queryFn: async () => {
      if (!table) return { count: 0 };
      const res = await fetch(`/api/dynamic/${appId}/${table}`);
      if (!res.ok) throw new Error("Failed to fetch card data");
      const json = await res.json();
      return { count: Array.isArray(json.data) ? json.data.length : 0 };
    },
    enabled: !!table,
  });

  if (isLoading) {
    return (
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 relative overflow-hidden animate-pulse">
        <div className="h-3 w-20 bg-zinc-800 rounded mb-3" />
        <div className="h-7 w-12 bg-zinc-800 rounded" />
        <div className="absolute right-5 bottom-5 w-8 h-8 rounded bg-zinc-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-950/20 bg-zinc-950 rounded-xl p-5 flex flex-col gap-1 text-left">
        <span className="text-zinc-550 text-[10px] uppercase tracking-wider font-semibold">{title}</span>
        <span className="text-red-400 text-xs font-semibold">Load Error</span>
      </div>
    );
  }

  const value = table ? data?.count : (componentConfig.staticValue || 0);

  return (
    <div className="group relative border border-zinc-900 bg-zinc-900/10 hover:border-zinc-850 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm min-h-[110px]">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
          {title}
        </span>
        <div className="p-1.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400">
          <Database className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mt-auto">
        <span className="font-mono font-bold text-2xl text-zinc-100 tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {table && (
          <span className="text-[9px] text-zinc-550 font-mono">records</span>
        )}
      </div>
    </div>
  );
}
