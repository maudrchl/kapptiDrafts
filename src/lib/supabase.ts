import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase navigateur, partagé par toute l'app (commentaires + présence).
 * Clé publishable uniquement : aucune donnée sensible, RLS activé côté base.
 * L'app n'utilise pas Supabase Auth (l'auth est gérée par le cookie Google),
 * les requêtes passent donc en role `anon`.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Ne casse pas l'app si non configuré (protos consultables sans collab).
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants : ' +
      'commentaires et présence désactivés.',
  )
}

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false },
      })
    : null

/** True si la collab (commentaires/présence) est configurée. */
export const collabEnabled = supabase !== null
