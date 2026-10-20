// app/dashboard/cancel-order/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Ban,
} from "lucide-react";
import {
  alertSuccess,
  alertError,
  alertConfirm,
  alertToast,
} from "@/lib/alerts";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  shippingAddress?: {
    line1: string;
    city: string;
    province: string;
  };
  items?: OrderItem[];
}

const CANCELLATION_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found better price elsewhere",
  "Delivery taking too long",
  "Product quality concern",
  "Wrong size/variant selected",
  "Duplicate order",
  "Financial reasons",
  "Other",
];

export default function CancelOrderPage() {
  const router = useRouter();

  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [searching, setSearching] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // SEARCH ORDER
  // ============================================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderNumber.trim()) {
      setError("Please enter your order number");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(
          orderNumber.trim()
        )}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Order not found");
    } finally {
      setSearching(false);
    }
  };

  // ============================================================
  // CANCEL ORDER
  // ============================================================
  const handleCancelOrder = async () => {
    if (!order) return;

    if (!reason) {
      alertError("Reason Required", "Please select a cancellation reason");
      return;
    }

    if (reason === "Other" && !customReason.trim()) {
      alertError(
        "Custom Reason Required",
        "Please specify your cancellation reason"
      );
      return;
    }

    const finalReason = reason === "Other" ? customReason.trim() : reason;

    const confirmed = await alertConfirm(
      "Cancel This Order?",
      `Kya aap waqai order <strong>${order.orderNumber}</strong> cancel karna chahte hain?<br/><br/><span style="color:#ef4444;font-size:12px;">⚠️ Yeh action undo nahi ho sakta.</span>`,
      "Yes, Cancel Order",
      "Keep Order",
      "warning"
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "CANCELLED",
          cancellationReason: finalReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel order");

      await alertSuccess(
        "Order Cancelled",
        `Order ${order.orderNumber} successfully cancel kar diya gaya hai.<br/><br/>Reason: <strong>${finalReason}</strong>`
      );

      // Reset form
      setOrder(null);
      setOrderNumber("");
      setReason("");
      setCustomReason("");
    } catch (err: any) {
      alertError("Cancellation Failed", err.message || "Try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-obsidian-900 to-obsidian-950 border border-rose-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <XCircle size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-400">
              Order Cancellation
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Cancel Your Order
            </h1>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Enter your order number to find and cancel your order. Cancellation is
          only available for <strong className="text-amber-400">PENDING</strong>{" "}
          orders.
        </p>
      </div>

      {/* Search Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-neutral-300 font-medium mb-2 text-xs">
              Enter Your Order Number *
            </label>
            <div className="relative">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-2852"
                className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-sm text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold font-mono"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-3.5 text-neutral-400"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-neutral-500">
              Aapko yeh number order confirmation page ya email mein mila hoga.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={searching}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {searching ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={15} />
                <span>Find My Order</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Order Found */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-gold/30 shadow-xl space-y-4">
          {/* Order Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-gold">
                {order.orderNumber}
              </span>
              <span className="text-neutral-500 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  order.orderStatus === "PENDING"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                {order.orderStatus}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Order Items
            </h4>
            {order.items?.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-950 border border-neutral-800"
              >
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                  <img
                    src={item.image || "/images/products/placeholder.jpg"}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = "/images/products/placeholder.jpg";
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ivory text-xs truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Qty: {item.quantity} &bull; PKR{" "}
                    {Number(item.price).toLocaleString()}
                  </p>
                </div>
                <span className="font-bold text-gold text-xs">
                  PKR{" "}
                  {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              Shipping Address
            </span>
            <p className="text-xs text-neutral-300 flex items-start gap-1.5">
              <MapPin size={12} className="text-gold mt-0.5 shrink-0" />
              {order.shippingAddress?.line1},{" "}
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.province}
            </p>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Total Amount:</span>
            <span className="font-serif text-xl font-bold text-gold">
              PKR {Number(order.total).toLocaleString()}
            </span>
          </div>

          {/* ============================================ */}
          {/* CANCELLATION FORM */}
          {/* ============================================ */}
          {order.orderStatus === "PENDING" ? (
            <div className="pt-4 border-t border-neutral-800 space-y-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-2 text-xs">
                  Reason for Cancellation *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="">-- Select a reason --</option>
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {reason === "Other" && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-2 text-xs">
                    Please Specify *
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                    placeholder="Please describe your reason for cancellation..."
                    className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed">
                <strong>⚠️ Ahem:</strong> Order cancel karne ke baad payment
                refund policy apply hogi. Agar payment PAID hai, toh refund 3-5
                business days mein process hoga.
              </div>

              <button
                onClick={handleCancelOrder}
                disabled={cancelling || !reason}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Cancelling Order...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    <span>Cancel This Order</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-neutral-800 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
              <Ban size={24} className="mx-auto text-rose-400 mb-2" />
              <p className="text-sm font-semibold text-rose-300">
                This order cannot be cancelled
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {order.orderStatus === "CANCELLED"
                  ? "Yeh order pehle hi cancel ho chuka hai."
                  : "Yeh order already confirm/shipped hai. Cancel karne ke liye admin se contact karein."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}