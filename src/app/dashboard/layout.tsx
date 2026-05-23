"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Bell,
  Globe,
  LogOut,
  FolderKanban,
  FileCode,
  TrendingUp,
  Plus,
  RefreshCw,
  FolderGit2,
} from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import NotificationsDrawer from "@/components/NotificationsDrawer";
import GitHubExportModal from "@/components/GitHubExportModal";
import { toast } from "react-hot-toast";
import ThemeSelector from "@/components/ThemeSelector";


function DashboardContainer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { locale, setLocale, t, dir } = useLocale();

  // Selected App State
  const [activeAppId, setActiveAppId] = useState<string>("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  // Guard ref to prevent multiple simultaneous auto-creates
  const isCreatingRef = React.useRef(false);

  // 1. Fetch user's apps
  const { data: apps = [], isLoading: appsLoading, refetch: refetchApps } = useQuery({
    queryKey: ["apps"],
    queryFn: async () => {
      const res = await fetch("/api/apps");
      if (!res.ok) throw new Error("Failed to load applications");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  // 2. Fetch Notifications with polling (15s)
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
    enabled: status === "authenticated",
    refetchInterval: 15000,
  });

  // 3. Mark Notification Read Mutations
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to update notification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      if (!res.ok) throw new Error("Failed to update notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // Create new App mutation
  const createAppMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create application");
      return res.json();
    },
    onSuccess: (newApp) => {
      isCreatingRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setActiveAppId(newApp.id);
      toast.success(`Application "${newApp.name}" initialized!`);
    },
    onError: () => {
      isCreatingRef.current = false;
    },
  });

  // Sync active app ID selection — FIXED: removed unstable refs from deps to stop infinite loop
  useEffect(() => {
    if (apps.length > 0) {
      const urlAppId = searchParams.get("appId");
      if (urlAppId && apps.some((a: any) => a.id === urlAppId)) {
        setActiveAppId(urlAppId);
      } else {
        // Set default to first app and sync URL
        const defaultAppId = apps[0].id;
        setActiveAppId(defaultAppId);
        const params = new URLSearchParams(searchParams.toString());
        params.set("appId", defaultAppId);
        router.replace(`${pathname}?${params.toString()}`);
      }
    } else if (status === "authenticated" && !appsLoading && apps.length === 0) {
      // Auto create first app if user has none — guarded to prevent duplicate creation
      if (!isCreatingRef.current) {
        isCreatingRef.current = true;
        createAppMutation.mutate("FlowForge Starter");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps.length, appsLoading, status]);

  // Handle active app switch
  const handleAppChange = (appId: string) => {
    setActiveAppId(appId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("appId", appId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreateNewApp = () => {
    const name = prompt("Enter your new application name:", "My Next App");
    if (name && name.trim()) {
      createAppMutation.mutate(name.trim());
    }
  };

  if (status === "loading" || (status === "authenticated" && appsLoading)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-zinc-550" />
        <span className="font-mono text-xs tracking-wider uppercase">Loading Workspace...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const activeApp = apps.find((a: any) => a.id === activeAppId);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" dir={dir}>
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono text-xs font-bold text-zinc-100 shrink-0">
              F
            </div>
            <span className="font-mono text-xs tracking-widest text-zinc-100 uppercase font-semibold hidden sm:inline">
              FLOWFORGE
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* App Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FolderKanban className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
            <select
              value={activeAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500 w-28 sm:w-36 font-sans truncate"
            >
              {apps.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateNewApp}
              className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-250 transition-colors shrink-0"
              title="Create New App"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center gap-3">
          {/* GitHub Exporter Trigger */}
          {activeApp && (
            <button
              onClick={() => setIsExportOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/55 hover:bg-zinc-900 text-zinc-300 text-xs font-medium transition-all"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-zinc-450" />
              <span>Export Code</span>
            </button>
          )}

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Language Switcher */}
          <div className="relative group">
            <button className="w-8.5 h-8.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-250 transition-colors">
              <Globe className="w-3.5 h-3.5" />
            </button>
            <div className={`absolute top-full mt-1.5 w-32 bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-lg hidden group-hover:block z-45 ${dir === "rtl" ? "left-0" : "right-0"}`}>
              {(["en", "hi", "ar", "fr", "es"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    locale === lang
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                  }`}
                >
                  {lang === "en" && "English"}
                  {lang === "hi" && "हिन्दी"}
                  {lang === "ar" && "العربية"}
                  {lang === "fr" && "Français"}
                  {lang === "es" && "Español"}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="w-8.5 h-8.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-250 transition-colors relative"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-8.5 h-8.5 rounded-lg border border-zinc-800 hover:bg-zinc-900/60 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
            title={t("logout")}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Workspace Pages Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>

      {/* Sliding Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <NotificationsDrawer
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onMarkAllRead={() => markAllReadMutation.mutate()}
          />
        )}
      </AnimatePresence>

      {/* GitHub Exporter Modal */}
      {activeApp && (
        <GitHubExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          appId={activeAppId}
          appName={activeApp.name}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-zinc-550" />
        <span className="font-mono text-xs tracking-wider uppercase">Loading Workspace...</span>
      </div>
    }>
      <DashboardContainer>{children}</DashboardContainer>
    </React.Suspense>
  );
}
