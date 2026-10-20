"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloating() {
  const whatsappUrl = "https://wa.me/923148759109?text=" + encodeURIComponent("Salam Maison Charcoal Concierge, I would like to inquire about your luxury perfumes and pure attars.");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-xl bg-obsidian-900/95 px-3.5 py-1.5 text-xs font-semibold text-ivory border border-gold/40 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 backdrop-blur-md">
        <span className="text-gold mr-1.5">✦</span>
        Chat with us
      </span>

      {/* WhatsApp Button with pulse ring */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-white shadow-2xl shadow-emerald-500/40 border border-emerald-300/30 focus:outline-none"
      >
        {/* Radar Pulse Effect */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />

        {/* WhatsApp Icon */}
        <MessageCircle size={28} className="relative z-10 fill-white text-white drop-shadow-md" />

        {/* Online Indicator Dot */}
        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-300 border-2 border-obsidian-950 shadow-sm" />
      </motion.a>
    </div>
  );
}
