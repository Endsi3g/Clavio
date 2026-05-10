'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Settings, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { CommandMenu } from '@/components/layout/command-menu'
import { NotificationCenter } from './notification-center'
import { useI18n } from '@/components/providers/i18n-provider'

function Breadcrumbs({ pathname }: { pathname: string }) {
  const { t } = useI18n()
  
  const segmentLabels: Record<string, string> = {
    app: 'App',
    dashboard: t.sidebar.dashboard,
    ideas: t.sidebar.ideas,
    videos: t.sidebar.videos,
    clips: t.sidebar.clips,
    publishing: t.sidebar.publishing,
    analytics: t.sidebar.analytics,
    assets: t.sidebar.assets,
    automations: t.sidebar.automations,
    integrations: t.sidebar.integrations,
    logs: t.sidebar.logs,
    settings: t.sidebar.settings,
    profile: t.common.profile,
  }

  const parts = pathname.split('/').filter(Boolean)
  // Skip the first "app" segment — it's not meaningful to display
  const displayParts = parts.slice(1)

  if (displayParts.length === 0) {
    return <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Clavio</span>
  }

  function getSegmentLabel(segment: string): string {
    // Dynamic segments like [id] — use context-aware labels
    if (segment.startsWith('[') || /^[0-9a-f-]{8,}$/i.test(segment)) return 'Detail'
    return segmentLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1">
      {displayParts.map((segment, index) => {
        const isLast = index === displayParts.length - 1
        const label = getSegmentLabel(segment)
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <span className="text-sm text-slate-400 dark:text-slate-500 select-none">/</span>
            )}
            <span
              className={
                isLast
                  ? 'text-sm font-semibold text-slate-900 dark:text-slate-100'
                  : 'text-sm text-slate-500 dark:text-slate-400'
              }
            >
              {label}
            </span>
          </span>
        )
      })}
    </nav>
  )
}

interface TopBarProps {
  title?: string
  notificationCount?: number
}

export function TopBar({ notificationCount = 0 }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()

  const handleToggleLanguage = () => {
    const next = locale === 'en' ? 'fr' : 'en'
    // Set cookie immediately so server components see it on refresh
    document.cookie = `clavio-locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    setLocale(next)
    router.refresh()
  }

  return (
    <div className="flex w-full items-center justify-between">
      {/* Left: sidebar trigger + breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <div className="ml-2">
          <Breadcrumbs pathname={pathname} />
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center px-4 max-w-2xl">
        <CommandMenu />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleToggleLanguage}
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors uppercase"
          aria-label="Toggle language"
        >
          {locale}
        </button>

        <ThemeToggle />

        <NotificationCenter />

        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-950"
              aria-label="User menu"
            >
              CL
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t.sidebar.workspace}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{t.common.profile}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t.common.preferences}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut} className="w-full">
                <button type="submit" className="flex w-full items-center text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.common.signOut}
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
