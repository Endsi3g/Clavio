import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Palette,
  Send,
  Cpu,
  Wrench,
  Globe,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SettingRow {
  key: string
  value: string | null
}

export default async function SettingsPage() {
  const supabase = await createServerClient()

  let settings = null
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value_json')
      .eq('workspace_id', WORKSPACE_ID)
    
    if (error) throw error
    settings = data
  } catch (err) {
    throw err // Let the global error.tsx handle it
  }

  const settingsMap = (settings ?? []).reduce<Record<string, unknown>>((acc, s) => {
    acc[s.key] = s.value_json
    return acc
  }, {})

  const workspaceName = (settingsMap['workspace_name'] as string) ?? 'Clavio Default'
  const workspaceLocale = (settingsMap['workspace_locale'] as string) ?? 'en'
  const defaultPlatform = (settingsMap['default_platform'] as string) ?? ''
  const ollamaModel = (settingsMap['ollama_model'] as string) ?? 'llama3'
  const whisperModel = (settingsMap['whisper_model'] as string) ?? 'base'

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Workspace configuration and defaults</p>
      </div>

      <Tabs defaultValue="workspace">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="workspace" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="publishing" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            AI & Processing
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Workspace tab */}
        <TabsContent value="workspace" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Workspace identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input
                  id="workspace-name"
                  defaultValue={workspaceName}
                  placeholder="My workspace"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workspace-locale">Default locale</Label>
                <Input
                  id="workspace-locale"
                  defaultValue={workspaceLocale}
                  placeholder="en or fr"
                />
                <p className="text-xs text-slate-400">
                  Used for AI generation language preference.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Workspace ID</Label>
                <p className="text-xs font-mono text-slate-500 bg-slate-50 rounded px-3 py-2 border border-slate-200">
                  {WORKSPACE_ID}
                </p>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  Save workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publishing tab */}
        <TabsContent value="publishing" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Publishing defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="default-platform">Default platform</Label>
                <Input
                  id="default-platform"
                  defaultValue={defaultPlatform}
                  placeholder="youtube, tiktok, instagram…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Default hashtag limit</Label>
                <Input type="number" defaultValue={10} min={0} max={30} />
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  Save publishing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI & Processing tab */}
        <TabsContent value="ai" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">AI provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-700">Configured in .env.local</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provider endpoints are set via environment variables.
                  Edit <code className="font-mono text-slate-700">.env.local</code> to change them.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ollama-model">Ollama model</Label>
                <Input
                  id="ollama-model"
                  defaultValue={ollamaModel}
                  placeholder="llama3, mistral, gemma…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whisper-model">Whisper model</Label>
                <Input
                  id="whisper-model"
                  defaultValue={whisperModel}
                  placeholder="base, small, medium, large"
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  Save AI settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance tab */}
        <TabsContent value="maintenance" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">Clear all logs</p>
                  <p className="text-xs text-slate-500">
                    Permanently delete all operational log entries.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Clear logs
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-red-800">Reset workspace data</p>
                  <p className="text-xs text-red-600">
                    Permanently delete all content in this workspace. This cannot be undone.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">System info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Version</span>
                <span className="font-mono text-slate-700">0.1.0</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Runtime</span>
                <span className="font-mono text-slate-700">Next.js 15</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Database</span>
                <span className="font-mono text-slate-700">Supabase Postgres</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
