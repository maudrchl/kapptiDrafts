import { SESSION_COOKIE, parseCookies, verifySession } from '../lib/oidc'

export const config = { runtime: 'edge' }

/**
 * Petit key-value partagé pour les protos HTML (ex. suivi POC 2).
 * - GET  ?key=…  → { value, canEdit } (tout utilisateur connecté peut lire)
 * - PUT  { key, value } → écrit (réservé aux profils EDITORS)
 * - DELETE ?key=… → supprime (réservé aux profils EDITORS)
 *
 * L'écriture est gardée côté serveur (session Google) → seul le profil
 * autorisé peut modifier, même si l'UI est contournée.
 */
const EDITORS = ['mood@kapptivate.com']

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export default async function handler(req: Request): Promise<Response> {
  const token = parseCookies(req.headers.get('cookie'))[SESSION_COOKIE]
  const session = await verifySession(token)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) return json({ value: null, canEdit: false })

  const canEdit = EDITORS.includes(session.email)
  const H = {
    apikey: sbKey,
    Authorization: `Bearer ${sbKey}`,
    'Content-Type': 'application/json',
  }
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const key = url.searchParams.get('key') ?? ''
    const r = await fetch(
      `${sbUrl}/rest/v1/proto_kv?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: H },
    )
    const rows = r.ok ? ((await r.json()) as { value: string }[]) : []
    return json({ value: rows[0]?.value ?? null, canEdit })
  }

  if (req.method === 'PUT') {
    if (!canEdit) return new Response('Forbidden', { status: 403 })
    const { key, value } = (await req.json()) as { key: string; value: string }
    await fetch(`${sbUrl}/rest/v1/proto_kv?on_conflict=key`, {
      method: 'POST',
      headers: { ...H, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    })
    return json({ ok: true })
  }

  if (req.method === 'DELETE') {
    if (!canEdit) return new Response('Forbidden', { status: 403 })
    const key = url.searchParams.get('key') ?? ''
    await fetch(`${sbUrl}/rest/v1/proto_kv?key=eq.${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: H,
    })
    return json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405 })
}
