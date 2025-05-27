import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();
  if (!amount) return NextResponse.json({ error: "Amount required" }, { status: 400 });

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `order_rcpt_${userId}_${Date.now()}`,
      notes: { userId },
    });
    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}