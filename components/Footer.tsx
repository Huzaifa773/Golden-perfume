// components/Footer.tsx
import Link from "next/link";
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-obsidian-950 border-t border-gold/20 pt-16 pb-10 text-neutral-300 relative overflow-hidden">
      {/* Decorative Golden Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-gold/10 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-lg shadow-gold-glow">
                MC
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.16em] font-bold text-ivory">
                  MAISON <span className="text-gold">CHARCOAL</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">
                  Haute Parfumerie & Pure Attars
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Artisanal French & Arabian luxury fragrances, handcrafted with the world&apos;s rarest natural essences, pure non-alcoholic attars, and aged Cambodian oud oils. Designed for the connoisseur.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs">
              <a
                href="https://wa.me/923148759109"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-gold transition-colors"
              >
                <Phone size={14} className="text-gold" />
                <span>VIP WhatsApp: +92 314 8759109</span>
              </a>
              <div className="flex items-center gap-2 text-neutral-400">
                <Mail size={14} className="text-gold" />
                <span>concierge@maisoncharcoal.com</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <MapPin size={14} className="text-gold" />
                <span>KDA Scheme 1, Karachi &bull; F-7 Markaz, Islamabad</span>
              </div>
            </div>
          </div>

          {/* Luxury Collections */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/shop" className="text-neutral-400 hover:text-gold transition-colors">
                  All Luxury Perfumes
                </Link>
              </li>
              <li>
                <Link href="/men" className="text-neutral-400 hover:text-gold transition-colors">
                  Men&apos;s Royal Fragrances
                </Link>
              </li>
              <li>
                <Link href="/women" className="text-neutral-400 hover:text-gold transition-colors">
                  Women&apos;s Floral & Oriental
                </Link>
              </li>
              <li>
                <Link href="/attar" className="text-neutral-400 hover:text-gold transition-colors">
                  Pure Alcohol-Free Attars
                </Link>
              </li>
              <li>
                <Link href="/attar" className="text-neutral-400 hover:text-gold transition-colors">
                  Aged Cambodian Oud
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Services */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-gold transition-colors">
                  Our Artisanal Heritage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-gold transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-neutral-400 hover:text-gold transition-colors">
                  Track My Order & Parcel
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-neutral-400 hover:text-gold transition-colors">
                  Join VIP Scent Club
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-neutral-400 hover:text-gold transition-colors">
                  Account Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Secure Payment Methods in Pakistan */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold mb-4">
              Accepted Payments
            </h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Fast, 100% verified Pakistani payment gateways:
            </p>
            <div className="flex flex-col gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-gold/30 text-gold font-medium flex items-center justify-between">
                <span>Easypaisa</span>
                <span className="text-[10px] text-neutral-400">Mobile Account</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-gold/30 text-gold font-medium flex items-center justify-between">
                <span>JazzCash</span>
                <span className="text-[10px] text-neutral-400">Instant Pay</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-gold/30 text-gold font-medium flex items-center justify-between">
                <span>Bank Transfer</span>
                <span className="text-[10px] text-neutral-400">Direct Deposit</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Guarantee */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} Maison Charcoal Haute Parfumerie. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gold/80">
              <ShieldCheck size={14} />
              100% Authentic Guaranteed
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Sparkles size={14} className="text-gold" />
              Handcrafted in Grasse & Dubai
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
