import { LandingNav } from '@/components/landing/landing-nav'
import { Hero } from '@/components/landing/hero'
import { PipelineSection } from '@/components/landing/pipeline-section'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { SocialPlatforms } from '@/components/landing/social-platforms'
import { PricingSection } from '@/components/landing/pricing-section'
import { Testimonials } from '@/components/landing/testimonials'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <LandingNav />
      <Hero />
      <PipelineSection />
      <FeaturesGrid />
      <SocialPlatforms />
      <Testimonials />
      <PricingSection />
      <LandingFooter />
    </div>
  )
}
