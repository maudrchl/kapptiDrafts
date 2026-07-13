import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { CurrentUser } from '../../context/CurrentUser'

export type PresentUser = {
  email: string
  name: string
  initials: string
  color: string
  /** Écran couramment regardé par la personne (pour le "follow"). */
  screen: string
}

/**
 * Présence temps réel sur un proto : chacun « track » son identité + son écran
 * courant sur un canal dédié. La clé de présence est l'email, donc plusieurs
 * onglets d'une même personne comptent pour un seul avatar. `screen` est
 * re-tracké quand la personne change de vue, sans re-souscrire au canal.
 */
export function usePresence(
  slug: string,
  me: CurrentUser | null,
  screen: string,
): PresentUser[] {
  const [users, setUsers] = useState<PresentUser[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const subscribedRef = useRef(false)

  useEffect(() => {
    if (!supabase || !me) return
    const client = supabase
    const channel = client.channel(`presence:proto:${slug}`, {
      config: { presence: { key: me.email } },
    })
    channelRef.current = channel

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
          subscribedRef.current = true
          void channel.track({
            email: me.email,
            name: me.name,
            initials: me.initials,
            color: me.color,
            screen,
          })
        }
      })

    return () => {
      subscribedRef.current = false
      channelRef.current = null
      void client.removeChannel(channel)
    }
    // `screen` volontairement hors deps : on ne re-souscrit pas à chaque vue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, me])

  // Met à jour l'écran diffusé quand la personne navigue (sans re-souscrire).
  useEffect(() => {
    if (!me || !subscribedRef.current || !channelRef.current) return
    void channelRef.current.track({
      email: me.email,
      name: me.name,
      initials: me.initials,
      color: me.color,
      screen,
    })
  }, [screen, me])

  return users
}
