import { LandingShell } from '@/components/landing/landing-shell'

const features = [
  {
    icon: '💡',
    title: 'Idea Engine',
    description: 'Capture ideas with AI-powered expansion. Generate hooks, angles, and formats for any platform in seconds.',
    tag: 'AI-powered'
  },
  {
    icon: '🎬',
    title: 'Video Pipeline',
    description: 'Upload once. Auto-transcribe with local Whisper. Get clip suggestions, render templates, and export everywhere.',
    tag: 'Automated'
  },
  {
    icon: '📅',
    title: 'Multi-Platform Publishing',
    description: 'Draft once, publish everywhere. Schedule to Instagram, TikTok, YouTube, LinkedIn, with platform-specific formatting.',
    tag: 'Cross-platform'
  },
  {
    icon: '📊',
    title: 'Performance Analytics',
    description: 'Track what works. Hook comparisons, CTA performance, and content rankings, all in one dashboard.',
    tag: 'Data-driven'
  },
  {
    icon: '🤖',
    title: 'Local AI (Ollama)',
    description: 'Run AI locally with Ollama. Your creative data never leaves your machine. Privacy is not an afterthought.',
    tag: 'Privacy-first'
  },
  {
    icon: '⚡',
    title: 'n8n Automation',
    description: 'Connect anything. Self-hosted n8n workflows power your publishing, notifications, and cross-platform automation.',
    tag: 'Self-hosted'
  },
]

export default function FeaturesPage() {
  return (
    <LandingShell>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">Features</span>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            Everything you need.<br />Nothing you don&apos;t.
          </h1>
          <p className="mt-5 text-lg font-light text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Clavio is a complete creator OS, from raw idea to published content, fully automated.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group rounded-2xl p-7 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                i === 0
                  ? 'md:col-span-2 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 border-blue-100 dark:border-blue-900/50'
                  : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{f.icon}</span>
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-white px-8 py-4 text-base font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Start for free →
          </a>
        </div>
      </div>
    </LandingShell>
  )
}
