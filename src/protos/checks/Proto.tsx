import { useState, type Dispatch, type SetStateAction, type ReactNode } from 'react'
import {
  Select,
  Input,
  Button,
  ButtonGroup,
  Breadcrumb,
  Dropdown,
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
  IconLayoutGrid,
  IconEye,
  IconBell,
  IconGauge,
  IconCommand,
  IconMonitor,
  IconBolt,
  IconCheckCircle2,
  IconHistory,
  IconBraces,
  IconSmartphone,
  IconShield,
  IconHelpCircle,
  IconInfo,
  IconChevronRight,
  IconGripVertical,
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
import { useReportScreen } from '../../context/ScreenContext'
import styles from './checks.module.scss'
import {
  INITIAL_CONDITIONS,
  MAIL_INITIAL_CONDITIONS,
  SUBJECTS,
  MAIL_SUBJECTS,
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

// Historique d'exécutions (panneau test → Preview) — statique pour le proto.
const EXECUTIONS = [
  { id: '#290', status: 'warn', date: '13/07/2026 - 05:37:53 PM', dur: '29s' },
  { id: '#289', status: 'ok', date: '13/07/2026 - 05:32:57 PM', dur: '29s' },
  { id: '#288', status: 'ok', date: '13/07/2026 - 05:19:38 PM', dur: '28s' },
]

// Variables tab — output variables (produites) + variables consommées.
// Source = méthode d'extraction depuis la réponse (cf. proto Figma « output variable »).
const OUT_SOURCES = [
  { label: 'JSON attribute', value: 'json' },
  { label: 'Header', value: 'header' },
  { label: 'Status code', value: 'status' },
  { label: 'Full body', value: 'body' },
]
// Variables globales réellement définies dans le test (cf. table Global variables).
const GLOBAL_VARS = ['URL']

// Dernière réponse du step (exemple) — sert à générer le JSONPath au clic,
// pour éviter d'écrire le langage à la main (retour client).
const SAMPLE_RESPONSE = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  token_type: 'Bearer',
  expires_in: 3600,
  user: {
    id: 42,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    roles: ['admin', 'qa'],
  },
}
type RespRow = { path: string; label: string; preview: string; depth: number; leaf: boolean }
const fmtVal = (v: any): string =>
  typeof v === 'string' ? `"${v.length > 22 ? v.slice(0, 22) + '…' : v}"` : String(v)
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
      out.push({ path, label: k, preview: fmtVal(v), depth, leaf: true })
    }
  })
  return out
}
const RESPONSE_ROWS = buildRespRows(SAMPLE_RESPONSE)

const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }))
const optVal = (v: any): string => (v && typeof v === 'object' ? v.value : v)
const ACTION_OPTIONS = ['API Call', 'Get mail', 'Navigate', 'Click', 'Fill in', 'Assert', 'Wait']
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
  const [failLogic, setFailLogic] = useState<'and' | 'or'>('or')
  const [warnLogic, setWarnLogic] = useState<'and' | 'or'>('or')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropSev, setDropSev] = useState<Severity | null>(null)
  // Sélection de la step (1 = API Call, 2 = Get mail ; null = panneau test).
  const [selStep, setSelStep] = useState<number | null>(1)
  const stepSelected = selStep !== null
  // Onglet du panneau test (affiché quand aucune step n'est sélectionnée).
  const [testTab, setTestTab] = useState('preview')
  // Conditions par step.
  const [condsByStep, setCondsByStep] = useState<Record<number, Condition[]>>(() => ({
    1: INITIAL_CONDITIONS.map((c) => ({ ...c })),
    2: MAIL_INITIAL_CONDITIONS.map((c) => ({ ...c })),
  }))
  const activeStep = selStep ?? 1
  const conds = condsByStep[activeStep] ?? []
  const setConds = (updater: Condition[] | ((cur: Condition[]) => Condition[])) =>
    setCondsByStep((cur) => ({
      ...cur,
      [activeStep]: typeof updater === 'function' ? updater(cur[activeStep] ?? []) : updater,
    }))
  // Sujets proposés selon le step : réponse HTTP (API) ou email (Get mail).
  const stepSubjects = activeStep === 2 ? MAIL_SUBJECTS : SUBJECTS
  const respTabLabel = activeStep === 2 ? 'Message' : 'Response'
  const [method, setMethod] = useState('GET')
  const [action, setAction] = useState('API Call')
  const [action2, setAction2] = useState('Get mail')
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

  // ---- Variables tab : output variables + modale Add/Edit ----
  const [outVars, setOutVars] = useState<OutVar[]>(() => [
    { id: nextId(), name: 'TOKEN', source: 'json', path: '$.access_token', last: '*******************' },
  ])
  const [outDraft, setOutDraft] = useState<OutDraft | null>(null)
  const [outDraftMode, setOutDraftMode] = useState<'add' | 'edit'>('add')
  // Popover « piocher dans la dernière réponse » → génère le JSONPath.
  const [pickOpen, setPickOpen] = useState(false)

  // ---- Advanced settings tab (checkboxes) ----
  const [overrideDns, setOverrideDns] = useState(false)
  const [ignoreSsl, setIgnoreSsl] = useState(false)
  const [preserveCookies, setPreserveCookies] = useState(false)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [ignoreError, setIgnoreError] = useState(false)
  const [skipDuringRun, setSkipDuringRun] = useState(false)
  const [addCapabilities, setAddCapabilities] = useState(false)

  useReportScreen(tab)

  const patch = (id: string, next: Partial<Condition>) =>
    setConds((cur) => cur.map((c) => (c.id === id ? { ...c, ...next } : c)))
  const remove = (id: string) =>
    setConds((cur) => cur.filter((c) => c.id !== id))
  const add = (sev: Severity) =>
    setConds((cur) => [
      ...cur,
      { id: nextId(), sev, ...resetForKind('Status code') } as Condition,
    ])
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

  /* ---------- checks renderers (functions, NOT components → keep input focus) ---------- */
  const varsBtn = <span className={styles.exprVars}>{'{}'}</span>
  const sevLabel = (warn: boolean, text: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          flex: 'none',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: warn ? '#d98a00' : '#e0473c',
        }}
      />
      {text}
    </span>
  )
  const valInput = (c: Condition) => (
    <Input
      size="s"
      borderless
      fullWidth
      className={styles.grow}
      placeholder="Value"
      value={c.val ?? ''}
      onChange={(e) => patch(c.id, { val: e.target.value })}
    />
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
            onClick: ({ key }: { key: string }) =>
              key === 'num' ? addTerm('num', '') : addTerm('var', key),
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
          {exprBuilder(c)}
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
        {varsBtn}
      </>
    )
  }

  // Arbre de la dernière réponse : clic sur un attribut → renvoie son JSONPath.
  // Réutilisé par la modale output ET la 3e tab du picker de check.
  const responseTree = (onPick: (path: string) => void) => (
    <div className={styles.rpBox}>
      <div className={styles.rpHead}>Last response · click a value</div>
      <div className={styles.rpList}>
        {RESPONSE_ROWS.map((row) =>
          row.leaf ? (
            <button
              key={row.path}
              className={styles.rpRow}
              style={{ paddingLeft: 10 + row.depth * 14 }}
              onClick={() => onPick(row.path)}
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
      patch(c.id, resetForKind(subj))
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
              : [{ key: 'json', label: 'JSON attribute', children: responseTree((path) => pick(path)) }]),
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
        <button type="button" className={styles.subjTrigger}>
          {isVar ? (
            <span className={styles.subjTriggerVar}>
              <span className={styles.subjVarIcon}>{'{}'}</span>
              {c.subj.replace(/^\{\{|\}\}$/g, '')}
            </span>
          ) : (
            <span className={styles.subjTriggerLabel}>{c.subj}</span>
          )}
          <IconChevronDown size={14} />
        </button>
      </Popover>
    )
  }

  const expr = (c: Condition) => (
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
              c.sev === 'fail' ? 'Move to Warning' : 'Move to Failed',
            ),
          },
          { type: 'divider' as const },
          { key: 'duplicate', label: 'Duplicate', icon: <IconCopy size={14} /> },
          { type: 'divider' as const },
          { key: 'delete', label: 'Delete', danger: true, icon: <IconTrash size={14} /> },
        ],
      }}
    >
      <button className={styles.kebab} aria-label="More actions">
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
      width="64px"
      minWidth="0"
      disabled={disabled}
      options={toOptions(['and', 'or'])}
      value={value}
      onChange={(_e: unknown, v: string) => onSet(optVal(v) as 'and' | 'or')}
    />
  )

  const addBtn = (
    <div className={styles.addWrap}>
      <Dropdown
        trigger="click"
        placement="topLeft"
        menu={{
          onClick: ({ key }: { key: string }) => add(key as Severity),
          items: [
            { key: 'fail', label: sevLabel(false, 'Fails the step') },
            { key: 'warn', label: sevLabel(true, 'Sets a warning') },
          ],
        }}
      >
        <Button color="secondary" size="s" icon={IconPlus}>
          Add condition
        </Button>
      </Dropdown>
    </div>
  )

  // Chaque groupe = une expression and/or, la conséquence est portée par le
  // groupe → pas de pastille par ligne.
  const groupExpr = (
    c: Condition,
    i: number,
    gLogic: 'and' | 'or',
    setG: (v: 'and' | 'or') => void,
  ) => (
    <div
      key={c.id}
      className={styles.cond}
      draggable
      onDragStart={() => setDragId(c.id)}
      onDragEnd={() => {
        setDragId(null)
        setDropSev(null)
      }}
    >
      {i === 0 ? (
        <span className={styles.checkIf}>Check if</span>
      ) : (
        connSelect(gLogic, setG, i > 1)
      )}
      <span className={styles.exprWrap}>{expr(c)}</span>
      <span className={styles.grip} title="Drag to the other group">
        <IconGripVertical size={15} />
      </span>
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
        onDragOver={(e) => {
          e.preventDefault()
          if (dropSev !== sev) setDropSev(sev)
        }}
        onDrop={() => dropTo(sev)}
      >
        <div className={styles.grpHead}>
          <span className={sev === 'fail' ? styles.grpBadgeFail : styles.grpBadgeWarn}>
            <span className={sev === 'fail' ? styles.dotFail : styles.dotWarn} />
            {sev === 'fail' ? 'Failed' : 'Warning'}
          </span>
          <span className={styles.grpNote}>
            {sev === 'fail' ? 'conditions that fail the step' : 'conditions that only warn'}
          </span>
        </div>
        <div className={styles.condList}>
          {list.length ? (
            list.map((c, i) => groupExpr(c, i, gLogic, setG))
          ) : (
            <div className={styles.grpEmpty}>
              {sev === 'fail' ? 'No failing conditions' : 'No warning conditions'}
            </div>
          )}
        </div>
      </div>
    )
  }

  const checksBody = () => (
    <div className={styles.checksBody}>
      {renderGroup('fail')}
      <div className={styles.grpDivider} />
      {renderGroup('warn')}
      {addBtn}
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
      <button
        type="button"
        className={styles.fmBar}
        onClick={(e) => {
          e.stopPropagation()
          setSelStep(step)
          setTab('checks')
        }}
        title="Edit checks"
      >
        <span className={styles.fmLabel}>Checks</span>
        {f.length > 0 && (
          <span className={styles.fmCount}>
            <span className={styles.dotFail} />
            {f.length} {f.length > 1 ? 'fails' : 'fail'}
          </span>
        )}
        {w.length > 0 && (
          <span className={styles.fmCount}>
            <span className={styles.dotWarn} />
            {w.length} {w.length > 1 ? 'warnings' : 'warning'}
          </span>
        )}
      </button>
    )
  }

  /* ---------- General / Variables / Advanced (reste de l'XP du panneau) ---------- */

  // Table clé/valeur (Headers / Query parameters) — une ligne vide reste
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
    // Step Get mail : General = référence visuelle (pas de request config).
    if (activeStep === 2) {
      return (
        <div className={styles.advPane}>
          <div className={styles.advGroup}>
            <div className={styles.advTitle}>Reference screenshot</div>
            <div className={styles.refEmpty}>No reference screenshot available for this step</div>
          </div>
        </div>
      )
    }
    return (
    <div className={styles.genPane}>
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
    <div className={styles.varsPane}>
      {/* Global variables */}
      <Table
        rowKey="key"
        compact
        verticalBorders
        data={[{ key: 'url', name: 'URL', value: startUrl }]}
        columns={[
          {
            title: <div style={{ textAlign: 'left' }}>Global variables</div>,
            dataIndex: 'name',
            width: '30%',
            onHeaderCell: () => ({ colSpan: 2 }),
            render: (_: unknown, r: any) => (
              <div className={styles.varNameCell}>
                <Tag color="dark-blue" size="sm" icon={IconBraces} />
                <Text weight="medium">{r.name}</Text>
              </div>
            ),
          },
          {
            title: '',
            dataIndex: 'value',
            onHeaderCell: () => ({ colSpan: 0 }),
            render: (_: unknown, r: any) => (
              <Input
                size="m"
                borderless
                fullWidth
                placeholder="Enter value..."
                value={r.value}
                onChange={(e) => setStartUrl(e.target.value)}
              />
            ),
          },
        ]}
      />

      {/* Output variables (produites par le step) — cf. Figma 10249:37165 */}
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
        <div className={styles.advPane}>
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
      <div className={styles.advPane}>
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
  const urlField = (value: string, setValue: (v: string) => void) => (
    <div className={styles.varField} onClick={(e) => e.stopPropagation()}>
      <Tag color="dark-blue" size="sm" weight="medium" smallPadding>
        URL
      </Tag>
      <input
        className={styles.varFieldInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className={styles.varFieldBraces}>
        <IconBraces size={12} />
      </span>
    </div>
  )

  // Champ « Mailbox » du step Get mail (input simple + braces).
  const mailboxField = () => (
    <div className={styles.varField} onClick={(e) => e.stopPropagation()}>
      <input
        className={styles.varFieldInput}
        placeholder="Mailbox"
        value={mailbox}
        onChange={(e) => setMailbox(e.target.value)}
      />
      <span className={styles.varFieldBraces}>
        <IconBraces size={12} />
      </span>
    </div>
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

  const RAIL_TOP = [IconLayoutGrid, IconEye, IconBell, IconGauge]
  const RAIL_MID = [IconCommand, IconMonitor, IconBolt, IconCheckCircle2, IconHistory, IconBraces]
  const RAIL_BOT = [IconSmartphone, IconShield]

  return (
    <div className={styles.app}>
      {/* ---------- rail ---------- */}
      <nav className={styles.rail}>
        <span className={styles.railMark}>
          <IconColouredLogo size={22} />
        </span>
        {RAIL_TOP.map((Icon, i) => (
          <button key={`t${i}`} className={styles.railBtn}>
            <Icon size={20} />
          </button>
        ))}
        <span className={styles.railSep} />
        {RAIL_MID.map((Icon, i) => (
          <button key={`m${i}`} className={Icon === IconBolt ? styles.railBtnActive : styles.railBtn}>
            <Icon size={20} />
          </button>
        ))}
        <span className={styles.railSpacer} />
        {RAIL_BOT.map((Icon, i) => (
          <button key={`b${i}`} className={styles.railBtn}>
            <Icon size={20} />
          </button>
        ))}
        <span className={styles.railSep} />
        <button className={styles.railBtn}>
          <IconHelpCircle size={20} />
        </button>
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
          {/* canvas — clic hors step = désélection (referme le panneau) */}
          <div className={styles.canvas} onClick={() => setSelStep(null)}>
            <div className={styles.canvasInner}>
              <div className={styles.startRow}>
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

                {/* step 1 — API Call */}
                <div
                  className={selStep === 1 ? styles.stepBodySelected : styles.stepBody}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelStep((cur) => (cur === 1 ? null : 1))
                    setTab('general')
                  }}
                >
                  <div className={styles.stepCard}>
                    <div className={styles.stepTop} onClick={(e) => e.stopPropagation()}>
                      <span className={styles.stepNum}>1</span>
                      <Select
                        size="s"
                        width="150px"
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

                {/* step 2 — Get mail */}
                <div
                  className={selStep === 2 ? styles.stepBodySelected : styles.stepBody}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelStep((cur) => (cur === 2 ? null : 2))
                    setTab('general')
                  }}
                >
                  <div className={styles.stepCard}>
                    <div className={styles.stepTop} onClick={(e) => e.stopPropagation()}>
                      <span className={styles.stepNum}>2</span>
                      <Select
                        size="s"
                        width="150px"
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
            <div className={styles.panelHeader}>
              <span className={styles.panelTitleNum}>{activeStep}</span>
              <span className={styles.panelTitle}>{activeStep === 2 ? 'Get mail' : 'API Call'}</span>
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
                  <div className={styles.omExprInput}>
                    <Input
                      size="m"
                      borderless
                      fullWidth
                      mono
                      placeholder="Example: $.userId"
                      value={outDraft.path}
                      onChange={(e) => patchDraft({ path: e.target.value })}
                    />
                  </div>
                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    noPadding
                    arrow={false}
                    zIndex={1100}
                    open={pickOpen}
                    setOpen={setPickOpen}
                    content={responseTree((path) => {
                      patchDraft({ path, source: 'json' })
                      setPickOpen(false)
                    })}
                  >
                    <button
                      type="button"
                      className={styles.omPickBtn}
                      title="Pick from the last response"
                    >
                      <IconBraces size={14} />
                    </button>
                  </Popover>
                </div>
                <span className={styles.omHint}>
                  Click <IconBraces size={12} /> to pick a value from the last response — the path
                  is generated for you.
                </span>
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
    </div>
  )
}

export default ChecksProto
