// app/product/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  Droplets,
  Plus,
  Minus,
  Check,
  ChevronRight,
} from "lucide-react";
import { addToCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";
import { alertAddToCart } from "@/lib/alerts";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct(data);

        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        } else {
          setSelectedVariant({
            id: null,
            size: data.size || "100ml",
            price: data.price,
            discountPrice: data.discountPrice,
            stock: data.stock,
          });
        }

        const relRes = await fetch(
          `/api/products?category=${data.category || "men"}&limit=4`
        );
        const relData = await relRes.json();
        setRelatedProducts(
          (relData.products || []).filter((p) => p.id !== data.id).slice(0, 4)
        );
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-sm tracking-widest uppercase">
            Opening Fragrance Flacon...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="font-serif text-2xl text-ivory mb-2">
          Fragrance Not Found
        </h2>
        <p className="text-xs text-neutral-400 mb-6 max-w-sm">
          The requested perfume flacon does not exist or may have been archived
          into our private reserve.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full bg-gold text-obsidian-950 text-xs font-semibold uppercase tracking-wider"
        >
          Return to Boutique
        </Link>
      </div>
    );
  }

  // ✅ Images normalize karein (string ya object dono handle karein)
  const rawImages = product.images || [];
  const images = rawImages
    .map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object" && typeof img.url === "string") {
        return img.url;
      }
      return null;
    })
    .filter(Boolean);

  if (images.length === 0) {
    images.push(
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=85&auto=format&fit=crop"
    );
  }

  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: null,
            size: product.size || "100ml",
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
          },
        ];

  // Current active variant's exact price and stock
  const activeVariant = selectedVariant || variants[0];
  const currentPrice =
    activeVariant && activeVariant.discountPrice && Number(activeVariant.discountPrice) > 0
      ? Number(activeVariant.discountPrice)
      : Number(activeVariant?.price ?? product.price);

  const originalPrice = Number(activeVariant?.price ?? product.price);
  const hasDiscount = currentPrice < originalPrice;
  const currentStock = activeVariant?.stock !== undefined ? Number(activeVariant.stock) : Number(product.stock || 0);

  // Cart object accurately bound to the active variant
  const productForCart = {
    ...product,
    images: images,
    price: Number(activeVariant?.price ?? product.price),
    discountPrice: activeVariant?.discountPrice ? Number(activeVariant.discountPrice) : null,
    size: activeVariant?.size || product.size || "100ml",
    selectedVariantId: activeVariant?.id || null,
    stock: currentStock,
    variants: variants,
  };

  const handleAddToCart = async () => {
    if (currentStock <= 0) {
      alertToast(`Sorry, ${activeVariant?.size || "this size"} is currently out of stock.`, "error");
      return;
    }

    addToCart(
      productForCart,
      quantity,
      activeVariant?.size || product.size
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);

    const viewCart = await alertAddToCart({
      name: `${product.name} (${activeVariant?.size || product.size})`,
      price: currentPrice * quantity,
      image: images[0],
    });
    if (viewCart) {
      router.push("/cart");
    }
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) {
      alertToast(`Sorry, ${activeVariant?.size || "this size"} is currently out of stock.`, "error");
      return;
    }

    addToCart(
      productForCart,
      quantity,
      activeVariant?.size || product.size
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-neutral-600" />
          <Link href="/shop" className="hover:text-gold transition-colors">
            Boutique
          </Link>
          <ChevronRight size={12} className="text-neutral-600" />
          <span className="text-gold capitalize">
            {product.category || "Perfume"}
          </span>
          <ChevronRight size={12} className="text-neutral-600" />
          <span className="text-ivory font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={activeImgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden bg-obsidian-900 border border-gold/30 shadow-2xl group"
            >
              <Image
                src={images[activeImgIdx] || images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent pointer-events-none" />

              {product.isBestSeller && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold text-obsidian-950 shadow-gold-glow flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Best Seller Flacon
                </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                      activeImgIdx === idx
                        ? "border-gold shadow-gold-glow scale-105"
                        : "border-neutral-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-[0.2em] text-gold font-semibold">
                  {product.brand || "Maison Charcoal Haute Parfumerie"}
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-xs text-amber-200">
                    {product.rating ? product.rating.toFixed(1) : "5.0"}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    ({product.reviewCount || 1} connoisseurs)
                  </span>
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-xs text-neutral-400 mt-2">
                Classification:{" "}
                <span className="text-neutral-200 font-medium">
                  {product.fragranceType || "Eau De Parfum"}
                </span>{" "}
                &bull; SKU:{" "}
                <span className="font-mono text-gold/80">
                  {product.sku || "MC-VIP-001"}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-neutral-800 flex items-baseline gap-4">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-gold">
                PKR {Number(currentPrice).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm sm:text-base text-neutral-500 line-through">
                  PKR {Number(originalPrice).toLocaleString()}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider ml-auto">
                  Save PKR {(originalPrice - currentPrice).toLocaleString()}
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
              <p>{product.description}</p>
              <p className="text-neutral-400">
                Crafted using aged botanical distillates and matured for 90 days
                to achieve unparalleled smoothness, rich projection, and
                lingering warmth.
              </p>
            </div>

            {product.notes && (
              <div className="p-5 rounded-2xl bg-obsidian-900/60 border border-gold/20 space-y-3">
                <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-gold">
                  Olfactory Structure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                      Top Notes
                    </span>
                    <span className="text-ivory font-medium">
                      {Array.isArray(product.notes.top)
                        ? product.notes.top.join(", ")
                        : "Calabrian Bergamot, Saffron"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                      Heart Notes
                    </span>
                    <span className="text-ivory font-medium">
                      {Array.isArray(product.notes.heart)
                        ? product.notes.heart.join(", ")
                        : "Taif Rose, Ambergris"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                      Base Notes
                    </span>
                    <span className="text-ivory font-medium">
                      {Array.isArray(product.notes.base)
                        ? product.notes.base.join(", ")
                        : "Assam Agarwood, Vanilla"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                  Select Flacon Volume
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((variant, idx) => {
                    const isSelected =
                      selectedVariant?.id === variant.id ||
                      (selectedVariant?.size === variant.size &&
                        selectedVariant?.id === null);
                    const variantPrice =
                      variant.discountPrice || variant.price;
                    return (
                      <button
                        key={variant.id || idx}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border flex flex-col items-center gap-0.5 ${
                          isSelected
                            ? "bg-gold/20 border-gold text-gold shadow-gold-glow"
                            : "bg-obsidian-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <span className="font-bold">{variant.size}</span>
                        <span className="text-[10px] opacity-80">
                          PKR {Number(variantPrice).toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Quantity:
              </span>
              <div className="flex items-center border border-neutral-700 rounded-xl bg-obsidian-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-neutral-400 hover:text-gold"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold text-xs text-ivory">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-neutral-400 hover:text-gold"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-neutral-400">
                {selectedVariant?.stock > 0
                  ? "In Stock • Ready for Instant Dispatch"
                  : "Limited Stock"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="py-4 px-6 rounded-xl border border-gold text-gold font-bold text-xs uppercase tracking-widest hover:bg-gold/15 active:bg-gold/20 flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
              >
                {addedToast ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400">Added to VIP Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                className="py-4 px-6 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Zap size={16} className="fill-obsidian-950" />
                <span>Buy Now (Instant Checkout)</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800 text-center">
              <div className="flex flex-col items-center gap-1 p-2">
                <Truck size={18} className="text-gold" />
                <span className="text-[11px] font-semibold text-ivory">
                  Express Delivery
                </span>
                <span className="text-[10px] text-neutral-400">
                  2–3 Days in Pakistan
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <ShieldCheck size={18} className="text-gold" />
                <span className="text-[11px] font-semibold text-ivory">
                  100% Authentic
                </span>
                <span className="text-[10px] text-neutral-400">
                  Seal of Excellence
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <Droplets size={18} className="text-gold" />
                <span className="text-[11px] font-semibold text-ivory">
                  Alcohol Free
                </span>
                <span className="text-[10px] text-neutral-400">
                  Attar Options
                </span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-neutral-800">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                You May Also Admire
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
                Complementary Luxury Scents
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}