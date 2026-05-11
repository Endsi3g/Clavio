'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Idea, TeamMember, Brand } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Building } from 'lucide-react'
import { WORKSPACE_ID } from '@/lib/types'

export function EditableIdeaHeader({ 
  idea, 
  teamMembers 
}: { 
  idea: Idea
  teamMembers: TeamMember[] 
}) {
  const router = useRouter()
  const [title, setTitle] = useState(idea.title)
  const [assigneeId, setAssigneeId] = useState(idea.assignee_id || 'unassigned')
  const [brandId, setBrandId] = useState(idea.brand_id || 'unassigned')
  const [brands, setBrands] = useState<Brand[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    supabase.from('brands').select('*').eq('workspace_id', WORKSPACE_ID).then(({data}) => {
      if (data) setBrands(data)
    })
  }, [supabase])

  async function handleTitleBlur() {
    if (title === idea.title) return
    if (!title.trim()) {
      setTitle(idea.title)
      return
    }

    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      if (!res.ok) throw new Error('Failed to update title')
      toast.success('Title updated')
      router.refresh()
    } catch (err) {
      toast.error('Could not save title')
      setTitle(idea.title)
    }
  }

  async function handleAssigneeChange(val: string) {
    const newAssignee = val === 'unassigned' ? null : val
    setAssigneeId(val)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee_id: newAssignee }),
      })
      if (!res.ok) throw new Error('Failed to update assignee')
      toast.success('Assignee updated')
      router.refresh()
    } catch (err) {
      toast.error('Could not assign')
      setAssigneeId(idea.assignee_id || 'unassigned')
    }
  }

  async function handleBrandChange(val: string) {
    const newBrand = val === 'unassigned' ? null : val
    setBrandId(val)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: newBrand }),
      })
      if (!res.ok) throw new Error('Failed to update brand')
      toast.success('Brand updated')
      router.refresh()
    } catch (err) {
      toast.error('Could not update brand')
      setBrandId(idea.brand_id || 'unassigned')
    }
  }

  return (
    <div className="flex-1 min-w-0 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent px-0 focus:px-3 h-auto py-1 shadow-none rounded-sm transition-all max-w-full"
      />
      {idea.description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">{idea.description}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <Users className="h-4 w-4 text-slate-400" />
        <Select value={assigneeId} onValueChange={handleAssigneeChange}>
          <SelectTrigger className="h-8 text-xs border-dashed w-[180px]">
            <SelectValue placeholder="Assign to team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned" className="text-slate-500 italic">Unassigned</SelectItem>
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {brands.length > 0 && (
          <>
            <Building className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={brandId} onValueChange={handleBrandChange}>
              <SelectTrigger className="h-8 text-xs border-dashed w-[160px]">
                <SelectValue placeholder="Client/Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="text-slate-500 italic">No Client</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  )
}
