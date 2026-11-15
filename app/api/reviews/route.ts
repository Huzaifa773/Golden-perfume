export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Resolve productId if slug or id was passed
    let targetProductId = productId;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] },
      select: { id: true },
    });
    if (product) {
      targetProductId = product.id;
    }

    const reviews = await prisma.review.findMany({
      where: { productId: targetProductId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Number((reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / totalCount).toFixed(1))
        : 5.0;

    return NextResponse.json({
      reviews: reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: r.user?.name || "Verified Patron",
        userImage: r.user?.image || null,
      })),
      totalCount,
      averageRating,
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { productId, rating, comment } = parsed.data;

  // Resolve productId in case slug was provided
  let targetProductId = productId;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: productId }, { slug: productId }] },
    select: { id: true },
  });
  if (product) targetProductId = product.id;

  // Only customers who have actually ordered this product (or admin) may review it.
  const isAdmin = (session.user as any).role?.toUpperCase() === "ADMIN";
  const purchased = await prisma.orderItem.findFirst({
    where: { productId: targetProductId, order: { userId: session.user.id } },
  });
  if (!purchased && !isAdmin) {
    return NextResponse.json(
      { error: "You can only review products you have purchased" },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: session.user.id, productId: targetProductId } },
    update: { rating, comment },
    create: { userId: session.user.id, productId: targetProductId, rating, comment },
  });

  return NextResponse.json({ review }, { status: 201 });
}


