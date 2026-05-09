'use client'

import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for solo creators just getting started.',
    cta: 'Get started free',
    ctaHref: '/app/dashboard',
    highlight: false,
    features: [
      '1 workspace',
      '5 published posts / month',
      '10 ideas / month',
      'AI idea generation',
      'Basic analytics',
      'Calendar view',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    description: 'For serious creators who publish consistently across platforms.',
    cta: 'Start Pro',
    ctaHref: '/app/dashboard',
    highlight: true,
    badge: 'Most popular',
    features: [
      '1 workspace',
      'Unlimited posts',
      'Unlimited ideas',
      'All 5 social platforms',
      'Video processing + Clips',
      'Script Studio + teleprompter',
      'Brand Kit',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/ month',
    description: 'For agencies managing content for multiple clients.',
    cta: 'Start Agency',
    ctaHref: '/app/dashboard',
    highlight: false,
    features: [
      'Up to 10 workspaces',
      'Everything in Pro',
      'Client portal (view-only)',
      'Approval workflow',
      'Inline comments',
      'Team members (unlimited)',
      'PDF reports',
      'White-label option',
      'Dedicated support',
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-950 py-32 px-6 border-t border-slate-800/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Simple pricing.
            <br />
            <span className="text-slate-500">No surprises.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Start free. Scale when you&apos;re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    <Zap className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-emerald-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block text-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
