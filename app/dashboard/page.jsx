// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Package,
  Truck,
  Sparkles,
  Clock,
  Minus,
  Plus,
  Trash2,
  Calendar,
  Lock,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import { alertConfirm, alertToast, alertError, alertSuccess } from "@/lib/alerts";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const userId = session?.user?.id;
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "Valued Patron";

  // ============================================================
  // ✅ CHECK IF NEW USER (2 minute se kam purana)
  // ============================================================
  useEffect(() => {
    if (session?.user?.createdAt) {
      const createdTime = new Date(session.user.createdAt).getTime();
      const now = Date.now();
      const diffInMinutes = (now - createdTime) / (1000 * 60);

      setIsNewUser(diffInMinutes < 2);
    }
  }, [session]);

  // ============================================================
  // ✅ REDIRECT IF NOT LOGGED IN
  // ============================================================
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && !session?.user?.id) {
      router.replace("/login");
      return;
    }
  }, [status, session, router]);

  // ============================================================
  // ✅ FETCH DASHBOARD DATA
  // ============================================================
  useEffect(() => {
    async function fetchDashboardData() {
      if (!userId) return;
      setLoading(true);
      try {
        const ordersRes = await fetch(
          `/api/orders?userId=${encodeURIComponent(userId)}`
        );

        if (!ordersRes.ok) {
          if (ordersRes.status === 401 || ordersRes.status === 404) {
            router.replace("/login");
            return;
          }
          throw new Error("Failed to fetch orders");
        }

        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);

        const notifRes = await fetch(
          `/api/notifications?userId=${encodeURIComponent(userId)}`
        );
        const notifData = await notifRes.json();
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && userId) {
      fetchDashboardData();
    }
  }, [status, userId, router]);

  // ============================================================
  // ✅ CANCEL ORDER (NEW!)
  // ============================================================
  const handleCancelOrder = async (orderId, orderNumber) => {
    const confirmed = await alertConfirm(
      "Cancel This Order?",
      `Kya aap waqai order <strong>${orderNumber}</strong> cancel karna chahte hain?<br/><br/><span style="color:#ef4444;font-size:12px;">⚠️ Yeh action undo nahi ho sakta.</span>`,
      "Yes, Cancel Order",
      "Keep Order",
      "warning"
    );
    if (!confirmed) return;

    setCancellingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "CANCELLED" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatus: "CANCELLED" } : o
        )
      );

      await alertSuccess(
        "Order Cancelled",
        `Order ${orderNumber} successfully cancel kar diya gaya hai.`
      );
    } catch (err) {
      alertError("Cancellation Failed", err.message || "Try again.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // ============================================================
  // UPDATE ITEM QUANTITY
  // ============================================================
  const updateItemQuantity = async (orderId, itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newItems = o.items.map((it) =>
          it.productId === itemId ? { ...it, quantity: newQuantity } : it
        );
        const newSubtotal = newItems.reduce(
          (sum, it) => sum + Number(it.price) * Number(it.quantity),
          0
        );
        const newTotal =
          newSubtotal + Number(o.shippingCost) - Number(o.discount);
        return {
          ...o,
          items: newItems,
          subtotal: newSubtotal,
          total: newTotal,
        };
      })
    );

    try {
      const res = await fetch(`/api/orders/${orderId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update quantity");
      }
      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const newItems = o.items.map((existingItem) => {
            const freshItem = updatedOrder.items?.find(
              (fi) => fi.productId === existingItem.productId
            );
            return {
              ...existingItem,
              quantity: freshItem?.quantity ?? existingItem.quantity,
              image: existingItem.image || freshItem?.image,
            };
          });
          return {
            ...o,
            items: newItems,
            subtotal: updatedOrder.subtotal,
            total: updatedOrder.total,
          };
        })
      );
      alertToast("Order item updated", "success");
    } catch (err) {
      alertError(
        "Update Failed",
        err.message || "Failed to update item quantity"
      );
    }
  };

  // ============================================================
  // REMOVE ITEM
  // ============================================================
  const removeItem = async (orderId, itemId) => {
    const confirmed = await alertConfirm(
      "Remove Item?",
      "Are you sure you want to remove this fragrance flacon from your order?",
      "Remove Item",
      "Keep",
      "warning"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to remove item");
      }
      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            items: updatedOrder.items,
            subtotal: updatedOrder.subtotal,
            total: updatedOrder.total,
          };
        })
      );
      alertToast("Item removed from order", "success");
    } catch (err) {
      alertError("Removal Failed", err.message || "Could not remove item.");
    }
  };

  // ============================================================
  // MARK NOTIFICATION AS READ
  // ============================================================
  const markAsRead = async (notifId) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notifId }),
      });
      setNotifications(
        notifications.map((n) =>
          n.id === notifId ? { ...n, isRead: true } : n
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const totalSpent = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // ============================================================
  // LOADING
  // ============================================================
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-sm tracking-widest uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-sm tracking-widest uppercase">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold/30 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-gold-700 via-gold to-gold-400 text-obsidian-950 font-serif font-bold text-2xl flex items-center justify-center shadow-gold-glow">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                VIP Patron Salon
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
                {isNewUser ? "Welcome" : "Welcome back"}, {userName}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {userEmail} &bull; Member since 2026
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
          {[
            { id: "overview", label: "Overview & Profile", icon: User },
            {
              id: "orders",
              label: `My Orders (${orders.length})`,
              icon: Package,
            },
            {
              id: "notifications",
              label: `Notifications ${
                unreadNotifs > 0 ? `(${unreadNotifs})` : ""
              }`,
              icon: Bell,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-gold/20 text-gold border border-gold/40 shadow-gold-glow"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-gold" : "text-neutral-400"}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="font-serif text-2xl font-bold text-ivory mt-1 block">
                  {orders.length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                  Total Spend
                </span>
                <span className="font-serif text-2xl font-bold text-gold mt-1 block">
                  PKR {totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                  Active Shipments
                </span>
                <span className="font-serif text-2xl font-bold text-ivory mt-1 block">
                  {
                    orders.filter(
                      (o) =>
                        o.orderStatus === "PROCESSING" ||
                        o.orderStatus === "SHIPPED"
                    ).length
                  }
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                  Pending Notifications
                </span>
                <span className="font-serif text-2xl font-bold text-gold mt-1 block">
                  {unreadNotifs}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-obsidian-900/80 border border-neutral-800 space-y-4">
                <h3 className="font-serif text-lg font-bold text-ivory border-b border-neutral-800 pb-3 flex items-center gap-2">
                  <User size={16} className="text-gold" />
                  <span>Patron Profile Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Full Name:</span>
                    <span className="text-ivory font-semibold">{userName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">
                      Email Address:
                    </span>
                    <span className="text-ivory font-semibold">
                      {userEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">
                      Phone (WhatsApp):
                    </span>
                   <span className="text-ivory font-semibold">
                    {session?.user?.phone || "Not provided"}
                  </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">
                      Membership Status:
                    </span>
                    <span className="text-gold font-bold uppercase tracking-wider">
                      VIP Tier 1
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-obsidian-900/80 border border-neutral-800 space-y-4">
                <h3 className="font-serif text-lg font-bold text-ivory border-b border-neutral-800 pb-3 flex items-center gap-2">
                  <Truck size={16} className="text-gold" />
                  <span>Default Shipping Address</span>
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Apartment 4B, Creek Vista, Phase 8 DHA, Karachi, Sindh,
                  75500, Pakistan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-ivory">
              Order History &amp; Live Quantity Control
            </h3>

            {loading ? (
              <div className="text-center py-12 text-gold">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-obsidian-900/40 rounded-3xl border border-neutral-800 p-8">
                <Package size={32} className="mx-auto text-neutral-600 mb-3" />
                <p className="text-xs text-neutral-400">
                  You have not placed any orders yet.
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-4 px-6 py-2 rounded-full bg-gold text-obsidian-950 text-xs font-semibold"
                >
                  Explore Boutique
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isPaid = order.paymentStatus === "PAID";
                  const isCancelled = order.orderStatus === "CANCELLED";
                  const isConfirmed = order.orderStatus !== "PENDING";
                  // ✅ Buttons sirf PENDING orders par (aur cancel nahi hue)
                  const showQuantityControls =
                    !isPaid && !isConfirmed && !isCancelled;
                  // ✅ Cancel button sirf PENDING orders par
                  const showCancelButton =
                    order.orderStatus === "PENDING" && !isCancelled;
                  const isCancelling = cancellingOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`p-6 rounded-3xl bg-obsidian-900/80 border shadow-xl space-y-4 ${
                        isCancelled
                          ? "border-rose-500/30 opacity-90"
                          : "border-neutral-800"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 text-xs">
                        <div>
                          <span className="text-neutral-400">Order:</span>{" "}
                          <span className="font-mono font-bold text-gold">
                            {order.orderNumber}
                          </span>
                          <span className="text-neutral-500 ml-2">
                            ({new Date(order.createdAt).toLocaleDateString()})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isCancelled
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : isPaid
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {isCancelled ? (
                              <>
                                <Ban size={11} /> CANCELLED
                              </>
                            ) : (
                              <>Payment: {order.paymentStatus}</>
                            )}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isCancelled
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-gold/15 text-gold border-gold/30"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div
                            key={`${item.productId}-${idx}`}
                            className="flex items-center gap-4 bg-obsidian-950 p-3 rounded-2xl border border-neutral-800/80"
                          >
                            <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                              <img
                                src={
                                  item.image ||
                                  "/images/products/placeholder.jpg"
                                }
                                alt={item.name}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/images/products/placeholder.jpg";
                                }}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-ivory text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                PKR {Number(item.price).toLocaleString()}
                              </p>
                              <p className="text-[11px] text-gold font-semibold mt-0.5">
                                Subtotal: PKR{" "}
                                {(
                                  Number(item.price) * Number(item.quantity)
                                ).toLocaleString()}
                              </p>
                            </div>

                            {showQuantityControls ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      updateItemQuantity(
                                        order.id,
                                        item.productId,
                                        Number(item.quantity) - 1
                                      )
                                    }
                                    disabled={Number(item.quantity) <= 1}
                                    className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 hover:bg-gold/20 hover:border-gold text-ivory flex items-center justify-center disabled:opacity-40"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-8 text-center font-bold text-ivory">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateItemQuantity(
                                        order.id,
                                        item.productId,
                                        Number(item.quantity) + 1
                                      )
                                    }
                                    className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 hover:bg-gold/20 hover:border-gold text-ivory flex items-center justify-center"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    removeItem(order.id, item.productId)
                                  }
                                  className="h-8 w-8 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white flex items-center justify-center"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            ) : isCancelled ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30">
                                <XCircle
                                  size={14}
                                  className="text-rose-400"
                                />
                                <span className="text-xs text-rose-400 font-semibold">
                                  Cancelled • Qty: {item.quantity}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-400"
                                />
                                <span className="text-xs text-emerald-400 font-semibold">
                                  {isPaid
                                    ? `Paid • Qty: ${item.quantity}`
                                    : `Order Confirmed • Qty: ${item.quantity}`}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-800 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                          <span>
                            Method:{" "}
                            <strong className="text-white">
                              {order.paymentMethod}
                            </strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-gold" />
                            Expected Delivery:{" "}
                            <strong className="text-gold">
                              {isCancelled
                                ? "—"
                                : isPaid
                                ? new Date(
                                    new Date(
                                      order.updatedAt || order.createdAt
                                    ).getTime() +
                                      3 * 24 * 60 * 60 * 1000
                                  ).toLocaleDateString("en-PK", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Pending Payment"}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Total Amount */}
                          <div className="text-right">
                            <span className="text-neutral-400 mr-2">
                              Total Amount:
                            </span>
                            <span className="font-serif text-lg font-bold text-gold">
                              PKR {Number(order.total).toLocaleString()}
                            </span>
                          </div>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-ivory">
              Concierge Notifications
            </h3>

            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-obsidian-900/40 rounded-3xl border border-neutral-800 p-8">
                <Bell size={32} className="mx-auto text-neutral-600 mb-3" />
                <p className="text-xs text-neutral-400">
                  You have no active notifications.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    className={`p-5 rounded-2xl border transition-all ${
                      notif.isRead
                        ? "bg-obsidian-900/40 border-neutral-800/80 text-neutral-400"
                        : "bg-obsidian-900/90 border-gold/40 text-ivory shadow-gold-glow"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-sm text-ivory">
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-gold-200 mt-1 font-medium leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-neutral-500 block mt-2">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="px-3 py-1 rounded-full text-[10px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}