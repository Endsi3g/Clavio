import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `assets/${WORKSPACE_ID}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: publicUrl } = supabase.storage.from('assets').getPublicUrl(storagePath)

    const { data: assetRecord, error: dbError } = await supabase
      .from('assets')
      .insert({
        workspace_id: WORKSPACE_ID,
        asset_type: type || 'other',
        name: name || file.name,
        url: publicUrl.publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from('assets').remove([storagePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ data: assetRecord }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
