"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FolderTree, MoreVertical, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createCategoryAdmin,
  deleteCategoryAdmin,
  fetchCategories,
  updateCategoryAdmin,
} from "@/lib/api/catalog";
import type { CategoryItem } from "@/constants/mock-data";

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-ET", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export function AdminCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const result = await fetchCategories();
        setCategories(result);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Categories failed to load", {
          description: "Could not fetch backend categories.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => {
      const haystack = `${category.name} ${category.slug} ${category.subcategories.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [categories, search]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    const finalSlug = (slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

    try {
      setCreating(true);

      if (editingId) {
        const updated = await updateCategoryAdmin(editingId, {
          name: trimmedName,
          slug: finalSlug,
        });

        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingId
              ? {
                  ...category,
                  name: updated.name,
                  slug: updated.slug,
                  isActive: updated.isActive ?? category.isActive,
                }
              : category,
          ),
        );

        toast.success(`Category "${trimmedName}" updated`);
      } else {
        const created = await createCategoryAdmin({
          name: trimmedName,
          slug: finalSlug,
          isActive: true,
        });

        setCategories((prev) => [
          {
            id: created.id,
            name: created.name,
            slug: created.slug,
            iconName: "Layers",
            itemCount: 0,
            description: created.name,
            featuredZones: ["Mercato Wholesale"],
            image:
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
            subcategories: [],
            isActive: created.isActive,
            createdAt: created.createdAt,
          },
          ...prev,
        ]);

        toast.success(`Category "${trimmedName}" saved to database`);
      }

      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save category.";
      toast.error(editingId ? "Category update failed" : "Category save failed", {
        description: message,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    const confirmed = window.confirm(`Delete "${categoryName}"? This will fail if products or child categories still exist.`);
    if (!confirmed) return;

    try {
      await deleteCategoryAdmin(categoryId);
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      setMenuOpenId(null);
      toast.success(`Category "${categoryName}" deleted`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete category.";
      toast.error("Delete failed", {
        description: message,
      });
    }
  };

  const handleToggleStatus = async (category: CategoryItem) => {
    try {
      const updated = await updateCategoryAdmin(category.id, {
        isActive: !category.isActive,
      });

      setCategories((prev) =>
        prev.map((item) =>
          item.id === category.id
            ? { ...item, isActive: updated.isActive ?? !category.isActive }
            : item,
        ),
      );

      setMenuOpenId(null);
      toast.success(`Category "${category.name}" is now ${updated.isActive ? "active" : "inactive"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update category status.";
      toast.error("Status update failed", {
        description: message,
      });
    }
  };

  const startEdit = (category: CategoryItem) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setShowForm(true);
    setMenuOpenId(null);
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d121f]/90 p-4 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-300">Category management</p>
            <h2 className="text-lg font-bold text-white">Categories</h2>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-[11px] text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm((prev) => !prev);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Plus className="h-3.5 w-3.5" />
            {showForm ? "Close" : "Add category"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Category name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home Goods"
                className="h-9 w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="home-goods"
                className="h-9 w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-zinc-300 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              {creating ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update category" : "Add category"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090d16]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="px-3 py-3">Category name</th>
                <th className="px-3 py-3">Created at</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-zinc-500">
                    Loading categories from backend...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-zinc-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-bold text-indigo-300">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{category.name}</p>
                          <p className="mt-0.5 text-[10px] text-zinc-500">{category.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-zinc-300">{formatDate(category.createdAt)}</td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium ${
                          category.isActive === false
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {category.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td className="relative px-3 py-3 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === category.id ? null : category.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                          title="Category actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {menuOpenId === category.id && (
                          <>
                            <div className="fixed inset-0 z-30 cursor-default" onClick={() => setMenuOpenId(null)} />
                            <div className="app-dropdown-panel absolute right-0 z-40 mt-1 w-44 space-y-0.5 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 text-left shadow-2xl">
                              <button
                                type="button"
                                onClick={() => startEdit(category)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10"
                              >
                                <Pencil className="h-3.5 w-3.5 text-indigo-400" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(category)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10"
                              >
                                <span className="h-2 w-2 rounded-full bg-amber-400" />
                                {category.isActive === false ? "Activate" : "Deactivate"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(category.id, category.name)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                Delete
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
    </div>
  );
}
