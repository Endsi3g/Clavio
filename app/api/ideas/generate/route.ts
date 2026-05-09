import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { rateLimit } from '@/lib/rate-limit'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const DEFAULT_MODEL = 'llama3.2'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local'
  const rl = rateLimit(`ideas-generate:${ip}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Max 10 generations per minute.' }, { status: 429 })
  }

  try {
    const { subject, platform, format, count = 5 } = await request.json()

    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const platformHint = platform ? `pour la plateforme ${platform}` : 'pour les réseaux sociaux'
    const formatHint = format ? `au format ${format}` : ''
    const prompt = `Tu es un expert en création de contenu vidéo. Génère exactement ${count} idées de contenu originales ${platformHint} ${formatHint} sur le sujet suivant : "${subject.trim()}".

Pour chaque idée, fournis :
- Un titre accrocheur (max 80 caractères)
- Une description courte (1-2 phrases)
- Un hook d'ouverture percutant

Réponds UNIQUEMENT avec un tableau JSON valide. Exemple :
[
  {
    "title": "Titre de l'idée",
    "description": "Description courte de l'idée.",
    "hook": "Hook d'ouverture percutant."
  }
]`

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'ideas/generate',
      message: `Ollama generation started for subject: ${subject.trim()}`,
      payload_json: { subject, platform, format, count, model: DEFAULT_MODEL },
    })

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        format: 'json',
      }),
    })

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text()
      await supabase.from('logs').insert({
        workspace_id: WORKSPACE_ID,
        severity: 'error',
        source: 'ideas/generate',
        message: `Ollama request failed: ${errText}`,
      })
      return NextResponse.json({ error: 'Ollama service unavailable. Ensure it is running at ' + OLLAMA_BASE_URL }, { status: 503 })
    }

    const ollamaData = await ollamaRes.json()
    const rawResponse = ollamaData.response || ''

    let ideas: Array<{ title: string; description: string; hook: string }> = []
    try {
      const parsed = JSON.parse(rawResponse)
      ideas = Array.isArray(parsed) ? parsed : []
    } catch {
      const match = rawResponse.match(/\[[\s\S]*\]/)
      if (match) {
        try {
          ideas = JSON.parse(match[0])
        } catch {
          return NextResponse.json({ error: 'Failed to parse Ollama response as JSON' }, { status: 500 })
        }
      }
    }

    if (ideas.length === 0) {
      return NextResponse.json({ error: 'Ollama returned no ideas' }, { status: 500 })
    }

    // Insert each idea into the DB
    const insertPayload = ideas.map((idea) => ({
      workspace_id: WORKSPACE_ID,
      title: idea.title,
      description: idea.description,
      prompt: idea.hook,
      status: 'draft' as const,
      source_type: 'ai',
      platform: platform ?? null,
      format: format ?? null,
    }))

    const { data: created, error: dbError } = await supabase
      .from('ideas')
      .insert(insertPayload)
      .select()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'ideas/generate',
      message: `Ollama generated ${created?.length ?? 0} ideas for: ${subject.trim()}`,
      payload_json: { subject, count: created?.length },
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
