/* ============================================================
 *  Test editor v2 — natures de variables
 *  Modèle du proto : 3 natures, 3 teintes.
 *
 *   - input  (in-test input, ORANGE)      → interface du test, valeur donnée
 *                                           AVANT le run (default / override / CSV).
 *                                           Vit dans le panneau Environment.
 *   - global (BLEU FONCÉ)                 → défini dans Configurations, partagé.
 *                                           Un step peut le mettre à jour.
 *   - local  (BLEU CLAIR + badge Step N)  → affecté au runtime par un step
 *                                           « Set local variable ». NE vit PAS
 *                                           dans le panneau : seulement dans le
 *                                           picker des steps suivants.
 *
 *  PAS d'« output déclaré » : tout ce qui se déclare dans le panneau avant le run
 *  est une in-test. Côté produit, les `output_variables` du runner sont produites
 *  au runtime par l'action → c'est exactement la variable locale. Pour faire
 *  sortir une valeur du test (autre test, campagne), on écrit dans une globale.
 * ============================================================ */

import type { ComponentType } from 'react'
import {
  IconArrowDown,
  IconBolt,
  IconBraces,
  IconCheck,
  IconCheckCheck,
  IconCode,
  IconEye,
  IconFile,
  IconGauge,
  IconGlobe,
  IconHourglass,
  IconList,
  IconMail,
  IconMonitor,
  IconMousePointer2,
  IconMousePointerClick,
  IconNavigation,
  IconNetwork,
  IconSmartphone,
  IconSparkle,
  IconStar,
  IconTextCursorInput,
  IconTimer,
} from '@kapptivate/ui-kit'

/** Composant d'icône ui-kit (même signature que `ProtoIcon` du registry). */
export type IconComp = ComponentType<{ size?: number; color?: string }>

/** Teinte d'une variable — une par nature. */
export type Tint = 'orange' | 'light-blue' | 'dark-blue'

export type VarNature = 'input' | 'global' | 'local'

export const NATURE_TINT: Record<VarNature, Tint> = {
  input: 'orange',
  local: 'light-blue',
  global: 'dark-blue',
}

/* ---------------- sources de valeur d'un Set variable ---------------- */
/** Mêmes sources que la modale de création : un Set variable est souvent une extraction. */
export type Source = 'static' | 'json' | 'header' | 'script'

export const SOURCES: { value: Source; label: string }[] = [
  { value: 'static', label: 'Static value' },
  { value: 'json', label: 'JSON attribute' },
  { value: 'header', label: 'Response header' },
  { value: 'script', label: 'Script result' },
]

export const sourceLabel = (s: Source) => SOURCES.find((o) => o.value === s)?.label ?? s

/* ---------------- cibles d'un Set variable ---------------- */
/**
 * Un seul verbe : ce qui change est la CIBLE, pas l'action.
 * `new` crée une variable locale, `local` réaffecte une locale existante,
 * `global` met à jour une globale de Configurations.
 */
export type TargetKind = 'new' | 'local' | 'global'

export type Target = { kind: TargetKind; name: string }

export const targetNature = (k: TargetKind): VarNature => (k === 'global' ? 'global' : 'local')

/**
 * PAS d'action « Update variable » : c'est « Set local variable » qui couvre la
 * création ET la réaffectation d'une locale. Le libellé suit la FAMILLE de la
 * cible, pas le create-vs-update :
 *   - locale (nouvelle ou existante) → Set local variable
 *   - globale                        → Update global variable (variant maquetté)
 */
export const setStepLabel = (t: Target) =>
  t.kind === 'global' ? 'Update global variable' : 'Set local variable'

/* ---------------- catalogue d'actions (menu du step) ----------------
 * Repris du popover produit (search + catégories repliables, « Most popular »
 * ouvert par défaut). Les items viennent des step types v2 réels du produit
 * (list_step_types, platform=web) ; SEULE la catégorie « Variables » est
 * nouvelle : elle porte les deux actions de variable, et rien d'autre.
 */
export type ActionItem = { label: string; icon: IconComp }
export type ActionGroup = { key: string; label: string; icon: IconComp; items: ActionItem[] }

export const SET_LOCAL = 'Set local variable'
export const UPDATE_GLOBAL = 'Update global variable'

export const ACTION_GROUPS: ActionGroup[] = [
  {
    key: 'popular',
    label: 'Most popular',
    icon: IconStar,
    items: [
      { label: 'Click', icon: IconMousePointer2 },
      { label: 'Wait for delay', icon: IconTimer },
      { label: 'Verify with AI', icon: IconSparkle },
      { label: 'Fill input', icon: IconTextCursorInput },
    ],
  },
  {
    key: 'variables',
    label: 'Variables',
    icon: IconBraces,
    items: [
      { label: SET_LOCAL, icon: IconBraces },
      { label: UPDATE_GLOBAL, icon: IconGlobe },
    ],
  },
  {
    key: 'interactions',
    label: 'Interactions',
    icon: IconMousePointerClick,
    items: [
      { label: 'Click', icon: IconMousePointer2 },
      { label: 'Double click', icon: IconMousePointerClick },
      { label: 'Right click', icon: IconMousePointerClick },
      { label: 'Hover', icon: IconMousePointer2 },
      { label: 'Check or uncheck', icon: IconCheck },
      { label: 'Select option', icon: IconList },
      { label: 'Fill input', icon: IconTextCursorInput },
      { label: 'Upload file', icon: IconFile },
      { label: 'Scroll', icon: IconArrowDown },
    ],
  },
  {
    key: 'mail',
    label: 'Email & SMS',
    icon: IconMail,
    items: [
      { label: 'Get mail', icon: IconMail },
      { label: 'Get mail code', icon: IconSparkle },
      { label: 'Get mail link', icon: IconSparkle },
      { label: 'Get SMS code', icon: IconSmartphone },
    ],
  },
  {
    key: 'verifications',
    label: 'Verifications',
    icon: IconCheckCheck,
    items: [
      { label: 'Assert displayed', icon: IconEye },
      { label: 'Assert not displayed', icon: IconEye },
      { label: 'Verify with AI', icon: IconSparkle },
      { label: 'Spell check with AI', icon: IconSparkle },
    ],
  },
  {
    key: 'navigation',
    label: 'Navigation',
    icon: IconNavigation,
    items: [
      { label: 'Navigate to URL', icon: IconGlobe },
      { label: 'Switch window', icon: IconMonitor },
    ],
  },
  {
    key: 'wait',
    label: 'Wait for...',
    icon: IconHourglass,
    items: [
      { label: 'Wait for element', icon: IconHourglass },
      { label: 'Wait for delay', icon: IconTimer },
    ],
  },
  {
    key: 'others',
    label: 'Others',
    icon: IconBolt,
    items: [
      { label: 'API Call', icon: IconNetwork },
      { label: 'Custom step', icon: IconCode },
      { label: 'Get text or value', icon: IconTextCursorInput },
      { label: 'Create metric', icon: IconGauge },
    ],
  },
]

/** Groupe qui contient une action (pour ouvrir la bonne catégorie à l'ouverture). */
export const groupOfAction = (label: string) =>
  ACTION_GROUPS.find((g) => g.items.some((i) => i.label === label))?.key ?? 'popular'

/** Icône d'une action, pour le bouton du step. */
export const iconOfAction = (label: string): IconComp =>
  ACTION_GROUPS.flatMap((g) => g.items).find((i) => i.label === label)?.icon ?? IconBolt

/* ---------------- steps du scénario ---------------- */
export type ApiStep = {
  id: string
  n: number
  kind: 'api'
  action: string
  method: string
  url: string
}

export type SetStep = {
  id: string
  n: number
  kind: 'set'
  target: Target
  /** nom de la variable créée (cible `new` uniquement) */
  name: string
  source: Source
  /** valeurs par source, gardées séparément pour que le switch ne perde rien */
  staticValue: string
  jsonPath: string
  headerName: string
  script: string
}

export type Step = ApiStep | SetStep

/** Valeur affichée pour la source courante. */
export const stepValue = (s: SetStep): string =>
  s.source === 'static'
    ? s.staticValue
    : s.source === 'json'
      ? s.jsonPath
      : s.source === 'header'
        ? s.headerName
        : s.script

/* ---------------- interface du test (panneau Environment) ---------------- */
export type InputVar = {
  name: string
  value: string
  /** d'où vient la valeur avant le run */
  origin: 'Default value' | 'Override' | 'From CSV'
  secret?: boolean
}

export type GlobalVar = {
  name: string
  value: string
}

export const INPUTS: InputVar[] = [
  { name: 'email', value: 'guest@rocketcorp.io', origin: 'Default value' },
  { name: 'password', value: '••••••••••••', origin: 'Override', secret: true },
  { name: 'cartSize', value: '3', origin: 'From CSV' },
]

export const GLOBALS: GlobalVar[] = [
  { name: 'URL', value: 'https://api.rocketcorp.io' },
  { name: 'sessionId', value: 'sess_8c21f0' },
]

/* ---------------- scénario ---------------- */
export const INITIAL_STEPS: Step[] = [
  {
    id: 's1',
    n: 1,
    kind: 'api',
    action: 'API Call',
    method: 'POST',
    url: '{{URL}}/auth/login',
  },
  // Le cas d'école : une extraction. La valeur se définit ICI, sur le step.
  {
    id: 's2',
    n: 2,
    kind: 'set',
    target: { kind: 'new', name: '' },
    name: 'authToken',
    source: 'json',
    staticValue: '',
    jsonPath: '$.access_token',
    headerName: '',
    script: '',
  },
  {
    id: 's3',
    n: 3,
    kind: 'api',
    action: 'API Call',
    method: 'POST',
    url: '{{URL}}/orders',
  },
  // Une 2e locale, produite par le step 3.
  {
    id: 's4',
    n: 4,
    kind: 'set',
    target: { kind: 'new', name: '' },
    name: 'orderRef',
    source: 'json',
    staticValue: '',
    jsonPath: '$.order.reference',
    headerName: '',
    script: '',
  },
  // Variant « Update global variable » : la cible est une globale.
  {
    id: 's5',
    n: 5,
    kind: 'set',
    target: { kind: 'global', name: 'sessionId' },
    name: '',
    source: 'header',
    staticValue: '',
    jsonPath: '',
    headerName: 'x-session-id',
    script: '',
  },
  // Consomme les locales en aval : le picker {} de l'URL les propose,
  // badgées du step qui les affecte.
  {
    id: 's6',
    n: 6,
    kind: 'api',
    action: 'API Call',
    method: 'GET',
    url: '{{URL}}/orders/{{orderRef}}',
  },
]

/* ---------------- dernière réponse (picker JSON attribute) ---------------- */
const SAMPLE_RESPONSE = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiJ9',
  token_type: 'Bearer',
  expires_in: 3600,
  order: { reference: 'ORD-4417', total: 42.5, currency: 'EUR', status: 'paid' },
  user: { id: 42, name: 'Ada Lovelace', email: 'ada@example.com' },
}

export type RespRow = { path: string; label: string; preview: string; depth: number; leaf: boolean }

const fmt = (v: unknown): string => (typeof v === 'string' ? `"${v}"` : String(v))

const buildRows = (obj: object, prefix = '$', depth = 0, out: RespRow[] = []): RespRow[] => {
  Object.entries(obj).forEach(([k, v]) => {
    const path = `${prefix}.${k}`
    if (v && typeof v === 'object') {
      out.push({ path, label: k, preview: '{ }', depth, leaf: false })
      buildRows(v as object, path, depth + 1, out)
    } else {
      out.push({ path, label: k, preview: fmt(v), depth, leaf: true })
    }
  })
  return out
}

export const RESPONSE_ROWS = buildRows(SAMPLE_RESPONSE)

/** En-têtes de la dernière réponse (picker Response header). */
export const RESPONSE_HEADERS = [
  'x-session-id',
  'content-type',
  'set-cookie',
  'x-request-id',
  'etag',
]

/* ---------------- les 4 décisions, pour la note « Why? » ---------------- */
export const RULES: { title: string; body: string }[] = [
  {
    title: 'The value lives on the step',
    body: 'A Set local variable step carries its own name and value, from any source: static value, JSON attribute, response header or script result. Nothing to configure upstream.',
  },
  {
    title: 'The panel holds what you set before the run',
    body: 'Environment keeps the in-test inputs and the globals from Configurations. A local variable is not an input, so it no longer appears there.',
  },
  {
    title: 'Local variables show up downstream',
    body: 'A local variable appears in the value picker of the steps that follow it, badged with the step that assigns it.',
  },
  {
    title: 'No Update variable action',
    body: 'Set local variable covers both creating and reassigning a local variable. What changes is the target, not the verb: a new local, an existing local, or a global to update through the Update global variable variant.',
  },
]
