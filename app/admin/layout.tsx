import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { useState } from "react"; // Note: Agar "use client" nahi hai toh isay hatayein, lekin hamburger ke liye "use client" chahiye hoga.

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Catalog Products", icon: Package },
  { href: "/admin/categories", label: "Fragrance Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Customer Orders", icon: ShoppingCart },
  { href: "/admin/payments", label: "Payment Verification", icon: CreditCard },
  { href: "/admin/users", label: "Patron Registry", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-obsidian-950 text-ivory">
      {/* VIP Admin Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gold/20 bg-obsidian-900/90 backdrop-blur-xl flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo & Admin Header */}
          <div className="border-b border-neutral-800 p-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-sm shadow-gold-glow">
                MC
              </div>
              <div>
                <p className="font-serif text-sm font-bold tracking-widest text-gold">MAISON CHARCOAL</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">VIP Admin Console</p>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                <ShieldCheck size={11} /> Master Administrator
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-300 transition-all duration-200 hover:bg-gold/15 hover:text-gold hover:border-gold/30"
              >
                <item.icon size={16} className="text-gold" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-neutral-800 bg-obsidian-800/80 px-3.5 py-2.5 text-xs font-medium text-neutral-300 hover:border-gold hover:text-gold transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} /> View Live Boutique
            </span>
            <ExternalLink size={12} className="text-neutral-500" />
          </Link>

          <div className="px-2 pt-1 text-[10px] text-neutral-500 truncate">
            Logged in as {session.user.email}
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-x-auto p-4 md:p-6 lg:p-10">
        {/* Mobile Hamburger Menu (Sirf mobile par nazar aayega) */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-sm">
              MC
            </div>
            <span className="font-serif text-sm font-bold tracking-widest text-gold">MAISON CHARCOAL</span>
          </div>
          {/* Mobile par navigation ke liye simple links */}
          <div className="flex gap-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg bg-obsidian-900 border border-neutral-800 px-3 py-2 text-[10px] font-semibold text-neutral-300 hover:text-gold whitespace-nowrap"
              >
                <item.icon size={12} className="text-gold" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}