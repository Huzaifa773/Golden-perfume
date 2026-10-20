// app/admin/search-products/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { alertConfirm, alertToast, alertError } from "@/lib/alerts";

export default function AdminSearchProductsPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/search-products");
      const data = await res.json();
      setSearches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await alertConfirm(
      "Remove Search Request?",
      "Are you sure you want to dismiss this fragrance inquiry log?",
      "Remove",
      "Cancel",
      "warning"
    );
    if (!confirmed) return;

    try {
      await fetch(`/api/admin/search-products?id=${id}`, { method: "DELETE" });
      setSearches(searches.filter((s) => s.id !== id));
      alertToast("Inquiry request removed", "success");
    } catch (e) {
      alertError("Failed", "Failed to delete inquiry.");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 shadow-xl backdrop-blur-xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold transition-colors mb-2"
          >
            <ArrowLeft size={13} />
            <span>Return to Admin Panel</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                Customer Intelligence
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
                User Searched Products (Missing From Site)
              </h1>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Whenever a patron searches for a perfume or attar that doesn&apos;t currently exist in our catalog, the system records it here with the user&apos;s details so you can source and add it to the website.
              </p>
            </div>

            <div className="p-3 px-5 rounded-2xl bg-obsidian-950 border border-gold/30 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Total Requests
              </span>
              <span className="font-serif text-2xl font-bold text-gold">
                {searches.length}
              </span>
            </div>
          </div>
        </div>

        {/* Table of User Searched Products */}
        <div className="rounded-3xl border border-neutral-800 bg-obsidian-900/70 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-ivory flex items-center gap-2">
              <Search size={16} className="text-gold" />
              <span>Requested Fragrance Search Log</span>
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gold">Loading missing searches...</div>
          ) : searches.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-xs">
              No missing product searches recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-obsidian-950 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-4">Searched Fragrance Name</th>
                    <th className="p-4">Searched By (User)</th>
                    <th className="p-4">Search Frequency</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {searches.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="font-serif text-sm font-semibold text-ivory">
                          &ldquo;{s.query}&rdquo;
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-neutral-200">{s.userName || "Guest"}</p>
                        <p className="text-[10px] text-neutral-500">{s.userEmail || "—"}</p>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold border border-gold/30">
                          {s.searchCount || 1} times
                        </span>
                      </td>

                      <td className="p-4 text-neutral-400 text-[11px]">
                        {new Date(s.lastSearchedAt || s.createdAt).toLocaleString()}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {/* Add to Website button pre-fills the name */}
                        <Link
                          href={`/admin/products/add?name=${encodeURIComponent(s.query)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-obsidian-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-gold-glow"
                        >
                          <Plus size={12} />
                          <span>Add This Product</span>
                        </Link>

                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-600 hover:text-white text-neutral-400 transition-colors"
                          title="Dismiss"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
