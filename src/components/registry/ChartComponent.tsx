"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart3, LineChart as LineIcon, Activity, RefreshCw } from "lucide-react";
import { ComponentProps } from "./index";

export default function ChartComponent({ appId, table, componentConfig }: ComponentProps) {
  const title = componentConfig.title || "Data Analytics";
  const chartType = componentConfig.chartType || "bar"; // bar, line, area
  const xAxisKey = componentConfig.xAxisKey || "createdAt";
  const yAxisKey = componentConfig.yAxisKey || "id";

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["chart-data", appId, table, xAxisKey, yAxisKey],
    queryFn: async () => {
      if (!table) return [];
      const res = await fetch(`/api/dynamic/${appId}/${table}`);
      if (!res.ok) throw new Error("Failed to fetch chart records");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!table,
  });

  const getChartIcon = () => {
    switch (chartType) {
      case "line":
        return <LineIcon className="w-3.5 h-3.5 text-zinc-400" />;
      case "area":
        return <Activity className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 flex flex-col gap-4 animate-pulse h-[300px]">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-7 w-7 bg-zinc-800 rounded" />
        </div>
        <div className="flex-1 w-full bg-zinc-950/40 rounded-lg flex items-end p-4 gap-2">
          <div className="w-[12%] h-[30%] bg-zinc-800 rounded-t" />
          <div className="w-[12%] h-[50%] bg-zinc-800 rounded-t" />
          <div className="w-[12%] h-[80%] bg-zinc-800 rounded-t" />
          <div className="w-[12%] h-[40%] bg-zinc-800 rounded-t" />
          <div className="w-[12%] h-[60%] bg-zinc-800 rounded-t" />
          <div className="w-[12%] h-[90%] bg-zinc-800 rounded-t" />
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2.5 h-[300px]">
        <div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-550 border border-zinc-850">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-zinc-250 font-semibold text-xs">{title}</h4>
          <p className="text-zinc-550 text-[10px] mt-1">
            {!table ? "No table assigned to this chart" : "Could not retrieve analytical data"}
          </p>
        </div>
      </div>
    );
  }

  // Format data for chart display
  const chartData = data.map((item: any) => {
    let label = item[xAxisKey];
    if (xAxisKey === "createdAt" || xAxisKey === "updatedAt") {
      label = new Date(item[xAxisKey]).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    let value = 1;
    if (yAxisKey && yAxisKey !== "id") {
      const parsed = parseFloat(item[yAxisKey]);
      if (!isNaN(parsed)) value = parsed;
    } else {
      value = 1;
    }

    return {
      name: label,
      value: value,
    };
  });

  // Simple aggregation if multiple items share the same date/name
  const aggregatedDataMap = new Map<string, number>();
  chartData.forEach((d: any) => {
    const existing = aggregatedDataMap.get(d.name) || 0;
    aggregatedDataMap.set(d.name, existing + d.value);
  });
  const processedData = Array.from(aggregatedDataMap.entries()).map(([name, val]) => ({
    name,
    value: val,
  })).slice(-10);

  const isDataEmpty = processedData.length === 0;

  return (
    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 flex flex-col gap-4 shadow-sm h-[300px] relative">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          {getChartIcon()}
          <span className="text-zinc-150 font-bold text-xs tracking-tight">
            {title}
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-1 rounded bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isDataEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-550 text-[10px]">
          <span>No record records available to render this chart.</span>
        </div>
      ) : (
        <div className="flex-1 w-full font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--zinc-850)" opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--zinc-500)" />
                <YAxis stroke="var(--zinc-500)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--zinc-950)",
                    borderColor: "var(--zinc-800)",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "var(--zinc-450)" }}
                  itemStyle={{ color: "var(--zinc-100)" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent-color)"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            ) : chartType === "area" ? (
              <AreaChart data={processedData}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--zinc-850)" opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--zinc-500)" />
                <YAxis stroke="var(--zinc-500)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--zinc-950)",
                    borderColor: "var(--zinc-800)",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "var(--zinc-450)" }}
                  itemStyle={{ color: "var(--zinc-100)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent-color)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorArea)"
                />
              </AreaChart>
            ) : (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--zinc-850)" opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--zinc-500)" />
                <YAxis stroke="var(--zinc-500)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--zinc-950)",
                    borderColor: "var(--zinc-800)",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "var(--zinc-450)" }}
                  itemStyle={{ color: "var(--zinc-100)" }}
                />
                <Bar dataKey="value" fill="var(--accent-color)" radius={[3, 3, 0, 0]} opacity={0.8} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
