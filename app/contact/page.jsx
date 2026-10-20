// app/contact/page.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Send,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Bespoke Fragrance Consultation",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "Bespoke Fragrance Consultation",
        message: "",
      });
    }, 4000);
  };

  // ADMIN WHATSAPP CLICK-TO-CHAT LINK
  const adminWhatsAppNumber = "923148759109";
  const whatsAppUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
    "Salam Maison Charcoal Concierge, I would like to inquire regarding your luxury perfumes and pure attars."
  )}`;

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30 mb-3"
          >
            <Sparkles size={12} />
            Haute Parfumerie Concierge
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl font-bold text-ivory tracking-tight"
          >
            Connect With Our Master Perfumers
          </motion.h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Whether inquiring about bespoke bridal formulations, Cambodian oud vintages, or private corporate gifts, our concierge is at your service.
          </p>
        </div>

        {/* Main Grid: Form & Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Info & WhatsApp CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WHATSAPP CLICK-TO-CHAT CARD */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-obsidian-900 to-obsidian-950 border border-emerald-500/40 shadow-2xl backdrop-blur-xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-obsidian-950 flex items-center justify-center shadow-lg shrink-0">
                  <MessageCircle size={26} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                    Instant Response
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ivory">
                    WhatsApp Concierge Direct
                  </h3>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Connect directly with our master fragrance consultant on WhatsApp. Inquire about specific scent profiles, batch dates, or custom orders.
              </p>

              {/* WHATSAPP BUTTON (CLICK-TO-CHAT LINK) */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-obsidian-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-lg active:scale-95 transition-all"
              >
                <MessageCircle size={16} />
                <span>Chat On WhatsApp (+92 314 8759109)</span>
              </a>
            </motion.div>

            {/* Salon Details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 space-y-6">
              <h3 className="font-serif text-lg font-bold text-ivory border-b border-neutral-800 pb-3">
                Boutique Headquarters
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif">Karachi Private Salon:</strong>
                    <span className="text-neutral-400">
                      Maison Charcoal Flagship, KDA Scheme 1, Main Tipu Sultan Road, Karachi, Pakistan.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif">Islamabad Consultation Lounge:</strong>
                    <span className="text-neutral-400">
                      F-7 Markaz, Jinnah Super, Islamabad, Pakistan.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif">Concierge Email:</strong>
                    <span className="text-neutral-400">concierge@maisoncharcoal.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif">Salon Consultation Hours:</strong>
                    <span className="text-neutral-400">Monday &ndash; Saturday: 11:00 AM &ndash; 10:00 PM PKT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Us Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-obsidian-900/80 border border-gold/30 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <span className="text-xs uppercase tracking-widest text-gold font-bold">
                  Send A Message
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory mt-0.5">
                  Private Salon Inquiries
                </h3>
              </div>

              {sent && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>
                    Thank you. Your message has been received by the Master Perfumer&apos;s desk. We will reach out shortly.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter Your Name "
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter Email Address"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    >
                      <option value="Bespoke Fragrance Consultation">Bespoke Fragrance Consultation</option>
                      <option value="Bridal & Wedding Trousseau">Bridal &amp; Wedding Trousseau</option>
                      <option value="Aged Cambodian Oud Inquiry">Aged Cambodian Oud Inquiry</option>
                      <option value="Order Tracking & Logistics">Order Tracking &amp; Logistics</option>
                      <option value="Wholesale & Corporate Gifting">Wholesale &amp; Corporate Gifting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your inquiry or preferred scent profile..."
                    className="w-full bg-obsidian-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Transmit Inquiry to Concierge</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="rounded-3xl overflow-hidden border border-neutral-800 bg-obsidian-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gold" />
              <h3 className="font-serif text-lg font-bold text-ivory">
                Boutique Location: KDA Scheme 1, Karachi
              </h3>
            </div>
            <span className="text-xs text-neutral-400">Complimentary Valet Parking Available</span>
          </div>

          <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center">
            <iframe
              title="Maison Charcoal Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14480.082728929944!2d67.07849925!3d24.8631189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33ea3d0144933%3A0x7d6f51cb3e1c6b12!2sKDA%20Scheme%201%2C%20Karachi!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
