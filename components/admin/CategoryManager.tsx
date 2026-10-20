"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { alertConfirm, alertToast, alertError } from "@/lib/alerts";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { products: number };
}

export function CategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category");
      setCategories((c) => [{ ...data.category, _count: { products: 0 } }, ...c]);
      setName("");
      toast.success("Category added");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setCategories((c) => c.map((cat) => (cat.id === id ? { ...cat, isActive: !isActive } : cat)));
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await alertConfirm(
      "Delete Category?",
      "Are you sure you want to delete this category? Products assigned to it may need reassignment.",
      "Delete",
      "Cancel",
      "warning"
    );
    if (!confirmed) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setCategories((c) => c.filter((cat) => cat.id !== id));
      alertToast("Category deleted successfully", "success");
      router.refresh();
    } catch (err: any) {
      alertError("Deletion Failed", err.message || "Failed to delete category");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="input-field max-w-xs" />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
        </button>
      </form>

      <div className="overflow-x-auto rounded-sm border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100">
                <td className="px-4 py-3 font-medium text-charcoal">{c.name}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3">
                  <button
                    disabled={busyId === c.id}
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className={`rounded-full px-2 py-1 text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"}`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button disabled={busyId === c.id} onClick={() => handleDelete(c.id)} className="text-neutral-500 hover:text-red-600">
                    {busyId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
