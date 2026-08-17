import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Banner,
  Breadcrumb,
  Button,
  ButtonGroup,
  Checkbox,
  Collapse,
  EmptyState,
  Input,
  Modal,
  SearchInput,
  Popover,
  Select,
  Tabs,
  Tag,
  Tooltip,
  IconArrowRightFromLine,
  IconBell,
  IconBot,
  IconBraces,
  IconCheck,
  IconCheckCircle2,
  IconCode,
  IconChevronDown,
  IconChromium,
  IconColouredLogo,
  IconEye,
  IconFlag,
  IconGauge,
  IconGlobe,
  IconHistory,
  IconInfo,
  IconLock,
  IconMonitor,
  IconMonitorCheck,
  IconMonitorSmartphone,
  IconMoreHorizontal,
  IconPlay,
  IconPlus,
  IconSave,
  IconSmartphone,
  IconStar,
  IconTrash,
  IconZap,
} from '@kapptivate/ui-kit'
import CodeEditor from '../../components/CodeEditor'
import SlateInputTag, { SuggestionsPicker } from '../checks/slate/SlateInputTag'
import type { Color as TagColor, Suggestions, TagInputValue } from '../checks/slate/SlateInputTag'
import chrome from '../checks/checks.module.scss'
import cv from '../checks/slate/input-tag.module.scss'
import styles from './variables.module.scss'
import {
  ACTION_GROUPS,
  GLOBALS,
  INITIAL_STEPS,
  INPUTS,
  NATURE_TINT,
  RANDOM_VALUES,
  RESPONSE_HEADERS,
  RESPONSE_ROWS,
  SOURCES,
  STEP_GROUPS,
  SET_LOCAL,
  UPDATE_VAR,
  toApiStep,
  toSetStep,
  toUiStep,
  groupOfAction,
  iconOfAction,
  setStepLabel,
} from './constants'
import type { SetStep, Source, Step, StepOutput, Target, Tint, VarNature } from './constants'
import {
  INITIAL_CONDITIONS,
  NUM_OPS,
  SUBJECTS,
  UNITS,
  conditionText,
  predNeedsValue,
  predsFor,
  resetForKind,
} from '../checks/constants'
import type { Condition, Severity } from '../checks/constants'

/**
 * ─────────────────────────────────────────────────────────────
 *  Éditeur de test v2 — deux natures de variable qu'on confond
 * ─────────────────────────────────────────────────────────────
 *
 * Le proto tient sur un seul écran et défend 4 partis pris :
 *
 *  1. un step de variable redevient autonome et tient sur UNE ligne → l'action,
 *     le nom de la variable écrite, puis sa valeur STATIQUE. Pas de source
 *     d'extraction ici : lire la page ou une réponse est le travail d'autres
 *     steps (Get text or value, API Call) ;
 *  2. le panneau de droite = interface du test → inputs + outputs, rien d'autre.
 *     Les variables locales n'y sont plus : elles apparaissent dans le picker
 *     des steps SUIVANTS, badgées « Step N » ;
 *  3. 3 teintes, pas 4 : in-test orange, global bleu foncé, produit-au-run bleu
 *     clair (output déclaré ET variable locale) ; le badge « Step N » distingue ;
 *  4. deux actions pour une seule forme : « Set local variable » écrit une
 *     locale (visible dans les steps qui suivent), « Update variable » écrit
 *     dans une variable de Configurations, donc la valeur sort du test.
 *
 * Le chrome de l'éditeur (rail, topbar, canvas, cartes de step, panneau) est
 * réutilisé tel quel depuis le proto `checks`, pour rester dans le vrai écran.
 */

const toOptions = (arr: readonly string[]) => arr.map((v) => ({ label: v, value: v }))

const TINT_CLASS: Record<Tint, string> = {
  orange: styles.tintOrange,
  'light-blue': styles.tintLightBlue,
  'dark-blue': styles.tintDarkBlue,
  neutral: styles.tintNeutral,
}

/* Teinte d'une nature → couleur de tag dans l'input Slate du produit. */
const TAG_COLOR: Record<Tint, TagColor> = {
  orange: 'primary',
  'light-blue': 'light-blue',
  'dark-blue': 'blue',
  neutral: 'tertiary',
}

const RAIL_SECTIONS = [
  [IconMonitorCheck, IconEye, IconBell, IconGauge],
  [IconSmartphone, IconMonitorSmartphone, IconZap, IconCheck, IconHistory, IconBraces],
  [IconSmartphone, IconChromium, IconBot],
]

type OutputRef = { name: string; step: number }

/**
 * Champ de valeur avec pastilles.
 *
 * Le composant Slate du produit resynchronise sa prop `value` dans un effet
 * gardé par un drapeau à usage unique. Sous StrictMode l'effet est joué deux
 * fois : le 2e passage vide l'éditeur et replace le curseur au début, donc on
 * ne peut plus taper. Et comme les segments sont reconstruits à chaque render,
 * le moindre re-render provoquait la même remise à zéro.
 *
 * D'où ce wrapper : les segments vivent ICI, le champ n'est plus piloté de
 * l'extérieur après le montage, et le parent ne reçoit que la chaîne.
 */
const VarField = ({
  initial,
  onValue,
  toText,
  suggestions,
  placeholder,
  borderless,
  onVariableCreated,
}: {
  initial: TagInputValue[]
  onValue: (next: string) => void
  toText: (segs: TagInputValue[]) => string
  suggestions: Suggestions[]
  placeholder: string
  borderless?: boolean
  onVariableCreated?: (v: { name: string; value: string }) => void
}) => {
  const [segs, setSegs] = useState<TagInputValue[]>(initial)
  return (
    <SlateInputTag
      fullWidth
      borderless={borderless}
      value={segs}
      onChange={(next) => {
        const v = typeof next === 'function' ? next(segs) : next
        setSegs(v)
        onValue(toText(v))
      }}
      suggestions={suggestions}
      placeholder={placeholder}
      onVariableCreated={onVariableCreated}
    />
  )
}

const VariablesProto = () => {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [inputs, setInputs] = useState(INPUTS)
  /** les globales s'éditent dans le panneau, et la modale du picker en crée */
  const [globals, setGlobals] = useState(GLOBALS)
  /** step sélectionné (null = panneau du test) */
  const [sel, setSel] = useState<number | null>(null)
  const [testTab, setTestTab] = useState('environment')
  /** onglet du panneau d'un step (General / Variables / Checks / Advanced) */
  const [stepTab, setStepTab] = useState('general')
  const [flash, setFlash] = useState<number | null>(null)
  /** un seul step group déplié à la fois (null = tout replié) */
  const [openGroup, setOpenGroup] = useState<number | null>(1)
  /** menu d'actions : step ouvert, recherche, catégories dépliées */
  const [actionOpen, setActionOpen] = useState<string | null>(null)
  const [actionQuery, setActionQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<string[]>(['popular'])
  /**
   * Checks du step, par id de step (un API Call en porte, un step de variable
   * n'en porte pas). Modèle et rendu repris du proto `checks` : ici ils servent
   * à montrer que la valeur d'un check accepte les mêmes variables que le reste,
   * locales comprises.
   */
  const [checks, setChecks] = useState<Record<string, Condition[]>>({
    // l'API Call du scénario (step 10) : status attendu + garde-fou de latence
    s10: INITIAL_CONDITIONS,
  })
  /** connecteur de chaque groupe (le 1er select pilote, les suivants héritent) */
  const [failLogic, setFailLogic] = useState<'and' | 'or'>('and')
  const [warnLogic, setWarnLogic] = useState<'and' | 'or'>('and')
  /** dropdown « quelle variable mettre à jour » (Update variable) */
  const [targetOpen, setTargetOpen] = useState<string | null>(null)
  const [targetTab, setTargetTab] = useState('test')
  /** arbre de la dernière réponse, ouvert depuis un champ « JSON attribute » */
  const [pathOpen, setPathOpen] = useState<string | null>(null)
  const [subjOpen, setSubjOpen] = useState<string | null>(null)
  const [subjTab, setSubjTab] = useState('response')
  /**
   * Modale de création, pour une in-test comme pour une globale. Ouverte depuis
   * un picker (elle insère la variable dans le champ) ou depuis un panneau (elle
   * la crée, simplement).
   */
  const [newVar, setNewVar] = useState<{
    scope: 'in-test' | 'global'
    insert: (value: string, color: TagColor) => void
    name: string
    value: string
    secret: boolean
  } | null>(null)
  /**
   * Création / édition d'une variable définie par un step. Dans cette modale on
   * l'appelle une **output variable** : c'est le step qui la produit, et c'est
   * plus clair que « in-test » quand on la crée depuis lui. `index: null` = création.
   */
  const [outEdit, setOutEdit] = useState<{
    stepId: string
    index: number | null
    name: string
    source: Source
    detail: string
    fallback?: string
  } | null>(null)
  const [ignoreError, setIgnoreError] = useState(false)
  const [skipRun, setSkipRun] = useState(false)

  /** Un in-test input : renommage, valeur, ajout, suppression. */
  const patchInput = (i: number, next: Partial<(typeof INPUTS)[number]>) =>
    setInputs((cur) => cur.map((x, j) => (j === i ? { ...x, ...next } : x)))
  /** Une globale créée depuis la modale du picker rejoint Configurations. */
  const addGlobal = (v: { name: string; value: string }) =>
    setGlobals((cur) => (cur.some((g) => g.name === v.name) ? cur : [...cur, v]))
  /**
   * Créer une in-test depuis un panneau : la même modale que depuis le picker,
   * sans champ où insérer la variable — ici on la crée, c'est tout.
   */
  const openCreateVar = (
    scope: 'in-test' | 'global',
    insert: (value: string, color: TagColor) => void = () => undefined,
    name = '',
  ) => setNewVar({ scope, insert, name, value: '', secret: false })

  const patchStep = (id: string, next: Partial<SetStep>) =>
    setSteps((cur) =>
      cur.map((s) => (s.id === id && s.kind === 'set' ? ({ ...s, ...next } as SetStep) : s)),
    )
  const patchApi = (id: string, next: { url?: string; action?: string; outputs?: StepOutput[] }) =>
    setSteps((cur) => cur.map((s) => (s.id === id && s.kind === 'api' ? { ...s, ...next } : s)))
  const patchUi = (
    id: string,
    next: {
      locator?: string
      value?: string
      action?: string
      outputs?: StepOutput[]
    },
  ) => setSteps((cur) => cur.map((s) => (s.id === id && s.kind === 'ui' ? { ...s, ...next } : s)))

  /**
   * Variables locales du test : celles qu'un Set variable crée (cible « new »).
   * On garde le step d'origine — c'est lui que porte le badge.
   */
  const outputVars = useMemo<OutputRef[]>(() => {
    const out: OutputRef[] = []
    const push = (name: string, step: number) => {
      if (name && !out.some((l) => l.name === name)) out.push({ name, step })
    }
    steps.forEach((s) => {
      // affectée par un step de variable…
      if (s.kind === 'set') {
        if (s.target.kind === 'output') push(s.name, s.n)
        return
      }
      // …ou PRODUITE par un step qui lit la page ou une réponse
      ;(s.outputs ?? []).forEach((o) => push(o.name, s.n))
    })
    return out
  }, [steps])

  /** Une locale n'existe qu'À PARTIR de son step : rien à proposer avant. */
  const outputsBefore = (n: number) => outputVars.filter((l) => l.step < n)

  const natureOf = (name: string): VarNature =>
    globals.some((g) => g.name === name)
      ? 'global'
      : outputVars.some((l) => l.name === name)
        ? 'output'
        : 'input'

  const tintOf = (name: string): Tint => NATURE_TINT[natureOf(name)]

  /** Ce qu'un step peut citer : les in-test, les globales, et les locales déjà posées. */
  const availableVars = (n: number): { name: string; nature: VarNature; step?: number }[] => [
    ...inputs.filter((v) => v.name).map((v) => ({ name: v.name, nature: 'input' as VarNature })),
    ...outputsBefore(n).map((l) => ({
      name: l.name,
      nature: 'output' as VarNature,
      step: l.step,
    })),
    ...globals.map((g) => ({ name: g.name, nature: 'global' as VarNature })),
  ]
  const originStep = (name: string) => outputVars.find((l) => l.name === name)?.step

  /** Va au step et le fait clignoter (depuis un badge « Step N »). */
  const gotoStep = (n: number) => {
    setSel(n)
    setFlash(n)
    // le step visé peut être dans le groupe replié : on le déplie
    const g = steps.find((s) => s.n === n)?.group
    if (g) setOpenGroup(g)
    window.setTimeout(() => setFlash(null), 1200)
    window.requestAnimationFrame(() => {
      document
        .getElementById(`tev-step-${n}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  /* ---------------- pastille de variable ---------------- */
  const pill = (name: string, opts?: { step?: number; clickable?: boolean }) => (
    <span className={`${styles.pill} ${TINT_CLASS[tintOf(name)]}`}>
      <IconBraces size={11} />
      <span className={styles.pillName}>{name}</span>
      {opts?.step != null &&
        (opts.clickable === false ? (
          <span className={styles.pillStepStatic}>Step {opts.step}</span>
        ) : (
          <button
            type="button"
            className={styles.pillStep}
            onClick={(e) => {
              e.stopPropagation()
              gotoStep(opts.step as number)
            }}
          >
            Step {opts.step}
          </button>
        ))}
    </span>
  )

  /* ---------------- valeur ↔ segments de l'input Slate ---------------- */
  const toSegments = (v: string): TagInputValue[] => {
    const segs: TagInputValue[] = []
    const re = /\{\{([^}]+)\}\}/g
    let last = 0
    let i = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(v))) {
      if (m.index > last) segs.push({ type: 'text', value: v.slice(last, m.index) })
      const name = m[1]
      segs.push({
        type: 'tag',
        value: name,
        color: TAG_COLOR[tintOf(name)],
        id: `seg${i++}`,
        technicalName: name,
      })
      last = m.index + m[0].length
    }
    if (last < v.length) segs.push({ type: 'text', value: v.slice(last) })
    return segs
  }
  const fromSegments = (segs: TagInputValue[]): string =>
    segs.map((s) => (s.type === 'tag' ? `{{${s.value}}}` : s.value)).join('')

  /** Champ de valeur avec pastilles + picker {} (composant du produit). */
  const varInput = (
    value: string,
    onValue: (next: string) => void,
    stepNumber: number,
    placeholder: string,
  ) => (
    <span className={chrome.canvasField} onClick={(e) => e.stopPropagation()}>
      <VarField
        initial={toSegments(value)}
        onValue={onValue}
        toText={fromSegments}
        suggestions={suggestionsFor(stepNumber)}
        placeholder={placeholder}
        onVariableCreated={addGlobal}
      />
    </span>
  )

  /* ---------------- picker {} : 3 onglets, 3 teintes ---------------- */
  const optLabel = (name: string, nature: VarNature, step?: number): JSX.Element => (
    <span className={styles.opt}>
      <span className={`${styles.optIcon} ${TINT_CLASS[NATURE_TINT[nature]]}`}>
        <IconBraces size={12} />
      </span>
      <span className={styles.optName}>{name}</span>
      {step != null && <span className={styles.optBadge}>Step {step}</span>}
    </span>
  )

  /**
   * Suggestions du picker pour le step `n`. Les locales n'apparaissent qu'ici,
   * jamais dans le panneau, et seulement si un step précédent les affecte.
   */
  /**
   * Suggestions pour la valeur d'une in-test : globales et autres in-test
   * seulement. Pas de locale : elle n'existe pas encore quand le run démarre,
   * c'est le rôle d'un step Set local variable.
   */
  /**
   * Générateurs du produit : ni input, ni locale, ni globale — une valeur
   * calculée au démarrage du run. Neutres en gris, pour ne pas ajouter une
   * 4e teinte au système de variables.
   */
  const globalGroup = (): Suggestions => ({
    name: 'Global',
    key: 'variables',
    suggestions: globals.map((v, i) => ({
      id: `gl${i}`,
      label: optLabel(v.name, 'global'),
      color: TAG_COLOR['dark-blue'],
      value: v.name,
      technicalName: v.name,
    })),
  })

  const randomGroup = (): Suggestions => ({
    name: 'Random',
    key: 'built_in',
    suggestions: [...RANDOM_VALUES, 'Custom'].map((label, i) => ({
      id: `rnd${i}`,
      label: optLabel(label, 'generated'),
      color: TAG_COLOR.neutral,
      // `custom` déclenche le séparateur et la modale de personnalisation du portage
      value: label === 'Custom' ? 'custom' : label,
      technicalName: label,
    })),
  })

  const inputSuggestions = (skip?: string): Suggestions[] => [
    {
      name: 'In-test',
      key: 'test',
      suggestions: inputs
        .filter((v) => v.name && v.name !== skip)
        .map((v, i) => ({
          id: `oin${i}`,
          label: optLabel(v.name, 'input'),
          color: TAG_COLOR.orange,
          value: v.name,
          technicalName: v.name,
        })),
      footer: (insert, selectedText) => createVarFooter('in-test', insert, selectedText),
    },
    globalGroup(),
    randomGroup(),
  ]

  /**
   * Suggestions pour la variable qu'un « Update variable » écrit : le MÊME
   * dropdown que le picker {}, sans l'onglet Random (un générateur ne s'écrit
   * pas) et sans les locales (une locale s'écrit avec « Set local variable »).
   */
  const targetSuggestions = (): Suggestions[] => [
    {
      name: 'In-test',
      key: 'test',
      suggestions: inputs
        .filter((v) => v.name)
        .map((v, i) => ({
          id: `tin${i}`,
          label: optLabel(v.name, 'input'),
          color: TAG_COLOR.orange,
          value: v.name,
          technicalName: v.name,
        })),
      footer: (insert, selectedText) => createVarFooter('in-test', insert, selectedText),
    },
    globalGroup(),
  ]

  /** Pied de l'onglet In-test : créer la variable qu'on cherchait. */
  const createVarFooter = (
    scope: 'in-test' | 'global',
    insert: (value: string, color: TagColor) => void,
    sel?: string,
  ) => (
    <Button
      fullWidth
      size="s"
      color="secondary"
      onClick={() => openCreateVar(scope, insert, /^[\w.]+$/.test(sel ?? '') ? (sel as string) : '')}
    >
      <Button.Icon icon={IconPlus} />
      {scope === 'global' ? 'Create global variable' : 'Create in-test variable'}
    </Button>
  )

  const suggestionsFor = (n: number): Suggestions[] => [
    {
      /**
       * Une seule liste pour ce que le test définit : les in-test, toujours
       * disponibles, puis les locales déjà affectées. Au moment de consommer
       * une variable la question est « laquelle puis-je mettre ici », pas « de
       * quelle nature est-elle » : la teinte et le badge Step N le disent.
       */
      name: 'In-test',
      key: 'test',
      suggestions: [
        ...inputs
          .filter((v) => v.name)
          .map((v, i) => ({
            id: `in${i}`,
            label: optLabel(v.name, 'input'),
            color: TAG_COLOR.orange,
            value: v.name,
            technicalName: v.name,
          })),
        ...outputsBefore(n).map((l, i) => ({
          id: `loc${i}`,
          label: optLabel(l.name, 'output', l.step),
          color: TAG_COLOR['light-blue'],
          value: l.name,
          technicalName: l.name,
        })),
      ],
      footer: (insert, selectedText) => createVarFooter('in-test', insert, selectedText),
    },
    globalGroup(),
    randomGroup(),
  ]

  /* ---------------- la variable écrite ----------------
   * Deux formes, une seule grammaire de champ ({ } en boîtes grises) :
   *   - Set local variable → le nom se TAPE, il n'y a rien à choisir, donc pas
   *     de chevron ;
   *   - Update variable → le nom se CHOISIT parmi les variables qui existent
   *     déjà (in-test ou globale), donc un dropdown. La pastille prend la
   *     teinte de la nature choisie : c'est elle qui dit où la valeur atterrit.
   */
  const nameField = (step: SetStep) => {
    if (step.target.kind === 'output') {
      return (
        <span className={styles.targetSlot} onClick={(e) => e.stopPropagation()}>
          {/* accolades en bleu ciel : la variable qui naît ici est une locale, et
              c'est la teinte sous laquelle on la retrouvera partout ailleurs. */}
          <span className={`${styles.brace} ${styles.braceLocal}`}>{'{'}</span>
          <input
            className={styles.nameInput}
            placeholder="localName"
            aria-label="Local variable name"
            value={step.name}
            onChange={(e) => patchStep(step.id, { name: e.target.value })}
          />
          <span className={`${styles.brace} ${styles.braceLocal}`}>{'}'}</span>
        </span>
      )
    }
    /**
     * « Update variable » écrit dans une variable qui existe déjà : un select,
     * qui ouvre LE dropdown {} du produit (`SuggestionsPicker`), amputé de
     * l'onglet Random (un générateur ne s'écrit pas) et des locales (elles
     * passent par « Set local variable »).
     */
    const pick = (name: string) => {
      patchStep(step.id, { name })
      setTargetOpen(null)
    }
    return (
      <Popover
        trigger="click"
        placement="bottomLeft"
        noPadding
        arrow={false}
        open={targetOpen === step.id}
        setOpen={(o) => {
          setTargetOpen(o ? step.id : null)
          // s'ouvre sur l'onglet de la variable déjà choisie
          if (o) setTargetTab(step.name && natureOf(step.name) === 'global' ? 'variables' : 'test')
        }}
        content={
          <div className={styles.targetPop}>
            <SuggestionsPicker
              suggestions={targetSuggestions()}
              tab={targetTab}
              onTab={setTargetTab}
              onPick={(sugg) => pick(sugg.value)}
              footerInsert={(value) => pick(value)}
              /* l'onglet Global a son propre pied, comme dans le picker {} */
              extraFooter={
                targetTab === 'variables' ? (
                  <div className={cv.createVariableButton}>
                    {createVarFooter('global', (value) => pick(value))}
                  </div>
                ) : null
              }
            />
          </div>
        }
      >
        <button
          type="button"
          className={styles.targetSelect}
          aria-label="Variable to update"
          onClick={(e) => e.stopPropagation()}
        >
          {step.name ? (
            /* même pastille que dans les champs : fond teinté, nom coloré */
            <span className={`${styles.slotPick} ${TINT_CLASS[tintOf(step.name)]}`}>
              {step.name}
            </span>
          ) : (
            <span className={styles.slotEmpty}>Pick a variable</span>
          )}
          <IconChevronDown size={13} className={styles.slotCaret} />
        </button>
      </Popover>
    )
  }

  /* ---------------- valeur du step ----------------
   * Statique, et rien d'autre. Elle peut citer d'autres variables : c'est le
   * même champ que partout ailleurs, donc le picker {} y fonctionne.
   */
  const setValueField = (step: SetStep) =>
    varInput(
      step.value,
      (v) => patchStep(step.id, { value: v }),
      step.n,
      'Type a value or insert a variable',
    )

  /** Ce que la variable écrite implique, dit une fois, sur le step. */
  const targetNote = (step: SetStep): ReactNode => {
    if (step.target.kind === 'output') return 'Available in the steps that follow this one.'
    if (!step.name) return 'Pick the variable to update: an in-test input, or a global.'
    return natureOf(step.name) === 'global'
      ? 'Writes the value back to Configurations, for every test that uses this variable.'
      : 'Overwrites the in-test input for the rest of this run.'
  }

  /* ---------------- menu d'actions (popover produit) ---------------- */
  /**
   * Choix d'une action. Les deux items de la catégorie Variables décident dans
   * quelle famille le step écrit : Set local variable → une locale, Update
   * variable → une variable de Configurations. La ligne, elle, ne change pas.
   */
  const chooseAction = (step: Step, label: string) => {
    // Changer d'action CONVERTIT le step : un Click qui devient Set local
    // variable doit gagner sa cible et sa valeur, pas juste un autre libellé.
    const next: Step =
      label === SET_LOCAL
        ? step.kind === 'set' && step.target.kind === 'output'
          ? step
          : toSetStep(step, { kind: 'output' })
        : label === UPDATE_VAR
          ? toSetStep(step, { kind: 'update' })
          : label === 'API Call'
            ? toApiStep(step)
            : toUiStep(step, label)
    setSteps((cur) => cur.map((s) => (s.id === step.id ? next : s)))
    setActionOpen(null)
    setActionQuery('')
  }

  const actionMenu = (step: Step, current: string) => {
    const q = actionQuery.trim().toLowerCase()
    const groups = ACTION_GROUPS.map((g) => ({
      ...g,
      items: q ? g.items.filter((i) => i.label.toLowerCase().includes(q)) : g.items,
    })).filter((g) => g.items.length > 0)
    const Current = iconOfAction(current)
    const content = (
      <div className={styles.actionPop}>
        {/* SearchInput du DS (dispo en 1.47) plutôt qu'un Input + icône à la main */}
        <SearchInput
          size="m"
          fullwidth
          autofocus
          placeholder="Search..."
          value={actionQuery}
          onChange={(v) => setActionQuery(v)}
        />
        <div className={styles.actionCollapse}>
          <Collapse
            size="s"
            noBorder
            noContentPadding
            expandIconPosition="end"
            activeKeys={q ? groups.map((g) => g.key) : openGroups}
            onChange={(k) => setOpenGroups(Array.isArray(k) ? k : [k])}
            items={groups.map((g) => ({
              key: g.key,
              label: (
                <span className={styles.grpHead}>
                  <g.icon size={14} />
                  {g.label}
                </span>
              ),
              children: (
                <div className={styles.actionList}>
                  {g.items.map((i) => (
                    <button
                      key={`${g.key}-${i.label}`}
                      type="button"
                      className={i.label === current ? styles.actionItemOn : styles.actionItem}
                      onClick={() => chooseAction(step, i.label)}
                    >
                      <i.icon size={14} />
                      <span>{i.label}</span>
                    </button>
                  ))}
                </div>
              ),
            }))}
          />
        </div>
      </div>
    )
    return (
      <Popover
        trigger="click"
        placement="bottomLeft"
        noPadding
        arrow={false}
        open={actionOpen === step.id}
        setOpen={(o) => {
          setActionOpen(o ? step.id : null)
          if (o) {
            setActionQuery('')
            setOpenGroups([groupOfAction(current)])
          }
        }}
        content={content}
      >
        <button type="button" className={styles.actionBtn} onClick={(e) => e.stopPropagation()}>
          <Current size={12} />
          <span className={styles.actionBtnLabel}>{current}</span>
          <IconChevronDown size={13} />
        </button>
      </Popover>
    )
  }

  /* ---------------- cartes de step ---------------- */
  const stepShell = (n: number, children: ReactNode) => (
    <div
      id={`tev-step-${n}`}
      className={`${sel === n ? chrome.stepBodySelected : chrome.stepBody} ${
        flash === n ? styles.flash : ''
      }`}
      onClick={(e) => {
        e.stopPropagation()
        setSel((cur) => (cur === n ? null : n))
      }}
    >
      <div className={`${chrome.stepCard} ${styles.stepCardPad}`}>{children}</div>
    </div>
  )

  const apiCard = (step: Step & { kind: 'api' }) =>
    stepShell(
      step.n,
      <>
        <div className={chrome.stepTop}>
          <span className={sel === step.n ? chrome.stepNumActive : chrome.stepNum}>{step.n}</span>
          {actionMenu(step, step.action)}
          <Select
            size="s"
            width="110px"
            options={toOptions(['GET', 'POST', 'PUT', 'DELETE'])}
            value={step.method}
          />
        </div>
        {/* l'URL est sur sa propre ligne, sous l'action et la méthode */}
        <div className={styles.urlRow}>
          {varInput(step.url, (v) => patchApi(step.id, { url: v }), step.n, 'URL')}
        </div>
        {cardChips(step)}
      </>,
    )

  /**
   * Step d'interface. L'élément visé prend toute la largeur de la ligne, avec
   * la coche de résolution et le picker {} (comme dans l'éditeur), et la valeur
   * passe sur sa propre ligne quand l'action en prend une.
   */
  const uiCard = (step: Step & { kind: 'ui' }) =>
    stepShell(
      step.n,
      <>
        <div className={`${chrome.stepTop} ${styles.setRow}`}>
          <span className={sel === step.n ? chrome.stepNumActive : chrome.stepNum}>{step.n}</span>
          {actionMenu(step, step.action)}
          <span className={styles.elBox}>
            <span className={styles.elCheck}>
              <IconCheckCircle2 size={14} />
            </span>
            <VarField
              borderless
              initial={toSegments(step.locator)}
              onValue={(v) => patchUi(step.id, { locator: v })}
              toText={fromSegments}
              suggestions={suggestionsFor(step.n)}
              placeholder="Target element"
            />
          </span>
          {/* la valeur reste sur la ligne, à côté de l'élément */}
          {step.value !== undefined && (
            <span className={styles.valBox}>
              {varInput(step.value, (v) => patchUi(step.id, { value: v }), step.n, 'Value')}
            </span>
          )}
        </div>
        {cardChips(step)}
      </>,
    )

  const setCard = (step: SetStep) => {
    const label = setStepLabel(step.target)
    // Une seule ligne : l'action, le nom de la variable, sa valeur statique.
    return stepShell(
      step.n,
      <>
        <div className={`${chrome.stepTop} ${styles.setRow}`}>
          <span className={sel === step.n ? chrome.stepNumActive : chrome.stepNum}>{step.n}</span>
          {actionMenu(step, label)}
          {nameField(step)}
          <span className={styles.valBox}>{setValueField(step)}</span>
        </div>
      </>,
    )
  }

  /* ---------------- panneau : Environment ---------------- */
  /** Step qui met à jour cette globale (l'affectation reste sur le step). */
  const writerStep = (name: string) =>
    steps.find((s) => s.kind === 'set' && s.target.kind === 'update' && s.name === name)?.n

  /**
   * Mêmes tables que la tab Variables du proto `checks` (outTable / outHeadRow /
   * outDataRow, pastille Tag + IconBraces), pour rester dans l'UI existante.
   */
  /** Ligne de globale : nom en lecture, valeur éditable, et qui l'écrit. */
  const globalRow = (g: { name: string; value: string }, i: number) => {
    const n = writerStep(g.name)
    return (
      <div key={g.name} className={`${chrome.outDataRow} ${styles.varRow}`}>
        <div className={chrome.outNameCell}>
          <Tag color="dark-blue" size="sm" icon={IconBraces} />
          <span className={chrome.outName}>{g.name}</span>
        </div>
        <div className={`${chrome.outValCell} ${styles.valCell} ${styles.editable}`}>
          <Input
            size="s"
            mono
            fullWidth
            borderless
            placeholder="Enter value…"
            value={g.value}
            onChange={(e) =>
              setGlobals((cur) =>
                cur.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
              )
            }
          />
          {n != null && (
            <button type="button" className={styles.envLink} onClick={() => gotoStep(n)}>
              Updated at step {n}
            </button>
          )}
        </div>
      </div>
    )
  }

  /** Le bouton qui ouvre la modale de création, sous la table des in-test. */
  const createInTestButton = () => (
    <div>
      <Button color="secondary" size="s" onClick={() => openCreateVar('in-test')}>
        <Button.Icon icon={IconPlus} />
        Create in-test variable
      </Button>
    </div>
  )

  /**
   * Choisir un attribut plutôt que de le taper : l'arbre de la dernière réponse,
   * comme dans le proto `checks`. Un clic sur une feuille pose son JSONPath.
   */
  const jsonPicker = (key: string, onPick: (path: string) => void) => (
    <Popover
      trigger="click"
      placement="bottomRight"
      noPadding
      arrow={false}
      open={pathOpen === key}
      setOpen={(o) => setPathOpen(o ? key : null)}
      content={
        <div className={chrome.rpBox}>
          <div className={chrome.rpList}>
            {RESPONSE_ROWS.map((row) =>
              row.leaf ? (
                <button
                  key={row.path}
                  type="button"
                  className={chrome.rpRow}
                  style={{ paddingLeft: 10 + row.depth * 14 }}
                  title={`${row.path} = ${row.preview}`}
                  onClick={() => {
                    onPick(row.path)
                    setPathOpen(null)
                  }}
                >
                  <span className={chrome.rpKey}>{row.label}</span>
                  <span className={chrome.rpVal}>{row.preview}</span>
                </button>
              ) : (
                <div
                  key={row.path}
                  className={chrome.rpNode}
                  style={{ paddingLeft: 10 + row.depth * 14 }}
                >
                  <span className={chrome.rpKey}>{row.label}</span>
                  <span className={chrome.rpMuted}>{row.preview}</span>
                </div>
              ),
            )}
          </div>
        </div>
      }
    >
      {/* le Popover s'accroche à un élément simple : le Tooltip va DEDANS */}
      <span className={styles.pickWrap}>
        <Tooltip>
          <Tooltip.Trigger>
            <Button color="secondary" size="s">
              <Button.Icon icon={IconCode} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Pick from the last response</Tooltip.Content>
        </Tooltip>
      </span>
    </Popover>
  )

  /** Créer une variable produite par CE step (c'est là que la source existe). */
  const createOutputButton = (stepId: string) => (
    <div>
      <Button
        color="secondary"
        size="s"
        onClick={() => setOutEdit({ stepId, index: null, name: '', source: 'json', detail: '' })}
      >
        <Button.Icon icon={IconPlus} />
        Create output variable
      </Button>
    </div>
  )

  /**
   * Environment = ce qui est réglé AVANT le run : les globales de Configurations
   * d'abord, puis les in-test du test. Même ordre que dans le panneau d'un step.
   */
  const environmentTab = () => (
    <div className={chrome.varsPane}>
      <div className={chrome.varsSection}>
        <div className={chrome.outTable}>
          {/* même en-tête à deux colonnes que la table des in-test */}
          <div className={chrome.outHeadRow}>
            <div className={chrome.outHeadCell}>Global variables ({globals.length})</div>
            <div className={chrome.outHeadCell}>Values</div>
          </div>
          {globals.map((g, i) => globalRow(g, i))}
        </div>
      </div>

      <div className={styles.varsGroup}>
        <div className={chrome.outTable}>
          <div className={chrome.outHeadRow}>
            <div className={chrome.outHeadCell}>In-test variables ({inputs.length})</div>
            <div className={chrome.outHeadCell}>Values</div>
          </div>
          {inputs.map((v, i) => (
            <div key={v.id} className={`${chrome.outDataRow} ${styles.varRow}`}>
              <div
                className={`${chrome.outNameCell} ${styles.editable} ${styles.nameCellTight}`}
              >
                <Tag color="orange" size="sm" icon={IconBraces} />
                {/* le nom s'édite ; en Geist, comme les globales au-dessus */}
                <Input
                  size="s"
                  fullWidth
                  borderless
                  placeholder="variableName"
                  value={v.name}
                  onChange={(e) => patchInput(i, { name: e.target.value })}
                />
              </div>
              <div className={`${chrome.outValCell} ${styles.valCell} ${styles.editable}`}>
                {/* une valeur peut composer avec d'autres variables : {{URL}}/checkout */}
                {v.secret ? (
                  /* valeur masquée : pas de picker (on ne compose pas à l'aveugle),
                   mais on garde le bloc {} pour que la colonne ne se décale pas */
                  <>
                    <Input
                      size="s"
                      mono
                      fullWidth
                      borderless
                      placeholder="Enter value…"
                      type="password"
                      value={v.value}
                      onChange={(e) => patchInput(i, { value: e.target.value })}
                    />
                    <span
                      className={styles.suffixGhost}
                      title="Reveal the value to insert a variable"
                    >
                      <IconBraces size={12} />
                    </span>
                  </>
                ) : (
                  <VarField
                    borderless
                    initial={toSegments(v.value)}
                    onValue={(val) => patchInput(i, { value: val })}
                    toText={fromSegments}
                    suggestions={inputSuggestions(v.name)}
                    placeholder="Enter value…"
                    onVariableCreated={addGlobal}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        {createInTestButton()}
      </div>
    </div>
  )

  /* ---------------- panneau : Checks ----------------
   * Porté du proto `checks` (même modèle de Condition, mêmes groupes Success
   * conditions / Warnings, mêmes styles) avec UNE différence : la valeur d'un
   * check utilise le picker de CE proto, donc elle voit les in-test, les
   * globales et les locales posées plus haut, badgées « Step N ».
   *
   * Seul un step qui produit une réponse porte des checks (API Call) : un step
   * de variable n'a rien à vérifier.
   */
  const hasChecks = (step: Step) => step.kind === 'api'

  const condsOf = (id: string) => checks[id] ?? []

  const patchCond = (stepId: string, condId: string, next: Partial<Condition>) =>
    setChecks((cur) => ({
      ...cur,
      [stepId]: condsOf(stepId).map((c) => (c.id === condId ? { ...c, ...next } : c)),
    }))

  const addCond = (stepId: string, sev: Severity) =>
    setChecks((cur) => {
      const list = cur[stepId] ?? []
      const id = `c${stepId}-${list.length + 1}-${sev}`
      return {
        ...cur,
        [stepId]: [
          ...list,
          {
            id,
            sev,
            ...(resetForKind('Status code') as Omit<Condition, 'id' | 'sev'>),
          },
        ],
      }
    })

  const removeCond = (stepId: string, condId: string) =>
    setChecks((cur) => ({
      ...cur,
      [stepId]: condsOf(stepId).filter((c) => c.id !== condId),
    }))

  /** Sujet du check : la réponse, ou une variable disponible à ce step. */
  const subjectPicker = (step: Step, c: Condition) => {
    const isVar = c.subj.startsWith('{{')
    const pick = (subj: string) => {
      patchCond(step.id, c.id, resetForKind(subj))
      setSubjOpen(null)
    }
    const content = (
      <div className={chrome.subjPop}>
        <Tabs
          type="card"
          activeKey={subjTab}
          onChange={setSubjTab}
          tabs={[
            {
              key: 'response',
              label: 'Response',
              children: (
                <div className={chrome.subjList}>
                  {SUBJECTS.map((sj) => (
                    <button
                      key={sj.label}
                      className={chrome.subjItem}
                      onClick={() => pick(sj.label)}
                    >
                      {sj.label}
                    </button>
                  ))}
                </div>
              ),
            },
            {
              key: 'variables',
              label: 'Variables',
              children: (
                <div className={chrome.subjList}>
                  {availableVars(step.n).map((v) => (
                    <button
                      key={v.name}
                      className={chrome.subjItem}
                      onClick={() => pick(`{{${v.name}}}`)}
                    >
                      {optLabel(v.name, v.nature, v.step)}
                    </button>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    )
    const name = c.subj.replace(/^\{\{|\}\}$/g, '')
    return (
      <Popover
        trigger="click"
        placement="bottomLeft"
        noPadding
        arrow={false}
        open={subjOpen === c.id}
        setOpen={(o) => {
          setSubjOpen(o ? c.id : null)
          if (o) setSubjTab(isVar ? 'variables' : 'response')
        }}
        content={content}
      >
        <button
          type="button"
          className={isVar ? `${chrome.subjTrigger} ${chrome.subjTriggerTag}` : chrome.subjTrigger}
        >
          {isVar ? (
            /* même pastille que dans les champs : la teinte dit la nature */
            <span className={styles.subjVar}>
              <span className={`${styles.optIcon} ${TINT_CLASS[tintOf(name)]}`}>
                <IconBraces size={12} />
              </span>
              {name}
              {natureOf(name) === 'output' && originStep(name) != null && (
                <span className={styles.optBadge}>Step {originStep(name)}</span>
              )}
            </span>
          ) : (
            <span className={chrome.subjTriggerLabel}>{c.subj}</span>
          )}
          <IconChevronDown size={14} />
        </button>
      </Popover>
    )
  }

  /** Valeur d'un check : le champ à pastilles, avec le picker du step. */
  const condValue = (step: Step, c: Condition) => (
    <div className={chrome.valCell}>
      <VarField
        borderless
        initial={toSegments(c.val ?? '')}
        onValue={(v) => patchCond(step.id, c.id, { val: v })}
        toText={fromSegments}
        suggestions={suggestionsFor(step.n)}
        placeholder="Value"
      />
    </div>
  )

  /** Opérateur + valeur, selon la famille du sujet (comme dans `checks`). */
  const condTail = (step: Step, c: Condition) => {
    if (c.kind === 'num' || c.kind === 'time') {
      return (
        <>
          <Select
            size="s"
            borderless
            popupClassName={chrome.selPopup}
            options={toOptions(NUM_OPS)}
            value={c.op ?? '='}
            onChange={(v: unknown) => patchCond(step.id, c.id, { op: String(v) })}
          />
          {condValue(step, c)}
          {c.kind === 'time' && (
            <Select
              size="s"
              borderless
              popupClassName={chrome.selPopup}
              options={toOptions(UNITS)}
              value={c.unit ?? 'seconds'}
              onChange={(v: unknown) => patchCond(step.id, c.id, { unit: String(v) })}
            />
          )}
        </>
      )
    }
    const preds = predsFor(c.kind)
    const withValue = predNeedsValue(c.pred)
    return (
      <>
        <Select
          size="s"
          borderless
          popupClassName={chrome.selPopup}
          {...(withValue || c.kind === 'header' ? {} : { fullWidth: true })}
          options={toOptions(preds)}
          value={c.pred ?? preds[0]}
          onChange={(v: unknown) =>
            patchCond(step.id, c.id, {
              pred: String(v),
              val: predNeedsValue(String(v)) ? (c.val ?? '') : null,
            })
          }
        />
        {c.kind === 'header' && (
          <Input
            size="s"
            borderless
            width="118px"
            placeholder="Header name"
            value={c.headerName ?? ''}
            onChange={(e) => patchCond(step.id, c.id, { headerName: e.target.value })}
          />
        )}
        {withValue && condValue(step, c)}
      </>
    )
  }

  /**
   * Un groupe = une expression and/or, la conséquence est portée par le groupe.
   * « Passes if » = l'état attendu ; « Warns if » = le DÉCLENCHEUR de l'alerte.
   */
  const condRow = (
    step: Step,
    c: Condition,
    i: number,
    logic: 'and' | 'or',
    setLogic: (v: 'and' | 'or') => void,
    sev: Severity,
  ) => (
    <div key={c.id} className={chrome.cond}>
      {i === 0 ? (
        <span className={chrome.checkIf}>{sev === 'fail' ? 'Passes if' : 'Warns if'}</span>
      ) : (
        <Select
          size="s"
          className={chrome.conn}
          popupClassName={chrome.selPopup}
          width="56px"
          minWidth="0"
          disabled={i > 1}
          options={toOptions(['and', 'or'])}
          value={logic}
          onChange={(v: unknown) => setLogic(String(v) as 'and' | 'or')}
        />
      )}
      <span className={chrome.exprWrap}>
        <div className={`${chrome.expr} ${chrome.exprFill}`}>
          {subjectPicker(step, c)}
          {condTail(step, c)}
        </div>
      </span>
      <button
        type="button"
        className={chrome.kebab}
        aria-label="Remove this check"
        onClick={() => removeCond(step.id, c.id)}
      >
        <IconTrash size={12} />
      </button>
    </div>
  )

  const checksGroup = (step: Step, sev: Severity) => {
    const list = condsOf(step.id).filter((c) => c.sev === sev)
    const logic = sev === 'fail' ? failLogic : warnLogic
    const setLogic = sev === 'fail' ? setFailLogic : setWarnLogic
    return (
      <div className={chrome.grp}>
        <div className={chrome.grpHead}>
          <span className={sev === 'fail' ? chrome.grpBadgeFail : chrome.grpBadgeWarn}>
            <span className={sev === 'fail' ? chrome.dotFail : chrome.dotWarn} />
            {sev === 'fail' ? 'Success conditions' : 'Warnings'}
          </span>
          <span className={chrome.grpNote}>
            {sev === 'fail'
              ? 'the step passes when these are met'
              : 'the step still passes, but flags a warning when these happen'}
          </span>
        </div>
        <div className={chrome.condList}>
          {list.length ? (
            list.map((c, i) => condRow(step, c, i, logic, setLogic, sev))
          ) : (
            <div className={chrome.grpEmpty}>
              {sev === 'fail' ? 'No success conditions' : 'No warnings'}
            </div>
          )}
        </div>
        <div className={chrome.grpAdd}>
          <Button color="secondary" size="s" onClick={() => addCond(step.id, sev)}>
            <Button.Icon icon={IconPlus} />
            {sev === 'fail' ? 'Add condition' : 'Add warning'}
          </Button>
        </div>
      </div>
    )
  }

  const stepChecksTab = (step: Step) => (
    <div className={chrome.checksBody}>
      {checksGroup(step, 'fail')}
      <div className={chrome.grpDivider} />
      {checksGroup(step, 'warn')}
    </div>
  )

  /**
   * Variables que le step DÉFINIT, sur la carte : même chip que le récap de
   * checks, icône en bleu ciel (elles naissent au runtime, d'où la teinte des
   * locales). Vocabulaire : on dit « in-test variable », jamais « output
   * variable » — côté produit le champ s'appelle `output_variables`, mais ça ne
   * remonte pas dans l'UI. Le clic ouvre l'onglet Variables.
   */
  const outputChips = (step: Step) => {
    const outs = step.kind === 'set' ? [] : (step.outputs ?? [])
    return (
      <>
        {outs.map((o) => (
          <button
            key={o.name}
            type="button"
            className={`${chrome.chip} ${styles.outChip}`}
            title="In-test variable set at this step"
            onClick={(e) => {
              e.stopPropagation()
              setSel(step.n)
              setStepTab('variables')
            }}
          >
            <span className={`${styles.optIcon} ${styles.tintLightBlue}`}>
              <IconArrowRightFromLine size={11} />
            </span>
            {o.name}
          </button>
        ))}
      </>
    )
  }

  /** Récap des checks sur la carte : une ligne de chips, le clic ouvre l'onglet. */
  const checksChips = (step: Step) => {
    const list = condsOf(step.id)
    return (
      <>
        {[...list.filter((c) => c.sev === 'fail'), ...list.filter((c) => c.sev === 'warn')].map(
          (c) => (
            <button
              key={c.id}
              type="button"
              className={chrome.chip}
              title="Edit checks"
              onClick={(e) => {
                e.stopPropagation()
                setSel(step.n)
                setStepTab('checks')
              }}
            >
              <span className={c.sev === 'warn' ? chrome.dotWarn : chrome.dotFail} />
              {conditionText(c)}
            </button>
          ),
        )}
      </>
    )
  }

  /**
   * Un seul bandeau sous le formulaire du step : ce que le step PRODUIT d'abord,
   * puis ce qu'il VÉRIFIE. Même ligne, mêmes chips.
   */
  const cardChips = (step: Step) => {
    const outs = step.kind === 'set' ? [] : (step.outputs ?? [])
    if (!outs.length && !condsOf(step.id).length) return null
    return (
      <div className={chrome.fmBar}>
        {outputChips(step)}
        {checksChips(step)}
      </div>
    )
  }

  /* ---------------- panneau : step sélectionné ---------------- */
  const stepPanel = (n: number) => {
    const step = steps.find((s) => s.n === n)
    if (!step) return null
    const title =
      step.kind === 'set'
        ? setStepLabel(step.target)
        : step.kind === 'api'
          ? `${step.action} · ${step.method}`
          : step.action
    /**
     * Un step de variable n'a pas d'onglet Variables : ce qu'il affecte est déjà
     * tout l'objet du step, et General le porte.
     */
    const tabs = [
      { key: 'general', label: 'General', children: stepGeneralTab(step) },
      ...(step.kind === 'set'
        ? []
        : [
            {
              key: 'variables',
              label: 'Variables',
              children: stepVariablesTab(step),
            },
          ]),
      ...(hasChecks(step)
        ? [{ key: 'checks', label: 'Checks', children: stepChecksTab(step) }]
        : []),
      {
        key: 'advanced',
        label: 'Advanced settings',
        children: stepAdvancedTab(),
      },
    ]
    return (
      <>
        <div className={chrome.panelHeader}>
          <span className={chrome.panelTitleNum}>{n}</span>
          <span className={chrome.panelTitle}>{title}</span>
          <div className={chrome.panelHeaderActions}>
            <Button color="secondary" size="s">
              <Button.Icon icon={IconMoreHorizontal} />
            </Button>
          </div>
        </div>
        <Tabs
          className={chrome.panelTabs}
          type="card"
          activeKey={tabs.some((t) => t.key === stepTab) ? stepTab : 'general'}
          onChange={setStepTab}
          tabs={tabs}
        />
      </>
    )
  }

  /**
   * General : un step de variable se règle ENTIÈREMENT sur sa ligne (le nom, la
   * valeur statique). Le panneau ne redemande donc rien : il rappelle seulement
   * la portée de ce qu'on écrit. Le panneau du test (Environment) garde, lui,
   * les entrées et les globales.
   */
  const stepGeneralTab = (step: Step) => (
    <>
      {step.kind === 'set' && (
        <div className={styles.defBlock}>
          {/* `invisible` = le gris neutre du DS, `secondary` tire sur le vert. */}
          <div className={styles.noteBanner}>
            <Banner variant="invisible">
              <Banner.Description>{targetNote(step)}</Banner.Description>
            </Banner>
          </div>
        </div>
      )}
      {/* pas de capture de référence pour un step de variable : il ne touche
          pas la page, il n'y a rien à montrer. */}
      {step.kind !== 'set' && (
        <div className={styles.refBlock}>
          <div className={styles.refLabel}>Reference screenshot</div>
          {/* EmptyState du DS */}
          <div className={styles.refEmpty}>
            <EmptyState text="No reference screenshot available for this step" />
          </div>
        </div>
      )}
    </>
  )

  /**
   * Variables : ce que le step affecte, en lecture. C'est la réponse à
   * « où est passée la table des variables du step ? » — l'affectation est
   * éditée sur le step, le panneau ne fait que la refléter.
   */
  /** Variables citées par un step, dans l'ordre d'apparition. */
  const usedVars = (step: Step): string[] => {
    const texts =
      step.kind === 'ui'
        ? [step.locator, step.value ?? '']
        : step.kind === 'api'
          ? [step.url]
          : [step.value]
    const out: string[] = []
    texts.forEach((t) => {
      for (const m of t.matchAll(/\{\{([^}]+)\}\}/g)) if (!out.includes(m[1])) out.push(m[1])
    })
    return out
  }

  /**
   * Variables : ce dont CE step dépend, et d'où ça vient. Même table que le
   * panneau du test, réduite aux variables citées par le step.
   */
  /**
   * Variables du step, dans le même ordre que le panneau du test : les globales
   * d'abord, puis les in-test. Une in-test peut être posée AVANT le run (orange)
   * ou DÉFINIE par ce step (bleu ciel, icône de sortie), ou encore par un step
   * plus haut (bleu ciel, « Set at step N »).
   */
  const stepVariablesTab = (step: Step) => {
    const used = usedVars(step)
    const defined = step.kind === 'set' ? [] : (step.outputs ?? [])
    const usedGlobals = used.filter((n) => natureOf(n) === 'global')
    const definedNames = defined.map((o) => o.name)
    /* une variable citée est soit une globale, soit une output posée plus haut,
       soit une in-test déclarée avant le run */
    const usedOutputs = used.filter((n) => natureOf(n) === 'output' && !definedNames.includes(n))
    const usedInTest = used.filter((n) => natureOf(n) === 'input')

    // un step d'interface ou d'API a toujours la section Output variables (il peut
    // produire) ; un step de variable, non : il n'a rien à extraire.
    if (!used.length && !defined.length && step.kind === 'set') {
      return <div className={chrome.tabPlaceholder}>This step does not use a variable</div>
    }

    const patchDefined = (i: number, next: Partial<StepOutput>) => {
      const outs = defined.map((o, j) => (j === i ? { ...o, ...next } : o))
      if (step.kind === 'api') patchApi(step.id, { outputs: outs })
      else if (step.kind === 'ui') patchUi(step.id, { outputs: outs })
    }

    /**
     * COMMENT le step remplit la variable. C'est le seul endroit où la source
     * existe : une in-test déclarée en amont ne peut être que statique, et un
     * step de variable ne prend qu'une valeur statique.
     */
    const sourceField = (o: StepOutput, i: number) => {
      const control = () => {
        switch (o.source) {
          case 'header':
            return (
              <Select
                size="s"
                fullWidth
                searchable
                placeholder="Header…"
                options={toOptions(RESPONSE_HEADERS)}
                value={o.detail || undefined}
                onChange={(next: unknown) => patchDefined(i, { detail: String(next) })}
              />
            )
          case 'script':
            return (
              <button
                type="button"
                className={styles.scriptLink}
                onClick={() =>
                  setOutEdit({
                    stepId: step.id,
                    index: i,
                    name: o.name,
                    source: o.source,
                    detail: o.detail,
                    fallback: o.fallback,
                  })
                }
              >
                <IconCode size={12} />
                {o.detail ? 'Edit script' : 'Write a script'}
              </button>
            )
          case 'json':
            return (
              <>
                <Input
                  size="s"
                  mono
                  fullWidth
                  borderless
                  placeholder="$.order.reference"
                  value={o.detail}
                  onChange={(e) => patchDefined(i, { detail: e.target.value })}
                />
                {jsonPicker(`${step.id}-${i}`, (path) => patchDefined(i, { detail: path }))}
              </>
            )
          case 'static':
          default:
            return (
              <Input
                size="s"
                fullWidth
                borderless
                placeholder="Value"
                value={o.detail}
                onChange={(e) => patchDefined(i, { detail: e.target.value })}
              />
            )
        }
      }
      return (
        <div className={styles.srcCell}>
          <Select
            size="s"
            width="140px"
            options={SOURCES.map((x) => ({ label: x.label, value: x.value }))}
            value={o.source}
            onChange={(next: unknown) =>
              patchDefined(i, { source: (String(next) || 'static') as Source, detail: '' })
            }
          />
          <span className={styles.srcDetail}>{control()}</span>
        </div>
      )
    }

    return (
      <div className={chrome.varsPane}>
        {/* Ce que le step LIT : globales, puis in-test. Même ordre que le panneau
            du test. Ce qu'il PRODUIT vient en dernier, avec sa source. */}
        {usedGlobals.length > 0 && (
          <div className={chrome.outTable}>
            <div className={chrome.outHeadRow}>
              <div className={chrome.outHeadCell}>Global variables ({usedGlobals.length})</div>
              <div className={chrome.outHeadCell}>Values</div>
            </div>
            {usedGlobals.map((name) => {
              const i = globals.findIndex((g) => g.name === name)
              return i >= 0 ? globalRow(globals[i], i) : null
            })}
          </div>
        )}

        {usedInTest.length > 0 && (
          <div className={chrome.outTable}>
            <div className={chrome.outHeadRow}>
              <div className={chrome.outHeadCell}>In-test variables ({usedInTest.length})</div>
              <div className={chrome.outHeadCell}>Values</div>
            </div>
            {usedInTest.map((name) => {
              const inputIndex = inputs.findIndex((v) => v.name === name)
              return (
                <div key={name} className={`${chrome.outDataRow} ${styles.varRow}`}>
                  <div className={chrome.outNameCell}>
                    <Tag color="orange" size="sm" icon={IconBraces} />
                    <span className={chrome.outName}>{name}</span>
                  </div>
                  <div className={`${chrome.outValCell} ${styles.valCell} ${styles.editable}`}>
                    {inputIndex >= 0 ? (
                      <Input
                        size="s"
                        fullWidth
                        borderless
                        type={inputs[inputIndex].secret ? 'password' : 'text'}
                        value={inputs[inputIndex].value}
                        onChange={(e) => patchInput(inputIndex, { value: e.target.value })}
                      />
                    ) : (
                      <span className={styles.sumEmpty}>Generated when the run starts</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Output variables : celles que CE step produit (nom + source), et celles
            qu'un step plus haut a produites et que celui-ci cite. */}
        {(defined.length > 0 || usedOutputs.length > 0 || step.kind !== 'set') && (
          <div className={styles.varsGroup}>
            <div className={chrome.outTable}>
              <div className={chrome.outHeadRow}>
                <div className={chrome.outHeadCell}>
                  Output variables ({defined.length + usedOutputs.length})
                </div>
                <div className={chrome.outHeadCell}>Source</div>
              </div>

              {defined.map((o, i) => (
                <div key={`def-${i}`} className={`${chrome.outDataRow} ${styles.varRow}`}>
                  <div
                    className={`${chrome.outNameCell} ${styles.editable} ${styles.nameCellTight}`}
                  >
                    <span className={`${styles.optIcon} ${styles.tintLightBlue}`}>
                      <IconArrowRightFromLine size={12} />
                    </span>
                    {/* Geist, et la même gouttière que la ligne d'une globale */}
                    <Input
                      size="s"
                      fullWidth
                      borderless
                      placeholder="variableName"
                      value={o.name}
                      onChange={(e) => patchDefined(i, { name: e.target.value })}
                    />
                  </div>
                  <div className={`${chrome.outValCell} ${styles.valCell}`}>
                    {sourceField(o, i)}
                  </div>
                </div>
              ))}

              {usedOutputs.map((name) => {
                const from = originStep(name)
                return (
                  <div key={name} className={`${chrome.outDataRow} ${styles.varRow}`}>
                    <div className={chrome.outNameCell}>
                      <Tag color="blue" size="sm" icon={IconBraces} />
                      <span className={chrome.outName}>{name}</span>
                    </div>
                    <div className={`${chrome.outValCell} ${styles.valCell}`}>
                      {/* produite ailleurs : on renvoie au step qui la remplit */}
                      <button
                        type="button"
                        className={styles.envLink}
                        onClick={() => from != null && gotoStep(from)}
                      >
                        <IconBraces size={11} /> Set at step {from ?? '?'}
                      </button>
                    </div>
                  </div>
                )
              })}

              {defined.length + usedOutputs.length === 0 && (
                <div className={`${chrome.outDataRow} ${styles.varRow}`}>
                  <div className={chrome.outNameCell}>
                    <span className={styles.sumEmpty}>Nothing produced by this step</span>
                  </div>
                  <div className={`${chrome.outValCell} ${styles.valCell}`} />
                </div>
              )}
            </div>
            {step.kind !== 'set' && createOutputButton(step.id)}
          </div>
        )}
      </div>
    )
  }

  const stepAdvancedTab = () => (
    <div className={styles.stepPane}>
      <div className={styles.advGroup}>
        <div className={styles.advTitle}>Execution settings</div>
        <Checkbox
          identifier="tev-ignore"
          border={false}
          label="Ignore error on this step"
          checked={ignoreError}
          onChange={(e) => setIgnoreError(e.target.checked)}
        />
        <Checkbox
          identifier="tev-skip"
          border={false}
          label="Skip during run"
          checked={skipRun}
          onChange={(e) => setSkipRun(e.target.checked)}
        />
      </div>
    </div>
  )

  /**
   * Création d'une in-test depuis le picker : jumelle de la modale des globales
   * (même gabarit, mêmes styles), en plus légère. Pas d'origine de valeur ici :
   * les surcharges et le CSV se jouent à la confirmation du run.
   */
  /**
   * Création d'une variable, in-test ou globale. Jumelle de la modale du produit.
   * Une in-test n'est pas forcément une valeur tapée : elle peut être extraite au
   * démarrage du run (attribut JSON, en-tête) ou calculée par un script — d'où le
   * champ Source. Un step de variable, lui, reste en statique.
   */
  /**
   * Création d'une variable, in-test ou globale. Jumelle de la modale du produit.
   * PAS de source ici : une variable déclarée en amont du test tient sa valeur
   * avant le run, donc elle est statique. La source (JSON, en-tête, script) ne
   * concerne que les variables qu'un STEP définit, et elle se règle sur ce step.
   */
  const createVarModal = () => {
    if (!newVar) return null
    const v = newVar
    const close = () => setNewVar(null)
    const isGlobal = v.scope === 'global'
    const create = () => {
      const name = v.name.trim()
      if (!name) return
      if (isGlobal) {
        addGlobal({ name, value: v.value })
      } else {
        setInputs((curr) => [
          ...curr,
          { id: `in-${name}-${curr.length}`, name, value: v.value, secret: v.secret },
        ])
      }
      v.insert(name, isGlobal ? TAG_COLOR['dark-blue'] : TAG_COLOR.orange)
      close()
    }

    return (
      <Modal
        open
        width={620}
        title={isGlobal ? 'Create global variable' : 'Create in-test variable'}
        onCancel={close}
      >
        {/* `hasPadding={false}` : le banner touche le header et prend toute la
            largeur, le corps reprend sa gouttière juste en dessous. */}
        <Modal.Content hasPadding={false}>
          <div className={styles.cvBanner}>
            <Banner variant="invisible">
              <Banner.Description>
                {isGlobal
                  ? 'Available in every test of this product.'
                  : 'Available in this test only.'}
              </Banner.Description>
            </Banner>
          </div>
          <div className={`${cv.cvBody} ${styles.cvBodyPad}`}>
            <div className={cv.cvField}>
              <label className={cv.cvLabel} htmlFor="ci-name">
                Name
              </label>
              <span className={cv.cvName}>
                <span className={cv.cvBrace}>{'{'}</span>
                <input
                  id="ci-name"
                  className={cv.cvNameInput}
                  placeholder="e.g. user_email"
                  autoFocus
                  value={v.name}
                  onChange={(e) => setNewVar({ ...v, name: e.target.value.replace(/\s/g, '') })}
                />
                <span className={cv.cvBrace}>{'}'}</span>
              </span>
              <span className={cv.cvHint}>No spaces or other special characters allowed.</span>
            </div>

            <div className={cv.cvField}>
              <label className={cv.cvLabel} htmlFor="ci-value">
                {/* la valeur d'une in-test est sa valeur PAR DÉFAUT : les surcharges
                    se jouent à la confirmation du run, pas ici */}
                {isGlobal ? 'Value' : 'Default value'}
              </label>
              {v.secret ? (
                <Input
                  size="l"
                  fullWidth
                  name="ci-value"
                  placeholder="Enter value"
                  type="password"
                  value={v.value}
                  onChange={(e) => setNewVar({ ...v, value: e.target.value })}
                />
              ) : (
                /* une valeur statique peut composer avec une variable : d'où le {} */
                <span className={styles.cvValue}>
                  <VarField
                    key="ci-value"
                    initial={toSegments(v.value)}
                    onValue={(next) => setNewVar((cur) => (cur ? { ...cur, value: next } : cur))}
                    toText={fromSegments}
                    suggestions={inputSuggestions('')}
                    placeholder="Enter value"
                    onVariableCreated={addGlobal}
                  />
                </span>
              )}
            </div>

            {!isGlobal && (
              <Checkbox
                identifier="ci-secret"
                border={false}
                label="Hide this value"
                checked={v.secret}
                onChange={(e) => setNewVar({ ...v, secret: e.target.checked })}
              />
            )}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={cv.cvFooter}>
            <Button color="invisible" onClick={close}>
              Cancel
            </Button>
            <Button color="primary" disabled={!v.name.trim()} onClick={create}>
              Create
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    )
  }

  /**
   * Variable produite par un step. Ici — et seulement ici — on l'appelle une
   * **output variable** : on la crée depuis le step qui la produit, et c'est la
   * source (attribut JSON, en-tête, script, valeur statique) qui dit comment.
   * Ailleurs dans l'UI elle se lit comme une in-test variable.
   */
  const outputModal = () => {
    if (!outEdit) return null
    const o = outEdit
    const close = () => setOutEdit(null)
    const isNew = o.index === null
    const save = () => {
      const name = o.name.trim()
      if (!name) return
      const step = steps.find((x) => x.id === o.stepId)
      if (step && step.kind !== 'set') {
        const cur = step.outputs ?? []
        const next: StepOutput = {
        name,
        source: o.source,
        detail: o.detail,
        ...(o.fallback !== undefined ? { fallback: o.fallback } : {}),
      }
        const outs = isNew
          ? [...cur, next]
          : cur.map((x, j) => (j === o.index ? next : x))
        if (step.kind === 'api') patchApi(step.id, { outputs: outs })
        else patchUi(step.id, { outputs: outs })
      }
      close()
    }

    const detailField = () => {
      switch (o.source) {
        case 'header':
          return (
            <Select
              size="l"
              fullWidth
              searchable
              placeholder="Select a response header…"
              options={toOptions(RESPONSE_HEADERS)}
              value={o.detail || undefined}
              onChange={(next: unknown) => setOutEdit({ ...o, detail: String(next) })}
            />
          )
        case 'script':
          return (
            <div className={styles.cvScript}>
              <CodeEditor
                minRows={5}
                value={o.detail}
                onChange={(next) => setOutEdit({ ...o, detail: next })}
                placeholder="return window.localStorage.getItem('token')"
              />
            </div>
          )
        case 'json':
          return (
            <div className={styles.jsonRow}>
              <Input
                size="l"
                fullWidth
                mono
                placeholder="$.order.reference"
                value={o.detail}
                onChange={(e) => setOutEdit({ ...o, detail: e.target.value })}
              />
              {jsonPicker('modal', (path) => setOutEdit({ ...o, detail: path }))}
            </div>
          )
        case 'static':
        default:
          return (
            <Input
              size="l"
              fullWidth
              placeholder="Enter value"
              value={o.detail}
              onChange={(e) => setOutEdit({ ...o, detail: e.target.value })}
            />
          )
      }
    }

    return (
      <Modal
        open
        width={620}
        title={isNew ? 'Create output variable' : 'Output variable'}
        onCancel={close}
      >
        <Modal.Content hasPadding={false}>
          <div className={styles.cvBanner}>
            <Banner variant="invisible">
              <Banner.Description>
                Produced by this step, then available in the steps that follow it.
              </Banner.Description>
            </Banner>
          </div>
          <div className={`${cv.cvBody} ${styles.cvBodyPad}`}>
            <div className={cv.cvField}>
              <label className={cv.cvLabel} htmlFor="ov-name">
                Name
              </label>
              <span className={cv.cvName}>
                <span className={cv.cvBrace}>{'{'}</span>
                <input
                  id="ov-name"
                  className={cv.cvNameInput}
                  placeholder="e.g. order_ref"
                  autoFocus
                  value={o.name}
                  onChange={(e) => setOutEdit({ ...o, name: e.target.value.replace(/\s/g, '') })}
                />
                <span className={cv.cvBrace}>{'}'}</span>
              </span>
              <span className={cv.cvHint}>No spaces or other special characters allowed.</span>
            </div>

            <div className={cv.cvField}>
              <label className={cv.cvLabel}>Source</label>
              <Select
                size="l"
                fullWidth
                options={SOURCES.map((x) => ({ label: x.label, value: x.value }))}
                value={o.source}
                onChange={(next: unknown) =>
                  setOutEdit({ ...o, source: (String(next) || 'json') as Source, detail: '' })
                }
              />
            </div>

            <div className={cv.cvField}>
              <label className={cv.cvLabel}>
                {o.source === 'json'
                  ? 'JSON attribute'
                  : o.source === 'header'
                    ? 'Response header'
                    : o.source === 'script'
                      ? 'Script'
                      : 'Value'}
              </label>
              {detailField()}
            </div>

            {/* La valeur n'arrive qu'au run : un filet si la source ne rend rien. */}
            <Checkbox
              identifier="ov-default"
              border={false}
              label="Set a default value"
              checked={o.fallback !== undefined}
              onChange={(e) => setOutEdit({ ...o, fallback: e.target.checked ? '' : undefined })}
            />
            {o.fallback !== undefined && (
              <div className={cv.cvField}>
                <label className={cv.cvLabel} htmlFor="ov-default-value">
                  Default value
                </label>
                <Input
                  size="l"
                  fullWidth
                  name="ov-default-value"
                  placeholder="Used if the source returns nothing"
                  value={o.fallback}
                  onChange={(e) => setOutEdit({ ...o, fallback: e.target.value })}
                />
              </div>
            )}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={cv.cvFooter}>
            <Button color="invisible" onClick={close}>
              Cancel
            </Button>
            <Button color="primary" disabled={!o.name.trim()} onClick={save}>
              {isNew ? 'Create' : 'Save'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    )
  }

  /* ---------------- rendu ---------------- */
  return (
    <div className={`${chrome.app} ${styles.app}`}>
      {/* ---------- rail ---------- */}
      <nav className={chrome.rail}>
        <div className={chrome.railLogo}>
          <img src="/logo-yellow.svg" alt="Kapptivate" className={chrome.railLogoImg} />
        </div>
        <div className={chrome.railWorkspace}>
          <button className={chrome.railWsMode} aria-label="Workspace mode">
            <IconEye size={16} />
          </button>
          <span className={chrome.railWsLogo}>
            <img src="/operator-logo.svg" alt="" />
          </span>
        </div>
        <div className={chrome.railSections}>
          {RAIL_SECTIONS.map((section, s) => (
            <div key={`s${s}`} className={chrome.railSection}>
              {section.map((Icon, i) => (
                <button
                  key={`s${s}i${i}`}
                  className={Icon === IconZap ? chrome.railItemActive : chrome.railItem}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* ---------- workspace ---------- */}
      <div className={chrome.workspace}>
        <header className={chrome.topbar}>
          <div className={chrome.crumb}>
            {/* court : le fil d'Ariane du chrome kapptiDrafts recouvre le début de la barre */}
            <Breadcrumb>
              <Breadcrumb.Item>Tests</Breadcrumb.Item>
              <Breadcrumb.Item>Checkout</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className={chrome.topActions}>
            <ButtonGroup>
              <Button color="secondary" size="m">
                <Button.Icon icon={IconLock} />
              </Button>
              <Button color="secondary" size="m">
                <Button.Icon icon={IconMonitor} />
              </Button>
              <Button color="secondary" size="m">
                <Button.Icon icon={IconStar} />
              </Button>
              <Button color="danger-s" size="m">
                <Button.Icon icon={IconTrash} />
              </Button>
            </ButtonGroup>
            <Button color="secondary" size="m">
              <Button.Icon icon={IconSave} />
              Save
            </Button>
            <Button color="primary" size="m">
              <Button.Icon icon={IconZap} />
              Run
            </Button>
          </div>
        </header>

        <div className={chrome.body}>
          <div className={chrome.canvas} onClick={() => setSel(null)}>
            <div className={`${chrome.canvasInner} ${styles.canvasWide}`}>
              <div className={chrome.startRow}>
                <span className={chrome.startFlag}>
                  <IconFlag size={16} />
                </span>
                <span className={chrome.startLabel}>
                  <IconGlobe size={15} /> Navigate to starting page
                </span>
                <div className={chrome.startField}>
                  <span className={chrome.canvasField}>
                    <SlateInputTag
                      fullWidth
                      value={toSegments('{{URL}}')}
                      onChange={() => undefined}
                      suggestions={suggestionsFor(1)}
                      placeholder="Starting URL"
                    />
                  </span>
                </div>
              </div>

              {/* deux groupes, en accordéon : ouvrir l'un replie l'autre */}
              {STEP_GROUPS.map((g) => {
                const groupSteps = steps.filter((s) => s.group === g.n)
                const open = openGroup === g.n
                return (
                  <div key={g.n} className={styles.groupWrap}>
                    <span className={chrome.connector} />
                    <div className={chrome.stepGroup}>
                      <div
                        className={`${chrome.stepGroupHead} ${open ? '' : styles.groupHeadClosed}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenGroup(open ? null : g.n)
                          // un step replié ne doit pas rester sélectionné
                          if (
                            open &&
                            sel != null &&
                            steps.some((s) => s.n === sel && s.group === g.n)
                          ) {
                            setSel(null)
                          }
                        }}
                        role="button"
                        aria-expanded={open}
                      >
                        <span className={chrome.stepGroupMark}>
                          <IconColouredLogo size={32} />
                        </span>
                        <div>
                          <div className={chrome.stepGroupTitle}>{g.title}</div>
                          <div className={chrome.stepGroupSub}>{groupSteps.length} steps</div>
                        </div>
                        <span className={styles.groupActions}>
                          <span
                            className={`${styles.groupCaret} ${open ? styles.groupCaretOpen : ''}`}
                          >
                            <IconChevronDown size={18} />
                          </span>
                          <button
                            className={chrome.stepGroupMore}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconMoreHorizontal size={12} />
                          </button>
                        </span>
                      </div>

                      {open && (
                        <>
                          {groupSteps.map((s, i) => (
                            <div key={s.id}>
                              {i > 0 && <div className={chrome.stepSep} />}
                              {s.kind === 'api'
                                ? apiCard(s)
                                : s.kind === 'ui'
                                  ? uiCard(s)
                                  : setCard(s)}
                            </div>
                          ))}

                          <div className={chrome.stepFooter}>
                            <Button color="invisible" size="s">
                              <Button.Icon icon={IconPlus} />
                              Add step…
                            </Button>
                            <Button color="secondary" size="s">
                              <Button.Icon icon={IconPlay} />
                              Use recorder
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              <span className={chrome.connector} />
              <button className={chrome.plusNode}>
                <IconPlus size={16} />
              </button>
            </div>
          </div>

          {/* right panel : step sélectionné → réglages du step ; sinon → panneau du test */}
          <aside className={chrome.panel}>
            {sel !== null ? (
              stepPanel(sel)
            ) : (
              <Tabs
                className={chrome.panelTabs}
                type="card"
                activeKey={testTab}
                onChange={setTestTab}
                tabs={[
                  {
                    key: 'preview',
                    label: 'Preview',
                    children: <div className={chrome.tabPlaceholder}>Preview</div>,
                  },
                  {
                    key: 'environment',
                    label: 'Environment',
                    children: environmentTab(),
                  },
                  {
                    key: 'settings',
                    label: 'Test settings',
                    children: <div className={chrome.tabPlaceholder}>Test settings</div>,
                  },
                  {
                    key: 'history',
                    label: 'Version history',
                    children: <div className={chrome.tabPlaceholder}>Version history</div>,
                  },
                ]}
              />
            )}
          </aside>
        </div>
      </div>

      {createVarModal()}
      {outputModal()}
    </div>
  )
}

export default VariablesProto
