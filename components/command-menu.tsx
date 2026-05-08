'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Lightbulb, Video, Scissors, Send, BarChart2,
  Folder, Zap, Plug, ScrollText, Settings, User2, FileText, Play,
  Calendar, Layout, Search, Loader2,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useI18n } from '@/components/i18n-provider'

type SearchResult = {
  type: 'idea' | 'post' | 'video' | 'asset'
  id: string
  title: string
  meta: string | null
  href: string
}

const TYPE_ICON: Record<SearchResult['type'], React.ReactNode> = {
  idea: <Lightbulb className="mr-2 h-3.5 w-3.5 text-amber-500" />,
  post: <Send className="mr-2 h-3.5 w-3.5 text-blue-500" />,
  video: <Video className="mr-2 h-3.5 w-3.5 text-purple-500" />,
  asset: <Folder className="mr-2 h-3.5 w-3.5 text-slate-400" />,
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [searching, setSearching] = React.useState(false)
  const router = useRouter()
  const { t } = useI18n()
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    clearTimeout(debounceRef.current)
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  const run = React.useCallback((fn: () => unknown) => {
    setOpen(false)
    setQuery('')
    setResults([])
    fn()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 border border-slate-200 bg-slate-100/50 shadow-sm hover:bg-slate-100 hover:text-slate-900 px-4 py-2 relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-slate-500 sm:pr-12 md:w-64 lg:w-96 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline-flex">{t.topbar.search}</span>
        <span className="inline-flex lg:hidden">{t.topbar.searchMobile}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium sm:flex dark:border-slate-700 dark:bg-slate-800">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setQuery(''); setResults([]) } }}>
        <CommandInput
          placeholder="Rechercher ou taper une commande…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {searching && (
            <div className="flex items-center justify-center py-6 text-sm text-slate-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche…
            </div>
          )}

          {!searching && results.length > 0 && (
            <>
              <CommandGroup heading="Résultats">
                {results.map((r) => (
                  <CommandItem key={`${r.type}-${r.id}`} onSelect={() => run(() => router.push(r.href))}>
                    {TYPE_ICON[r.type]}
                    <span className="flex-1 truncate">{r.title}</span>
                    {r.meta && <span className="ml-2 text-[10px] text-slate-400 capitalize">{r.meta}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {!searching && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>Aucun résultat pour « {query} »</CommandEmpty>
          )}

          <CommandGroup heading="Actions rapides">
            <CommandItem onSelect={() => run(() => router.push('/app/ideas'))}>
              <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
              <span>Nouvelle idée</span>
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/videos'))}>
              <Play className="mr-2 h-4 w-4 text-purple-500" />
              <span>Importer une vidéo</span>
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/publishing'))}>
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span>Nouveau brouillon</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => run(() => router.push('/app/dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/ideas'))}>
              <Lightbulb className="mr-2 h-4 w-4" /> Idées
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/videos'))}>
              <Video className="mr-2 h-4 w-4" /> Vidéos
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/clips'))}>
              <Scissors className="mr-2 h-4 w-4" /> Clips
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/publishing'))}>
              <Send className="mr-2 h-4 w-4" /> Publication
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/analytics'))}>
              <BarChart2 className="mr-2 h-4 w-4" /> Analytiques
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/calendar'))}>
              <Calendar className="mr-2 h-4 w-4" /> Calendrier
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/templates'))}>
              <Layout className="mr-2 h-4 w-4" /> Templates
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Système">
            <CommandItem onSelect={() => run(() => router.push('/app/assets'))}>
              <Folder className="mr-2 h-4 w-4" /> Assets
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/automations'))}>
              <Zap className="mr-2 h-4 w-4" /> Automations
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/integrations'))}>
              <Plug className="mr-2 h-4 w-4" /> Intégrations
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/logs'))}>
              <ScrollText className="mr-2 h-4 w-4" /> Logs
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/settings'))}>
              <Settings className="mr-2 h-4 w-4" /> Paramètres
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push('/app/profile'))}>
              <User2 className="mr-2 h-4 w-4" /> Profil
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
