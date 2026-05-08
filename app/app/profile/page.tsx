'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User2, Mail, Shield, Key, Bell, Loader2, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Dummy state for demonstration since we are in a simplified workspace
  const [profile, setProfile] = useState({
    full_name: 'Admin User',
    email: 'admin@clavio.com',
    avatar_url: null as string | null
  })

  const supabase = createClient()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${WORKSPACE_ID}/${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

      // 3. Update Profile state (and eventually DB)
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      
      toast.success('Avatar mis à jour avec succès')
    } catch (error: any) {
      toast.error('Erreur lors de l\'upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Gérez vos informations personnelles et vos préférences de sécurité.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Tabs List */}
          <div className="md:col-span-1">
            <TabsList className="flex flex-col h-auto bg-transparent border-none p-0 space-y-1">
              <TabsTrigger 
                value="general" 
                className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20"
              >
                <User2 className="h-4 w-4" />
                Général
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20"
              >
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3">
            <TabsContent value="general" className="m-0 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Informations Personnelles</CardTitle>
                  <CardDescription>Mettez à jour vos détails personnels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col gap-4">
                    <Label>Photo de profil</Label>
                    <div className="flex items-center gap-6">
                      <div 
                        className="relative h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group"
                        onClick={handleAvatarClick}
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User2 className="h-10 w-10 text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Button variant="outline" size="sm" onClick={handleAvatarClick} disabled={uploading}>
                          Choisir une image
                        </Button>
                        <p className="text-xs text-slate-500">JPG, PNG ou GIF. Max 2MB.</p>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" defaultValue={profile.full_name} className="max-w-md" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={profile.email} disabled className="max-w-md bg-slate-50" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      Enregistrer les modifications
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 bg-red-50/10">
                <CardHeader>
                  <CardTitle className="text-red-600 text-lg">Zone de danger</CardTitle>
                  <CardDescription>Actions irréversibles pour votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Supprimer le compte</p>
                      <p className="text-sm text-slate-500">Toutes vos données seront définitivement supprimées.</p>
                    </div>
                    <Button variant="destructive" size="sm">Supprimer</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Sécurité du compte</CardTitle>
                  <CardDescription>Gérez votre mot de passe et vos sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <Input id="current-password" type="password" className="max-w-md" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input id="new-password" type="password" className="max-w-md" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input id="confirm-password" type="password" className="max-w-md" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Mettre à jour le mot de passe
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Authentification à deux facteurs</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Application d'authentification</p>
                        <p className="text-xs text-slate-500">Utilisez une application comme Google Authenticator.</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Préférences de notifications</CardTitle>
                  <CardDescription>Choisissez comment vous souhaitez être informé.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900">Notifications système</p>
                        <p className="text-sm text-slate-500">Alertes sur le statut de vos vidéos et rendus.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900">Emails marketing</p>
                        <p className="text-sm text-slate-500">Recevez des nouvelles sur les fonctionnalités.</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900">Alertes de sécurité</p>
                        <p className="text-sm text-slate-500">Notifications en cas de connexion suspecte.</p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline">Restaurer par défaut</Button>
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

