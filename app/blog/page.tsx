import { LandingShell } from '@/components/landing/landing-shell'
import Link from 'next/link'

const posts = [
  {
    tag: 'Product',
    title: 'Introducing Clavio: The AI Content OS',
    excerpt: 'We built Clavio to solve a problem every creator knows: too many tools, too much manual work, and zero automation. Here is how it all works.',
    date: 'May 10, 2026',
    readTime: '5 min read',
    href: '#',
  },
  {
    tag: 'Tutorial',
    title: 'How to set up Ollama for local AI content generation',
    excerpt: 'A step-by-step guide to running Ollama locally with Clavio for private, offline AI-powered idea generation.',
    date: 'May 8, 2026',
    readTime: '7 min read',
    href: '#',
  },
  {
    tag: 'Guide',
    title: 'From raw idea to published post in under 5 minutes',
    excerpt: 'The complete Clavio workflow, from idea capture to multi-platform publishing, using automation and local AI.',
    date: 'May 6, 2026',
    readTime: '6 min read',
    href: '#',
  },
  {
    tag: 'Engineering',
    title: 'Why we chose n8n over Zapier for automation',
    excerpt: 'Self-hosted, open-source, and infinitely more powerful. How n8n became the backbone of Clavio\'s automation layer.',
    date: 'May 3, 2026',
    readTime: '8 min read',
    href: '#',
  },
]

export default function BlogPage() {
  return (
    <LandingShell>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">Blog</span>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            Insights from<br />the Clavio team.
          </h1>
          <p className="mt-5 text-lg font-light text-slate-500 dark:text-slate-400 max-w-xl">
            Tutorials, product updates, and thoughts on the future of content creation.
          </p>
        </div>

        {/* Featured post */}
        <Link
          href={posts[0].href}
          className="group block rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 border border-blue-100 dark:border-blue-900/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mb-5"
        >
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">{posts[0].tag}</span>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {posts[0].title}
          </h2>
          <p className="mt-3 text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{posts[0].excerpt}</p>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs text-slate-400 dark:text-slate-500">{posts[0].date}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{posts[0].readTime}</span>
          </div>
        </Link>

        {/* Post grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {posts.slice(1).map((post, i) => (
            <Link
              key={i}
              href={post.href}
              className="group block rounded-2xl p-6 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">{post.tag}</span>
              <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-xs font-light text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-500">{post.date}</span>
                <span className="text-slate-200 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </LandingShell>
  )
}
