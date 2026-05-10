'use server'

import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function bookmarkArticle(formData: FormData) {
  const supabase = await createServerClient()

  const title = formData.get('title') as string
  const url = formData.get('url') as string
  const description = formData.get('description') as string | null
  const imageUrl = formData.get('image_url') as string | null
  const source = formData.get('source') as string

  await supabase.from('assets').insert({
    workspace_id: WORKSPACE_ID,
    name: title,
    asset_type: 'news_bookmark',
    url,
    metadata: {
      description,
      image_url: imageUrl,
      source,
    },
  })

  revalidatePath('/app/news')
}
