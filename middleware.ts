import { SESSION_COOKIE, parseCookies, verifySession } from './lib/oidc'

/**
 * Protège toute l'app : sans session valide, redirige vers le login Google.
 * Les routes /api/auth/* sont exclues via le matcher (sinon boucle de redirection).
 * /api/notify aussi : c'est un webhook Supabase authentifié par un secret
 * (x-webhook-secret), pas par le cookie de session → il ne doit pas être
 * redirigé vers le login Google.
 */
export const config = {
  matcher: ['/((?!api/auth|api/notify).*)'],
}

/**
 * Routes publiques : liens d'interview scopés (`/share/*`) + assets statiques
 * nécessaires pour charger la SPA sur ces liens (le bundle n'est pas secret).
 * Le reste (home, /p/*, /design-system) reste derrière le login Google.
 */
const isPublicPath = (p: string) =>
  p.startsWith('/share/') ||
  p.startsWith('/assets/') ||
  p === '/version.json' ||
  p.startsWith('/favicon') ||
  p === '/robots.txt'

export default async function middleware(req: Request): Promise<Response | undefined> {
  const url = new URL(req.url)
  if (isPublicPath(url.pathname)) return undefined

  const token = parseCookies(req.headers.get('cookie'))[SESSION_COOKIE]
  const session = await verifySession(token)
  if (session) return undefined // authentifié → on continue

  const login = new URL('/api/auth/login', url.origin)
  login.searchParams.set('rd', url.pathname + url.search)
  return new Response(null, { status: 302, headers: { Location: login.toString() } })
}
