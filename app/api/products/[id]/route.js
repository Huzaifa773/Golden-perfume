// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================
// GET — Single product detail with variants
// ============================================================
export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Prisma se product fetch karein
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ---------- FORMAT RESPONSE ----------
    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      discountPrice: product.discountPrice
        ? Number(product.discountPrice)
        : null,
      brand: product.brand,
      size: product.size,
      fragranceType: product.fragranceType,
      sku: product.sku,
      stock: product.stock,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      isActive: product.isActive,
      notes: product.notes,
      targetPage: product.targetPage,

      // Category (string name)
      category: product.category?.name || product.category?.slug || "Perfume",
      categorySlug: product.category?.slug || null,

      // Images (array of URLs)
      images: product.images.map((img) => img.url),

      // Variants (array of objects)
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size,
        price: Number(v.price),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        stock: v.stock,
      })),

      rating: 5,
      reviewCount: 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT — Update product (admin only)
// ============================================================
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ---------- VARIANTS HANDLE ----------
    const variants = Array.isArray(body.variants) ? body.variants : null;

    // Agar variants bheje gaye hain, toh pehle purane delete karein
    if (variants) {
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    // ---------- IMAGES HANDLE ----------
    const images = Array.isArray(body.images) ? body.images : null;

    if (images) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
    }

    // ---------- UPDATE PRODUCT ----------
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        description: body.description ?? undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        discountPrice:
          body.discountPrice !== undefined
            ? body.discountPrice
              ? Number(body.discountPrice)
              : null
            : undefined,
        brand: body.brand ?? undefined,
        size: body.size ?? undefined,
        fragranceType: body.fragranceType ?? undefined,
        sku: body.sku ?? undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        isFeatured: body.isFeatured ?? undefined,
        isBestSeller: body.isBestSeller ?? undefined,
        isNewArrival: body.isNewArrival ?? undefined,
        isActive: body.isActive ?? undefined,
        targetPage: body.targetPage ?? undefined,
        notes: body.notes ?? undefined,

        // New images create
        ...(images
          ? {
              images: {
                create: images
                  .filter((url) => url && url.trim())
                  .map((url, i) => ({ url, position: i })),
              },
            }
          : {}),

        // New variants create
        ...(variants
          ? {
              variants: {
                create: variants
                  .filter((v) => v.size && v.price)
                  .map((v, i) => ({
                    size: v.size.trim(),
                    price: Number(v.price),
                    discountPrice: v.discountPrice
                      ? Number(v.discountPrice)
                      : null,
                    stock: Number(v.stock) || 0,
                    position: i,
                  })),
              },
            }
          : {}),
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updated.id,
        name: updated.name,
        variants: updated.variants.map((v) => ({
          id: v.id,
          size: v.size,
          price: Number(v.price),
          discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
          stock: v.stock,
        })),
      },
    });
  } catch (err) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — Delete product (admin only)
// ============================================================
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // onDelete: Cascade ki wajah se images aur variants bhi delete ho jayenge
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}