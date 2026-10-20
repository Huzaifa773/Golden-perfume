export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Sparkles } from "lucide-react";

export const metadata = {
  title: "Personal Wishlist | Maison Charcoal",
  description: "View and manage your saved luxury fragrances and favorite oud extraits.",
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/wishlist");

  const wishlist = await prisma.wishlist.findUnique({ where: { userId: session.user.id } });
  const items = wishlist
    ? await prisma.wishlistItem.findMany({
        where: { wishlistId: wishlist.id },
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" }, take: 1 }, reviews: { select: { rating: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const cards: ProductCardData[] = items.map(({ product: p }) => {
    const ratings = p.reviews;
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      stock: p.stock,
      images: p.images,
      avgRating: ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 5,
      reviewCount: ratings.length || 1,
      isWishlisted: true,
    };
  });

  return (
    <div className="bg-obsidian-950 text-ivory min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="border-b border-neutral-800 pb-6 mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold mb-2">
              <Sparkles size={12} />
              <span>Patron Curation</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-ivory">
              Personal <span className="gold-gradient-text">Wishlist</span>
            </h1>
          </div>

          <p className="text-xs md:text-sm text-neutral-400">
            {cards.length} flacons saved to your personal collection
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-obsidian-900/40 py-24 text-center space-y-4">
            <Heart className="h-16 w-16 text-neutral-600 mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-ivory">Your Wishlist is Empty</h2>
            <p className="text-xs md:text-sm text-neutral-400 max-w-md mx-auto">
              Save your favorite extraits, attars, and limited batch perfumes to re-visit whenever you desire.
            </p>
            <div className="pt-2">
              <Link href="/products" className="btn-primary text-xs uppercase tracking-widest font-bold py-3.5 px-8 shadow-gold-glow">
                Explore The Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {cards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

