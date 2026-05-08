import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const DEFAULT_MODEL = 'mistral'

export async function POST(request: NextRequest) {
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
      source: 'videos/clipify',
      entity_type: 'video',
      entity_id: video_id,
      message: `Clipify detection started for: ${video.title}`,
    })

    // 2. Ask Ollama to find viral segments
    const prompt = `Tu es un expert en curation de contenu viral. Voici la transcription d'une vidéo (incluant les timestamps).
Analyse le texte pour trouver les 3 à 5 segments les plus "clippables" (entre 10 et 40 secondes).
Recherche les signaux suivants :
- Punchlines et réactions fortes.
- Moments de "reversal" (question posée -> réponse inattendue).
- Silences gênants ou hésitations marquées (uh, um).
- Citations percutantes qui se suffisent à elles-mêmes.

Transcription :
${JSON.stringify(transcript.segments_json)}

Réponds UNIQUEMENT avec un tableau JSON valide contenant :
- start (en secondes)
- end (en secondes)
- why_funny (pourquoi ce segment est viral/drôle)
- suggested_title (un titre accrocheur pour le clip)

Exemple :
[
  {
    "start": 12.5,
    "end": 35.0,
    "why_funny": "L'invité raconte une anecdote surprenante sur son premier échec.",
    "suggested_title": "L'échec qui a tout changé"
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
      return NextResponse.json({ error: 'Ollama error: ' + errText }, { status: 503 })
    }

    const ollamaData = await ollamaRes.json()
    const rawResponse = ollamaData.response || ''
    
    let segments: any[] = []
    try {
      segments = JSON.parse(rawResponse)
    } catch (e) {
      // Fallback regex if not perfect JSON
      const match = rawResponse.match(/\[[\s\S]*\]/)
      if (match) segments = JSON.parse(match[0])
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: 'Ollama failed to detect segments' }, { status: 500 })
    }

    // 3. Create clips in DB
    const clipsPayload = segments.map(s => ({
      workspace_id: WORKSPACE_ID,
      video_id: video_id,
      title: s.suggested_title,
      start_ms: Math.floor(s.start * 1000),
      end_ms: Math.floor(s.end * 1000),
      caption: s.why_funny,
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
      source: 'videos/clipify',
      entity_type: 'video',
      entity_id: video_id,
      message: `Clipify detected ${createdClips.length} potential segments.`,
      payload_json: { segments },
    })

    return NextResponse.json({ data: createdClips })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
