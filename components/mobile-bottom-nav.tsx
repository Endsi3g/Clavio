'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Lightbulb, Send, BarChart3, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Video, Scissors, Calendar, Files, Layout, Zap, Link as LinkIcon,
  ScrollText, Settings, Users,
} from 'lucide-react'

const PRIMARY_NAV = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Ideas', href: '/app/ideas', icon: Lightbulb },
  { label: 'Publish', href: '/app/publishing', icon: Send },
  { label: 'Analytics', href: '/app/analytics', icon: BarChart3 },
]

const MORE_NAV = [
  { label: 'Videos', href: '/app/videos', icon: Video },
  { label: 'Clips', href: '/app/clips', icon: Scissors },
  { label: 'Calendar', href: '/app/calendar', icon: Calendar },
  { label: 'Assets', href: '/app/assets', icon: Files },
  { label: 'Templates', href: '/app/templates', icon: Layout },
  { label: 'Automations', href: '/app/automations', icon: Zap },
  { label: 'Integrations', href: '/app/integrations', icon: LinkIcon },
  { label: 'Team', href: '/app/team', icon: Users },
  { label: 'Logs', href: '/app/logs', icon: ScrollText },
  { label: 'Settings', href: '/app/settings', icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden h-16 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
      {PRIMARY_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
            isActive(item.href)
              ? 'text-blue-600'
              : 'text-slate-400 hover:text-slate-700'
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}

      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
            <Menu className="h-5 w-5" />
            More
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl pb-safe">
          <div className="grid grid-cols-4 gap-2 pt-4 pb-2">
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl p-3 text-[11px] font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
