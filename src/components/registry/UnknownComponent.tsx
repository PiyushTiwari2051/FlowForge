"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { ComponentProps } from "./index";

export default function UnknownComponent({ type }: { type: string } & Partial<ComponentProps>) {
  return (
    <div className="bg-background-elevated/40 backdrop-blur-md border border-accent-amber/20 rounded-2xl p-6 flex flex-col gap-4 max-w-lg mx-auto text-center shadow-[0_8px_32px_0_rgba(255,122,0,0.05)]">
      <div className="mx-auto w-12 h-12 rounded-full bg-accent-amber/10 flex items-center justify-center text-accent-amber">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-white font-display font-bold text-lg mb-1">
          Unregistered Component Type
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          The component type <code className="text-accent-amber bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">{type}</code> is not registered in the system registry.
        </p>
      </div>
      <div className="text-left bg-black/20 p-3.5 rounded-lg border border-white/5 font-sans text-xs text-text-muted">
        <span className="font-semibold block text-white mb-1.5">Registered Components:</span>
        <ul className="list-disc list-inside space-y-1">
          <li><code className="font-mono text-accent-cyan">dashboard</code> - Analytic widgets grid container</li>
          <li><code className="font-mono text-accent-cyan">form</code> - Input compiler with validations</li>
          <li><code className="font-mono text-accent-cyan">table</code> - Tabular layout with CSV pipelines</li>
          <li><code className="font-mono text-accent-cyan">card</code> - Simple data representation</li>
          <li><code className="font-mono text-accent-cyan">chart</code> - Graphical dashboard charts</li>
        </ul>
      </div>
    </div>
  );
}
