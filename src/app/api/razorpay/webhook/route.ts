// src/app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import crypto from 'crypto'
import { env } from '@/env'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('x-razorpay-signature')!
  const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex')
  if (sig !== expected) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const event = JSON.parse(body)
  switch (event.event) {
    case 'payment.captured':
      await handlePayment(event.payload.payment.entity)
      break
    case 'subscription.charged':
      await handleSubscription(event.payload.subscription.entity)
      break
    case 'subscription.cancelled':
      await handleCancel(event.payload.subscription.entity)
      break
  }
  return NextResponse.json({ status: 'ok' })
}

async function handlePayment(payment: any) {
  const userId = payment.notes.userId
  if (!userId) return
  await (await clerkClient()).users.updateUserMetadata(userId, {
    privateMetadata: { razorpayPaymentId: payment.id }
  })
  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      razorpayCustomerId: payment.customer_id,
      razorpaySubscriptionId: '',
      razorpayPlanId: '',
      razorpayStatus: 'captured',
      razorpayCurrentPeriodEnd: new Date(),
      razorpayCancelAtPeriodEnd: false
    },
    update: {
      razorpayStatus: 'captured',
      razorpayCurrentPeriodEnd: new Date()
    }
  })
}

async function handleSubscription(sub: any) {
  const userId = sub.notes.userId
  if (!userId) return
  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      razorpayCustomerId: sub.customer_id,
      razorpaySubscriptionId: sub.id,
      razorpayPlanId: sub.plan_id,
      razorpayStatus: sub.status,
      razorpayCurrentPeriodEnd: new Date(sub.current_end * 1000),
      razorpayCancelAtPeriodEnd: sub.status === 'cancelled'
    },
    update: {
      razorpayPlanId: sub.plan_id,
      razorpayStatus: sub.status,
      razorpayCurrentPeriodEnd: new Date(sub.current_end * 1000),
      razorpayCancelAtPeriodEnd: sub.status === 'cancelled'
    }
  })
}

async function handleCancel(sub: any) {
  const userId = sub.notes.userId
  if (!userId) return
  await prisma.userSubscription.update({
    where: { userId },
    data: { razorpayStatus: 'cancelled', razorpayCancelAtPeriodEnd: true }
  })
}
