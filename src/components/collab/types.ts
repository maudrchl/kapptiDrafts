export type CommentKind = 'comment' | 'emoji'

export type Comment = {
  id: string
  proto_slug: string
  screen_id: string
  /**
   * Position 0..1. Relative à l'élément ancré (`anchor`) s'il est défini,
   * sinon relative au viewport (fallback legacy).
   */
  x: number
  y: number
  body: string
  author_email: string
  resolved: boolean
  created_at: string
  /** Id de l'élément d'ancrage (`data-anchor`). Null = ancrage viewport legacy. */
  anchor: string | null
  /** 'comment' (thread) ou 'emoji' (stamp de réaction). */
  kind: CommentKind
  /** Caractère emoji si kind === 'emoji'. */
  emoji: string | null
  /** Emails mentionnés (@) dans le commentaire → notifiés en DM Slack. */
  mentions?: string[]
}

export type Reply = {
  id: string
  comment_id: string
  body: string
  author_email: string
  created_at: string
}

/** Font partagée avec le chrome ProtoFrame. */
export const FONT =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

/** Découpe un nom d'affichage pour l'Avatar ui-kit (name + additionalName). */
export const avatarNames = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  return { name: parts[0] || fullName, additionalName: parts[1] }
}
