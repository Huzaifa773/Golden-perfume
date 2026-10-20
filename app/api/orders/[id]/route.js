// app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ============================================================
// GET
// ============================================================
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// PUT
// ============================================================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ---------- USER CANCEL LOGIC ----------
    if (body.orderStatus === "CANCELLED") {
      if (!session?.user) {
        return NextResponse.json({ error: "Please log in" }, { status: 401 });
      }

      const userRole = session.user.role?.toUpperCase();
      const isAdmin = userRole === "ADMIN";

      if (!isAdmin) {
        if (existing.userId !== session.user.id) {
          return NextResponse.json(
            { error: "You can only cancel your own orders" },
            { status: 403 }
          );
        }

        if (existing.orderStatus !== "PENDING") {
          return NextResponse.json(
            {
              error:
                "Yeh order ab cancel nahi ho sakta. Admin ne already confirm kar diya hai.",
            },
            { status: 400 }
          );
        }

        if (existing.paymentStatus === "PAID") {
          return NextResponse.json(
            {
              error:
                "Payment already verified. Cancel karne ke liye admin se contact karein.",
            },
            { status: 400 }
          );
        }
      }
    }

    // ---------- PREPARE UPDATE DATA ----------
    const dataToUpdate = {};
    if (body.orderStatus) dataToUpdate.orderStatus = body.orderStatus;
    if (body.paymentStatus) dataToUpdate.paymentStatus = body.paymentStatus;

    // ✅ Cancellation reason save karein
    if (body.cancellationReason) {
      dataToUpdate.cancellationReason = body.cancellationReason;
    }
    if (body.orderStatus === "CANCELLED") {
      dataToUpdate.cancelledAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        items: true,
        address: true,
      },
    });

    // ---------- NOTIFICATION ----------
    if (body.orderStatus === "CANCELLED" && session?.user) {
      const isAdmin = session.user.role?.toUpperCase() === "ADMIN";
      if (!isAdmin) {
        await prisma.notification
          .create({
            data: {
              userId: existing.userId,
              title: "Order Cancelled",
              message: `Aap ka order ${existing.orderNumber} cancel kar diya gaya hai. Reason: ${body.cancellationReason || "Not specified"}`,
              isRead: false,
            },
          })
          .catch(() => {
            console.warn("Notification failed");
          });
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        orderNumber: updated.orderNumber,
        orderStatus: updated.orderStatus,
        paymentStatus: updated.paymentStatus,
        cancellationReason: updated.cancellationReason,
        cancelledAt: updated.cancelledAt,
      },
    });
  } catch (err) {
    console.error("PUT /api/orders/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// DELETE
// ============================================================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();

    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("Delete order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}