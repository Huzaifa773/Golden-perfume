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
    "Salam! Thank you for visiting our website. Aap ko hamare paas kimti perfume aur kimti attar mil sakte hain. Aap ko kis tarah ki perfume chahiye? Baraye meharbani apni pasand batayen taake hum aap ki behtar rehnumai kar sakein."
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
                className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
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
