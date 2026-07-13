import { SESSION_COOKIE, parseCookies, verifySession } from '../lib/oidc'

export const config = { runtime: 'edge' }

/**
 * Expose au client l'utilisateur courant (email) lu depuis le cookie de
 * session HttpOnly. Le SPA n'a aucun autre moyen de savoir qui est connecté.
 * On ne renvoie que l'email : nom d'affichage et avatar sont dérivés côté client.
 */
export default async function handler(req: Request): Promise<Response> {
  const token = parseCookies(req.headers.get('cookie'))[SESSION_COOKIE]
  const session = await verifySession(token)
  if (!session) return new Response('Unauthorized', { status: 401 })
  return new Response(JSON.stringify({ email: session.email }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
