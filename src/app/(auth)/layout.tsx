"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden flex flex-col md:flex-row font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50 z-0" />
      <div className="absolute inset-0 bg-zinc-950 bg-grid-mask pointer-events-none z-0" />

      {/* Left panel - Developer Showcase (hidden on mobile) */}
      <div className="relative hidden md:flex w-1/2 flex-col justify-between p-12 z-10 select-none overflow-hidden bg-zinc-900/10 border-r border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono text-xs font-bold text-zinc-100">
            F
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-100 uppercase font-semibold">
            flowforge
          </span>
        </div>

        <div className="my-auto max-w-md flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-tight text-zinc-100">
              Build and Deploy SaaS Platform instantly.
            </h1>
            <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
              Design database schemas, map REST API endpoints, and preview dynamic UI panels in real time with our live config-driven console.
            </p>
          </motion.div>

          {/* Minimal Terminal Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border border-zinc-800 rounded-lg bg-zinc-950 p-4 font-mono text-[10px] text-zinc-400 flex flex-col gap-1.5 shadow-xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-1.5">
              <span className="text-zinc-500">terminal-output</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-650">flowforge:~$</span>
              <span className="text-zinc-200">npx flowforge init</span>
            </div>
            <div className="text-zinc-500">{"// Syncing local workspace schema with SQLite dev.db"}</div>
            <div className="text-emerald-500">✓ Detected schema config.json</div>
            <div className="text-zinc-300">✓ 2 database collections synchronized</div>
            <div className="text-zinc-300">✓ Live workspace listening on port 3000</div>
          </motion.div>
        </div>

        <div className="text-zinc-600 text-[10px] font-mono flex items-center gap-4">
          <span>v1.0.0</span>
          <span>•</span>
          <span>DEVELOPER RUNTIME PLATFORM</span>
        </div>
      </div>

      {/* Right panel - Auth form content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm border border-zinc-800 bg-zinc-900 rounded-xl p-8 shadow-xl flex flex-col gap-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
