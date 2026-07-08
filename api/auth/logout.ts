import { SESSION_COOKIE, cookie } from '../../lib/oidc'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/`,
      'Set-Cookie': cookie(SESSION_COOKIE, '', 0),
    },
  })
}
