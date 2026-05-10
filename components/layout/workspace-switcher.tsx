'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, Building2, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BrandIcon } from '@/components/brand-icon'

interface Workspace {
  id: string
  name: string
  plan: string
  slug: string
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  agency: 'Agency',
}

export function WorkspaceSwitcher() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([])
  const [activeId, setActiveId] = React.useState<string>('')
  const [creating, setCreating] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return

      const { data: members } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(id, name, plan, slug)')
        .eq('user_id', data.user.id)

      const wss: Workspace[] = (members ?? [])
        .map((m: any) => m.workspaces)
        .filter(Boolean) as Workspace[]

      setWorkspaces(wss)

      const stored = typeof window !== 'undefined'
        ? localStorage.getItem('clavio_workspace_id')
        : null
      const current = stored && wss.find(w => w.id === stored)
        ? stored
        : wss[0]?.id ?? ''
      setActiveId(current)
      setLoading(false)
    })
  }, [])

  function switchWorkspace(id: string) {
    setActiveId(id)
    localStorage.setItem('clavio_workspace_id', id)
    document.cookie = `clavio_workspace_id=${id}; path=/; max-age=${60 * 60 * 24 * 365}`
    router.refresh()
  }

  async function createWorkspace() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const ws: Workspace = await res.json()
      setWorkspaces(prev => [...prev, ws])
      switchWorkspace(ws.id)
      setShowCreate(false)
      setNewName('')
      toast.success(`Workspace "${ws.name}" created.`)
    } catch {
      toast.error('Could not create workspace.')
    } finally {
      setCreating(false)
    }
  }

  const active = workspaces.find(w => w.id === activeId)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BrandIcon name={active?.name ?? 'C'} />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 leading-none min-w-0">
                  <span className="font-semibold text-sm truncate">
                    {active?.name ?? 'Clavio OS'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {active ? (PLAN_LABEL[active.plan] ?? active.plan) : 'v1.1'}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto shrink-0 h-4 w-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-52"
              align="start"
              side="bottom"
            >
              {workspaces.map(ws => (
                <DropdownMenuItem
                  key={ws.id}
                  onSelect={() => switchWorkspace(ws.id)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                    <BrandIcon name={ws.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ws.name}</p>
                    <p className="text-xs text-slate-400">{PLAN_LABEL[ws.plan] ?? ws.plan}</p>
                  </div>
                  {ws.id === activeId && <Check className="h-4 w-4 text-blue-500 shrink-0" />}
                </DropdownMenuItem>
              ))}
              {workspaces.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onSelect={() => setShowCreate(true)} className="gap-2 text-blue-600">
                <Plus className="h-4 w-4" />
                New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
            <DialogDescription>
              Create a separate workspace for a different brand, client, or project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder="Workspace name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createWorkspace()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                onClick={createWorkspace}
                disabled={creating || !newName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
