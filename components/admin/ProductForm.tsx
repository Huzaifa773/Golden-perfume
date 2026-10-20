// components/admin/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface VariantData {
  size: string;
  price: string;
  discountPrice: string;
  stock: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  brand: string;
  size: string;
  fragranceType: string;
  sku: string;
  stock: string;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  imagesText: string;
  variants: VariantData[];
}

const FRAGRANCE_TYPES = [
  "EAU_DE_PARFUM",
  "EAU_DE_TOILETTE",
  "EAU_DE_COLOGNE",
  "PARFUM_EXTRAIT",
  "ATTAR",
  "BODY_MIST",
];

const emptyVariant: VariantData = {
  size: "",
  price: "",
  discountPrice: "",
  stock: "0",
};

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  brand: "",
  size: "",
  fragranceType: "EAU_DE_PARFUM",
  sku: "",
  stock: "0",
  categoryId: "",
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isActive: true,
  imagesText: "",
  variants: [{ ...emptyVariant }],
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: ProductFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(
    initial || { ...emptyForm, categoryId: categories[0]?.id || "" }
  );
  const [loading, setLoading] = useState(false);

  function update<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ---------- VARIANT FUNCTIONS ----------
  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { ...emptyVariant }],
    }));
  }

  function removeVariant(index: number) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  }

  function updateVariant(
    index: number,
    field: keyof VariantData,
    value: string
  ) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter out empty variants
      const validVariants = form.variants.filter(
        (v) => v.size.trim() && v.price.trim()
      );

      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice
          ? parseFloat(form.discountPrice)
          : null,
        brand: form.brand,
        size: form.size || (validVariants[0]?.size || "100ml"),
        fragranceType: form.fragranceType,
        sku: form.sku,
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival,
        isActive: form.isActive,
        images: form.imagesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        variants: validVariants.map((v, i) => ({
          size: v.size.trim(),
          price: parseFloat(v.price),
          discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : null,
          stock: parseInt(v.stock || "0", 10),
          position: i,
        })),
      };

      const url = form.id
        ? `/api/admin/products/${form.id}`
        : "/api/admin/products";
      const method = form.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      toast.success(form.id ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl space-y-6 rounded-2xl border border-neutral-800 bg-obsidian-900/80 p-6"
    >
      {/* BASIC INFO */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Product Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            SKU
          </label>
          <input
            required
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Brand
          </label>
          <input
            required
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Category
          </label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="input-field"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Base Price (PKR)
          </label>
          <input
            required
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Base Discount Price (optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={form.discountPrice}
            onChange={(e) => update("discountPrice", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Default Size (optional)
          </label>
          <input
            placeholder="e.g. 100ml"
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Fragrance Type
          </label>
          <select
            value={form.fragranceType}
            onChange={(e) => update("fragranceType", e.target.value)}
            className="input-field"
          >
            {FRAGRANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ivory">
            Base Stock Quantity
          </label>
          <input
            required
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ivory">
          Description
        </label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="input-field"
        />
      </div>

      {/* ============================================
          VARIANTS SECTION - YEH NAYA SECTION HAI
          ============================================ */}
      <div className="p-4 rounded-2xl border border-gold/30 bg-obsidian-950/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-gold">
              Flacon Variants (Multiple Sizes)
            </h3>
            <p className="text-[11px] text-neutral-400">
              Admin apni marzi se sizes add kare (20ml, 50ml, 100ml, 150ml, etc.)
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

        {form.variants.map((v, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end p-3 rounded-xl bg-obsidian-900/80 border border-neutral-800"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
              />
            </div>
            <div className="sm:col-span-1 flex justify-end">
              {form.variants.length > 1 && (
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

      {/* IMAGES */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ivory">
          Image URLs (comma-separated)
        </label>
        <textarea
          rows={2}
          value={form.imagesText}
          onChange={(e) => update("imagesText", e.target.value)}
          className="input-field"
          placeholder="/images/products/1.jpg, /images/products/2.jpg"
        />
      </div>

      {/* FLAGS */}
      <div className="flex flex-wrap gap-6">
        {(
          [
            ["isFeatured", "Featured Product"],
            ["isBestSeller", "Best Seller"],
            ["isNewArrival", "New Arrival"],
            ["isActive", "Active (visible on store)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-ivory">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => update(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary inline-flex items-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {form.id ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}