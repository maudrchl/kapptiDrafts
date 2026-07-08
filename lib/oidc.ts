/**
 * Auth Google (OIDC) partagée entre l'Edge Middleware et les fonctions /api/auth.
 * Aucune dépendance à un framework : Web APIs + `jose` uniquement (edge-compatible).
 */
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose'

export const SESSION_COOKIE = '__ktm_session'
export const OAUTH_COOKIE = '__ktm_oauth'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 jours

export const ALLOWED_DOMAIN = () => process.env.ALLOWED_DOMAIN || 'kapptivate.com'

const secret = () => {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET manquant')
  return new TextEncoder().encode(s)
}

/** Cookie de session signé (HS256) contenant l'email autorisé. */
export async function signSession(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(secret())
}

export async function verifySession(
  token: string | undefined,
): Promise<{ email: string } | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    const email = payload.email
    if (typeof email !== 'string') return null
    return { email }
  } catch {
    return null
  }
}

/** Vérifie l'id_token Google via les clés publiques Google (JWKS). */
const googleJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
): Promise<{ email: string; emailVerified: boolean; hd?: string } | null> {
  try {
    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    })
    return {
      email: String(payload.email ?? ''),
      emailVerified: payload.email_verified === true,
      hd: typeof payload.hd === 'string' ? payload.hd : undefined,
    }
  } catch {
    return null
  }
}

export function isAllowedEmail(email: string, hd?: string): boolean {
  const domain = ALLOWED_DOMAIN().toLowerCase()
  const emailOk = email.toLowerCase().endsWith(`@${domain}`)
  // hd (hosted domain) présent pour les comptes Google Workspace
  const hdOk = !hd || hd.toLowerCase() === domain
  return emailOk && hdOk
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    const k = part.slice(0, i).trim()
    const v = part.slice(i + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

export function cookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): string {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ]
  return attrs.join('; ')
}

export const b64urlEncode = (s: string) =>
  btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const b64urlDecode = (s: string) => {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad)
}

/** N'autorise que des chemins internes (évite les open-redirects). */
export function safePath(rd: string | null | undefined): string {
  if (!rd || !rd.startsWith('/') || rd.startsWith('//')) return '/'
  return rd
}
