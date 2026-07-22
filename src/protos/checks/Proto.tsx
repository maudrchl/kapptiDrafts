import { useState, useEffect, type Dispatch, type SetStateAction, type ReactNode } from 'react'
import {
  Select,
  Input,
  SearchInput,
  Button,
  ButtonGroup,
  Breadcrumb,
  Dropdown,
  ContextMenu,
  Tabs,
  Checkbox,
  Table,
  Tag,
  Text,
  Toggle,
  Modal,
  Popover,
  IconChevronDown,
  IconColouredLogo,
  IconSquareArrowOutUpRight,
  IconMonitorCheck,
  IconSparkle,
  IconEye,
  IconBell,
  IconGauge,
  IconCommand,
  IconMonitor,
  IconMonitorSmartphone,
  IconHistory,
  IconBraces,
  IconSmartphone,
  IconChromium,
  IconBot,
  IconInfo,
  IconChevronRight,
  IconMoreVertical,
  IconZap,
  IconLock,
  IconStar,
  IconTrash,
  IconMinusCircle,
  IconSave,
  IconFlag,
  IconGlobe,
  IconMail,
  IconFile,
  IconNetwork,
  IconPlay,
  IconPlus,
  IconMoreHorizontal,
  IconCopy,
  IconCheck,
  IconCalendar,
  IconTimer,
  IconListFilter,
  IconCornerDownLeft,
  IconArrowRightFromLine,
  IconPencil,
} from '@kapptivate/ui-kit'
import { useReportScreen, useScreenNavigation } from '../../context/ScreenContext'
import SlateInputTag, { type TagInputValue, type Suggestions } from './slate/SlateInputTag'
import styles from './checks.module.scss'
import {
  INITIAL_CONDITIONS,
  MAIL_INITIAL_CONDITIONS,
  PDF_INITIAL_CONDITIONS,
  SUBJECTS,
  MAIL_SUBJECTS,
  PDF_SUBJECTS,
  NUM_OPS,
  UNITS,
  predsFor,
  predNeedsValue,
  resetForKind,
  conditionText,
  type Condition,
  type Severity,
} from './constants'

let uid = 100
const nextId = () => `c${++uid}`

// Historique d'exécutions (panneau test → Preview), statique pour le proto.
const EXECUTIONS = [
  { id: '#290', status: 'warn', date: '13/07/2026 - 05:37:53 PM', dur: '29s' },
  { id: '#289', status: 'ok', date: '13/07/2026 - 05:32:57 PM', dur: '29s' },
  { id: '#288', status: 'ok', date: '13/07/2026 - 05:19:38 PM', dur: '28s' },
]

// Variables tab: output variables (produites) + variables consommées.
// Source = méthode d'extraction depuis la réponse (cf. proto Figma « output variable »).
const OUT_SOURCES = [
  { label: 'JSON attribute', value: 'json' },
  { label: 'Header', value: 'header' },
  { label: 'Status code', value: 'status' },
  { label: 'Full body', value: 'body' },
]
// Variables globales réellement définies dans le test (cf. table Global variables).
const GLOBAL_VARS = ['URL']

// Dernière réponse du step (exemple), sert à générer le JSONPath au clic,
// pour éviter d'écrire le langage à la main (retour client).
const SAMPLE_RESPONSE = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBZGEgTG92ZWxhY2UifQ.s3cr3tS1gn4tur3',
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_token: 'rt_9f8c2a1b7d6e5f4a3b2c1d0e',
  scope: 'read write admin',
  user: {
    id: 42,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    verified: true,
    roles: ['admin', 'qa'],
    plan: 'enterprise',
    address: { street: '12 Analytical Ave', city: 'London', zip: 'EC1A 1BB', country: 'UK' },
    preferences: { theme: 'dark', language: 'en', notifications: true },
  },
  organization: {
    id: 'org_7781',
    name: 'Rocket Corp',
    seats: 120,
    owner_id: 42,
  },
  orders: [
    { id: 'ORD-001', total: 42.5, currency: 'EUR', status: 'paid', items: 3 },
    { id: 'ORD-002', total: 18.0, currency: 'EUR', status: 'pending', items: 1 },
    { id: 'ORD-003', total: 99.9, currency: 'USD', status: 'refunded', items: 5 },
  ],
  meta: {
    request_id: 'req_5c2e9a',
    page: 1,
    per_page: 20,
    total: 57,
    took_ms: 128,
  },
}
type RespRow = { path: string; label: string; preview: string; raw?: string; depth: number; leaf: boolean }
const fmtVal = (v: any): string => (typeof v === 'string' ? `"${v}"` : String(v))
const buildRespRows = (obj: any, prefix = '$', depth = 0, out: RespRow[] = []): RespRow[] => {
  const entries: [string, any][] = Array.isArray(obj)
    ? obj.map((v, i) => [`[${i}]`, v])
    : Object.entries(obj)
  entries.forEach(([k, v]) => {
    const isIndex = k.startsWith('[')
    const path = isIndex ? `${prefix}${k}` : `${prefix}.${k}`
    if (v && typeof v === 'object') {
      out.push({ path, label: k, preview: Array.isArray(v) ? `[${v.length}]` : '{ }', depth, leaf: false })
      buildRespRows(v, path, depth + 1, out)
    } else {
      out.push({ path, label: k, preview: fmtVal(v), raw: String(v), depth, leaf: true })
    }
  })
  return out
}
const RESPONSE_ROWS = buildRespRows(SAMPLE_RESPONSE)

const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }))
const optVal = (v: any): string => (v && typeof v === 'object' ? v.value : v)
const ACTION_OPTIONS = ['API Call', 'Get mail', 'Read PDF', 'Navigate', 'Click', 'Fill in', 'Assert', 'Wait']
const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// ---- type des tables clé/valeur (Headers / Query parameters) ----
type KV = { id: string; k: string; v: string }
// ---- terme d'une expression numérique (membre droit d'un check num) ----
// op = opérateur AVANT ce terme (ignoré pour le premier) ; kind num = littéral, var = variable.
type Term = { id: string; op: string; kind: 'num' | 'var'; value: string }
const EXPR_OPS = ['+', '−', '×', '÷']
// ---- output variables (produites par le step) ----
// source/path servent à la modale d'édition ; last = dernière valeur (affichée masquée)
type OutVar = { id: string; name: string; source: string; path: string; last: string }
// Brouillon de la modale Add/Edit output variable (cf. Figma « output variable »).
type OutDraft = OutVar & { target: 'new' | 'global'; defaultOn: boolean; defaultVal: string }

const ChecksProto = () => {
  const [tab, setTab] = useState('checks')
  const [failLogic, setFailLogic] = useState<'and' | 'or'>('and')
  const [warnLogic, setWarnLogic] = useState<'and' | 'or'>('and')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropSev, setDropSev] = useState<Severity | null>(null)
  // Sélection de la step (1 = API Call, 2 = Get mail, 3 = Check PDF ; null = panneau test).
  const [selStep, setSelStep] = useState<number | null>(1)
  const stepSelected = selStep !== null
  // Onglet du panneau test (affiché quand aucune step n'est sélectionnée).
  const [testTab, setTestTab] = useState('preview')
  // Conditions par step.
  const [condsByStep, setCondsByStep] = useState<Record<number, Condition[]>>(() => ({
    1: INITIAL_CONDITIONS.map((c) => ({ ...c })),
    2: MAIL_INITIAL_CONDITIONS.map((c) => ({ ...c })),
    3: PDF_INITIAL_CONDITIONS.map((c) => ({ ...c })),
  }))
  const activeStep = selStep ?? 1
  const conds = condsByStep[activeStep] ?? []
  const setConds = (updater: Condition[] | ((cur: Condition[]) => Condition[])) =>
    setCondsByStep((cur) => ({
      ...cur,
      [activeStep]: typeof updater === 'function' ? updater(cur[activeStep] ?? []) : updater,
    }))
  // Sujets proposés selon le step : réponse HTTP (API), email (Get mail) ou PDF (Read PDF).
  const stepSubjects =
    activeStep === 2 ? MAIL_SUBJECTS : activeStep === 3 ? PDF_SUBJECTS : SUBJECTS
  const respTabLabel = activeStep === 2 ? 'Message' : activeStep === 3 ? 'File' : 'Response'
  const [method, setMethod] = useState('GET')
  const [action, setAction] = useState('API Call')
  const [action2, setAction2] = useState('Get mail')
  const [action3, setAction3] = useState('Read PDF')
  // Fichier source du step Read PDF (nom du fichier à lire).
  const [pdfSource, setPdfSource] = useState('')
  const [mailbox, setMailbox] = useState('')
  const [startUrl, setStartUrl] = useState('https://kapptivate.com')
  // Texte éditable saisi APRÈS le tag variable {{URL}} dans les champs du canvas.
  const [navPath, setNavPath] = useState('')
  const [apiPath, setApiPath] = useState('')

  // ---- General tab (sous-onglets Headers / Body / Query Parameters) ----
  const emptyRow = (): KV => ({ id: nextId(), k: '', v: '' })
  const [genTab, setGenTab] = useState('headers')
  const [headers, setHeaders] = useState<KV[]>(() => [emptyRow()])
  const [queryParams, setQueryParams] = useState<KV[]>(() => [emptyRow()])
  const [body, setBody] = useState('')

  // Les Query Parameters pilotent la query string de l'URL de l'API Call :
  // on reconstruit `?k=v&...` à chaque modif en gardant la partie chemin.
  useEffect(() => {
    setApiPath((prev) => {
      const base = prev.split('?')[0]
      const qs = queryParams
        .filter((r) => r.k.trim() !== '')
        .map((r) => `${r.k.trim()}=${r.v.trim()}`)
        .join('&')
      return qs ? `${base}?${qs}` : base
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  // ---- Variables tab : output variables + modale Add/Edit ----
  const [outVars, setOutVars] = useState<OutVar[]>(() => [
    { id: nextId(), name: 'TOKEN', source: 'json', path: '$.access_token', last: '*******************' },
  ])
  const [outDraft, setOutDraft] = useState<OutDraft | null>(null)
  const [outDraftMode, setOutDraftMode] = useState<'add' | 'edit'>('add')

  // ---- Advanced settings tab (checkboxes) ----
  const [overrideDns, setOverrideDns] = useState(false)
  const [ignoreSsl, setIgnoreSsl] = useState(false)
  const [preserveCookies, setPreserveCookies] = useState(false)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [ignoreError, setIgnoreError] = useState(false)
  const [skipDuringRun, setSkipDuringRun] = useState(false)
  const [addCapabilities, setAddCapabilities] = useState(false)

  // Écran collab : on encode la vue exacte (step + onglet, ou panneau test +
  // onglet) → chaque commentaire est scopé à sa vue, et un clic depuis
  // l'historique/le pin peut la restaurer.
  const screenId = stepSelected ? `check:step${selStep}:${tab}` : `check:test:${testTab}`
  useReportScreen(screenId)

  // Canal inverse : un clic sur un commentaire demande de revenir sur son écran.
  // On parse l'id d'écran et on rétablit la sélection de step + l'onglet.
  const { pendingScreen, clearPendingScreen } = useScreenNavigation()
  useEffect(() => {
    if (!pendingScreen) return
    const step = /^check:step(\d+):(.+)$/.exec(pendingScreen)
    if (step) {
      setSelStep(Number(step[1]))
      setTab(step[2])
    } else {
      const test = /^check:test:(.+)$/.exec(pendingScreen)
      if (test) {
        setSelStep(null)
        setTestTab(test[1])
      }
    }
    clearPendingScreen()
  }, [pendingScreen, clearPendingScreen])

  const patch = (id: string, next: Partial<Condition>) =>
    setConds((cur) => cur.map((c) => (c.id === id ? { ...c, ...next } : c)))
  // Applique un sujet à une condition. Pour un attribut JSON, pré-remplit aussi
  // la valeur attendue avec celle du dernier run (retour Maud).
  const chooseSubject = (condId: string, subj: string) => {
    const base = resetForKind(subj)
    const raw = subj.startsWith('$')
      ? RESPONSE_ROWS.find((r) => r.leaf && r.path === subj)?.raw
      : undefined
    patch(condId, raw != null ? { ...base, val: raw } : base)
    // on repart d'une valeur propre (pas d'ancienne expression additive)
    setRhs((cur) => {
      const n = { ...cur }
      delete n[condId]
      return n
    })
  }
  const remove = (id: string) =>
    setConds((cur) => cur.filter((c) => c.id !== id))
  // Ajoute une condition dans le groupe voulu, avec un sujet par défaut adapté
  // au step (Status code en API, Sender en mail, Extracted text en PDF).
  const add = (sev: Severity) =>
    setConds((cur) => [
      ...cur,
      { id: nextId(), sev, ...resetForKind(stepSubjects[0]?.label ?? 'Status code') } as Condition,
    ])
  // Clic-droit sur un CHECK → menu (réf. du vrai produit) : appliquer ce check à
  // toutes les steps du groupe, ou le supprimer.
  const applyCheckToAll = (fromStep: number, c: Condition) =>
    setCondsByStep((cur) => {
      const next = { ...cur }
      Object.keys(cur).forEach((k) => {
        const s = Number(k)
        if (s !== fromStep) next[s] = [...(cur[s] ?? []), { ...c, id: nextId() }]
      })
      return next
    })
  const deleteCheck = (step: number, id: string) =>
    setCondsByStep((cur) => ({ ...cur, [step]: (cur[step] ?? []).filter((x) => x.id !== id) }))
  const checkMenu = (step: number, c: Condition) => [
    {
      key: 'apply',
      label: 'Apply to all steps in this group',
      icon: <IconCopy size={14} />,
      onClick: () => applyCheckToAll(step, c),
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      icon: <IconTrash size={14} />,
      onClick: () => deleteCheck(step, c.id),
    },
  ]
  // Construit une condition « JSON attribute » à partir d'un path (+ autofill
  // de la valeur depuis le dernier run).
  const condFromPath = (path: string, sev: Severity): Condition => {
    const base = resetForKind(path)
    const raw = RESPONSE_ROWS.find((r) => r.leaf && r.path === path)?.raw
    return { id: nextId(), sev, ...base, ...(raw != null ? { val: raw } : {}) } as Condition
  }
  // Multi-sélection depuis la full view : le 1er attribut remplit la condition
  // courante, chaque attribut suivant crée une nouvelle condition (même
  // sévérité), insérée juste après.
  const addChecksFromPaths = (c: Condition, paths: string[]) => {
    if (!paths.length) return
    chooseSubject(c.id, paths[0])
    if (paths.length === 1) return
    const extra = paths.slice(1).map((p) => condFromPath(p, c.sev))
    setConds((cur) => {
      const i = cur.findIndex((x) => x.id === c.id)
      const next = [...cur]
      next.splice(i + 1, 0, ...extra)
      return next
    })
  }
  const duplicate = (c: Condition) =>
    setConds((cur) => {
      const i = cur.findIndex((x) => x.id === c.id)
      const next = [...cur]
      next.splice(i + 1, 0, { ...c, id: nextId() })
      return next
    })
  // DnD : glisser une condition d'un groupe à l'autre change sa sévérité.
  const dropTo = (sev: Severity) => {
    if (dragId) patch(dragId, { sev })
    setDragId(null)
    setDropSev(null)
  }

  // Croisée Checks × Variables : le sujet d'une condition peut être une
  // variable (produite par le step ou globale) → « {{X}} is exactly … sinon fail ».
  const varNames = Array.from(
    new Set(outVars.map((v) => v.name.trim()).filter(Boolean)),
  )
  // Membre droit des conditions numériques : expression (littéraux + variables + opérateurs).
  // Clé = id de condition ; absent = simple littéral (c.val).
  const [rhs, setRhs] = useState<Record<string, Term[]>>({})
  // Picker de sujet à onglets (Response / Variables), façon popover d'insertion.
  const [subjOpen, setSubjOpen] = useState<string | null>(null)
  const [subjTab, setSubjTab] = useState<'response' | 'variables' | 'json'>('response')
  // Sélecteur JSON attribute en grand (modale, recherche + arbre), PARTAGÉ par
  // les conditions ET la création d'output variable : on stocke le callback de
  // sélection (onPick) plutôt qu'un id de condition.
  const [treePick, setTreePick] = useState<{
    onPick: (path: string) => void
    onPickMany?: (paths: string[]) => void
  } | null>(null)
  const [treeQuery, setTreeQuery] = useState('')
  // Multi-sélection (full view uniquement) : paths cochés.
  const [treeSel, setTreeSel] = useState<string[]>([])
  const openTree = (onPick: (path: string) => void) => {
    setTreeQuery('')
    setTreeSel([])
    setTreePick({ onPick })
  }
  // Ouvre la full view en mode multi : cocher plusieurs attributs → autant de conditions.
  const openTreeMulti = (onPickMany: (paths: string[]) => void) => {
    setTreeQuery('')
    setTreeSel([])
    setTreePick({ onPick: () => {}, onPickMany })
  }

  /* ---------- checks renderers (functions, NOT components → keep input focus) ---------- */
  // Valeur d'une condition <-> segments du SlateInputTag (string `{{name}}texte`).
  const toSegments = (v: string): TagInputValue[] => {
    const segs: TagInputValue[] = []
    const re = /\{\{([^}]+)\}\}/g
    let last = 0
    let m: RegExpExecArray | null
    let i = 0
    while ((m = re.exec(v))) {
      if (m.index > last) segs.push({ type: 'text', value: v.slice(last, m.index) })
      const name = m[1]
      segs.push({
        type: 'tag',
        value: name,
        color: GLOBAL_VARS.includes(name) ? 'blue' : 'primary',
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
  // Label d'une variable dans le picker : pastille {} + nom (façon GlobalVarLabel
  // du produit). Icône orange pour les variables in-test, lavande pour les globales.
  const varOptLabel = (n: string, global: boolean) => (
    <span className={styles.suggVar}>
      <span className={global ? styles.suggVarIcon : styles.suggVarIconOrange}>
        <IconBraces size={12} />
      </span>
      {n}
    </span>
  )
  // Suggestions du picker {} : Previous steps (output = orange) + Variables (globales = bleu).
  const checkSuggestions: Suggestions[] = [
    ...(varNames.length
      ? [
          {
            name: 'Previous steps',
            key: 'previous_steps' as const,
            suggestions: varNames.map((n, i) => ({
              id: `ps${i}`,
              label: varOptLabel(n, false),
              color: 'primary' as const,
              value: n,
              technicalName: n,
            })),
          },
        ]
      : []),
    {
      name: 'Variables',
      key: 'variables' as const,
      suggestions: GLOBAL_VARS.map((n, i) => ({
        id: `gv${i}`,
        label: varOptLabel(n, true),
        color: 'blue' as const,
        value: n,
        technicalName: n,
      })),
    },
  ]
  const sevLabel = (warn: boolean, text: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          flex: 'none',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: warn ? '#d98a00' : '#7c8593',
        }}
      />
      {text}
    </span>
  )
  // Champ de valeur = SlateInputTag (le vrai composant du produit, porté),
  // contraint dans une cellule flexible (sinon il déborde la ligne).
  const valInput = (c: Condition) => (
    <div className={styles.valCell}>
      <SlateInputTag
        borderless
        fullWidth
        value={toSegments(c.val ?? '')}
        onChange={(segs) =>
          patch(c.id, {
            val: fromSegments(typeof segs === 'function' ? segs(toSegments(c.val ?? '')) : segs),
          })
        }
        suggestions={checkSuggestions}
        placeholder="Value"
      />
    </div>
  )

  // Membre droit = expression : littéraux + variables (tags) reliés par opérateurs.
  const exprBuilder = (c: Condition) => {
    const terms: Term[] =
      rhs[c.id] ?? [{ id: `${c.id}-0`, op: '+', kind: 'num', value: c.val ?? '' }]
    const setTerms = (next: Term[]) => setRhs((cur) => ({ ...cur, [c.id]: next }))
    const editTerm = (id: string, p: Partial<Term>) =>
      setTerms(terms.map((t) => (t.id === id ? { ...t, ...p } : t)))
    const addTerm = (kind: 'num' | 'var', value: string) =>
      setTerms([...terms, { id: nextId(), op: '+', kind, value }])
    const removeTerm = (id: string) => {
      const n = terms.filter((t) => t.id !== id)
      setTerms(n.length ? n : [{ id: nextId(), op: '+', kind: 'num', value: '' }])
    }
    return (
      <div className={styles.rhsExpr}>
        {terms.map((t, i) => (
          <span key={t.id} className={styles.rhsTerm}>
            {i > 0 && (
              <Select
                size="s"
                borderless
                className={styles.rhsOp}
                popupClassName={styles.selPopup}
                width="42px"
                minWidth="0"
                options={toOptions(EXPR_OPS)}
                value={t.op}
                onChange={(_e: unknown, v: string) => editTerm(t.id, { op: optVal(v) })}
              />
            )}
            {t.kind === 'num' ? (
              <input
                className={styles.rhsNum}
                placeholder="0"
                value={t.value}
                onChange={(e) => editTerm(t.id, { value: e.target.value })}
              />
            ) : (
              <span className={styles.rhsVar}>
                <span className={styles.subjVarIcon}>{'{}'}</span>
                {t.value}
                <button
                  className={styles.rhsDel}
                  aria-label="Remove term"
                  onClick={() => removeTerm(t.id)}
                >
                  <IconMinusCircle size={13} />
                </button>
              </span>
            )}
          </span>
        ))}
        <Dropdown
          trigger="click"
          placement="bottomLeft"
          menu={{
            onClick: ({ key }: { key: string }) => {
              if (key === 'num') {
                addTerm('num', '')
              } else if (terms.length === 1) {
                // remplacer la valeur unique par la variable (cas courant :
                // "utiliser une variable au lieu du nombre") plutôt qu'ajouter un terme
                setTerms([{ ...terms[0], kind: 'var', value: key }])
              } else {
                addTerm('var', key)
              }
            },
            items: [
              { key: 'num', label: 'Number' },
              ...(varNames.length
                ? [
                    { type: 'divider' as const },
                    ...varNames.map((n) => ({
                      key: n,
                      label: (
                        <span className={styles.rhsVarOpt}>
                          <span className={styles.subjVarIcon}>{'{}'}</span>
                          {n}
                        </span>
                      ),
                    })),
                  ]
                : []),
            ],
          }}
        >
          <button className={styles.rhsAdd} aria-label="Add term">
            <IconPlus size={13} />
          </button>
        </Dropdown>
      </div>
    )
  }

  const exprTail = (c: Condition) => {
    // Check « Verify with AI » : champ Description en langage naturel, border
    // en dégradé pour signaler la vérif IA (pas d'opérateur ni de valeur classique).
    if (c.kind === 'ai') {
      return (
        <div className={styles.aiField}>
          <SlateInputTag
            borderless
            fullWidth
            value={toSegments(c.val ?? '')}
            onChange={(segs) =>
              patch(c.id, {
                val: fromSegments(
                  typeof segs === 'function' ? segs(toSegments(c.val ?? '')) : segs,
                ),
              })
            }
            suggestions={checkSuggestions}
            placeholder="Describe what to verify in plain language…"
          />
        </div>
      )
    }
    if (c.kind === 'num' || c.kind === 'time') {
      return (
        <>
          <Select
            size="s"
            borderless
            popupClassName={styles.selPopup}
            options={toOptions(NUM_OPS)}
            value={c.op ?? '='}
            onChange={(_e: unknown, v: string) => patch(c.id, { op: optVal(v) })}
          />
          {valInput(c)}
          {c.kind === 'time' && (
            <Select
              size="s"
              borderless
              popupClassName={styles.selPopup}
              options={toOptions(UNITS)}
              value={c.unit ?? 'seconds'}
              onChange={(_e: unknown, v: string) => patch(c.id, { unit: optVal(v) })}
            />
          )}
        </>
      )
    }
    // text / body / header
    const preds = predsFor(c.kind)
    const withValue = predNeedsValue(c.pred)
    return (
      <>
        <Select
          size="s"
          borderless
          popupClassName={styles.selPopup}
          {...(withValue || c.kind === 'header'
            ? {}
            : { fullWidth: true, className: styles.grow })}
          options={toOptions(preds)}
          value={c.pred ?? preds[0]}
          onChange={(_e: unknown, v: string) =>
            patch(c.id, { pred: optVal(v), val: predNeedsValue(optVal(v)) ? c.val ?? '' : null })
          }
        />
        {c.kind === 'header' && (
          <Input
            size="s"
            borderless
            width="118px"
            placeholder="Header name"
            value={c.headerName ?? ''}
            onChange={(e) => patch(c.id, { headerName: e.target.value })}
          />
        )}
        {withValue && valInput(c)}
      </>
    )
  }

  // Arbre de la dernière réponse : clic sur un attribut → renvoie son JSONPath.
  // Réutilisé par la modale output ET la 3e tab du picker de check.
  const responseTree = (onPick: (path: string) => void) => (
    <div className={styles.rpBox}>
      <div className={styles.rpList}>
        {RESPONSE_ROWS.map((row) =>
          row.leaf ? (
            <button
              key={row.path}
              className={styles.rpRow}
              style={{ paddingLeft: 10 + row.depth * 14 }}
              onClick={() => onPick(row.path)}
              title={`${row.path} = ${row.preview}`}
            >
              <span className={styles.rpKey}>{row.label}</span>
              <span className={styles.rpVal}>{row.preview}</span>
            </button>
          ) : (
            <div
              key={row.path}
              className={styles.rpNode}
              style={{ paddingLeft: 10 + row.depth * 14 }}
            >
              <span className={styles.rpKey}>{row.label}</span>
              <span className={styles.rpMuted}>{row.preview}</span>
            </div>
          ),
        )}
      </div>
    </div>
  )

  // Sujet du check : popover à onglets Response / Variables / JSON attribute.
  const subjectPicker = (c: Condition) => {
    const isVar = c.subj.startsWith('{{')
    const isPath = c.subj.startsWith('$')
    const pick = (subj: string) => {
      chooseSubject(c.id, subj)
      setSubjOpen(null)
    }
    const responseList = (
      <div className={styles.subjList}>
        {stepSubjects.map((s) => (
          <button key={s.label} className={styles.subjItem} onClick={() => pick(s.label)}>
            {s.label}
          </button>
        ))}
      </div>
    )
    const variablesList = (
      <div className={styles.subjList}>
        {varNames.length === 0 && <div className={styles.subjEmpty}>No variables yet.</div>}
        {varNames.map((n) => (
          <button key={n} className={styles.subjItem} onClick={() => pick(`{{${n}}}`)}>
            <span className={styles.subjVarIcon}>{'{}'}</span>
            {n}
          </button>
        ))}
      </div>
    )
    const content = (
      <div className={styles.subjPop}>
        <Tabs
          type="card"
          activeKey={subjTab}
          onChange={(k) => setSubjTab(k as 'response' | 'variables' | 'json')}
          tabs={[
            { key: 'response', label: respTabLabel, children: responseList },
            { key: 'variables', label: 'Variables', children: variablesList },
            ...(activeStep === 2
              ? []
              : [
                  {
                    key: 'json',
                    label: 'JSON attribute',
                    children: (
                      <div className={styles.jsonTab}>
                        <Button
                          color="secondary"
                          size="s"
                          fullWidth
                          icon={IconSquareArrowOutUpRight}
                          onClick={() => {
                            setSubjOpen(null)
                            openTreeMulti((paths) => addChecksFromPaths(c, paths))
                          }}
                        >
                          Open in full view
                        </Button>
                        {responseTree((path) => pick(path))}
                      </div>
                    ),
                  },
                ]),
          ]}
        />
        {subjTab === 'variables' && (
          <div className={styles.subjFooter}>
            <button className={styles.subjCreate}>
              <IconPlus size={14} /> Create global variable
            </button>
          </div>
        )}
      </div>
    )
    return (
      <Popover
        trigger="click"
        placement="bottomLeft"
        noPadding
        arrow={false}
        open={subjOpen === c.id}
        setOpen={(o) => {
          setSubjOpen(o ? c.id : null)
          if (o) setSubjTab(isVar ? 'variables' : isPath ? 'json' : 'response')
        }}
        content={content}
      >
        <button
          type="button"
          className={isVar ? `${styles.subjTrigger} ${styles.subjTriggerTag}` : styles.subjTrigger}
        >
          {isVar ? (
            // Même tag pilule que dans les inputs (orange in-test / bleu global).
            (() => {
              const name = c.subj.replace(/^\{\{|\}\}$/g, '')
              return (
                <span
                  className={`${styles.viTag} ${
                    GLOBAL_VARS.includes(name) ? styles.viTagBlue : styles.viTagPrimary
                  }`}
                >
                  {name}
                </span>
              )
            })()
          ) : c.kind === 'ai' ? (
            <span className={styles.subjTriggerVar}>
              <IconSparkle size={13} />
              {c.subj}
            </span>
          ) : (
            <span className={styles.subjTriggerLabel}>{c.subj}</span>
          )}
          <IconChevronDown size={14} />
        </button>
      </Popover>
    )
  }

  const expr = (c: Condition) =>
    // Check IA : pas de boîte grise .expr autour (le champ porte déjà le dégradé).
    c.kind === 'ai' ? (
      <div className={styles.exprAi}>
        {subjectPicker(c)}
        {exprTail(c)}
      </div>
    ) : (
      <div className={`${styles.expr} ${styles.exprFill}`}>
        {subjectPicker(c)}
        {exprTail(c)}
      </div>
    )

  const rowMenu = (c: Condition) => (
    <Dropdown
      trigger="click"
      placement="bottomRight"
      menu={{
        onClick: ({ key }: { key: string }) => {
          if (key === 'move') patch(c.id, { sev: c.sev === 'fail' ? 'warn' : 'fail' })
          if (key === 'duplicate') duplicate(c)
          if (key === 'delete') remove(c.id)
        },
        items: [
          {
            key: 'move',
            label: sevLabel(
              c.sev === 'fail',
              c.sev === 'fail' ? 'Move to warnings' : 'Move to success conditions',
            ),
          },
          { type: 'divider' as const },
          { key: 'duplicate', label: 'Duplicate', icon: <IconCopy size={14} /> },
          { type: 'divider' as const },
          { key: 'delete', label: 'Delete', danger: true, icon: <IconTrash size={14} /> },
        ],
      }}
    >
      <button
        className={styles.kebab}
        aria-label="More actions, drag to move between groups"
        title="Drag to move · click for actions"
        draggable
        onDragStart={() => setDragId(c.id)}
        onDragEnd={() => {
          setDragId(null)
          setDropSev(null)
        }}
      >
        <IconMoreVertical size={12} />
      </button>
    </Dropdown>
  )

  // Connecteur logique : seul le 1er select (non-Check-if) est éditable, les
  // suivants héritent (disabled).
  const connSelect = (
    value: 'and' | 'or',
    onSet: (v: 'and' | 'or') => void,
    disabled: boolean,
  ) => (
    <Select
      size="s"
      className={styles.conn}
      popupClassName={styles.selPopup}
      width="56px"
      minWidth="0"
      disabled={disabled}
      options={toOptions(['and', 'or'])}
      value={value}
      onChange={(_e: unknown, v: string) => onSet(optVal(v) as 'and' | 'or')}
    />
  )

  // Chaque groupe = une expression and/or, la conséquence est portée par le
  // groupe → pas de pastille par ligne.
  const groupExpr = (
    c: Condition,
    i: number,
    gLogic: 'and' | 'or',
    setG: (v: 'and' | 'or') => void,
    sev: Severity,
  ) => (
    <div key={c.id} className={styles.cond} data-anchor={`cond-${c.id}`}>
      {i === 0 ? (
        // Deux verbes : « Passes if » = état attendu pour valider (échec sinon) ;
        // « Warns if » = le DÉCLENCHEUR de l'alerte (le step reste passant). Le
        // warning s'écrit donc en négatif/inversé (ex. « Warns if > 10s »), choix
        // de Maud : « Warns if not » faisait trop réfléchir.
        <span className={styles.checkIf}>{sev === 'fail' ? 'Passes if' : 'Warns if'}</span>
      ) : (
        connSelect(gLogic, setG, i > 1)
      )}
      <span className={styles.exprWrap}>{expr(c)}</span>
      {rowMenu(c)}
    </div>
  )

  const fails = conds.filter((c) => c.sev === 'fail')
  const warns = conds.filter((c) => c.sev === 'warn')

  const renderGroup = (sev: Severity) => {
    const list = sev === 'fail' ? fails : warns
    const gLogic = sev === 'fail' ? failLogic : warnLogic
    const setG = sev === 'fail' ? setFailLogic : setWarnLogic
    return (
      <div
        className={`${styles.grp} ${dropSev === sev ? styles.grpDrop : ''}`}
        data-anchor={`checks-${sev === 'fail' ? 'success' : 'warnings'}-s${activeStep}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (dropSev !== sev) setDropSev(sev)
        }}
        onDrop={() => dropTo(sev)}
      >
        <div className={styles.grpHead}>
          <span className={sev === 'fail' ? styles.grpBadgeFail : styles.grpBadgeWarn}>
            <span className={sev === 'fail' ? styles.dotFail : styles.dotWarn} />
            {sev === 'fail' ? 'Success conditions' : 'Warnings'}
          </span>
          <span className={styles.grpNote}>
            {sev === 'fail'
              ? 'the step passes when these are met'
              : 'the step still passes, but flags a warning when these happen'}
          </span>
        </div>
        <div className={styles.condList}>
          {list.length ? (
            list.map((c, i) => groupExpr(c, i, gLogic, setG, sev))
          ) : (
            <div className={styles.grpEmpty}>
              {sev === 'fail' ? 'No success conditions' : 'No warnings'}
            </div>
          )}
        </div>
        {/* Ajout direct dans CE groupe (accès direct, pas de menu) : les checks
            les plus courants sont des success conditions. */}
        <div className={styles.grpAdd}>
          <Button color="secondary" size="s" icon={IconPlus} onClick={() => add(sev)}>
            {sev === 'fail' ? 'Add condition' : 'Add warning'}
          </Button>
        </div>
      </div>
    )
  }

  const checksBody = () => (
    <div className={styles.checksBody} data-anchor={`s${activeStep}-checks`}>
      {renderGroup('fail')}
      <div className={styles.grpDivider} />
      {renderGroup('warn')}
    </div>
  )

  /* ---------- récap des conditions DANS LE FORMULAIRE (canvas) : ligne compacte,
     le clic ouvre l'onglet Checks du panneau de droite ---------- */
  const formSummary = (step: number) => {
    const cs = condsByStep[step] ?? []
    if (cs.length === 0) return null
    const f = cs.filter((c) => c.sev === 'fail')
    const w = cs.filter((c) => c.sev === 'warn')
    return (
      <div className={styles.fmBar}>
        {[...f, ...w].map((c) => (
          <ContextMenu key={c.id} options={checkMenu(step, c)}>
            <button
              type="button"
              className={styles.chip}
              onClick={(e) => {
                e.stopPropagation()
                setSelStep(step)
                setTab('checks')
              }}
              title="Edit checks"
            >
              <span className={c.sev === 'warn' ? styles.dotWarn : styles.dotFail} />
              {conditionText(c)}
            </button>
          </ContextMenu>
        ))}
      </div>
    )
  }

  /* ---------- General / Variables / Advanced (reste de l'XP du panneau) ---------- */

  // Table clé/valeur (Headers / Query parameters), une ligne vide reste
  // toujours en fin pour saisir la suivante.
  const editKv = (setRows: Dispatch<SetStateAction<KV[]>>, id: string, patch: Partial<KV>) =>
    setRows((cur) => {
      let next = cur.map((r) => (r.id === id ? { ...r, ...patch } : r))
      const last = next[next.length - 1]
      if (last && (last.k.trim() !== '' || last.v.trim() !== '')) next = [...next, emptyRow()]
      return next
    })

  const removeKv = (setRows: Dispatch<SetStateAction<KV[]>>, id: string) =>
    setRows((cur) => {
      const next = cur.filter((x) => x.id !== id)
      return next.length ? next : [emptyRow()]
    })

  const kvTable = (rows: KV[], setRows: Dispatch<SetStateAction<KV[]>>) => (
    <div className={styles.kvTable}>
      <div className={`${styles.kvRow} ${styles.kvHead}`}>
        <div className={styles.kvCol}>Key</div>
        <div className={styles.kvCol}>Value</div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className={styles.kvRow}>
          <div className={styles.kvCell}>
            <Input
              size="s"
              borderless
              fullWidth
              mono
              placeholder="Key"
              value={r.k}
              onChange={(e) => editKv(setRows, r.id, { k: e.target.value })}
              iconRight={<IconBraces size={12} />}
            />
          </div>
          <div className={styles.kvCell}>
            <Input
              size="s"
              borderless
              fullWidth
              mono
              placeholder="Value"
              value={r.v}
              onChange={(e) => editKv(setRows, r.id, { v: e.target.value })}
              iconRight={<IconBraces size={12} />}
            />
            <button
              className={styles.kvRemove}
              title="Remove row"
              onClick={() => removeKv(setRows, r.id)}
            >
              <IconMinusCircle size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const genCount = (rows: KV[]) =>
    rows.filter((r) => r.k.trim() !== '' || r.v.trim() !== '').length

  const generalTab = () => {
    // Step Read PDF : General = fichier source (la pièce jointe stockée).
    if (activeStep === 3) {
      return (
        <div className={styles.advPane} data-anchor={`s${activeStep}-general`}>
          <div className={styles.advGroup}>
            <div className={styles.advTitle}>Source file</div>
            <div className={styles.refEmpty}>
              Reads the PDF attachment stored by the previous step. Add checks on its extracted
              text, page count, file name or size below.
            </div>
          </div>
        </div>
      )
    }
    // Step Get mail : General = référence visuelle (pas de request config).
    if (activeStep === 2) {
      return (
        <div className={styles.advPane} data-anchor={`s${activeStep}-general`}>
          <div className={styles.advGroup}>
            <div className={styles.advTitle}>Reference screenshot</div>
            <div className={styles.refEmpty}>No reference screenshot available for this step</div>
          </div>
        </div>
      )
    }
    return (
    <div className={styles.genPane} data-anchor={`s${activeStep}-general`}>
      <div className={styles.subTabs}>
        <button
          className={genTab === 'headers' ? styles.subTabActive : styles.subTab}
          onClick={() => setGenTab('headers')}
        >
          Headers ({genCount(headers)})
        </button>
        <button
          className={genTab === 'body' ? styles.subTabActive : styles.subTab}
          onClick={() => setGenTab('body')}
        >
          Body
        </button>
        <button
          className={genTab === 'query' ? styles.subTabActive : styles.subTab}
          onClick={() => setGenTab('query')}
        >
          Query Parameters ({genCount(queryParams)})
        </button>
      </div>

      {genTab === 'headers' && kvTable(headers, setHeaders)}
      {genTab === 'query' && kvTable(queryParams, setQueryParams)}
      {genTab === 'body' && (
        <textarea
          className={styles.fCode}
          placeholder="Request body…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      )}
    </div>
    )
  }

  const removeOutVar = (id: string) =>
    setOutVars((cur) => cur.filter((v) => v.id !== id))
  const openAddOut = () => {
    setOutDraftMode('add')
    setOutDraft({
      id: nextId(),
      name: '',
      source: 'json',
      path: '',
      last: '',
      target: 'new',
      defaultOn: false,
      defaultVal: '',
    })
  }
  const openEditOut = (r: OutVar) => {
    setOutDraftMode('edit')
    setOutDraft({ ...r, target: 'new', defaultOn: false, defaultVal: '' })
  }
  const saveOutDraft = () => {
    if (!outDraft) return
    const rec: OutVar = {
      id: outDraft.id,
      name: outDraft.name,
      source: outDraft.source,
      path: outDraft.path,
      last: outDraft.last,
    }
    setOutVars((cur) =>
      cur.some((v) => v.id === rec.id) ? cur.map((v) => (v.id === rec.id ? rec : v)) : [...cur, rec],
    )
    setOutDraft(null)
  }
  const patchDraft = (next: Partial<OutDraft>) =>
    setOutDraft((d) => (d ? { ...d, ...next } : d))

  const variablesTab = () => (
    <div className={styles.varsPane} data-anchor={`s${activeStep}-variables`}>
      {/* Global variables: même structure div que Output pour aligner la
          colonne nom (220px) et garder la même compacité. */}
      <div className={styles.outTable}>
        <div className={styles.gvHeadRow}>Global variables</div>
        <div className={styles.gvDataRow}>
          <div className={styles.outNameCell}>
            <Tag color="dark-blue" size="sm" icon={IconBraces} />
            <span className={styles.outName}>URL</span>
          </div>
          <div className={styles.gvValCell}>
            <Input
              size="m"
              borderless
              fullWidth
              placeholder="Enter value..."
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Output variables (produites par le step), cf. Figma 10249:37165 */}
      <div className={styles.varsSection}>
        <div className={styles.outTable}>
          <div className={styles.outHeadRow}>
            <div className={styles.outHeadCell}>Output variables ({outVars.length})</div>
            <div className={styles.outHeadCell}>Last values</div>
          </div>
          {outVars.map((r) => (
            <div key={r.id} className={styles.outDataRow}>
              <div className={styles.outNameCell}>
                <span className={styles.outIcon}>
                  <IconArrowRightFromLine size={12} />
                </span>
                <span className={styles.outName}>{r.name || 'variable'}</span>
                <button
                  className={styles.outEdit}
                  aria-label="Edit output variable"
                  onClick={() => openEditOut(r)}
                >
                  <IconPencil size={12} />
                </button>
              </div>
              <div className={styles.outValCell}>{r.last || '—'}</div>
              <button
                className={styles.outDelCell}
                aria-label="Remove"
                onClick={() => removeOutVar(r.id)}
              >
                <IconMinusCircle size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className={styles.addWrap}>
          <Button color="secondary" size="s" icon={IconPlus} onClick={openAddOut}>
            Add variable
          </Button>
        </div>
      </div>
    </div>
  )

  const advCheckbox = (
    id: string,
    label: ReactNode,
    checked: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <Checkbox
      identifier={id}
      border={false}
      label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  )

  const execSettingsGroup = (
    <div className={styles.advGroup}>
      <div className={styles.advTitle}>Execution settings</div>
      {advCheckbox(
        'adv-ignore-error',
        <span className={styles.advLabelInfo}>
          Ignore error on this step
          <IconInfo size={15} />
        </span>,
        ignoreError,
        setIgnoreError,
      )}
      {advCheckbox('adv-skip', 'Skip during run', skipDuringRun, setSkipDuringRun)}
    </div>
  )

  const advancedTab = () => {
    // Step Get mail : Execution settings + Capabilities (pas d'options HTTP).
    if (activeStep === 2) {
      return (
        <div className={styles.advPane} data-anchor={`s${activeStep}-advanced`}>
          {execSettingsGroup}
          <div className={styles.advDivider} />
          <div className={styles.advGroup}>
            <div className={styles.advTitle}>Capabilities</div>
            <div className={styles.advRowEdit}>
              {advCheckbox('adv-caps', 'Add custom capabilities', addCapabilities, setAddCapabilities)}
              <Button color="secondary" size="s" icon={IconPencil} />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className={styles.advPane} data-anchor={`s${activeStep}-advanced`}>
        <div className={styles.advGroup}>
          <div className={styles.advTitle}>API Call Settings</div>
          {advCheckbox('adv-dns', 'Override DNS', overrideDns, setOverrideDns)}
          {advCheckbox('adv-ssl', 'Ignore SSL certificate', ignoreSsl, setIgnoreSsl)}
          {advCheckbox('adv-cookies', 'Preserve cookies', preserveCookies, setPreserveCookies)}
        </div>

        <div className={styles.advGroup}>
          <div className={styles.advTitle}>Redirection</div>
          {advCheckbox('adv-redirects', 'Automatically follow redirects', followRedirects, setFollowRedirects)}
        </div>

        <div className={styles.advDivider} />

        {execSettingsGroup}
      </div>
    )
  }

  // Champ avec le tag variable {{URL}} + une saisie texte éditable + braces.
  // Champ URL du canvas : SlateInputTag bordé, avec {{URL}} en tag de tête + le
  // reste éditable. Le stopPropagation évite de toggler la sélection de la step.
  const urlField = (value: string, setValue: (v: string) => void) => (
    <span className={styles.canvasField} onClick={(e) => e.stopPropagation()}>
      <SlateInputTag
        fullWidth
        value={toSegments(`{{URL}}${value}`)}
        onChange={(segs) => {
          const full = fromSegments(
            typeof segs === 'function' ? segs(toSegments(`{{URL}}${value}`)) : segs,
          )
          setValue(full.replace(/^\{\{URL\}\}/, ''))
        }}
        suggestions={checkSuggestions}
        placeholder="URL"
      />
    </span>
  )

  // Champ « Mailbox » du step Get mail : même SlateInputTag bordé.
  const mailboxField = () => (
    <span className={styles.canvasField} onClick={(e) => e.stopPropagation()}>
      <SlateInputTag
        fullWidth
        value={toSegments(mailbox)}
        onChange={(segs) =>
          setMailbox(fromSegments(typeof segs === 'function' ? segs(toSegments(mailbox)) : segs))
        }
        suggestions={checkSuggestions}
        placeholder="Mailbox"
      />
    </span>
  )

  // Panneau test (aucune step sélectionnée) → onglet Preview.
  const previewPane = () => (
    <div className={styles.previewPane}>
      <div className={styles.previewEmpty}>
        <div className={styles.previewHint}>
          <span>Click</span>
          <Button color="secondary" size="s" icon={IconZap}>
            Run
          </Button>
          <span>or press</span>
          <span className={styles.kbdPrimary}>
            <IconCommand size={15} />
          </span>
          <span>+</span>
          <span className={styles.kbd}>
            <IconCornerDownLeft size={15} />
          </span>
        </div>
      </div>

      <div className={styles.execBlock}>
        <div className={styles.execHead}>
          <span className={styles.execTitle}>Executions ({EXECUTIONS.length})</span>
          <IconListFilter size={16} />
        </div>
        <div className={styles.execList}>
          {EXECUTIONS.map((e) => (
            <div key={e.id} className={styles.execRow}>
              <span className={e.status === 'ok' ? styles.execStatusOk : styles.execStatusWarn}>
                {e.status === 'ok' ? <IconCheck size={16} /> : '!'}
              </span>
              <span className={styles.execId}>{e.id}</span>
              <span className={styles.execDate}>
                <IconCalendar size={14} /> {e.date}
              </span>
              <span className={styles.execDur}>
                <IconTimer size={14} /> {e.dur}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const testPlaceholder = (label: string) => (
    <div className={styles.tabPlaceholder}>{label}</div>
  )

  // Sections du rail replié (produit Tests), icône active = zap (test / API)
  const RAIL_SECTIONS = [
    [IconMonitorCheck, IconEye, IconBell, IconGauge],
    [IconSmartphone, IconMonitorSmartphone, IconZap, IconCheck, IconHistory, IconBraces],
    [IconSmartphone, IconChromium, IconBot],
  ]

  return (
    <div className={styles.app}>
      {/* ---------- rail ---------- */}
      <nav className={styles.rail}>
        {/* logo + collapse */}
        <div className={styles.railLogo}>
          <img src="/logo-yellow.svg" alt="Kapptivate" className={styles.railLogoImg} />
          <button className={styles.railCollapse} aria-label="Collapse sidebar">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5807 2H4.2474C3.51102 2 2.91406 2.59695 2.91406 3.33333V12.6667C2.91406 13.403 3.51102 14 4.2474 14H13.5807C14.3171 14 14.9141 13.403 14.9141 12.6667V3.33333C14.9141 2.59695 14.3171 2 13.5807 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.91406 2V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.2461 6L12.2461 8L10.2461 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* workspace : mode + logo opérateur */}
        <div className={styles.railWorkspace}>
          <button className={styles.railWsMode} aria-label="Workspace mode">
            <IconEye size={16} />
          </button>
          <span className={styles.railWsLogo}>
            <img src="/operator-logo.svg" alt="" />
          </span>
        </div>

        {/* sections */}
        <div className={styles.railSections}>
          {RAIL_SECTIONS.map((section, s) => (
            <div key={`s${s}`} className={styles.railSection}>
              {section.map((Icon, i) => (
                <button
                  key={`s${s}i${i}`}
                  className={Icon === IconZap ? styles.railItemActive : styles.railItem}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* aide */}
        <div className={styles.railHelp}>
          <button className={styles.railHelpBtn} aria-label="Help">
            <svg width="32" height="34" viewBox="2 2 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="2" width="32" height="32" rx="16" fill="#1C4A47" />
              <rect x="0.5" y="2.5" width="31" height="31" rx="15.5" stroke="white" strokeOpacity="0.5" />
              <path d="M13.0898 14.9996C13.3249 14.3313 13.789 13.7677 14.3998 13.4087C15.0106 13.0498 15.7287 12.9185 16.427 13.0383C17.1253 13.1581 17.7587 13.5211 18.2149 14.0631C18.6712 14.6051 18.9209 15.2911 18.9198 15.9996C18.9198 17.9996 15.9198 18.9996 15.9198 18.9996" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 23H16.01" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ---------- workspace ---------- */}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.crumb}>
            <Breadcrumb items={[{ title: 'Tests' }, { title: 'API' }]} />
          </div>
          <div className={styles.topActions}>
            <ButtonGroup>
              <Button color="secondary" size="m" icon={IconLock} />
              <Button color="secondary" size="m" icon={IconMonitor} />
              <Button color="secondary" size="m" icon={IconStar} />
              <Button color="danger-s" size="m" icon={IconTrash} />
            </ButtonGroup>
            <Button color="secondary" size="m" icon={IconSave}>Save</Button>
            <Button color="primary" size="m" icon={IconZap}>Run</Button>
          </div>
        </header>

        <div className={styles.body}>
          {/* canvas: clic hors step = désélection (referme le panneau) */}
          <div className={styles.canvas} onClick={() => setSelStep(null)}>
            <div className={styles.canvasInner}>
              <div className={styles.startRow} data-anchor="start-row">
                <span className={styles.startFlag}><IconFlag size={16} /></span>
                <span className={styles.startLabel}>
                  <IconGlobe size={15} /> Navigate to starting page
                </span>
                <div className={styles.startField}>{urlField(navPath, setNavPath)}</div>
              </div>

              <span className={styles.connector} />

              <div className={styles.stepGroup}>
                <div className={styles.stepGroupHead}>
                  <span className={styles.stepGroupMark}>
                    <IconColouredLogo size={32} />
                  </span>
                  <div>
                    <div className={styles.stepGroupTitle}>Step group #</div>
                    <div className={styles.stepGroupSub}>2 steps</div>
                  </div>
                  <button className={styles.stepGroupMore}>
                    <IconMoreHorizontal size={18} />
                  </button>
                </div>

                {/* step 1: API Call */}
                <div
                  className={selStep === 1 ? styles.stepBodySelected : styles.stepBody}
                  data-anchor="step-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelStep((cur) => (cur === 1 ? null : 1))
                      setTab('general')
                    }}
                  >
                    <div className={styles.stepCard}>
                      <div className={styles.stepTop} onClick={(e) => e.stopPropagation()}>
                        <span className={selStep === 1 ? styles.stepNumActive : styles.stepNum}>1</span>
                        <Select
                          size="s"
                          width="150px"
                          className={styles.actionSelect}
                          icon={IconNetwork}
                          options={toOptions(ACTION_OPTIONS)}
                          value={action}
                          onChange={(_e: unknown, v: string) => setAction(v)}
                        />
                        <Select
                          size="s"
                          width="140px"
                          options={toOptions(METHOD_OPTIONS)}
                          value={method}
                          onChange={(_e: unknown, v: string) => setMethod(v)}
                        />
                      </div>
                      {urlField(apiPath, setApiPath)}
                      {formSummary(1)}
                    </div>
                  </div>

                <div className={styles.stepSep} />

                {/* step 2: Get mail */}
                <div
                  className={selStep === 2 ? styles.stepBodySelected : styles.stepBody}
                  data-anchor="step-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelStep((cur) => (cur === 2 ? null : 2))
                      setTab('general')
                    }}
                  >
                    <div className={styles.stepCard}>
                      <div className={styles.stepTop} onClick={(e) => e.stopPropagation()}>
                        <span className={selStep === 2 ? styles.stepNumActive : styles.stepNum}>2</span>
                        <Select
                          size="s"
                          width="150px"
                          className={styles.actionSelect}
                          icon={IconMail}
                          options={toOptions(ACTION_OPTIONS)}
                          value={action2}
                          onChange={(_e: unknown, v: string) => setAction2(v)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>{mailboxField()}</div>
                      </div>
                      {formSummary(2)}
                    </div>
                  </div>

                <div className={styles.stepSep} />

                {/* step 3: Read PDF (checks sur la pièce jointe stockée) */}
                <div
                  className={selStep === 3 ? styles.stepBodySelected : styles.stepBody}
                  data-anchor="step-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelStep((cur) => (cur === 3 ? null : 3))
                      setTab('general')
                    }}
                  >
                    <div className={styles.stepCard}>
                      <div className={styles.stepTop} onClick={(e) => e.stopPropagation()}>
                        <span className={selStep === 3 ? styles.stepNumActive : styles.stepNum}>3</span>
                        <Select
                          size="s"
                          width="150px"
                          className={styles.actionSelect}
                          icon={IconFile}
                          options={toOptions(ACTION_OPTIONS)}
                          value={action3}
                          onChange={(_e: unknown, v: string) => setAction3(v)}
                        />
                        <span className={styles.canvasField} onClick={(e) => e.stopPropagation()}>
                          <SlateInputTag
                            fullWidth
                            value={toSegments(pdfSource)}
                            onChange={(segs) =>
                              setPdfSource(
                                fromSegments(
                                  typeof segs === 'function' ? segs(toSegments(pdfSource)) : segs,
                                ),
                              )
                            }
                            suggestions={checkSuggestions}
                            placeholder="Source file name"
                          />
                        </span>
                      </div>
                      {formSummary(3)}
                    </div>
                  </div>

                <div className={styles.stepFooter}>
                  <Button color="invisible" size="s" icon={IconPlus}>Add step…</Button>
                  <Button color="secondary" size="s" icon={IconPlay}>Use recorder</Button>
                </div>
              </div>

              <span className={styles.connector} />
              <button className={styles.plusNode}>
                <IconPlus size={16} />
              </button>
            </div>
          </div>

          {/* right panel : step sélectionnée → réglages du step ; sinon → panneau test */}
          <aside className={styles.panel}>
            {stepSelected ? (
              <>
            <div className={styles.panelHeader} data-anchor={`panel-header-s${activeStep}`}>
              <span className={styles.panelTitleNum}>{activeStep}</span>
              <span className={styles.panelTitle}>
                {activeStep === 2 ? 'Get mail' : activeStep === 3 ? 'Read PDF' : 'API Call'}
              </span>
              <div className={styles.panelHeaderActions}>
                <Dropdown
                  trigger="click"
                  placement="bottomRight"
                  menu={{
                    items: [
                      {
                        key: 'open',
                        label: 'Open in new tab',
                        icon: <IconSquareArrowOutUpRight size={14} />,
                      },
                      { key: 'duplicate', label: 'Duplicate', icon: <IconCopy size={14} /> },
                      { type: 'divider' as const },
                      { key: 'delete', label: 'Delete', danger: true, icon: <IconTrash size={14} /> },
                    ],
                  }}
                >
                  <Button color="secondary" size="s" icon={IconMoreHorizontal} />
                </Dropdown>
              </div>
            </div>

            <Tabs
              className={styles.panelTabs}
              type="card"
              activeKey={tab}
              onChange={setTab}
              tabs={[
                { key: 'general', label: 'General', children: generalTab() },
                { key: 'variables', label: 'Variables', children: variablesTab() },
                { key: 'checks', label: 'Checks', children: checksBody() },
                { key: 'advanced', label: 'Advanced settings', children: advancedTab() },
              ]}
            />
              </>
            ) : (
              <Tabs
                className={styles.panelTabs}
                type="card"
                activeKey={testTab}
                onChange={setTestTab}
                tabs={[
                  { key: 'preview', label: 'Preview', children: previewPane() },
                  { key: 'environment', label: 'Environment', children: testPlaceholder('Environment') },
                  { key: 'settings', label: 'Test settings', children: testPlaceholder('Test settings') },
                  { key: 'history', label: 'Version history', children: testPlaceholder('Version history') },
                ]}
              />
            )}
          </aside>
        </div>
      </div>

      {outDraft && (
        <Modal
          open
          width={520}
          title={outDraftMode === 'edit' ? 'Edit output variable' : 'Add output variable'}
          onCancel={() => setOutDraft(null)}
        >
          <Modal.Content>
            <div className={styles.omBody}>
              <div className={styles.omTabs}>
                <button
                  className={outDraft.target === 'new' ? styles.omTabOn : styles.omTab}
                  onClick={() => patchDraft({ target: 'new', name: '' })}
                >
                  Store as new variable
                </button>
                <button
                  className={outDraft.target === 'global' ? styles.omTabOn : styles.omTab}
                  onClick={() => patchDraft({ target: 'global', name: '' })}
                >
                  Update a global variable
                </button>
              </div>

              <div className={styles.omField}>
                <span className={styles.omLabel}>
                  {outDraft.target === 'global' ? 'Global variable' : 'Name'}
                </span>
                {outDraft.target === 'global' ? (
                  <Select
                    size="m"
                    fullWidth
                    searchable
                    popupClassName={styles.selPopup}
                    placeholder="Select global variable…"
                    options={GLOBAL_VARS.map((g) => ({ label: g, value: g }))}
                    value={outDraft.name || undefined}
                    onChange={(_e: unknown, v: string) => patchDraft({ name: optVal(v) })}
                  />
                ) : (
                  <>
                    <Input
                      size="m"
                      fullWidth
                      placeholder="variable_name"
                      value={outDraft.name}
                      onChange={(e) => patchDraft({ name: e.target.value })}
                    />
                    <span className={styles.omHint}>No spaces or special characters allowed.</span>
                  </>
                )}
              </div>

              <div className={styles.omField}>
                <span className={styles.omLabel}>Source</span>
                <div className={styles.omExpr}>
                  <div className={styles.omExprSel}>
                    <Select
                      size="m"
                      borderless
                      popupClassName={styles.selPopup}
                      options={OUT_SOURCES}
                      value={outDraft.source}
                      onChange={(_e: unknown, v: string) => patchDraft({ source: optVal(v) })}
                    />
                  </div>

                  {/* Le second champ dépend de la source. */}
                  {outDraft.source === 'json' && (
                    <>
                      <div className={styles.omExprInput}>
                        <Input
                          size="m"
                          borderless
                          fullWidth
                          mono
                          placeholder="Example: $.access_token"
                          value={outDraft.path}
                          onChange={(e) => patchDraft({ path: e.target.value })}
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.omPickBtn}
                        title="Pick from the last response"
                        onClick={() => openTree((path) => patchDraft({ path, source: 'json' }))}
                      >
                        <IconBraces size={14} />
                      </button>
                    </>
                  )}

                  {outDraft.source === 'header' && (
                    <div className={styles.omExprInput}>
                      <Input
                        size="m"
                        borderless
                        fullWidth
                        mono
                        placeholder="Header name, e.g. Authorization"
                        value={outDraft.path}
                        onChange={(e) => patchDraft({ path: e.target.value })}
                      />
                    </div>
                  )}

                  {(outDraft.source === 'body' || outDraft.source === 'status') && (
                    <div className={styles.omExprNote}>
                      {outDraft.source === 'body'
                        ? 'Stores the entire response body.'
                        : 'Stores the HTTP status code.'}
                    </div>
                  )}
                </div>

                {outDraft.source === 'json' && (
                  <span className={styles.omHint}>
                    Click{' '}
                    <span className={styles.omHintKey}>
                      <IconBraces size={11} />
                    </span>{' '}
                    to pick a value from the last response, and the path is generated for you.
                  </span>
                )}
                {outDraft.source === 'body' && (
                  <span className={styles.omHint}>
                    Keep the whole payload in one variable to assert on it later.
                  </span>
                )}
              </div>

              <Toggle
                title="Set default value"
                value={outDraft.defaultOn}
                onChange={(v) => patchDraft({ defaultOn: v })}
              />
              {outDraft.defaultOn && (
                <div className={styles.omField}>
                  <Input
                    size="m"
                    fullWidth
                    placeholder="Default value"
                    value={outDraft.defaultVal}
                    onChange={(e) => patchDraft({ defaultVal: e.target.value })}
                  />
                </div>
              )}
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className={styles.omFooter}>
              {outDraftMode === 'edit' && (
                <Button
                  color="danger-s"
                  icon={IconTrash}
                  onClick={() => {
                    removeOutVar(outDraft.id)
                    setOutDraft(null)
                  }}
                >
                  Delete
                </Button>
              )}
              <span className={styles.omFooterSpacer} />
              <Button color="invisible" onClick={() => setOutDraft(null)}>
                Cancel
              </Button>
              <Button color="primary" onClick={saveOutDraft}>
                {outDraftMode === 'edit' ? 'Save' : 'Add'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {treePick &&
        (() => {
          const multi = !!treePick.onPickMany
          const q = treeQuery.trim().toLowerCase()
          const rows = q
            ? RESPONSE_ROWS.filter(
                (r) => r.leaf && `${r.label} ${r.path} ${r.preview}`.toLowerCase().includes(q),
              )
            : RESPONSE_ROWS
          const onPick = (path: string) => {
            treePick.onPick(path)
            setTreePick(null)
          }
          const toggle = (path: string) =>
            setTreeSel((s) => (s.includes(path) ? s.filter((p) => p !== path) : [...s, path]))
          return (
            <Modal
              open
              width={680}
              title={multi ? 'Select JSON attributes' : 'Select a JSON attribute'}
              onCancel={() => setTreePick(null)}
            >
              <Modal.Content maxHeight="70vh">
                <div className={styles.treeModalBody}>
                  {multi && !q && (
                    <div className={styles.rpHead}>Pick one or more attributes to add as checks.</div>
                  )}
                  <SearchInput
                    value={treeQuery}
                    onChange={setTreeQuery}
                    placeholder="Filter attributes by key, path or value..."
                    fullwidth
                  />
                  <div className={styles.treeModalTree}>
                    {q && (
                      <div className={styles.rpHead}>
                        {rows.length} matching attribute{rows.length === 1 ? '' : 's'}
                      </div>
                    )}
                    <div className={styles.rpList}>
                      {rows.length === 0 ? (
                        <div className={styles.subjEmpty}>No attribute matches this filter.</div>
                      ) : (
                        rows.map((row) =>
                          row.leaf ? (
                            <button
                              key={row.path}
                              className={`${styles.rpRow} ${
                                multi && treeSel.includes(row.path) ? styles.rpRowSel : ''
                              }`}
                              style={{ paddingLeft: q ? 12 : 10 + row.depth * 14 }}
                              onClick={() => (multi ? toggle(row.path) : onPick(row.path))}
                            >
                              {multi && (
                                <span
                                  className={`${styles.rpCheck} ${
                                    treeSel.includes(row.path) ? styles.rpCheckOn : ''
                                  }`}
                                >
                                  {treeSel.includes(row.path) && <IconCheck size={11} />}
                                </span>
                              )}
                              <span className={styles.rpKey}>{q ? row.path : row.label}</span>
                              <span className={styles.rpVal}>{row.preview}</span>
                            </button>
                          ) : (
                            <div
                              key={row.path}
                              className={styles.rpNode}
                              style={{ paddingLeft: 10 + row.depth * 14 }}
                            >
                              <span className={styles.rpKey}>{row.label}</span>
                              <span className={styles.rpMuted}>{row.preview}</span>
                            </div>
                          ),
                        )
                      )}
                    </div>
                  </div>
                </div>
              </Modal.Content>
              {multi && (
                <Modal.Footer>
                  <div className={styles.treeModalFoot}>
                    <Button color="invisible" onClick={() => setTreePick(null)}>
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      disabled={!treeSel.length}
                      onClick={() => {
                        treePick.onPickMany?.(treeSel)
                        setTreePick(null)
                      }}
                    >
                      {treeSel.length
                        ? `Add ${treeSel.length} check${treeSel.length > 1 ? 's' : ''}`
                        : 'Add checks'}
                    </Button>
                  </div>
                </Modal.Footer>
              )}
            </Modal>
          )
        })()}
    </div>
  )
}

export default ChecksProto
