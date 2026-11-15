export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Package } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-950/80 text-amber-400 border-amber-500/40",
  CONFIRMED: "bg-blue-950/80 text-blue-400 border-blue-500/40",
  PROCESSING: "bg-purple-950/80 text-purple-400 border-purple-500/40",
  SHIPPED: "bg-indigo-950/80 text-indigo-400 border-indigo-500/40",
  DELIVERED: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40",
  CANCELLED: "bg-red-950/80 text-red-400 border-red-500/40",
};

export default async function DashboardOrdersPage() {
  const session = await getServerSession(authOptions);
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-2xl border border-neutral-800 bg-obsidian-900/70 p-6 md:p-8 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-gold font-semibold">Your Acquisitions</span>
          <h2 className="font-serif text-2xl font-bold text-ivory mt-0.5">Order Confirmation</h2>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <Package className="h-12 w-12 text-neutral-600 mx-auto" />
          <p className="font-serif text-lg text-ivory">No Orders Found</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You haven't placed any perfume orders yet. Discover our latest extraits in the catalog.
          </p>
          <Link href="/products" className="btn-primary mt-4 inline-flex text-xs uppercase tracking-wider font-bold">
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div
              key={o.id}
              className="rounded-xl border border-neutral-800 bg-obsidian-800/60 p-5 space-y-4 transition-all duration-300 hover:border-gold/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-gold">{o.orderNumber}</p>
                  <p className="text-[11px] text-neutral-400">
                    Placed on {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      STATUS_STYLES[o.orderStatus] || "bg-neutral-800 text-neutral-300 border-neutral-700"
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                  <span className="font-serif text-base font-bold text-ivory">
                    {formatCurrency(Number(o.total))}
                  </span>
                </div>
              </div>

              {/* Order Items Snapshot */}
              <div className="space-y-1.5 text-xs text-neutral-300">
                {o.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span>
                      {item.name} <span className="text-neutral-500 font-mono">Ã— {item.quantity}</span>
                    </span>
                    <span className="text-neutral-400 font-mono">{formatCurrency(Number(item.price))}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                <span className="text-neutral-500 text-[11px]">Payment: {o.paymentMethod}</span>
                <div className="flex gap-2">
                  <Link
                    href={`/order-confirmation/${o.id}`}
                    className="flex items-center gap-1 text-gold hover:underline font-semibold"
                  >
                    <span>View Receipt</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


