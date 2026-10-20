// app/api/admin/products/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;

  const products = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { brand: { contains: search } },
          ],
        }
      : undefined,
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

const variantSchema = z.object({
  size: z.string().min(1),
  price: z.number().positive(),
  discountPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  position: z.number().int().min(0).default(0),
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  discountPrice: z.number().positive().nullable().optional(),
  brand: z.string().min(1),
  size: z.string().min(1),
  fragranceType: z.enum([
    "EAU_DE_PARFUM",
    "EAU_DE_TOILETTE",
    "EAU_DE_COLOGNE",
    "PARFUM_EXTRAIT",
    "ATTAR",
    "BODY_MIST",
  ]),
  sku: z.string().min(2),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { images, variants, ...data } = parsed.data;

  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku },
  });
  if (existingSku) {
    return NextResponse.json(
      { error: "A product with this SKU already exists" },
      { status: 409 }
    );
  }

  const slug =
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      images: {
        create: images.map((url, i) => ({ url, position: i })),
      },
      variants: {
        create: variants.map((v, i) => ({
          size: v.size,
          price: v.price,
          discountPrice: v.discountPrice ?? null,
          stock: v.stock,
          position: v.position ?? i,
        })),
      },
    },
    include: { images: true, category: true, variants: true },
  });

  return NextResponse.json({ product, productId: product.id }, { status: 201 });
}