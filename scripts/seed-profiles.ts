import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Seeding profiles and notifications...')

  // Seed profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      workspace_id: WORKSPACE_ID,
      full_name: 'Admin User',
      email: 'admin@clavio.com',
      avatar_url: null,
    }, { onConflict: 'workspace_id, email' })

  if (profileError) console.error('Error seeding profile:', profileError)

  // Seed notifications
  const { error: notifError } = await supabase
    .from('notifications')
    .insert([
      {
        workspace_id: WORKSPACE_ID,
        title: 'Système prêt',
        message: 'Bienvenue sur Clavio. Votre espace de travail est configuré.',
        type: 'success',
      },
      {
        workspace_id: WORKSPACE_ID,
        title: 'Nouvelle idée générée',
        message: 'Une nouvelle idée de contenu a été générée via AI.',
        type: 'info',
      }
    ])

  if (notifError) console.error('Error seeding notifications:', notifError)

  console.log('✅ Seeding completed.')
}

seed()
