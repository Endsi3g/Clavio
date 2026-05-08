import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const DEFAULT_MODEL = 'mistral'

export async function POST(request: NextRequest) {
  try {
    const { idea_id, platform } = await request.json()

    if (!idea_id) {
      return NextResponse.json({ error: 'idea_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', idea_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const platformHint = (platform ?? idea.platform) ? `optimisé pour ${platform ?? idea.platform}` : 'pour les réseaux sociaux'
    const prompt = `Tu es un expert en création de contenu vidéo. Crée un script complet ${platformHint} basé sur cette idée :

Titre : ${idea.title}
Description : ${idea.description ?? ''}
Hook initial : ${idea.prompt ?? ''}

Le script doit avoir cette structure JSON :
{
  "hook": "Phrase d'accroche (0-5 secondes)",
  "retainer": "Ce qui retient l'attention (5-15 secondes)",
  "body": "Corps du contenu (3-5 points clés)",
  "cta": "Appel à l'action final",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "estimated_duration_seconds": 60
}

Réponds UNIQUEMENT avec le JSON valide.`

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'ideas/expand',
      entity_type: 'idea',
      entity_id: idea_id,
      message: `Script expansion started for idea: ${idea.title}`,
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
      return NextResponse.json({ error: 'Ollama service unavailable' }, { status: 503 })
    }

    const ollamaData = await ollamaRes.json()
    const rawResponse = ollamaData.response || ''

    let script: Record<string, unknown> = {}
    try {
      script = JSON.parse(rawResponse)
    } catch {
      const match = rawResponse.match(/\{[\s\S]*\}/)
      if (match) {
        try { script = JSON.parse(match[0]) } catch { /* ignore */ }
      }
    }

    // Create a variant with the generated script
    const { data: variant, error: variantError } = await supabase
      .from('idea_variants')
      .insert({
        workspace_id: WORKSPACE_ID,
        idea_id,
        variant_type: platform ?? idea.platform ?? 'general',
        hook: typeof script.hook === 'string' ? script.hook : null,
        script: JSON.stringify(script),
        cta: typeof script.cta === 'string' ? script.cta : null,
        status: 'draft',
      })
      .select()
      .single()

    if (variantError) {
      return NextResponse.json({ error: variantError.message }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'ideas/expand',
      entity_type: 'idea',
      entity_id: idea_id,
      message: `Script variant created for: ${idea.title}`,
      payload_json: { variant_id: variant.id },
    })

    return NextResponse.json({ data: variant }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
