import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { runScrapeGraph } from '@/lib/python-bridge'

export async function POST(req: NextRequest) {
  try {
    const { url, prompt } = await req.json()

    if (!url || !prompt) {
      return NextResponse.json({ error: 'URL and prompt are required' }, { status: 400 })
    }

    const result = await runScrapeGraph(url, prompt)

    const supabase = await createServerClient()
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'info',
      source: 'research/scrapegraph',
      message: `ScrapeGraph research completed for ${url}`,
      payload_json: { url, prompt },
    })

    return NextResponse.json({ result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('[ScrapeGraph API Error]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
