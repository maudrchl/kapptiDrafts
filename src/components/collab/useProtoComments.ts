import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Comment, CommentKind, Reply } from './types'

/**
 * Charge les commentaires d'un proto et les tient à jour en temps réel
 * (Supabase Realtime / postgres_changes). Expose aussi les mutations CRUD.
 * Les insertions locales et les événements Realtime sont dédupliqués par id.
 */
export function useProtoComments(slug: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)

  // Chargement initial.
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data: cData } = await supabase
        .from('proto_comments')
        .select('*')
        .eq('proto_slug', slug)
        .order('created_at', { ascending: true })
      const list = (cData as Comment[]) ?? []
      let rData: Reply[] = []
      if (list.length) {
        const { data } = await supabase
          .from('proto_comment_replies')
          .select('*')
          .in(
            'comment_id',
            list.map((c) => c.id),
          )
          .order('created_at', { ascending: true })
        rData = (data as Reply[]) ?? []
      }
      if (cancelled) return
      setComments(list)
      setReplies(rData)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  // Abonnement temps réel.
  useEffect(() => {
    if (!supabase) return
    const client = supabase
    const upsert = <T extends { id: string }>(row: T) => (cur: T[]) =>
      cur.some((r) => r.id === row.id)
        ? cur.map((r) => (r.id === row.id ? row : r))
        : [...cur, row]

    const channel = client
      .channel(`comments:${slug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proto_comments',
          filter: `proto_slug=eq.${slug}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as Comment).id
            setComments((cur) => cur.filter((c) => c.id !== id))
            setReplies((cur) => cur.filter((r) => r.comment_id !== id))
          } else {
            setComments(upsert(payload.new as Comment))
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proto_comment_replies' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as Reply).id
            setReplies((cur) => cur.filter((r) => r.id !== id))
          } else {
            const row = payload.new as Reply
            // N'ajoute que si la réponse concerne un commentaire de ce proto.
            setComments((cur) => {
              if (cur.some((c) => c.id === row.comment_id)) {
                setReplies(upsert(row))
              }
              return cur
            })
          }
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [slug])

  const addComment = useCallback(
    async (input: {
      screen_id: string
      x: number
      y: number
      body: string
      author_email: string
      anchor?: string | null
      kind?: CommentKind
      emoji?: string | null
    }): Promise<Comment | null> => {
      if (!supabase) return null
      const { data, error } = await supabase
        .from('proto_comments')
        .insert({ proto_slug: slug, resolved: false, kind: 'comment', ...input })
        .select()
        .single()
      if (error || !data) return null
      const row = data as Comment
      setComments((cur) =>
        cur.some((c) => c.id === row.id) ? cur : [...cur, row],
      )
      return row
    },
    [slug],
  )

  // Stamp emoji (réaction posée sur un point ancré, sans thread).
  const addStamp = useCallback(
    (input: {
      screen_id: string
      x: number
      y: number
      emoji: string
      author_email: string
      anchor?: string | null
    }) => addComment({ ...input, body: '', kind: 'emoji' }),
    [addComment],
  )

  const addReply = useCallback(
    async (comment_id: string, body: string, author_email: string) => {
      if (!supabase) return
      const { data } = await supabase
        .from('proto_comment_replies')
        .insert({ comment_id, body, author_email })
        .select()
        .single()
      if (data) {
        const row = data as Reply
        setReplies((cur) =>
          cur.some((r) => r.id === row.id) ? cur : [...cur, row],
        )
      }
    },
    [],
  )

  const setResolved = useCallback(async (id: string, resolved: boolean) => {
    if (!supabase) return
    setComments((cur) =>
      cur.map((c) => (c.id === id ? { ...c, resolved } : c)),
    )
    await supabase.from('proto_comments').update({ resolved }).eq('id', id)
  }, [])

  const deleteComment = useCallback(async (id: string) => {
    if (!supabase) return
    setComments((cur) => cur.filter((c) => c.id !== id))
    setReplies((cur) => cur.filter((r) => r.comment_id !== id))
    await supabase.from('proto_comments').delete().eq('id', id)
  }, [])

  const deleteReply = useCallback(async (id: string) => {
    if (!supabase) return
    setReplies((cur) => cur.filter((r) => r.id !== id))
    await supabase.from('proto_comment_replies').delete().eq('id', id)
  }, [])

  return {
    comments,
    replies,
    loading,
    addComment,
    addStamp,
    addReply,
    setResolved,
    deleteComment,
    deleteReply,
  }
}
