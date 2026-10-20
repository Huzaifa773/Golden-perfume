// app/api/auth/forgot-password/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildPasswordResetEmail } from "@/lib/mailer";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid email" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return a generic success message, even if the user doesn't
    // exist — this prevents attackers from discovering which emails are
    // registered (user enumeration).
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    }

    // ---------- TOKEN GENERATE ----------
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Pehle purane tokens delete karein (same email ke)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Naya token save karein
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    // ---------- RESET URL BANAYEIN ----------
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(
      email
    )}`;

    // ---------- EMAIL BHEJEIN ----------
    try {
      const { html, text } = buildPasswordResetEmail({
        name: user.name,
        resetUrl,
      });

      await sendEmail({
        to: email,
        subject: "Reset Your Maison Charcoal Password",
        html,
        text,
      });

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send reset email:", emailErr);
      // Email bhejne mein masla hua — lekin user ko wahi generic message
      // dikhayenge taake information leak na ho.
    }

    return NextResponse.json({
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}