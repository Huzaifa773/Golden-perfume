// app/api/admin/clear-payment/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    // ---------- AUTH ----------
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.toUpperCase();
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ---------- BODY ----------
    const body = await req.json();
    const {
      orderId,
      expectedDeliveryDate,
      orderStatus,
      paymentMethod: newPaymentMethod,
      action, // "confirm" | "mark-paid"
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    // ---------- ORDER FETCH ----------
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // ---------- PAYMENT METHOD UPDATE ----------
    // Agar admin ne dropdown se naya method select kiya hai, toh use update karein
    const validMethods = [
      "COD",
      "BANK_TRANSFER",
      "JAZZCASH",
      "EASYPAISA",
      "SAFEPAY",
    ];
    const finalPaymentMethod =
      newPaymentMethod && validMethods.includes(newPaymentMethod)
        ? newPaymentMethod
        : existingOrder.paymentMethod;

    // ---------- ACTION: MARK PAID ----------
    if (action === "mark-paid") {
      // Payment status ko PAID karein (chahe COD ho ya online)
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paymentMethod: finalPaymentMethod,
          orderStatus: orderStatus || "PROCESSING",
        },
      });

      // Payment record create karein
      await prisma.payment
        .create({
          data: {
            orderId: orderId,
            method: finalPaymentMethod,
            status: "SUCCESS",
            amount: existingOrder.total,
            currency: "PKR",
            verifiedById: session.user.id,
            verifiedAt: new Date(),
          },
        })
        .catch(() => {
          console.warn("Payment record create failed");
        });

      // User notification
      await prisma.notification
        .create({
          data: {
            userId: existingOrder.userId,
            title: "Payment Received ✅",
            message: `Aap ki payment receive ho gayi hai. Order ${existingOrder.orderNumber} ab processing mein hai. Expected delivery: ${
              expectedDeliveryDate || "2-3 din"
            }.`,
            isRead: false,
          },
        })
        .catch(() => {
          console.warn("Notification failed");
        });

      return NextResponse.json({
        success: true,
        action: "mark-paid",
        message: "Payment marked as PAID.",
        order: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          orderStatus: updatedOrder.orderStatus,
          paymentStatus: updatedOrder.paymentStatus,
          paymentMethod: updatedOrder.paymentMethod,
        },
      });
    }

    // ---------- ACTION: CONFIRM (default) ----------
    // Sirf orderStatus aur paymentMethod update karein
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: orderStatus || "CONFIRMED",
        paymentMethod: finalPaymentMethod,
      },
    });

    // User notification
    await prisma.notification
      .create({
        data: {
          userId: existingOrder.userId,
          title: "Order Confirmed ✅",
          message: `Aap ka order ${existingOrder.orderNumber} confirm ho gaya hai. Payment method: ${finalPaymentMethod}. Expected delivery: ${
            expectedDeliveryDate || "2-3 din"
          }.`,
          isRead: false,
        },
      })
      .catch(() => {
        console.warn("Notification failed");
      });

    return NextResponse.json({
      success: true,
      action: "confirm",
      message: "Order confirmed successfully.",
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
        paymentMethod: updatedOrder.paymentMethod,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/clear-payment error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process payment action." },
      { status: 500 }
    );
  }
}