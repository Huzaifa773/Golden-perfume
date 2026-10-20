// app/checkout/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Smartphone,
  Upload,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { alertSuccess, alertError, alertToast, alertConfirm } from "@/lib/alerts";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clear, isLoaded } = useCart();

  // Address Form State
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "Karachi",
    province: "Sindh",
    postalCode: "",
    notes: "",
  });

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const freeShipping = subtotal >= 15000 || subtotal === 0;
  const shippingCost = freeShipping ? 0 : 350;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.fullName || !formData.phone || !formData.address) {
      alertError(
        "Incomplete Delivery Information",
        "Please enter your full name, phone number, and street address to proceed."
      );
      return;
    }

    if (items.length === 0) {
      alertToast("Your bag is empty. Please select fragrances first.", "info");
      return;
    }

    // ============================================================
    // ✅ NAYA: Payment Validation (TID / Receipt Required)
    // ============================================================
   if (paymentMethod === "EASYPAISA" || paymentMethod === "JAZZCASH") {
    if (!paymentReference.trim()) {
      alertError("Transaction ID Required", `Please enter your ${paymentMethod === "EASYPAISA" ? "Easypaisa" : "JazzCash"} Transaction ID (TID) to confirm the order.`);
      return;
    }

    // ✅ 11 Digits Check
    if (paymentReference.length !== 11) {
      alertError(
        "Invalid TID",
        "Transaction ID (TID) must be exactly 11 digits long. Please check your TID and try again."
      );
      return;
    }
  }

 if (paymentMethod === "BANK_TRANSFER") {
  if (!proofImage || proofImage.trim() === "") {
    await alertError(
      "Receipt Required! 🧾",
      "Please upload the receipt for your bank payment. (Screenshot) <br/><br/><strong>Please upload your payment receipt</strong> to confirm the order."
    );
    return;
  }
}
    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: session?.user?.id || "guest",
        customerName: formData.fullName,
        customerEmail: formData.email || "guest@maisoncharcoal.com",
        customerPhone: formData.phone,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          line1: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          country: "Pakistan",
        },
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          image: i.image,
        })),
        subtotal,
        shippingCost,
        discount: 0,
        total,
        paymentMethod,
        paymentReference: paymentReference.trim(), // Sirf TID bhejein
        proofImageUrl: proofImage, // Sirf Receipt bhejein
        notes: formData.notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to place order.");
      }

      const createdOrder = await res.json();
      clear(); // clear cart
      setOrderSuccess(createdOrder);
    } catch (err) {
      console.error(err);
      alertError(
        "Order Placement Failed",
        err.message || "An error occurred while placing your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <p className="font-serif text-sm">Preparing Secure Concierge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Concierge Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-1">
            Complete Your Royal Acquisition
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Secure, encrypted order placement with verified Pakistani payment
            gateways.
          </p>
        </div>

        {/* Order Success Modal */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-obsidian-900 border border-gold/50 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl text-center space-y-5"
              >
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">
                    Acquisition Confirmed
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory mt-1">
                    Order #{orderSuccess.orderNumber}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                    Thank you,{" "}
                    <strong className="text-white">
                      {orderSuccess.customerName}
                    </strong>
                    . Your luxury order has been registered and our perfume
                    masters are packaging your flacons.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-950/80 border border-neutral-800 text-xs text-left space-y-1.5">
                  <div className="flex justify-between text-neutral-400">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-gold">
                      {orderSuccess.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : orderSuccess.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Total Amount:</span>
                    <span className="font-semibold text-ivory">
                      PKR {Number(orderSuccess.total).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Est. Delivery:</span>
                    <span className="font-semibold text-neutral-200">
                      2–3 Business Days
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/dashboard"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow text-center"
                  >
                    View in My Dashboard &rarr;
                  </Link>
                  <Link
                    href="/"
                    className="w-full py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-xs text-center hover:text-white"
                  >
                    Return to Home
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {items.length === 0 && !orderSuccess ? (
          <div className="text-center py-20 bg-obsidian-900/40 rounded-3xl border border-neutral-800 max-w-md mx-auto p-8">
            <p className="text-sm text-neutral-300 font-serif mb-4">
              Your bag is empty. Please select perfumes before checking out.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-full bg-gold text-obsidian-950 font-semibold text-xs uppercase tracking-wider"
            >
              Explore Boutique
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
          >
            {/* Left Column: Delivery Address & Payment Methods (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Delivery Address Form */}
              <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 shadow-xl backdrop-blur-md space-y-5">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Truck size={18} className="text-gold" />
                  <h3 className="font-serif text-lg font-bold text-ivory">
                    Delivery Address (Pakistan)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                 <div>
                  <label className="block text-neutral-400 mb-1.5 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter Full Name"
                    className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                  />
                </div>
                  <div>
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter Phone Number (WhatsApp) *"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      Email Address (For Order Tracking)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter Email Address (For Order Tracking)"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      Complete Street Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder=" Enter Complete Street Address"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter Your City"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      Province
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    >
                      <option value="Sindh">Sindh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Khyber Pakhtunkhwa">
                        Khyber Pakhtunkhwa
                      </option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital Territory">
                        Islamabad Capital Territory
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      Delivery Special Instructions
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Call before delivery, handle delicate glass flacon with care"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
                  Payment Methods Section
                  ============================================================ */}
              <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-gold/30 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gold" />
                    <h3 className="font-serif text-lg font-bold text-ivory">
                      Payment Method (Pakistan)
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gold bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                    100% Direct &amp; Verified
                  </span>
                </div>

                {/* Method Options Radio Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* COD */}
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      paymentMethod === "COD"
                        ? "bg-gold/15 border-gold shadow-gold-glow"
                        : "bg-obsidian-950 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote
                        size={18}
                        className={
                          paymentMethod === "COD"
                            ? "text-gold"
                            : "text-neutral-400"
                        }
                      />
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "COD"
                            ? "border-gold bg-gold text-obsidian-950"
                            : "border-neutral-600"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="h-2 w-2 rounded-full bg-obsidian-950" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-bold text-xs text-ivory block">
                        Cash on Delivery
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        COD — Pay at Door
                      </span>
                    </div>
                  </div>

                  {/* Easypaisa */}
                  <div
                    onClick={() => setPaymentMethod("EASYPAISA")}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      paymentMethod === "EASYPAISA"
                        ? "bg-gold/15 border-gold shadow-gold-glow"
                        : "bg-obsidian-950 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone
                        size={18}
                        className={
                          paymentMethod === "EASYPAISA"
                            ? "text-gold"
                            : "text-neutral-400"
                        }
                      />
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "EASYPAISA"
                            ? "border-gold bg-gold text-obsidian-950"
                            : "border-neutral-600"
                        }`}
                      >
                        {paymentMethod === "EASYPAISA" && (
                          <div className="h-2 w-2 rounded-full bg-obsidian-950" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-bold text-xs text-ivory block">
                        Easypaisa
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Mobile Wallet
                      </span>
                    </div>
                  </div>

                  {/* JazzCash */}
                  <div
                    onClick={() => setPaymentMethod("JAZZCASH")}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      paymentMethod === "JAZZCASH"
                        ? "bg-gold/15 border-gold shadow-gold-glow"
                        : "bg-obsidian-950 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone
                        size={18}
                        className={
                          paymentMethod === "JAZZCASH"
                            ? "text-gold"
                            : "text-neutral-400"
                        }
                      />
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "JAZZCASH"
                            ? "border-gold bg-gold text-obsidian-950"
                            : "border-neutral-600"
                        }`}
                      >
                        {paymentMethod === "JAZZCASH" && (
                          <div className="h-2 w-2 rounded-full bg-obsidian-950" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-bold text-xs text-ivory block">
                        JazzCash
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Instant Transfer
                      </span>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-gold/15 border-gold shadow-gold-glow"
                        : "bg-obsidian-950 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2
                        size={18}
                        className={
                          paymentMethod === "BANK_TRANSFER"
                            ? "text-gold"
                            : "text-neutral-400"
                        }
                      />
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "BANK_TRANSFER"
                            ? "border-gold bg-gold text-obsidian-950"
                            : "border-neutral-600"
                        }`}
                      >
                        {paymentMethod === "BANK_TRANSFER" && (
                          <div className="h-2 w-2 rounded-full bg-obsidian-950" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-bold text-xs text-ivory block">
                        Bank Transfer
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Slip Upload
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions Details */}
                <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 text-xs space-y-3">
                  {paymentMethod === "COD" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-emerald-400" />
                        <p className="font-semibold text-emerald-400">
                          Cash on Delivery Instructions
                        </p>
                      </div>
                      <ul className="text-[11px] text-neutral-300 leading-relaxed space-y-1.5 list-disc list-inside">
                        <li>
                          Pay in cash when your order arrives.<strong className="text-ivory"> </strong>                 
                        </li>
                        <li>
                          Give the delivery rider the <strong className="text-gold"> exact amount of PKR {total.toLocaleString()}.</strong>
                        </li>
                        <li>
                          Advance Payment:<strong className="text-emerald-400"> 0% (No advance required)</strong>
                        </li>
                        <li>
                          Order Confirmation: A <strong className="text-ivory"> WhatsApp call </strong> may be made.
                        </li>
                        <li>
                          Delivery Charges: Karachi: PKR 120 | <strong className="text-emerald-400"> All Pakistan (excluding Karachi): PKR 320.</strong>
                        </li>
                      </ul>
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed">
                         <strong>Availability:</strong>  Available in major cities across Pakistan. For remote areas, we’ll contact you to confirm your order.
                      </div>
                    </div>
                  )}

                  {paymentMethod === "EASYPAISA" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-gold">
                        Easypaisa Payment Details:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-neutral-300">
                        <div>
                          Account Title:{" "}
                          <strong className="text-white">
                            Maison Charcoal Perfumes
                          </strong>
                        </div>
                        <div>
                          Account / Mobile:{" "}
                          <strong className="text-gold font-mono">
                            03148759109
                          </strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Please send PKR {total.toLocaleString()} to the
                        Easypaisa number above. Once sent, enter your 10-digit
                        Transaction ID (TID) below:
                      </p>
                      {/* ✅ Yahan sirf numbers allow kiye hain aur required lagaya hai */}
                      <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"   
                      required={paymentMethod === "EASYPAISA"}
                      maxLength={11}
                      value={paymentReference}
                      onChange={(e) => {
                        // ✅ Sirf numbers allow karega
                        const numericValue = e.target.value.replace(/[^0-9]/g, "");
                        setPaymentReference(numericValue);
                      }}
                      placeholder="Enter 11-digit Easypaisa TID"
                      className="w-full bg-obsidian-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold font-mono"
                    />
                    </div>
                  )}

                  {paymentMethod === "JAZZCASH" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-gold">
                        JazzCash Payment Details:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-neutral-300">
                        <div>
                          Account Title:{" "}
                          <strong className="text-white">
                            Maison Charcoal Perfumes
                          </strong>
                        </div>
                        <div>
                          Account / Mobile:{" "}
                          <strong className="text-gold font-mono">
                            03148759109
                          </strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Send PKR {total.toLocaleString()} to the JazzCash mobile
                        number above, then input your JazzCash Reference /
                        Transaction ID below:
                      </p>
                     
                      <input
                        type="text"
                        inputMode="numeric" // ✅ Mobile par number keypad khulega
                        pattern="[0-9]*"    // ✅ Sirf numbers allow karega
                        required={paymentMethod === "JAZZCASH"}
                        maxLength={11}
                        value={paymentReference}
                        onChange={(e) => {
                          // ✅ Sirf numbers allow karega
                          const numericValue = e.target.value.replace(/[^0-9]/g, "");
                          setPaymentReference(numericValue);
                        }}
                        placeholder="Enter 11-digit JazzCash TID"
                        className="w-full bg-obsidian-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold font-mono"
                      />
                    </div>
                  )}

                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="space-y-3">
                      <p className="font-semibold text-gold">
                        Official Bank Account Information:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300 bg-obsidian-900/60 p-3 rounded-xl border border-neutral-800">
                        <div>
                          Bank Name:{" "}
                          <strong className="text-white">Bank Al Habib</strong>
                        </div>
                        <div>
                          Account Title:{" "}
                          <strong className="text-white">
                            Maison Charcoal (Pvt) Ltd
                          </strong>
                        </div>
                        <div>
                          Account Number:{" "}
                          <strong className="text-gold font-mono">
                            03148759109
                          </strong>
                        </div>
                        <div>
                          IBAN:{" "}
                          <strong className="text-gold font-mono text-[10px]">
                            PK78BAHL03148759109001
                          </strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-neutral-300">
                          Upload Transfer Receipt / Screenshot: *
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-obsidian-950 transition-colors text-xs font-semibold">
                            <Upload size={14} />
                            <span>Choose Receipt File</span>
                          
                           <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            required={paymentMethod === "BANK_TRANSFER"} 
                            className="hidden"
                          />
                          </label>
                          {proofImage && (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                              <CheckCircle2 size={13} /> Receipt Attached
                            </span>
                          )}
                        </div>
                        {proofImage && (
                          <div className="relative h-20 w-32 rounded-lg overflow-hidden border border-gold/40 mt-2">
                            <Image
                              src={proofImage}
                              alt="Receipt preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/90 border border-gold/30 shadow-2xl backdrop-blur-xl space-y-6">
                <h3 className="font-serif text-lg font-bold text-ivory border-b border-neutral-800 pb-3">
                  Summary &amp; Order Items ({items.length})
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.itemKey || item.id}
                      className="flex items-center gap-3 text-xs pb-3 border-b border-neutral-800/60"
                    >
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-obsidian-950 shrink-0">
                        <Image
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ivory truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Qty: {item.quantity} &bull; {item.size}
                        </p>
                      </div>
                      <span className="font-bold text-gold shrink-0">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs border-t border-neutral-800 pt-3">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-ivory font-semibold">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>VIP Express Delivery</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          FREE (Above 15K)
                        </span>
                      ) : (
                        `PKR ${shippingCost}`
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between text-base font-bold text-gold">
                    <span>Total Payable</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin" />
                      Securing Order...
                    </span>
                  ) : (
                    <>
                      <span>
                        Place Luxury Order (PKR {total.toLocaleString()})
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                  Upon placing your order, our administration team will review
                  and clear your payment. You will receive an immediate
                  notification in your User Dashboard once verified!
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}