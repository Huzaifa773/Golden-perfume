// app/api/notifications/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const userId = session?.user ? (session.user).id : (queryUserId || null);
    const notifs = await store.getNotifications(userId);
    return NextResponse.json(notifs);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }
    const ok = await store.markNotificationRead(id);
    return NextResponse.json({ success: ok });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
