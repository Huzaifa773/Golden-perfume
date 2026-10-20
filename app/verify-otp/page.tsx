// app/verify-otp/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { MailCheck, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { alertSuccess, alertError, alertToast } from "@/lib/alerts";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [expired, setExpired] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasted)) return;

    const digits = pasted.split("");
    setOtp(digits);
    inputRefs.current[5]?.focus();
  };

  // ============================================================
  // OTP VERIFY + AUTO-LOGIN + DASHBOARD REDIRECT
  // ============================================================
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      alertError("Invalid OTP", "Please enter all 6 digits.");
      return;
    }

    if (expired) {
      alertError("OTP Expired", "Please request a new OTP.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: OTP verify karein
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Step 2: Auto-login ke liye password sessionStorage se lein
      let password: string | null = null;
      if (typeof window !== "undefined") {
        const pending = sessionStorage.getItem("pending_signup");
        if (pending) {
          try {
            const parsed = JSON.parse(pending);
            if (
              parsed.email === email.toLowerCase().trim() &&
              parsed.password
            ) {
              password = parsed.password;
            }
          } catch (err) {
            console.error("Failed to parse pending signup:", err);
          }
        }
      }

      // Step 3: Sweet Alert dikhayein — Account Verified
      await alertSuccess(
        "Account Verified!",
        `Welcome to Maison Charcoal, <strong>${
          data.user?.name || "Patron"
        }</strong>!<br/><br/>Aapka account successfully verify ho gaya hai.<br/><br/><span style="color:#f5d061;font-size:12px;">Dashboard par redirect kiya ja raha hai...</span>`
      );

      // Step 4: Auto-login karein (agar password mila)
      if (password) {
        try {
          const signInRes = await signIn("credentials", {
            email: email.toLowerCase().trim(),
            password,
            redirect: false,
          });

          if (signInRes?.error) {
            console.warn("Auto-login failed:", signInRes.error);
          }
        } catch (err) {
          console.warn("Auto-login error:", err);
        }
      }

      // Step 5: SessionStorage clear karein
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_signup");
      }

      // Step 6: 2 second baad dashboard par redirect
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err: any) {
      alertError("Verification Failed", err.message || "Invalid OTP");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend");

      alertToast("New OTP sent to your email!", "success");
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(300);
      setExpired(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      alertError("Resend Failed", err.message || "Try again");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4">
        <div className="max-w-md bg-obsidian-900/90 border border-rose-500/40 rounded-3xl p-8 text-center">
          <h1 className="font-serif text-2xl text-ivory mb-2">
            Invalid Link
          </h1>
          <p className="text-xs text-neutral-400 mb-6">
            Email address missing. Please sign up again.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-obsidian-950 font-bold text-xs"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="h-14 w-14 mx-auto rounded-full border border-gold/60 bg-gold/20 flex items-center justify-center text-gold mb-3 shadow-gold-glow">
            <MailCheck size={26} />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Verify Email
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
            Enter Verification Code
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Humne <strong className="text-gold">{email}</strong> par 6-digit OTP
            bheja hai.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-obsidian-950 border-2 rounded-xl text-gold focus:outline-none transition-all ${
                  digit
                    ? "border-gold shadow-gold-glow"
                    : "border-neutral-700 focus:border-gold"
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            {expired ? (
              <p className="text-xs text-rose-400 font-semibold">
                ⏱️ OTP Expired
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                Time remaining:{" "}
                <strong className="text-gold font-mono">
                  {formatTime(timeLeft)}
                </strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || expired}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Continue</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !expired}
            className="w-full py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-gold hover:border-gold/40 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Resend OTP</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800 text-center text-xs text-neutral-400">
          Wrong email?{" "}
          <Link
            href="/signup"
            className="text-gold font-semibold hover:underline"
          >
            Sign Up Again
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 py-20 text-center text-gold">
          Loading...
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}