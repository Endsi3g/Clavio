import { checkIntegrationStatus } from '@/lib/integrations-check'
import { NextResponse } from 'next/server'

export async function GET() {
  const [ollama, whisper] = await Promise.all([
    checkIntegrationStatus('ollama'),
    checkIntegrationStatus('whisper'),
  ])
  return NextResponse.json({ ollama, whisper })
}
