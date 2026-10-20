// app/api/auth/resend-otp/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildOTPEmail } from "@/lib/mailer";

const schema = z.object({
  email: z.string().email(),
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Account already verified. Please log in." },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpires },
    });

    const { html, text } = buildOTPEmail({ name: user.name, otp });
    await sendEmail({
      to: normalizedEmail,
      subject: "Your New Maison Charcoal Verification Code",
      html,
      text,
    });

    console.log(`✅ New OTP sent to ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "New OTP sent to your email.",
    });
  } catch (err: any) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      { error: "Failed to resend OTP. Please try again." },
      { status: 500 }
    );
  }
}