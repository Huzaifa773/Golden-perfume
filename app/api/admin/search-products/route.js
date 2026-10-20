// app/api/admin/search-products/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================
// GET: Saari saved searches (Admin Panel ke liye)
// ============================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();
    
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const list = await prisma.searchProduct.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error("Search Products GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================
// POST: Nayi search save karna (jab user search kare aur product na mile)
// ============================
export async function POST(req) {
  try {
    const body = await req.json();
    const { query, userId, userName, userEmail, userPhone } = body;

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const recorded = await prisma.searchProduct.create({
      data: {
        query: query.trim(),
        userId: userId && userId !== "guest" ? userId : null,
        userName: userName || "Guest Visitor",
        userEmail: userEmail || null,
        userPhone: userPhone || null,
      },
    });

    return NextResponse.json(recorded, { status: 201 });
  } catch (err) {
    console.error("Search Products POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================
// DELETE: Saved search hataana (Admin Panel se)
// ============================
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();
    
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.searchProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Search Products DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}