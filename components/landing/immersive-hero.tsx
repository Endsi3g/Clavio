'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

export function ImmersiveHero() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover scale-105 object-[center_30%]"
        src="/hero-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Subtle dark scrim across full frame */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Directional shadow: heavy bottom-left for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-transparent pointer-events-none" />

      {/* Progressive Gaussian blur at the bottom (vignette blur) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)',
        }}
      />
      {/* Layered blur for smooth progression */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
        }}
      />

      {/* Navigation Bar Glass Pill */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-5">
        <div
          className={`flex items-center justify-between w-full max-w-5xl px-5 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/10'
              : 'bg-white/8 backdrop-blur-md border border-white/15'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
              C
            </div>
            <span className="font-bold text-white text-lg tracking-tight select-none">clavio</span>
          </Link>

          {/* Center: Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Story', href: '/story' },
              { label: 'Features', href: '/features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Blog', href: '/blog' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-white/85 hover:text-white text-sm font-light tracking-wide transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: CTA + theme toggler */}
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler sound={false} />
            <Link
              href="/login"
              className="rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-black transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="absolute bottom-0 left-0 z-40 w-full px-6 pb-28 md:px-12 md:pb-36 lg:max-w-3xl">
        <div className="animate-element">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            From idea to<br />published automatically.
          </h1>
          <p
            className="mt-5 text-lg md:text-xl font-light text-white/80 max-w-xl leading-relaxed"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Clavio is the AI Content OS for creators. Capture ideas, process videos, publish everywhere powered by local AI.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-wrap items-center gap-4 animate-element animate-delay-200">
          {/* Primary glassmorphism bright */}
          <Link
            href="/login"
            className="group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-base font-bold text-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
          >
            <span className="relative z-10">Start Free</span>
          </Link>

          {/* Secondary glassmorphism ghost */}
          <Link
            href="/story"
            className="rounded-full px-8 py-3.5 text-base font-light text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            Watch the Demo
          </Link>
        </div>
      </main>
    </div>
  )
}

