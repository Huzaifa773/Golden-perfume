// lib/mailer.ts
import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn("⚠️ SMTP not configured. Emails will not be sent.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<any> {
  const t = getTransporter();
  if (!t) {
    console.log("📧 [MOCK EMAIL] To:", to);
    console.log("📧 [MOCK EMAIL] Subject:", subject);
    return { mocked: true };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await t.sendMail({ from, to, subject, text, html });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
}

// ============================================================
// PASSWORD RESET EMAIL
// ============================================================
interface BuildPasswordResetEmailParams {
  name?: string | null;
  resetUrl: string;
}

export function buildPasswordResetEmail({
  name,
  resetUrl,
}: BuildPasswordResetEmailParams): { html: string; text: string } {
  const html = `
    <div style="font-family: Georgia, serif; background: #0b0b0e; color: #f4f1ea; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #101014; border: 1px solid rgba(212,175,55,0.4); border-radius: 16px; padding: 40px;">
        <h1 style="color: #f5d061; font-size: 24px; margin: 0 0 16px;">Maison Charcoal</h1>
        <p style="color: #d1ccbf; font-size: 15px; line-height: 1.6;">Hello ${name || "there"},</p>
        <p style="color: #d1ccbf; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b38728 100%); color: #09090b; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 8px; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="color: #8a857a; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #8a857a; font-size: 12px; margin-top: 24px;">
          Or copy this URL: <span style="color: #d4af37; word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
    </div>
  `;
  const text = `Maison Charcoal - Reset your password\n\nClick: ${resetUrl}\n\nThis link expires in 1 hour.`;
  return { html, text };
}

// ============================================================
// OTP EMAIL TEMPLATE
// ============================================================
interface BuildOTPEmailParams {
  name?: string | null;
  otp: string;
}

export function buildOTPEmail({
  name,
  otp,
}: BuildOTPEmailParams): { html: string; text: string } {
  // OTP ko digits mein tod dein (har digit alag box mein dikhega)
  const digits = otp.split("");

  const html = `
    <div style="font-family: Georgia, serif; background: #0b0b0e; color: #f4f1ea; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #101014; border: 1px solid rgba(212,175,55,0.4); border-radius: 16px; padding: 40px;">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.5); color: #d4af37; font-family: Georgia, serif; font-weight: bold; font-size: 20px;">MC</div>
        </div>

        <h1 style="color: #f5d061; font-family: Georgia, serif; font-size: 24px; margin: 0 0 8px; text-align: center;">Maison Charcoal</h1>
        <p style="color: #8a857a; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; text-align: center; margin: 0 0 32px;">Haute Parfumerie</p>

        <p style="color: #d1ccbf; font-size: 15px; line-height: 1.6;">Hello ${name || "there"},</p>
        <p style="color: #d1ccbf; font-size: 15px; line-height: 1.6;">
          Shukriya for joining Maison Charcoal. Apna account verify karne ke liye neeche diya gaya OTP enter karein.
        </p>

        <p style="color: #8a857a; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; text-align: center; margin: 32px 0 12px;">Your Verification Code</p>

        <div style="text-align: center; margin: 0 0 24px;">
          ${digits
            .map(
              (d) =>
                `<span style="display: inline-block; width: 44px; height: 56px; line-height: 56px; margin: 0 4px; background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.5); border-radius: 8px; color: #f5d061; font-family: 'Courier New', monospace; font-size: 26px; font-weight: bold; text-align: center;">${d}</span>`
            )
            .join("")}
        </div>

        <div style="text-align: center; padding: 12px; background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; margin: 0 0 24px;">
          <p style="color: #f5d061; font-size: 13px; margin: 0; font-weight: bold;">
            ⏱️ This code expires in 1 minute
          </p>
        </div>

        <p style="color: #8a857a; font-size: 12px; line-height: 1.6;">
          Agar aapne yeh request nahi ki, toh is email ko ignore kar dein.
        </p>

        <hr style="border: none; border-top: 1px solid rgba(212,175,55,0.2); margin: 32px 0;" />

        <p style="color: #8a857a; font-size: 11px; text-align: center; line-height: 1.6;">
          © Maison Charcoal Haute Parfumerie<br/>
          KDA Scheme 1, Karachi, Pakistan<br/>
          WhatsApp: +92 314 8759109
        </p>
      </div>
    </div>
  `;

  const text = `
MAISON CHARCOAL
Haute Parfumerie

Hello ${name || "there"},

Your verification code is: ${otp}

This code expires in 1 minute.

If you didn't request this, please ignore this email.

© Maison Charcoal
  `.trim();

  return { html, text };
}