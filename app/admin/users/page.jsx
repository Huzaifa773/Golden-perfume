// app/admin/users/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : (data.users || []));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.isAdmin || u.role === "ADMIN").length;
  const customerCount = totalUsers - adminCount;

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-obsidian-900/80 border border-neutral-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-gold font-bold uppercase tracking-wider mb-1">
              <Link href="/admin" className="hover:underline flex items-center gap-1 text-neutral-400 hover:text-gold">
                <ArrowLeft size={13} /> Admin Panel
              </Link>
              <span>/ User Registry</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Website Patrons &amp; Administrators
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Monitor client accounts, observe products added by individual users, and review order histories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 px-4 rounded-xl bg-obsidian-950 border border-gold/30 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Admins</span>
              <span className="font-serif text-lg font-bold text-gold">{adminCount}</span>
            </div>
            <div className="p-3 px-4 rounded-xl bg-obsidian-950 border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Customers</span>
              <span className="font-serif text-lg font-bold text-ivory">{customerCount}</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl border border-neutral-800 bg-obsidian-900/70 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-ivory flex items-center gap-2">
              <Users size={16} className="text-gold" />
              <span>Registered Accounts Directory ({totalUsers})</span>
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gold">Loading registered users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-obsidian-950 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 text-center">Products Added</th>
                    <th className="p-4 text-center">Orders Placed</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {users.map((u) => {
                    const isAdmin = u.isAdmin || u.role === "ADMIN";
                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gold-600 to-gold text-obsidian-950 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-ivory">{u.name}</p>
                              <p className="text-[11px] text-neutral-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {isAdmin ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/40 flex items-center gap-1 w-fit shadow-gold-glow">
                              <ShieldCheck size={11} /> Admin
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700 w-fit">
                              Customer
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-neutral-300">
                          {u.phone || "—"}
                        </td>

                        <td className="p-4 text-center">
                          <span className="font-bold text-gold">
                            {u.productCount || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="font-semibold text-ivory">
                            {u.orderCount || 0}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-gold">
                          PKR {(u.totalSpend || 0).toLocaleString()}
                        </td>

                        <td className="p-4 text-right">
                          {/* YAHAN CHANGE KIYA HAI - Ab yeh /admin/orders/user/[id] par jayega */}
                          <Link
                            href={`/admin/orders/user/${u.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian-950 transition-colors font-medium text-xs"
                          >
                            <span>Inspect User</span>
                            <ChevronRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}