import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const secret = env.RAZORPAY_WEBHOOK_SECRET;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case "payment.captured":
      await handlePaymentCaptured(event.payload.payment.entity);
      break;
    case "subscription.charged":
      await handleSubscriptionCharged(event.payload.subscription.entity);
      break;
    case "subscription.cancelled":
      await handleSubscriptionCancelled(event.payload.subscription.entity);
      break;
    default:
      console.log("Unhandled Razorpay event:", event.event);
  }

  return NextResponse.json({ status: "ok" });
}

async function handlePaymentCaptured(payment: any) {
  const userId = payment.notes.userId as string;
  if (!userId) return;

  await (await clerkClient()).users.updateUserMetadata(userId, {
    privateMetadata: { razorpayPaymentId: payment.id },
  });

  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      razorpayCustomerId: payment.customer_id,
      razorpaySubscriptionId: "", // one-time
      razorpayPlanId: "",        
      razorpayStatus: "captured",
      razorpayCurrentPeriodEnd: new Date(),
      razorpayCancelAtPeriodEnd: false,
    },
    update: {
      razorpayStatus: "captured",
      razorpayCurrentPeriodEnd: new Date(),
    },
  });
}

async function handleSubscriptionCharged(sub: any) {
  const userId = sub.notes.userId as string;
  if (!userId) return;

  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      razorpayCustomerId: sub.customer_id,
      razorpaySubscriptionId: sub.id,
      razorpayPlanId: sub.plan_id,
      razorpayStatus: sub.status,
      razorpayCurrentPeriodEnd: new Date(sub.current_end * 1000),
      razorpayCancelAtPeriodEnd: sub.status === "cancelled",
    },
    update: {
      razorpayPlanId: sub.plan_id,
      razorpayStatus: sub.status,
      razorpayCurrentPeriodEnd: new Date(sub.current_end * 1000),
      razorpayCancelAtPeriodEnd: sub.status === "cancelled",
    },
  });
}

async function handleSubscriptionCancelled(sub: any) {
  const userId = sub.notes.userId as string;
  if (!userId) return;

  await prisma.userSubscription.update({
    where: { userId },
    data: { razorpayStatus: "cancelled", razorpayCancelAtPeriodEnd: true },
  });
}