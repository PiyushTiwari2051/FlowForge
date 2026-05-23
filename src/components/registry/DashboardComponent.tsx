"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Database, PlusCircle, ArrowRight, Table } from "lucide-react";
import { ComponentProps } from "./index";
import Link from "next/link";

interface TableStats {
  name: string;
  displayName: string;
  count: number;
  fieldsCount: number;
}

export default function DashboardComponent({ appId, config, componentConfig }: ComponentProps) {
  // Configured tables to display stats for, fallback to all tables
  const targetTables: string[] = Array.isArray(componentConfig.tables)
    ? componentConfig.tables
    : config.database.tables.map((t) => t.name);

  const { data, isLoading } = useQuery<TableStats[]>({
    queryKey: ["dashboard-stats", appId, targetTables],
    queryFn: async () => {
      const statsList: TableStats[] = [];

      for (const tableName of targetTables) {
        const tableDef = config.database.tables.find((t) => t.name === tableName);
        if (!tableDef) continue;

        try {
          const res = await fetch(`/api/dynamic/${appId}/${tableName}?limit=1`);
          if (res.ok) {
            const json = await res.json();
            statsList.push({
              name: tableName,
              displayName: tableDef.displayName || tableName,
              count: json.total || 0,
              fieldsCount: tableDef.fields.length,
            });
          }
        } catch (e) {
          // Add with 0 count on error
          statsList.push({
            name: tableName,
            displayName: tableDef.displayName || tableName,
            count: 0,
            fieldsCount: tableDef.fields.length,
          });
        }
      }
      return statsList;
    },
    enabled: targetTables.length > 0,
  });

  if (targetTables.length === 0) {
    return (
      <div className="bg-background-surface/30 border border-white/5 rounded-2xl p-8 text-center text-text-muted text-sm">
        Dashboard Stats: No database tables found in config. Create tables in the Database schema to display metrics.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background-surface/30 border border-white/5 rounded-2xl p-6 h-40 animate-pulse flex flex-col justify-between">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-8 w-16 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
      {(data || []).map((stat) => (
        <div
          key={stat.name}
          className="group relative bg-background-surface/30 hover:bg-background-surface/50 border border-white/5 hover:border-accent-cyan/20 rounded-2xl p-6 flex flex-col justify-between h-44 shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1"
        >
          {/* Glass mesh design element */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/0 via-transparent to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-white font-display font-bold text-base tracking-wide group-hover:text-accent-cyan transition-colors">
                {stat.displayName}
              </span>
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                {stat.fieldsCount} Fields registered
              </span>
            </div>
            <div className="p-2 bg-background-elevated/80 border border-white/5 rounded-lg text-text-secondary group-hover:text-accent-cyan transition-colors">
              <Database className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold font-mono text-white tracking-tight">
              {stat.count.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-muted font-mono">records</span>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-3.5 text-xs">
            {/* Find matching page for this table */}
            {(() => {
              const matchingPage = config.ui?.pages?.find((p) =>
                p.components?.some((c) => c.type === "table" && c.table === stat.name)
              );
              const browseRoute = matchingPage ? matchingPage.route : "/";
              return (
                <Link
                  href={`/dashboard?appId=${appId}&page=${browseRoute}`}
                  className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Browse data</span>
                </Link>
              );
            })()}
            <Link
              href={`/dashboard/import?appId=${appId}&table=${stat.name}`}
              className="flex items-center gap-1 text-accent-cyan hover:underline font-semibold"
            >
              <span>Add data</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
