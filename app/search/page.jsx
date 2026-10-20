// app/search/page.jsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedToAdmin, setLoggedToAdmin] = useState(false);

  useEffect(() => {
    async function executeSearch() {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoggedToAdmin(false);

      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=20`);
        const data = await res.json();
        const found = data.products || [];
        setProducts(found);

        // FEATURE: Agar product website par NAHI hai -> woh search USER SEARCH PRODUCT ke page ke andar SAVE ho jaye!
        if (found.length === 0) {
          const userName = session?.user?.name || "Guest Visitor";
          const userEmail = session?.user?.email || "guest@perfume.store";
          const userId = (session?.user)?.id || "guest";

          await fetch("/api/admin/search-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: query.trim(),
              userId,
              userName,
              userEmail,
            }),
          });

          setLoggedToAdmin(true);

          // Fetch recommendations so page stays rich
          const recRes = await fetch("/api/products?limit=4&sort=featured");
          const recData = await recRes.json();
          setRecommended(recData.products || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [query, session]);

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Search size={14} className="text-gold" />
            Catalog Inquiry Results
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory">
            Search for &ldquo;{query}&rdquo;
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Displaying matching flacons across all French perfumes, pure attars, and oud collections.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gold flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-xs tracking-widest uppercase">Searching olfactory database...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-6">
            <p className="text-xs text-neutral-400">
              Found <strong className="text-gold">{products.length}</strong> matching creations:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          /* PRODUCT NOT FOUND: Logged to Admin & User Notification Banner */
          <div className="space-y-12">
            <div className="p-8 sm:p-10 rounded-3xl bg-obsidian-900/90 border border-gold/40 shadow-2xl max-w-2xl mx-auto text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto border border-gold/30">
                <Sparkles size={26} />
              </div>

              <h3 className="font-serif text-2xl font-bold text-ivory">
                No Existing Scent Matches &ldquo;{query}&rdquo;
              </h3>

              <div className="p-4 rounded-2xl bg-obsidian-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 size={16} />
                  <span>Request Logged for Maison Charcoal Perfumers</span>
                </div>
                <p className="text-neutral-400">
                  Because this fragrance is not yet on our website, our system has recorded your search inquiry in the <strong>Admin &quot;User Search Products&quot; registry</strong>.
                </p>
                <p className="text-neutral-500 text-[11px]">
                  Our master noses review these requests weekly to formulate and add requested scents to the catalog.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow"
                >
                  <span>Explore Available Collections</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Recommended Products */}
            {recommended.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-neutral-800">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-gold font-bold">
                    Alternative Recommendations
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory mt-1">
                    Signature Best Sellers You May Cherish
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommended.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 py-20 text-center text-gold">Searching...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
