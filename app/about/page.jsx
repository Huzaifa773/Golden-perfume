// app/about/page.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Droplets,
  ShieldCheck,
  Award,
  Heart,
  Compass,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Section 1: Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30 mb-2"
          >
            <Sparkles size={12} />
            Maison Charcoal Haute Parfumerie
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-ivory tracking-tight leading-tight"
          >
            The Sacred Craft of Rare Perfumes &amp; Attars
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light"
          >
            From the sun-drenched flower fields of Grasse to the ancient agarwood forests of Cambodia and Assam, Maison Charcoal creates timeless fragrances for individuals who refuse the ordinary.
          </motion.p>
        </div>

        {/* Section 2: Heritage Story & Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[480px] w-full rounded-3xl overflow-hidden border border-gold/30 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200&q=85&auto=format&fit=crop"
              alt="Perfume atelier bottles and vintage ingredients"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-obsidian-900/90 border border-gold/30 backdrop-blur-md">
              <p className="text-xs text-gold font-serif font-bold">A Master Nose at Work</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">Blending rare Taif rose with wild Cambodian agarwood oils.</p>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              The Genesis
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory leading-snug">
              Bridging French Refinement with Arabian Mystique
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Maison Charcoal was founded by passionate connoisseurs seeking to unite two legendary perfume traditions. In Europe, the French tradition perfected the art of complex olfactory pyramids, delicate florality, and seamless transitions. In the East, Arabian perfumers mastered the extraction of deep agarwoods, pure unadulterated attars, and heavy animalic ambers.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              We took the uncompromising purity of hydro-distilled traditional Deg-Bapka attars and married them to the sophistication of French haute perfumery. The result is a library of scents that project regal authority, poetic sensitivity, and unrivaled longevity.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-neutral-800">
                <span className="font-serif text-2xl font-bold text-gold">100%</span>
                <span className="text-[11px] text-neutral-400 block mt-1">Alcohol-Free Attar Options</span>
              </div>
              <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-neutral-800">
                <span className="font-serif text-2xl font-bold text-gold">48+ Hours</span>
                <span className="text-[11px] text-neutral-400 block mt-1">Sillage on Garments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Rare Raw Ingredients */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Source of Excellence
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory mt-1">
              Treasured Global Ingredients
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              We travel directly to source farms to guarantee zero dilution and true Grade-AAA yields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Cambodian & Assam Oud",
                origin: "Cambodia & Assam, India",
                desc: "Extracted from 80-year-old wild agarwood trees infected with natural oleoresin, producing warm balsamic, sweet woody, and ancient leather notes.",
                tag: "Wild Harvest",
              },
              {
                title: "Taif Damask Rose",
                origin: "Taif Mountains, Saudi Arabia",
                desc: "Harvested by hand exclusively at dawn before sunrise when the petals preserve their concentrated ethereal oils. Takes 40,000 roses to produce 1 tola.",
                tag: "Grade AAA",
              },
              {
                title: "Mysore Sandalwood",
                origin: "Karnataka, India",
                desc: "Pure Santalum Album wood matured for decades. Delivers the creamy, butter-soft base note that anchors our attars for up to two days.",
                tag: "Sacred Wood",
              },
            ].map((ing) => (
              <div
                key={ing.title}
                className="p-6 rounded-3xl bg-obsidian-900/80 border border-gold/20 hover:border-gold/50 shadow-xl space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                    {ing.tag}
                  </span>
                  <span className="text-[11px] text-neutral-400">{ing.origin}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-ivory">{ing.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{ing.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Artisanal Distillation Process */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-neutral-800 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              The Metier
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
              4 Steps of Master Distillation
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-2">
              <span className="font-serif text-2xl font-bold text-gold">01</span>
              <h4 className="font-bold text-ivory text-sm">Harvesting at Dawn</h4>
              <p className="text-neutral-400 leading-relaxed">
                Floral petals are picked between 4:00 AM and 6:30 AM to capture peak volatile esters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-2">
              <span className="font-serif text-2xl font-bold text-gold">02</span>
              <h4 className="font-bold text-ivory text-sm">Deg &amp; Bapka Stills</h4>
              <p className="text-neutral-400 leading-relaxed">
                Slow wood-fired copper cauldrons condense natural vapors directly into sandalwood receivers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-2">
              <span className="font-serif text-2xl font-bold text-gold">03</span>
              <h4 className="font-bold text-ivory text-sm">90-Day Maceration</h4>
              <p className="text-neutral-400 leading-relaxed">
                Each batch rests in temperature-controlled dark vaults to marry top, heart, and base notes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-obsidian-950 border border-neutral-800 space-y-2">
              <span className="font-serif text-2xl font-bold text-gold">04</span>
              <h4 className="font-bold text-ivory text-sm">Crystal Bottling</h4>
              <p className="text-neutral-400 leading-relaxed">
                Hand-poured into heavy crystal flacons with gold-engraved seals and dip-sticks.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: CTA to Shop */}
        <div className="text-center py-12 space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
            Experience Haute Parfumerie Firsthand
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Browse our full catalog of 75+ perfumes and pure attars, with complimentary delivery across Pakistan.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 text-xs font-bold uppercase tracking-wider shadow-gold-glow hover:brightness-110 transition-all"
            >
              <span>Explore Boutique Catalog</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
