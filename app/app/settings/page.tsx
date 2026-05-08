import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Send, Cpu, Wrench } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/server'
import {
  saveWorkspaceSettings,
  savePublishingSettings,
  saveAISettings,
  clearLogs,
} from '@/app/actions/settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const t = await getDictionary()
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
    throw err
  }

  const settingsMap = (settings ?? []).reduce<Record<string, unknown>>((acc, s) => {
    acc[s.key] = s.value_json
    return acc
  }, {})

  const workspaceName = (settingsMap['workspace_name'] as string) ?? 'Clavio Default'
  const workspaceLocale = (settingsMap['workspace_locale'] as string) ?? 'en'
  const defaultPlatform = (settingsMap['default_platform'] as string) ?? ''
  const hashtagLimit = (settingsMap['hashtag_limit'] as number) ?? 10
  const ollamaModel = (settingsMap['ollama_model'] as string) ?? 'llama3.2'
  const whisperModel = (settingsMap['whisper_model'] as string) ?? 'base'

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.settings.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{t.settings.subtitle}</p>
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
            AI
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
            <CardContent>
              <form action={saveWorkspaceSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    name="workspace_name"
                    defaultValue={workspaceName}
                    placeholder="My workspace"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-locale">Default locale</Label>
                  <Input
                    id="workspace-locale"
                    name="workspace_locale"
                    defaultValue={workspaceLocale}
                    placeholder="en or fr"
                  />
                  <p className="text-xs text-slate-400">Used for AI generation language preference.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Workspace ID</Label>
                  <p className="text-xs font-mono text-slate-500 bg-slate-50 rounded px-3 py-2 border border-slate-200">
                    {WORKSPACE_ID}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Save workspace
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publishing tab */}
        <TabsContent value="publishing" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Publishing defaults</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={savePublishingSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="default-platform">Default platform</Label>
                  <Input
                    id="default-platform"
                    name="default_platform"
                    defaultValue={defaultPlatform}
                    placeholder="youtube, tiktok, instagram…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hashtag-limit">Default hashtag limit</Label>
                  <Input
                    id="hashtag-limit"
                    name="hashtag_limit"
                    type="number"
                    defaultValue={hashtagLimit}
                    min={0}
                    max={30}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Save publishing
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI & Processing tab */}
        <TabsContent value="ai" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">AI provider</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveAISettings} className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-700">Endpoints configured in .env.local</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provider base URLs are set via environment variables. Edit{' '}
                    <code className="font-mono text-slate-700">.env.local</code> to change them.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ollama-model">Ollama model</Label>
                  <Input
                    id="ollama-model"
                    name="ollama_model"
                    defaultValue={ollamaModel}
                    placeholder="llama3.2, mistral, gemma…"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="whisper-model">Whisper model</Label>
                  <Input
                    id="whisper-model"
                    name="whisper_model"
                    defaultValue={whisperModel}
                    placeholder="base, small, medium, large"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Save AI settings
                  </Button>
                </div>
              </form>
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
                  <p className="text-xs text-slate-500">Permanently delete all operational log entries.</p>
                </div>
                <form action={clearLogs}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Clear logs
                  </Button>
                </form>
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
