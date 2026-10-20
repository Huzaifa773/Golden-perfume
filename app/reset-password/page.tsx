// app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      toast.success("Password updated. Please log in.");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ---------- INVALID / MISSING TOKEN ----------
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-obsidian-900/90 border border-rose-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center"
        >
          <div className="h-14 w-14 mx-auto rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
            <ShieldCheck size={26} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ivory mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-xs text-neutral-400 mb-6">
            This password reset link is missing, invalid, or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow hover:brightness-110 transition-all"
          >
            Request a New Link
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ---------- MAIN FORM ----------
  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 flex items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Golden background glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-obsidian-900/90 border border-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 mx-auto rounded-full border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-xl shadow-gold-glow mb-3">
            MC
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Maison Charcoal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
            Set a New Password
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Choose a strong password to secure your account.
          </p>
        </div>

        {/* Email Display */}
        <div className="mb-6 p-3 rounded-xl bg-obsidian-950/80 border border-neutral-800 text-center">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
            Resetting for
          </span>
          <span className="text-xs text-gold font-medium break-all">{email}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* New Password */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold transition-colors"
              />
              <Lock
                size={15}
                className="absolute left-3.5 top-3 text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-gold transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold transition-colors"
              />
              <Lock
                size={15}
                className="absolute left-3.5 top-3 text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-gold transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password Rules Hint */}
          <div className="p-3 rounded-xl bg-obsidian-950/60 border border-neutral-800 text-[10px] text-neutral-400 leading-relaxed">
            <span className="text-gold font-semibold">Password Rules:</span>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>At least 8 characters long</li>
              <li>Use a mix of letters, numbers, and symbols</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-gold font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 py-20 text-center text-gold">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-sm tracking-widest uppercase">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}