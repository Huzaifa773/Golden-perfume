// app/dashboard/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Sparkles,
  ArrowLeft,
  Truck,
  Award,
  XCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "VIP Overview", icon: User },
  { href: "/dashboard/orders", label: "Order Dossier", icon: Package },
  { href: "/track-order", label: "Track Shipment", icon: Truck },
  { href: "/wishlist", label: "Saved Creations", icon: Heart },
  { href: "/dashboard/addresses", label: "Delivery Addresses", icon: MapPin },
  { href: "/dashboard/settings", label: "Patron Settings", icon: Settings },
  // ✅ NAYA: Cancel Order
  { href: "/dashboard/cancel-order", label: "Cancel Order", icon: XCircle },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="bg-obsidian-950 text-ivory min-h-screen py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* VIP Patron Header Card */}
        <div className="mb-10 rounded-3xl border border-gold/40 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2 border-gold bg-gradient-to-br from-gold/30 to-obsidian-950 flex items-center justify-center text-gold font-serif text-2xl md:text-3xl font-bold shadow-gold-glow flex-shrink-0">
              {session.user.name
                ? session.user.name.charAt(0).toUpperCase()
                : "M"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 border border-gold/40 px-3 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                  <Award size={11} /> VIP Connoisseur Member
                </span>
                {session.user.role === "ADMIN" && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-400/50 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                    Admin
                  </span>
                )}
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory">
                {session.user.name}
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                {session.user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-8 text-center">
            <div className="p-3 rounded-2xl bg-obsidian-800/80 border border-gold/30">
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                Olfactory Privilège
              </p>
              <p className="font-serif text-xl md:text-2xl font-bold text-gold mt-0.5">
                1,250 Pts
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">
                Tier: Imperial Gold
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Navigation Sidebar: 4 cols */}
          <aside className="lg:col-span-4">
            <nav className="rounded-2xl border border-neutral-800 bg-obsidian-900/70 p-3 backdrop-blur-xl shadow-xl space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs md:text-sm font-medium text-neutral-300 transition-all duration-200 hover:bg-gold/15 hover:text-gold hover:border-gold/30"
                >
                  <item.icon size={17} className="text-gold" />
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="my-2 border-t border-neutral-800" />

              <Link
                href="/products"
                className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs md:text-sm font-medium text-neutral-400 transition-all duration-200 hover:text-gold"
              >
                <ArrowLeft size={16} />
                <span>Return to Catalog</span>
              </Link>
            </nav>
          </aside>

          {/* Main Workspace: 8 cols */}
          <div className="lg:col-span-8">{children}</div>
        </div>
      </div>
    </div>
  );
}