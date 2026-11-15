export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { BankTransferProofForm } from "@/components/BankTransferProofForm";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Verified & Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, address: true, payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const latestPayment = order.payments[0];

  return (
    <div className="bg-obsidian-950 text-ivory min-h-screen py-16 px-4 md:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 mx-auto rounded-full bg-gold/15 border-2 border-gold flex items-center justify-center text-gold shadow-gold-glow">
            <CheckCircle2 size={36} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-0.5 text-xs font-bold text-gold uppercase tracking-wider">
            <Sparkles size={12} /> Acquisition Authenticated
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-ivory">
            Order Confirmed & Wax Sealed
          </h1>
          <p className="text-sm text-neutral-400">
            Dossier Number: <span className="font-mono text-gold font-bold">{order.orderNumber}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-2xl border border-gold/30 bg-obsidian-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-neutral-800 pb-5 text-xs">
            <div>
              <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">Payment Method</p>
              <p className="font-bold text-ivory mt-0.5">{order.paymentMethod.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">Payment Status</p>
              <p className="font-bold text-emerald-400 mt-0.5">{STATUS_LABELS[order.paymentStatus] || order.paymentStatus}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">Fulfillment</p>
              <p className="font-bold text-gold mt-0.5">{order.orderStatus}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">Total Amount</p>
              <p className="font-serif font-bold text-base text-gold-200 mt-0.5">{formatCurrency(Number(order.total))}</p>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-3 pt-2">
            <p className="text-xs uppercase tracking-wider text-gold font-semibold">Fragrance Items:</p>
            <div className="space-y-2 text-xs">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-obsidian-800/60 border border-neutral-800">
                  <span className="text-neutral-200">
                    {item.name} <span className="text-neutral-500 font-mono">Ã— {item.quantity}</span>
                  </span>
                  <span className="font-mono text-gold font-medium">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
              Insured Courier Delivery Destination:
            </p>
            <p className="font-medium text-ivory">
              {order.address.fullName} &bull; {order.address.phone}
            </p>
            <p className="text-neutral-400">
              {order.address.line1}, {order.address.city}, {order.address.province} {order.address.postalCode}
            </p>
          </div>
        </div>

        {/* Bank Transfer Instructions */}
        {order.paymentMethod === "BANK_TRANSFER" && (
          <div className="rounded-2xl border border-gold/50 bg-gold/5 p-6 md:p-8 backdrop-blur-md space-y-4">
            <h2 className="font-serif text-xl font-bold text-gold">Complete Bank Transfer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
              <div className="p-3 rounded-xl bg-obsidian-900 border border-gold/20">
                <span className="text-neutral-500 block text-[10px]">Account Title</span>
                <span className="font-bold text-ivory">{process.env.BANK_TRANSFER_ACCOUNT_TITLE || "Maison Charcoal PVT LTD"}</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-900 border border-gold/20">
                <span className="text-neutral-500 block text-[10px]">Bank Name</span>
                <span className="font-bold text-ivory">{process.env.BANK_TRANSFER_BANK_NAME || "Meezan Bank Limited"}</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-900 border border-gold/20">
                <span className="text-neutral-500 block text-[10px]">Account Number</span>
                <span className="font-mono font-bold text-gold">{process.env.BANK_TRANSFER_ACCOUNT_NUMBER || "01020304050607"}</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-900 border border-gold/20">
                <span className="text-neutral-500 block text-[10px]">IBAN</span>
                <span className="font-mono text-xs text-gold truncate block">{process.env.BANK_TRANSFER_IBAN || "PK12MEZN0001020304050607"}</span>
              </div>
            </div>

            {latestPayment?.status === "AWAITING_VERIFICATION" ? (
              <p className="text-xs text-emerald-400 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30">
                Payment reference submitted & awaiting atelier verification. We will dispatch your flacons immediately upon confirmation.
              </p>
            ) : (
              <div className="pt-2">
                <BankTransferProofForm orderId={order.id} />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard/orders"
            className="btn-primary py-3.5 px-7 text-xs uppercase tracking-widest font-bold shadow-gold-glow"
          >
            View In Dashboard
          </Link>
          <Link
            href="/products"
            className="btn-secondary py-3.5 px-6 text-xs uppercase tracking-wider font-semibold"
          >
            Return to Shop  
          </Link>
        </div>
      </div>
    </div>
  );
}


