import { supabase } from './supabase'

/**
 * Liens d'exploration scopés à un proto (user interviews).
 *
 * Un « share » = un token opaque qui mappe vers un proto_slug. La route
 * `/share/:token` (publique, hors auth Google) le résout et n'affiche QUE ce
 * proto, sans le chrome de l'app. Table `proto_shares` (RLS anon permissive,
 * cohérent avec le reste de la collab v1). Pas de secret dans le proto : qui a
 * le lien voit le proto.
 */

const rand = (n: number) => {
  const c = 'abcdefghijkmnpqrstuvwxyz23456789' // sans caractères ambigus
  let s = ''
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)]
  return s
}

/** Crée un lien pour un proto et renvoie son token (ou null si Supabase off). */
export async function createShare(protoSlug: string, label?: string): Promise<string | null> {
  if (!supabase) return null
  const prefix = protoSlug.split('-')[0].slice(0, 4)
  const token = `${prefix}-${rand(6)}`
  const { error } = await supabase
    .from('proto_shares')
    .insert({ token, proto_slug: protoSlug, label: label ?? null })
  if (error) return null
  return token
}

export type ShareRow = { token: string; label: string | null; created_at: string }

/** Liste les liens actifs (non révoqués) d'un proto, plus récents d'abord. */
export async function listShares(protoSlug: string): Promise<ShareRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('proto_shares')
    .select('token, label, created_at')
    .eq('proto_slug', protoSlug)
    .eq('enabled', true)
    .order('created_at', { ascending: false })
  return (data as ShareRow[]) ?? []
}

/** Révoque un lien (le rend inutilisable) sans le supprimer. */
export async function revokeShare(token: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('proto_shares').update({ enabled: false }).eq('token', token)
  return !error
}

/** Résout un token → proto_slug (ou null si inconnu / désactivé). */
export async function resolveShare(token: string): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('proto_shares')
    .select('proto_slug, enabled')
    .eq('token', token)
    .maybeSingle()
  if (!data || !data.enabled) return null
  return data.proto_slug as string
}

/** URL complète d'un lien d'interview. */
export const shareUrl = (token: string) => `${window.location.origin}/share/${token}`
