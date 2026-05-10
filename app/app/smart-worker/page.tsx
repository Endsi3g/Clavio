'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Brain, Mic, Loader2, Copy, CheckCircle2, Upload, Sparkles } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type ServiceStatus = 'checking' | 'connected' | 'disconnected'

function StatusDot({ status }: { status: ServiceStatus }) {
  if (status === 'checking') return <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse inline-block" />
  if (status === 'connected') return (
    <span className="relative flex h-2 w-2 inline-block">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  )
  return <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
}

export default function SmartWorkerPage() {
  const [ollamaStatus, setOllamaStatus] = React.useState<ServiceStatus>('checking')
  const [whisperStatus, setWhisperStatus] = React.useState<ServiceStatus>('checking')

  const [subject, setSubject] = React.useState('')
  const [generatingIdeas, setGeneratingIdeas] = React.useState(false)
  const [generatedIdeas, setGeneratedIdeas] = React.useState<string[]>([])

  const [transcribing, setTranscribing] = React.useState(false)
  const [transcript, setTranscript] = React.useState('')
  const [uploadProgress, setUploadProgress] = React.useState<string>('')

  React.useEffect(() => {
    fetch('/api/health/smart-worker')
      .then(r => r.json())
      .then(d => {
        setOllamaStatus(d.ollama === 'connected' ? 'connected' : 'disconnected')
        setWhisperStatus(d.whisper === 'connected' ? 'connected' : 'disconnected')
      })
      .catch(() => {
        setOllamaStatus('disconnected')
        setWhisperStatus('disconnected')
      })
  }, [])

  async function handleGenerateIdeas() {
    if (!subject.trim()) return
    setGeneratingIdeas(true)
    setGeneratedIdeas([])
    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim() }),
      })
      const data = await res.json()
      const ideas = Array.isArray(data) ? data.map((i: { title?: string; description?: string } | string) =>
        typeof i === 'string' ? i : i.title ?? i.description ?? JSON.stringify(i)
      ) : []
      setGeneratedIdeas(ideas)
      if (ideas.length === 0) toast.error('No ideas returned. Check that Ollama is running.')
    } catch {
      toast.error('Failed to connect to Ollama.')
    } finally {
      setGeneratingIdeas(false)
    }
  }

  async function handleTranscribeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setTranscribing(true)
    setTranscript('')
    setUploadProgress('Uploading…')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/videos/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { id: videoId } = await uploadRes.json()

      setUploadProgress('Transcribing with Whisper…')
      const transcribeRes = await fetch('/api/videos/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
      if (!transcribeRes.ok) throw new Error('Transcription failed')
      const { transcript: text } = await transcribeRes.json()
      setTranscript(text ?? '')
      setUploadProgress('')
      toast.success('Transcription complete.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Transcription failed.')
      setUploadProgress('')
    } finally {
      setTranscribing(false)
    }
  }

  function copyTranscript() {
    navigator.clipboard.writeText(transcript)
    toast.success('Copied to clipboard.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Smart Worker</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Local AI — Ollama for idea generation, Whisper for transcription.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <StatusDot status={ollamaStatus} />
            <span>Ollama</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <StatusDot status={whisperStatus} />
            <span>Whisper</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ollama — Idea Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Brain className="h-5 w-5 text-blue-500" />
              Idea Generator
            </CardTitle>
            <CardDescription>Generate content ideas from a topic using Ollama (llama3.2)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AI video editing tools for creators"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateIdeas()}
                disabled={generatingIdeas}
              />
              <Button
                onClick={handleGenerateIdeas}
                disabled={generatingIdeas || !subject.trim()}
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                {generatingIdeas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>

            {generatingIdeas && (
              <p className="text-sm text-slate-500 animate-pulse">Thinking with llama3.2…</p>
            )}

            {generatedIdeas.length > 0 && (
              <div className="space-y-2 pt-1">
                {generatedIdeas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-800">
                    <span className="shrink-0 text-blue-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                    <span>{idea}</span>
                  </div>
                ))}
              </div>
            )}

            {generatedIdeas.length === 0 && !generatingIdeas && (
              <div className="py-8 text-center text-sm text-slate-400">
                Enter a topic and press Generate
              </div>
            )}
          </CardContent>
        </Card>

        {/* Whisper — Transcription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Mic className="h-5 w-5 text-violet-500" />
              Audio Transcription
            </CardTitle>
            <CardDescription>Transcribe audio or video files using local Whisper</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-sm text-slate-500">Upload audio or video file</span>
              <span className="text-xs text-slate-400 mt-0.5">MP3, WAV, MP4, MOV</span>
              <input
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={handleTranscribeUpload}
                disabled={transcribing}
              />
            </label>

            {transcribing && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress}
              </div>
            )}

            {transcript && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Transcript</span>
                  <Button variant="ghost" size="sm" onClick={copyTranscript} className="h-7 gap-1.5 text-xs">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={transcript}
                  readOnly
                  rows={8}
                  className="text-sm font-mono resize-none bg-slate-50"
                />
              </div>
            )}

            {!transcript && !transcribing && (
              <div className="py-4 text-center text-sm text-slate-400">
                Upload a file to start transcription
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status info */}
      {(ollamaStatus === 'disconnected' || whisperStatus === 'disconnected') && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-amber-800">
              {ollamaStatus === 'disconnected' && '⚠ Ollama is offline — start it with '}
              {ollamaStatus === 'disconnected' && <code className="font-mono text-xs bg-amber-100 px-1 rounded">ollama serve</code>}
              {ollamaStatus === 'disconnected' && whisperStatus === 'disconnected' && '. '}
              {whisperStatus === 'disconnected' && '⚠ Whisper is offline — start the whisper-asr-webservice container.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
