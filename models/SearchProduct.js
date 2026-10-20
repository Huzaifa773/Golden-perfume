// models/SearchProduct.js
import mongoose from "mongoose";

const SearchProductSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    userId: { type: String, default: "guest" },
    userName: { type: String, default: "Guest User" },
    userEmail: { type: String, default: "guest@perfume.store" },
    userPhone: { type: String, default: "" },
    status: { type: String, enum: ["REQUESTED", "ADDED_TO_CATALOG", "REVIEWED"], default: "REQUESTED" },
    searchCount: { type: Number, default: 1 },
    lastSearchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.SearchProduct || mongoose.model("SearchProduct", SearchProductSchema);
