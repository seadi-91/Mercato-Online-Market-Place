"use client";

import React, { useState } from "react";
import {
  X,
  Bell,
  CheckCheck,
  FileQuestion,
  ShoppingCart,
  CreditCard,
  Boxes,
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useSupplierStore, SupplierNotification } from "@/store/supplier-store";

export function SupplierNotificationsDrawer() {
  const {
    isNotificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    setActiveTab,
  } = useSupplierStore();

  const [filterType, setFilterType] = useState<string>("all");

  if (!isNotificationsOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !item.read;
    return item.type === filterType;
  });

  const getIcon = (type: SupplierNotification["type"]) => {
    switch (type) {
      case "rfq":
        return <FileQuestion className="h-4 w-4 text-emerald-600" />;
      case "order":
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      case "stock":
        return <Boxes className="h-4 w-4 text-amber-600" />;
      case "dispute":
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case "verification":
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-slate-600" />;
    }
  };

  const handleItemClick = (item: SupplierNotification) => {
    markNotificationAsRead(item.id);
    setActiveTab(item.linkTab);
    setNotificationsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setNotificationsOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-indigo-600 dark:text-indigo-400">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Notification Center</h2>
                <p className="text-xs text-slate-500">Live B2B alerts and transaction events</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setNotificationsOpen(false);
                  setActiveTab("notifications");
                }}
                title="Open Full Screen Notification Page"
                className="p-1.5 text-xs text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50 cursor-pointer flex items-center gap-1 font-semibold"
              >
                <span className="hidden sm:inline">Full Page</span>
              </button>
              <button
                onClick={markAllNotificationsRead}
                title="Mark all as read"
                className="p-1.5 text-xs text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5 overflow-x-auto text-xs">
            {["all", "unread", "order", "rfq", "payment", "stock"].map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`rounded-full px-3 py-1 font-semibold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                  filterType === ft
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ft}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No notifications in this category.
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-start gap-3 rounded-xl p-3.5 transition-colors cursor-pointer ${
                    item.read
                      ? "hover:bg-slate-50"
                      : "bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-100/60"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-xs">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      {!item.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="mt-1.5 text-[10px] text-slate-400 font-mono">
                      {item.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Full Page Link */}
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <button
              onClick={() => {
                setNotificationsOpen(false);
                setActiveTab("notifications");
              }}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View All in Full-Width Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
