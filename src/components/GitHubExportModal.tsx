"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { useLocale } from "./LocaleContext";
import { toast } from "react-hot-toast";

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  appName: string;
}

export default function GitHubExportModal({
  isOpen,
  onClose,
  appId,
  appName,
}: GitHubExportModalProps) {
  const { t } = useLocale();
  const [repoName, setRepoName] = useState(
    appName.toLowerCase().replace(/[^a-z0-9-]/g, "-") + "-app"
  );
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("GitHub Personal Access Token is required");
      return;
    }

    setLoading(true);
    setError("");
    setRepoUrl("");
    setLogs(["Connecting to GitHub API...", "Validating auth credentials token..."]);

    try {
      const res = await fetch("/api/export/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          repoName,
          githubToken: token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to export");
      }

      setLogs((prev) => [
        ...prev,
        "Repository initialized successfully.",
        "Compiling Next.js config structures and component registries in memory...",
        "Building Prisma database schema maps...",
        "Transmitting git tree nodes to GitHub remote...",
        "Finalizing commit: 'Feat: Compile and build workspace deployment'...",
        "Deployment completed successfully!",
      ]);
      setRepoUrl(data.repoUrl);
      toast.success(t("exportSuccess"));
    } catch (err: any) {
      setError(err.message || "An error occurred during export");
      setLogs((prev) => [...prev, "❌ Pipeline failed: " + err.message]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col gap-5 relative text-zinc-100"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-150 transition-colors flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-200">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-zinc-200">
              Export to GitHub Repository
            </h3>
            <p className="text-zinc-500 text-[11px] mt-0.5 font-sans leading-normal">
              Build and push standalone Next.js code template files instantly.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-400 p-3 rounded text-[11px] font-mono flex items-start gap-2.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {repoUrl ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg flex flex-col items-center gap-4 text-center font-mono">
            <div className="w-10 h-10 rounded border border-emerald-900/50 bg-emerald-950/20 flex items-center justify-center text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-zinc-200 font-bold text-xs uppercase tracking-wide">Deployment Export Finished</h4>
              <p className="text-zinc-500 text-[11px] mt-1 font-sans leading-normal">
                Your application source files are now committed in your repository.
              </p>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs px-5 py-2.5 rounded transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Open GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleExport} className="flex flex-col gap-4 font-mono text-[11px]">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
                GitHub Repository Name
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-flowforge-app"
                required
                disabled={loading}
                className="w-full bg-zinc-900 border border-zinc-800/85 focus:border-zinc-700 outline-none rounded p-2.5 text-zinc-100 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
                  Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-zinc-500 hover:text-zinc-200 hover:underline flex items-center gap-0.5"
                >
                  Create token <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                required
                disabled={loading}
                className="w-full bg-zinc-900 border border-zinc-800/85 focus:border-zinc-700 outline-none rounded p-2.5 text-zinc-100 font-mono text-xs"
              />
            </div>

            {logs.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">Deployment Logs</span>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3.5 h-36 overflow-y-auto font-mono text-[10px] text-zinc-400 flex flex-col gap-1.5">
                  {logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-zinc-650 select-none">[{index + 1}]</span>
                      <span className="text-zinc-300">{log}</span>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-zinc-250">
                      <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-zinc-400" />
                      <span>Pipeline executing...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-150 transition-colors text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-xs px-5 py-2 rounded transition-all flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Start Export</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
