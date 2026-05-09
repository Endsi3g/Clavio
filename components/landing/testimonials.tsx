'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: "Clavio cut my content production time in half. I go from idea to published video in a single session now.",
    name: 'Sarah K.',
    role: 'Solo YouTube Creator',
    initials: 'SK',
    color: 'bg-blue-500',
  },
  {
    quote: "The approval workflow is exactly what our agency needed. Clients love the portal — no more endless email threads.",
    name: 'Marcus T.',
    role: 'Creative Director, Agency',
    initials: 'MT',
    color: 'bg-violet-500',
  },
  {
    quote: "The clip extraction is insane. I upload a 30-minute podcast and get 10 ready-to-post clips in minutes.",
    name: 'Léa M.',
    role: 'Podcast Creator & Coach',
    initials: 'LM',
    color: 'bg-emerald-500',
  },
]

export function Testimonials() {
  return (
    <section className="bg-slate-950 py-32 px-6 border-t border-slate-800/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Loved by creators
            <br />
            <span className="text-slate-500">and agencies.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-slate-300 text-base leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
