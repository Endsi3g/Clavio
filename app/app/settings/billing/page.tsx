'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { PLANS } from '@/lib/stripe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, CreditCard, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Subscription {
  plan: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  activated_at?: string
  canceled_at?: string
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('settings')
      .select('value_json')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('key', 'subscription')
      .maybeSingle()
      .then(({ data }) => {
        setSubscription((data?.value_json as Subscription) ?? { plan: 'free' })
        setLoading(false)
      })
  }, [supabase])

  const currentPlan = subscription?.plan ?? 'free'

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return
    setRedirecting(planId)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setRedirecting(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your subscription and plan.</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 capitalize">{currentPlan} plan</Badge>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(PLANS).map(([planId, plan]) => {
          const isCurrent = currentPlan === planId
          const isUpgrade = !isCurrent && (
            (planId === 'pro' && currentPlan === 'free') ||
            (planId === 'agency' && currentPlan !== 'agency')
          )

          return (
            <Card
              key={planId}
              className={cn(
                'relative border',
                isCurrent && 'border-blue-400 ring-1 ring-blue-300',
                planId === 'pro' && !isCurrent && 'border-slate-200',
                planId === 'agency' && !isCurrent && 'border-slate-200'
              )}
            >
              {planId === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white text-[10px] px-2">Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                  {isCurrent && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-slate-500">/mo</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {plan.limits.posts_per_month === -1 ? 'Unlimited posts' : `${plan.limits.posts_per_month} posts/mo`}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {plan.limits.workspaces === -1 ? 'Unlimited workspaces' : `${plan.limits.workspaces} workspace${plan.limits.workspaces > 1 ? 's' : ''}`}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {plan.limits.platforms} platform{plan.limits.platforms > 1 ? 's' : ''}
                  </li>
                  {planId !== 'free' && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Approval workflows
                    </li>
                  )}
                  {planId === 'agency' && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Client portal
                    </li>
                  )}
                </ul>

                {isCurrent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled
                  >
                    Current plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    size="sm"
                    className="w-full bg-blue-500 hover:bg-blue-600 gap-1.5"
                    onClick={() => handleUpgrade(planId)}
                    disabled={!!redirecting}
                  >
                    {redirecting === planId ? (
                      'Redirecting…'
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        Upgrade
                      </>
                    )}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current subscription details */}
      {subscription?.stripe_subscription_id && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              Subscription details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subscription ID</span>
              <span className="font-mono text-slate-700">{subscription.stripe_subscription_id}</span>
            </div>
            {subscription.activated_at && (
              <div className="flex justify-between">
                <span className="text-slate-500">Activated</span>
                <span className="font-mono text-slate-700">
                  {new Date(subscription.activated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
