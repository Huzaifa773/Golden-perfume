// app/api/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================
// GET — List orders
// ============================================================
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");
    const isAdmin = session?.user?.role === "ADMIN";

    let userIdToQuery = null;

    if (isAdmin) {
      userIdToQuery = requestedUserId || null;
    } else if (session?.user?.id) {
      userIdToQuery = session.user.id;
    } else if (requestedUserId && requestedUserId !== "guest") {
      userIdToQuery = requestedUserId;
    }

    const where = userIdToQuery ? { userId: userIdToQuery } : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
          },
        },
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Format orders for frontend
    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shippingCost),
      discount: Number(o.discount),
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      notes: o.notes,
      // ✅ YEH 2 LINES ADD KAREIN (TID aur Receipt ke liye)
      paymentReference: o.paymentReference, 
      proofImageUrl: o.proofImageUrl,
      
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      shippingAddress: o.address
        ? {
            line1: o.address.line1,
            line2: o.address.line2,
            city: o.address.city,
            province: o.address.province,
            postalCode: o.address.postalCode,
            country: o.address.country,
          }
        : null,
      items: o.items.map((it) => {
        let imageUrl = null;
        if (it.product && it.product.images && it.product.images.length > 0) {
          imageUrl = it.product.images[0].url;
        }

        return {
          productId: it.productId,
          name: it.name,
          price: Number(it.price),
          quantity: it.quantity,
          image: imageUrl || "/images/products/placeholder.jpg",
        };
      }),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// POST — Create order
// ============================================================
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!body.items || !body.items.length) {
      return NextResponse.json({ error: "Order must contain at least one item." }, { status: 400 });
    }

    if (!body.customerName || !body.customerPhone || !body.shippingAddress) {
      return NextResponse.json({ error: "Customer name, phone, and shipping address are required." }, { status: 400 });
    }

    let userId = session?.user?.id || body.userId;

    if (!userId || userId === "guest") {
      const guestEmail = body.customerEmail?.toLowerCase().trim() || `guest-${Date.now()}@maisoncharcoal.com`;
      let guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });

      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: body.customerName || "Guest Customer",
            email: guestEmail,
            phone: body.customerPhone || null,
            role: "CUSTOMER",
            isVerified: true,
          },
        });
      }
      userId = guestUser.id;
    }

    const addr = body.shippingAddress;
    const address = await prisma.address.create({
      data: {
        userId,
        fullName: addr.fullName || body.customerName,
        phone: addr.phone || body.customerPhone,
        line1: addr.line1,
        line2: addr.line2 || null,
        city: addr.city,
        province: addr.province,
        postalCode: addr.postalCode || "00000",
        country: addr.country || "Pakistan",
        isDefault: false,
      },
    });

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validMethods = ["COD", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "SAFEPAY"];
    const paymentMethod = validMethods.includes(body.paymentMethod) ? body.paymentMethod : "COD";

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId: address.id,
        subtotal: body.subtotal,
        shippingCost: body.shippingCost || 0,
        discount: body.discount || 0,
        total: body.total,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        customerName: body.customerName,
        customerEmail: body.customerEmail || "guest@maisoncharcoal.com",
        customerPhone: body.customerPhone,
        notes: body.notes || null,
        paymentReference: body.paymentReference || null, // ✅ TID Save
        proofImageUrl: body.proofImageUrl || null, // ✅ Receipt Save
        items: {
          create: body.items.map((i) => ({
            productId: i.productId,
            name:
              i.size && !String(i.name).includes(`(${i.size})`)
                ? `${i.name} (${i.size})`
                : i.name,
            price: Number(i.price),
            quantity: Number(i.quantity) || 1,
          })),
        },
      },
      include: { items: true, address: true },
    });

    return NextResponse.json({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      }, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order." }, { status: 500 });
  }
}