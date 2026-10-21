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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
    },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

const variantUpdateSchema = z.object({
  size: z.string().min(1),
  price: z.number().positive(),
  discountPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  position: z.number().int().min(0).optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().nullable().optional(),
  brand: z.string().min(1).optional(),
  size: z.string().min(1).optional(),
  fragranceType: z.enum(["EAU_DE_PARFUM", "EAU_DE_TOILETTE", "EAU_DE_COLOGNE", "PARFUM_EXTRAIT", "ATTAR", "BODY_MIST"]).optional(),
  sku: z.string().min(2).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  targetPage: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(variantUpdateSchema).optional(),
  notes: z.any().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { images, variants, ...data } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let basePrice = data.price;
  let baseDiscountPrice = data.discountPrice;
  let baseSize = data.size;
  let baseStock = data.stock;

  if (variants && variants.length > 0) {
    basePrice = variants[0].price;
    baseDiscountPrice = variants[0].discountPrice ?? null;
    baseSize = variants[0].size;
    const totalVariantStock = variants.reduce((sum, v) => sum + v.stock, 0);
    baseStock = totalVariantStock > 0 ? totalVariantStock : (data.stock ?? product.stock);
  }

  await prisma.$transaction(async (tx) => {
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: params.id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url, i) => ({ productId: params.id, url, position: i })),
        });
      }
    }

    if (variants) {
      await tx.productVariant.deleteMany({ where: { productId: params.id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, i) => ({
            productId: params.id,
            size: v.size.trim(),
            price: v.price,
            discountPrice: v.discountPrice ?? null,
            stock: v.stock,
            position: v.position ?? i,
          })),
        });
      }
    }

    await tx.product.update({
      where: { id: params.id },
      data: {
        ...data,
        price: basePrice,
        discountPrice: baseDiscountPrice,
        size: baseSize,
        stock: baseStock,
      },
    });
  });

  const updated = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
    },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // If the product has already been ordered, deleting it would break order
  // history (OrderItem references it). In that case we soft-delete
  // (deactivate) instead of a hard delete.
  const hasOrders = await prisma.orderItem.findFirst({ where: { productId: params.id } });
  if (hasOrders) {
    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ softDeleted: true });
  }

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
