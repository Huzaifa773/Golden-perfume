// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Sparkles,
  Phone,
  ChevronDown,
  Package,
} from "lucide-react";
import { useCart } from "@/lib/cart";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/shop" },
  { name: "Men's Perfumes", href: "/men" },
  { name: "Women's Perfumes", href: "/women" },
  { name: "Attar & Oud", href: "/attar" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";
  const isAdmin = (session?.user as any)?.isAdmin || (session?.user as any)?.role === "ADMIN";

  return (
    <>
      {/* Top Luxury Announcement Bar */}
      <div className="bg-obsidian-950 border-b border-gold/15 py-1.5 px-4 text-xs tracking-wider text-neutral-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-gold text-[11px]">
            <Sparkles size={12} className="animate-pulse" />
            <span className="tracking-widest uppercase">Maison Charcoal Haute Parfumerie</span>
          </div>

          <p className="flex-1 text-center font-medium text-[11px] sm:text-xs">
            Complimentary VIP Delivery on orders above PKR 15,000 &bull; 100% Pure Alcohol-Free Attars Available
          </p>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-neutral-400">
            <a
              href="https://wa.me/923148759109"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors flex items-center gap-1.5"
            >
              <Phone size={11} className="text-gold" />
              <span>WhatsApp Concierge: +92 314 8759109</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-obsidian-950/95 backdrop-blur-md shadow-2xl border-b border-gold/20 py-2.5"
            : "bg-obsidian-900/90 backdrop-blur-sm border-b border-neutral-800/80 py-3.5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="h-10 w-10 shrink-0 rounded-full border border-gold/60 bg-gradient-to-br from-gold/30 via-obsidian-900 to-obsidian-950 flex items-center justify-center text-gold font-serif text-lg font-bold shadow-gold-glow group-hover:scale-105 transition-transform duration-300">
              MC
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl md:text-2xl tracking-[0.14em] font-semibold text-ivory group-hover:text-gold transition-colors whitespace-nowrap">
                MAISON <span className="text-gold">CHARCOAL</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-neutral-400 -mt-1">
                Luxury Perfumes & Attars
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-md mx-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perfumes, pure attars, royal oud..."
              className="w-full bg-obsidian-950/80 border border-neutral-700/80 focus:border-gold/80 rounded-full py-2 pl-10 pr-4 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all duration-200"
            />
            <Search size={15} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
          </form>

          {/* Right Action Icons: Cart, Auth, Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full border border-gold/30 hover:border-gold hover:bg-gold/10 text-ivory hover:text-gold transition-all duration-200 flex items-center justify-center"
              title="View Cart"
            >
              <ShoppingBag size={18} />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-gold-600 to-gold text-obsidian-950 text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-gold-glow animate-pulse">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Authentication Section (Top Right) */}
            {status === "authenticated" ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full border border-gold/40 hover:border-gold bg-obsidian-950/70 hover:bg-gold/10 transition-all duration-200 text-xs text-ivory"
                >
                  {/* First Letter Circle Avatar with Gold Glow */}
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-gold-700 via-gold to-gold-400 text-obsidian-950 font-bold flex items-center justify-center text-xs shadow-gold-glow">
                    {userInitial}
                  </div>
                  <span className="hidden sm:inline font-medium text-gold truncate max-w-[120px]">
                    {session.user?.name || "My Account"}
                  </span>
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>

                {/* Account Dropdown */}
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-obsidian-950 border border-gold/30 shadow-2xl p-2 z-50 backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-neutral-800 text-xs">
                        <p className="text-neutral-400">Signed in as</p>
                        <p className="text-ivory font-semibold truncate">{session.user?.name}</p>
                        <p className="text-[11px] text-gold/80 truncate">{session.user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-gold hover:bg-gold/10 transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-gold" />
                          <span>User Dashboard</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gold font-semibold hover:bg-gold/15 transition-colors border border-gold/20 my-1"
                          >
                            <ShieldCheck size={14} className="text-gold" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-neutral-800">
                        <button
                          onClick={() => {
                            setAccountOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-gold border border-neutral-700 hover:border-gold/60 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 hover:shadow-gold-glow hover:brightness-110 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-300 hover:text-gold hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links with Active Page Highlight */}
        <div className="hidden lg:block border-t border-neutral-800/60 mt-3 pt-2">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-xs tracking-widest uppercase transition-all duration-200 font-medium ${
                    isActive
                      ? "text-gold font-semibold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      : "text-neutral-400 hover:text-ivory"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Framer Motion Animated) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-obsidian-950 border-l border-gold/30 p-6 z-50 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border border-gold/60 bg-gold/20 flex items-center justify-center text-gold font-serif font-bold text-sm">
                      MC
                    </div>
                    <span className="font-serif text-sm tracking-wider font-semibold text-ivory">
                      MAISON <span className="text-gold">CHARCOAL</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded-md text-neutral-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="mt-4 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search perfumes & attars..."
                    className="w-full bg-obsidian-900 border border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
                </form>

                {/* Mobile Links */}
                <div className="flex flex-col gap-1 mt-6">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-colors ${
                          isActive
                            ? "bg-gold/15 text-gold font-bold border border-gold/30"
                            : "text-neutral-300 hover:bg-white/5 hover:text-gold"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Auth Bottom Section */}
              <div className="pt-6 border-t border-neutral-800 space-y-2">
                {status === "authenticated" ? (
                  <>
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-obsidian-900 rounded-lg border border-neutral-800">
                      <div className="h-7 w-7 rounded-full bg-gold text-obsidian-950 font-bold flex items-center justify-center text-xs">
                        {userInitial}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-ivory truncate">{session.user?.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-2 rounded-lg text-xs font-semibold bg-gold/20 text-gold border border-gold/40"
                    >
                      User Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="block text-center py-2 rounded-lg text-xs font-semibold bg-gold text-obsidian-950 shadow-gold-glow"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 text-center"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-center text-xs rounded-lg border border-neutral-700 text-neutral-300 hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-center text-xs font-semibold rounded-lg bg-gradient-to-r from-gold-600 to-gold text-obsidian-950"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
