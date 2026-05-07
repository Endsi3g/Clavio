'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { CommandMenu } from '@/components/command-menu'

import { useI18n } from '@/components/i18n-provider'

const pageTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/ideas': 'Ideas',
  '/app/videos': 'Videos',
  '/app/publishing': 'Publishing',
  '/app/analytics': 'Analytics',
  '/app/assets': 'Assets',
  '/app/automations': 'Automations',
  '/app/integrations': 'Integrations',
  '/app/logs': 'Logs',
  '/app/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  const match = Object.keys(pageTitles).find((key) => pathname.startsWith(key + '/'))
  return match ? pageTitles[match] : 'Clavio'
}

interface TopBarProps {
  title?: string
  notificationCount?: number
}

export function TopBar({ title, notificationCount = 0 }: TopBarProps) {
  const pathname = usePathname()
  const { locale, setLocale, t } = useI18n()
  const resolvedTitle = title ?? getPageTitle(pathname)

  return (
    <div className="flex w-full items-center justify-between">
      {/* Left: sidebar trigger + page title */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 ml-2">{resolvedTitle}</h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center px-4 max-w-2xl">
        <CommandMenu />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        <button
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors uppercase"
          aria-label="Toggle language"
        >
          {locale}
        </button>

        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] font-semibold text-white leading-none">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
