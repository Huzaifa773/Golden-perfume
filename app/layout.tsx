// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import { Page3DTransition } from "@/components/Page3DTransition";
import "sweetalert2/dist/sweetalert2.min.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maison Charcoal | Luxury Perfumes & Pure Attars",
    template: "%s | Maison Charcoal Haute Parfumerie",
  },
  description:
    "Handcrafted French Haute Parfumerie, Pure Non-Alcoholic Attars, and Aged Cambodian Oud Oils. Fast VIP delivery across Pakistan with verified Easypaisa, JazzCash, and Bank payments.",
  openGraph: {
    title: "Maison Charcoal | Luxury Perfumes & Pure Attars",
    description: "Royal Arabian & French Haute Parfumerie for the connoisseur.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} dark`}>
      <body className="flex min-h-screen flex-col bg-obsidian-950 text-neutral-100 selection:bg-gold/30 selection:text-gold antialiased overflow-x-hidden">
        <Providers>
          <Navbar />
          <Page3DTransition>
            <main className="flex-1">{children}</main>
          </Page3DTransition>
          <Footer />
          <WhatsAppFloating />
        </Providers>
      </body>
    </html>
  );
}
