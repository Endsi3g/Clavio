import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    limits: { posts_per_month: 5, workspaces: 1, platforms: 2 },
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    limits: { posts_per_month: 150, workspaces: 3, platforms: 5 },
  },
  agency: {
    name: 'Agency',
    price: 99,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? '',
    limits: { posts_per_month: -1, workspaces: -1, platforms: 5 },
  },
} as const

export type PlanId = keyof typeof PLANS
