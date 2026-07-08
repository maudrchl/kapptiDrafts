import { SESSION_COOKIE, parseCookies, verifySession } from './lib/oidc'

/**
 * Protège toute l'app : sans session valide, redirige vers le login Google.
 * Les routes /api/auth/* sont exclues via le matcher (sinon boucle de redirection).
 */
export const config = {
  matcher: ['/((?!api/auth).*)'],
}

export default async function middleware(req: Request): Promise<Response | undefined> {
  const token = parseCookies(req.headers.get('cookie'))[SESSION_COOKIE]
  const session = await verifySession(token)
  if (session) return undefined // authentifié → on continue

  const url = new URL(req.url)
  const login = new URL('/api/auth/login', url.origin)
  login.searchParams.set('rd', url.pathname + url.search)
  return new Response(null, { status: 302, headers: { Location: login.toString() } })
}
