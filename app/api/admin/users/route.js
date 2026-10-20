// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Case-insensitive role check
    const userRole = session?.user?.role?.toUpperCase();
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orders = await prisma.order.findMany({
          where: { userId: u.id },
        });

        const orderCount = orders.length;
        const totalSpend = orders.reduce(
          (sum, o) => sum + (o.total || 0),
          0
        );
        const pendingPayments = orders.filter(
          (o) => o.paymentStatus !== "PAID"
        ).length;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isAdmin: u.role === "ADMIN",
          createdAt: u.createdAt,
          orderCount,
          totalSpend,
          pendingPayments,
          productCount: 0, // Filhaal 0 set kar rahe hain
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (err) {
    console.error("Users API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}