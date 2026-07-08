import {
  OAUTH_COOKIE,
  cookie,
  b64urlEncode,
  safePath,
  ALLOWED_DOMAIN,
} from '../../lib/oidc'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return new Response('GOOGLE_CLIENT_ID manquant', { status: 500 })

  const url = new URL(req.url)
  const rd = safePath(url.searchParams.get('rd'))
  const nonce = crypto.randomUUID()
  const state = b64urlEncode(JSON.stringify({ n: nonce, rd }))

  const redirectUri = `${url.origin}/api/auth/callback`
  const google = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  google.searchParams.set('client_id', clientId)
  google.searchParams.set('redirect_uri', redirectUri)
  google.searchParams.set('response_type', 'code')
  google.searchParams.set('scope', 'openid email profile')
  google.searchParams.set('state', state)
  google.searchParams.set('hd', ALLOWED_DOMAIN())
  google.searchParams.set('prompt', 'select_account')
  google.searchParams.set('access_type', 'online')

  return new Response(null, {
    status: 302,
    headers: {
      Location: google.toString(),
      'Set-Cookie': cookie(OAUTH_COOKIE, nonce, 600),
    },
  })
}
