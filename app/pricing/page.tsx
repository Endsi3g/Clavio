import { LandingShell } from '@/components/landing/landing-shell'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For creators just getting started.',
    features: [
      '5 ideas per month',
      '2 video uploads',
      'Basic publishing (3 platforms)',
      'Local AI (Ollama)',
      'Community support',
    ],
    cta: 'Get started free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Creator',
    price: '$19',
    period: 'per month',
    description: 'For full-time content creators.',
    features: [
      'Unlimited ideas',
      '30 video uploads / month',
      'All platforms',
      'Local AI + advanced prompts',
      'n8n automation bridge',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Start Creator plan',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$79',
    period: 'per month',
    description: 'For teams and creative agencies.',
    features: [
      'Everything in Creator',
      'Multiple workspaces',
      'Team collaboration',
      'Custom AI prompts',
      'White-label exports',
      'Dedicated support',
    ],
    cta: 'Contact us',
    href: '/contact',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <LandingShell>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">Pricing</span>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            Simple, honest pricing.
          </h1>
          <p className="mt-5 text-lg font-light text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            No hidden fees. No cloud AI required. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 border transition-all duration-300 flex flex-col ${
                plan.highlight
                  ? 'bg-slate-900 dark:bg-white border-transparent shadow-2xl scale-[1.02]'
                  : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="mb-6">
                <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${plan.highlight ? 'text-blue-400' : 'text-blue-500'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold tracking-tight ${plan.highlight ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-light ${plan.highlight ? 'text-white/60 dark:text-slate-500' : 'text-slate-400'}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm font-light ${plan.highlight ? 'text-white/70 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <span className={`text-xs ${plan.highlight ? 'text-blue-400' : 'text-blue-500'}`}>✓</span>
                    <span className={`font-light ${plan.highlight ? 'text-white/85 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center rounded-full py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                  plan.highlight
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </LandingShell>
  )
}
