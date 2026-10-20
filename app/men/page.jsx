// app/men/page.jsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Flame, ArrowUpDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";

function MenContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("featured");

  const limit = 20; // 20 cards per page

  useEffect(() => {
    async function loadMenProducts() {
      setLoading(true);
      try {
       const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        targetPage: "men",  
        sort: sortBy
        });

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();

        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } catch (err) {
        console.error("Failed to load men perfumes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMenProducts();
  }, [currentPage, sortBy]);

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Luxury Hero Banner for Men's Perfumes */}
        <div className="relative rounded-3xl overflow-hidden border border-gold/30 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 p-8 sm:p-14 mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30 mb-4">
              <Flame size={12} className="text-gold" />
              Gentleman&apos;s Reserve
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ivory tracking-tight">
              Men&apos;s Royal Fragrances
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Commanding, dark, and sophisticated accords formulated with Italian smoked leather, aged Assam agarwood, Haitian vetiver, and black saffron.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-gold">
                <ShieldCheck size={14} /> 24-48 Hour Longevity
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                &bull; Intense Sillage &amp; Projection
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                &bull; 20 Flacons Per Page
              </span>
            </div>
          </div>
        </div>

        {/* Sort and Count Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-obsidian-900/60 border border-neutral-800 p-4 rounded-xl">
          <p className="text-xs text-neutral-400">
            Discovering <span className="text-gold font-bold">{totalItems}</span> signature masculine creations
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-obsidian-950 border border-neutral-700/80 rounded-lg py-1.5 px-3 text-xs text-ivory focus:outline-none focus:border-gold"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid (20 cards per page) */}
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

            {/* Pagination Component */}
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
              No fragrances found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 py-20 text-center text-gold">Loading Men&apos;s Fragrances...</div>}>
      <MenContent />
    </Suspense>
  );
}
