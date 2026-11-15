"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Star, MessageSquare, ChevronDown, ChevronUp, Sparkles, User, CheckCircle2, PenLine, X } from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userImage?: string | null;
}

interface ProductReviewsProps {
  productId: string;
  productName?: string;
  onRatingUpdate?: (avgRating: number, count: number) => void;
}

const INITIAL_COUNT = 4;

export function ProductReviews({ productId, productName = "Fragrance", onRatingUpdate }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Keep a stable ref to onRatingUpdate to break infinite dependency loops
  const onRatingUpdateRef = useRef(onRatingUpdate);
  useEffect(() => {
    onRatingUpdateRef.current = onRatingUpdate;
  }, [onRatingUpdate]);

  // Guard to ensure fetch only runs ONCE per productId
  const isFetchedRef = useRef<string | null>(null);

  const fetchReviews = useCallback(async (force = false) => {
    if (!productId) return;
    if (!force && isFetchedRef.current === productId) {
      return; // Already loaded for this product
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      const fetchedReviews = Array.isArray(data.reviews) ? data.reviews : [];
      setReviews(fetchedReviews);
      const count = data.totalCount ?? fetchedReviews.length;
      const avg = data.averageRating ?? 5;
      setTotalCount(count);
      setAverageRating(avg);
      isFetchedRef.current = productId;

      if (onRatingUpdateRef.current) {
        onRatingUpdateRef.current(avg, count);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    isFetchedRef.current = null; // Reset when productId changes
    fetchReviews();
  }, [productId, fetchReviews]);

  // Initial load shows up to INITIAL_COUNT (4) reviews, latest first.
  const displayedReviews = isExpanded ? reviews : reviews.slice(0, INITIAL_COUNT);
  const hasMoreThanInitial = reviews.length > INITIAL_COUNT;

  return (
    <section className="mt-20 pt-16 border-t border-neutral-800 text-neutral-100">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-3">
            <Sparkles size={13} />
            <span>Patron Impressions</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ivory tracking-tight">
            User Reviews &amp; Impressions
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-xl">
            Honest critiques and scent memories from connoisseurs who have experienced this handcrafted flacon.
          </p>
        </div>

        {/* Rating Snapshot & Write Review Button */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-obsidian-900/90 border border-gold/30 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={
                      star <= Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                        : "fill-none text-neutral-600"
                    }
                  />
                ))}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {totalCount} {totalCount === 1 ? "connoisseur review" : "connoisseur reviews"}
              </p>
            </div>
            <div className="pl-3 border-l border-neutral-800 font-serif text-2xl font-bold text-gold">
              {averageRating.toFixed(1)}
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all duration-200 border border-gold text-obsidian-950 bg-gradient-to-r from-gold-600 via-gold to-gold-400 hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98]"
          >
            {showReviewForm ? (
              <>
                <X size={15} />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <PenLine size={15} />
                <span>Write a Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review Submission Form Drawer / Toggle */}
      {showReviewForm && (
        <div className="mb-10 p-1 rounded-2xl bg-gradient-to-r from-gold/30 via-gold/10 to-transparent">
          <div className="bg-obsidian-950 rounded-2xl p-6 border border-gold/40 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="font-serif text-lg font-bold text-ivory flex items-center gap-2">
                <PenLine size={18} className="text-gold" />
                <span>Share Your Scent Review for {productName}</span>
              </h4>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 text-xs"
              >
                Cancel
              </button>
            </div>
            <ReviewForm productId={productId} />
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-gold">
          <div className="inline-block h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-serif">
            Retrieving Patron Reviews...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-800 bg-obsidian-900/40 p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto shadow-gold-glow">
            <MessageSquare size={24} />
          </div>
          <h4 className="font-serif text-xl font-bold text-ivory">No Patron Reviews Yet</h4>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Be the premier patron to pen an olfactory critique for this fragrance. Share your thoughts on projection,
            notes, and sillage.
          </p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-obsidian-950 text-xs font-bold uppercase tracking-wider hover:shadow-gold-glow transition-all"
          >
            <PenLine size={13} />
            <span>Be First to Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Review Cards Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((review) => {
              const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const userInitial = review.userName ? review.userName.charAt(0).toUpperCase() : "P";

              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-neutral-800 bg-obsidian-900/70 p-5 md:p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-gold/30 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Header: User & Stars */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {review.userImage ? (
                          <img
                            src={review.userImage}
                            alt={review.userName}
                            className="h-10 w-10 rounded-full object-cover border border-gold/40"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gold-700 via-gold to-gold-400 text-obsidian-950 font-serif font-bold text-sm flex items-center justify-center shadow-gold-glow shrink-0">
                            {userInitial}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-ivory">
                              {review.userName}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 bg-obsidian-950 px-2.5 py-1 rounded-full border border-neutral-800">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-none text-neutral-700"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Comment */}
                    {review.comment ? (
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed pt-1">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 italic pt-1">
                        Rated {review.rating} out of 5 stars with no written remarks.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                    <span className="uppercase tracking-widest text-gold/70">Maison Charcoal Patron</span>
                    <span>Verified Flacon Purchase</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 1.3 More / Hide button: ONLY shown if total reviews > INITIAL_COUNT */}
          {hasMoreThanInitial && (
            <div className="pt-8 text-center">
              {!isExpanded ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-gold/50 bg-obsidian-900 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold/15 hover:border-gold shadow-lg transition-all duration-200"
                >
                  <span>More Reviews ({reviews.length - INITIAL_COUNT} remaining)</span>
                  <ChevronDown size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-neutral-700 bg-obsidian-900 text-neutral-300 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-neutral-500 transition-all duration-200"
                >
                  <span>Hide Additional Reviews</span>
                  <ChevronUp size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
