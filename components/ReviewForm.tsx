"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, Loader2, Sparkles } from "lucide-react";
import { alertSuccess, alertError, alertToast } from "@/lib/alerts";

export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (status !== "authenticated") {
    return (
      <div className="rounded-xl border border-neutral-800 bg-obsidian-900/60 p-6 text-center">
        <p className="font-serif text-gold-300">Share Your Olfactory Impression</p>
        <p className="text-xs text-neutral-400 mt-1">
          Please log in to your Maison Charcoal account to write an verified customer review.
        </p>
        <button
          onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)}
          className="btn-secondary mt-4 text-xs uppercase tracking-wider font-semibold"
        >
          Sign In to Review
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      alertToast("Please choose a star rating for this fragrance", "info");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      await alertSuccess(
        "Review Published",
        "Your review has been successfully submitted. Thank you for contributing to Maison Charcoal.",
        "Understood"
      );
      setComment("");
      setRating(5);
      router.push("/");
    } catch (err: any) {
      alertError("Review Failed", err.message || "Something went wrong while posting your review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-obsidian-900/60 p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold font-semibold">
        <Sparkles size={14} /> Leave a Patron Review
      </div>

      <div className="space-y-1">
        <label className="text-xs text-neutral-400 block">Rating</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              type="button"
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="p-1 hover:scale-125 transition-transform duration-150"
            >
              <Star
                size={22}
                className={
                  i <= (hover || rating)
                    ? "fill-gold text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    : "fill-none text-neutral-600"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-neutral-400 block">Your Scent Impression</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe the projection, sillage, dry-down, and your personal experience with this perfume..."
          rows={3}
          required
          className="input-field rounded-xl"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-6"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Publish Review
      </button>
    </form>
  );
}
