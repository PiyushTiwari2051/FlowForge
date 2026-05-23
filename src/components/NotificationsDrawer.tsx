"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Bell, Check, Trash, ShieldAlert, Mail } from "lucide-react";
import { useLocale } from "./LocaleContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationsDrawerProps) {
  const { t, dir } = useLocale();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: dir === "rtl" ? "-100%" : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: dir === "rtl" ? "-100%" : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed top-0 bottom-0 z-50 w-full max-w-md bg-zinc-950 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col ${
          dir === "rtl" ? "left-0 border-r" : "right-0 border-l"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-zinc-400" />
            <h2 className="font-mono text-xs tracking-wider uppercase font-semibold text-zinc-150">
              {t("notifications")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2 bg-zinc-900/30 border-b border-zinc-900 flex justify-end">
            <button
              onClick={onMarkAllRead}
              className="text-[10px] text-zinc-450 hover:text-zinc-200 flex items-center gap-1 font-mono tracking-tight"
            >
              <Check className="w-3 h-3" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-zinc-500 gap-2">
              <Bell className="w-8 h-8 opacity-20" />
              <p className="text-xs font-mono">{t("noRecords")}</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && onMarkRead(item.id)}
                className={`p-4 rounded border transition-all cursor-pointer relative group flex gap-3 ${
                  item.read
                    ? "bg-zinc-900/10 border-zinc-900/60 hover:border-zinc-800 text-zinc-400"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-100"
                }`}
              >
                {/* Icon wrapper */}
                <div
                  className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${
                    item.read
                      ? "bg-zinc-950 border-zinc-900 text-zinc-550"
                      : "bg-zinc-950 border-zinc-800 text-zinc-200"
                  }`}
                >
                  {item.type === "email" ? (
                    <Mail className="w-3.5 h-3.5" />
                  ) : (
                    <Bell className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs font-bold truncate pr-3 ${item.read ? "text-zinc-400" : "text-zinc-200"}`}>
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-pulse mt-1 shrink-0" />
                    )}
                  </div>
                  <p className="text-zinc-450 text-[11px] mt-1 leading-relaxed break-words font-sans">
                    {item.message}
                  </p>
                  <span className="text-[9px] text-zinc-550 mt-2 block font-mono">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
