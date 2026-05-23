"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  FileCode,
  Save,
  Terminal,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { toast } from "react-hot-toast";
import { parseConfig } from "@/lib/config/parser";
import { getComponent } from "@/components/registry";
import { useTheme } from "@/components/ThemeProvider";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const { isDark } = useTheme();

  const urlAppId = searchParams.get("appId");
  const appId = urlAppId || "";

  // Configuration editing states
  const [editorContent, setEditorContent] = useState<string>("");
  const [loadedAppId, setLoadedAppId] = useState<string>("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "FlowForge Compiler v1.0.0 active.",
    "Awaiting configuration changes...",
  ]);
  const activePreviewPage = searchParams.get("page") || "/";
  const setActivePreviewPage = (pageRoute: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageRoute);
    router.replace(`/dashboard?${params.toString()}`);
  };
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [editorMode, setEditorMode] = useState<"rich" | "plain">("rich");

  // 1. Query for the app's configuration
  const { data: appData, isLoading, isError, refetch } = useQuery({
    queryKey: ["app", appId],
    queryFn: async () => {
      if (!appId) return null;
      const res = await fetch(`/api/apps/${appId}`);
      if (!res.ok) throw new Error("Failed to load application configuration");
      return res.json();
    },
    enabled: !!appId,
  });

  // Load configuration into editor state on fetch (only once per appId to avoid resetting user edits on refetches)
  useEffect(() => {
    if (appData?.config && appId !== loadedAppId) {
      setEditorContent(appData.config);
      setLoadedAppId(appId);
      setConsoleLogs((prev) => [
        ...prev,
        `[Compiler]: Loaded configuration for "${appData.name}".`,
        `[Database]: Synchronized physical table schemas.`,
      ]);
    }
  }, [appData, appId, loadedAppId]);

  // 2. Mutation for saving and deploying the configuration
  const deployMutation = useMutation({
    mutationFn: async (configJson: string) => {
      setIsDeploying(true);
      const res = await fetch(`/api/apps/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configJson }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Deployment failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["app", appId] });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      
      // Update logs console
      const newLogs = [
        `[Compiler]: Parsing structure validation: SUCCESS.`,
        `[Database]: Provider: SQLite | Migration: SUCCESS.`,
        `[Database]: Dialect tables synchronised: ${data.migration?.dialect || "sqlite"}`,
        `[Compiler]: Code compilation complete. Workspace hot-reloaded!`,
      ];
      setConsoleLogs((prev) => [...prev, ...newLogs]);
      toast.success(t("saveConfig") + " successfully!");
    },
    onError: (err: any) => {
      setConsoleLogs((prev) => [
        ...prev,
        `❌ [Compiler Error]: ${err.message}`,
      ]);
      toast.error(err.message || "Failed to compile configuration");
    },
    onSettled: () => {
      setIsDeploying(false);
    },
  });

  const handleSaveAndDeploy = () => {
    if (!editorContent) return;
    deployMutation.mutate(editorContent);
  };

  if (!appId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 bg-zinc-950 font-sans">
        <FolderOpen className="w-10 h-10 text-zinc-650 opacity-40 mb-3" />
        <h3 className="text-zinc-200 font-semibold text-sm">No Application Selected</h3>
        <p className="text-[11px] text-zinc-500 mt-1">Select an active workspace from the top menu or create a new one.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400 bg-zinc-950 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-zinc-600" />
        <span className="font-mono text-xs uppercase tracking-wider">Compiling Editor Workspace...</span>
      </div>
    );
  }

  if (isError || !appData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-400 bg-zinc-950 font-sans">
        <Terminal className="w-10 h-10 opacity-40 mb-3 text-red-550" />
        <h3 className="font-semibold text-sm">Failed to load configuration</h3>
        <p className="text-[11px] text-red-500/80 mt-1">An error occurred retrieving database records.</p>
      </div>
    );
  }

  // Parse current live app config config structure to render in right preview pane
  let normalizedConfig;
  try {
    const raw = JSON.parse(editorContent || appData.config);
    normalizedConfig = parseConfig(raw);
  } catch (e) {
    normalizedConfig = parseConfig(JSON.parse(appData.config));
  }

  const appPages = normalizedConfig.ui?.pages || [];
  const currentPageDef = appPages.find((p) => p.route === activePreviewPage) || appPages[0];  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col overflow-hidden border-t border-zinc-900 bg-zinc-950">
      {/* Mobile Tab Selector Switcher */}
      <div className="flex lg:hidden bg-zinc-950 border-b border-zinc-900 select-none shrink-0 text-xs">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 py-3 text-center font-mono font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === "editor"
              ? "border-accent-cyan text-zinc-100 bg-zinc-900/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Config Editor</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-center font-mono font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === "preview"
              ? "border-accent-cyan text-zinc-100 bg-zinc-900/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* LEFT PANE - Monaco Config Editor */}
        <div className={`w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-900 relative ${activeTab === "editor" ? "flex flex-1 min-h-0" : "hidden lg:flex lg:flex-1"} lg:h-full`}>
          {/* Editor Title Bar */}
          <div className="h-11 bg-zinc-950 px-4 flex items-center justify-between border-b border-zinc-900 select-none shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-xs font-semibold text-zinc-200">config.json</span>
              <div className="hidden sm:flex bg-zinc-900 border border-zinc-850 rounded-md p-0.5 text-[9px] font-mono ml-2">
                <button
                  type="button"
                  onClick={() => setEditorMode("rich")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    editorMode === "rich"
                      ? "bg-zinc-800 text-zinc-100 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Rich Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("plain")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    editorMode === "plain"
                      ? "bg-zinc-800 text-zinc-100 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Editor Switcher Toggle */}
              <div className="flex sm:hidden bg-zinc-900 border border-zinc-850 rounded-md p-0.5 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => setEditorMode(editorMode === "rich" ? "plain" : "rich")}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold"
                >
                  {editorMode === "rich" ? "Plain" : "Rich"}
                </button>
              </div>

              <button
                onClick={handleSaveAndDeploy}
                disabled={isDeploying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {isDeploying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{t("saveConfig")}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-0 bg-zinc-950 relative">
            {editorMode === "rich" ? (
              <Editor
                height="100%"
                defaultLanguage="json"
                theme={isDark ? "vs-dark" : "light"}
                value={editorContent}
                onChange={(val) => setEditorContent(val || "")}
                loading={
                  <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-950 font-sans text-xs gap-3 p-4 text-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-650" />
                    <span>Loading Rich Editor from CDN...</span>
                    <button
                      type="button"
                      onClick={() => setEditorMode("plain")}
                      className="mt-2 text-[10px] text-zinc-300 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono transition-all"
                    >
                      Switch to Plain Editor (Offline / Fast)
                    </button>
                  </div>
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "var(--font-dm-mono), monospace",
                  scrollbar: { vertical: "visible", horizontal: "visible" },
                  padding: { top: 12, bottom: 12 },
                  lineHeight: 18,
                }}
              />
            ) : (
              <div className="w-full h-full relative">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-full p-4 bg-zinc-950 text-zinc-200 font-mono text-xs focus:outline-none resize-none border-0 select-text leading-relaxed"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                  }}
                  spellCheck={false}
                  placeholder="Paste or write your config JSON here..."
                />
                <div className="absolute bottom-2.5 right-3 px-2 py-0.5 bg-zinc-900/80 border border-zinc-800 rounded font-mono text-[9px] text-zinc-500 pointer-events-none select-none">
                  PLAIN TEXT EDITOR (ACTIVE)
                </div>
              </div>
            )}
          </div>

          {/* Live Compiler Console Log */}
          <div className="h-40 border-t border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
            <div className="h-8 bg-zinc-900/30 px-4 flex items-center gap-1.5 border-b border-zinc-900 text-zinc-450 select-none">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider">
                {t("statusLogs")}
              </span>
            </div>
            <div className="flex-1 p-3.5 overflow-y-auto font-mono text-[10px] bg-zinc-950 flex flex-col gap-1.5 select-text">
              {consoleLogs.map((log, idx) => {
                const isError = log.includes("Error") || log.includes("❌");
                const isSuccess = log.includes("SUCCESS") || log.includes("complete") || log.includes("active");
                return (
                  <div key={idx} className="flex gap-2.5 leading-relaxed">
                    <span className="text-zinc-650 select-none">{(idx + 1).toString().padStart(2, "0")}</span>
                    <span className={isError ? "text-red-400" : isSuccess ? "text-emerald-400" : "text-zinc-300"}>
                      {log}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANE - Live Preview Runtime Portal */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-zinc-950 relative ${activeTab === "preview" ? "flex flex-1 min-h-0" : "hidden lg:flex lg:flex-1"} lg:h-full`}>
          {/* Portal Address Bar */}
          <div className="h-11 bg-zinc-950 px-4 flex items-center justify-between border-b border-zinc-900 select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-850 px-3.5 py-0.5 rounded max-w-[155px] md:max-w-xs truncate">
                localhost:3000{activePreviewPage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950/20 text-emerald-400 text-[10px] font-mono font-medium px-2 py-0.5 border border-emerald-900/30 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                PORTAL LIVE
              </span>
            </div>
          </div>

          {/* Dynamic App UI Frame Container */}
          <div className="flex-1 flex flex-col sm:flex-row min-h-0 bg-zinc-950 relative">
            {/* Sub sidebar navigation mapping custom tabs from UI Config */}
            <aside className="w-full sm:w-48 bg-zinc-950 border-b sm:border-b-0 sm:border-r border-zinc-900 flex flex-row sm:flex-col select-none shrink-0 py-2 sm:py-3.5 px-2 gap-1 overflow-x-auto sm:overflow-x-visible items-center sm:items-stretch">
              <div className="px-3 py-1 text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-0 sm:mb-2 whitespace-nowrap hidden sm:block">
                Navigation
              </div>
              <div className="flex flex-row sm:flex-col gap-1 w-full shrink-0 sm:shrink-1 overflow-x-auto sm:overflow-x-visible">
                {appPages.map((page) => (
                  <button
                    key={page.route}
                    onClick={() => setActivePreviewPage(page.route)}
                    className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all whitespace-nowrap ${
                      activePreviewPage === page.route
                        ? "bg-zinc-900 text-zinc-100 border border-zinc-850"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                    }`}
                  >
                    <span className="truncate">{page.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform hidden sm:block ${activePreviewPage === page.route ? "rotate-90 text-zinc-300" : ""}`} />
                  </button>
                ))}
              </div>
            </aside>

            {/* Render active dynamically compiled page */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-900/10 flex flex-col gap-6 select-text">
              {currentPageDef ? (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-zinc-100">
                      {currentPageDef.title}
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-mono mt-0.5">
                      Route: `{currentPageDef.route}`
                    </p>
                  </div>

                  {/* Warnings alert panel */}
                  {normalizedConfig && (normalizedConfig as any)._warnings && (normalizedConfig as any)._warnings.length > 0 && (
                    <div className="border border-amber-900/30 bg-amber-950/15 rounded-xl p-4 text-[11px] font-mono text-amber-400 flex flex-col gap-2 shadow-sm">
                      <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Configuration Auto-Corrected ({ (normalizedConfig as any)._warnings.length } Warnings)</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[10px] opacity-90 pl-5">
                        { (normalizedConfig as any)._warnings.slice(0, 5).map((w: string, idx: number) => (
                          <div key={idx}>• {w}</div>
                        ))}
                        { (normalizedConfig as any)._warnings.length > 5 && (
                          <div className="text-amber-500/80 italic font-sans mt-0.5">
                            And { (normalizedConfig as any)._warnings.length - 5 } more warnings...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Iterate over configured page components dynamically */}
                  <div className="flex flex-col gap-6">
                    {currentPageDef.components.map((comp) => {
                      const DynComponent = getComponent(comp.type);
                      return (
                        <div
                          key={comp.id}
                          className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 sm:p-5 relative group transition-all"
                        >
                          <span className="absolute top-2.5 right-3 text-[8px] text-zinc-500 font-mono select-none uppercase tracking-wider">
                            {comp.type} : {comp.id}
                          </span>
                          
                          {/* Dynamic component mounting */}
                          <div className="mt-3">
                            <DynComponent
                              appId={appId}
                              config={normalizedConfig}
                              componentConfig={comp.config}
                              table={comp.table}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 font-sans gap-2">
                  <FolderOpen className="w-8 h-8 opacity-30" />
                  <p className="text-xs">This page has no UI components configured.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center text-zinc-400 bg-zinc-950 gap-3 min-h-[50vh]">
        <RefreshCw className="w-5 h-5 animate-spin text-zinc-650" />
        <span className="font-mono text-xs uppercase tracking-wider">Compiling Workspace...</span>
      </div>
    }>
      <WorkspaceContent />
    </React.Suspense>
  );
}
