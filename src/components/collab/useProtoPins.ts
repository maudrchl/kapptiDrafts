import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Cache local du dernier état connu des épingles. Sert à afficher le BON ordre
// immédiatement au (re)chargement de l'index — y compris après un rechargement
// complet de la SPA (retour depuis un proto HTML) — sans attendre Supabase, ce
// qui évitait un re-tri visible (« l'ordre change tout seul »).
const CACHE_KEY = 'kapptidrafts:pinned-protos'
const readCache = (): Set<string> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}
const writeCache = (s: Set<string>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...s]))
  } catch {
    // localStorage indisponible : on garde juste l'état en mémoire
  }
}

/**
 * Épingles partagées : la liste des protos « pinned » (affichés en haut de
 * l'index) est stockée dans Supabase (`proto_pins`) et partagée par toute
 * l'équipe. Chargement initial + suivi temps réel (postgres_changes), avec un
 * cache local pour un ordre stable dès le premier rendu.
 */
export function useProtoPins() {
  const [pinned, setPinned] = useState<Set<string>>(readCache)
  // Copie synchrone pour lire l'état courant dans togglePin sans le mettre en
  // dépendance (évite un useCallback qui se recrée à chaque changement).
  const pinnedRef = useRef(pinned)
  useEffect(() => {
    pinnedRef.current = pinned
    writeCache(pinned)
  }, [pinned])

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let cancelled = false
    ;(async () => {
      const { data } = await client.from('proto_pins').select('proto_slug')
      if (cancelled || !data) return
      setPinned(new Set((data as { proto_slug: string }[]).map((r) => r.proto_slug)))
    })()

    const channel = client
      .channel('proto_pins')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proto_pins' },
        (payload) => {
          setPinned((cur) => {
            const next = new Set(cur)
            if (payload.eventType === 'DELETE') {
              next.delete((payload.old as { proto_slug: string }).proto_slug)
            } else {
              next.add((payload.new as { proto_slug: string }).proto_slug)
            }
            return next
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      client.removeChannel(channel)
    }
  }, [])

  const togglePin = useCallback(async (slug: string, pinnedBy?: string | null) => {
    if (!supabase) return
    const has = pinnedRef.current.has(slug)
    // Optimiste : on met à jour l'UI tout de suite (le Realtime confirmera).
    setPinned((cur) => {
      const next = new Set(cur)
      if (has) next.delete(slug)
      else next.add(slug)
      return next
    })
    if (has) {
      await supabase.from('proto_pins').delete().eq('proto_slug', slug)
    } else {
      await supabase.from('proto_pins').upsert({ proto_slug: slug, pinned_by: pinnedBy ?? null })
    }
  }, [])

  return { pinned, togglePin }
}
