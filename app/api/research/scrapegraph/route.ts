import { NextRequest, NextResponse } from 'next/server'
import { runScrapeGraph } from '@/lib/python-bridge'

export async function POST(req: NextRequest) {
  try {
    const { url, prompt } = await req.json()

    if (!url || !prompt) {
      return NextResponse.json({ error: 'URL and prompt are required' }, { status: 400 })
    }

    const result = await runScrapeGraph(url, prompt)
    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[ScrapeGraph API Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
