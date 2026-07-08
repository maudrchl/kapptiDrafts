import { useCallback, useSyncExternalStore } from 'react'
import type { ProtoStatus } from './registry'

/**
 * Overrides de statut éditables depuis l'interface, persistés en localStorage
 * (par navigateur). Le statut par défaut reste défini dans chaque `meta.ts` ;
 * ce module ne stocke que les modifications faites via l'UI.
 *
 * Pour rendre les statuts partagés/commités dans le repo, il faudrait un petit
 * endpoint dev qui réécrit les `meta.ts` — voir la note dans le README.
 */
const STORAGE_KEY = 'kapptidrafts:status-overrides'

type Overrides = Record<string, ProtoStatus>

function read(): Overrides {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

// ── store minimal compatible useSyncExternalStore ──────────────────────────
const listeners = new Set<() => void>()
let snapshot: Overrides = typeof localStorage !== 'undefined' ? read() : {}

function emit() {
  snapshot = read()
  listeners.forEach((l) => l())
}

// Synchronise entre onglets
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) emit()
  })
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setOverride(slug: string, status: ProtoStatus) {
  const next = { ...read(), [slug]: status }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

/**
 * Hook : renvoie une fonction `statusOf(slug, fallback)` réactive et un setter.
 */
export function useStatusOverrides() {
  const overrides = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  )
  const statusOf = useCallback(
    (slug: string, fallback: ProtoStatus): ProtoStatus =>
      overrides[slug] ?? fallback,
    [overrides],
  )
  return { statusOf, setStatus: setOverride }
}
