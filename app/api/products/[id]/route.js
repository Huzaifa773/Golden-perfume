// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================
// GET — Single product detail with variants
// ============================================================
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
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

      // Category
      category: product.category?.slug || product.category?.name || "men",
      categoryName: product.category?.name || "Men's Perfume",
      categoryId: product.categoryId,

      // Images (array of URLs)
      images: product.images.map((img) => img.url),

      // Variants (array of objects strictly sorted by position)
      variants: product.variants.map((v, idx) => ({
        id: v.id,
        size: v.size,
        price: Number(v.price),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        stock: v.stock,
        position: v.position ?? idx,
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
// PUT — Update product with variants (Admin)
// ============================================================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ---------- CATEGORY RESOLUTION ----------
    let categoryId = existing.categoryId;
    if (body.category) {
      const catSlug = body.category.toLowerCase().trim();
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: catSlug },
            { name: { contains: body.category } },
          ],
        },
      });

      if (!category) {
        const catName = body.category.charAt(0).toUpperCase() + body.category.slice(1);
        category = await prisma.category.create({
          data: {
            name: catName,
            slug: catSlug,
          },
        });
      }
      categoryId = category.id;
    }

    // ---------- VARIANTS HANDLING ----------
    const incomingVariants = Array.isArray(body.variants) ? body.variants : null;
    let validVariants = null;

    if (incomingVariants) {
      validVariants = incomingVariants
        .filter((v) => v && v.size && String(v.size).trim() && (v.price !== undefined && v.price !== null && v.price !== ""))
        .map((v, i) => ({
          size: String(v.size).trim(),
          price: Number(v.price),
          discountPrice: v.discountPrice && Number(v.discountPrice) > 0 ? Number(v.discountPrice) : null,
          stock: v.stock !== undefined && v.stock !== null ? Math.max(0, parseInt(v.stock, 10)) : 0,
          position: i,
        }));
    }

    // ---------- IMAGES HANDLING ----------
    const incomingImages = Array.isArray(body.images) ? body.images : null;
    let validImages = null;
    if (incomingImages) {
      validImages = incomingImages
        .filter((url) => typeof url === "string" && url.trim().length > 0)
        .map((url, i) => ({ url: url.trim(), position: i }));
    }

    // If variants exist, synchronize base product values to match variant 0!
    // This completely eliminates size ↔ price mismatch between base product and variants.
    let baseSize = body.size ?? existing.size;
    let basePrice = body.price !== undefined ? Number(body.price) : existing.price;
    let baseDiscountPrice =
      body.discountPrice !== undefined
        ? body.discountPrice
          ? Number(body.discountPrice)
          : null
        : existing.discountPrice;
    let baseStock = body.stock !== undefined ? Number(body.stock) : existing.stock;

    if (validVariants && validVariants.length > 0) {
      const primaryVariant = validVariants[0];
      baseSize = primaryVariant.size;
      basePrice = primaryVariant.price;
      baseDiscountPrice = primaryVariant.discountPrice;
      const totalVariantStock = validVariants.reduce((sum, v) => sum + v.stock, 0);
      baseStock = totalVariantStock > 0 ? totalVariantStock : (Number(body.stock) || existing.stock);
    }

    // Perform database updates
    await prisma.$transaction(async (tx) => {
      // 1. Update images if provided
      if (validImages) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (validImages.length > 0) {
          await tx.productImage.createMany({
            data: validImages.map((img) => ({
              productId: id,
              url: img.url,
              position: img.position,
            })),
          });
        }
      }

      // 2. Update variants if provided
      if (validVariants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (validVariants.length > 0) {
          await tx.productVariant.createMany({
            data: validVariants.map((v) => ({
              productId: id,
              size: v.size,
              price: v.price,
              discountPrice: v.discountPrice,
              stock: v.stock,
              position: v.position,
            })),
          });
        }
      }

      // 3. Update main product record
      await tx.product.update({
        where: { id },
        data: {
          name: body.name ?? undefined,
          description: body.description ?? undefined,
          price: basePrice,
          discountPrice: baseDiscountPrice,
          brand: body.brand ?? undefined,
          size: baseSize,
          fragranceType: body.fragranceType ?? undefined,
          sku: body.sku ?? undefined,
          stock: baseStock,
          categoryId: categoryId,
          targetPage: body.targetPage ?? undefined,
          isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
          isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : undefined,
          isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : undefined,
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
          notes: body.notes !== undefined ? body.notes : undefined,
        },
      });
    });

    // Fetch updated product with relations
    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updated.id,
        name: updated.name,
        price: Number(updated.price),
        discountPrice: updated.discountPrice ? Number(updated.discountPrice) : null,
        size: updated.size,
        stock: updated.stock,
        variants: updated.variants.map((v) => ({
          id: v.id,
          size: v.size,
          price: Number(v.price),
          discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
          stock: v.stock,
          position: v.position,
        })),
        images: updated.images.map((img) => img.url),
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
// DELETE — Delete product (Admin)
// ============================================================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

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

    // Check if order items exist
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: id },
    });

    if (hasOrders) {
      // Soft-delete / deactivate so order history remains unbroken
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        softDeleted: true,
        message: "Product deactivated (retained for historical customer orders)",
      });
    }

    // Hard delete with cascade on variants & images
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product permanently removed from boutique",
    });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}