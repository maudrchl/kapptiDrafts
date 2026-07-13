export type Comment = {
  id: string
  proto_slug: string
  screen_id: string
  /** Coordonnées relatives au viewport, 0..1. */
  x: number
  y: number
  body: string
  author_email: string
  resolved: boolean
  created_at: string
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
