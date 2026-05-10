'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  Lightbulb,
  Video,
  Send,
  Zap,
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
  Users,
  Brain,
  Bot,
  Film,
  Webhook,
  Newspaper,
} from 'lucide-react'
import { useI18n } from '@/components/providers/i18n-provider'
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
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const [userEmail, setUserEmail] = React.useState<string>('')
  const [userInitial, setUserInitial] = React.useState<string>('C')
  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      const name = data.user?.user_metadata?.full_name ?? ''
      setUserEmail(email)
      if (name) {
        setUserInitial(name.charAt(0).toUpperCase())
      } else if (email) {
        setUserInitial(email.charAt(0).toUpperCase())
      }
    })
  }, [])

  const navCategories = [
    {
      title: t.sidebar.workspace,
      items: [
        { label: t.sidebar.dashboard, href: '/app/dashboard', icon: LayoutDashboard },
        { label: t.sidebar.ideas, href: '/app/ideas', icon: Lightbulb },
        { label: t.sidebar.videos, href: '/app/videos', icon: Video },
        { label: t.sidebar.publishing, href: '/app/publishing', icon: Send },
        { label: t.sidebar.calendar, href: '/app/calendar', icon: Calendar },
        { label: t.sidebar.analytics, href: '/app/analytics', icon: BarChart3 },
      ]
    },
    {
      title: t.sidebar.aiSystems,
      items: [
        { label: t.sidebar.smartWorker, href: '/app/smart-worker', icon: Brain },
        { label: t.sidebar.agents, href: '/app/agents', icon: Bot },
        { label: t.sidebar.renderEngine, href: '/app/render', icon: Film },
        { label: t.sidebar.automationBridge, href: '/app/automation', icon: Webhook },
      ]
    },
    {
      title: t.sidebar.resources,
      items: [
        { label: t.sidebar.news, href: '/app/news', icon: Newspaper },
        { label: t.sidebar.assets, href: '/app/assets', icon: Files },
        { label: t.sidebar.templates, href: '/app/templates', icon: Layout },
        { label: t.sidebar.automations, href: '/app/automations', icon: Zap },
        { label: t.sidebar.integrations, href: '/app/integrations', icon: LinkIcon },
      ]
    },
    {
      title: t.sidebar.system,
      items: [
        { label: t.sidebar.team, href: '/app/team', icon: Users },
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
            const next = locale === 'en' ? 'fr' : 'en'
            document.cookie = `clavio-locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
            setLocale(next)
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
                      {userInitial}
                    </div>
                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <span className="truncate text-sm font-semibold leading-tight">
                        {userEmail ? userEmail.split('@')[0] : 'Workspace'}
                      </span>
                      <span className="truncate text-xs text-slate-500 leading-tight">
                        {userEmail || 'Loading…'}
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/app/profile" className="flex items-center">
                    <User2 className="mr-2 h-4 w-4" />
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
                    <button type="submit" className="flex w-full items-center gap-2 text-red-600">
                      <LogOut className="h-4 w-4" />
                      {t.common.signOut}
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
