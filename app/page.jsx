// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  Droplets,
  Heart,
  ChevronRight,
  Flame,
  Star,
  CheckCircle2,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { alertSuccess } from "@/lib/alerts";

// Local images
const HERO_IMAGE = "/images/products/p1.jpg";
const CATEGORY_IMAGES = {
  men: "/images/products/p2.jpg",
  women: "/images/products/p3.jpg",
  attar: "/images/products/p4.jpg",
  shop: "/images/products/p5.jpg",
};
const CRAFT_IMAGE = "/images/products/p6.jpg";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredAttars, setFeaturedAttars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeProducts() {
      try {
        // Homepage: sirf "home" wale products
        const res = await fetch("/api/products?limit=8&sort=featured&targetPage=home");
        const data = await res.json();
        setFeaturedProducts(data.products || []);

        // Featured attars: attar page ke products
        const attarRes = await fetch("/api/products?targetPage=attar&limit=4");
        const attarData = await attarRes.json();
        setFeaturedAttars(attarData.products || []);
      } catch (e) {
        console.error("Failed to load home products:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeProducts();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 overflow-x-hidden">
      {/* ========================================================
          1. HERO BANNER (Animated with Framer Motion)
      ======================================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-gold/20">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO_IMAGE}
            alt="Luxury Perfume Flacon in Dark Ambient Light"
            fill
            priority
            className="object-cover object-center opacity-30 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/70 to-obsidian-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Ambient Gold Glow Orbs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gold/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center flex flex-col items-center">
          {/* VIP Scent Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold text-xs font-semibold tracking-[0.2em] uppercase shadow-gold-glow mb-6"
          >
            <Sparkles size={13} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span>Haute Parfumerie &bull; Royal Attar Collection</span>
          </motion.div>

          {/* Main Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ivory max-w-4xl leading-[1.15]"
          >
            The Alchemy of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              Royal French &amp; Oriental Scent
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl font-light leading-relaxed"
          >
            Immerse yourself in extraordinary olfactory craftsmanship. From aged Cambodian Oud oils and pure alcohol-free attars to bespoke French extraits de parfum.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-95 transition-all duration-300"
            >
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/attar"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-obsidian-900/90 text-gold-300 border border-gold/40 hover:border-gold hover:bg-gold/15 hover:text-gold text-xs uppercase tracking-widest font-semibold backdrop-blur-md active:scale-95 transition-all duration-300"
            >
              <Droplets size={15} className="text-gold" />
              <span>Pure Alcohol-Free Attars</span>
            </Link>
          </motion.div>

          {/* Quick Value Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 pt-8 border-t border-neutral-800/80 w-full max-w-3xl"
          >
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl font-bold text-gold">48+ Hours</span>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Unrivaled Longevity</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl font-bold text-gold">100% Pure</span>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Alcohol-Free Oils</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl font-bold text-gold">Aged 12 Yrs</span>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Cambodian Agarwood</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl font-bold text-gold">Free VIP</span>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Pakistan Delivery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          2. CATEGORIES SECTION (Men, Women, Attar, Oud)
      ======================================================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Curated Boutiques
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-2">
            Explore By Scent Family
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-2">
            Select your desired fragrance category to discover dedicated flacons formulated for every emotion and setting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Men's Royal Fragrances",
              desc: "Smoky leather, dark oud, spices, and amber woods.",
              href: "/men",
              image: CATEGORY_IMAGES.men,
              badge: "25+ Fragrances",
            },
            {
              title: "Women's Haute Parfumerie",
              desc: "Taif rose, velvet jasmine, vanilla divine, and floral nectar.",
              href: "/women",
              image: CATEGORY_IMAGES.women,
              badge: "25+ Fragrances",
            },
            {
              title: "Pure Attar & Royal Oud",
              desc: "Traditional non-alcoholic pure distilled concentrated oils.",
              href: "/attar",
              image: CATEGORY_IMAGES.attar,
              badge: "Traditional Oils",
            },
            {
              title: "Prestige Full Catalog",
              desc: "Browse our complete inventory with 20 items per page.",
              href: "/shop",
              image: CATEGORY_IMAGES.shop,
              badge: "Full Boutique",
            },
          ].map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl overflow-hidden border border-neutral-800 hover:border-gold/60 shadow-luxury hover:shadow-gold-card transition-all duration-500 aspect-[3/4] flex flex-col justify-end p-6"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/40 mb-2">
                  {cat.badge}
                </span>
                <h3 className="font-serif text-xl font-bold text-ivory group-hover:text-gold transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>
                <Link
                  href={cat.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mt-3 group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore Collection</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. BEST SELLERS SECTION (Dynamic Product Cards)
      ======================================================== */}
  

      {/* ========================================================
          4. BRAND HERITAGE & CRAFTSMANSHIP STORY
      ======================================================== */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative h-[480px] w-full rounded-2xl overflow-hidden border border-gold/40 shadow-2xl">
              <Image
                src={CRAFT_IMAGE}
                alt="Perfumer Crafting Fragrances"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-80" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6 bg-obsidian-900/95 border border-gold/40 p-5 rounded-2xl backdrop-blur-xl shadow-gold-card max-w-xs"
            >
              <div className="flex items-center gap-2 text-gold mb-1">
                <Sparkles size={16} />
                <span className="font-serif font-bold text-sm">Grasse to Karachi</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Raw materials harvested in Provence, Taif, and Assam, formulated under the strict supervision of Master Noses.
              </p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              The Heritage of Maison Charcoal
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ivory leading-tight">
              Where French Elegance Meets Royal Arabian Oud
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Founded on the belief that a scent is an indelible signature of identity, Maison Charcoal bridges two legendary fragrance traditions: the refined floral architecture of Grasse, France, and the deep, intoxicating soul of Oriental agarwoods and distilled attars.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Every formula undergoes months of maceration to ensure a velvety transition from brisk opening notes to an everlasting base that lingers on skin and cashmere garments for days.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-ivory block">Alcohol-Free Attars</strong>
                  <span className="text-neutral-400">Pure hydro-distilled floral and wood extracts.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-ivory block">Certified Authenticity</strong>
                  <span className="text-neutral-400">Zero synthetic extenders or chemical shortcuts.</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold/60 text-gold hover:bg-gold hover:text-obsidian-950 font-semibold text-xs uppercase tracking-wider transition-all duration-300"
              >
                <span>Read Our Full Story</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. FEATURED ATTAR & ROYAL OUD SHOWCASE
      ======================================================== */}
      <section className="py-20 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 border-t border-gold/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold flex items-center gap-1.5">
                <Droplets size={14} className="text-gold" />
                Pure Concentrated Oils
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-2">
                Featured Attar &amp; Royal Oud
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Zero alcohol, 100% natural concentrated oil flacons designed to last on fabric up to 48 hours.
              </p>
            </div>
            <Link
              href="/attar"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-200 transition-colors shrink-0"
            >
              <span>Explore All 25+ Attars</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAttars.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FRAGRANCE PYRAMID / SCENT EXPLORER
      ======================================================== */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-neutral-800">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Olfactory Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-2">
            The Three Phases of Scent Evolution
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Understanding how our perfumes transition throughout the hours on your skin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -6 }}
            className="p-8 rounded-2xl bg-obsidian-900/80 border border-gold/20 hover:border-gold/60 shadow-luxury transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-serif text-xl font-bold mb-5 shadow-gold-glow">
              01
            </div>
            <h3 className="font-serif text-xl font-bold text-ivory">The Top Notes</h3>
            <span className="text-[11px] text-gold font-semibold uppercase tracking-wider block mt-1">
              First 15 - 30 Minutes
            </span>
            <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
              The first impression. Brisk Calabrian bergamot, Kashmiri saffron, sparkling pink pepper, and crisp Italian neroli to captivate the senses immediately.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-8 rounded-2xl bg-obsidian-900/80 border border-gold/30 hover:border-gold/60 shadow-luxury transition-all duration-300 relative"
          >
            <div className="h-12 w-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-serif text-xl font-bold mb-5 shadow-gold-glow">
              02
            </div>
            <h3 className="font-serif text-xl font-bold text-ivory">The Heart Notes</h3>
            <span className="text-[11px] text-gold font-semibold uppercase tracking-wider block mt-1">
              2 to 6 Hours
            </span>
            <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
              The true personality of the blend. Taif rose absolute, French lavender, Florentine iris, sambac jasmine, and spiced cardamom providing rich projection.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-8 rounded-2xl bg-obsidian-900/80 border border-gold/20 hover:border-gold/60 shadow-luxury transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-serif text-xl font-bold mb-5 shadow-gold-glow">
              03
            </div>
            <h3 className="font-serif text-xl font-bold text-ivory">The Base Notes</h3>
            <span className="text-[11px] text-gold font-semibold uppercase tracking-wider block mt-1">
              8 to 48+ Hours
            </span>
            <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
              The everlasting sillage. Cambodian oud, grey ambergris, Mysore sandalwood, Bourbon vanilla pods, and dark musks that cling to garments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          7. CLIENT TESTIMONIALS (Verified Buyers)
      ======================================================== */}
      <section className="py-20 bg-obsidian-900/40 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Connoisseur Endorsements
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-2">
              Loved by Discerning Fragrance Lovers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Noir Absolu is on par with French niche houses like Roja and Amouage. The projection lasted from morning meetings in Karachi until late evening dinner. Exceptional quality.",
                author: "Dr. Hammad Qureshi",
                location: "Clifton, Karachi",
                product: "Noir Absolu Imperial (100ml)",
                stars: 5,
              },
              {
                quote: "The Dehn Al Oud Cambodi attar is 100% genuine aged agarwood without that harsh synthetic chemical smell. Pure, sweet, balsamic perfection. Delivered in 2 days via Easypaisa.",
                author: "Fatima Al-Hassan",
                location: "F-7/2, Islamabad",
                product: "Dehn Al Oud Cambodi (Royal 12ml)",
                stars: 5,
              },
              {
                quote: "Golden Iris Champagne is intoxicating. My wife fell in love with it on her birthday. Beautiful packaging, velvet box, and complimentary samples. Truly a 5-star experience.",
                author: "Farhan Siddiqui",
                location: "Gulberg, Lahore",
                product: "Golden Iris Champagne (100ml)",
                stars: 5,
              },
            ].map((t, idx) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-6 rounded-2xl bg-obsidian-950/80 border border-neutral-800 hover:border-gold/40 shadow-luxury flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-300 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/80">
                  <h4 className="font-serif font-bold text-sm text-ivory">{t.author}</h4>
                  <p className="text-[11px] text-gold/80">{t.location}</p>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">Purchased: {t.product}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. VIP NEWSLETTER & SCENT CLUB
      ======================================================== */}
      <section className="py-20 px-4 md:px-8 border-t border-gold/20 relative overflow-hidden bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30 mb-4">
            <Sparkles size={12} />
            Privilege Scent Club
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ivory">
            Receive Complimentary Samples
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 max-w-lg mx-auto">
            Subscribe to our private salon invitations, limited small-batch attar releases, and receive an instant 10% privilege discount on your initial order.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alertSuccess(
                "VIP Privilege Granted",
                "Welcome to Maison Charcoal VIP Scent Club! Your 10% privilege discount code is <strong class='text-gold font-mono'>LUXURY10</strong>."
              );
            }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your VIP email address..."
              className="w-full bg-obsidian-950 border border-neutral-700 focus:border-gold px-4 py-3 rounded-full text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-gold/60"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 shrink-0"
            >
              Join VIP Club
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}