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
  ScrollText,
  Settings,
  Circle,
  ChevronUp,
  User2,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { VersionSwitcher } from './version-switcher'

const navCategories = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/app/analytics', icon: BarChart2 },
    ]
  },
  {
    title: 'Content Engine',
    items: [
      { label: 'Ideas', href: '/app/ideas', icon: Lightbulb },
      { label: 'Videos', href: '/app/videos', icon: Video },
      { label: 'Publishing', href: '/app/publishing', icon: Send },
    ]
  },
  {
    title: 'Resources',
    items: [
      { label: 'Assets', href: '/app/assets', icon: Folder },
      { label: 'Automations', href: '/app/automations', icon: Zap },
      { label: 'Integrations', href: '/app/integrations', icon: Plug },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Logs', href: '/app/logs', icon: ScrollText },
      { label: 'Profile', href: '/app/profile', icon: User2 },
      { label: 'Settings', href: '/app/settings', icon: Settings },
    ]
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <VersionSwitcher
          versions={['Clavio Default']}
          defaultVersion="Clavio Default"
        />
      </SidebarHeader>
      <SidebarContent className="px-2 gap-0">
        {navCategories.map((category, index) => (
          <SidebarGroup key={category.title} className="pt-4 pb-2">
            <div className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              {category.title}
            </div>
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
                <DropdownMenuItem>
                  <span>Sign out</span>
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
