// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  MailCheck,
} from "lucide-react";
import { alertError, alertSuccess } from "@/lib/alerts";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setSent(true);

      // ✅ SUNDAR GOLDEN SWEET ALERT
      await alertSuccess(
        "Reset Link Sent!",
        `Humne <strong class="text-gold">${email}</strong> par password reset link bhej diya hai.<br/><br/>Apna <strong>email inbox</strong> check karein.<br/><span class="text-neutral-400 text-xs">Agar email na mile toh <strong>Spam / Junk</strong> folder zaroor dekhein.</span>`
      );
    } catch (err: any) {
      alertError("Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
            Reset Password
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            {sent
              ? "Check your email for the reset link."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {/* SUCCESS STATE */}
        {sent ? (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MailCheck size={26} />
              </div>
              <h3 className="font-serif text-lg font-bold text-ivory">
                Email Sent Successfully!
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Humne <strong className="text-gold">{email}</strong> par password
                reset link bhej diya hai.
              </p>
              <p className="text-[11px] text-neutral-400">
                Apna <strong>inbox</strong> check karein. Agar email na mile toh{" "}
                <strong>Spam</strong> ya <strong>Junk</strong> folder zaroor
                dekhein.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-[10px] font-semibold text-gold uppercase tracking-wider">
                  <CheckCircle2 size={11} />
                  Link 1 hour mein expire hoga
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="w-full py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:text-gold hover:border-gold/40 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Try Another Email
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold transition-colors"
                />
                <Mail
                  size={15}
                  className="absolute left-3.5 top-3 text-neutral-400"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-500">
                Woh email daalein jo aapne account banate waqt use ki thi.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-gold font-semibold hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={11} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}