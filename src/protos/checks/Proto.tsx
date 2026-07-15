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
} from '@kapptivate/ui-kit'
import { useReportScreen } from '../../context/ScreenContext'
import styles from './checks.module.scss'
import {
  INITIAL_CONDITIONS,
  SUBJECTS,
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
const USED_VARS = ['baseUrl', 'authToken']
// Globales disponibles quand un output met à jour une variable globale.
const GLOBAL_VARS = ['URL', 'baseUrl', 'authToken']

const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }))
const optVal = (v: any): string => (v && typeof v === 'object' ? v.value : v)
const ACTION_OPTIONS = ['API Call', 'Navigate', 'Click', 'Fill in', 'Assert', 'Wait']
const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// ---- type des tables clé/valeur (Headers / Query parameters) ----
type KV = { id: string; k: string; v: string }
// ---- variables extraites de la réponse ----
type OutVar = { id: string; name: string; source: string; path: string }

const ChecksProto = () => {
  const [tab, setTab] = useState('checks')
  const [failLogic, setFailLogic] = useState<'and' | 'or'>('or')
  const [warnLogic, setWarnLogic] = useState<'and' | 'or'>('or')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropSev, setDropSev] = useState<Severity | null>(null)
  // Sélection de la step : ouvre le panneau (drawer) + fond grey.
  const [stepSelected, setStepSelected] = useState(true)
  // Onglet du panneau test (affiché quand aucune step n'est sélectionnée).
  const [testTab, setTestTab] = useState('preview')
  const [conds, setConds] = useState<Condition[]>(() =>
    INITIAL_CONDITIONS.map((c) => ({ ...c })),
  )
  const [method, setMethod] = useState('GET')
  const [action, setAction] = useState('API Call')
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

  // ---- Variables tab : variables extraites de la réponse ----
  const [outVars, setOutVars] = useState<OutVar[]>(() => [
    { id: nextId(), name: 'authToken', source: 'json', path: '$.access_token' },
  ])

  // ---- Advanced settings tab (checkboxes) ----
  const [overrideDns, setOverrideDns] = useState(false)
  const [ignoreSsl, setIgnoreSsl] = useState(false)
  const [preserveCookies, setPreserveCookies] = useState(false)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [ignoreError, setIgnoreError] = useState(false)
  const [skipDuringRun, setSkipDuringRun] = useState(false)

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
          {valInput(c)}
          {c.kind === 'time' ? (
            <Select
              size="s"
              borderless
              popupClassName={styles.selPopup}
              options={toOptions(UNITS)}
              value={c.unit ?? 'seconds'}
              onChange={(_e: unknown, v: string) => patch(c.id, { unit: optVal(v) })}
            />
          ) : (
            varsBtn
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

  const expr = (c: Condition) => (
    <div className={`${styles.expr} ${styles.exprFill}`}>
      <Select
        size="s"
        borderless
        popupClassName={styles.selPopup}
        options={SUBJECTS.map((s) => ({ label: s.label, value: s.label }))}
        value={c.subj}
        onChange={(_e: unknown, v: string) => patch(c.id, resetForKind(optVal(v)))}
      />
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
  const formSummary = () => {
    if (conds.length === 0) return null
    return (
      <button
        type="button"
        className={styles.fmBar}
        onClick={(e) => {
          e.stopPropagation()
          setStepSelected(true)
          setTab('checks')
        }}
        title="Edit checks"
      >
        <span className={styles.fmLabel}>Checks</span>
        {fails.length > 0 && (
          <span className={styles.fmCount}>
            <span className={styles.dotFail} />
            {fails.length} {fails.length > 1 ? 'fails' : 'fail'}
          </span>
        )}
        {warns.length > 0 && (
          <span className={styles.fmCount}>
            <span className={styles.dotWarn} />
            {warns.length} {warns.length > 1 ? 'warnings' : 'warning'}
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

  const generalTab = () => (
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

  const patchOutVar = (id: string, next: Partial<OutVar>) =>
    setOutVars((cur) => cur.map((v) => (v.id === id ? { ...v, ...next } : v)))
  const addOutVar = () =>
    setOutVars((cur) => [...cur, { id: nextId(), name: '', source: 'body', path: '' }])
  const removeOutVar = (id: string) =>
    setOutVars((cur) => cur.filter((v) => v.id !== id))

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

      {/* Output variables (produites depuis la réponse) */}
      <div className={styles.varsSection}>
        <div className={styles.varsSectionHead}>
          <span className={styles.varsSectionTitle}>Output variables</span>
          <span className={styles.varsSectionSub}>Saved from the response to reuse in later steps</span>
        </div>
        <div className={styles.kvTable}>
          {outVars.map((r) => (
            <div key={r.id} className={styles.outRow}>
              <div className={styles.outCell}>
                <Input
                  size="s"
                  borderless
                  fullWidth
                  placeholder="Variable name"
                  value={r.name}
                  onChange={(e) => patchOutVar(r.id, { name: e.target.value })}
                />
              </div>
              <div className={styles.outCell}>
                <Select
                  size="s"
                  borderless
                  fullWidth
                  popupClassName={styles.selPopup}
                  options={OUT_SOURCES}
                  value={r.source}
                  onChange={(_e: unknown, v: string) => patchOutVar(r.id, { source: optVal(v) })}
                />
              </div>
              <div className={styles.outCell}>
                <Input
                  size="s"
                  borderless
                  fullWidth
                  mono
                  placeholder="e.g. $.access_token"
                  value={r.path}
                  onChange={(e) => patchOutVar(r.id, { path: e.target.value })}
                />
              </div>
              <button
                className={styles.outDel}
                aria-label="Remove"
                onClick={() => removeOutVar(r.id)}
              >
                <IconMinusCircle size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className={styles.addWrap}>
          <Button color="secondary" size="s" icon={IconPlus} onClick={addOutVar}>
            Add variable
          </Button>
        </div>
      </div>

      {/* Used in this step */}
      <div className={styles.varsSection}>
        <div className={styles.varsSectionHead}>
          <span className={styles.varsSectionTitle}>Used in this step</span>
          <span className={styles.varsSectionSub}>Variables referenced by the request</span>
        </div>
        <div className={styles.varsChips}>
          {USED_VARS.map((u) => (
            <Tag key={u} color="dark-blue" size="sm" smallPadding mono>
              {`{{${u}}}`}
            </Tag>
          ))}
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

  const advancedTab = () => (
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
    </div>
  )

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
          <div className={styles.canvas} onClick={() => setStepSelected(false)}>
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
                    <div className={styles.stepGroupSub}>1 step</div>
                  </div>
                  <button className={styles.stepGroupMore}>
                    <IconMoreHorizontal size={18} />
                  </button>
                </div>

                <div
                  className={stepSelected ? styles.stepBodySelected : styles.stepBody}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Clic sur la carte → ouvre (ou toggle) sur l'onglet General.
                    if (!stepSelected) setTab('general')
                    setStepSelected((v) => !v)
                  }}
                >
                  <div className={styles.stepCard}>
                    <div
                      className={styles.stepTop}
                      onClick={(e) => e.stopPropagation()}
                    >
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
                    {formSummary()}
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
              <span className={styles.panelTitleNum}>1</span>
              <span className={styles.panelTitle}>API Call</span>
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
    </div>
  )
}

export default ChecksProto
