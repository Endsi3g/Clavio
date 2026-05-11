import { PremiumHero } from '@/components/landing/premium/premium-hero'
import { StartSection } from '@/components/landing/premium/start-section'
import { FeaturesChess } from '@/components/landing/premium/features-chess'
import { FeaturesGrid } from '@/components/landing/premium/features-grid'
import { StatsSection } from '@/components/landing/premium/stats-section'
import { TestimonialsSection } from '@/components/landing/premium/testimonials-section'
import { CtaFooter } from '@/components/landing/premium/cta-footer'

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen w-full selection:bg-white/20">
      <PremiumHero />
      <div className="relative z-10 bg-black w-full flex flex-col items-center overflow-hidden">
        <StartSection />
        <FeaturesChess />
        <FeaturesGrid />
        <StatsSection />
        <TestimonialsSection />
        <CtaFooter />
      </div>
    </div>
  )
}
