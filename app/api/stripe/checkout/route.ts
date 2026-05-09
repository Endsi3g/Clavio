import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, type PlanId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { plan, email } = await request.json()

    if (!plan || !PLANS[plan as PlanId] || plan === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLANS[plan as PlanId]
    if (!planConfig.priceId) {
      return NextResponse.json({ error: 'No price configured for this plan' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      customer_email: email ?? undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing?success=1&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing?canceled=1`,
      metadata: { plan },
      subscription_data: { metadata: { plan } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
