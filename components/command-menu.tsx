'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  Video,
  Send,
  BarChart2,
  Folder,
  Zap,
  Plug,
  ScrollText,
  Settings,
  User2,
  FileText,
  Play
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

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { t } = useI18n()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-slate-100/50 shadow-sm hover:bg-slate-100 hover:text-slate-900 px-4 py-2 relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-slate-500 sm:pr-12 md:w-64 lg:w-80 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 dark:hover:text-slate-50 mx-auto"
      >
        <span className="hidden lg:inline-flex">{t.topbar.search}</span>
        <span className="inline-flex lg:hidden">{t.topbar.searchMobile}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push('/app/ideas'))}>
              <Lightbulb className="mr-2 h-4 w-4" />
              <span>Create New Idea</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/app/videos'))}>
              <Play className="mr-2 h-4 w-4" />
              <span>Upload Video</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/app/publishing'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Draft New Post</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Workspace">
            <CommandItem onSelect={() => runCommand(() => router.push('/app/dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/app/analytics'))}>
              <BarChart2 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Content Engine">
            <CommandItem onSelect={() => runCommand(() => router.push('/app/ideas'))}>
              <Lightbulb className="mr-2 h-4 w-4" />
              <span>Ideas</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/app/videos'))}>
              <Video className="mr-2 h-4 w-4" />
              <span>Videos</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/app/publishing'))}>
              <Send className="mr-2 h-4 w-4" />
              <span>Publishing</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem onSelect={() => runCommand(() => router.push('/app/profile'))}>
              <User2 className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/app/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
