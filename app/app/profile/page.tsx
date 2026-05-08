'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User2, Shield, Bell, Loader2, Camera, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { toast } from 'sonner'

const SETTING_KEY = 'profile'

interface ProfileData {
  full_name: string
  notifications_system: boolean
  notifications_marketing: boolean
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [fullName, setFullName] = useState('Admin User')
  const [notifSystem, setNotifSystem] = useState(true)
  const [notifMarketing, setNotifMarketing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('settings')
        .select('value_json')
        .eq('workspace_id', WORKSPACE_ID)
        .eq('key', SETTING_KEY)
        .maybeSingle()

      if (data?.value_json) {
        const p = data.value_json as Partial<ProfileData & { avatar_url: string }>
        if (p.full_name) setFullName(p.full_name)
        if (p.avatar_url) setAvatarUrl(p.avatar_url)
        if (typeof p.notifications_system === 'boolean') setNotifSystem(p.notifications_system)
        if (typeof p.notifications_marketing === 'boolean') setNotifMarketing(p.notifications_marketing)
      }
      setFetching(false)
    }
    load()
  }, [])

  async function saveProfile() {
    setLoading(true)
    const payload: ProfileData & { avatar_url: string | null } = {
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
      notifications_system: notifSystem,
      notifications_marketing: notifMarketing,
    }
    const { error } = await supabase.from('settings').upsert(
      { workspace_id: WORKSPACE_ID, key: SETTING_KEY, value_json: payload, updated_at: new Date().toISOString() },
      { onConflict: 'workspace_id,key' }
    )
    setLoading(false)
    if (error) {
      toast.error('Failed to save profile: ' + error.message)
    } else {
      toast.success('Profile saved')
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${WORKSPACE_ID}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath)
      setAvatarUrl(publicUrl)
      toast.success('Avatar uploaded — save to persist')
    } catch (error: unknown) {
      toast.error('Upload error: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setUploading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage your workspace identity and notification preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <TabsList className="flex flex-col h-auto bg-transparent border-none p-0 space-y-1">
              <TabsTrigger value="general" className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <User2 className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="md:col-span-3">
            <TabsContent value="general" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identity</CardTitle>
                  <CardDescription>Displayed in the sidebar and logs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col gap-4">
                    <Label>Profile photo</Label>
                    <div className="flex items-center gap-6">
                      <div
                        className="relative h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User2 className="h-10 w-10 text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          Choose image
                        </Button>
                        <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 2 MB.</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Display name</Label>
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Workspace ID</Label>
                      <p className="text-xs font-mono text-slate-500 bg-slate-50 rounded px-3 py-2 border border-slate-200 max-w-md">
                        {WORKSPACE_ID}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button onClick={saveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900">System notifications</p>
                        <p className="text-sm text-slate-500">Alerts about video status and renders.</p>
                      </div>
                      <Switch checked={notifSystem} onCheckedChange={setNotifSystem} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900">Marketing emails</p>
                        <p className="text-sm text-slate-500">Receive news about new features.</p>
                      </div>
                      <Switch checked={notifMarketing} onCheckedChange={setNotifMarketing} />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={saveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
