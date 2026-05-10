import { checkIntegrationStatus } from '@/lib/integrations-check'
import { NextResponse } from 'next/server'

export async function GET() {
  const status = await checkIntegrationStatus('n8n')
  return NextResponse.json({ n8n: status })
}
