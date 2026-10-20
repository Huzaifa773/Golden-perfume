// models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    brand: { type: String, default: "Maison Charcoal" },
    size: { type: String, default: "100ml" },
    category: {
      type: String,
      enum: ["men", "women", "attar", "oud", "unisex", "gift-sets"],
      required: true,
    },
    targetPage: {
      type: String,
      enum: ["men", "women", "attar", "shop", "all"],
      default: "all",
    },
    fragranceType: {
      type: String,
      default: "Eau de Parfum",
    },
    sku: { type: String, default: "" },
    stock: { type: Number, default: 25 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    images: { type: [String], default: [] },
    notes: {
      top: { type: [String], default: [] },
      heart: { type: [String], default: [] },
      base: { type: [String], default: [] },
    },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 1 },
    // Track who added this product
    addedByUserId: { type: String, default: "system" },
    addedByUserName: { type: String, default: "System Admin" },
    addedByUserEmail: { type: String, default: "admin@perfume.store" },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
