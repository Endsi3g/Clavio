'use client'

import { motion } from 'framer-motion'

const PLATFORMS = [
  {
    name: 'YouTube',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/10',
    initial: 'YT',
    stats: 'Video + Shorts',
  },
  {
    name: 'Instagram',
    color: 'bg-pink-500',
    textColor: 'text-pink-400',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/10',
    initial: 'IG',
    stats: 'Reels + Posts',
  },
  {
    name: 'TikTok',
    color: 'bg-slate-100',
    textColor: 'text-slate-300',
    border: 'border-slate-600/40',
    bg: 'bg-slate-800/60',
    initial: 'TK',
    stats: 'Video + Carousels',
  },
  {
    name: 'LinkedIn',
    color: 'bg-blue-600',
    textColor: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    initial: 'LI',
    stats: 'Posts + Articles',
  },
  {
    name: 'Twitter / X',
    color: 'bg-sky-500',
    textColor: 'text-sky-400',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/10',
    initial: 'X',
    stats: 'Tweets + Threads',
  },
]

export function SocialPlatforms() {
  return (
    <section className="bg-slate-950 py-32 px-6 border-t border-slate-800/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Integrations</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Connect once.
            <br />
            <span className="text-slate-500">Publish everywhere.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            One OAuth connection per platform. Clavio handles token refresh,
            format adaptation, and scheduling automatically.
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLATFORMS.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`group rounded-2xl border ${platform.border} ${platform.bg} p-6 text-center hover:scale-[1.03] transition-transform duration-200 cursor-default`}
            >
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${platform.color} text-white text-lg font-bold shadow-lg`}>
                {platform.initial}
              </div>
              <h3 className={`font-semibold ${platform.textColor} mb-1`}>{platform.name}</h3>
              <p className="text-xs text-slate-500">{platform.stats}</p>
            </motion.div>
          ))}
        </div>

        {/* Connection CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900 px-8 py-4">
            <div className="flex -space-x-2">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className={`h-8 w-8 rounded-full ${p.color} flex items-center justify-center text-white text-[10px] font-bold border-2 border-slate-900`}
                >
                  {p.initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-white font-semibold">Connect all 5 platforms</span> in under 2 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
