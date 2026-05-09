'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  Lightbulb,
  Video,
  Send,
  BarChart2,
  Folder,
  Zap,
  Plug,
  Link as LinkIcon,
  ScrollText,
  Settings,
  ChevronUp,
  User2,
  Languages,
  BarChart3,
  Files,
  Calendar,
  Layout,
  LogOut,
} from 'lucide-react'
import { useI18n } from '@/components/i18n-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { VersionSwitcher } from './version-switcher'
import { Button } from './ui/button'
import { signOut } from '@/app/actions/auth'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const navCategories = [
    {
      title: t.sidebar.workspace,
      items: [
        { label: t.sidebar.dashboard, href: '/app/dashboard', icon: LayoutDashboard },
        { label: t.sidebar.ideas, href: '/app/ideas', icon: Lightbulb },
        { label: t.sidebar.videos, href: '/app/videos', icon: Video },
        { label: t.sidebar.publishing, href: '/app/publishing', icon: Send },
        { label: 'Calendar', href: '/app/calendar', icon: Calendar },
        { label: t.sidebar.analytics, href: '/app/analytics', icon: BarChart3 },
      ]
    },
    {
      title: t.sidebar.resources,
      items: [
        { label: t.sidebar.assets, href: '/app/assets', icon: Files },
        { label: 'Templates', href: '/app/templates', icon: Layout },
        { label: t.sidebar.automations, href: '/app/automations', icon: Zap },
        { label: t.sidebar.integrations, href: '/app/integrations', icon: LinkIcon },
      ]
    },
    {
      title: t.sidebar.system,
      items: [
        { label: t.sidebar.logs, href: '/app/logs', icon: ScrollText },
        { label: t.sidebar.settings, href: '/app/settings', icon: Settings },
      ]
    }
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <VersionSwitcher
          versions={['Clavio Default']}
          defaultVersion="Clavio Default"
        />
      </SidebarHeader>
      <SidebarContent className="px-2 gap-0">
        {navCategories.map((category) => (
          <SidebarGroup key={category.title} className="pt-4 pb-2">
            <SidebarGroupLabel>{category.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 mb-2"
          onClick={() => {
            const newLocale = locale === 'en' ? 'fr' : 'en'
            setLocale(newLocale)
            React.startTransition(() => {
              router.refresh()
            })
          }}
        >
          <Languages className="h-4 w-4" />
          {locale === 'en' ? 'Français' : 'English'}
        </Button>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto w-full justify-start p-2">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                      C
                    </div>
                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <span className="truncate text-sm font-semibold leading-tight">Clavio Admin</span>
                      <span className="truncate text-xs text-slate-500 leading-tight">Synced just now</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <User2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={signOut} className="w-full">
                    <button type="submit" className="flex w-full items-center gap-2 text-red-600">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
