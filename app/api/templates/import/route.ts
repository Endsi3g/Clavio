import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2'

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    // Dynamic import avoids Next.js edge runtime issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text
  }

  // Plain text / markdown / docx fallback
  return buffer.toString('utf-8')
}

async function generateTemplateWithOllama(text: string, fileName: string): Promise<{
  name: string
  description: string
  format: string
  platforms: string[]
  structure: { section: string; description: string; tips?: string }[]
}> {
  const truncated = text.slice(0, 4000)

  const prompt = `You are a content strategist. Analyze the following document and extract a reusable content template.

Document name: "${fileName}"
Document content:
---
${truncated}
---

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "name": "Template name (max 60 chars)",
  "description": "What this template is for (max 150 chars)",
  "format": "one of: short, long, thread, reel, newsletter, general",
  "platforms": ["list of: youtube, tiktok, instagram, linkedin, twitter, general"],
  "structure": [
    { "section": "Section name", "description": "What goes here", "tips": "Optional writing tip" }
  ]
}`

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 1024 },
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) throw new Error('Ollama request failed')

    const data = await res.json()
    const raw: string = data.response ?? ''

    // Extract JSON from response (Ollama sometimes adds text around it)
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in Ollama response')

    return JSON.parse(match[0])
  } catch {
    // Fallback template when Ollama is unavailable
    return {
      name: fileName.replace(/\.[^.]+$/, ''),
      description: 'Imported template — edit to add structure',
      format: 'general',
      platforms: ['general'],
      structure: [
        { section: 'Introduction', description: 'Opening hook or context' },
        { section: 'Main content', description: 'Core body of the piece' },
        { section: 'Conclusion', description: 'Summary and call to action' },
      ],
    }
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const maxBytes = 10 * 1024 * 1024 // 10 MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const allowed = ['application/pdf', 'text/plain', 'text/markdown', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|md|doc|docx)$/i)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  // 1. Upload file to Supabase Storage
  const path = `templates/${WORKSPACE_ID}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('assets')
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    })

  let sourceAssetId: string | null = null

  if (!uploadError) {
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path)

    const { data: assetRow } = await supabase
      .from('assets')
      .insert({
        workspace_id: WORKSPACE_ID,
        name: file.name,
        asset_type: 'template_source',
        url: publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select('id')
      .single()

    sourceAssetId = assetRow?.id ?? null
  }

  // 2. Extract text content
  let extractedText = ''
  try {
    extractedText = await extractText(file)
  } catch {
    extractedText = ''
  }

  // 3. Generate template structure via Ollama
  const templateData = await generateTemplateWithOllama(extractedText, file.name)

  // 4. Save to content_templates
  const { data: template, error: dbError } = await supabase
    .from('content_templates')
    .insert({
      workspace_id: WORKSPACE_ID,
      name: templateData.name,
      description: templateData.description,
      format: templateData.format,
      platforms: templateData.platforms,
      structure: templateData.structure,
      source_asset_id: sourceAssetId,
      source_type: file.name.split('.').pop()?.toLowerCase() ?? 'txt',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ template })
}
