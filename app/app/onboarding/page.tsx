'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Mic,
  Zap,
  Link as LinkIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Database,
  Users,
  User,
  Building2,
  Video,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboarding } from '@/app/actions/onboarding'
import { checkIntegrationStatus } from '@/lib/integrations-check'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileType = 'solo' | 'team' | 'agency'
type IntegrationKey = 'ollama' | 'whisper' | 'n8n' | 'cobalt' | 'supabase'
type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'disconnected'
type ContentChoice = 'upload' | 'idea' | 'import' | null

interface IntegrationCard {
  key: IntegrationKey
  name: string
  icon: React.ReactNode
  defaultUrl: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INTEGRATIONS: IntegrationCard[] = [
  {
    key: 'ollama',
    name: 'Ollama',
    icon: <Sparkles className="h-5 w-5 text-violet-500" />,
    defaultUrl: 'http://127.0.0.1:11434',
  },
  {
    key: 'whisper',
    name: 'Whisper',
    icon: <Mic className="h-5 w-5 text-blue-500" />,
    defaultUrl: 'http://127.0.0.1:9000',
  },
  {
    key: 'n8n',
    name: 'n8n',
    icon: <Zap className="h-5 w-5 text-orange-500" />,
    defaultUrl: 'http://127.0.0.1:5678',
  },
  {
    key: 'cobalt',
    name: 'Cobalt',
    icon: <LinkIcon className="h-5 w-5 text-cyan-500" />,
    defaultUrl: 'http://127.0.0.1:9001',
  },
  {
    key: 'supabase',
    name: 'Supabase',
    icon: <Database className="h-5 w-5 text-emerald-500" />,
    defaultUrl: 'http://127.0.0.1:54321',
  },
]

const PROFILE_OPTIONS: { value: ProfileType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'solo',
    label: 'Solo Creator',
    desc: 'Just me, building my personal brand',
    icon: <User className="h-6 w-6" />,
  },
  {
    value: 'team',
    label: 'Small Team',
    desc: '2–10 people creating together',
    icon: <Users className="h-6 w-6" />,
  },
  {
    value: 'agency',
    label: 'Agency',
    desc: 'Managing content for multiple clients',
    icon: <Building2 className="h-6 w-6" />,
  },
]

const STEP_LABELS = ['Workspace', 'Integrations', 'First Content', 'Done']

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i + 1 === current
              ? 'h-2.5 w-6 bg-blue-500'
              : i + 1 < current
              ? 'h-2 w-2 bg-blue-300'
              : 'h-2 w-2 bg-slate-200'
          )}
        />
      ))}
    </div>
  )
}

// ─── Step 1 — Workspace Setup ─────────────────────────────────────────────────

function Step1({
  workspaceName,
  setWorkspaceName,
  language,
  setLanguage,
  timezone,
  setTimezone,
  profileType,
  setProfileType,
}: {
  workspaceName: string
  setWorkspaceName: (v: string) => void
  language: string
  setLanguage: (v: string) => void
  timezone: string
  setTimezone: (v: string) => void
  profileType: ProfileType | null
  setProfileType: (v: ProfileType) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Set up your workspace</h2>
        <p className="mt-1 text-sm text-slate-500">Tell us a bit about how you create.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="workspace-name">Workspace name</Label>
          <Input
            id="workspace-name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="My Workspace"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. Europe/Paris"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Profile type</Label>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setProfileType(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150',
                  profileType === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <span
                  className={cn(
                    profileType === opt.value ? 'text-blue-500' : 'text-slate-400'
                  )}
                >
                  {opt.icon}
                </span>
                <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                <span className="text-xs text-slate-400 leading-tight hidden sm:block">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 — Integrations ────────────────────────────────────────────────────

function Step2() {
  const [statuses, setStatuses] = useState<Record<IntegrationKey, ConnectionStatus>>({
    ollama: 'idle',
    whisper: 'idle',
    n8n: 'idle',
    cobalt: 'idle',
    supabase: 'idle',
  })

  async function handleCheck(key: IntegrationKey) {
    setStatuses((prev) => ({ ...prev, [key]: 'checking' }))
    const result = await checkIntegrationStatus(key)
    setStatuses((prev) => ({
      ...prev,
      [key]: result === 'connected' ? 'connected' : 'disconnected',
    }))
  }

  function StatusDot({ status }: { status: ConnectionStatus }) {
    if (status === 'checking') {
      return (
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400 animate-pulse" />
      )
    }
    if (status === 'connected') {
      return <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
    }
    if (status === 'disconnected') {
      return <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
    }
    return <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Connect your tools</h2>
        <p className="mt-1 text-sm text-slate-500">
          Check that local services are reachable. You can skip this and configure them later.
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.key}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
              {integration.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{integration.name}</p>
              <p className="text-xs text-slate-400 font-mono truncate">{integration.defaultUrl}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusDot status={statuses[integration.key]} />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCheck(integration.key)}
                disabled={statuses[integration.key] === 'checking'}
                className="text-xs"
              >
                {statuses[integration.key] === 'checking' ? 'Checking…' : 'Check'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3 — Import First Content ────────────────────────────────────────────

function Step3({
  choice,
  setChoice,
}: {
  choice: ContentChoice
  setChoice: (v: ContentChoice) => void
}) {
  const options: {
    value: ContentChoice
    label: string
    desc: string
    href: string
    icon: React.ReactNode
  }[] = [
    {
      value: 'upload',
      label: 'Upload a video',
      desc: 'Import a local file and start processing',
      href: '/app/videos',
      icon: <Upload className="h-6 w-6" />,
    },
    {
      value: 'idea',
      label: 'Generate an idea with AI',
      desc: 'Let the AI brainstorm your first content piece',
      href: '/app/ideas',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      value: 'import',
      label: 'Import from URL',
      desc: 'Paste a YouTube or TikTok link to import',
      href: '/app/videos',
      icon: <Video className="h-6 w-6" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Import your first content</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose how you want to get started. You can do the rest from the dashboard.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setChoice(opt.value)}
            className={cn(
              'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150',
              choice === opt.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                choice === opt.value
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-slate-100 text-slate-400'
              )}
            >
              {opt.icon}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold',
                  choice === opt.value ? 'text-blue-700' : 'text-slate-800'
                )}
              >
                {opt.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </div>
            {choice === opt.value && (
              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 ml-auto" />
            )}
          </button>
        ))}
      </div>

      {choice && (
        <p className="text-xs text-slate-400 text-center">
          You'll be taken to{' '}
          <span className="font-medium text-slate-600">
            {options.find((o) => o.value === choice)?.label}
          </span>{' '}
          after completing setup.
        </p>
      )}
    </div>
  )
}

// ─── Step 4 — Done ────────────────────────────────────────────────────────────

function Step4({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="checkmark-wrapper">
        <CheckCircle2 className="h-20 w-20 text-emerald-500 checkmark-icon" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Your workspace is ready!</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Everything is configured. Head to your dashboard to start creating and publishing content.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" onClick={onGoToDashboard} className="w-full gap-2">
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Link
          href="/app/settings"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Configure advanced settings →
        </Link>
      </div>

      <style jsx>{`
        @keyframes pop-in {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          70% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .checkmark-icon {
          animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1 state
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  )
  const [profileType, setProfileType] = useState<ProfileType | null>(null)

  // Step 3 state
  const [contentChoice, setContentChoice] = useState<ContentChoice>(null)

  function goNext() {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
  }

  function goBack() {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
  }

  function handleGoToDashboard() {
    startTransition(async () => {
      await completeOnboarding()

      // If user chose a content action, navigate there instead of dashboard
      const ROUTES: Record<NonNullable<ContentChoice>, string> = {
        upload: '/app/videos',
        idea: '/app/ideas',
        import: '/app/videos',
      }
      const destination = contentChoice ? ROUTES[contentChoice] : '/app/dashboard'
      router.push(destination)
    })
  }

  const canProceed = currentStep !== 1 || (workspaceName.trim().length > 0 && profileType !== null)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-white font-bold text-lg mb-3">
            C
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Step {currentStep} of {STEP_LABELS.length} — {STEP_LABELS[currentStep - 1]}
          </p>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-8">
            <StepDots current={currentStep} total={STEP_LABELS.length} />

            {/* Step content */}
            {currentStep === 1 && (
              <Step1
                workspaceName={workspaceName}
                setWorkspaceName={setWorkspaceName}
                language={language}
                setLanguage={setLanguage}
                timezone={timezone}
                setTimezone={setTimezone}
                profileType={profileType}
                setProfileType={setProfileType}
              />
            )}
            {currentStep === 2 && <Step2 />}
            {currentStep === 3 && (
              <Step3 choice={contentChoice} setChoice={setContentChoice} />
            )}
            {currentStep === 4 && <Step4 onGoToDashboard={handleGoToDashboard} />}

            {/* Navigation buttons */}
            {currentStep < 4 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button variant="ghost" onClick={goBack} className="gap-1.5">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  )}
                  {currentStep === 2 && (
                    <Button variant="ghost" className="text-slate-400" onClick={goNext}>
                      Skip
                    </Button>
                  )}
                </div>

                <Button
                  onClick={goNext}
                  disabled={!canProceed}
                  className="gap-1.5"
                >
                  {currentStep === 3 ? 'Finish setup' : 'Next'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Loading overlay for final step */}
            {currentStep === 4 && isPending && (
              <p className="text-center text-xs text-slate-400 mt-4">Saving…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
