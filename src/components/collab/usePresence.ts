import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CurrentUser } from '../../context/CurrentUser'

export type PresentUser = {
  email: string
  name: string
  initials: string
  color: string
}

/**
 * Présence temps réel sur un proto : chacun « track » son identité sur un canal
 * dédié, et on reçoit la liste de tout le monde. La clé de présence est l'email,
 * donc plusieurs onglets d'une même personne comptent pour un seul avatar.
 */
export function usePresence(slug: string, me: CurrentUser | null): PresentUser[] {
  const [users, setUsers] = useState<PresentUser[]>([])

  useEffect(() => {
    if (!supabase || !me) return
    const client = supabase
    const channel = client.channel(`presence:proto:${slug}`, {
      config: { presence: { key: me.email } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresentUser>()
        const list = Object.values(state)
          .map((metas) => metas[metas.length - 1])
          .filter(Boolean)
        setUsers(list)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void channel.track({
            email: me.email,
            name: me.name,
            initials: me.initials,
            color: me.color,
          })
        }
      })

    return () => {
      void client.removeChannel(channel)
    }
  }, [slug, me])

  return users
}
