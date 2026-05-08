const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678'
const N8N_WEBHOOK_URL = `${N8N_BASE_URL}/webhook-test/status-update`

export async function notifyStatusChange(entityType: string, entityId: string, oldStatus: string, newStatus: string, metadata: any = {}) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      entity_type: entityType,
      entity_id: entityId,
      old_status: oldStatus,
      new_status: newStatus,
      metadata,
    }

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.warn(`[n8n Webhook] Failed to notify status change: ${res.statusText}`)
    }
  } catch (err) {
    console.error(`[n8n Webhook Error]`, err)
  }
}
