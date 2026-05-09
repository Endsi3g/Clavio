import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'hello@clavio.ai'

interface SendOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendOptions): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Email send failed' }
  }
}

export function welcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  p { line-height: 1.6; color: #475569; }
  .cta { display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
</style></head>
<body>
  <h1>Welcome to Clavio 🎉</h1>
  <p>Hi ${name},</p>
  <p>You're all set! Clavio is your AI-powered Content OS — from idea to published, automatically.</p>
  <p>Here's what to do first:</p>
  <ul>
    <li>Connect your social platforms in <strong>Integrations</strong></li>
    <li>Generate your first idea with AI</li>
    <li>Schedule your first post to the calendar</li>
  </ul>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard" class="cta">Open dashboard →</a>
  <div class="footer">Clavio · The AI Content OS · <a href="${process.env.NEXT_PUBLIC_APP_URL}">clavio.ai</a></div>
</body>
</html>`
}

export function postPublishedEmailHtml(title: string, platform: string, url?: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; }
  h2 { font-size: 20px; font-weight: 600; }
  .pill { display: inline-block; background: #ecfdf5; color: #065f46; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
  .cta { display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 12px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
</style></head>
<body>
  <span class="pill">✅ Published</span>
  <h2>${title}</h2>
  <p>Your post has been published to <strong>${platform}</strong> successfully.</p>
  ${url ? `<a href="${url}" class="cta">View post →</a>` : ''}
  <div class="footer">Clavio · <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/publishing">View all posts</a></div>
</body>
</html>`
}

export function approvalRequestEmailHtml(postTitle: string, requester: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; }
  h2 { font-size: 20px; font-weight: 600; }
  .cta { display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 12px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
</style></head>
<body>
  <h2>Review requested</h2>
  <p><strong>${requester}</strong> has submitted a post for your review:</p>
  <p><em>${postTitle}</em></p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/publishing" class="cta">Review post →</a>
  <div class="footer">Clavio · Content OS</div>
</body>
</html>`
}

export function weeklyDigestEmailHtml(stats: { published: number; scheduled: number; topPost?: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; font-weight: 700; }
  .stat { display: inline-block; text-align: center; margin: 0 16px; }
  .stat-num { font-size: 36px; font-weight: 800; color: #3b82f6; }
  .stat-label { font-size: 12px; color: #64748b; }
  .cta { display: inline-block; background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 12px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
</style></head>
<body>
  <h1>Your weekly digest</h1>
  <p>Here's a summary of your content activity this week:</p>
  <div style="margin: 24px 0;">
    <div class="stat"><div class="stat-num">${stats.published}</div><div class="stat-label">Published</div></div>
    <div class="stat"><div class="stat-num">${stats.scheduled}</div><div class="stat-label">Scheduled</div></div>
  </div>
  ${stats.topPost ? `<p>Top performing post: <strong>${stats.topPost}</strong></p>` : ''}
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/analytics" class="cta">View analytics →</a>
  <div class="footer">Clavio · You're receiving this because you have a Clavio account. <a href="#">Unsubscribe</a></div>
</body>
</html>`
}
