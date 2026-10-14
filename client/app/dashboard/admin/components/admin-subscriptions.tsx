"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Filter,
  Check,
  X,
  Shield,
  Clock,
  Building2,
  Store,
  Tag,
  AlertTriangle,
  Search,
  Phone,
  Mail,
  Eye,
  Crown,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  SubscriptionPlan,
  UserSubscriptionRecord,
  SubscriptionTargetRole,
  BillingPeriod,
} from "@/types/subscription";
import { useSubscriptionStore } from "@/store/subscription-store";
import { toast } from "sonner";

export function AdminSubscriptions() {
  const {
    plans,
    subscribers,
    fetchPlans,
    fetchAdminSubscribers,
    createPlan,
    updatePlan,
    deletePlan,
    updateSubscriberStatus,
    isLoading,
  } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<"plans" | "subscribers">("plans");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SELLER" | "SUPPLIER">("ALL");

  // Subscriber search and filtering state
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "REJECTED">("ALL");
  const [subscriberRoleFilter, setSubscriberRoleFilter] = useState<"ALL" | "SELLER" | "SUPPLIER">("ALL");
  const [viewingSubscriber, setViewingSubscriber] = useState<UserSubscriptionRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Plan creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState<SubscriptionTargetRole>("SELLER");
  const [price, setPrice] = useState<number>(0);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [badge, setBadge] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [commissionDiscount, setCommissionDiscount] = useState<number>(0);
  const [features, setFeatures] = useState<string[]>([""]);

  useEffect(() => {
    fetchPlans();
    fetchAdminSubscribers();
  }, [fetchPlans, fetchAdminSubscribers]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setDescription("");
    setTargetRole("SELLER");
    setPrice(500);
    setBillingPeriod("monthly");
    setBadge("");
    setIsPopular(false);
    setCommissionDiscount(0);
    setFeatures(["Priority Search Listing", "Verified Merchant Badge"]);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setTargetRole(plan.targetRole);
    setPrice(plan.price);
    setBillingPeriod(plan.billingPeriod);
    setBadge(plan.badge || "");
    setIsPopular(Boolean(plan.isPopular));
    setCommissionDiscount(plan.commissionRateDiscount || 0);
    setFeatures(plan.features && plan.features.length ? plan.features : [""]);
    setIsModalOpen(true);
  };

  const handleAddFeatureField = () => {
    setFeatures([...features, ""]);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleRemoveFeatureField = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);

    if (editingPlan) {
      await updatePlan(editingPlan.id, {
        name,
        description,
        targetRole,
        price,
        billingPeriod,
        badge: badge.trim() || undefined,
        isPopular,
        commissionRateDiscount: commissionDiscount,
        features: cleanFeatures,
      });
    } else {
      await createPlan({
        name,
        description,
        targetRole,
        price,
        billingPeriod,
        badge: badge.trim() || undefined,
        isPopular,
        commissionRateDiscount: commissionDiscount,
        features: cleanFeatures,
        status: "ACTIVE",
      });
    }

    setIsModalOpen(false);
  };

  const filteredPlans = plans.filter(
    (p) => roleFilter === "ALL" || p.targetRole === roleFilter || p.targetRole === "ALL"
  );

  const totalMonthlyRevenue = subscribers
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const activeSubscribersCount = subscribers.filter(
    (s) => s.paymentStatus === "PAID"
  ).length;

  const pendingSlipCount = subscribers.filter(
    (s) => s.paymentStatus === "PENDING"
  ).length;

  const paidSubscribersCount = subscribers.filter(
    (s) => s.paymentStatus === "PAID"
  ).length;

  const rejectedSubscribersCount = subscribers.filter(
    (s) => s.paymentStatus === "REJECTED"
  ).length;

  const filteredSubscribers = subscribers.filter((sub) => {
    const q = subscriberSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (sub.userName && sub.userName.toLowerCase().includes(q)) ||
      (sub.userEmail && sub.userEmail.toLowerCase().includes(q)) ||
      (sub.paymentPhone && sub.paymentPhone.toLowerCase().includes(q)) ||
      (sub.planName && sub.planName.toLowerCase().includes(q)) ||
      (sub.transactionReference && sub.transactionReference.toLowerCase().includes(q));

    const matchesRole =
      subscriberRoleFilter === "ALL" || sub.userRole === subscriberRoleFilter;

    const matchesStatus =
      subscriberStatusFilter === "ALL" || sub.paymentStatus === subscriberStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCopyRef = (ref: string) => {
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    toast.success(`Copied Ref: ${ref}`);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Total Active Plans</p>
            <p className="text-xl font-bold text-white mt-1">
              {plans.filter((p) => p.status === "ACTIVE").length} Plans
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Subscribed Merchants</p>
            <p className="text-xl font-bold text-white mt-1">
              {activeSubscribersCount} Active
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Subscription Revenue</p>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {totalMonthlyRevenue.toLocaleString()} ETB
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Pending Slips</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {pendingSlipCount} To Verify
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Navigation Controls & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "plans"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Subscription Plans ({plans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscribers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "subscribers"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Subscribers & Audits</span>
            {pendingSlipCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                {pendingSlipCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {activeTab === "plans" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 text-[11px] font-medium hidden sm:inline">
                Target:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="ALL">All Audiences</option>
                <option value="SELLER">Sellers Only</option>
                <option value="SUPPLIER">Suppliers Only</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Plans Grid */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => {
            const isSellerPlan = plan.targetRole === "SELLER";
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  plan.status === "ACTIVE"
                    ? plan.isPopular
                      ? "border-indigo-500/50 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 shadow-xl shadow-indigo-950/20"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    : "border-white/5 bg-white/[0.01] opacity-60"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                        isSellerPlan
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {isSellerPlan ? <Store className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                      {plan.targetRole}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {plan.badge && (
                        <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                          {plan.badge}
                        </span>
                      )}
                      <span
                        className={`h-2 w-2 rounded-full ${
                          plan.status === "ACTIVE" ? "bg-emerald-400" : "bg-zinc-600"
                        }`}
                        title={plan.status}
                      />
                    </div>
                  </div>

                  {/* Title & Price */}
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {plan.price === 0 ? "FREE" : `${plan.price.toLocaleString()} ETB`}
                    </span>
                    <span className="text-xs text-zinc-400">/{plan.billingPeriod}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Card Footer Actions */}
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updatePlan(plan.id, {
                        status: plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                      })
                    }
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      plan.status === "ACTIVE"
                        ? "text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10"
                        : "text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {plan.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${plan.name}?`)) {
                          deletePlan(plan.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Subscribers Audit Table */}
      {activeTab === "subscribers" && (
        <div className="space-y-3">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 backdrop-blur-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                placeholder="Search merchant name, email, phone, plan..."
                className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={subscriberRoleFilter}
                onChange={(e) => setSubscriberRoleFilter(e.target.value as any)}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="ALL">All Merchant Roles</option>
                <option value="SELLER">Sellers Only</option>
                <option value="SUPPLIER">Suppliers Only</option>
              </select>

              <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/5 text-[11px]">
                {[
                  { id: "ALL", label: `All (${subscribers.length})` },
                  { id: "PAID", label: `Active (${paidSubscribersCount})` },
                  { id: "PENDING", label: `Pending (${pendingSlipCount})` },
                  { id: "REJECTED", label: `Rejected (${rejectedSubscribersCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubscriberStatusFilter(tab.id as any)}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                      subscriberStatusFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d121f]/90 overflow-hidden shadow-lg backdrop-blur-xl">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Merchant Subscriptions & Payment Records
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Comprehensive audit trail of who paid, subscriber tier, and transaction verification.
                </p>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Showing {filteredSubscribers.length} of {subscribers.length}
              </span>
            </div>

            <div className="overflow-x-auto min-h-[220px]">
              <table className="w-full text-left text-xs min-w-[780px]">
                <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-400 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Merchant ("Man Endekefele")</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Subscribed Plan</th>
                    <th className="py-2.5 px-3">Amount (ETB)</th>
                    <th className="py-2.5 px-3">Payment Channel</th>
                    <th className="py-2.5 px-3">Transaction Ref</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-zinc-500 text-xs">
                        No subscription records match your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => {
                      const isSeller = sub.userRole === "SELLER";
                      const initials = (sub.userName || "M")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Merchant ("Man Endekefele") */}
                          <td className="py-2.5 px-3 font-medium text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-100 truncate">{sub.userName || "Merchant"}</p>
                                <div className="flex items-center gap-1 text-[10.5px] text-zinc-400 font-mono">
                                  <Phone className="h-2.5 w-2.5 text-zinc-500" />
                                  <span>{sub.paymentPhone || "—"}</span>
                                </div>
                                {sub.userEmail && (
                                  <p className="text-[10px] text-zinc-500 truncate max-w-[160px]">
                                    {sub.userEmail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isSeller
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              }`}
                            >
                              {isSeller ? <Store className="h-2.5 w-2.5" /> : <Building2 className="h-2.5 w-2.5" />}
                              {sub.userRole}
                            </span>
                          </td>

                          {/* Subscribed Plan */}
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-indigo-300">{sub.planName}</p>
                            <span className="text-[10px] text-zinc-400 capitalize font-mono">
                              {sub.billingPeriod || "Monthly"}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                            {sub.price === 0 ? "FREE" : `ETB ${sub.price.toLocaleString()}`}
                          </td>

                          {/* Payment Channel */}
                          <td className="py-2.5 px-3">
                            <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10.5px] font-mono text-zinc-300 inline-block">
                              {sub.paymentMethod}
                            </span>
                            {sub.bankName && (
                              <span className="block text-[10px] text-zinc-400 mt-0.5 max-w-[150px] truncate">
                                {sub.bankName}
                              </span>
                            )}
                          </td>

                          {/* Transaction Ref */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1 font-mono text-[10.5px] text-zinc-400">
                              <span className="select-all">{sub.transactionReference}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyRef(sub.transactionReference)}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                title="Copy reference"
                              >
                                {copiedRef === sub.transactionReference ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3">
                            {sub.paymentStatus === "PAID" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                Active / Paid
                              </span>
                            )}
                            {sub.paymentStatus === "PENDING" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-amber-400">
                                <Clock className="h-3 w-3 animate-pulse shrink-0" />
                                Pending Verification
                              </span>
                            )}
                            {sub.paymentStatus === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-rose-400">
                                <XCircle className="h-3 w-3 shrink-0" />
                                Rejected
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingSubscriber(sub)}
                                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Inspect Subscriber Record"
                              >
                                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                              </button>

                              {sub.paymentStatus === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => updateSubscriberStatus(sub.id, "PAID")}
                                    className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10.5px] font-bold transition-all cursor-pointer"
                                    title="Approve Subscription"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateSubscriberStatus(sub.id, "REJECTED")}
                                    className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10.5px] font-bold transition-all cursor-pointer"
                                    title="Reject Subscription"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Plan Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e1424] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure tier pricing, target audience, and merchant benefits.
            </p>

            <form onSubmit={handleSavePlan} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Seller Pro"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of tier benefits"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Target Merchant</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="SELLER">Retail Sellers (Sellers Page)</option>
                    <option value="SUPPLIER">B2B Suppliers (Suppliers Page)</option>
                    <option value="ALL">All Merchants</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Billing Period</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Badge Label (Optional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Most Popular"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Feature Points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-zinc-300 font-medium">Included Features</label>
                  <button
                    type="button"
                    onClick={handleAddFeatureField}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    + Add Feature
                  </button>
                </div>

                <div className="space-y-1.5">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Feature #${idx + 1}`}
                        className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white outline-none focus:border-indigo-500"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureField(idx)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow transition-all cursor-pointer"
                >
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriber Inspection Modal */}
      {viewingSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e1424] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingSubscriber(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Subscriber Payment Audit
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Ref: {viewingSubscriber.transactionReference}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* Highlight Box */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                  Subscribed Plan
                </span>
                <p className="text-lg font-bold text-white mt-0.5">
                  {viewingSubscriber.planName}
                </p>
                <div className="mt-2 inline-block rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-mono font-bold text-emerald-400 text-base">
                  {viewingSubscriber.price === 0 ? "FREE" : `ETB ${viewingSubscriber.price.toLocaleString()}`}
                </div>
              </div>

              {/* Detail fields */}
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Merchant ("Who Paid"):</span>
                  <span className="font-semibold text-white">{viewingSubscriber.userName || "Merchant"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Merchant Role:</span>
                  <span className="font-mono font-semibold text-indigo-300">{viewingSubscriber.userRole}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Merchant Phone:</span>
                  <span className="font-mono text-white">{viewingSubscriber.paymentPhone || "—"}</span>
                </div>

                {viewingSubscriber.userEmail && (
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Merchant Email:</span>
                    <span className="font-mono text-zinc-300">{viewingSubscriber.userEmail}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Payment Gateway:</span>
                  <span className="font-mono text-white">{viewingSubscriber.paymentMethod}</span>
                </div>

                {viewingSubscriber.bankName && (
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Deposited Bank:</span>
                    <span className="text-zinc-300">{viewingSubscriber.bankName}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Billing Period:</span>
                  <span className="capitalize text-zinc-300">{viewingSubscriber.billingPeriod || "Monthly"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Subscription Status:</span>
                  <span className="font-semibold text-emerald-400">{viewingSubscriber.paymentStatus}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-400">Created At:</span>
                  <span className="font-mono text-zinc-300 text-[11px]">{viewingSubscriber.createdAt}</span>
                </div>
              </div>

              {/* Uploaded Slip if any */}
              {viewingSubscriber.paymentSlipUrl && (
                <div className="rounded-xl bg-white/[0.02] p-3 border border-white/10 space-y-2">
                  <p className="text-[11px] font-semibold text-zinc-300">Uploaded Bank Transfer Slip:</p>
                  <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-56 bg-black flex items-center justify-center">
                    <img
                      src={viewingSubscriber.paymentSlipUrl}
                      alt="Payment Slip"
                      className="max-h-56 w-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setViewingSubscriber(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>

              {viewingSubscriber.paymentStatus === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      updateSubscriberStatus(viewingSubscriber.id, "REJECTED");
                      setViewingSubscriber(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateSubscriberStatus(viewingSubscriber.id, "PAID");
                      setViewingSubscriber(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
                  >
                    Approve Payment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
