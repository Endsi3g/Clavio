'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Play } from 'lucide-react'

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 pt-24 pb-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px]" />

      <motion.div
        className="relative z-10 mx-auto max-w-5xl text-center"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* Badge */}
        <motion.div variants={FADE_UP}>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400 mb-8">
            <Sparkles className="h-3 w-3" />
            AI-powered · Local-first · Built for creators
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={FADE_UP}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight"
        >
          The AI Content OS
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
            for creators & agencies
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={FADE_UP}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          From idea to published — automatically. Manage your entire content pipeline,
          publish to all platforms, and grow your audience with AI at every step.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={FADE_UP}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/app/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#pipeline"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-7 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <Play className="h-4 w-4" />
            See how it works
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.p variants={FADE_UP} className="mt-8 text-sm text-slate-500">
          Used by solo creators, agencies, and production studios
        </motion.p>

        {/* App preview */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative mx-auto max-w-4xl"
        >
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <div className="ml-4 flex-1 rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-500 text-left">
                app.clavio.io/dashboard
              </div>
            </div>
            {/* Dashboard preview mockup */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Ideas', value: '24', color: 'bg-blue-500/20 text-blue-400' },
                { label: 'Scheduled', value: '8', color: 'bg-amber-500/20 text-amber-400' },
                { label: 'Published', value: '142', color: 'bg-emerald-500/20 text-emerald-400' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-slate-800/60 p-4">
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
              <div className="col-span-3 rounded-xl bg-slate-800/60 p-4">
                <p className="text-xs text-slate-500 mb-3">Content pipeline</p>
                <div className="flex items-center gap-2">
                  {['Idea', 'Script', 'Clip', 'Post', 'Published'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-center ${
                        i <= 2 ? 'bg-blue-500/20 text-blue-400' : i === 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {step}
                      </div>
                      {i < 4 && <div className="text-slate-700 text-xs">→</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-32 w-2/3 bg-blue-500/20 blur-3xl rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
