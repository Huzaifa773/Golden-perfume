// app/admin/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { alertError, alertConfirm, alertToast } from "@/lib/alerts";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchedCount, setSearchedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, userRes, searchRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products?limit=100"),
        fetch("/api/admin/users"),
        fetch("/api/admin/search-products"),
      ]);

      const ordData = await ordRes.json();
      const prodData = await prodRes.json();
      const userData = await userRes.json();
      const searchData = await searchRes.json();

      setOrders(Array.isArray(ordData) ? ordData : ordData.orders || []);
      setProducts(prodData.products || []);
      setUsers(Array.isArray(userData) ? userData : userData.users || []);
      setSearchedCount(
        Array.isArray(searchData)
          ? searchData.length
          : searchData.searches?.length || 0
      );
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // ---------- DELETE PRODUCT ----------
  const handleDeleteProduct = async (prodId, prodName) => {
    const confirmed = await alertConfirm(
      "Remove Fragrance?",
      `Are you sure you want to delete "${prodName}" from the boutique reserve?`,
      "Delete Product",
      "Cancel",
      "warning"
    );
    if (!confirmed) return;

    setDeletingProductId(prodId);
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== prodId));
        alertToast(`"${prodName}" removed from boutique`, "success");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }
    } catch (e) {
      alertError("Deletion Failed", e.message || "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingPayments = orders.filter(
    (o) => o.paymentStatus !== "PAID"
  ).length;

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-6 md:py-10 px-3 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Admin Navigation Banner */}
        <div className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">
              <ShieldCheck size={14} />
              <span>Full Control Master Suite</span>
            </div>
            <h1 className="font-serif text-xl md:text-3xl font-bold text-ivory">
              Maison Charcoal Administration
            </h1>
            <p className="text-[10px] md:text-xs text-neutral-400 mt-1">
              Manage inventory, inspect user portfolios, and review unfulfilled
              searches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:shadow-gold-glow transition-all"
            >
              <Plus size={12} className="md:w-3.5 md:h-3.5" />
              <span>Add Product</span>
            </Link>

            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-obsidian-900 border border-gold/40 text-gold text-[10px] md:text-xs font-semibold uppercase tracking-wider hover:bg-gold/15 transition-all"
            >
              <Users size={12} className="md:w-3.5 md:h-3.5" />
              <span>Users List ({users.length})</span>
            </Link>

            <Link
              href="/admin/search-products"
              className="inline-flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-obsidian-900 border border-neutral-700 text-neutral-300 text-[10px] md:text-xs font-semibold uppercase tracking-wider hover:text-gold hover:border-gold/40 transition-all"
            >
              <Search size={12} className="md:w-3.5 md:h-3.5" />
              <span>Missing Searches ({searchedCount})</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-obsidian-900/80 border border-neutral-800 shadow-lg">
            <span className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-wider block">
              Gross Store Revenue
            </span>
            <span className="font-serif text-xl md:text-2xl font-bold text-gold mt-1 block">
              PKR {totalRevenue.toLocaleString()}
            </span>
            <span className="text-[9px] md:text-[10px] text-neutral-500 mt-1 block">
              From verified orders
            </span>
          </div>

          {/* Clickable Orders Card */}
          <Link
            href="/admin/orders"
            className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-obsidian-900/80 border border-neutral-800 shadow-lg hover:border-gold/50 transition-colors group cursor-pointer block"
          >
            <span className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-wider block">
              Total Placed Orders
            </span>
            <span className="font-serif text-xl md:text-2xl font-bold text-ivory mt-1 block flex items-center gap-2">
              {orders.length}
              <ArrowRight
                size={14}
                className="text-gold group-hover:translate-x-1 transition-transform"
              />
            </span>
            <span className="text-[9px] md:text-[10px] text-gold mt-1 block">
              Click to view all orders &rarr;
            </span>
          </Link>

          <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-obsidian-900/80 border border-neutral-800 shadow-lg">
            <span className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-wider block">
              Pending Clearances
            </span>
            <span className="font-serif text-xl md:text-2xl font-bold text-amber-400 mt-1 block">
              {pendingPayments}
            </span>
            <span className="text-[9px] md:text-[10px] text-amber-500/80 mt-1 block">
              Requires admin action
            </span>
          </div>

          <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-obsidian-900/80 border border-neutral-800 shadow-lg">
            <span className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-wider block">
              Catalog Fragrances
            </span>
            <span className="font-serif text-xl md:text-2xl font-bold text-ivory mt-1 block">
              {products.length}
            </span>
            <span className="text-[9px] md:text-[10px] text-emerald-400 mt-1 block">
              Live on storefront
            </span>
          </div>
        </div>

        {/* Big Button for Customer Orders */}
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-gold/10 via-obsidian-900 to-obsidian-900 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h3 className="font-serif text-sm md:text-base font-bold text-ivory">
                Customer Orders &amp; Payment Verification
              </h3>
              <p className="text-[10px] md:text-xs text-neutral-400">
                View all customers, their orders, addresses, and verify
                payments.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-obsidian-950 text-xs font-bold uppercase tracking-wider shadow-gold-glow hover:brightness-110 transition-all whitespace-nowrap"
          >
            <span>View Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Products Management */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-base md:text-lg font-bold text-ivory">
                Product Catalog Control ({products.length} Flacons)
              </h3>
              <p className="text-[10px] md:text-xs text-neutral-400">
                Update pricing, categories, stock, and add new fragrances with
                browser file upload.
              </p>
            </div>

            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-gold text-obsidian-950 text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-gold-glow hover:brightness-110"
            >
              <Plus size={12} className="md:w-3.5 md:h-3.5" />
              <span>Add New Fragrance</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gold">
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-obsidian-900/80">
              <table className="w-full min-w-[600px] text-left text-[10px] md:text-xs text-neutral-300">
                <thead className="bg-obsidian-950 text-neutral-400 uppercase tracking-wider text-[9px] md:text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-3 md:p-4">Product</th>
                    <th className="p-3 md:p-4">Category</th>
                    <th className="p-3 md:p-4">Price</th>
                    <th className="p-3 md:p-4">Stock</th>
                    <th className="p-3 md:p-4">Added By</th>
                    <th className="p-3 md:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {products.map((prod) => {
                    const isDeletingThis = deletingProductId === prod.id;
                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                          <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl overflow-hidden bg-obsidian-950 shrink-0">
                            <img
                              src={
                                prod.images?.[0] ||
                                "/images/products/placeholder.jpg"
                              }
                              alt={prod.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-ivory text-[10px] md:text-xs">
                              {prod.name}
                            </p>
                            <p className="text-[9px] md:text-[10px] text-neutral-400">
                              {prod.size}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 md:p-4 capitalize">
                          <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-full bg-gold/10 text-gold text-[9px] md:text-[10px] font-semibold border border-gold/20 whitespace-nowrap">
                            {typeof prod.category === "string"
                              ? prod.category
                              : prod.category?.name || "—"}
                          </span>
                        </td>
                        <td className="p-3 md:p-4 font-semibold text-ivory whitespace-nowrap">
                          PKR{" "}
                          {Number(
                            prod.discountPrice || prod.price
                          ).toLocaleString()}
                        </td>
                        <td className="p-3 md:p-4 whitespace-nowrap">
                          {prod.stock || 25} in stock
                        </td>
                        <td className="p-3 md:p-4 text-[10px] md:text-[11px] text-neutral-400 whitespace-nowrap">
                          {prod.addedByUserName || "Admin"}
                        </td>
                        <td className="p-3 md:p-4 text-right space-x-1 md:space-x-2 whitespace-nowrap">
                          <Link
                            href={`/admin/products/edit/${prod.id}`}
                            className="inline-flex p-1.5 md:p-2 rounded-lg bg-neutral-800 hover:bg-gold hover:text-obsidian-950 text-neutral-300 transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={12} className="md:w-3.5 md:h-3.5" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteProduct(prod.id, prod.name)
                            }
                            disabled={isDeletingThis}
                            className="inline-flex p-1.5 md:p-2 rounded-lg bg-neutral-800 hover:bg-rose-600 hover:text-white text-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Product"
                          >
                            <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}