import { LandingShell } from '@/components/landing/landing-shell'

const milestones = [
  {
    year: '2024',
    title: 'The Problem',
    body: 'Creators were drowning in tools: one for ideas, one for editing, one for scheduling. Nothing connected. Nothing was fast. Everything required manual work.'
  },
  {
    year: '2024',
    title: 'The Vision',
    body: 'We imagined a single OS that could take a raw idea and turn it into published, distributed content automatically, using local AI that respects your privacy.'
  },
  {
    year: '2025',
    title: 'Building Clavio',
    body: 'Built on Next.js, Supabase, n8n, and Ollama, Clavio became the first truly local-first content OS. No cloud AI required for core features. Your data stays yours.'
  },
  {
    year: 'Today',
    title: 'The Platform',
    body: 'Clavio handles ideas, video processing, multi-platform publishing, and analytics all from one interface, fully automated, with local AI at its core.'
  },
]

export default function StoryPage() {
  return (
    <LandingShell>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Split-screen hero */}
        <div className="grid md:grid-cols-2 gap-16 items-start mb-24">
          <div className="sticky top-28">
            <span className="inline-block text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Built for creators,<br />by builders.
            </h1>
            <p className="mt-5 text-lg font-light text-slate-500 dark:text-slate-400 leading-relaxed">
              Clavio was born from frustration. Too many tools, too much manual work. We built the OS we always needed.
            </p>
          </div>

          {/* Scrollable right: glass cards */}
          <div className="space-y-5">
            {milestones.map((m, i) => (
              <div
                key={i}
                className="group rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300"
              >
                <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">{m.year}</span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{m.title}</h3>
                <p className="mt-2 text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-20">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center">What we believe</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '🔒', title: 'Privacy first', body: 'Local AI models keep your creative data on your machine. No cloud training on your content.' },
              { icon: '⚡', title: 'Automation over effort', body: 'A great idea should become a published post with minimal friction. Automation is the feature.' },
              { icon: '🎯', title: 'Creators deserve power tools', body: 'Not watered-down tools with arbitrary limits. Real workflows for real professionals.' },
            ].map((v, i) => (
              <div key={i} className="rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{v.title}</h3>
                <p className="mt-2 text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingShell>
  )
}
