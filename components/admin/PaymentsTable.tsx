"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface PaymentRow {
  id: string;
  method: string;
  status: string;
  amount: number;
  gatewayReference: string | null;
  proofImageUrl: string | null;
  createdAt: string;
  order: { orderNumber: string; customerName: string };
}

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(payments);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function decide(id: string, decision: "APPROVE" | "REJECT") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setRows((r) => r.map((p) => (p.id === id ? { ...p, status: decision === "APPROVE" ? "SUCCESS" : "FAILED" } : p)));
      toast.success(decision === "APPROVE" ? "Payment approved" : "Payment rejected");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-black-200 bg-black">
      <table className="w-full min-w-[800px] text-sm">
        <thead className="border-b border-neutral-200 bg-black-50 text-left text-xs uppercase tracking-wide text-gold-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100 text-white">
              <td className="px-4 py-3 font-medium text-white">{p.order.orderNumber}</td>
              <td className="px-4 py-3">{p.order.customerName}</td>
              <td className="px-4 py-3">{p.method.replace("_", " ")}</td>
              <td className="px-4 py-3">{formatCurrency(Number(p.amount))}</td>
              <td className="px-4 py-3">
                {p.gatewayReference || "—"}
                {p.proofImageUrl && (
                  <a href={p.proofImageUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs text-gold hover:underline">proof</a>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    p.status === "SUCCESS" ? "bg-green-100 text-green-700" :
                    p.status === "FAILED" ? "bg-red-100 text-red-700" :
                    p.status === "AWAITING_VERIFICATION" ? "bg-amber-100 text-amber-700" :
                    "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {p.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {p.status === "AWAITING_VERIFICATION" ? (
                  <div className="flex justify-end gap-2">
                    <button disabled={busyId === p.id} onClick={() => decide(p.id, "APPROVE")} className="rounded-sm bg-green-600 p-1.5 text-white hover:bg-green-700 disabled:opacity-50">
                      {busyId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button disabled={busyId === p.id} onClick={() => decide(p.id, "REJECT")} className="rounded-sm bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

