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
  IconBell,
  IconBot,
  IconBox,
  IconBraces,
  IconCheck,
  IconCheckCircle2,
  IconChevronDown,
  IconChevronRight,
  IconChromium,
  IconCode,
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
import SlateInputTag from '../checks/slate/SlateInputTag'
import type { Color as TagColor, Suggestions, TagInputValue } from '../checks/slate/SlateInputTag'
import chrome from '../checks/checks.module.scss'
import cv from '../checks/slate/input-tag.module.scss'
import styles from './variables.module.scss'
import {
  ACTION_GROUPS,
  GLOBALS,
  GLOBAL_GROUPS,
  INITIAL_STEPS,
  INPUTS,
  NATURE_TINT,
  RANDOM_VALUES,
  RESPONSE_HEADERS,
  STEP_GROUPS,
  RESPONSE_ROWS,
  SET_LOCAL,
  SOURCES,
  UPDATE_GLOBAL,
  toApiStep,
  toSetStep,
  toUiStep,
  groupOfAction,
  iconOfAction,
  setStepLabel,
  sourceLabel,
  stepValue,
  targetNature,
} from './constants'
import type { SetStep, Source, Step, Target, TargetKind, Tint, VarNature } from './constants'

/**
 * ─────────────────────────────────────────────────────────────
 *  Éditeur de test v2 — deux natures de variable qu'on confond
 * ─────────────────────────────────────────────────────────────
 *
 * Le proto tient sur un seul écran et défend 4 partis pris :
 *
 *  1. le step « Set variable » redevient autonome → nom ET valeur sur le step,
 *     avec les mêmes sources que la modale de création (static / json / header
 *     / script), parce qu'une affectation est le plus souvent une extraction ;
 *  2. le panneau de droite = interface du test → inputs + outputs, rien d'autre.
 *     Les variables locales n'y sont plus : elles apparaissent dans le picker
 *     des steps SUIVANTS, badgées « Step N » ;
 *  3. 3 teintes, pas 4 : in-test orange, global bleu foncé, produit-au-run bleu
 *     clair (output déclaré ET variable locale) ; le badge « Step N » distingue ;
 *  4. un seul verbe « Set variable » : ce qui change est la cible (nouvelle
 *     locale, locale existante, output déclaré, globale). Le libellé du step
 *     bascule sur « Update variable » quand la cible existe déjà.
 *
 * Le chrome de l'éditeur (rail, topbar, canvas, cartes de step, panneau) est
 * réutilisé tel quel depuis le proto `checks`, pour rester dans le vrai écran.
 */

/* Le Select du DS renvoie tantôt (value, option), tantôt (event, value). */
const pickVal = (a: unknown, b: unknown): string => {
  if (typeof a === 'string') return a
  if (typeof b === 'string') return b
  const obj = (b ?? a) as { value?: string } | null
  return obj?.value ?? ''
}

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

type LocalVar = { name: string; step: number }

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
  const [targetOpen, setTargetOpen] = useState<string | null>(null)
  const [pathOpen, setPathOpen] = useState<string | null>(null)
  /** menu d'actions : step ouvert, recherche, catégories dépliées */
  const [actionOpen, setActionOpen] = useState<string | null>(null)
  const [actionQuery, setActionQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<string[]>(['popular'])
  /** modale « Create in-test variable » : ouverte depuis le picker, elle insère */
  const [newInput, setNewInput] = useState<{
    insert: (value: string, color: TagColor) => void
    name: string
    value: string
    secret: boolean
  } | null>(null)
  const [ignoreError, setIgnoreError] = useState(false)
  const [skipRun, setSkipRun] = useState(false)

  /** Un in-test input : renommage, valeur, ajout, suppression. */
  const patchInput = (i: number, next: Partial<(typeof INPUTS)[number]>) =>
    setInputs((cur) => cur.map((x, j) => (j === i ? { ...x, ...next } : x)))
  /** Une globale créée depuis la modale du picker rejoint Configurations. */
  const addGlobal = (v: { name: string; value: string }) =>
    setGlobals((cur) => (cur.some((g) => g.name === v.name) ? cur : [...cur, v]))
  const addInput = () =>
    setInputs((cur) => [
      ...cur,
      { id: `in${cur.length + 1}-${cur.length}`, name: '', value: '' },
    ])

  const patchStep = (id: string, next: Partial<SetStep>) =>
    setSteps((cur) =>
      cur.map((s) => (s.id === id && s.kind === 'set' ? ({ ...s, ...next } as SetStep) : s)),
    )
  const patchApi = (id: string, next: { url?: string; action?: string }) =>
    setSteps((cur) => cur.map((s) => (s.id === id && s.kind === 'api' ? { ...s, ...next } : s)))
  const patchUi = (id: string, next: { locator?: string; value?: string; action?: string }) =>
    setSteps((cur) => cur.map((s) => (s.id === id && s.kind === 'ui' ? { ...s, ...next } : s)))

  /**
   * Variables locales du test : celles qu'un Set variable crée (cible « new »).
   * On garde le step d'origine — c'est lui que porte le badge.
   */
  const locals = useMemo<LocalVar[]>(() => {
    const out: LocalVar[] = []
    steps.forEach((s) => {
      if (s.kind !== 'set') return
      if (s.target.kind !== 'new' || !s.name) return
      if (!out.some((l) => l.name === s.name)) out.push({ name: s.name, step: s.n })
    })
    return out
  }, [steps])

  /** Une locale n'existe qu'À PARTIR de son step : rien à proposer avant. */
  const localsBefore = (n: number) => locals.filter((l) => l.step < n)

  const natureOf = (name: string): VarNature =>
    globals.some((g) => g.name === name)
      ? 'global'
      : locals.some((l) => l.name === name)
        ? 'local'
        : 'input'

  const tintOf = (name: string): Tint => NATURE_TINT[natureOf(name)]
  const originStep = (name: string) => locals.find((l) => l.name === name)?.step

  /** Va au step et le fait clignoter (depuis un badge « Step N »). */
  const gotoStep = (n: number) => {
    setSel(n)
    setFlash(n)
    // le step visé peut être dans le groupe replié : on le déplie
    const g = steps.find((s) => s.n === n)?.group
    if (g) setOpenGroup(g)
    window.setTimeout(() => setFlash(null), 1200)
    window.requestAnimationFrame(() => {
      document.getElementById(`tev-step-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
      footer: (insert, selectedText) => (
        <Button
          fullWidth
          size="s"
          color="secondary"
          onClick={() =>
            setNewInput({
              insert,
              name: /^[\w.]+$/.test(selectedText ?? '') ? (selectedText as string) : '',
              value: '',
              secret: false,
            })
          }
        >
          <Button.Icon icon={IconPlus} />
          Create in-test variable
        </Button>
      ),
    },
    globalGroup(),
    randomGroup(),
  ]

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
        ...localsBefore(n).map((l, i) => ({
          id: `loc${i}`,
          label: optLabel(l.name, 'local', l.step),
          color: TAG_COLOR['light-blue'],
          value: l.name,
          technicalName: l.name,
        })),
      ],
      footer: (insert, selectedText) => (
        <Button
          fullWidth
          size="s"
          color="secondary"
          onClick={() =>
            setNewInput({
              insert,
              name: /^[\w.]+$/.test(selectedText ?? '') ? (selectedText as string) : '',
              value: '',
              secret: false,
            })
          }
        >
          <Button.Icon icon={IconPlus} />
          Create in-test variable
        </Button>
      ),
    },
    globalGroup(),
    randomGroup(),
  ]

  /* ---------------- sélecteur de cible ---------------- */
  const setTarget = (step: SetStep, kind: TargetKind, name = '') => {
    patchStep(step.id, { target: { kind, name } as Target })
    setTargetOpen(null)
  }

  const targetSelector = (step: SetStep) => {
    const t = step.target
    const item = (
      label: ReactNode,
      on: boolean,
      onClick: () => void,
      key: string,
    ) => (
      <button key={key} type="button" className={on ? styles.popItemOn : styles.popItem} onClick={onClick}>
        {label}
        {on && (
          <span className={styles.popCheck}>
            <IconCheck size={14} />
          </span>
        )}
      </button>
    )
    const avail = localsBefore(step.n)
    /**
     * Le menu ne sert qu'à CHOISIR une variable existante : le nom d'une
     * nouvelle locale se tape dans le champ. Donc pas de chevron quand il n'y a
     * rien à choisir (aucune locale en amont), et pas d'item « New local
     * variable » qui doublerait la saisie.
     */
    const content =
      t.kind === 'global' ? (
        /* Le picker de variables du produit : pastilles {} pour les globales,
           groupes de Configurations avec leur contenu en sous-popover, et la
           création en pied. */
        <div className={styles.targetPop}>
          {globals.map((g) =>
            item(
              optLabel(g.name, 'global'),
              t.name === g.name,
              () => setTarget(step, 'global', g.name),
              `gl-${g.name}`,
            ),
          )}
          {GLOBAL_GROUPS.map((grp) => (
            <Popover
              key={grp.name}
              trigger="hover"
              placement="rightTop"
              noPadding
              arrow={false}
              content={
                <div className={styles.targetPop}>
                  {grp.vars.map((v) =>
                    item(
                      optLabel(v, 'global'),
                      t.name === v,
                      () => setTarget(step, 'global', v),
                      `${grp.name}-${v}`,
                    ),
                  )}
                </div>
              }
            >
              <div className={styles.popItem}>
                <span className={styles.opt}>
                  <span className={`${styles.optIcon} ${styles.optIconPlain}`}>
                    <IconBox size={12} />
                  </span>
                  <span className={styles.optName}>{grp.name}</span>
                </span>
                <span className={styles.popMore}>
                  <IconChevronRight size={14} />
                </span>
              </div>
            </Popover>
          ))}
          <div className={styles.popFoot}>
            <Button
              color="secondary" size="s" fullWidth
            >
              <Button.Icon icon={IconPlus} />
              Create global variable
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.targetPop}>
          <div className={styles.popHint}>Reassign a local variable set earlier.</div>
          {avail.map((l) =>
            item(
              optLabel(l.name, 'local', l.step),
              t.kind === 'local' && t.name === l.name,
              () => setTarget(step, 'local', l.name),
              `loc-${l.name}`,
            ),
          )}
          {t.kind === 'local' && (
            <div className={styles.popFoot}>
              <Button
                fullWidth
                size="s"
                color="secondary"
                onClick={() => setTarget(step, 'new')}
              >
                <Button.Icon icon={IconPlus} />
                Create a new variable
              </Button>
            </div>
          )}
        </div>
      )

    /** Rien à choisir : le champ se suffit à lui-même, on masque le chevron. */
    const hasChoice = t.kind === 'global' || t.kind === 'local' || avail.length > 0
    /**
     * Une seule commande pour la cible, pour tenir sur la ligne du step :
     * nouvelle locale → champ { nom } éditable, cible existante → pastille.
     * Le chevron ouvre le sélecteur dans les deux cas.
     */
    return (
      <span className={styles.targetSlot} onClick={(e) => e.stopPropagation()}>
        {/* champ « Pre / Post tab » : { } en boîtes grises, nom en texte normal */}
        <span className={styles.brace}>{'{'}</span>
        {t.kind === 'new' ? (
          <input
            className={styles.nameInput}
            placeholder="localName"
            aria-label="Local variable name"
            value={step.name}
            onChange={(e) => patchStep(step.id, { name: e.target.value })}
          />
        ) : (
          <span className={styles.slotName}>
            {t.name}
            {t.kind === 'local' && originStep(t.name) != null && (
              <span className={styles.pillStepStatic}>Step {originStep(t.name)}</span>
            )}
          </span>
        )}
        <span className={styles.brace}>{'}'}</span>
        {hasChoice && (
          <Popover
            trigger="click"
            placement="bottomLeft"
            noPadding
            arrow={false}
            open={targetOpen === step.id}
            setOpen={(o) => setTargetOpen(o ? step.id : null)}
            content={content}
          >
            <button type="button" className={styles.slotChevron} aria-label="Target variable">
              <IconChevronDown size={13} />
            </button>
          </Popover>
        )}
      </span>
    )
  }

  /* ---------------- contrôle de valeur selon la source ---------------- */
  const jsonPicker = (step: SetStep) => (
    <Popover
      trigger="click"
      placement="bottomRight"
      noPadding
      arrow={false}
      open={pathOpen === step.id}
      setOpen={(o) => setPathOpen(o ? step.id : null)}
      content={
        <div className={styles.pickBox}>
          {RESPONSE_ROWS.map((row) =>
            row.leaf ? (
              <button
                key={row.path}
                type="button"
                className={styles.pickRow}
                style={{ paddingLeft: 8 + row.depth * 14 }}
                onClick={() => {
                  patchStep(step.id, { jsonPath: row.path })
                  setPathOpen(null)
                }}
              >
                <span className={styles.pickKey}>{row.label}</span>
                <span className={styles.pickVal}>{row.preview}</span>
              </button>
            ) : (
              <div
                key={row.path}
                className={styles.pickNode}
                style={{ paddingLeft: 8 + row.depth * 14 }}
              >
                <span className={styles.pickKey}>{row.label}</span>
                <span className={styles.pickMuted}>{row.preview}</span>
              </div>
            ),
          )}
        </div>
      }
    >
      {/* Le Popover doit s'accrocher à un élément simple : si on lui donne un
          Tooltip comme enfant, le clic n'atteint jamais le trigger. Le Tooltip
          se met donc À L'INTÉRIEUR, sur le bouton. */}
      <span className={styles.pickWrap}>
        <Tooltip>
          <Tooltip.Trigger>
            <Button color="secondary" size="s"><Button.Icon icon={IconCode} /></Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Pick from the last response</Tooltip.Content>
        </Tooltip>
      </span>
    </Popover>
  )

  const valueControl = (step: SetStep) => {
    switch (step.source) {
      case 'static':
        // Une valeur statique peut référencer d'autres variables (input, locale, globale).
        return varInput(
          step.staticValue,
          (v) => patchStep(step.id, { staticValue: v }),
          step.n,
          'Type a value or insert a variable',
        )
      case 'json':
        return (
          <>
            <span className={styles.pathInput} onClick={(e) => e.stopPropagation()}>
              <Input
                size="s"
                mono
                fullWidth
                placeholder="$.access_token"
                value={step.jsonPath}
                onChange={(e) => patchStep(step.id, { jsonPath: e.target.value })}
              />
            </span>
            {jsonPicker(step)}
          </>
        )
      case 'header':
        return (
          <span className={styles.pathInput} onClick={(e) => e.stopPropagation()}>
            <Select
              size="s"
              fullWidth
              searchable
              placeholder="Select a response header…"
              options={toOptions(RESPONSE_HEADERS)}
              value={step.headerName || undefined}
              onChange={(a: unknown, b: unknown) => patchStep(step.id, { headerName: pickVal(a, b) })}
            />
          </span>
        )
      case 'script':
      default:
        // un script mérite un éditeur : coloration, numéros de ligne, mono
        return (
          <div className={styles.scriptBox} onClick={(e) => e.stopPropagation()}>
            <CodeEditor
              minRows={3}
              value={step.script}
              onChange={(v) => patchStep(step.id, { script: v })}
              placeholder="return window.localStorage.getItem('token')"
            />
          </div>
        )
    }
  }

  /** Ce que la cible implique, dit une fois, sur le step. */
  const targetNote = (step: SetStep): ReactNode => {
    switch (step.target.kind) {
      case 'new':
        return 'Available in the steps that follow this one.'
      case 'local':
        return `Overwrites the variable set at step ${
          originStep(step.target.name) ?? '?'
        }, for the steps that follow.`
      case 'global':
      default:
        return 'Writes the value back to Configurations, for every test that uses this variable.'
    }
  }

  /* ---------------- menu d'actions (popover produit) ---------------- */
  /**
   * Choix d'une action. Les deux items de la catégorie Variables sont ce qui
   * pilote la nature de la cible : Set local variable → locale, Update global
   * variable → globale. Le sélecteur de cible s'ajuste ensuite.
   */
  const chooseAction = (step: Step, label: string) => {
    // Changer d'action CONVERTIT le step : un Click qui devient Set local
    // variable doit gagner sa cible et sa valeur, pas juste un autre libellé.
    const next: Step =
      label === SET_LOCAL
        ? step.kind === 'set' && step.target.kind !== 'global'
          ? step
          : toSetStep(step, { kind: 'new', name: '' })
        : label === UPDATE_GLOBAL
          ? toSetStep(step, { kind: 'global', name: globals[0].name })
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
          <Select size="s" width="110px" options={toOptions(['GET', 'POST', 'PUT', 'DELETE'])} value={step.method} />
        </div>
        {/* l'URL est sur sa propre ligne, sous l'action et la méthode */}
        <div className={styles.urlRow}>
          {varInput(step.url, (v) => patchApi(step.id, { url: v }), step.n, 'URL')}
        </div>
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
      </div>,
    )

  const setCard = (step: SetStep) => {
    const label = setStepLabel(step.target)
    // Ligne 1 : l'action et la cible. Ligne 2 : la valeur, en lecture seule.
    return stepShell(
      step.n,
      <>
        <div className={`${chrome.stepTop} ${styles.setRow}`}>
          <span className={sel === step.n ? chrome.stepNumActive : chrome.stepNum}>{step.n}</span>
          {actionMenu(step, label)}
          {targetSelector(step)}
        </div>
        {/* la valeur prend sa propre ligne, comme celle d'un Fill input : en
            lecture seule ici, elle s'édite dans le panneau du step. */}
        <div className={styles.urlRow}>
          <span
            className={styles.summary}
            onClick={(e) => {
              e.stopPropagation()
              setSel(step.n)
              setStepTab('general')
            }}
            title="Edit the value in the step panel"
          >
            <span className={styles.sumSource}>{sourceLabel(step.source)}</span>
            {stepValue(step) ? (
              <span className={styles.sumVal}>{stepValue(step)}</span>
            ) : (
              <span className={styles.sumEmpty}>No value yet</span>
            )}
          </span>
        </div>
      </>,
    )
  }

  /* ---------------- panneau : Environment ---------------- */
  /** Step qui met à jour cette globale (l'affectation reste sur le step). */
  const writerStep = (name: string) =>
    steps.find((s) => s.kind === 'set' && s.target.kind === 'global' && s.target.name === name)?.n

  /**
   * Mêmes tables que la tab Variables du proto `checks` (outTable / outHeadRow /
   * outDataRow, pastille Tag + IconBraces), pour rester dans l'UI existante.
   */
  const environmentTab = () => (
    <div className={chrome.varsPane}>
      <div className={chrome.varsSection} data-tour="env-inputs">
        <div className={chrome.outTable}>
          <div className={chrome.outHeadRow}>
            <div className={chrome.outHeadCell}>In-test inputs ({inputs.length})</div>
            <div className={chrome.outHeadCell}>Values</div>
          </div>
          {inputs.map((v, i) => (
            <div key={v.id} className={`${chrome.outDataRow} ${styles.varRow}`}>
              <div className={`${chrome.outNameCell} ${styles.editable}`}>
                <Tag color="orange" size="sm" icon={IconBraces} />
                {/* le nom s'édite : c'est ce qui rend « Add input » utile */}
                <Input
                  size="s"
                  mono
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
        <div className={chrome.addWrap}>
          <Button
            color="secondary" size="s" onClick={addInput}
          >
            <Button.Icon icon={IconPlus} />
            Add input
          </Button>
        </div>
      </div>

      <div className={chrome.outTable} data-tour="env-globals">
        <div className={chrome.gvHeadRow}>Global variables ({globals.length})</div>
        {globals.map((g, i) => {
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
        })}
      </div>

    </div>
  )

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
        : [{ key: 'variables', label: 'Variables', children: stepVariablesTab(step) }]),
      { key: 'checks', label: 'Checks', children: <div className={chrome.tabPlaceholder}>Checks</div> },
      { key: 'advanced', label: 'Advanced settings', children: stepAdvancedTab() },
    ]
    return (
      <>
        <div className={chrome.panelHeader}>
          <span className={chrome.panelTitleNum}>{n}</span>
          <span className={chrome.panelTitle}>{title}</span>
          <div className={chrome.panelHeaderActions}>
            <Button color="secondary" size="s"><Button.Icon icon={IconMoreHorizontal} /></Button>
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
   * General : la définition de la variable (source + valeur) vit ICI, dans le
   * panneau DU STEP. Ce n'est pas « en amont » : le panneau du test (Environment)
   * garde les seules entrées et globales, et la carte n'affiche qu'un résumé.
   */
  const stepGeneralTab = (step: Step) => (
    <>
      {step.kind === 'set' && (
        <div className={styles.defBlock}>
          {/* la portée d'abord : elle cadre ce qu'on va régler en dessous.
              `invisible` = le gris neutre du DS, `secondary` tire sur le vert. */}
          <div className={styles.noteBanner}>
            <Banner
              variant="invisible"
            >
              <Banner.Description>{targetNote(step)}</Banner.Description>
            </Banner>
          </div>
          <div className={styles.defRow}>
            <div className={styles.defLabel}>Source</div>
            <Select
              size="s"
              width="200px"
              options={SOURCES.map((s) => ({ label: s.label, value: s.value }))}
              value={step.source}
              onChange={(a: unknown, b: unknown) =>
                patchStep(step.id, { source: (pickVal(a, b) || 'static') as Source })
              }
            />
          </div>
          <div className={styles.defRow}>
            <div className={styles.defLabel}>Value</div>
            <div className={styles.defField}>{valueControl(step)}</div>
          </div>
          {/* Banner neutre du DS plutôt qu'une note maison */}
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
   * « où est passée la table Output variables ? » — l'affectation est éditée
   * sur le step, le panneau ne fait que la refléter.
   */
  /** Variables citées par un step, dans l'ordre d'apparition. */
  const usedVars = (step: Step): string[] => {
    const texts =
      step.kind === 'ui'
        ? [step.locator, step.value ?? '']
        : step.kind === 'api'
          ? [step.url]
          : [stepValue(step)]
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
  const stepVariablesTab = (step: Step) => {
    const used = usedVars(step)
    if (!used.length) {
      return <div className={chrome.tabPlaceholder}>This step does not use a variable</div>
    }
    return (
      <div className={chrome.varsPane}>
        <div className={chrome.outTable}>
          <div className={chrome.outHeadRow}>
            <div className={chrome.outHeadCell}>Variables used ({used.length})</div>
            <div className={chrome.outHeadCell}>Values</div>
          </div>
          {used.map((name) => {
            const nature = natureOf(name)
            const inputIndex = inputs.findIndex((v) => v.name === name)
            const globalIndex = globals.findIndex((g) => g.name === name)
            const from = originStep(name)
            return (
              <div key={name} className={`${chrome.outDataRow} ${styles.varRow}`}>
                <div className={chrome.outNameCell}>
                  <Tag
                    color={nature === 'input' ? 'orange' : nature === 'global' ? 'dark-blue' : 'blue'}
                    size="sm"
                    icon={IconBraces}
                  />
                  <span className={chrome.outName}>{name}</span>
                </div>
                <div className={`${chrome.outValCell} ${styles.valCell} ${styles.editable}`}>
                  {nature === 'local' ? (
                    /* une locale n'a pas de valeur ici : elle vient de son step */
                    <button
                      type="button"
                      className={styles.envLink}
                      onClick={() => from != null && gotoStep(from)}
                    >
                      <IconBraces size={11} /> Set at step {from ?? '?'}
                    </button>
                  ) : inputIndex >= 0 ? (
                    <Input
                      size="s"
                      mono
                      fullWidth
                      borderless
                      type={inputs[inputIndex].secret ? 'password' : 'text'}
                      value={inputs[inputIndex].value}
                      onChange={(e) => patchInput(inputIndex, { value: e.target.value })}
                    />
                  ) : globalIndex >= 0 ? (
                    <Input
                      size="s"
                      mono
                      fullWidth
                      borderless
                      value={globals[globalIndex].value}
                      onChange={(e) =>
                        setGlobals((cur) =>
                          cur.map((x, j) => (j === globalIndex ? { ...x, value: e.target.value } : x)),
                        )
                      }
                    />
                  ) : (
                    <span className={styles.sumEmpty}>Generated when the run starts</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
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
  const createInputModal = () => {
    if (!newInput) return null
    const close = () => setNewInput(null)
    const create = () => {
      const name = newInput.name.trim()
      if (!name) return
      setInputs((curr) => [
        ...curr,
        {
          id: `in-${name}-${curr.length}`,
          name,
          value: newInput.value,
          secret: newInput.secret,
        },
      ])
      newInput.insert(name, TAG_COLOR.orange)
      close()
    }
    return (
      <Modal open width={620} title="Create in-test variable" onCancel={close}>
        <Modal.Content>
          <div className={cv.cvBody}>
            <div className={styles.noteBanner}>
              <Banner
                variant="invisible"
              >
                <Banner.Description>Available in this test only.</Banner.Description>
              </Banner>
            </div>
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
                  value={newInput.name}
                  onChange={(e) =>
                    setNewInput({ ...newInput, name: e.target.value.replace(/\s/g, '') })
                  }
                />
                <span className={cv.cvBrace}>{'}'}</span>
              </span>
              <span className={cv.cvHint}>No spaces or other special characters allowed.</span>
            </div>
            <div className={cv.cvField}>
              <label className={cv.cvLabel} htmlFor="ci-value">
                Value
              </label>
              <Input
                size="l"
                fullWidth
                name="ci-value"
                placeholder="Enter value"
                type={newInput.secret ? 'password' : 'text'}
                value={newInput.value}
                onChange={(e) => setNewInput({ ...newInput, value: e.target.value })}
              />
            </div>
            <Checkbox
              identifier="ci-secret"
              border={false}
              label="Hide this value"
              checked={newInput.secret}
              onChange={(e) => setNewInput({ ...newInput, secret: e.target.checked })}
            />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={cv.cvFooter}>
            <Button color="invisible" onClick={close}>
              Cancel
            </Button>
            <Button color="primary" disabled={!newInput.name.trim()} onClick={create}>
              Create
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
              <Button color="secondary" size="m"><Button.Icon icon={IconLock} /></Button>
              <Button color="secondary" size="m"><Button.Icon icon={IconMonitor} /></Button>
              <Button color="secondary" size="m"><Button.Icon icon={IconStar} /></Button>
              <Button color="danger-s" size="m"><Button.Icon icon={IconTrash} /></Button>
            </ButtonGroup>
            <Button
              color="secondary" size="m"
            >
              <Button.Icon icon={IconSave} />
              Save
            </Button>
            <Button
              color="primary" size="m"
            >
              <Button.Icon icon={IconZap} />
              Run
            </Button>
          </div>
        </header>

        <div className={chrome.body}>
          <div className={chrome.canvas} data-tour="canvas" onClick={() => setSel(null)}>
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
                          if (open && sel != null && steps.some((s) => s.n === sel && s.group === g.n)) {
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
                            <IconMoreHorizontal size={18} />
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
                            <Button
                              color="invisible" size="s"
                            >
                              <Button.Icon icon={IconPlus} />
                              Add step…
                            </Button>
                            <Button
                              color="secondary" size="s"
                            >
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
          <aside className={chrome.panel} data-tour="panel">
            {sel !== null ? (
              stepPanel(sel)
            ) : (
              <Tabs
                className={chrome.panelTabs}
                type="card"
                activeKey={testTab}
                onChange={setTestTab}
                tabs={[
                  { key: 'preview', label: 'Preview', children: <div className={chrome.tabPlaceholder}>Preview</div> },
                  { key: 'environment', label: 'Environment', children: environmentTab() },
                  { key: 'settings', label: 'Test settings', children: <div className={chrome.tabPlaceholder}>Test settings</div> },
                  { key: 'history', label: 'Version history', children: <div className={chrome.tabPlaceholder}>Version history</div> },
                ]}
              />
            )}
          </aside>
        </div>
      </div>

      {createInputModal()}
    </div>
  )
}

export default VariablesProto
