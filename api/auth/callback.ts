import {
  SESSION_COOKIE,
  OAUTH_COOKIE,
  cookie,
  parseCookies,
  b64urlDecode,
  safePath,
  signSession,
  verifyGoogleIdToken,
  isAllowedEmail,
  ALLOWED_DOMAIN,
} from '../../lib/oidc'

export const config = { runtime: 'edge' }

const deny = (msg: string, status = 403) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>Accès refusé</title>` +
      `<div style="font:15px system-ui;max-width:520px;margin:12vh auto;text-align:center;color:#24292f">` +
      `<h2>Accès refusé</h2><p style="color:#667085">${msg}</p>` +
      `<p><a href="/api/auth/login" style="color:#d26334">Réessayer</a></p></div>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )

export default async function handler(req: Request): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret)
    return new Response('Configuration OAuth manquante', { status: 500 })

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateRaw = url.searchParams.get('state')
  if (!code || !stateRaw) return deny('Requête invalide.', 400)

  let state: { n: string; rd: string }
  try {
    state = JSON.parse(b64urlDecode(stateRaw))
  } catch {
    return deny('État OAuth invalide.', 400)
  }

  const nonce = parseCookies(req.headers.get('cookie'))[OAUTH_COOKIE]
  if (!nonce || nonce !== state.n) return deny('État OAuth non concordant.', 400)

  const redirectUri = `${url.origin}/api/auth/callback`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) return deny("Échec de l'échange du code.", 400)
  const tokens = (await tokenRes.json()) as { id_token?: string }
  if (!tokens.id_token) return deny('id_token absent.', 400)

  const claims = await verifyGoogleIdToken(tokens.id_token, clientId)
  if (!claims) return deny('id_token invalide.', 401)
  if (!claims.emailVerified || !isAllowedEmail(claims.email, claims.hd))
    return deny(
      `Seuls les comptes @${ALLOWED_DOMAIN()} sont autorisés (connecté en ${claims.email || 'inconnu'}).`,
    )

  const session = await signSession(claims.email)
  const headers = new Headers({ Location: safePath(state.rd) })
  headers.append('Set-Cookie', cookie(SESSION_COOKIE, session, 60 * 60 * 24 * 7))
  headers.append('Set-Cookie', cookie(OAUTH_COOKIE, '', 0))
  return new Response(null, { status: 302, headers })
}
