import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? '', process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err instanceof Error ? err.message : 'Invalid signature'}` }, { status: 400 })
  }

  const supabase = await createServerClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const plan = session.metadata?.plan ?? 'pro'

      await supabase.from('settings').upsert(
        {
          workspace_id: WORKSPACE_ID,
          key: 'subscription',
          value_json: {
            plan,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            activated_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id,key' }
      )

      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'info',
        source: 'stripe/webhook',
        message: `Subscription activated: ${plan} plan`,
        payload_json: { plan, customer: session.customer, subscription: session.subscription },
      })
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription

      await supabase.from('settings').upsert(
        {
          workspace_id: WORKSPACE_ID,
          key: 'subscription',
          value_json: { plan: 'free', stripe_subscription_id: sub.id, canceled_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id,key' }
      )

      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'warning',
        source: 'stripe/webhook',
        message: 'Subscription canceled — reverted to free plan',
        payload_json: { subscription_id: sub.id },
      })
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
