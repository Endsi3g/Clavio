import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // 1. Get asset to find storage path
    const { data: asset, error: getError } = await supabase
      .from('assets')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (getError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // 2. Delete from storage if it has a path
    if (asset.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('assets')
        .remove([asset.storage_path])
      
      if (storageError) {
        console.error('[Storage Delete Error]', storageError)
        // We continue even if storage delete fails to keep DB clean
      }
    }

    // 3. Delete from DB
    const { error: dbError } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
