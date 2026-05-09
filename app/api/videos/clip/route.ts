import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { rateLimit } from '@/lib/rate-limit'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const DEFAULT_MODEL = 'mistral'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local'
  const rl = rateLimit(`clipify:${ip}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Max 10 clipify requests per minute.' }, { status: 429 })
  }

  try {
    const { video_id } = await request.json()

    if (!video_id) {
      return NextResponse.json({ error: 'video_id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // 1. Fetch video and its transcript
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*, transcripts(*)')
      .eq('id', video_id)
      .eq('workspace_id', WORKSPACE_ID)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const transcript = video.transcripts?.[0]
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript found. Please transcribe the video first.' }, { status: 400 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos/clip',
      entity_type: 'video',
      entity_id: video_id,
      message: `Clipify detection started for: ${video.title}`,
    })

    // 2. Build transcript summary with timestamps for Ollama
    const segments = transcript.segments_json as Array<{ start: number; end: number; text: string }> | null
    const transcriptText = segments 
      ? segments.map(s => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`).join('\n')
      : transcript.content

    // 3. Ask Ollama to find viral segments
    const prompt = `Tu es un expert en curation de contenu viral (Clipify). Voici la transcription d'une vidéo avec timestamps.
Analyse le texte pour trouver les 3 à 5 segments les plus "clippables" (entre 10 et 40 secondes).

RECHERCHE CES SIGNAUX :
- Punchlines, rires (haha), ou réactions fortes.
- Moments de "reversal" ou réponses inattendues.
- Citations percutantes ou conseils "clairs".
- Évite les segments trop longs ou sans fin claire.

Transcription :
${transcriptText.slice(0, 8000)}

Réponds UNIQUEMENT avec un tableau JSON valide contenant :
- title (titre accrocheur)
- start_seconds (début en secondes)
- end_seconds (fin en secondes)
- caption (pourquoi c'est viral)
- aspect_ratio (toujours "9:16")

Exemple :
[
  {
    "title": "Le secret du succès",
    "start_seconds": 15.2,
    "end_seconds": 38.5,
    "caption": "Une explication percutante sur la persévérance.",
    "aspect_ratio": "9:16"
  }
]`

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
        source: 'videos/clip',
        entity_id: video_id,
        message: `Ollama failed: ${errText}`,
      })
      return NextResponse.json({ error: 'Ollama error' }, { status: 503 })
    }

    const ollamaData = await ollamaRes.json()
    const rawResponse = ollamaData.response || ''
    
    let clipSuggestions: any[] = []
    try {
      clipSuggestions = JSON.parse(rawResponse)
    } catch (e) {
      const match = rawResponse.match(/\[[\s\S]*\]/)
      if (match) clipSuggestions = JSON.parse(match[0])
    }

    if (!Array.isArray(clipSuggestions) || clipSuggestions.length === 0) {
      return NextResponse.json({ error: 'No clips identified' }, { status: 500 })
    }

    // 4. Create clips in DB
    const clipsPayload = clipSuggestions.map(c => ({
      workspace_id: WORKSPACE_ID,
      video_id: video_id,
      title: c.title,
      start_ms: Math.floor(c.start_seconds * 1000),
      end_ms: Math.floor(c.end_seconds * 1000),
      caption: c.caption,
      aspect_ratio: c.aspect_ratio || '9:16',
      status: 'draft'
    }))

    const { data: createdClips, error: clipsError } = await supabase
      .from('clips')
      .insert(clipsPayload)
      .select()

    if (clipsError) {
      return NextResponse.json({ error: clipsError.message }, { status: 500 })
    }

    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'videos/clip',
      entity_type: 'video',
      entity_id: video_id,
      message: `Clipify: ${createdClips.length} segments detected.`,
      payload_json: { segments: clipSuggestions },
    })

    return NextResponse.json({ data: createdClips })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

