// app/api/test-email/route.js
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function GET() {
  try {
    const info = await sendEmail({
      to: process.env.SMTP_USER, // Apne aap ko email bhej rahe hain
      subject: "Test Email from Maison Charcoal",
      text: "Yeh ek test email hai. Agar aap yeh dekh rahe hain, toh aapka email setup sahi kaam kar raha hai!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #d4af37;">✅ Email Setup Working!</h1>
          <p>Yeh ek test email hai Maison Charcoal website se.</p>
          <p>Agar aap yeh dekh rahe hain, toh aapka SMTP configuration sahi hai.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      info,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}