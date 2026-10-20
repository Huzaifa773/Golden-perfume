// app/admin/orders/user/[userId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CheckCircle2,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  MapPin,
  CreditCard,
  Banknote,
  Truck,
  PackageCheck,
  Smartphone,
  Building2,
  HandCoins,
  XCircle,
  AlertCircle,
  X, // ✅ Close icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Animation
import {
  alertConfirm,
  alertToast,
  alertError,
  alertSuccess,
} from "@/lib/alerts";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface OrderItem {
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference?: string;
  orderStatus: string;
  expectedDeliveryDate?: string;
  proofImageUrl?: string;
  customerName?: string;
  customerPhone?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  shippingAddress?: {
    line1: string;
    city: string;
    province: string;
  };
  items?: OrderItem[];
}

const PAYMENT_METHODS = [
  { value: "COD", label: "COD", icon: Banknote, color: "blue" },
  { value: "EASYPAISA", label: "Easypaisa", icon: Smartphone, color: "emerald" },
  { value: "JAZZCASH", label: "JazzCash", icon: Smartphone, color: "purple" },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: Building2,
    color: "amber",
  },
];

function getPaymentMethodLabel(method: string) {
  const found = PAYMENT_METHODS.find((m) => m.value === method);
  return found ? found.label : method;
}

export default function UserOrdersDetailPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    [orderId: string]: string;
  }>({});
  
  // ✅ Receipt Modal ke liye state
  const [receiptModal, setReceiptModal] = useState<string | null>(null);
  // ✅ Image Error Handling ke liye state
  const [imgError, setImgError] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch(`/api/admin/users/${userId}`);
      const userData = await userRes.json();

      const ordersRes = await fetch(`/api/orders?userId=${userId}`);
      const ordersData = await ordersRes.json();

      setUser(userData.user || userData);
      setOrders(
        Array.isArray(ordersData) ? ordersData : ordersData.orders || []
      );
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    setUpdatingStatusId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }
      alertToast(`Order status updated to ${newStatus}`, "success");
      fetchUserData();
    } catch (e: any) {
      alertError("Update Failed", e.message || "Failed to update order status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ============================================================
  // CONFIRM ORDER
  // ============================================================
  const handleConfirmOrder = async (order: Order) => {
    const methodToUse =
      selectedPaymentMethod[order.id] || order.paymentMethod;

    try {
      const confirmed = await alertConfirm(
        "Confirm This Order?",
        `Order <strong>${order.orderNumber}</strong> ko <strong>${
          order.orderStatus === "PENDING" ? "CONFIRMED" : order.orderStatus
        }</strong> mark karein?<br/><br/>Payment Method: <strong>${getPaymentMethodLabel(
          methodToUse
        )}</strong>`,
        "Yes, Confirm Order",
        "Cancel",
        "question"
      );
      if (!confirmed) return;

      const res = await fetch("/api/admin/clear-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          expectedDeliveryDate: "Within 2–3 Days",
          orderStatus:
            order.orderStatus === "PENDING"
              ? "CONFIRMED"
              : order.orderStatus,
          paymentMethod: methodToUse,
          action: "confirm",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm order.");

      alertSuccess(
        "Order Confirmed",
        `Order ${order.orderNumber} confirm ho gaya. Payment method: ${getPaymentMethodLabel(
          methodToUse
        )}.`
      );

      fetchUserData();
    } catch (err: any) {
      alertError(
        "Confirmation Failed",
        err.message || "Failed to confirm order."
      );
    }
  };

  // ============================================================
  // MARK AS PAID
  // ============================================================
  const handleMarkAsPaid = async (order: Order) => {
    const methodToUse =
      selectedPaymentMethod[order.id] || order.paymentMethod;

    try {
      const confirmed = await alertConfirm(
        "Mark as PAID?",
        `Payment receive ho gayi hai? Order <strong>${order.orderNumber}</strong> ko <strong>PAID</strong> mark karein?<br/><br/>Payment Method: <strong>${getPaymentMethodLabel(
          methodToUse
        )}</strong>`,
        "Yes, Mark as Paid",
        "Cancel",
        "question"
      );
      if (!confirmed) return;

      const res = await fetch("/api/admin/clear-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          expectedDeliveryDate: "Within 2–3 Days",
          orderStatus:
            order.orderStatus === "CONFIRMED"
              ? "PROCESSING"
              : order.orderStatus,
          paymentMethod: methodToUse,
          action: "mark-paid",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark paid.");

      alertSuccess(
        "Payment Received",
        `Order ${order.orderNumber} ab PAID hai. Payment Method: ${getPaymentMethodLabel(
          methodToUse
        )}.`
      );

      fetchUserData();
    } catch (err: any) {
      alertError(
        "Action Failed",
        err.message || "Failed to mark payment as paid."
      );
    }
  };

  // ============================================================
  // MARK AS DELIVERED (For COD Orders)
  // ============================================================
  const handleMarkDeliveredCOD = async (
    orderId: string,
    orderNumber: string
  ) => {
    const confirmed = await alertConfirm(
      "Mark as Delivered & Paid?",
      `Order <strong>${orderNumber}</strong> deliver ho gaya hai aur cash receive ho gaya?`,
      "Yes, Mark Delivered",
      "Cancel",
      "question"
    );
    if (!confirmed) return;

    setUpdatingStatusId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "DELIVERED",
          paymentStatus: "PAID",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark delivered");
      }
      alertSuccess(
        "Order Delivered & Paid",
        `Order ${orderNumber} successfully delivered. Cash received.`
      );
      fetchUserData();
    } catch (e: any) {
      alertError("Update Failed", e.message || "Failed to update order");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ============================================================
  // DELETE ORDER
  // ============================================================
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const confirmed = await alertConfirm(
      "Permanently Delete Order?",
      `Are you sure you want to PERMANENTLY DELETE order "${orderNumber}"?`,
      "Delete Order",
      "Cancel",
      "warning"
    );
    if (!confirmed) return;

    setDeletingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete order");

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      alertToast(`Order ${orderNumber} deleted`, "success");
    } catch (err: any) {
      alertError("Delete Failed", err.message || "Could not delete order.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <Loader2 className="animate-spin mr-2" /> Loading customer details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-neutral-400">
        Customer not found.
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingPayments = orders.filter(
    (o) => o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED"
  ).length;

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      
      {/* ============================================================
          ✅ RECEIPT MODAL (POPUP) WITH IMAGE ERROR FIX
          ============================================================ */}
      <AnimatePresence>
        {receiptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setReceiptModal(null);
              setImgError(false); // Reset error on close
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-3xl w-full bg-obsidian-900 border border-gold/40 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-obsidian-950">
                <h3 className="font-serif text-lg font-bold text-ivory flex items-center gap-2">
                  <Eye size={18} className="text-gold" />
                  Payment Receipt
                </h3>
                <button
                  onClick={() => {
                    setReceiptModal(null);
                    setImgError(false);
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-4 flex items-center justify-center bg-black/50 max-h-[80vh] overflow-y-auto">
                {/* ✅ Image Error Handling: Agar image load na ho toh text dikhao */}
                {imgError ? (
                  <div className="p-8 text-center bg-obsidian-950 rounded-lg border border-neutral-800 w-full">
                    <AlertCircle size={40} className="mx-auto text-rose-400 mb-3" />
                    <p className="text-neutral-300 text-sm">Receipt image could not be loaded.</p>
                    <p className="text-neutral-500 text-xs mt-1">The file might be corrupted or invalid.</p>
                  </div>
                ) : (
                  <img
                    src={receiptModal}
                    alt="Payment Receipt"
                    className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-lg border border-neutral-800 shadow-lg"
                    onError={() => setImgError(true)} // ✅ Set error if image fails
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-900 via-obsidian-900 to-obsidian-950 border border-gold/30 shadow-xl backdrop-blur-xl">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold mb-3 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Customers List
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-gold-600 to-gold text-obsidian-950 font-bold flex items-center justify-center text-2xl shrink-0 shadow-gold-glow">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} className="text-gold" /> {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gold" /> {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 px-4 rounded-xl bg-obsidian-950 border border-gold/30 text-center">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="font-serif text-lg font-bold text-gold">
                  {orders.length}
                </span>
              </div>
              <div className="p-3 px-4 rounded-xl bg-obsidian-950 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Total Spent
                </span>
                <span className="font-serif text-lg font-bold text-ivory">
                  PKR {totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="p-3 px-4 rounded-xl bg-obsidian-950 border border-amber-500/30 text-center">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Pending
                </span>
                <span className="font-serif text-lg font-bold text-amber-400">
                  {pendingPayments}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-ivory flex items-center gap-2">
            <ShoppingBag size={18} className="text-gold" />
            Order History ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 rounded-3xl border border-neutral-800 bg-obsidian-900/70">
              This customer has not placed any orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isPaid = order.paymentStatus === "PAID";
                const isCancelled = order.orderStatus === "CANCELLED";
                const isDeletingThis = deletingOrderId === order.id;
                const isConfirmed =
                  order.orderStatus === "CONFIRMED" ||
                  order.orderStatus === "PROCESSING" ||
                  order.orderStatus === "SHIPPED" ||
                  order.orderStatus === "DELIVERED";

                const currentMethod =
                  selectedPaymentMethod[order.id] || order.paymentMethod;

                return (
                  <div
                    key={order.id}
                    className={`p-6 rounded-3xl bg-obsidian-900/80 border shadow-xl space-y-4 ${
                      isCancelled
                        ? "border-rose-500/40 opacity-95"
                        : "border-neutral-800"
                    }`}
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-sm text-gold">
                          {order.orderNumber}
                        </span>
                        <span className="text-neutral-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Payment Method Tag */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                            isCancelled
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              : isPaid
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {isCancelled ? (
                            <>
                              <XCircle size={11} /> CANCELLED
                            </>
                          ) : (
                            <>
                              {order.paymentMethod === "COD" && (
                                <Banknote size={11} />
                              )}
                              {order.paymentMethod === "EASYPAISA" && (
                                <Smartphone size={11} />
                              )}
                              {order.paymentMethod === "JAZZCASH" && (
                                <Smartphone size={11} />
                              )}
                              {order.paymentMethod === "BANK_TRANSFER" && (
                                <Building2 size={11} />
                              )}
                              {isPaid
                                ? `PAID • ${getPaymentMethodLabel(
                                    order.paymentMethod
                                  )}`
                                : getPaymentMethodLabel(order.paymentMethod)}
                            </>
                          )}
                        </span>

                        {/* Order Status Tag */}
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

                    {/* CANCELLATION REASON */}
                    {isCancelled && (
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-rose-400" />
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                            Order Cancelled by User
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-neutral-300">
                            <span className="text-neutral-500">
                              Reason:{" "}
                            </span>
                            <strong className="text-ivory">
                              {order.cancellationReason ||
                                "No reason provided"}
                            </strong>
                          </p>
                          {order.cancelledAt && (
                            <p className="text-neutral-400 text-[11px]">
                              <span className="text-neutral-500">
                                Cancelled on:{" "}
                              </span>
                              {new Date(order.cancelledAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items & Shipping */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      <div className="lg:col-span-6 space-y-2">
                        <span className="font-semibold text-neutral-400 uppercase tracking-wider block text-[10px]">
                          Acquired Flacons
                        </span>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 rounded-xl bg-obsidian-950 border border-neutral-800"
                            >
                              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                                <img
                                  src={
                                    item.image ||
                                    "/images/products/placeholder.jpg"
                                  }
                                  alt={item.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ivory truncate">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-neutral-400">
                                  Qty: {item.quantity} &bull; PKR{" "}
                                  {Number(item.price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-6 p-3 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-2">
                        <span className="font-semibold text-neutral-400 uppercase tracking-wider block text-[10px]">
                          Address &amp; Payment Evidence
                        </span>
                        <p className="text-neutral-300 flex items-start gap-1.5">
                          <MapPin
                            size={12}
                            className="text-gold mt-0.5 shrink-0"
                          />
                          {order.shippingAddress?.line1},{" "}
                          {order.shippingAddress?.city},{" "}
                          {order.shippingAddress?.province}
                        </p>
                        <div className="flex flex-wrap gap-4 text-neutral-400 pt-1">
                          <span className="flex items-center gap-1">
                            <CreditCard size={11} className="text-gold" />
                            Method:{" "}
                            <strong className="text-gold">
                              {getPaymentMethodLabel(order.paymentMethod)}
                            </strong>
                          </span>
                          {order.paymentReference && (
                            <span>
                              Ref / TID:{" "}
                              <strong className="font-mono text-white">
                                {order.paymentReference}
                              </strong>
                            </span>
                          )}
                        </div>           
                        {order.proofImageUrl && 
                        order.proofImageUrl !== "null" && 
                        order.proofImageUrl.trim() !== "" && (
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-[10px] text-neutral-400">
                              Attached Slip:
                            </span>
                            <button
                              onClick={() => setReceiptModal(order.proofImageUrl!)}
                              className="text-gold hover:text-gold-200 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                            >
                              <Eye size={12} /> View Uploaded Receipt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTION BAR */}
                    <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-neutral-400 mr-2">
                            Total Amount:
                          </span>
                          <span
                            className={`font-serif text-lg font-bold ${
                              isCancelled ? "text-rose-400" : "text-gold"
                            }`}
                          >
                            PKR {Number(order.total).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 mr-2">
                            Est. Delivery:
                          </span>
                          <span className="text-ivory font-medium">
                            {isCancelled
                              ? "—"
                              : order.expectedDeliveryDate || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isCancelled ? (
                          <button
                            onClick={() =>
                              handleDeleteOrder(order.id, order.orderNumber)
                            }
                            disabled={isDeletingThis}
                            className="px-4 py-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            <Trash2 size={14} />
                            <span>
                              {isDeletingThis
                                ? "Deleting..."
                                : "Delete Cancelled Order"}
                            </span>
                          </button>
                        ) : (
                          <>
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value
                                )
                              }
                              disabled={updatingStatusId === order.id}
                              className="bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold disabled:opacity-50"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>

                            {!isPaid && !isConfirmed && (
                              <select
                                value={currentMethod}
                                onChange={(e) =>
                                  setSelectedPaymentMethod((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.value,
                                  }))
                                }
                                className="bg-obsidian-950 border border-gold/50 rounded-xl px-3 py-2 text-xs text-gold font-semibold focus:outline-none focus:border-gold"
                              >
                                <option value="COD">💵 COD</option>
                                <option value="EASYPAISA">📱 Easypaisa</option>
                                <option value="JAZZCASH">📱 JazzCash</option>
                                <option value="BANK_TRANSFER">
                                  🏦 Bank Transfer
                                </option>
                              </select>
                            )}

                            {!isConfirmed && !isPaid && (
                              <button
                                onClick={() => handleConfirmOrder(order)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                              >
                                <Truck size={14} />
                                <span>Confirm Your Order</span>
                              </button>
                            )}

                            {isConfirmed && !isPaid && (
                              <button
                                onClick={() => handleMarkAsPaid(order)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                              >
                                <HandCoins size={14} />
                                <span>
                                  Mark as PAID (
                                  {getPaymentMethodLabel(currentMethod)})
                                </span>
                              </button>
                            )}

                            {isConfirmed &&
                              !isPaid &&
                              order.orderStatus === "SHIPPED" && (
                                <button
                                  onClick={() =>
                                    handleMarkDeliveredCOD(
                                      order.id,
                                      order.orderNumber
                                    )
                                  }
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                                >
                                  <PackageCheck size={14} />
                                  <span>Delivered &amp; Paid</span>
                                </button>
                              )}

                            {isPaid && (
                              <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                                <CheckCircle2 size={14} />
                                PAID •{" "}
                                {getPaymentMethodLabel(order.paymentMethod)}
                              </span>
                            )}

                            <button
                              onClick={() =>
                                handleDeleteOrder(
                                  order.id,
                                  order.orderNumber
                                )
                              }
                              disabled={isDeletingThis}
                              className="px-4 py-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <Trash2 size={14} />
                              <span>
                                {isDeletingThis ? "Deleting..." : "Delete"}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}