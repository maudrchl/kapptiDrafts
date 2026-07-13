/**
 * Ancrage des marqueurs (commentaires + stamps emoji) à un élément de l'UI.
 *
 * Un élément « ancrable » porte `data-anchor="<id stable>"`. Un marqueur stocke
 * cet id + une position relative 0..1 DANS la boîte de l'élément. Au rendu, on
 * relit la position réelle de l'élément → le pin suit scroll / resize / reflow.
 * Si l'élément n'est pas dans le DOM (mauvais onglet, drawer fermé), le pin est
 * masqué. Fallback viewport (anchor null) pour les anciens commentaires.
 */

export type AnchorHit = { anchor: string | null; x: number; y: number }

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

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

  const anchored = under?.closest('[data-anchor]') as HTMLElement | null
  if (anchored) {
    const r = anchored.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      return {
        anchor: anchored.getAttribute('data-anchor'),
        x: clamp01((clientX - r.left) / r.width),
        y: clamp01((clientY - r.top) / r.height),
      }
    }
  }
  return { anchor: null, x: clientX / window.innerWidth, y: clientY / window.innerHeight }
}

export const anchorElement = (anchor: string): HTMLElement | null => {
  try {
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
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return null
    return { left: r.left + c.x * r.width, top: r.top + c.y * r.height }
  }
  return { left: c.x * window.innerWidth, top: c.y * window.innerHeight }
}
