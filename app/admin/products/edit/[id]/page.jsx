// app/admin/products/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Trash2,
  Save,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { alertConfirm, alertToast, alertError } from "@/lib/alerts";

// Preset Luxury Fragrance Images library (matching Add Product 1:1)
const PRODUCT_IMAGES = [
  "/images/products/p1.jpg",
  "/images/products/p2.jpg",
  "/images/products/p3.jpg",
  "/images/products/p4.jpg",
  "/images/products/p5.jpg",
  "/images/products/p6.jpg",
  "/images/products/p7.jpg",
  "/images/products/p8.jpg",
  "/images/products/p9.jpg",
  "/images/products/p10.jpg",
  "/images/products/p11.jpg",
  "/images/products/p12.jpg",
  "/images/products/p13.jpg",
  "/images/products/p14.jpg",
  "/images/products/p15.jpg",
  "/images/products/p16.jpg",
  "/images/products/p17.jpg",
];

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountPrice: "",
    category: "men",
    targetPage: "men",
    brand: "Maison Charcoal",
    size: "100ml Eau De Parfum",
    fragranceType: "EAU_DE_PARFUM",
    stock: "35",
    description: "",
    topNotes: "",
    heartNotes: "",
    baseNotes: "",
    isFeatured: false,
    isBestSeller: false,
    primaryImage: "/images/products/p1.jpg",
    secondaryImage: "/images/products/p2.jpg",
  });

  // Variants State: [{ size, price, discountPrice, stock }]
  const [variants, setVariants] = useState([
    { size: "", price: "", discountPrice: "", stock: "0" },
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Product record not found");
        const p = await res.json();

        // Parse olfactory notes
        let top = "";
        let heart = "";
        let base = "";
        if (p.notes) {
          top = Array.isArray(p.notes.top) ? p.notes.top.join(", ") : (p.notes.top || "");
          heart = Array.isArray(p.notes.heart) ? p.notes.heart.join(", ") : (p.notes.heart || "");
          base = Array.isArray(p.notes.base) ? p.notes.base.join(", ") : (p.notes.base || "");
        }

        const images = Array.isArray(p.images) ? p.images : [];
        const primary = images[0] || "/images/products/p1.jpg";
        const secondary = images[1] || "";

        setFormData({
          name: p.name || "",
          price: p.price !== undefined && p.price !== null ? String(p.price) : "",
          discountPrice: p.discountPrice ? String(p.discountPrice) : "",
          category: (p.categorySlug || p.category || "men").toLowerCase(),
          targetPage: p.targetPage || p.category || "shop",
          brand: p.brand || "Maison Charcoal",
          size: p.size || "100ml Eau De Parfum",
          fragranceType: p.fragranceType || "EAU_DE_PARFUM",
          stock: String(p.stock ?? 20),
          description: p.description || "",
          topNotes: top || "Calabrian Bergamot, Saffron",
          heartNotes: heart || "Taif Rose, Ambergris",
          baseNotes: base || "Assam Agarwood, Mysore Sandalwood",
          isFeatured: Boolean(p.isFeatured),
          isBestSeller: Boolean(p.isBestSeller),
          primaryImage: primary,
          secondaryImage: secondary,
        });

        // Populate variants: load exact DB variants
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          setVariants(
            p.variants.map((v) => ({
              size: v.size || "",
              price: v.price !== undefined && v.price !== null ? String(v.price) : "",
              discountPrice: v.discountPrice ? String(v.discountPrice) : "",
              stock: String(v.stock ?? 0),
            }))
          );
        } else {
          // Fallback if legacy product had no separate variants
          setVariants([
            {
              size: p.size || "100ml",
              price: String(p.price || ""),
              discountPrice: p.discountPrice ? String(p.discountPrice) : "",
              stock: String(p.stock ?? 20),
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load product for editing:", err);
        alertError("Load Failed", err.message || "Failed to load product data.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---------- VARIANT ACTIONS ----------
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "", price: "", discountPrice: "", stock: "0" },
    ]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i === index) {
          const updated = { ...v, [field]: value };
          // If editing variant 0's size or price, synchronize formData base values
          if (index === 0 && (field === "size" || field === "price")) {
            setFormData((f) => ({
              ...f,
              ...(field === "size" && value.trim() ? { size: value } : {}),
              ...(field === "price" && value ? { price: value } : {}),
            }));
          }
          return updated;
        }
        return v;
      })
    );
  };

  // ---------- IMAGE UPLOAD HANDLERS ----------
  const handlePrimaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alertToast("Image size must be under 5MB", "error");
      return;
    }

    setUploadingPrimary(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFormData((prev) => ({ ...prev, primaryImage: data.url }));
      alertToast("Primary flacon image uploaded successfully", "success");
    } catch (err) {
      alertError("Upload Failed", err.message);
    } finally {
      setUploadingPrimary(false);
    }
  };

  const handleSecondaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alertToast("Image size must be under 5MB", "error");
      return;
    }

    setUploadingSecondary(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFormData((prev) => ({ ...prev, secondaryImage: data.url }));
      alertToast("Secondary flacon image uploaded successfully", "success");
    } catch (err) {
      alertError("Upload Failed", err.message);
    } finally {
      setUploadingSecondary(false);
    }
  };

  // ---------- SUBMIT MODIFICATIONS ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alertToast("Product Name is required", "error");
      return;
    }

    // Filter valid variants
    const validVariants = variants
      .filter((v) => v.size && v.size.trim() && v.price && String(v.price).trim())
      .map((v, i) => ({
        size: v.size.trim(),
        price: Number(v.price),
        discountPrice: v.discountPrice && Number(v.discountPrice) > 0 ? Number(v.discountPrice) : null,
        stock: Number(v.stock) || 0,
        position: i,
      }));

    if (validVariants.length === 0 && !formData.price) {
      alertToast("Please provide at least one variant size with price", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Gather images
      const images = [formData.primaryImage, formData.secondaryImage].filter(
        (img) => img && typeof img === "string" && img.trim().length > 0
      );

      // Parse notes
      const topArr = formData.topNotes ? formData.topNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const heartArr = formData.heartNotes ? formData.heartNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const baseArr = formData.baseNotes ? formData.baseNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];

      // Determine base price & size
      const primaryVariant = validVariants[0];
      const basePrice = primaryVariant ? primaryVariant.price : Number(formData.price);
      const baseDiscountPrice = primaryVariant
        ? primaryVariant.discountPrice
        : (formData.discountPrice ? Number(formData.discountPrice) : null);
      const baseSize = primaryVariant ? primaryVariant.size : formData.size;
      const totalStock = validVariants.length > 0
        ? validVariants.reduce((sum, v) => sum + v.stock, 0)
        : (Number(formData.stock) || 0);

      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || "Maison Charcoal",
        price: basePrice,
        discountPrice: baseDiscountPrice,
        category: formData.category,
        targetPage: formData.targetPage,
        size: baseSize,
        fragranceType: formData.fragranceType,
        stock: totalStock,
        description: formData.description.trim() || "An artisanal luxury formulation.",
        images: images.length > 0 ? images : ["/images/products/p1.jpg"],
        notes: {
          top: topArr,
          heart: heartArr,
          base: baseArr,
        },
        isFeatured: Boolean(formData.isFeatured),
        isBestSeller: Boolean(formData.isBestSeller),
        variants: validVariants,
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to update product");
      }

      setSuccess(true);
      alertToast("Product modifications saved to catalog", "success");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Save product error:", err);
      alertError("Update Failed", err.message || "Failed to save product modifications.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- DELETE PRODUCT ----------
  const handleDelete = async () => {
    const confirmed = await alertConfirm(
      "Remove Fragrance?",
      `Are you certain you wish to delete "${formData.name}" from the boutique reserve?`,
      "Yes, Delete",
      "Cancel",
      "warning"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      if (data.softDeleted) {
        alertToast("Product has historical orders — deactivated instead", "info");
      } else {
        alertToast(`"${formData.name}" permanently deleted`, "success");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      alertError("Deletion Failed", err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-gold" />
          <p className="font-serif text-sm tracking-widest uppercase">
            Opening Product Dossier...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold transition-colors mb-2"
          >
            <ArrowLeft size={13} />
            <span>Return to Admin Panel</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold/30 shadow-2xl backdrop-blur-xl gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                Master Catalog Control
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
                Edit Fragrance: {formData.name}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Delete Product</span>
            </button>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Product updated successfully! Returning to admin panel...</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 space-y-8 shadow-xl text-xs"
        >
          {/* ============================================================
              SECTION 1: GENERAL DETAILS
              ============================================================ */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-ivory border-b border-neutral-800 pb-2">
              1. General Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Royal Amber Sovereign"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Brand House
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Maison Charcoal"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Base Price in PKR *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 5500"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Base Discount Price (PKR)
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Base Total Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="20"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 2: CATEGORY & TARGET PAGE
              ============================================================ */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="font-serif text-base font-bold text-ivory border-b border-neutral-800 pb-2">
              2. Target Page &amp; Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold capitalize"
                >
                  <option value="men">Men&apos;s Perfume</option>
                  <option value="women">Women&apos;s Perfume</option>
                  <option value="attar">Attar / Oud (Alcohol-Free)</option>
                  <option value="unisex">Unisex Fragrance</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Target Boutique Page *
                </label>
                <select
                  name="targetPage"
                  value={formData.targetPage}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-gold/50 rounded-xl px-3 py-2.5 text-xs text-gold font-semibold focus:outline-none focus:border-gold"
                >
                  <option value="home">Home Page (/)</option>
                  <option value="shop">All Shop Boutique (/shop)</option>
                  <option value="men">Men Perfume Page (/men)</option>
                  <option value="women">Women Perfume Page (/women)</option>
                  <option value="attar">Attar / Oud Page (/attar)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Fragrance Type
                </label>
                <select
                  name="fragranceType"
                  value={formData.fragranceType}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="EAU_DE_PARFUM">Eau de Parfum</option>
                  <option value="EAU_DE_TOILETTE">Eau de Toilette</option>
                  <option value="EAU_DE_COLOGNE">Eau de Cologne</option>
                  <option value="PARFUM_EXTRAIT">Parfum Extrait</option>
                  <option value="ATTAR">Attar</option>
                  <option value="BODY_MIST">Body Mist</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Default Flacon Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g. 100ml Eau De Parfum"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 3: FLACON VARIANTS (MULTIPLE SIZES)
              MATCHING ADD PRODUCT 1:1 WITH BOUND SIZE ↔ PRICE ↔ STOCK
              ============================================================ */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <h3 className="font-serif text-base font-bold text-gold">
                  3. Flacon Variants (Multiple Sizes)
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Configure individual bottle sizes (50ml, 80ml, 100ml, 120ml) with their own dedicated price and stock.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-obsidian-950 text-xs font-bold hover:brightness-110 transition-all shadow-sm"
              >
                <Plus size={13} />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 hover:border-gold/30 transition-colors"
                >
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Size (e.g. 80ml, 120ml) *
                    </label>
                    <input
                      placeholder="e.g. 80ml"
                      required
                      value={v.size}
                      onChange={(e) => updateVariant(index, "size", e.target.value)}
                      className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Price in PKR *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="1000"
                      value={v.price}
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                      className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={v.discountPrice}
                      onChange={(e) => updateVariant(index, "discountPrice", e.target.value)}
                      className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={v.stock}
                      onChange={(e) => updateVariant(index, "stock", e.target.value)}
                      className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Remove Variant"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================
              SECTION 4: PRODUCT IMAGES (PRIMARY & SECONDARY)
              ============================================================ */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="font-serif text-base font-bold text-ivory border-b border-neutral-800 pb-2">
              4. Product Images (Primary &amp; Secondary)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* PRIMARY IMAGE */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-gold" />
                  <span className="text-gold font-semibold text-xs uppercase tracking-wider">
                    PRIMARY IMAGE
                  </span>
                </div>

                <select
                  value={formData.primaryImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryImage: e.target.value }))}
                  className="w-full bg-obsidian-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                >
                  {PRODUCT_IMAGES.map((img, idx) => (
                    <option key={img} value={img}>
                      Preset Image {idx + 1}
                    </option>
                  ))}
                  {formData.primaryImage && !PRODUCT_IMAGES.includes(formData.primaryImage) && (
                    <option value={formData.primaryImage}>Custom Uploaded Primary</option>
                  )}
                </select>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-obsidian-950 text-xs font-semibold transition-colors">
                  <Upload size={12} />
                  <span>{uploadingPrimary ? "Uploading..." : "Upload New File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryUpload}
                    className="hidden"
                    disabled={uploadingPrimary}
                  />
                </label>

                {formData.primaryImage && (
                  <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-gold/40">
                    <img
                      src={formData.primaryImage}
                      alt="Primary flacon"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* SECONDARY IMAGE */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-gold" />
                  <span className="text-gold font-semibold text-xs uppercase tracking-wider">
                    SECONDARY IMAGE (HOVER)
                  </span>
                </div>

                <select
                  value={formData.secondaryImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondaryImage: e.target.value }))}
                  className="w-full bg-obsidian-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="">No Secondary Image</option>
                  {PRODUCT_IMAGES.map((img, idx) => (
                    <option key={img} value={img}>
                      Preset Image {idx + 1}
                    </option>
                  ))}
                  {formData.secondaryImage && !PRODUCT_IMAGES.includes(formData.secondaryImage) && (
                    <option value={formData.secondaryImage}>Custom Uploaded Secondary</option>
                  )}
                </select>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-obsidian-950 text-xs font-semibold transition-colors">
                  <Upload size={12} />
                  <span>{uploadingSecondary ? "Uploading..." : "Upload New File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSecondaryUpload}
                    className="hidden"
                    disabled={uploadingSecondary}
                  />
                </label>

                {formData.secondaryImage && (
                  <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-gold/40">
                    <img
                      src={formData.secondaryImage}
                      alt="Secondary flacon"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 5: OLFACTORY NOTES & DESCRIPTION
              ============================================================ */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="font-serif text-base font-bold text-ivory border-b border-neutral-800 pb-2">
              5. Olfactory Notes &amp; Description
            </h3>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="An artisanal luxury formulation crafted from aged botanical distillates..."
                className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Top Notes
                </label>
                <input
                  type="text"
                  name="topNotes"
                  value={formData.topNotes}
                  onChange={handleChange}
                  placeholder="e.g. Calabrian Bergamot, Saffron"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Heart Notes
                </label>
                <input
                  type="text"
                  name="heartNotes"
                  value={formData.heartNotes}
                  onChange={handleChange}
                  placeholder="e.g. Taif Rose, Ambergris"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Base Notes
                </label>
                <input
                  type="text"
                  name="baseNotes"
                  value={formData.baseNotes}
                  onChange={handleChange}
                  placeholder="e.g. Assam Agarwood, Sandalwood"
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 6: MERCHANDISING FLAGS
              ============================================================ */}
          <div className="pt-4 border-t border-neutral-800 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-ivory">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="rounded border-neutral-700 text-gold focus:ring-gold bg-obsidian-950"
              />
              <span>Featured Fragrance</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-ivory">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
                className="rounded border-neutral-700 text-gold focus:ring-gold bg-obsidian-950"
              />
              <span>Best Seller Flacon</span>
            </label>
          </div>

          {/* ============================================================
              SECTION 7: ACTIONS
              ============================================================ */}
          <div className="pt-6 border-t border-neutral-800 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving Modifications...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
