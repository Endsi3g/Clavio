import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { WORKSPACE_ID } from '@/lib/types'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email, role = 'member' } = await req.json()

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const ALLOWED_ROLES = ['admin', 'member', 'viewer']
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = await createServerClient()

  // Generate a secure invite token via Supabase Auth
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { workspace_id: WORKSPACE_ID, role },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/app/dashboard`,
    }
  )

  if (inviteError) {
    // Log failure
    await supabase.from('logs').insert({
      workspace_id: WORKSPACE_ID,
      severity: 'error',
      source: 'team',
      entity_type: 'workspace_member',
      message: `Failed to invite ${email}: ${inviteError.message}`,
    })
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Send custom invite email
  await sendEmail({
    to: email,
    subject: 'You\'ve been invited to Clavio',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #0f172a;">You're invited to join a Clavio workspace</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 16px 0;">
          You've been invited as a <strong>${role}</strong>. Click the button below to accept and get started.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/app/dashboard"
           style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin: 8px 0;">
          Accept invitation
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  })

  await supabase.from('logs').insert({
    workspace_id: WORKSPACE_ID,
    severity: 'info',
    source: 'team',
    entity_type: 'workspace_member',
    message: `Invitation sent to ${email} (role: ${role})`,
  })

  return NextResponse.json({ success: true, userId: inviteData.user?.id })
}
