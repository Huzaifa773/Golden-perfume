// app/admin/products/add/page.jsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";

// Local images library
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

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillName = searchParams.get("name") || "";

  const [formData, setFormData] = useState({
    name: prefillName,
    price: "",
    discountPrice: "",
    category: "men",
    targetPage: "men",
    brand: "Maison Charcoal",
    size: "100ml Eau De Parfum",
    fragranceType: "EAU_DE_PARFUM",
    stock: "35",
    description: "",
    topNotes: "Calabrian Bergamot, Saffron",
    heartNotes: "Taif Rose, Ambergris",
    baseNotes: "Assam Agarwood, Mysore Sandalwood",
    isFeatured: true,
    isBestSeller: false,
    primaryImage: "/images/products/p1.jpg",
    secondaryImage: "/images/products/p2.jpg",
  });

  // ============================================
  // NAYA: Variants State
  // ============================================
  const [variants, setVariants] = useState([
    { size: "", price: "", discountPrice: "", stock: "0" },
  ]);

  const [uploadedPrimary, setUploadedPrimary] = useState("");
  const [uploadedSecondary, setUploadedSecondary] = useState("");
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (prefillName) {
      setFormData((prev) => ({ ...prev, name: prefillName }));
    }
  }, [prefillName]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ============================================
  // NAYA: Variant Functions
  // ============================================
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "", price: "", discountPrice: "", stock: "0" },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Upload primary image
  const handlePrimaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5MB.");
      return;
    }

    setUploadingPrimary(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadedPrimary(data.url);
      setFormData((prev) => ({ ...prev, primaryImage: data.url }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingPrimary(false);
    }
  };

  // Upload secondary image
  const handleSecondaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5MB.");
      return;
    }

    setUploadingSecondary(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadedSecondary(data.url);
      setFormData((prev) => ({ ...prev, secondaryImage: data.url }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingSecondary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Please provide at least product name and price.");
      return;
    }

    setSubmitting(true);
    try {
      // Dono images ek array mein bhejein
      const images = [formData.primaryImage, formData.secondaryImage].filter(
        (img) => img && img.trim().length > 0
      );

      // Valid variants filter karein
      const validVariants = variants.filter(
        (v) => v.size.trim() && v.price.trim()
      );

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : null,
        category: formData.category,
        targetPage: formData.targetPage,
        brand: formData.brand,
        size: formData.size,
        fragranceType: formData.fragranceType,
        stock: Number(formData.stock) || 20,
        description: formData.description || "An artisanal luxury formulation.",
        images: images,
        notes: {
          top: formData.topNotes.split(",").map((s) => s.trim()),
          heart: formData.heartNotes.split(",").map((s) => s.trim()),
          base: formData.baseNotes.split(",").map((s) => s.trim()),
        },
        isFeatured: Boolean(formData.isFeatured),
        isBestSeller: Boolean(formData.isBestSeller),
        variants: validVariants.map((v, i) => ({
          size: v.size.trim(),
          price: Number(v.price),
          discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
          stock: Number(v.stock) || 0,
          position: i,
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add product");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch (err) {
      alert(err.message || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold transition-colors mb-2"
          >
            <ArrowLeft size={13} />
            <span>Return to Admin Panel</span>
          </Link>
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold/30 shadow-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Master Boutique Creation
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
              Add New Luxury Fragrance
            </h1>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Product added successfully! Redirecting...</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 space-y-6 shadow-xl text-xs"
        >
          {/* Section 1: General */}
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
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Price in PKR *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Discount Price
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Category & Target Page */}
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
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="men">Men&apos;s Perfume</option>
                  <option value="women">Women&apos;s Perfume</option>
                  <option value="attar">Attar / Oud</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Add To Page *
                </label>
                <select
                  name="targetPage"
                  value={formData.targetPage}
                  onChange={handleChange}
                  className="w-full bg-obsidian-950 border border-gold/50 rounded-xl px-3 py-2.5 text-xs text-gold font-semibold focus:outline-none focus:border-gold"
                >
                  <option value="home">Home Page</option>
                  <option value="shop">All Shop (/shop)</option>
                  <option value="men">Men Page (/men)</option>
                  <option value="women">Women Page (/women)</option>
                  <option value="attar">Attar Page (/attar)</option>
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
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* ============================================
              NAYA SECTION: FLACON VARIANTS
              ============================================ */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <h3 className="font-serif text-base font-bold text-gold">
                  3. Flacon Variants (Multiple Sizes)
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Admin apni marzi se sizes add kare (20ml, 50ml, 100ml, 150ml,
                  etc.)
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-obsidian-950 text-xs font-bold hover:brightness-110 transition-all"
              >
                <Plus size={13} />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.map((v, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end p-3 rounded-xl bg-obsidian-950 border border-neutral-800"
              >
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                    Size (Free Text)
                  </label>
                  <input
                    placeholder="e.g. 20ml, 150ml"
                    value={v.size}
                    onChange={(e) =>
                      updateVariant(index, "size", e.target.value)
                    }
                    className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="500"
                    value={v.price}
                    onChange={(e) =>
                      updateVariant(index, "price", e.target.value)
                    }
                    className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
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
                    onChange={(e) =>
                      updateVariant(index, "discountPrice", e.target.value)
                    }
                    className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
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
                    onChange={(e) =>
                      updateVariant(index, "stock", e.target.value)
                    }
                    className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
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

          {/* Section 4: Images (2 Images) */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="font-serif text-base font-bold text-ivory border-b border-neutral-800 pb-2">
              4. Product Images (Primary &amp; Secondary)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* PRIMARY IMAGE */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-gold" />
                  <span className="text-gold font-semibold text-xs">
                    PRIMARY IMAGE
                  </span>
                </div>
                <select
                  value={formData.primaryImage}
                  onChange={(e) => {
                    setFormData({ ...formData, primaryImage: e.target.value });
                    setUploadedPrimary("");
                  }}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                >
                  {PRODUCT_IMAGES.map((img, idx) => (
                    <option key={img} value={img}>
                      Image {idx + 1}
                    </option>
                  ))}
                </select>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-obsidian-950 text-xs font-semibold">
                  <Upload size={12} />
                  <span>
                    {uploadingPrimary ? "Uploading..." : "Or Upload New"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryUpload}
                    className="hidden"
                    disabled={uploadingPrimary}
                  />
                </label>

                {formData.primaryImage && (
                  <img
                    src={formData.primaryImage}
                    alt="Primary"
                    className="h-32 w-32 rounded-xl object-cover border border-gold/40"
                  />
                )}
              </div>

              {/* SECONDARY IMAGE */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-gold" />
                  <span className="text-gold font-semibold text-xs">
                    SECONDARY IMAGE
                  </span>
                </div>
                <select
                  value={formData.secondaryImage}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      secondaryImage: e.target.value,
                    });
                    setUploadedSecondary("");
                  }}
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                >
                  {PRODUCT_IMAGES.map((img, idx) => (
                    <option key={img} value={img}>
                      Image {idx + 1}
                    </option>
                  ))}
                </select>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-obsidian-950 text-xs font-semibold">
                  <Upload size={12} />
                  <span>
                    {uploadingSecondary ? "Uploading..." : "Or Upload New"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSecondaryUpload}
                    className="hidden"
                    disabled={uploadingSecondary}
                  />
                </label>

                {formData.secondaryImage && (
                  <img
                    src={formData.secondaryImage}
                    alt="Secondary"
                    className="h-32 w-32 rounded-xl object-cover border border-gold/40"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Notes & Description */}
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
                  className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold uppercase tracking-wider shadow-gold-glow hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 py-20 text-center text-gold">
          Loading...
        </div>
      }
    >
      <AddProductForm />
    </Suspense>
  );
}