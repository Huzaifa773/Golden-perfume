// app/api/products/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================
// GET — List products (Prisma)
// ============================================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const targetPage = searchParams.get("targetPage") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured") === "true";

    // ---------- WHERE CLAUSE ----------
    const where = {
      isActive: true,
    };

    if (category && category !== "all") {
      where.category = { slug: category };
    }

    if (targetPage && targetPage !== "all" && targetPage !== "shop") {
      where.targetPage = targetPage;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (featured) {
      where.isFeatured = true;
    }

    // ---------- ORDER BY ----------
    let orderBy = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "featured") orderBy = { isFeatured: "desc" };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: [{ position: "asc" }, { price: "asc" }] }, // <-- Variants include
        },
      }),
      prisma.product.count({ where }),
    ]);

    // ---------- FORMAT PRODUCTS ----------
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      brand: p.brand,
      size: p.size,
      fragranceType: p.fragranceType,
      sku: p.sku,
      stock: p.stock,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isActive: p.isActive,
      notes: p.notes,
      targetPage: p.targetPage,
      category: p.category?.name || p.category?.slug || "Perfume",
      categorySlug: p.category?.slug || null,
      images: p.images.map((img) => img.url),
      variants: p.variants.map((v) => ({
        id: v.id,
        size: v.size,
        price: Number(v.price),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        stock: v.stock,
      })),
      rating: 5,
      reviewCount: 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      products: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — Create product with variants (admin only)
// ============================================================
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // ---------- CATEGORY HANDLE KAREIN ----------
    // Form "men", "women", "attar" bhej raha hai.
    // Prisma mein Category model hai jisme slug/name hai.
    let categoryId = null;

    if (body.category) {
      // Category ko slug ya name se dhoondein
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: body.category.toLowerCase() },
            { name: { contains: body.category } },
          ],
        },
      });

      // Agar category nahi mili, toh bana dein
      if (!category) {
        const catName = body.category.charAt(0).toUpperCase() + body.category.slice(1);
        category = await prisma.category.create({
          data: {
            name: catName,
            slug: body.category.toLowerCase(),
          },
        });
      }

      categoryId = category.id;
    }

    // Agar categoryId phir bhi nahi mila, toh pehli category le lein
    if (!categoryId) {
      const firstCat = await prisma.category.findFirst();
      if (!firstCat) {
        return NextResponse.json(
          { error: "No categories found. Please create a category first." },
          { status: 400 }
        );
      }
      categoryId = firstCat.id;
    }

    // ---------- SLUG GENERATE ----------
    const slug =
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);

    // ---------- SKU GENERATE ----------
    const sku =
      body.sku ||
      "MC-" +
        Math.floor(Math.random() * 90000000 + 10000000) +
        "-" +
        Math.floor(Math.random() * 900 + 100);

    // ---------- VARIANTS EXTRACT ----------
    const rawVariants = Array.isArray(body.variants)
      ? body.variants.filter((v) => v && v.size && String(v.size).trim() && (v.price !== undefined && v.price !== null && v.price !== ""))
      : [];

    const variants = rawVariants.map((v, i) => ({
      size: String(v.size).trim(),
      price: Number(v.price),
      discountPrice: v.discountPrice && Number(v.discountPrice) > 0 ? Number(v.discountPrice) : null,
      stock: v.stock !== undefined && v.stock !== null ? Math.max(0, parseInt(v.stock, 10)) : 0,
      position: i,
    }));

    // Synchronize base product values with primary variant to prevent any size ↔ price mismatch!
    let basePrice = Number(body.price);
    let baseDiscountPrice = body.discountPrice ? Number(body.discountPrice) : null;
    let baseSize = body.size || "100ml";
    let baseStock = Number(body.stock) || 20;

    if (variants.length > 0) {
      basePrice = variants[0].price;
      baseDiscountPrice = variants[0].discountPrice;
      baseSize = variants[0].size;
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      baseStock = totalStock > 0 ? totalStock : baseStock;
    }

    // ---------- CREATE PRODUCT ----------
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        sku,
        description: body.description || "An artisanal luxury formulation.",
        price: basePrice,
        discountPrice: baseDiscountPrice,
        brand: body.brand || "Maison Charcoal",
        size: baseSize,
        fragranceType: body.fragranceType || "EAU_DE_PARFUM",
        stock: baseStock,
        targetPage: body.targetPage || body.category || "shop",
        notes: body.notes || null,
        isFeatured: Boolean(body.isFeatured),
        isBestSeller: Boolean(body.isBestSeller),
        isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : true,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        categoryId,

        // Images create
        images: {
          create: Array.isArray(body.images)
            ? body.images
                .filter((url) => url && typeof url === "string" && url.trim())
                .map((url, i) => ({ url: url.trim(), position: i }))
            : [],
        },

        // Variants create
        variants: {
          create: variants.map((v) => ({
            size: v.size,
            price: v.price,
            discountPrice: v.discountPrice,
            stock: v.stock,
            position: v.position,
          })),
        },
      },
      include: {
        images: true,
        variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
        category: true,
      },
    });

    return NextResponse.json(
      {
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stock: v.stock,
          })),
          images: product.images.map((img) => img.url),
        },
        success: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}