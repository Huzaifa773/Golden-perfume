// app/signup/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { alertSuccess, alertError } from "@/lib/alerts";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "Karachi",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ============================================================
      // STEP 1: Create account
      // ============================================================
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      // ============================================================
      // STEP 2: Auto-login (no OTP needed)
      // ============================================================
      const signInRes = await signIn("credentials", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error || "Auto-login failed");
      }

      // ============================================================
      // STEP 3: Sweet Alert
      // ============================================================
      await alertSuccess(
        "Account Created Successfully!",
        `Welcome to Maison Charcoal, <strong>${formData.name}</strong>!<br/><br/><span style="color:#f5d061;font-size:12px;">Dashboard par redirect kiya ja raha hai...</span>`
      );

      // ============================================================
      // STEP 4: 2 second baad dashboard par redirect
      // ============================================================
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
      alertError(
        "Registration Failed",
        err.message || "Signup failed. Please verify your details."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 flex items-center justify-center py-16 px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-obsidian-900/90 border border-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="h-12 w-12 mx-auto rounded-full border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-xl shadow-gold-glow mb-3">
            MC
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Maison Charcoal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
            Create Your VIP Scent Account
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Access your private orders, add personal creations, and track
            deliveries.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory focus:outline-none focus:border-gold"
              />
              <User
                size={15}
                className="absolute left-3.5 top-3 text-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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
            <label className="block text-neutral-300 font-medium mb-1">
              Password (Min 6 Characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="******"
                className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory focus:outline-none focus:border-gold"
              />
              <Lock
                size={15}
                className="absolute left-3.5 top-3 text-neutral-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0300 1234567"
                  className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
                <Phone
                  size={15}
                  className="absolute left-3.5 top-3 text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Karachi, Lahore..."
                  className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs text-ivory focus:outline-none focus:border-gold"
                />
                <MapPin
                  size={15}
                  className="absolute left-3.5 top-3 text-neutral-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Your Address"
              className="w-full bg-obsidian-950 border border-neutral-700/80 rounded-xl py-2.5 px-4 text-xs text-ivory focus:outline-none focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up &amp; Open Dashboard</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800 text-center text-xs text-neutral-400">
          Already possess a VIP account?{" "}
          <Link
            href="/login"
            className="text-gold font-semibold hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}