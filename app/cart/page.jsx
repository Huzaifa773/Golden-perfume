// app/cart/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { alertToast, alertConfirm } from "@/lib/alerts";

export default function CartPage() {
  const { items, totalCount, subtotal, updateQuantity, removeItem, isLoaded } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <p className="font-serif tracking-widest text-sm">Opening VIP Shopping Bag...</p>
      </div>
    );
  }

  const freeShippingThreshold = 15000;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 350;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "LUXURY10") {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setPromoApplied(true);
      setPromoError("");
      alertToast("Privilege code applied: 10% discount granted", "success");
    } else {
      setPromoError("Invalid privilege code. Try LUXURY10");
      alertToast("Invalid privilege code. Try LUXURY10", "error");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Boutique Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-1">
            Your Selected Fragrances
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review your signature flacons before proceeding to secure concierge checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-obsidian-900/60 border border-neutral-800 max-w-lg mx-auto p-8">
            <div className="h-16 w-16 mx-auto rounded-full bg-gold/15 text-gold flex items-center justify-center mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-serif text-xl font-bold text-ivory mb-2">
              Your Bag is Currently Empty
            </h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Explore our collection of French perfumes and pure alcohol-free attars to add your first luxury flacon.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 text-xs font-bold uppercase tracking-wider hover:shadow-gold-glow"
            >
              <span>Explore Boutique</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.itemKey || item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-5 rounded-2xl bg-obsidian-900/80 border border-neutral-800 hover:border-gold/40 transition-colors flex gap-4 sm:gap-6 items-center"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-obsidian-950 border border-neutral-800 shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Title & Size */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-semibold text-ivory truncate">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-gold/80 mt-0.5">
                      {item.size || "100ml Flacon"}
                    </p>
                    <div className="text-xs font-bold text-ivory mt-1">
                      PKR {Number(item.price).toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity Increment/Decrement */}
                  <div className="flex items-center border border-neutral-700 rounded-lg bg-obsidian-950 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.itemKey || item.id, item.quantity - 1)}
                      className="p-1.5 sm:p-2 text-neutral-400 hover:text-gold"
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-ivory">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.itemKey || item.id, item.quantity + 1)}
                      className="p-1.5 sm:p-2 text-neutral-400 hover:text-gold"
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={async () => {
                      const confirmed = await alertConfirm(
                        "Remove Flacon?",
                        `Remove "${item.name}" from your bag?`,
                        "Remove",
                        "Keep"
                      );
                      if (confirmed) {
                        removeItem(item.itemKey || item.id);
                        alertToast(`"${item.name}" removed from bag`, "info");
                      }
                    }}
                    className="p-2 text-neutral-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}

              <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
                <Link href="/shop" className="text-gold hover:underline">
                  &larr; Continue Exploring Fragrances
                </Link>
                <span>{totalCount} Total Items in Bag</span>
              </div>
            </div>

            {/* Order Summary & Checkout Card */}
            <div className="rounded-3xl bg-obsidian-900/90 border border-gold/30 p-6 backdrop-blur-xl shadow-2xl space-y-6">
              <h3 className="font-serif text-lg font-bold text-ivory border-b border-neutral-800 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-ivory">
                    PKR {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-300">
                  <span>VIP Delivery</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE (Above PKR 15K)</span>
                    ) : (
                      `PKR ${shippingCost}`
                    )}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-rose-300">
                    <span>Privilege Discount (10%)</span>
                    <span>- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-800 flex justify-between text-sm sm:text-base font-bold text-gold">
                  <span>Total Amount</span>
                  <span>PKR {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <form onSubmit={applyPromo} className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Tag size={12} className="text-gold" />
                  Have a Privilege Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. LUXURY10"
                    className="flex-1 bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs uppercase text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gold/20 text-gold border border-gold/40 text-xs font-semibold hover:bg-gold hover:text-obsidian-950 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-[11px] text-emerald-400">Privilege code LUXURY10 applied successfully!</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-400">{promoError}</p>
                )}
              </form>

              {/* Checkout Action Button */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>

              {/* Security Note */}
              <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400 justify-center">
                <ShieldCheck size={14} className="text-gold" />
                <span>Easypaisa &bull; JazzCash &bull; Direct Bank Transfer</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
