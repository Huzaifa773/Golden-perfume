// components/ProductCard.tsx
"use client";

import { useState, useRef, useCallback } from "react";
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
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // 3D Tilt interactive state (Task 4)
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const images = normalizeImages(product.images);
  const currentImg = images[0];

  // Dynamic variants from MySQL (Task 2)
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [];

  const hasVariants = variants.length > 0;
  const activeVariant = hasVariants
    ? variants[selectedVariantIdx] || variants[0]
    : null;

  // Strict binding: size ↔ price ↔ stock
  const displayPrice = activeVariant
    ? activeVariant.discountPrice && Number(activeVariant.discountPrice) > 0
      ? Number(activeVariant.discountPrice)
      : Number(activeVariant.price)
    : product.discountPrice && Number(product.discountPrice) > 0
    ? Number(product.discountPrice)
    : Number(product.price);

  const originalPrice = activeVariant
    ? Number(activeVariant.price)
    : Number(product.price);

  const hasDiscount = Boolean(originalPrice && displayPrice < originalPrice);

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : null;

  const displaySize = activeVariant
    ? activeVariant.size
    : product.size || "100ml";

  const stockAvailable = activeVariant
    ? Number(activeVariant.stock)
    : Number(product.stock ?? 10);

  const isOutOfStock = stockAvailable <= 0;

  // Quick Add handler: accurately passes the active variant's size to bind exact price/stock
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      alertToast(`"${product.name}" (${displaySize}) is currently out of stock`, "info");
      return;
    }

    addToCart(product, 1, displaySize);
    setAdded(true);
    alertToast(`"${product.name}" (${displaySize}) added to your bag`, "success");
    setTimeout(() => setAdded(false), 2000);
  };

  // High performance CSS 3D Tilt Calculations (Task 4)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation between -8deg and +8deg
    const rX = ((mouseY / height) - 0.5) * -16;
    const rY = ((mouseX / width) - 0.5) * 16;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.16,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const productUrl = `/product/${product.slug || product.id}`;

  const categoryLabel =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "Eau De Parfum";

  return (
    <div
      style={{ perspective: "1000px" }}
      className="relative w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 0.1s ease-out"
            : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-obsidian-900/90 to-obsidian-950/95 border border-neutral-800/80 hover:border-gold/50 shadow-luxury hover:shadow-gold-card backdrop-blur-md overflow-hidden will-change-transform"
      >
        {/* Dynamic Holographic Gold Light Sheen Overlay (Task 4) */}
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(212, 175, 55, ${glarePos.opacity}), transparent 70%)`,
          }}
        />

        {/* Ambient Gold Border Glow */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Merchandising Badges with 3D Parallax */}
        <div
          style={{ transform: "translateZ(35px)" }}
          className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start pointer-events-none"
        >
          {discountPercentage && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-900/85 text-rose-200 border border-rose-500/40 shadow-sm backdrop-blur-md">
              SAVE {discountPercentage}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/40 shadow-gold-glow backdrop-blur-md flex items-center gap-1">
              <Sparkles size={10} />
              BEST SELLER
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900/90 text-neutral-400 border border-neutral-700 backdrop-blur-md">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Product Image Stage with 3D Depth */}
        <Link
          href={productUrl}
          style={{ transform: "translateZ(15px)" }}
          className="relative block w-full aspect-[4/5] overflow-hidden bg-obsidian-950"
        >
          <img
            src={currentImg}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
            className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />

          {/* Hover Reveal Badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-obsidian-950/85 text-gold border border-gold/40 backdrop-blur-md shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye size={13} />
              View Flacon
            </span>
          </div>
        </Link>

        {/* Content Container */}
        <div
          style={{ transform: "translateZ(20px)" }}
          className="p-4 sm:p-5 flex flex-col flex-1 justify-between"
        >
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

            {/* Interactive Size Selector on Card (Task 2) */}
            {hasVariants && variants.length > 1 && (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                {variants.map((v, idx) => {
                  const isSelected = idx === selectedVariantIdx;
                  return (
                    <button
                      key={v.id || `${v.size}-${idx}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantIdx(idx);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        isSelected
                          ? "bg-gold text-obsidian-950 font-semibold shadow-gold-glow"
                          : "bg-obsidian-800/80 text-neutral-300 hover:text-gold hover:bg-obsidian-700/80 border border-neutral-800"
                      }`}
                      title={`Select ${v.size} (PKR ${Number(v.discountPrice || v.price).toLocaleString()})`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing & Quick Add Section */}
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
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <span className="font-medium text-neutral-300">{displaySize}</span>
                {hasVariants && variants.length > 1 && (
                  <span className="text-gold/60">({variants.length} sizes)</span>
                )}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                isOutOfStock
                  ? "border-neutral-800 bg-neutral-900/50 text-neutral-600 cursor-not-allowed"
                  : added
                  ? "bg-emerald-500 text-obsidian-950 border-emerald-400 shadow-md"
                  : "border-gold/50 bg-gold/10 text-gold hover:bg-gold hover:text-obsidian-950 hover:shadow-gold-glow"
              }`}
              title={isOutOfStock ? "Out of stock" : `Add ${displaySize} to bag`}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}