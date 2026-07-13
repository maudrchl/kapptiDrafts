import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CurrentUser } from '../../context/CurrentUser'
import type { PresentUser } from './usePresence'

/** Présence par slug : qui regarde chaque proto en ce moment. */
export type PresenceMap = Record<string, PresentUser[]>

/**
 * Présence temps réel agrégée pour la home. On s'abonne — en simple
 * observateur, sans se « tracker » soi-même — aux mêmes canaux que
 * `usePresence` côté proto (`presence:proto:<slug>`), et on renvoie, par slug,
 * la liste des personnes qui le consultent actuellement. Supabase multiplexe
 * tous ces canaux sur une seule connexion, donc un canal par proto reste léger.
 */
export function useAllPresence(
  slugs: string[],
  me: CurrentUser | null,
): PresenceMap {
  const [map, setMap] = useState<PresenceMap>({})
  // Clé stable pour les deps de l'effet (le tableau `slugs` change de référence
  // à chaque render mais son contenu est stable).
  const key = slugs.join(',')

  useEffect(() => {
    if (!supabase || !me || slugs.length === 0) return
    const client = supabase

    const channels = slugs.map((slug) => {
      const channel = client.channel(`presence:proto:${slug}`, {
        config: { presence: { key: me.email } },
      })
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<PresentUser>()
          const list = Object.values(state)
            .map((metas) => metas[metas.length - 1])
            .filter(Boolean)
          setMap((prev) => ({ ...prev, [slug]: list }))
        })
        // On s'abonne sans `track()` : on observe la présence sans se compter.
        .subscribe()
      return channel
    })

    return () => {
      channels.forEach((c) => void client.removeChannel(c))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, me])

  return map
}
