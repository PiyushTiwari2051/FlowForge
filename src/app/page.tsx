"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, Database, Layout, Code2, Globe } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";


export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-hidden font-sans flex flex-col items-center">
      {/* Background Grid Pattern with Mask */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60 z-0" />
      <div className="absolute inset-0 bg-zinc-950 bg-grid-mask pointer-events-none z-0" />

      {/* Subtle border accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent pointer-events-none" />

      {/* Header Navigation */}
      <nav className="w-full max-w-7xl h-16 px-6 md:px-12 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-20 relative">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono text-xs font-bold text-zinc-100">
            F
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-100 uppercase font-semibold">
            flowforge
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <ThemeSelector />
          <Link
            href={session ? "/dashboard" : "/login"}
            className="border border-zinc-850 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-100 px-4 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
          >
            {session ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full max-w-6xl px-6 md:px-12 pt-20 md:pt-28 flex flex-col items-center text-center relative z-10">
        {/* Version Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/30 text-zinc-400 text-[10px] font-mono tracking-wider uppercase mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>flowforge core v1.0.0 • active runtime</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1] text-zinc-100 max-w-4xl"
        >
          Dynamic Application Runtime.<br />
          <span className="text-zinc-500">Compiled in real-time.</span>
        </motion.h1>

        {/* Hero Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-zinc-400 text-sm md:text-base leading-relaxed mt-6"
        >
          An engine designed for developers. FlowForge compiles structured JSON specifications into active SQL tables, NextAuth guards, dynamic API endpoints, and visual interfaces on-the-fly.
        </motion.p>

        {/* Hero CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Link
            href={session ? "/dashboard" : "/signup"}
            className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <span>Launch workspace console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Interactive Compiler Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full mt-16 md:mt-24 border border-zinc-800 rounded-xl bg-zinc-950/50 backdrop-blur-md overflow-hidden text-left shadow-2xl relative"
        >
          {/* Top Panel Header */}
          <div className="h-10 bg-zinc-900/60 border-b border-zinc-800/80 px-4 flex items-center justify-between font-mono text-[10px] text-zinc-500 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <span className="w-px h-3 bg-zinc-800 mx-1.5" />
              <span className="text-zinc-400">engine-workspace-preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400 uppercase">Live Compiler Loop</span>
            </div>
          </div>

          {/* Visualization Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[360px] font-mono text-xs">
            {/* Column 1: JSON Input Spec */}
            <div className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col justify-between bg-zinc-900/10">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">1. Input Configuration</span>
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">JSON</span>
                </div>
                <pre className="text-[11px] text-zinc-400 leading-relaxed overflow-x-auto select-none">
                  {`{
  "database": {
    "tables": [{
      "name": "contacts",
      "fields": [
        { "name": "fullName", "type": "string" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "string" }
      ]
    }]
  },
  "ui": {
    "pages": [{
      "route": "/directory",
      "components": [
        { "type": "form", "table": "contacts" },
        { "type": "table", "table": "contacts" }
      ]
    }]
  }
}`}
                </pre>
              </div>
              <div className="pt-4 border-t border-zinc-800/40 text-[10px] text-zinc-500">
                {"// Editable in live Monaco workspace"}
              </div>
            </div>

            {/* Column 2: Engine Compiler */}
            <div className="p-5 border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col justify-between bg-zinc-950">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">2. Pipeline</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                </div>
                
                <div className="flex flex-col gap-6.5 mt-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-200 leading-none">Validate Schema</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-normal">Parse AST configurations and assert structural integrity.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-200 leading-none">Prisma Migrate</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-normal">Execute physical DDL migrations on SQL databases dynamically.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-200 leading-none">Publish APIs</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-normal">Mount REST endpoint routers automatically inside runtime container.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-emerald-500 bg-emerald-950/20 border border-emerald-900/30 px-2 py-1.5 rounded flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                <span>Compiler Status: OK</span>
              </div>
            </div>

            {/* Column 3: Rendered UI Output */}
            <div className="lg:col-span-2 p-5 bg-zinc-900/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">3. Rendered Interface</span>
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Live App</span>
                </div>

                <div className="border border-zinc-800 rounded bg-zinc-950/80 overflow-hidden font-sans">
                  {/* Mock browser header */}
                  <div className="h-6.5 bg-zinc-900/80 px-2 border-b border-zinc-800/65 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">/directory</span>
                    <span className="w-2.5" />
                  </div>
                  
                  {/* Mock content panel */}
                  <div className="p-3.5 flex flex-col gap-3 text-left">
                    <div>
                      <h4 className="text-[11px] font-semibold text-zinc-200">Contacts Registry</h4>
                      <p className="text-[9px] text-zinc-500">Live dynamic collection output</p>
                    </div>

                    <div className="border border-zinc-850 rounded overflow-hidden">
                      <table className="w-full text-[9px] text-zinc-400">
                        <thead>
                          <tr className="bg-zinc-900/70 border-b border-zinc-850 text-zinc-300 font-mono">
                            <th className="p-1.5 text-left font-semibold">Full Name</th>
                            <th className="p-1.5 text-left font-semibold">Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-zinc-850">
                            <td className="p-1.5 font-mono text-zinc-200">Sarah Jenkins</td>
                            <td className="p-1.5">SaaS Engineer</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-mono text-zinc-200">Marcus Chen</td>
                            <td className="p-1.5">Lead Architect</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/40 text-[10px] text-zinc-500 font-sans flex items-center justify-between">
                <span>Dynamic client UI registry</span>
                <span className="font-mono text-zinc-400">Page hot-reloaded</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Pillars */}
      <div className="w-full max-w-6xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 my-24 relative z-10">
        <div className="p-6.5 rounded-xl border border-zinc-900 hover:border-zinc-800 bg-zinc-900/10 transition-colors flex flex-col gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 w-fit">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">Dynamic Schema Engine</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Auto-generate schemas, column relationships, and map configurations to active databases seamlessly on modification.
          </p>
        </div>

        <div className="p-6.5 rounded-xl border border-zinc-900 hover:border-zinc-800 bg-zinc-900/10 transition-colors flex flex-col gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 w-fit">
            <Layout className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">UI Component Registry</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Dynamically resolve and instantiate interactive dashboards, charts, tables, and submit forms from layout tokens.
          </p>
        </div>

        <div className="p-6.5 rounded-xl border border-zinc-900 hover:border-zinc-800 bg-zinc-900/10 transition-colors flex flex-col gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 w-fit">
            <Terminal className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">GitHub Exporter</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Compile your entire working configuration workspace into a clean, standalone Next.js boilerplate repository on-demand.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 py-6 mt-auto flex items-center justify-between px-6 md:px-12 text-[10px] font-mono text-zinc-650 max-w-7xl relative z-10 select-none">
        <span>© 2026 FLOWFORGE PLATFORM</span>
        <span>DESIGNED FOR DEVELOPERS</span>
      </footer>
    </main>
  );
}
