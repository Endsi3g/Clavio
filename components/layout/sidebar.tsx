'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  ChevronLeft,
  ChevronRight,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Ideas', href: '/app/ideas', icon: <Lightbulb className="h-4 w-4" /> },
  { label: 'Videos', href: '/app/videos', icon: <Video className="h-4 w-4" /> },
  { label: 'Publishing', href: '/app/publishing', icon: <Send className="h-4 w-4" /> },
  { label: 'Analytics', href: '/app/analytics', icon: <BarChart2 className="h-4 w-4" /> },
]

const secondaryNav: NavItem[] = [
  { label: 'Assets', href: '/app/assets', icon: <Folder className="h-4 w-4" /> },
  { label: 'Automations', href: '/app/automations', icon: <Zap className="h-4 w-4" /> },
  { label: 'Integrations', href: '/app/integrations', icon: <Plug className="h-4 w-4" /> },
  { label: 'Logs', href: '/app/logs', icon: <ScrollText className="h-4 w-4" /> },
  { label: 'Settings', href: '/app/settings', icon: <Settings className="h-4 w-4" /> },
]

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : '',
        active
          ? 'bg-blue-50 border border-blue-200 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-700 border border-transparent'
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex h-screen flex-col border-r border-slate-200 bg-white z-30 transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-200 px-4',
            collapsed && 'justify-center px-0'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-400 text-white text-sm font-bold">
            C
          </div>
          {!collapsed && (
            <div className="ml-2.5 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
                Clavio
              </p>
              <p className="truncate text-xs text-slate-500 leading-tight">
                Creator Ops
              </p>
            </div>
          )}
        </div>

        {/* Primary nav */}
        <nav className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
          <ul className="space-y-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} collapsed={collapsed} active={isActive(item.href)} />
              </li>
            ))}
          </ul>

          {/* Separator */}
          <div className={cn('my-4 border-t border-slate-100', collapsed && 'mx-1')} />

          {/* Secondary nav */}
          <ul className="space-y-1">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} collapsed={collapsed} active={isActive(item.href)} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer workspace block */}
        <div
          className={cn(
            'border-t border-slate-100 px-3 py-3',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="flex h-2 w-2 items-center justify-center">
                    <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">Clavio Default</p>
                <p className="text-xs text-slate-400">Live</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  Clavio Default
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Live</span>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Synced just now
              </p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  )
}
