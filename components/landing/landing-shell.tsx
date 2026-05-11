'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

const NAV_LINKS = [
  { label: 'Story', href: '/story' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

export function LandingShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Glass pill nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-4">
        <div
          className={`flex items-center justify-between w-full max-w-5xl px-5 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-lg'
              : 'bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/40'
          }`}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm group-hover:bg-blue-600 transition-colors">
              C
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight select-none">clavio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-light tracking-wide transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AnimatedThemeToggler sound={false} />
            <Link
              href="/login"
              className="rounded-full bg-slate-900 dark:bg-white px-5 py-2 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-10 px-6 mt-24">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-lg tracking-tighter text-slate-900 dark:text-white">clavio</span>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Clavio. The AI Content OS for creators.
          </p>
          <nav className="flex gap-5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
