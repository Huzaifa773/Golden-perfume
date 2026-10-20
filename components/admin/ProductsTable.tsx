"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { alertConfirm, alertToast, alertError } from "@/lib/alerts";

export interface AdminProductRow {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  category: { name: string };
  images: { url: string }[];
}

export function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rows, setRows] = useState(products);

  async function handleDelete(id: string, name: string) {
    const confirmed = await alertConfirm(
      "Deactivate / Delete Product?",
      `Are you sure you wish to remove <strong>${name}</strong> from active sales?`,
      "Yes, Delete",
      "Cancel"
    );
    if (!confirmed) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server error: ${res.status} ${res.statusText}. Check if API route exists.`);
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      if (data.softDeleted) {
        alertToast("Product has historical orders — deactivated instead", "info");
        setRows((r) => r.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
      } else {
        setRows((r) => r.filter((p) => p.id !== id));
        alertToast("Product removed from catalog", "success");
      }
      router.refresh();
    } catch (err: any) {
      console.error("Delete Error:", err);
      alertError("Deletion Failed", err.message || "Something went wrong. Check console.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-obsidian-900/80 backdrop-blur-md shadow-2xl">
      <table className="w-full min-w-[600px] md:min-w-[700px] text-[10px] md:text-xs">
        <thead className="border-b border-neutral-800 bg-obsidian-950/80 text-left uppercase tracking-wider text-gold font-semibold">
          <tr>
            <th className="px-2 py-2 md:px-4 md:py-3.5">Flacon</th>
            <th className="px-2 py-2 md:px-4 md:py-3.5">Fragrance Title</th>
            <th className="px-2 py-2 md:px-4 md:py-3.5">Category</th>
            <th className="px-2 py-2 md:px-4 md:py-3.5">Retail Price</th>
            <th className="px-2 py-2 md:px-4 md:py-3.5">Stock</th>
            <th className="px-2 py-2 md:px-4 md:py-3.5">Status</th>
            <th className="px-2 py-2 md:px-4 md:py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80">
          {rows.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-gold/5">
              <td className="px-2 py-2 md:px-4 md:py-3">
                <img
                  src={p.images[0]?.url || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=100&q=80"}
                  alt={p.name}
                  className="h-8 w-8 md:h-11 md:w-11 rounded-lg border border-gold/20 object-cover"
                />
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3">
                <p className="font-serif font-bold text-xs md:text-sm text-ivory">{p.name}</p>
                <p className="text-[8px] md:text-[10px] font-mono text-neutral-400">{p.sku}</p>
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3 text-neutral-300 whitespace-nowrap">{p.category?.name || "Uncategorized"}</td>
              <td className="px-2 py-2 md:px-4 md:py-3 font-serif font-semibold text-gold-200 whitespace-nowrap">{formatCurrency(Number(p.price))}</td>
              <td className="px-2 py-2 md:px-4 md:py-3">
                <span
                  className={`font-mono font-bold ${
                    p.stock <= 5 ? "text-red-400" : "text-neutral-300"
                  }`}
                >
                  {p.stock}
                </span>
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3">
                <span
                  className={`rounded-full px-2 py-0.5 md:px-2.5 md:py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    p.isActive
                      ? "bg-emerald-950 border border-emerald-500/40 text-emerald-400"
                      : "bg-neutral-800 border border-neutral-700 text-neutral-400"
                  }`}
                >
                  {p.isActive ? "Active" : "Archived"}
                </span>
              </td>
              <td className="px-2 py-2 md:px-4 md:py-3 text-right">
                <div className="flex justify-end gap-2 md:gap-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="p-1 md:p-1.5 rounded-lg text-neutral-400 hover:text-gold hover:bg-white/5 transition-colors"
                    title="Edit Product"
                  >
                    <Pencil size={12} className="md:w-4 md:h-4" />
                  </Link>
                  <button
                    disabled={busyId === p.id}
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1 md:p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Delete"
                  >
                    {busyId === p.id ? <Loader2 size={12} className="md:w-4 md:h-4 animate-spin" /> : <Trash2 size={12} className="md:w-4 md:h-4" />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}