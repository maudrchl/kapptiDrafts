import { useSyncExternalStore } from 'react'
import type { Dashboard, Panel, PanelSpec } from './perses'
import { INITIAL_DASHBOARD, makePanel } from './perses'

/* ─────────────────────────────────────────────────────────────
 *  Store partagé du dashboard Traces (Perses).
 *  Centralisé (hors React) pour que l'éditeur, l'assistant IA et
 *  le "Pin as panel" des vues Explore travaillent sur le même état.
 *  UI locale (drag, édition en cours…) reste dans les composants.
 * ───────────────────────────────────────────────────────────── */

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

let state: Dashboard = clone(INITIAL_DASHBOARD)
let saved: Dashboard = clone(INITIAL_DASHBOARD)
let seq = 100

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

const nextId = (base: string) => `${base}_${++seq}`

export const dashboardStore = {
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  getState: () => state,
  getSaved: () => saved,

  update(fn: (d: Dashboard) => Dashboard) {
    state = fn(clone(state))
    emit()
  },
  save() {
    saved = clone(state)
    emit()
  },
  reset() {
    state = clone(saved)
    emit()
  },

  /** Ajoute un panel (depuis un spec) dans un groupe donné ou le premier. Renvoie l'id. */
  addPanel(spec: PanelSpec, groupId?: string): string {
    const id = nextId('panel')
    const panel: Panel = { id, ...makePanel(spec) }
    state = clone(state)
    const g = state.groups.find((x) => x.id === groupId) ?? state.groups[0]
    if (!g) {
      state.groups.push({ id: nextId('grp'), name: 'Panels', collapsed: false, panels: [panel] })
    } else {
      g.panels.push(panel)
    }
    emit()
    return id
  },

  /** Ajoute plusieurs panels dans un nouveau groupe nommé. Renvoie l'id du groupe. */
  addGroupWithPanels(groupName: string, specs: PanelSpec[]): string {
    const gid = nextId('grp')
    state = clone(state)
    state.groups.push({
      id: gid,
      name: groupName,
      collapsed: false,
      panels: specs.map((s) => ({ id: nextId('panel'), ...makePanel(s) })),
    })
    emit()
    return gid
  },

  addEmptyGroup(name = 'New group'): string {
    const gid = nextId('grp')
    state = clone(state)
    state.groups.push({ id: gid, name, collapsed: false, panels: [] })
    emit()
    return gid
  },
}

/** Hook React : renvoie le dashboard courant et re-render à chaque mutation. */
export const useDashboard = (): Dashboard =>
  useSyncExternalStore(dashboardStore.subscribe, dashboardStore.getState)

/** Le dashboard courant diffère-t-il de la dernière sauvegarde ? */
export const useDashboardDirty = (): boolean =>
  useSyncExternalStore(
    dashboardStore.subscribe,
    () => JSON.stringify(state) !== JSON.stringify(saved),
  )
