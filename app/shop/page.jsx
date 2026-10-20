// app/shop/page.jsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Search, ArrowUpDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [localSearch, setLocalSearch] = useState("");

  const limit = 20;

  useEffect(() => {
    async function loadShopProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          sort: sortBy,
        });

        // ============================================================
        // SHOP PAGE FILTER
        // - "all" → saari products (koi targetPage filter nahi)
        // - "men" → sirf men wale
        // - "women" → sirf women wale
        // - "attar" → sirf attar wale
        // ============================================================
        if (selectedCategory && selectedCategory !== "all") {
          queryParams.set("targetPage", selectedCategory);
        }
        // Agar "all" hai to koi targetPage nahi bhejna — saari products aayengi

        if (localSearch.trim()) {
          queryParams.set("search", localSearch.trim());
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();

        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadShopProducts();
  }, [currentPage, selectedCategory, sortBy, localSearch]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Luxury Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30 mb-3"
          >
            <Sparkles size={12} />
            The Master Catalog
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl font-bold text-ivory tracking-tight"
          >
            All Luxury Fragrances &amp; Attars
          </motion.h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Explore our complete collection of haute parfumerie bottles, pure
            hydro-distilled attar oils, and vintage Cambodian oud flacons.
          </p>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="bg-obsidian-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 mb-10 backdrop-blur-md shadow-luxury flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {[
              { id: "all", label: "All Fragrances" },
              { id: "men", label: "Men's Perfumes" },
              { id: "women", label: "Women's Perfumes" },
              { id: "attar", label: "Pure Attar & Oud" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 shadow-gold-glow"
                    : "bg-obsidian-950 text-neutral-400 hover:text-ivory border border-neutral-800 hover:border-gold/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search within page & Sorting */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full sm:w-60"
            >
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter by scent note..."
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
              />
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-neutral-400"
              />
            </form>

            {/* Sort Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown
                size={14}
                className="text-gold shrink-0 hidden sm:inline"
              />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full sm:w-auto bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2 px-3 text-xs text-ivory focus:outline-none focus:border-gold"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-neutral-900/60 border border-neutral-800 animate-pulse"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        ) : (
          <div className="text-center py-20 bg-obsidian-900/40 rounded-2xl border border-neutral-800">
            <p className="text-base text-neutral-300 font-serif">
              No fragrances found matching your current filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setLocalSearch("");
              }}
              className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold bg-gold text-obsidian-950"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 py-20 text-center text-gold">
          Loading Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}