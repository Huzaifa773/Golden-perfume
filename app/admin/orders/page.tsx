// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";

interface UserWithStats {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isAdmin: boolean;
  orderCount: number;
  totalSpend: number;
  pendingPayments: number;
  productCount: number;
}

export default function AdminOrdersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadUsersWithOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        const allUsers: UserWithStats[] = Array.isArray(data)
          ? data
          : data.users || [];

        const usersWithOrders = allUsers.filter(
          (u) => (u.orderCount || 0) > 0
        );
        setUsers(usersWithOrders);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUsersWithOrders();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-gold font-bold uppercase tracking-wider mb-1">
              <Link
                href="/admin"
                className="hover:underline flex items-center gap-1 text-neutral-400 hover:text-gold"
              >
                <ArrowLeft size={13} /> Admin Panel
              </Link>
              <span>/ Customer Orders</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Customer Orders Overview
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Har customer ke orders ki summary dekhein. Kisi bhi customer par
              click karke uski poori detail aur payment verification karein.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 px-4 rounded-xl bg-obsidian-950 border border-gold/30 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Active Customers
              </span>
              <span className="font-serif text-lg font-bold text-gold">
                {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full bg-obsidian-900 border border-neutral-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-ivory placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <Search
            size={14}
            className="absolute left-3 top-3 text-neutral-400"
          />
        </div>

        {/* Users Table */}
        <div className="rounded-3xl border border-neutral-800 bg-obsidian-900/70 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-ivory flex items-center gap-2">
              <Users size={16} className="text-gold" />
              <span>Customers With Orders ({filteredUsers.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gold">
              Loading customers orders...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              No customers have placed any orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* ✅ Table columns ki width fix ki hai */}
              <table className="w-full min-w-[1000px] text-left text-xs text-neutral-300 table-fixed">
                <thead className="bg-obsidian-950 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-4 w-[120px]">User ID</th>
                    <th className="p-4 w-[220px]">Customer</th>
                    <th className="p-4 w-[120px]">Contact</th>
                    <th className="p-4 w-[100px] text-center">Orders</th>
                    {/* ✅ Total Spent ko bari width di hai taake bara amount fit ho */}
                    <th className="p-4 w-[200px] text-right">Total Spent</th>
                    <th className="p-4 w-[100px] text-center">Pending</th>
                    <th className="p-4 w-[110px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-mono text-[10px] text-neutral-500 truncate">
                        {u.id.slice(0, 12)}...
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gold-600 to-gold text-obsidian-950 font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ivory truncate">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-neutral-400 flex items-center gap-1 truncate">
                              <Mail size={10} className="shrink-0" /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-neutral-300">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Phone size={11} className="text-gold shrink-0" />
                          {u.phone || "—"}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-bold text-gold text-sm inline-flex items-center gap-1">
                          <ShoppingBag size={12} />
                          {u.orderCount || 0}
                        </span>
                      </td>

                      {/* ✅ Yahan break-all lagaya hai taake bara amount table na tore */}
                      <td className="p-4 font-bold text-gold text-right text-xs break-all whitespace-normal leading-tight">
                        PKR {Number(u.totalSpend || 0).toLocaleString()}
                      </td>

                      <td className="p-4 text-center">
                        {u.pendingPayments > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                            {u.pendingPayments} Pending
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                            All Clear
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/user/${u.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian-950 transition-colors font-medium text-[10px] whitespace-nowrap"
                        >
                          <span>View</span>
                          <ChevronRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}