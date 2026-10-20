// app/api/orders/[id]/items/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH — Update quantity of an item
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = params;
    const { itemId, quantity } = await req.json();

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!session.user.isAdmin && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ============================================================
    // PAYMENT LOCK — Cannot change quantity if payment is PAID
    // ============================================================
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          error:
            "Payment has already been cleared. Quantity cannot be changed. Please contact support for any modifications.",
        },
        { status: 400 }
      );
    }

    // Update the order item quantity
    await prisma.orderItem.updateMany({
      where: { orderId, productId: itemId },
      data: { quantity: Number(quantity) },
    });

    // Recalculate order total
    const updatedItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const newSubtotal = updatedItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const newTotal =
      newSubtotal + Number(order.shippingCost) - Number(order.discount);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal,
        total: newTotal,
      },
    });

    // Return fresh order WITH product images
    const fresh = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        address: true,
        payments: true,
      },
    });

    return NextResponse.json(fresh);
  } catch (err) {
    console.error("Update quantity error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Remove an item from an order
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = params;
    const { itemId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!session.user.isAdmin && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ============================================================
    // PAYMENT LOCK — Cannot remove items if payment is PAID
    // ============================================================
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          error:
            "Payment has already been cleared. Items cannot be removed. Please contact support for any modifications.",
        },
        { status: 400 }
      );
    }

    await prisma.orderItem.deleteMany({
      where: { orderId, productId: itemId },
    });

    // Recalculate
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const newSubtotal = remainingItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const newTotal =
      newSubtotal + Number(order.shippingCost) - Number(order.discount);

    await prisma.order.update({
      where: { id: orderId },
      data: { subtotal: newSubtotal, total: newTotal },
    });

    // Return fresh order WITH product images
    const fresh = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        address: true,
        payments: true,
      },
    });

    return NextResponse.json(fresh);
  } catch (err) {
    console.error("Remove item error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}