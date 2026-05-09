import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* CTA block */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-12 text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to 10x your content output?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join creators and agencies who manage their entire content pipeline with Clavio.
          </p>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center rounded-xl bg-blue-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25"
          >
            Start for free — no credit card needed
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white text-xs font-bold">
              C
            </div>
            <span className="text-white font-semibold">Clavio</span>
            <span className="text-slate-600 text-sm ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/app/dashboard" className="hover:text-slate-300 transition-colors">App</Link>
            <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
