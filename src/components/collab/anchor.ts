/**
 * Ancrage des marqueurs (commentaires + stamps emoji) à un élément de l'UI.
 *
 * Un marqueur stocke un `anchor` + une position relative 0..1 DANS la boîte de
 * l'élément visé. Au rendu, on relit la position réelle de l'élément → le pin
 * suit scroll / resize / reflow. Trois formes d'ancre :
 *  - `"<id>"`         : élément portant `data-anchor="<id>"` (ancre explicite,
 *                       posée par le proto ; id globalement unique).
 *  - `"@<selector>"`  : sélecteur CSS structurel vers l'élément de CONTENU sous
 *                       le curseur (fallback auto quand aucun `data-anchor`).
 *                       On s'ancre au contenu, pas au viewport : l'élément bouge
 *                       avec le scroll, donc le pin le suit.
 *  - `null`           : ancrage viewport legacy (anciens commentaires).
 * Si l'élément n'est pas dans le DOM (mauvais onglet, drawer fermé), le pin est
 * masqué.
 */

export type AnchorHit = { anchor: string | null; x: number; y: number }

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Construit un sélecteur CSS structurel stable vers `el`, ancré au plus proche
 * ancêtre porteur d'un `id` (raccourcit et fiabilise le chemin). À défaut, on
 * remonte en `:nth-child` jusqu'au body. Retourne null si l'élément n'est pas
 * localisable de façon fiable.
 */
const selectorFor = (el: HTMLElement): string | null => {
  const parts: string[] = []
  let node: HTMLElement | null = el
  while (node && node.nodeType === 1 && node !== document.body) {
    if (node.id) {
      parts.unshift(`#${CSS.escape(node.id)}`)
      return parts.join(' > ')
    }
    const parent: HTMLElement | null = node.parentElement
    if (!parent) break
    const idx = Array.prototype.indexOf.call(parent.children, node) + 1
    parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${idx})`)
    node = parent
  }
  return parts.length ? parts.join(' > ') : null
}

/** Au clic : trouve l'élément ancrable sous le curseur et la position relative. */
export const captureAnchor = (
  clientX: number,
  clientY: number,
  layerEl: HTMLElement | null,
): AnchorHit => {
  // La couche de pins capte le clic ; on la rend transparente le temps de lire
  // l'élément réellement sous le curseur.
  const prev = layerEl?.style.pointerEvents
  if (layerEl) layerEl.style.pointerEvents = 'none'
  const under = document.elementFromPoint(clientX, clientY) as HTMLElement | null
  if (layerEl) layerEl.style.pointerEvents = prev ?? ''

  const relativeTo = (el: HTMLElement, anchor: string): AnchorHit | null => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return null
    return {
      anchor,
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    }
  }

  // 1. Ancre explicite posée par le proto (id unique).
  const anchored = under?.closest('[data-anchor]') as HTMLElement | null
  const explicitId = anchored?.getAttribute('data-anchor')
  if (anchored && explicitId) {
    const hit = relativeTo(anchored, explicitId)
    if (hit) return hit
  }

  // 2. Fallback auto : on s'ancre à l'élément de contenu réel sous le curseur
  //    via un sélecteur structurel. Cet élément scrolle avec le contenu → le
  //    pin le suit, contrairement à l'ancrage viewport.
  if (under) {
    const sel = selectorFor(under)
    if (sel) {
      const hit = relativeTo(under, `@${sel}`)
      if (hit) return hit
    }
  }

  // 3. Dernier recours : viewport (comme les anciens commentaires).
  return { anchor: null, x: clientX / window.innerWidth, y: clientY / window.innerHeight }
}

/** Retrouve l'élément visé par une ancre (`data-anchor` id ou `@selector`). */
export const anchorElement = (anchor: string): HTMLElement | null => {
  try {
    if (anchor.startsWith('@')) {
      return document.querySelector<HTMLElement>(anchor.slice(1))
    }
    return document.querySelector<HTMLElement>(`[data-anchor="${anchor}"]`)
  } catch {
    return null
  }
}

/** Position viewport (px) d'un marqueur, ou null s'il ne doit pas s'afficher. */
export const resolveAnchorPoint = (c: {
  anchor: string | null
  x: number
  y: number
}): { left: number; top: number } | null => {
  if (c.anchor) {
    const el = anchorElement(c.anchor)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.width !== 0 || r.height !== 0) {
        return { left: r.left + c.x * r.width, top: r.top + c.y * r.height }
      }
    }
    // Sélecteur structurel `@…` introuvable sur l'écran actif (reflow, ancre
    // fragile, migration imparfaite) : on ne masque PAS le marqueur, on le
    // replace à sa position stockée. Le filtre par écran (côté CommentPins)
    // garantit qu'on n'affiche que les marqueurs du bon écran.
    if (c.anchor.startsWith('@')) {
      return { left: c.x * window.innerWidth, top: c.y * window.innerHeight }
    }
    // Ancre explicite (`data-anchor` unique) absente : légitimement masqué
    // (onglet/drawer fermé).
    return null
  }
  return { left: c.x * window.innerWidth, top: c.y * window.innerHeight }
}
