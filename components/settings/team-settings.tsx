'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save, Loader2, Users } from 'lucide-react'
import { TeamMember } from '@/lib/types'
import { saveTeamMembers } from '@/app/actions/settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function TeamSettings({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function addMember() {
    setMembers([
      ...members,
      { id: crypto.randomUUID(), name: '', role: 'Editor' }
    ])
  }

  function removeMember(id: string) {
    setMembers(members.filter(m => m.id !== id))
  }

  function updateMember(id: string, field: keyof TeamMember, value: string) {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  async function handleSave() {
    setSaving(true)
    const validMembers = members.filter(m => m.name.trim() !== '')
    const result = await saveTeamMembers(JSON.stringify(validMembers))
    setSaving(false)
    if (result.success) {
      toast.success('Team members saved')
      setMembers(validMembers)
      router.refresh()
    } else {
      toast.error('Failed to save team members')
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" /> Team Members
        </CardTitle>
        <CardDescription>
          Manage your team members. You can assign ideas to them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm border rounded-md border-dashed">
            No team members added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="sr-only">Name</Label>
                  <Input 
                    placeholder="Name (e.g. Jean)" 
                    value={member.name}
                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-1/3 space-y-1.5">
                  <Label className="sr-only">Role</Label>
                  <Input 
                    placeholder="Role (e.g. Scripter)" 
                    value={member.role}
                    onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" size="sm" onClick={addMember} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </Button>

          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Team
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
