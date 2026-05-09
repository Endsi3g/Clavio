'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Kanban, Calendar, Scissors, BarChart2, Users, Zap,
  Brain, Globe, Lock, Video, Layout, FileText,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-powered ideas',
    description: 'Generate dozens of content ideas from a single prompt using local LLMs. No API keys needed.',
    size: 'large',
  },
  {
    icon: Kanban,
    title: 'Kanban pipeline',
    description: 'Drag ideas through Draft → Review → Approved → Scheduled → Published in one visual board.',
    size: 'small',
  },
  {
    icon: Calendar,
    title: 'Content calendar',
    description: 'Drag & drop scheduling across all platforms. See your entire publishing schedule at a glance.',
    size: 'small',
  },
  {
    icon: Video,
    title: 'Video processing',
    description: 'Upload, auto-transcribe, and extract best clips. Magic reframing for Reels, Shorts, and TikTok.',
    size: 'large',
  },
  {
    icon: Globe,
    title: '5 platforms in one',
    description: 'YouTube, Instagram, TikTok, LinkedIn, Twitter/X — managed from a single dashboard.',
    size: 'small',
  },
  {
    icon: BarChart2,
    title: 'Real analytics',
    description: 'Views, likes, shares, retention — synced directly from each platform. No manual reporting.',
    size: 'small',
  },
  {
    icon: Layout,
    title: 'Brand Kit',
    description: 'Store your logo, colors, fonts, and voice tone. Applied consistently across every post.',
    size: 'small',
  },
  {
    icon: Users,
    title: 'Agency workflow',
    description: 'Multi-workspace, client approval workflow, inline comments, and view-only client portal.',
    size: 'small',
  },
  {
    icon: Zap,
    title: 'Automations',
    description: 'n8n-powered workflows: auto-publish, metrics sync, approval notifications, and more.',
    size: 'small',
  },
  {
    icon: Lock,
    title: 'Local-first',
    description: 'Runs entirely on your infrastructure. Ollama, Whisper, Remotion — no data leaves your server.',
    size: 'small',
  },
  {
    icon: FileText,
    title: 'Script Studio',
    description: 'Rich text editor with teleprompter mode, word count, reading time, and one-click export.',
    size: 'small',
  },
  {
    icon: Scissors,
    title: 'Clip browser',
    description: 'Browse, preview, approve, and send clips directly to your publishing queue.',
    size: 'small',
  },
]

function FeatureCard({ feature, delay }: { feature: typeof FEATURES[0]; delay: number }) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay }}
      className={`group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 ${
        feature.size === 'large' ? 'md:col-span-2' : ''
      }`}
    >
      <div className="mb-4 inline-flex rounded-xl bg-slate-800 p-2.5 text-blue-400 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-slate-950 py-32 px-6 border-t border-slate-800/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Everything you need.
            <br />
            <span className="text-slate-500">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  )
}
