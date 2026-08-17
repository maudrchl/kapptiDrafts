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

/** Teinte d'une variable — une par nature, plus le gris des générateurs. */
export type Tint = 'orange' | 'light-blue' | 'dark-blue' | 'neutral'

/** `generated` n'est pas une variable : c'est un générateur, d'où le gris. */
export type VarNature = 'input' | 'global' | 'local' | 'generated'

export const NATURE_TINT: Record<VarNature, Tint> = {
  input: 'orange',
  local: 'light-blue',
  global: 'dark-blue',
  generated: 'neutral',
}

/* ---------------- cibles d'un Set variable ---------------- */
/**
 * Deux actions, une valeur toujours STATIQUE, et une seule différence : d'où
 * vient le nom de la variable écrite.
 *   `local`  → « Set local variable » : le nom se TAPE (la variable naît ici).
 *   `update` → « Update variable » : le nom se CHOISIT parmi les variables qui
 *              existent déjà, in-test comme globales. C'est la nature de la
 *              variable choisie qui dit où la valeur atterrit.
 *
 * Il n'y a pas de source d'extraction sur ces steps (ni JSON, ni header, ni
 * script) : extraire est le travail d'autres steps (Get text or value, API
 * Call). La valeur peut en revanche composer avec d'autres variables.
 */
export type TargetKind = 'local' | 'update'

export type Target = { kind: TargetKind }

/** Le libellé suit la famille de la variable écrite, et rien d'autre. */
export const setStepLabel = (t: Target) =>
  t.kind === 'update' ? 'Update variable' : 'Set local variable'

/* ---------------- catalogue d'actions (menu du step) ----------------
 * Repris du popover produit (search + catégories repliables, « Most popular »
 * ouvert par défaut). Les items viennent des step types v2 réels du produit
 * (list_step_types, platform=web) ; SEULE la catégorie « Variables » est
 * nouvelle : elle porte les deux actions de variable, et rien d'autre.
 */
export type ActionItem = { label: string; icon: IconComp }
export type ActionGroup = { key: string; label: string; icon: IconComp; items: ActionItem[] }

export const SET_LOCAL = 'Set local variable'
export const UPDATE_VAR = 'Update variable'

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
      { label: UPDATE_VAR, icon: IconGlobe },
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

/** Actions d'interface qui prennent une valeur en plus de l'élément visé. */
export const VALUE_ACTIONS = new Set([
  'Fill input',
  'Select option',
  'Verify with AI',
  'Wait for delay',
  'Get text or value',
  'Create metric',
])

/** Groupe qui contient une action (pour ouvrir la bonne catégorie à l'ouverture). */
export const groupOfAction = (label: string) =>
  ACTION_GROUPS.find((g) => g.items.some((i) => i.label === label))?.key ?? 'popular'

/** Icône d'une action, pour le bouton du step. */
export const iconOfAction = (label: string): IconComp =>
  ACTION_GROUPS.flatMap((g) => g.items).find((i) => i.label === label)?.icon ?? IconBolt

/** Générateurs de l'onglet Random du picker produit. */
export const RANDOM_VALUES = ['First name', 'Last name', 'City', 'Street address']

/* ---------------- steps du scénario ---------------- */
export type ApiStep = {
  id: string
  n: number
  /** step group d'appartenance (cf. STEP_GROUPS) */
  group: number
  kind: 'api'
  action: string
  method: string
  url: string
  /**
   * Variables que le step DÉFINIT (extraites de la réponse). Elles naissent au
   * runtime, donc elles se lisent comme des locales : bleu ciel, badge
   * « Step N », disponibles dans les steps qui suivent. Dans l'UI on les
   * appelle des in-test variables ; « output variable » ne se dit pas, même si
   * le champ du produit s'appelle `output_variables`.
   */
  outputs?: string[]
}

/**
 * Step d'interface (clic, saisie, assertion) : un locator, et une valeur pour
 * les actions qui en prennent une. C'est là qu'on consomme les variables.
 */
export type UiStep = {
  id: string
  n: number
  /** step group d'appartenance (cf. STEP_GROUPS) */
  group: number
  kind: 'ui'
  action: string
  locator: string
  /** absent = l'action ne prend pas de valeur (ex. Click) */
  value?: string
  /** variables définies par le step (ex. « Get text or value ») */
  outputs?: string[]
}

export type SetStep = {
  id: string
  n: number
  /** step group d'appartenance (cf. STEP_GROUPS) */
  group: number
  kind: 'set'
  target: Target
  /** nom de la variable écrite, tapé sur le step (locale comme globale) */
  name: string
  /** valeur statique ; elle peut citer d'autres variables ({{email}}) */
  value: string
}

export type Step = ApiStep | UiStep | SetStep

/** Le scénario est découpé en groupes, comme dans l'éditeur. */
export type StepGroup = { n: number; title: string }

export const STEP_GROUPS: StepGroup[] = [
  { n: 1, title: 'Log in' },
  { n: 2, title: 'Place the order' },
]

/* ---------------- interface du test (panneau Environment) ---------------- */
export type InputVar = {
  /** clé stable : le nom est éditable, il ne peut pas servir de clé */
  id: string
  name: string
  /**
   * La valeur par défaut, la seule qui se déclare ici. Les surcharges et les
   * jeux de données se jouent à la confirmation du run, pas à l'édition.
   */
  value: string
  secret?: boolean
}

export type GlobalVar = {
  name: string
  value: string
}

export const INPUTS: InputVar[] = [
  { id: 'in1', name: 'email', value: 'guest@rocketcorp.io' },
  { id: 'in2', name: 'password', value: '••••••••••••', secret: true },
  { id: 'in3', name: 'cartSize', value: '3' },
]

export const GLOBALS: GlobalVar[] = [
  { name: 'URL', value: 'https://api.rocketcorp.io' },
  /* Écrite par le test : c'est comme ça qu'une valeur sort d'un test pour servir
     ailleurs (autre test, campagne). */
  { name: 'lastOrderRef', value: 'ORD-4392' },
  { name: 'sessionId', value: 'sess_8c21f0' },
]

/**
 * Groupes de variables de Configurations : dans le picker du produit ils se
 * présentent sous les globales, avec un chevron qui ouvre leur contenu.
 */
export type GlobalGroup = { name: string; vars: string[] }

export const GLOBAL_GROUPS: GlobalGroup[] = [
  { name: 'Default', vars: ['baseUrl', 'apiKey', 'timeout'] },
  { name: 'Rocket Corp', vars: ['tenantId', 'plan'] },
]

/* ---------------- scénario ----------------
 * Un vrai test v2 : on se connecte, on passe commande, et chaque variable sert
 * à quelque chose.
 *   - in-test  : `email` / `password` aux steps 2-3, `cartSize` au step 6 ;
 *   - locale posée par un step de variable : `orderNote` (step 5), consommée au
 *     step 9, où le picker la propose badgée « Step 5 » ;
 *   - locale PRODUITE par un step : `orderRef`, extraite par l'API Call du step
 *     10, consommée aux steps 11 et 12 ;
 *   - globale lue : `URL` (step 10) ; globale ÉCRITE : `lastOrderRef` (step 11),
 *     c'est comme ça qu'une valeur sort du test.
 */
export const INITIAL_STEPS: Step[] = [
  { id: 's1', n: 1, group: 1, kind: 'ui', action: 'Click', locator: 'The "Log in" button in the header' },
  { id: 's2', n: 2, group: 1, kind: 'ui', action: 'Fill input', locator: 'The email field of the login form', value: '{{email}}' },
  { id: 's3', n: 3, group: 1, kind: 'ui', action: 'Fill input', locator: 'The password field of the login form', value: '{{password}}' },
  { id: 's4', n: 4, group: 1, kind: 'ui', action: 'Click', locator: 'The "Sign in" submit button' },
  // Set local variable : le nom ET la valeur se définissent ICI. Valeur statique,
  // qui compose avec une in-test. Elle sert au step 9.
  {
    id: 's5',
    n: 5,
    group: 1,
    kind: 'set',
    target: { kind: 'local' },
    name: 'orderNote',
    value: 'Order for {{email}}',
  },
  {
    id: 's6',
    n: 6,
    group: 2,
    kind: 'ui',
    action: 'Fill input',
    locator: 'The quantity field of the product card',
    value: '{{cartSize}}',
  },
  {
    id: 's7',
    n: 7,
    group: 2,
    kind: 'ui',
    action: 'Click',
    locator: 'The "Add to cart" button on the product card',
  },
  { id: 's8', n: 8, group: 2, kind: 'ui', action: 'Click', locator: 'The "Checkout" button of the cart summary' },
  // Consomme la locale du step 5 : le picker la propose, badgée « Step 5 ».
  {
    id: 's9',
    n: 9,
    group: 2,
    kind: 'ui',
    action: 'Fill input',
    locator: 'The order note field of the checkout form',
    value: '{{orderNote}}',
  },
  // L'extraction vit sur le step qui PRODUIT la valeur : la commande part, et sa
  // référence est rangée dans `orderRef` (tag bleu ciel sur la carte).
  {
    id: 's10',
    n: 10,
    group: 2,
    kind: 'api',
    action: 'API Call',
    method: 'POST',
    url: '{{URL}}/orders',
    outputs: ['orderRef'],
  },
  // Update variable : la variable écrite se choisit parmi celles qui existent.
  // Ici une globale, donc la référence sort du test et sert aux suivants.
  {
    id: 's11',
    n: 11,
    group: 2,
    kind: 'set',
    target: { kind: 'update' },
    name: 'lastOrderRef',
    value: '{{orderRef}}',
  },
  {
    id: 's12',
    n: 12,
    group: 2,
    kind: 'ui',
    action: 'Assert displayed',
    locator: 'Order {{orderRef}} confirmed',
  },
]

/* ---------------- changer l'action d'un step ----------------
 * Choisir une action dans le menu ne renomme pas le step : ça le CONVERTIT.
 * On garde son identité (id, numéro, groupe) et on repart des valeurs vides.
 */
const base = (s: Step) => ({ id: s.id, n: s.n, group: s.group })

export const toSetStep = (s: Step, target: Target): SetStep => ({
  ...base(s),
  kind: 'set',
  target,
  name: '',
  value: '',
})

export const toUiStep = (s: Step, action: string): UiStep => ({
  ...base(s),
  kind: 'ui',
  action,
  locator: s.kind === 'ui' ? s.locator : '',
  value: VALUE_ACTIONS.has(action) ? (s.kind === 'ui' ? (s.value ?? '') : '') : undefined,
})

export const toApiStep = (s: Step): ApiStep => ({
  ...base(s),
  kind: 'api',
  action: 'API Call',
  method: s.kind === 'api' ? s.method : 'GET',
  url: s.kind === 'api' ? s.url : '{{URL}}/',
})

/* ---------------- les 4 décisions, pour la note « Why? » ---------------- */
export const RULES: { title: string; body: string }[] = [
  {
    title: 'The value lives on the step',
    body: 'A variable step carries its own name and its own static value, right on its line. Nothing to declare upstream, and no extraction to configure here: that is the job of the steps that read the page or the response.',
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
    title: 'Two actions, one shape',
    body: 'Set local variable writes a variable that lives in the steps that follow. Update variable writes into a variable from Configurations, so the value leaves the test. Same line in both cases: the name, then the static value.',
  },
]
