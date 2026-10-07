"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  User,
  Fingerprint,
  Globe,
  Tag,
  Info,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  LogIn,
  LogOut,
  UserPlus,
  ShieldCheck,
  Package,
  ShoppingCart,
  CreditCard,
  KeyRound,
} from "lucide-react";
import { useAuditLogs } from "@/features/admin/hooks/use-admin";
import {
  AuditAction,
  AuditCategory,
  type AuditLog,
  type FilterAuditLogsParams,
  UserRole,
  getAuditSeverity,
  getAuditCategory,
  getAuditActionLabel,
  type AuditSeverity,
} from "@/features/admin/types/admin.types";

// ─── Constants ───────────────────────────────────────────────────────────────

const LIMIT = 30;

const CATEGORY_TABS: { label: string; value: AuditCategory | "ALL"; icon: React.ElementType }[] = [
  { label: "All", value: "ALL", icon: ShieldAlert },
  { label: "Auth", value: "AUTH", icon: LogIn },
  { label: "Users", value: "USER_MGMT", icon: User },
  { label: "KYC", value: "KYC", icon: ShieldCheck },
  { label: "Products", value: "PRODUCT", icon: Package },
  { label: "Orders", value: "ORDER", icon: ShoppingCart },
  { label: "Payments", value: "PAYMENT", icon: CreditCard },
  { label: "Profile", value: "PROFILE", icon: KeyRound },
];

// Actions grouped by category for filtering
const CATEGORY_ACTIONS: Record<AuditCategory | "ALL", (AuditAction | "")[]> = {
  ALL: [""],
  AUTH: ["", AuditAction.USER_REGISTERED, AuditAction.USER_LOGIN, AuditAction.USER_LOGIN_FAILED, AuditAction.USER_LOGOUT, AuditAction.PASSWORD_CHANGED],
  USER_MGMT: ["", AuditAction.USER_APPROVED, AuditAction.USER_REJECTED, AuditAction.USER_SUSPENDED, AuditAction.USER_ACTIVATED, AuditAction.USER_DELETED],
  KYC: ["", AuditAction.KYC_SUBMITTED, AuditAction.KYC_APPROVED, AuditAction.KYC_REJECTED],
  PROFILE: ["", AuditAction.PROFILE_UPDATED],
  PRODUCT: ["", AuditAction.PRODUCT_CREATED, AuditAction.PRODUCT_UPDATED, AuditAction.PRODUCT_DELETED, AuditAction.PRODUCT_AVAILABILITY_TOGGLED, AuditAction.STOCK_UPDATED],
  CATEGORY: ["", AuditAction.CATEGORY_CREATED, AuditAction.CATEGORY_UPDATED, AuditAction.CATEGORY_DELETED],
  ORDER: ["", AuditAction.ORDER_PLACED, AuditAction.ORDER_STATUS_UPDATED, AuditAction.ORDER_CANCELLED, AuditAction.ORDER_DELIVERY_CLAIMED],
  PAYMENT: ["", AuditAction.PAYMENT_INITIATED, AuditAction.PAYMENT_VERIFIED, AuditAction.PAYMENT_FAILED, AuditAction.BANK_SLIP_UPLOADED, AuditAction.BANK_SLIP_APPROVED, AuditAction.BANK_SLIP_REJECTED, AuditAction.PAYOUT_RELEASED, AuditAction.REFUND_ISSUED],
  OTHER: [""],
};

const ROLE_OPTIONS = [
  { label: "All Roles", value: "" },
  { label: "Admin", value: UserRole.ADMIN },
  { label: "Seller", value: UserRole.SELLER },
  { label: "Customer", value: UserRole.CUSTOMER },
  { label: "Delivery", value: UserRole.DELIVERY },
];

const ENTITY_OPTIONS = [
  { label: "All Entities", value: "" },
  { label: "User", value: "User" },
  { label: "Profile", value: "Profile" },
  { label: "Product", value: "Product" },
  { label: "Order", value: "Order" },
  { label: "Payment", value: "Payment" },
  { label: "Payout", value: "Payout" },
];

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ action }: { action: AuditAction | string }) {
  const sev = getAuditSeverity(action);
  const map: Record<AuditSeverity, { cls: string; Icon: React.ElementType }> = {
    CRITICAL: { cls: "text-rose-400 bg-rose-500/10 border-rose-500/20", Icon: AlertOctagon },
    WARNING: { cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", Icon: AlertTriangle },
    INFO: { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", Icon: CheckCircle2 },
  };
  const { cls, Icon } = map[sev];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${cls}`}>
      <Icon size={9} />
      {sev}
    </span>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    SELLER: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    CUSTOMER: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    DELIVERY: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };
  const cls = map[role] ?? "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      {role}
    </span>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function AuditLogModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const sev = getAuditSeverity(log.action);
  const severityColors: Record<AuditSeverity, string> = {
    CRITICAL: "border-rose-500/30",
    WARNING: "border-amber-500/30",
    INFO: "border-indigo-500/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative z-10 w-full max-w-lg rounded-2xl border bg-[#0d121f] shadow-2xl ${severityColors[sev]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Audit Log Detail</span>
            <SeverityBadge action={log.action} />
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer transition">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5 text-xs">
          {/* Action + Role */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-indigo-300 text-sm">{log.action}</span>
            <RoleBadge role={log.actorRole} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={<Clock size={12} />} label="Timestamp" value={new Date(log.createdAt).toLocaleString()} />
            <DetailItem icon={<Fingerprint size={12} />} label="Log ID" value={log.id} mono />
            <DetailItem icon={<User size={12} />} label="Actor ID" value={log.actorId} mono />
            <DetailItem icon={<Tag size={12} />} label="Actor Role" value={log.actorRole} />
            <DetailItem icon={<Tag size={12} />} label="Target Entity" value={log.targetEntity} />
            <DetailItem icon={<Fingerprint size={12} />} label="Target ID" value={log.targetId} mono />
            <DetailItem icon={<Globe size={12} />} label="IP Address" value={log.ipAddress ?? "—"} mono />
          </div>

          {log.userAgent && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">User Agent</p>
              <p className="break-all font-mono text-zinc-300">{log.userAgent}</p>
            </div>
          )}

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                <Info size={10} /> Details
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] text-zinc-300">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">{icon} {label}</span>
      <span className={`truncate text-zinc-200 ${mono ? "font-mono text-[10px]" : ""}`}>{value}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-white/5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 rounded bg-white/[0.05]" style={{ width: `${45 + (i * 11) % 45}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminAuditLogs() {
  const { logs, total, totalPages, loading, fetchLogs, refresh } = useAuditLogs();

  // Category tab
  const [activeCategory, setActiveCategory] = useState<AuditCategory | "ALL">("ALL");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | AuditSeverity>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const doFetch = useCallback(
    (pg: number) => {
      const params: FilterAuditLogsParams = { page: pg, limit: LIMIT };
      if (selectedAction) params.action = selectedAction as AuditAction;
      if (selectedRole) params.actorRole = selectedRole as UserRole;
      if (selectedEntity) params.targetEntity = selectedEntity;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      fetchLogs(params);
    },
    [fetchLogs, selectedAction, selectedRole, selectedEntity, startDate, endDate],
  );

  useEffect(() => {
    setCurrentPage(1);
    doFetch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction, selectedRole, selectedEntity, startDate, endDate]);

  // When category tab changes, reset action filter
  const handleCategoryChange = (cat: AuditCategory | "ALL") => {
    setActiveCategory(cat);
    setSelectedAction("");
  };

  const goToPage = (pg: number) => {
    if (pg < 1 || pg > totalPages) return;
    setCurrentPage(pg);
    doFetch(pg);
  };

  // Client-side: search + severity + category
  const visibleLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.actorId.toLowerCase().includes(q) ||
      log.targetId.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      log.actorRole.toLowerCase().includes(q) ||
      (log.ipAddress ?? "").toLowerCase().includes(q);

    const matchSeverity =
      severityFilter === "ALL" || getAuditSeverity(log.action) === severityFilter;

    const matchCategory =
      activeCategory === "ALL" || getAuditCategory(log.action) === activeCategory;

    return matchSearch && matchSeverity && matchCategory;
  });

  const actionsForTab = CATEGORY_ACTIONS[activeCategory] ?? [""];

  return (
    <>
      {selectedLog && <AuditLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      <div className="space-y-3">
        {/* ── Category Tabs ── */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#0d121f]/90 p-2 backdrop-blur-xl">
          {CATEGORY_TABS.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryChange(value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${activeCategory === value
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Filters bar ── */}
        <div className="rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 backdrop-blur-xl space-y-2">
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                id="audit-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action, actor, IP, target…"
                className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Action filter — scoped to active tab */}
            <select
              id="audit-action-filter"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-[#0d121f] px-2 text-xs text-zinc-200 outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              {actionsForTab.map((a) => (
                <option key={a} value={a}>
                  {a === "" ? "All Actions" : getAuditActionLabel(a)}
                </option>
              ))}
            </select>

            {/* Role filter */}
            <select
              id="audit-role-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-[#0d121f] px-2 text-xs text-zinc-200 outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Entity filter */}
            <select
              id="audit-entity-filter"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-[#0d121f] px-2 text-xs text-zinc-200 outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              {ENTITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Date range */}
            <input id="audit-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-[#0d121f] px-2 text-xs text-zinc-200 outline-none transition focus:border-indigo-500 [color-scheme:dark] cursor-pointer" />
            <input id="audit-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-[#0d121f] px-2 text-xs text-zinc-200 outline-none transition focus:border-indigo-500 [color-scheme:dark] cursor-pointer" />

            {/* Refresh */}
            <button id="audit-refresh-btn" onClick={refresh} disabled={loading}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-50 cursor-pointer">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Severity + count */}
          <div className="flex items-center gap-1 flex-wrap">
            {(["ALL", "INFO", "WARNING", "CRITICAL"] as const).map((sev) => (
              <button key={sev} onClick={() => setSeverityFilter(sev)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${severityFilter === sev ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}>
                {sev}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-zinc-500">
              {total.toLocaleString()} records • page {currentPage}/{totalPages}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                  <th className="py-2.5 px-3 whitespace-nowrap">Timestamp</th>
                  <th className="py-2.5 px-3">Sev.</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Actor ID</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                ) : visibleLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <ShieldAlert size={28} className="opacity-30" />
                        <p className="font-sans text-sm">No audit logs found</p>
                        <p className="font-sans text-[11px] opacity-70">Try adjusting filters, date range, or category tab</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleLogs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" })}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <SeverityBadge action={log.action} />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-300 whitespace-nowrap">
                        {getAuditActionLabel(log.action)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <RoleBadge role={log.actorRole} />
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 max-w-[120px]">
                        <span className="truncate block" title={log.actorId}>{log.actorId}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 max-w-[160px]">
                        <span className="text-white">{log.targetEntity}</span>
                        <span className="text-zinc-600 mx-0.5">:</span>
                        <span className="truncate">{log.targetId}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                        {log.ipAddress ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-300 transition hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-indigo-300 cursor-pointer">
                          <Eye size={10} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-sans text-xs text-zinc-400">
              <span>{total.toLocaleString()} total records</span>
              <div className="flex items-center gap-1">
                <button id="audit-prev-page" onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 transition hover:bg-white/[0.06] disabled:opacity-40 cursor-pointer">
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => goToPage(pg)} disabled={loading}
                    className={`h-7 min-w-[28px] rounded-md border px-1.5 text-[11px] transition cursor-pointer ${pg === currentPage ? "border-indigo-500 bg-indigo-600/30 text-indigo-300" : "border-white/10 hover:bg-white/[0.06]"}`}>
                    {pg}
                  </button>
                ))}
                <button id="audit-next-page" onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 transition hover:bg-white/[0.06] disabled:opacity-40 cursor-pointer">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
