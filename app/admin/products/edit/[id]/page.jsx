// app/admin/products/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Trash2,
  Save,
} from "lucide-react";

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
    fragranceType: "Eau de Parfum",
    stock: "35",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Product not found");
        const p = await res.json();
        setFormData({
          name: p.name || "",
          price: p.price ? p.price.toString() : "",
          discountPrice: p.discountPrice ? p.discountPrice.toString() : "",
          category: p.category || "men",
          targetPage: p.targetPage || p.category || "shop",
          brand: p.brand || "Maison Charcoal",
          size: p.size || "100ml",
          fragranceType: p.fragranceType || "Eau de Parfum",
          stock: (p.stock || 20).toString(),
          description: p.description || "",
        });
        if (p.images && p.images.length > 0) {
          setImagePreview(p.images[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        category: formData.category,
        targetPage: formData.targetPage,
        brand: formData.brand,
        size: formData.size,
        fragranceType: formData.fragranceType,
        stock: Number(formData.stock),
        description: formData.description,
        images: imagePreview ? [imagePreview] : [],
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update product");

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you certain you want to permanently delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
      }
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold">
        <p className="font-serif tracking-widest text-sm">Opening Product Record...</p>
      </div>
    );
  }

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
          <div className="flex items-center justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold/30 shadow-2xl backdrop-blur-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                Product Catalog Control
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
                Edit Fragrance: {formData.name}
              </h1>
            </div>

            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={13} />
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

        <form onSubmit={handleUpdate} className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 space-y-6 shadow-xl text-xs">
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
                className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Price (PKR) *
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
                Discount Price (PKR)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Category
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
                <option value="gift-sets">Gift Sets</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Target Boutique Page
              </label>
              <select
                name="targetPage"
                value={formData.targetPage}
                onChange={handleChange}
                className="w-full bg-obsidian-950 border border-gold/50 rounded-xl px-3 py-2.5 text-xs text-gold font-semibold focus:outline-none focus:border-gold"
              >
                <option value="men">Men Perfume Page (/men)</option>
                <option value="women">Women Perfume Page (/women)</option>
                <option value="attar">Attar / Oud Page (/attar)</option>
                <option value="all">All Shop Boutique (/shop)</option>
              </select>
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

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Size
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

          {/* CHOOSE FILE Picture Update */}
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-3">
            <label className="block text-neutral-300 font-medium">
              Update Flacon Picture (CHOOSE FILE Option):
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-obsidian-950 transition-colors font-semibold">
                <Upload size={14} />
                <span>Select New Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {imagePreview && (
              <div className="relative h-28 w-28 rounded-xl overflow-hidden border border-gold/40 mt-2">
                <Image src={imagePreview} alt="Product image" fill className="object-cover" />
              </div>
            )}
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
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold text-obsidian-950 font-bold uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save size={14} />
              <span>{submitting ? "Saving..." : "Save Modifications"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
