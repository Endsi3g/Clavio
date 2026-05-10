import { AppSidebar } from '@/components/layout/app-sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { KeyboardShortcuts } from '@/components/shared/keyboard-shortcuts'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { getDictionary } from '@/lib/i18n/server'
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <TopBar />
        </header>
        <main className="flex-1 overflow-y-auto p-6 pb-20 sm:pb-6">
          {children}
        </main>
        <KeyboardShortcuts />
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  )
}
