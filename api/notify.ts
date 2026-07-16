export const config = { runtime: 'edge' }

/**
 * Notifications collab → DM Slack.
 *
 * Appelée par un **Database Webhook Supabase** sur `INSERT` de
 * `proto_comments` et `proto_comment_replies`. Envoie un message privé
 * (bot Slack) aux personnes concernées :
 *  - réponse  → tous les participants du thread (auteur + répondants)
 *  - commentaire → (mentions à venir, Lot 2)
 *  - dans tous les cas → Maud, en catch-all perso.
 *
 * L'auteur de l'action n'est jamais notifié de sa propre action.
 *
 * Env nécessaires (Vercel) :
 *  - SLACK_BOT_TOKEN            (xoxb-… ; scopes chat:write + users:read.email)
 *  - SUPABASE_URL              (https://xxxx.supabase.co)
 *  - SUPABASE_SERVICE_ROLE_KEY (lecture serveur des threads)
 *  - NOTIFY_WEBHOOK_SECRET     (partagé avec le header du webhook Supabase)
 *  - APP_BASE_URL              (optionnel ; sinon dérivé de la requête)
 */

// Catch-all : reçoit toutes les notifs.
const ALWAYS_NOTIFY = ['maud.rochel@kapptivate.com']

// Titre lisible d'un proto (le webhook n'a que le slug ; le titre vit côté client).
const PROTO_TITLES: Record<string, string> = {
  'ai-usage': 'AI Usage',
  checks: 'Checks & API',
  locations: 'Public & Private Locations',
  observability: 'Observability Experience',
  'send-results-by-email': 'Send results by email',
  'exploration-ui': 'Exploration UI',
  'run-queue': 'Run Queue',
  'root-cause-analysis': 'Root Cause Analysis',
  'observability-navigation': 'Observability Navigation',
}
const protoTitle = (slug: string) =>
  PROTO_TITLES[slug] ||
  slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

type WebhookBody = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, any> | null
}

const displayName = (email: string) => {
  const local = (email.split('@')[0] || email).replace(/[._-]+/g, ' ')
  return local.replace(/\b\w/g, (c) => c.toUpperCase())
}

const excerpt = (body: string, n = 140) => {
  const s = (body || '').replace(/\s+/g, ' ').trim()
  return s.length > n ? s.slice(0, n) + '…' : s
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const secret = process.env.NOTIFY_WEBHOOK_SECRET
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 })
  }

  const slackToken = process.env.SLACK_BOT_TOKEN
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  // Pas configuré → no-op (on ne casse pas le flux commentaires).
  if (!slackToken || !sbUrl || !sbKey) {
    return new Response(JSON.stringify({ skipped: 'not configured' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let payload: WebhookBody
  try {
    payload = (await req.json()) as WebhookBody
  } catch {
    return new Response('Bad payload', { status: 400 })
  }
  const { table, record } = payload
  if (!record) return new Response('ok')

  const sbGet = async (query: string): Promise<any[]> => {
    const r = await fetch(`${sbUrl}/rest/v1/${query}`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
    })
    return r.ok ? ((await r.json()) as any[]) : []
  }

  const author: string = record.author_email || ''
  const recipients = new Set<string>()
  let protoSlug = ''
  let commentId = ''
  let text = ''

  if (table === 'proto_comment_replies') {
    commentId = record.comment_id
    const [parent] = await sbGet(
      `proto_comments?id=eq.${commentId}&select=author_email,proto_slug`,
    )
    protoSlug = parent?.proto_slug ?? ''
    if (parent?.author_email) recipients.add(parent.author_email)
    const replies = await sbGet(
      `proto_comment_replies?comment_id=eq.${commentId}&select=author_email`,
    )
    replies.forEach((r) => r.author_email && recipients.add(r.author_email))
    text = `💬 *${displayName(author)}* a répondu sur *${protoTitle(protoSlug)}*\n>${excerpt(record.body)}`
  } else if (table === 'proto_comments') {
    // Les stamps emoji ne notifient pas.
    if (record.kind && record.kind !== 'comment') return new Response('ok')
    commentId = record.id
    protoSlug = record.proto_slug ?? ''
    // @mentions : les personnes taguées reçoivent aussi le DM.
    ;(record.mentions ?? []).forEach((e: string) => e && recipients.add(e))
    text = `📌 *${displayName(author)}* a commenté *${protoTitle(protoSlug)}*\n>${excerpt(record.body)}`
  } else {
    return new Response('ok')
  }

  // Les participants ne sont jamais notifiés de leur propre action…
  recipients.delete(author)
  // …mais le catch-all (Maud) reçoit tout, y compris ses propres commentaires.
  ALWAYS_NOTIFY.forEach((e) => recipients.add(e))

  const base = process.env.APP_BASE_URL || new URL(req.url).origin
  const link = `${base}/p/${protoSlug}?comment=${commentId}`
  const message = `${text}\n${link}`

  const slackLookup = async (email: string): Promise<string | null> => {
    const r = await fetch(
      `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${slackToken}` } },
    )
    const d = await r.json()
    return d.ok ? d.user.id : null
  }
  const slackDM = async (channel: string) => {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${slackToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ channel, text: message }),
    })
  }

  const sent: string[] = []
  for (const email of recipients) {
    if (!email) continue
    const uid = await slackLookup(email)
    if (uid) {
      await slackDM(uid)
      sent.push(email)
    }
  }

  return new Response(JSON.stringify({ table, recipients: sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
