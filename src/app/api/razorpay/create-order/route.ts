// src/app/api/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const amount = plan === 'premium-plus' ? 99900 : 49900  // in paise

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${userId}_${Date.now()}`,
      notes: { userId }
    })
    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }
}
