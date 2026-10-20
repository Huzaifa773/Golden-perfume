// components/ProductCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Star, Sparkles, Check } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { alertToast } from "@/lib/alerts";

export type ProductVariant = {
  id?: string;
  size: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  brand?: string;
  size?: string;
  category?: any;
  targetPage?: string;
  images?: any[];
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  stock?: number;
  notes?: any;
  fragranceType?: string;
  sku?: string;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
};

type ProductCardProps = {
  product: ProductCardData;
};

const PLACEHOLDER_IMAGE = "/images/products/placeholder.jpg";

function normalizeImages(input?: any[]): string[] {
  if (!Array.isArray(input) || input.length === 0) return [PLACEHOLDER_IMAGE];

  const urls = input
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && typeof item.url === "string")
        return item.url;
      return null;
    })
    .filter((url): url is string => Boolean(url && url.trim().length > 0));

  return urls.length > 0 ? urls : [PLACEHOLDER_IMAGE];
}

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const images = normalizeImages(product.images);
  const currentImg = images[0];

  // Agar variants mojood hain, toh sab se sasti price dikhayein
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const displayPrice = hasVariants
    ? Math.min(...variants.map((v) => v.discountPrice ?? v.price))
    : product.discountPrice ?? product.price;

  const originalPrice = hasVariants
    ? Math.min(...variants.map((v) => v.price))
    : product.price;

  const hasDiscount = displayPrice < originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : null;

  const displaySize = hasVariants
    ? `${variants.length} size${variants.length > 1 ? "s" : ""}`
    : product.size || "100ml Flacon";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    alertToast(`"${product.name}" added to your bag`, "success");
    setTimeout(() => setAdded(false), 2000);
  };

  const productUrl = `/product/${product.slug || product.id}`;

  const categoryLabel =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "Eau De Parfum";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-obsidian-900/90 to-obsidian-950/95 border border-neutral-800/80 hover:border-gold/50 shadow-luxury hover:shadow-gold-card transition-all duration-500 overflow-hidden backdrop-blur-md"
    >
      <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercentage && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-900/80 text-rose-200 border border-rose-500/40 shadow-sm backdrop-blur-md">
            SAVE {discountPercentage}%
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/40 shadow-gold-glow backdrop-blur-md flex items-center gap-1">
            <Sparkles size={10} />
            BEST SELLER
          </span>
        )}
      </div>

      <Link
        href={productUrl}
        className="relative block w-full aspect-[4/5] overflow-hidden bg-obsidian-950"
      >
        <img
          src={currentImg}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
          className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-obsidian-950/80 text-gold border border-gold/40 backdrop-blur-md shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={13} />
            View Details
          </span>
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="uppercase tracking-widest text-gold/80 font-medium">
              {categoryLabel}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-neutral-300 text-xs">
                {product.rating ? product.rating.toFixed(1) : "5.0"}
              </span>
            </div>
          </div>

          <Link href={productUrl}>
            <h3 className="font-serif text-base sm:text-lg font-semibold text-ivory group-hover:text-gold transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {product.description ||
              "A masterfully blended luxury fragrance crafted with rare natural essences."}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-gold tracking-tight">
                  PKR {Number(displayPrice).toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 line-through">
                  PKR {Number(originalPrice).toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-bold text-gold tracking-tight">
                PKR {Number(displayPrice).toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-neutral-400">{displaySize}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
              added
                ? "bg-emerald-500 text-obsidian-950 border-emerald-400 shadow-md"
                : "border-gold/50 bg-gold/10 text-gold hover:bg-gold hover:text-obsidian-950 hover:shadow-gold-glow"
            }`}
            title="Add to cart"
            aria-label="Add to cart"
          >
            {added ? <Check size={16} /> : <ShoppingBag size={16} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}