// src/app/api/razorpay/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await prisma.userSubscription.findUnique({ where: { userId } })
  if (!sub?.razorpaySubscriptionId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId)
  await prisma.userSubscription.update({
    where: { userId },
    data: { razorpayCancelAtPeriodEnd: true }
  })

  return NextResponse.json({ success: true })
}
