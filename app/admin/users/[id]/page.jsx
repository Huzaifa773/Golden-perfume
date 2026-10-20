// app/admin/users/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Package,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Truck,
  DollarSign,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params?.id;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserDetail() {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (!res.ok) throw new Error("Failed to load user detail");
        const data = await res.json();
        setDetail(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <p className="font-serif tracking-widest text-sm">Inspecting Patron Dossier...</p>
      </div>
    );
  }

  if (!detail || !detail.user) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl text-ivory mb-2">User Not Found</h2>
        <Link href="/admin/users" className="text-gold underline text-xs">
          &larr; Back to Users Registry
        </Link>
      </div>
    );
  }

  const { user, products, orders, totalSpend } = detail;

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            <span>Return to Users Registry</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-gold-700 via-gold to-gold-400 text-obsidian-950 font-serif font-bold text-2xl flex items-center justify-center shadow-gold-glow">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                  User Portfolio Dossier
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
                  {user.name}
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {user.email} &bull; Registered {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 px-4 rounded-2xl bg-obsidian-950 border border-gold/30 text-center">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Lifetime Spend
                </span>
                <span className="font-serif text-xl font-bold text-gold">
                  PKR {totalSpend.toLocaleString()}
                </span>
              </div>
              <div className="p-3 px-4 rounded-2xl bg-obsidian-950 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Role
                </span>
                <span className="font-serif text-base font-bold text-ivory">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800 space-y-2">
            <span className="text-xs text-neutral-400 uppercase tracking-wider block flex items-center gap-1.5">
              <User size={13} className="text-gold" /> Contact Information
            </span>
            <p className="text-xs text-ivory">
              Phone: <strong className="text-white">{user.phone || "Not specified"}</strong>
            </p>
            <p className="text-xs text-ivory">
              Email: <strong className="text-white">{user.email}</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800 space-y-2 md:col-span-2">
            <span className="text-xs text-neutral-400 uppercase tracking-wider block flex items-center gap-1.5">
              <MapPin size={13} className="text-gold" /> Registered Address
            </span>
            <p className="text-xs text-neutral-300">
              {user.address?.line1 || "No street address specified"},{" "}
              {user.address?.city || "Karachi"},{" "}
              {user.address?.province || "Sindh"}, Pakistan
            </p>
          </div>
        </div>

        {/* SECTION A: PRODUCTS ADDED BY THIS USER */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-bold">
                User Creation Portfolio
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ivory mt-0.5">
                Products Added by {user.name} ({products.length})
              </h2>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-obsidian-900/40 rounded-2xl border border-neutral-800 p-6">
              <Sparkles size={28} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400">
                This user has not added any custom fragrances to the boutique yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION B: ORDERS PLACED BY THIS USER */}
        <div className="space-y-4 pt-6 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-bold">
                Order Activity
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ivory mt-0.5">
                Orders Placed by {user.name} ({orders.length})
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-obsidian-900/40 rounded-2xl border border-neutral-800 p-6">
              <Package size={28} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400">
                This user has not placed any orders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-6 rounded-3xl bg-obsidian-900/80 border border-neutral-800 shadow-xl space-y-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-gold">
                        {o.orderNumber}
                      </span>
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Calendar size={12} /> Ordered:{" "}
                        <strong className="text-white">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        o.paymentStatus === "PAID"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}>
                        {o.paymentStatus}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Date & Shipping Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-obsidian-950 p-3 rounded-xl border border-neutral-800/80">
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 block">
                        Order Kab Tak Deliver Karna Hai
                      </span>
                      <span className="text-gold font-bold">
                        {o.expectedDeliveryDate || "Within 2–3 Days"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 block">
                        Payment Method
                      </span>
                      <span className="text-ivory font-semibold">{o.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 block">
                        Total Amount
                      </span>
                      <span className="text-gold font-bold font-serif text-sm">
                        PKR {Number(o.total).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase text-neutral-400 block font-semibold">
                      Items In This Order:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-obsidian-950 border border-neutral-800">
                          <div className="relative h-8 w-8 rounded overflow-hidden shrink-0">
                            <Image src={item.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=100"} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate text-[11px]">{item.name}</p>
                            <p className="text-[10px] text-neutral-400">Qty: {item.quantity} &bull; PKR {Number(item.price).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
