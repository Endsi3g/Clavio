'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Lightbulb, FileText, Scissors, Send, BarChart2, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    icon: Lightbulb,
    title: 'Idea',
    description: 'Generate ideas with AI or capture manually. Organize by platform, format, and priority.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: FileText,
    title: 'Script',
    description: 'AI expands your idea into a full script. Edit in the Script Studio with teleprompter mode.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: Scissors,
    title: 'Clip',
    description: 'Upload video, auto-transcribe, extract best clips. Magic reframing for every format.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Send,
    title: 'Publish',
    description: 'Schedule posts to YouTube, Instagram, TikTok, LinkedIn, and Twitter — all from one place.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: BarChart2,
    title: 'Analyse',
    description: 'Real metrics synced automatically. See what performs, iterate faster.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    glow: 'shadow-pink-500/20',
  },
]

export function PipelineSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="pipeline" ref={ref} className="bg-slate-950 py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            The pipeline
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            One system. Every step.
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Stop juggling apps. Clavio connects your entire content workflow end to end.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 flex flex-col"
              >
                <div
                  className={`relative flex-1 rounded-2xl border p-6 ${step.bg} shadow-xl ${step.glow}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl p-2.5 ${step.bg}`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <span className="text-xs font-mono text-slate-600">0{i + 1}</span>
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${step.color}`}>{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
                {/* Arrow connector */}
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center mt-2 md:hidden">
                    <ArrowRight className="h-4 w-4 text-slate-700 rotate-90" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
