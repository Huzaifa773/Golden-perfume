// app/login/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { alertError, alertToast } from "@/lib/alerts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error || "Invalid email or password.");
      }

      alertToast("Welcome back to Maison Charcoal", "success");

      // Wait for session cookie to be set
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Force full page reload for redirect
      if (
        email.toLowerCase() === "huzaifa2409e@aptechorangi.com" ||
        email.toLowerCase().includes("admin")
      ) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.message || "Failed to sign in.");
      alertError(
        "Authentication Failed",
        err.message || "Invalid credentials provided"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 flex items-center justify-center py-16 px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-obsidian-900/90 border border-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="h-12 w-12 mx-auto rounded-full border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-xl shadow-gold-glow mb-3">
            MC
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Maison Charcoal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
            Welcome to Your Salon
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in to access your orders, personal creations, and concierge
            privileges.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
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
                placeholder="Enter Your Email"
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory focus:outline-none focus:border-gold"
              />
              <Mail
                size={15}
                className="absolute left-3.5 top-3 text-neutral-400"
              />
            </div>
          </div>

          <div>
            {/* Password label + Forgot Password link side by side */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-300 font-medium">
                Password *
              </label>
              <Link
                href="/forgot-password"
                className="text-gold text-[11px] font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory focus:outline-none focus:border-gold"
              />
              <Lock
                size={15}
                className="absolute left-3.5 top-3 text-neutral-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-400">
          Do not possess an account yet?{" "}
          <Link
            href="/signup"
            className="text-gold font-semibold hover:underline"
          >
            New here? Create Your Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}