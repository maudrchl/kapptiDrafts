import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Breadcrumb,
  Button,
  ButtonGroup,
  Checkbox,
  Collapse,
  EmptyState,
  Input,
  SearchInput,
  Modal,
  Popover,
  Select,
  Tabs,
  Tag,
  Tooltip,
  IconBell,
  IconBot,
  IconBraces,
  IconCheck,
  IconChevronDown,
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
  IconMinusCircle,
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
import SlateInputTag from '../checks/slate/SlateInputTag'
import type { Color as TagColor, Suggestions, TagInputValue } from '../checks/slate/SlateInputTag'
import chrome from '../checks/checks.module.scss'
import styles from './variables.module.scss'
import {
  ACTION_GROUPS,
  GLOBALS,
  INITIAL_STEPS,
  INPUTS,
  NATURE_TINT,
  RESPONSE_HEADERS,
  RESPONSE_ROWS,
  RULES,
  SET_LOCAL,
  SOURCES,
  UPDATE_GLOBAL,
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
}

/* Teinte portée par la seule pastille {} (texte laissé neutre). */
const TINT_MARK: Record<Tint, string> = {
  orange: styles.markOrange,
  'light-blue': styles.markLightBlue,
  'dark-blue': styles.markDarkBlue,
}

/* Teinte d'une nature → couleur de tag dans l'input Slate du produit. */
const TAG_COLOR: Record<Tint, TagColor> = {
  orange: 'primary',
  'light-blue': 'light-blue',
  'dark-blue': 'blue',
}

const RAIL_SECTIONS = [
  [IconMonitorCheck, IconEye, IconBell, IconGauge],
  [IconSmartphone, IconMonitorSmartphone, IconZap, IconCheck, IconHistory, IconBraces],
  [IconSmartphone, IconChromium, IconBot],
]

type LocalVar = { name: string; step: number }

const VariablesProto = () => {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [inputs, setInputs] = useState(INPUTS)
  /** step sélectionné (null = panneau du test) */
  const [sel, setSel] = useState<number | null>(null)
  const [testTab, setTestTab] = useState('environment')
  /** onglet du panneau d'un step (General / Variables / Checks / Advanced) */
  const [stepTab, setStepTab] = useState('general')
  const [flash, setFlash] = useState<number | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const [targetOpen, setTargetOpen] = useState<string | null>(null)
  const [pathOpen, setPathOpen] = useState<string | null>(null)
  /** menu d'actions : step ouvert, recherche, catégories dépliées */
  const [actionOpen, setActionOpen] = useState<string | null>(null)
  const [actionQuery, setActionQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<string[]>(['popular'])
  const [ignoreError, setIgnoreError] = useState(false)
  const [skipRun, setSkipRun] = useState(false)

  const patchStep = (id: string, next: Partial<SetStep>) =>
    setSteps((cur) =>
      cur.map((s) => (s.id === id && s.kind === 'set' ? ({ ...s, ...next } as SetStep) : s)),
    )
  const patchApi = (id: string, next: { url?: string; action?: string }) =>
    setSteps((cur) => cur.map((s) => (s.id === id && s.kind === 'api' ? { ...s, ...next } : s)))

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
    GLOBALS.some((g) => g.name === name)
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
      <SlateInputTag
        fullWidth
        value={toSegments(value)}
        onChange={(segs) =>
          onValue(fromSegments(typeof segs === 'function' ? segs(toSegments(value)) : segs))
        }
        suggestions={suggestionsFor(stepNumber)}
        placeholder={placeholder}
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
  const suggestionsFor = (n: number): Suggestions[] => {
    const avail = localsBefore(n)
    return [
      ...(avail.length
        ? [
            {
              name: 'Local variables',
              key: 'previous_steps' as const,
              suggestions: avail.map((l, i) => ({
                id: `loc${i}`,
                label: optLabel(l.name, 'local', l.step),
                color: TAG_COLOR['light-blue'],
                value: l.name,
                technicalName: l.name,
              })),
            },
          ]
        : []),
      {
        name: 'In-test inputs',
        key: 'built_in' as const,
        suggestions: inputs.map((v, i) => ({
          id: `in${i}`,
          label: optLabel(v.name, 'input'),
          color: TAG_COLOR.orange,
          value: v.name,
          technicalName: v.name,
        })),
      },
      {
        name: 'Global variables',
        key: 'variables' as const,
        suggestions: GLOBALS.map((v, i) => ({
          id: `gl${i}`,
          label: optLabel(v.name, 'global'),
          color: TAG_COLOR['dark-blue'],
          value: v.name,
          technicalName: v.name,
        })),
      },
    ]
  }

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
     * Le menu de cible suit l'ACTION choisie : « Update global variable » ne
     * propose que des globales, « Set local variable » ne propose que des
     * locales (nouvelle ou existante). Une action, une famille de cible.
     */
    const content =
      t.kind === 'global' ? (
        <div className={styles.targetPop}>
          <div className={styles.popGroup}>
            <div className={styles.popGroupHead}>Global variables</div>
            {GLOBALS.map((g) =>
              item(
                optLabel(g.name, 'global'),
                t.name === g.name,
                () => setTarget(step, 'global', g.name),
                `gl-${g.name}`,
              ),
            )}
            <div className={styles.popHint}>Writes the new value back to Configurations.</div>
          </div>
        </div>
      ) : (
        <div className={styles.targetPop}>
          <div className={styles.popGroup}>
            <div className={styles.popGroupHead}>Create</div>
            {item(
              <span className={styles.opt}>
                <span className={`${styles.optIcon} ${styles.tintLightBlue}`}>
                  <IconPlus size={12} />
                </span>
                <span className={styles.optName}>New local variable</span>
              </span>,
              t.kind === 'new',
              () => setTarget(step, 'new'),
              'new',
            )}
            <div className={styles.popHint}>
              Lives on this step, available in the steps that follow.
            </div>
          </div>

          {avail.length > 0 && (
            <div className={styles.popGroup}>
              <div className={styles.popGroupHead}>Local variables</div>
              {avail.map((l) =>
                item(
                  optLabel(l.name, 'local', l.step),
                  t.kind === 'local' && t.name === l.name,
                  () => setTarget(step, 'local', l.name),
                  `loc-${l.name}`,
                ),
              )}
              <div className={styles.popHint}>Reassigns a local variable set earlier.</div>
            </div>
          )}
        </div>
      )
    /**
     * Une seule commande pour la cible, pour tenir sur la ligne du step :
     * nouvelle locale → champ { nom } éditable, cible existante → pastille.
     * Le chevron ouvre le sélecteur dans les deux cas.
     */
    return (
      <span className={styles.targetSlot} onClick={(e) => e.stopPropagation()}>
        {/* la pastille {} porte la teinte de la nature, le texte reste neutre */}
        <span className={`${styles.slotMark} ${TINT_MARK[NATURE_TINT[targetNature(t.kind)]]}`}>
          <IconBraces size={12} />
        </span>
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
      <Tooltip content="Pick from the last response">
        <span>
          <Button color="secondary" size="s" icon={IconCode} />
        </span>
      </Tooltip>
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
        return (
          <textarea
            className={styles.scriptBox}
            placeholder="return response.body.order.reference"
            value={step.script}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => patchStep(step.id, { script: e.target.value })}
          />
        )
    }
  }

  /** Ce que la cible implique, dit une fois, sur le step. */
  const targetNote = (step: SetStep): ReactNode => {
    switch (step.target.kind) {
      case 'new':
        return `This local variable exists from step ${step.n} on, in the value picker of the steps that follow.`
      case 'local':
        return `Reassigns the local variable created at step ${
          originStep(step.target.name) ?? '?'
        }. Same action, only the target changes.`
      case 'global':
      default:
        return 'Updates the global variable in Configurations, for every test that uses it.'
    }
  }

  /* ---------------- menu d'actions (popover produit) ---------------- */
  /**
   * Choix d'une action. Les deux items de la catégorie Variables sont ce qui
   * pilote la nature de la cible : Set local variable → locale, Update global
   * variable → globale. Le sélecteur de cible s'ajuste ensuite.
   */
  const chooseAction = (step: Step, label: string) => {
    if (step.kind === 'set' && label === SET_LOCAL) {
      patchStep(step.id, { target: { kind: 'new', name: '' } })
    } else if (step.kind === 'set' && label === UPDATE_GLOBAL) {
      patchStep(step.id, { target: { kind: 'global', name: GLOBALS[0].name } })
    } else if (step.kind === 'api') {
      patchApi(step.id, { action: label })
    }
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
      <div className={chrome.stepCard}>{children}</div>
    </div>
  )

  const apiCard = (step: Step & { kind: 'api' }) =>
    stepShell(
      step.n,
      <>
        <div className={chrome.stepTop} onClick={(e) => e.stopPropagation()}>
          <span className={sel === step.n ? chrome.stepNumActive : chrome.stepNum}>{step.n}</span>
          {actionMenu(step, step.action)}
          <Select size="s" width="110px" options={toOptions(['GET', 'POST', 'PUT', 'DELETE'])} value={step.method} />
        </div>
        {/* l'URL est sur sa propre ligne, sous l'action et la méthode */}
        <div className={styles.urlRow} onClick={(e) => e.stopPropagation()}>
          {varInput(step.url, (v) => patchApi(step.id, { url: v }), step.n, 'URL')}
        </div>
      </>,
    )

  const setCard = (step: SetStep) => {
    const label = setStepLabel(step.target)
    // Tout tient sur la ligne du step : action, cible, = , source, valeur.
    return stepShell(
      step.n,
      <>
        <div className={`${chrome.stepTop} ${styles.setRow}`} onClick={(e) => e.stopPropagation()}>
          <span className={sel === step.n ? chrome.stepNumActive : chrome.stepNum}>{step.n}</span>
          {actionMenu(step, label)}
          {targetSelector(step)}
          {/* la carte reste lisible d'un coup d'œil : la valeur est un résumé,
              elle s'édite dans le panneau du step (qui EST le step). */}
          <span className={styles.summary}>
            <span className={styles.eq}>=</span>
            {stepValue(step) ? (
              <>
                <span className={styles.sumChip}>{sourceLabel(step.source)}</span>
                <span className={styles.sumVal}>{stepValue(step)}</span>
              </>
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
      <div className={chrome.varsSection}>
        <div className={chrome.outTable}>
          <div className={chrome.outHeadRow}>
            <div className={chrome.outHeadCell}>In-test inputs ({inputs.length})</div>
            <div className={chrome.outHeadCell}>Values</div>
          </div>
          {inputs.map((v) => (
            <div key={v.name} className={chrome.outDataRow}>
              <div className={chrome.outNameCell}>
                <Tag color="orange" size="sm" icon={IconBraces} />
                <span className={chrome.outName}>{v.name}</span>
              </div>
              <div className={`${chrome.outValCell} ${styles.valCell}`}>
                <Input
                  size="s"
                  mono
                  fullWidth
                  borderless
                  type={v.secret ? 'password' : 'text'}
                  value={v.value}
                  onChange={(e) =>
                    setInputs((cur) =>
                      cur.map((x) => (x.name === v.name ? { ...x, value: e.target.value } : x)),
                    )
                  }
                />
                <span className={styles.envChip}>{v.origin}</span>
              </div>
              <button className={chrome.outDelCell} aria-label="Remove input">
                <IconMinusCircle size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className={chrome.addWrap}>
          <Button color="secondary" size="s" icon={IconPlus}>
            Add input
          </Button>
        </div>
      </div>

      <div className={chrome.outTable}>
        <div className={chrome.gvHeadRow}>Global variables ({GLOBALS.length})</div>
        {GLOBALS.map((g) => {
          const n = writerStep(g.name)
          return (
            <div key={g.name} className={chrome.outDataRow}>
              <div className={chrome.outNameCell}>
                <Tag color="dark-blue" size="sm" icon={IconBraces} />
                <span className={chrome.outName}>{g.name}</span>
              </div>
              <div className={`${chrome.outValCell} ${styles.valCell}`}>
                <Input size="s" mono fullWidth borderless value={g.value} onChange={() => undefined} />
                {n != null && (
                  <button type="button" className={styles.envLink} onClick={() => gotoStep(n)}>
                    Updated at step {n}
                  </button>
                )}
              </div>
              <span className={chrome.outDelCell} />
            </div>
          )
        })}
      </div>

      {/* Ce que le panneau ne contient PAS, et pourquoi. */}
      <div className={styles.note}>
        <IconInfo size={15} />
        <span>
          <b>No local variables here.</b> They are assigned on their step and show up in the value
          picker of the steps that follow.
        </span>
        <button type="button" className={styles.noteWhy} onClick={() => setWhyOpen(true)}>
          Why?
        </button>
      </div>
    </div>
  )

  /* ---------------- panneau : step sélectionné ---------------- */
  const stepPanel = (n: number) => {
    const step = steps.find((s) => s.n === n)
    if (!step) return null
    const title =
      step.kind === 'set' ? setStepLabel(step.target) : `${step.action} · ${step.method}`
    return (
      <>
        <div className={chrome.panelHeader}>
          <span className={chrome.panelTitleNum}>{n}</span>
          <span className={chrome.panelTitle}>{title}</span>
          <div className={chrome.panelHeaderActions}>
            <Button color="secondary" size="s" icon={IconMoreHorizontal} />
          </div>
        </div>
        <Tabs
          className={chrome.panelTabs}
          type="card"
          activeKey={stepTab}
          onChange={setStepTab}
          tabs={[
            { key: 'general', label: 'General', children: stepGeneralTab(step) },
            { key: 'variables', label: 'Variables', children: stepVariablesTab(step) },
            { key: 'checks', label: 'Checks', children: <div className={chrome.tabPlaceholder}>Checks</div> },
            { key: 'advanced', label: 'Advanced settings', children: stepAdvancedTab() },
          ]}
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
          <div className={styles.defNote}>
            <IconInfo size={14} />
            <span>{targetNote(step)}</span>
          </div>
        </div>
      )}
      <div className={styles.refBlock}>
        <div className={styles.refLabel}>Reference screenshot</div>
        {/* EmptyState du DS */}
        <div className={styles.refEmpty}>
          <EmptyState text="No reference screenshot available for this step" />
        </div>
      </div>
    </>
  )

  /**
   * Variables : ce que le step affecte, en lecture. C'est la réponse à
   * « où est passée la table Output variables ? » — l'affectation est éditée
   * sur le step, le panneau ne fait que la refléter.
   */
  const stepVariablesTab = (step: Step) => {
    if (step.kind !== 'set') {
      return <div className={chrome.tabPlaceholder}>This step does not set a variable</div>
    }
    return (
      <div className={styles.stepPane}>
        <div className={styles.recap}>
          <div className={styles.recapRow}>
            <span className={styles.recapLabel}>Target</span>
            <span>
              {step.target.kind === 'new'
                ? step.name
                  ? pill(step.name, { step: step.n, clickable: false })
                  : '—'
                : pill(step.target.name, {
                    step: step.target.kind === 'local' ? originStep(step.target.name) : undefined,
                    clickable: false,
                  })}
            </span>
          </div>
          <div className={styles.recapRow}>
            <span className={styles.recapLabel}>Nature</span>
            <span className={styles.recapValue}>
              {step.target.kind === 'global'
                ? 'Global variable, from Configurations'
                : `Local variable, assigned at step ${step.n}`}
            </span>
          </div>
          <div className={styles.recapRow}>
            <span className={styles.recapLabel}>Source</span>
            <span className={styles.recapValue}>{sourceLabel(step.source)}</span>
          </div>
          <div className={styles.recapRow}>
            <span className={styles.recapLabel}>Value</span>
            <span className={styles.recapValue}>{stepValue(step) || '—'}</span>
          </div>
        </div>
        <div className={styles.note}>
          <IconInfo size={15} />
          <span>
            <b>Edited on the step.</b>{' '}
            {step.target.kind === 'new'
              ? 'The panel keeps the test interface: in-test inputs and globals.'
              : `The panel lists ${step.target.name}, the assignment stays on this step.`}
          </span>
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
            <Breadcrumb items={[{ title: 'Tests' }, { title: 'Checkout' }]} />
          </div>
          <div className={chrome.topActions}>
            <ButtonGroup>
              <Button color="secondary" size="m" icon={IconLock} />
              <Button color="secondary" size="m" icon={IconMonitor} />
              <Button color="secondary" size="m" icon={IconStar} />
              <Button color="danger-s" size="m" icon={IconTrash} />
            </ButtonGroup>
            <Button color="secondary" size="m" icon={IconSave}>
              Save
            </Button>
            <Button color="primary" size="m" icon={IconZap}>
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

              <span className={chrome.connector} />

              <div className={chrome.stepGroup}>
                <div className={chrome.stepGroupHead}>
                  <span className={chrome.stepGroupMark}>
                    <IconColouredLogo size={32} />
                  </span>
                  <div>
                    <div className={chrome.stepGroupTitle}>Login and place an order</div>
                    <div className={chrome.stepGroupSub}>{steps.length} steps</div>
                  </div>
                  <button className={chrome.stepGroupMore}>
                    <IconMoreHorizontal size={18} />
                  </button>
                </div>

                {steps.map((s, i) => (
                  <div key={s.id}>
                    {i > 0 && <div className={chrome.stepSep} />}
                    {s.kind === 'api' ? apiCard(s) : setCard(s)}
                  </div>
                ))}

                <div className={chrome.stepFooter}>
                  <Button color="invisible" size="s" icon={IconPlus}>
                    Add step…
                  </Button>
                  <Button color="secondary" size="s" icon={IconPlay}>
                    Use recorder
                  </Button>
                </div>
              </div>

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

      {whyOpen && (
        <Modal open width={560} title="What changed" onCancel={() => setWhyOpen(false)}>
          <Modal.Content>
            <div className={styles.rules}>
              {RULES.map((r, i) => (
                <div key={r.title} className={styles.rule}>
                  <span className={styles.ruleNum}>{i + 1}</span>
                  <div>
                    <div className={styles.ruleTitle}>{r.title}</div>
                    <div className={styles.ruleBody}>{r.body}</div>
                  </div>
                </div>
              ))}
              <div className={styles.legend}>
                <span className={styles.legendItem}>
                  {pill('email')} in-test input
                </span>
                <span className={styles.legendItem}>
                  {pill('authToken', { step: 2, clickable: false })} local variable
                </span>
                <span className={styles.legendItem}>
                  {pill('URL')} global variable
                </span>
              </div>
            </div>
          </Modal.Content>
        </Modal>
      )}
    </div>
  )
}

export default VariablesProto
