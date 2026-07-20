import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CurrentUser } from '../../context/CurrentUser'
import type { Comment, Reply } from './types'

/**
 * État de lecture des threads pour l'utilisateur courant → compteur de réponses
 * non lues par thread (ce qu'Alex veut voir : « un petit 1 » sur l'avatar quand
 * quelqu'un a répondu dans un thread où il participe).
 *
 * « Non lu » = une réponse d'une AUTRE personne, plus récente que la dernière
 * fois où j'ai lu ce thread. Faute d'enregistrement de lecture, on retombe sur
 * l'heure de MON dernier message dans le thread (on a implicitement « lu »
 * jusqu'à sa propre dernière contribution) — évite de tout marquer non lu au
 * premier chargement, sans backfill.
 *
 * Persisté dans `proto_comment_reads` (par email) pour que le compteur suive la
 * personne d'un appareil à l'autre. La lecture est marquée à l'ouverture du
 * thread (cf. CollabLayer).
 */
export function useThreadReads(me: CurrentUser | null, comments: Comment[], replies: Reply[]) {
  // comment_id → last_read_at (ISO) pour l'utilisateur courant.
  const [reads, setReads] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!supabase || !me) {
      setReads({})
      return
    }
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('proto_comment_reads')
        .select('comment_id, last_read_at')
        .eq('viewer_email', me.email)
      if (cancelled) return
      const map: Record<string, string> = {}
      ;(data ?? []).forEach((r: { comment_id: string; last_read_at: string }) => {
        map[r.comment_id] = r.last_read_at
      })
      setReads(map)
    })()
    return () => {
      cancelled = true
    }
  }, [me])

  const markRead = useCallback(
    (commentId: string) => {
      if (!me) return
      const now = new Date().toISOString()
      // Optimiste : le badge disparaît tout de suite.
      setReads((cur) => ({ ...cur, [commentId]: now }))
      if (!supabase) return
      supabase
        .from('proto_comment_reads')
        .upsert({ viewer_email: me.email, comment_id: commentId, last_read_at: now })
        .then(({ error }) => {
          if (error) console.warn('[reads] upsert échoué', error.message)
        })
    },
    [me],
  )

  const unreadByComment = useMemo(() => {
    const out: Record<string, number> = {}
    if (!me) return out
    // Regroupe les réponses par thread.
    const byThread = new Map<string, Reply[]>()
    replies.forEach((r) => {
      const arr = byThread.get(r.comment_id)
      if (arr) arr.push(r)
      else byThread.set(r.comment_id, [r])
    })
    comments.forEach((c) => {
      if (c.kind === 'emoji') return
      const threadReplies = byThread.get(c.id) ?? []
      const iAuthored = c.author_email === me.email
      const iReplied = threadReplies.some((r) => r.author_email === me.email)
      if (!iAuthored && !iReplied) return // pas un participant → pas de badge
      // Repli : dernier message que J'AI posté dans le thread.
      const myTimes = [
        ...(iAuthored ? [c.created_at] : []),
        ...threadReplies.filter((r) => r.author_email === me.email).map((r) => r.created_at),
      ]
      const fallback = myTimes.length ? myTimes.reduce((a, b) => (a > b ? a : b)) : ''
      const since = reads[c.id] ?? fallback
      const count = threadReplies.filter(
        (r) => r.author_email !== me.email && r.created_at > since,
      ).length
      if (count > 0) out[c.id] = count
    })
    return out
  }, [me, comments, replies, reads])

  return { unreadByComment, markRead }
}
