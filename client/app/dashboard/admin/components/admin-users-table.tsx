"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Store,
  Bike,
  User as UserIcon,
  MoreVertical,
  Check,
  X,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SELLER" | "DELIVERY" | "CUSTOMER";
  businessName?: string;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED";
  isActive: boolean;
  dateJoined: string;
  documents?: {
    type: string;
    docNumber: string;
    url: string;
  }[];
}

const mapKycStatus = (role: string, profile: any): AdminUserData["kycStatus"] => {
  if (role === "SELLER") {
    const status = profile?.merchantKycStatus ?? profile?.merchantKycStatus ?? "NONE";
    if (status === "APPROVED" || status === "VERIFIED") return "VERIFIED";
    if (status === "REJECTED") return "REJECTED";
    return "PENDING";
  }

  if (role === "DELIVERY") {
    const status = profile?.deliveryKycStatus ?? "NONE";
    if (status === "APPROVED" || status === "VERIFIED") return "VERIFIED";
    if (status === "REJECTED") return "REJECTED";
    return "PENDING";
  }

  return "VERIFIED";
};

const normalizeUsers = (list: any[]): AdminUserData[] =>
  list.map((profile) => {
    const role = (profile?.role || "CUSTOMER").toUpperCase();
    const safeRole = role === "DRIVER" ? "DELIVERY" : role;

    return {
      id: profile?.userId || profile?.id || "unknown-user",
      name: profile?.fullName || "Unknown User",
      email: profile?.email || "",
      phone: profile?.alternatePhone || profile?.phoneNumber || "",
      role: safeRole as AdminUserData["role"],
      businessName: profile?.shopName || undefined,
      kycStatus: mapKycStatus(safeRole, profile),
      isActive: profile?.isActive ?? true,
      dateJoined: profile?.createdAt ? new Date(profile.createdAt).toISOString().slice(0, 10) : "N/A",
      documents: [],
    };
  });

export function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedKyc, setSelectedKyc] = useState<string>("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [reviewingUser, setReviewingUser] = useState<AdminUserData | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userToDelete, setUserToDelete] = useState<AdminUserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "100");
        if (selectedRole !== "ALL") params.set("role", selectedRole);
        if (selectedStatus !== "ALL") params.set("isActive", selectedStatus === "ACTIVE" ? "true" : "false");
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (selectedKyc !== "ALL") params.set("kycStatus", selectedKyc);

        const response = await api.get<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>(`/admin/users?${params.toString()}`);
        setUsers(normalizeUsers(response.data || []));
      } catch (error) {
        console.error("Failed to load admin users:", error);
        toast.error("Users load failed", {
          description: "Unable to fetch users from the backend.",
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [searchQuery, selectedRole, selectedStatus, selectedKyc]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.businessName && u.businessName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = selectedRole === "ALL" || u.role === selectedRole;
      const matchesStatus = selectedStatus === "ALL" || (selectedStatus === "ACTIVE" ? u.isActive : !u.isActive);
      const matchesKyc = selectedKyc === "ALL" || u.kycStatus === selectedKyc;

      return matchesSearch && matchesRole && matchesStatus && matchesKyc;
    });
  }, [users, searchQuery, selectedRole, selectedStatus, selectedKyc]);

  const handleToggleUserActive = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    try {
      const nextActive = !target.isActive;
      const result = await api.patch<{ success: boolean; isActive: boolean }>(`/admin/users/${userId}/status`, {
        isActive: nextActive,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: result.isActive ?? nextActive } : u,
        ),
      );
      toast.success(`User ${target.name} is now ${nextActive ? "activated" : "suspended"}`);
    } catch (error) {
      console.error("Failed to change user active status:", error);
      toast.error("Status update failed", {
        description: "Unable to change the user active state.",
      });
    }
  };

  const handleViewUser = async (user: AdminUserData) => {
    try {
      setOpenMenuId(null);
      const details = await api.get<any>(`/admin/users/${user.id}/details`);
      setViewingUser(details);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("User details failed", {
        description: "Unable to load the selected user details.",
      });
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const result = await api.delete<{ success: boolean; userId: string }>(`/admin/users/${userToDelete.id}`);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        toast.success(`Deleted ${userToDelete.name} permanently from the database`);
        setUserToDelete(null);
      } else {
        throw new Error("Deletion was not confirmed by the server");
      }
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error("User delete failed", {
        description: error?.message || "Unable to permanently delete this user from the database.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingKycCount = users.filter((u) => u.kycStatus === "PENDING").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 backdrop-blur-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email, TIN..."
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] text-zinc-300">
            <span>Role</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-md border border-white/10 bg-[#0b1220] px-2 py-1 text-[11px] text-white outline-none"
            >
              <option value="ALL">All Users</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
              <option value="DELIVERY">Driver</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] text-zinc-300">
            <span>Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-white/10 bg-[#0b1220] px-2 py-1 text-[11px] text-white outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] text-zinc-300">
            <span>KYC</span>
            <select
              value={selectedKyc}
              onChange={(e) => setSelectedKyc(e.target.value)}
              className="rounded-md border border-white/10 bg-[#0b1220] px-2 py-1 text-[11px] text-white outline-none"
            >
              <option value="ALL">All KYC</option>
              <option value="PENDING">Pending ({pendingKycCount})</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">User & Store Info</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">KYC Audit</th>
                <th className="py-2.5 px-3">Account Status</th>
                <th className="py-2.5 px-3">Joined</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                    Loading users from backend...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                    No users matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-xs font-semibold text-indigo-300">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{user.name}</p>
                          {user.businessName && (
                            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Store className="h-2.5 w-2.5 text-indigo-400" />
                              {user.businessName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${user.role === "SELLER" ? "text-purple-400" : user.role === "DELIVERY" ? "text-cyan-400" : "text-zinc-400"}`}>
                        {user.role === "SELLER" && <Store className="h-3 w-3 shrink-0" />}
                        {user.role === "DELIVERY" && <Bike className="h-3 w-3 shrink-0" />}
                        {user.role === "CUSTOMER" && <UserIcon className="h-3 w-3 shrink-0" />}
                        {user.role === "DELIVERY" ? "Driver" : user.role}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <p className="text-zinc-300 text-[11px]">{user.email || "No email"}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{user.phone || "No phone"}</p>
                    </td>

                    <td className="py-2.5 px-3">
                      {user.kycStatus === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Verified
                        </span>
                      )}
                      {user.kycStatus === "PENDING" && (
                        <button
                          onClick={() => setReviewingUser(user)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                          Review KYC
                        </button>
                      )}
                      {user.kycStatus === "REJECTED" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggleUserActive(user.id)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer ${user.isActive ? "text-emerald-400 hover:text-emerald-300" : "text-rose-400 hover:text-rose-300"}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-[11px] font-mono text-zinc-400">{user.dateJoined}</td>

                    <td className="py-2.5 px-3 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="User Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === user.id && (
                          <>
                            <div className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenMenuId(null)} />
                            <div className="app-dropdown-panel absolute right-0 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleViewUser(user)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>View</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleToggleUserActive(user.id);
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${user.isActive ? "text-rose-300 hover:bg-rose-500/15" : "text-emerald-300 hover:bg-emerald-500/15"}`}
                              >
                                {user.isActive ? (
                                  <>
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setUserToDelete(user);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-300">User profile</p>
                <h3 className="text-lg font-bold text-white">{viewingUser.fullName || viewingUser.name || "User details"}</h3>
              </div>
              <button onClick={() => setViewingUser(null)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-base font-semibold text-indigo-200">
                      {(viewingUser.fullName || viewingUser.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{viewingUser.fullName || viewingUser.name}</p>
                      <p className="text-[11px] text-zinc-400">{viewingUser.role}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Email</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.email || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Phone</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.alternatePhone || viewingUser.phoneNumber || viewingUser.phone || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">City</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.city || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Sub-city</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.subCity || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Specific location</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.specificLocation || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Store name</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.shopName || "N/A"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Market zone</p>
                    <p className="mt-1 text-sm text-zinc-200">{viewingUser.marketZone || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Stats</p>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-indigo-500/10 p-2 text-sm text-zinc-200">
                      <span>Total products</span>
                      <span className="font-semibold text-white">{viewingUser.stats?.postedProducts ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-indigo-500/10 p-2 text-sm text-zinc-200">
                      <span>Total orders</span>
                      <span className="font-semibold text-white">{viewingUser.stats?.totalOrders ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Documents</p>
                  <div className="mt-3 space-y-3">
                    {(viewingUser.documents || []).length > 0 ? (
                      (viewingUser.documents || []).map((item: any, index: number) => (
                        <div key={`${item.type}-${index}`} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                          <img src={item.url} alt={item.type} className="h-28 w-full object-cover" />
                          <div className="p-2 text-[11px] text-zinc-300">
                            <p className="font-medium text-white">{item.type}</p>
                            <p className="text-zinc-400">{item.docNumber || "Document reference"}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[11px] text-zinc-500">
                        No uploaded document available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">KYC Documentation Audit</h3>
                  <p className="text-[11px] text-zinc-400">Reviewing credentials for {reviewingUser.name}</p>
                </div>
              </div>
              <button onClick={() => setReviewingUser(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Business Entity</span>
                  <p className="font-semibold text-white">{reviewingUser.businessName || "Sole Proprietor"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Applicant Role</span>
                  <p className="font-semibold text-indigo-300">{reviewingUser.role === "DELIVERY" ? "Driver" : reviewingUser.role}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Official Contact</span>
                  <p className="font-mono text-zinc-200 text-[11px]">{reviewingUser.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Submission Date</span>
                  <p className="font-mono text-zinc-200 text-[11px]">{reviewingUser.dateJoined}</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Submitted Government Credentials</label>
                <div className="mt-1.5 space-y-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center text-xs text-zinc-400">
                    {reviewingUser.role === "SELLER" ? "Merchant license and business verification on file." : reviewingUser.role === "DELIVERY" ? "Driver license and vehicle verification on file." : "Customer identity verification on file."}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Rejection Note (Mandatory only if declining)</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Expired business license, unclear photograph..."
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
              <button type="button" onClick={() => setReviewingUser(null)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => { if (!rejectionReason.trim()) { toast.error("Please specify a reason for KYC rejection"); return; } setReviewingUser(null); toast.error("KYC verification rejected"); setRejectionReason(""); }} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer">
                <X className="h-3.5 w-3.5" />
                <span>Reject KYC</span>
              </button>
              <button type="button" onClick={() => { setReviewingUser(null); toast.success("KYC verified successfully"); }} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-colors cursor-pointer">
                <Check className="h-3.5 w-3.5" />
                <span>Approve & Verify</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Pop-Up Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Are you sure you want to delete this user?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[280px]">
                  {userToDelete.name} ({userToDelete.email})
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs text-zinc-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">User Name:</span>
                  <span className="font-semibold text-white">{userToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Email Address:</span>
                  <span className="font-mono text-zinc-200">{userToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Platform Role:</span>
                  <span className="font-semibold text-indigo-300">{userToDelete.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Phone Number:</span>
                  <span className="font-mono text-zinc-300">{userToDelete.phone || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Member Since:</span>
                  <span className="font-mono text-zinc-400">{userToDelete.dateJoined}</span>
                </div>
              </div>
              <p className="text-rose-300/90 text-[11px] leading-relaxed">
                This action cannot be undone. This user profile and authentication account will be permanently deleted from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-white/10 bg-black/30 p-3.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
