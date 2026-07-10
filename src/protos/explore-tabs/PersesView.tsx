import { useState } from 'react'
import {
  Button,
  Select,
  Tabs,
  Drawer,
  Modal,
  Input,
  Toggle,
  StatusTag,
  Card,
  Collapse,
  ActionMenu,
  RefreshButton,
  ButtonGroup,
} from '@kapptivate/ui-kit'
import {
  Plus,
  PlusSquare,
  LayoutGrid,
  Save,
  X,
  Calendar,
  ChevronDown,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Maximize2,
  Download,
  Braces,
  ZoomIn,
  ZoomOut,
  GripVertical,
  RotateCw,
  Sparkles,
  Wand2,
  FileCode,
  BarChart3,
} from 'lucide-react'
import styles from './perses.module.scss'
import LineChart from './LineChart'
import AiAssistant from './AiAssistant'
import { toast } from './toast'
import type { Panel, PanelGroup, PanelType, QueryType, PanelSpec } from './perses'
import {
  PANEL_TYPE_OPTIONS,
  QUERY_TYPE_OPTIONS,
  TIME_RANGE_OPTIONS,
  SQL_HINT,
  interpretPrompt,
  suggestViz,
} from './perses'
import { dashboardStore, useDashboard, useDashboardDirty } from './dashboardStore'

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
const mi = (size = 14) => ({ size } as { size: number })

/* ─── Edit Panel drawer ─── */
type EditState = { groupId: string; panelId: string } | null

const EditPanelDrawer = ({
  open, draft, groups, targetGroup, setTargetGroup, onChange, onApply, onClose,
}: {
  open: boolean
  draft: Panel | null
  groups: PanelGroup[]
  targetGroup: string
  setTargetGroup: (id: string) => void
  onChange: (p: Panel) => void
  onApply: () => void
  onClose: () => void
}) => {
  const [tab, setTab] = useState('query')
  const [aiText, setAiText] = useState('')
  if (!draft) return <Drawer open={open} onClose={onClose} width={900} title="Edit Panel" />

  const set = (patch: Partial<Panel>) => onChange({ ...draft, ...patch })
  const viz = suggestViz(draft.sql)

  const generate = () => {
    if (!aiText.trim()) return
    const p = interpretPrompt(aiText).panels[0]
    set({ sql: p.sql ?? draft.sql, series: p.series ?? draft.series, yMin: p.yMin ?? draft.yMin, yMax: p.yMax ?? draft.yMax, yTicks: p.yTicks ?? draft.yTicks, unit: p.unit ?? draft.unit, showLegend: p.showLegend ?? draft.showLegend })
    toast.success('Query generated from your description')
  }

  const spec = {
    kind: 'Panel',
    spec: {
      display: { name: draft.name, description: draft.description || undefined },
      plugin: { kind: draft.type === 'timeseries' ? 'TimeSeriesChart' : draft.type, spec: { yAxis: { label: draft.unit }, legend: { show: draft.showLegend } } },
      queries: [{ kind: draft.queryType, spec: { query: draft.sql } }],
    },
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={900}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
          Edit Panel
          <span style={{ fontSize: 13, fontWeight: 400, color: '#98a2b3' }}>(ID: {draft.id})</span>
        </span>
      }
      extra={
        <div className={styles.drawerFoot}>
          <Button color="invisible" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={onApply}>Apply</Button>
        </div>
      }
    >
      <div className={styles.editForm}>
        <div className={styles.editField}>
          <label>Name</label>
          <Input value={draft.name} size="m" fullWidth onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className={styles.editField}>
          <label>Group</label>
          <Select fullWidth value={targetGroup} onChange={(_e, v) => setTargetGroup(v)} options={groups.map((g) => ({ label: g.name, value: g.id }))} />
        </div>
        <div className={styles.editField}>
          <label>Description</label>
          <Input value={draft.description} size="m" fullWidth placeholder="Optional" onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className={styles.editField}>
          <label>Type</label>
          <Select fullWidth value={draft.type} onChange={(_e, v) => set({ type: v as PanelType })} options={PANEL_TYPE_OPTIONS} />
          <span className={styles.vizHint}><BarChart3 size={12} /> Suggested: {viz.type} — {viz.reason}</span>
        </div>
      </div>

      <div className={styles.previewTitle}>Preview</div>
      <Card className={styles.previewCard}>
        <Card.Content title={draft.name || 'Untitled panel'}>
          <LineChart panel={draft} height={220} />
        </Card.Content>
      </Card>

      <div className={styles.editTabs}>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          tabs={[
            { key: 'query', label: 'Query' },
            { key: 'general', label: 'General settings' },
            { key: 'querySettings', label: 'Query settings' },
            { key: 'links', label: 'Links' },
            { key: 'json', label: 'JSON' },
          ]}
        />
      </div>

      {tab === 'query' && (
        <div className={styles.queryBlock}>
          {/* NL → SQL : passer outre l'écriture de requête */}
          <form className={styles.aiRow} onSubmit={(e) => { e.preventDefault(); generate() }}>
            <span className={styles.aiRowIcon}><Sparkles size={14} /></span>
            <Input
              value={aiText}
              size="m"
              fullWidth
              placeholder="Describe the data instead of writing SQL… e.g. p95 duration by service"
              onChange={(e) => setAiText(e.target.value)}
            />
            <Button type="submit" color="secondary" icon={Wand2} disabled={!aiText.trim()}>Generate</Button>
          </form>

          <div className={styles.queryHead}>
            <span className={styles.queryHeadLeft}><ChevronDown size={16} /> Query #1</span>
            <Button color="secondary" icon={RotateCw} onClick={() => toast.success('Query executed successfully')}>Run query</Button>
          </div>
          <div className={styles.editField} style={{ maxWidth: 320, marginBottom: 16 }}>
            <label>Query type</label>
            <Select fullWidth value={draft.queryType} onChange={(_e, v) => set({ queryType: v as QueryType })} options={QUERY_TYPE_OPTIONS} />
          </div>
          <div className={styles.sqlLabel}>ClickHouse SQL</div>
          <textarea className={styles.sqlEditor} value={draft.sql} spellCheck={false} onChange={(e) => set({ sql: e.target.value })} />
          <div className={styles.sqlHint}>{SQL_HINT}</div>
          <div className={styles.addQueryRow}>
            <Button color="secondary" icon={Plus} onClick={() => toast.info('This proto supports a single query per panel')}>Add query</Button>
          </div>
        </div>
      )}

      {tab === 'general' && (
        <div className={styles.queryBlock}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 420 }}>
            <Toggle title="Show legend" description="Display the series legend below the chart." value={draft.showLegend} onChange={(v) => set({ showLegend: v })} />
            <div className={styles.editField}>
              <label>Y-axis label</label>
              <Input value={draft.unit} size="m" fullWidth onChange={(e) => set({ unit: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className={styles.editField} style={{ flex: 1 }}>
                <label>Y min</label>
                <Input value={String(draft.yMin)} size="m" type="number" fullWidth onChange={(e) => set({ yMin: Number(e.target.value) })} />
              </div>
              <div className={styles.editField} style={{ flex: 1 }}>
                <label>Y max</label>
                <Input value={String(draft.yMax)} size="m" type="number" fullWidth onChange={(e) => set({ yMax: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'querySettings' && <div className={styles.tabPlaceholder}>Datasource, tenant scoping and query timeout are inherited from the operator.</div>}
      {tab === 'links' && <div className={styles.tabPlaceholder}>No panel links yet. Links let you jump from a data point to a trace or log view.</div>}
      {tab === 'json' && <pre className={styles.jsonBox}>{JSON.stringify(spec, null, 2)}</pre>}
    </Drawer>
  )
}

/* ─── Intent chooser ─── */
const QUICK_METRICS: { label: string; prompt: string }[] = [
  { label: 'Spans (count)', prompt: 'spans count' },
  { label: 'Error rate', prompt: 'error rate' },
  { label: 'Duration (p95)', prompt: 'p95 duration' },
  { label: 'Request rate', prompt: 'request rate' },
]

/* ─── Main Perses view ─── */
const PersesView = () => {
  const dashboard = useDashboard()
  const dirty = useDashboardDirty()

  const [range, setRange] = useState('1h')
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])

  const [editing, setEditing] = useState<EditState>(null)
  const [editDraft, setEditDraft] = useState<Panel | null>(null)
  const [editTargetGroup, setEditTargetGroup] = useState('')
  const [expanded, setExpanded] = useState<Panel | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const [aiOpen, setAiOpen] = useState(false)
  const [intentGroup, setIntentGroup] = useState<string | null>(null) // group id to add into; open when non-null

  const [dragId, setDragId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)

  const activeKeys = dashboard.groups.map((g) => g.id).filter((id) => !collapsedGroups.includes(id))

  const openEditorFor = (groupId: string, panelId: string) => {
    const panel = dashboard.groups.find((g) => g.id === groupId)?.panels.find((p) => p.id === panelId)
    if (!panel) return
    setEditing({ groupId, panelId })
    setEditDraft(clone(panel))
    setEditTargetGroup(groupId)
  }

  /* ── intent chooser handlers ── */
  const addFromMetric = (prompt: string, groupId: string) => {
    const spec = interpretPrompt(prompt).panels[0]
    dashboardStore.addPanel(spec, groupId)
    setIntentGroup(null)
    toast.success('Panel added to the dashboard')
  }

  const addBlankPanel = (groupId: string) => {
    const spec: PanelSpec = {
      name: 'New panel',
      queryType: 'clickhouse-sql',
      sql: 'SELECT toStartOfInterval(Timestamp, INTERVAL 300 SECOND) AS t, count() AS value FROM otel_traces\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t ORDER BY t',
    }
    const id = dashboardStore.addPanel(spec, groupId)
    setIntentGroup(null)
    openEditorFor(groupId, id)
  }

  const askAiFor = () => {
    setIntentGroup(null)
    setAiOpen(true)
  }

  const addGroup = () => {
    dashboardStore.addEmptyGroup('New group')
    toast.info('Panel group added')
  }

  const save = () => { dashboardStore.save(); toast.success('Dashboard saved successfully') }
  const cancel = () => { dashboardStore.reset(); toast.info('Changes discarded') }

  const zoom = (dir: -1 | 1) => {
    const idx = TIME_RANGE_OPTIONS.findIndex((o) => o.value === range)
    setRange(TIME_RANGE_OPTIONS[Math.min(TIME_RANGE_OPTIONS.length - 1, Math.max(0, idx + dir))].value)
  }

  const moveGroup = (id: string, dir: -1 | 1) =>
    dashboardStore.update((d) => {
      const i = d.groups.findIndex((g) => g.id === id)
      const j = i + dir
      if (j < 0 || j >= d.groups.length) return d
      ;[d.groups[i], d.groups[j]] = [d.groups[j], d.groups[i]]
      return d
    })

  const applyRename = () => {
    if (!renaming) return
    const name = renameValue.trim() || 'Untitled group'
    dashboardStore.update((d) => ({ ...d, groups: d.groups.map((g) => (g.id === renaming ? { ...g, name } : g)) }))
    setRenaming(null)
  }

  const applyEdit = () => {
    if (!editing || !editDraft) return
    const { groupId, panelId } = editing
    const draft = editDraft
    dashboardStore.update((d) => {
      const from = d.groups.find((g) => g.id === groupId)!
      from.panels = from.panels.filter((p) => p.id !== panelId)
      const to = d.groups.find((g) => g.id === editTargetGroup) ?? from
      to.panels.push(draft)
      return d
    })
    setEditing(null); setEditDraft(null)
    toast.success('Panel updated successfully')
  }

  const duplicatePanel = (groupId: string, panel: Panel) =>
    dashboardStore.update((d) => {
      const g = d.groups.find((x) => x.id === groupId)!
      const i = g.panels.findIndex((p) => p.id === panel.id)
      g.panels.splice(i + 1, 0, { ...clone(panel), id: `${panel.id}_copy_${g.panels.length}`, name: `${panel.name} (copy)` })
      return d
    })

  const deletePanel = (groupId: string, panelId: string) => {
    dashboardStore.update((d) => { const g = d.groups.find((x) => x.id === groupId)!; g.panels = g.panels.filter((p) => p.id !== panelId); return d })
    toast.info('Panel removed')
  }

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDropId(null); return }
    dashboardStore.update((d) => {
      let moved: Panel | null = null
      for (const g of d.groups) {
        const i = g.panels.findIndex((p) => p.id === dragId)
        if (i >= 0) { moved = g.panels.splice(i, 1)[0]; break }
      }
      if (!moved) return d
      for (const g of d.groups) {
        const j = g.panels.findIndex((p) => p.id === targetId)
        if (j >= 0) { g.panels.splice(j, 0, moved); break }
      }
      return d
    })
    setDragId(null); setDropId(null)
  }

  /* ── menus ── */
  const groupMenu = (group: PanelGroup, gi: number) => ({
    options: [
      { key: 'add', label: 'Add panel', icon: <Plus {...mi()} /> },
      { key: 'rename', label: 'Rename group', icon: <Pencil {...mi()} /> },
      { key: 'up', label: 'Move up', icon: <ArrowUp {...mi()} />, disabled: gi === 0 },
      { key: 'down', label: 'Move down', icon: <ArrowDown {...mi()} />, disabled: gi === dashboard.groups.length - 1 },
      { type: 'divider' as const },
      { key: 'delete', label: 'Delete group', icon: <Trash2 {...mi()} />, danger: true },
    ],
    onClick: (key: string) => {
      if (key === 'add') setIntentGroup(group.id)
      else if (key === 'rename') { setRenaming(group.id); setRenameValue(group.name) }
      else if (key === 'up') moveGroup(group.id, -1)
      else if (key === 'down') moveGroup(group.id, 1)
      else if (key === 'delete') { dashboardStore.update((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== group.id) })); toast.info('Panel group removed') }
    },
  })

  const panelMenu = (group: PanelGroup, panel: Panel) => ({
    options: [
      { key: 'edit', label: 'Edit', icon: <Pencil {...mi()} /> },
      { key: 'duplicate', label: 'Duplicate', icon: <Copy {...mi()} /> },
      { key: 'expand', label: 'Expand', icon: <Maximize2 {...mi()} /> },
      { key: 'export', label: 'Export as PNG', icon: <Download {...mi()} /> },
      { type: 'divider' as const },
      { key: 'delete', label: 'Delete', icon: <Trash2 {...mi()} />, danger: true },
    ],
    onClick: (key: string) => {
      if (key === 'edit') openEditorFor(group.id, panel.id)
      else if (key === 'duplicate') duplicatePanel(group.id, panel)
      else if (key === 'expand') setExpanded(panel)
      else if (key === 'export') toast.success('Panel exported successfully')
      else if (key === 'delete') deletePanel(group.id, panel.id)
    },
  })

  const dashMenu = {
    options: [
      { key: 'zin', label: 'Zoom in', icon: <ZoomIn {...mi()} /> },
      { key: 'zout', label: 'Zoom out', icon: <ZoomOut {...mi()} /> },
      { type: 'divider' as const },
      { key: 'export', label: 'Export dashboard', icon: <Download {...mi()} /> },
      { key: 'json', label: 'View JSON', icon: <Braces {...mi()} /> },
    ],
    onClick: (key: string) => {
      if (key === 'zin') zoom(-1)
      else if (key === 'zout') zoom(1)
      else if (key === 'export') toast.success('Dashboard exported successfully')
      else if (key === 'json') toast.info('Dashboard spec copied to clipboard')
    },
  }

  /* ── panel card ── */
  const renderPanel = (group: PanelGroup, panel: Panel) => {
    const menu = panelMenu(group, panel)
    return (
      <div
        key={panel.id}
        className={[
          panel.span === 3 ? `${styles.panelWrap} ${styles.wide}` : styles.panelWrap,
          dragId === panel.id ? styles.dragging : '',
          dropId === panel.id ? styles.dropTarget : '',
        ].join(' ')}
        draggable
        onDragStart={() => setDragId(panel.id)}
        onDragEnd={() => { setDragId(null); setDropId(null) }}
        onDragOver={(e) => { e.preventDefault(); if (panel.id !== dragId) setDropId(panel.id) }}
        onDragLeave={() => setDropId((cur) => (cur === panel.id ? null : cur))}
        onDrop={(e) => { e.preventDefault(); onDrop(panel.id) }}
      >
        <Card className={styles.panelCard}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle} title={panel.name}>{panel.name}</span>
            <span className={styles.panelAside}>
              <span className={styles.grip} title="Drag to reorder"><GripVertical size={15} /></span>
              <ActionMenu options={menu.options} onClick={menu.onClick} />
            </span>
          </div>
          <LineChart panel={panel} height={panel.span === 3 ? 240 : 172} />
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.view}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.dashName}>
          {dashboard.name}
          <StatusTag variant="ghost" color="warning">Beta</StatusTag>
        </div>
        <div className={styles.toolbarActions}>
          <Button color="secondary" icon={Sparkles} onClick={() => setAiOpen(true)}>Ask AI</Button>
          <span className={styles.actionsDivider} />
          <ButtonGroup>
            <Button color="secondary" icon={PlusSquare} onClick={() => setIntentGroup(dashboard.groups[0]?.id ?? null)}>Panel</Button>
            <Button color="secondary" icon={LayoutGrid} onClick={addGroup}>Panel group</Button>
          </ButtonGroup>
          <span className={styles.actionsDivider} />
          <Button color="primary" icon={Save} disabled={!dirty} onClick={save}>Save</Button>
          <Button color="invisible" icon={X} onClick={cancel}>Cancel</Button>
        </div>
      </div>

      {/* Operator + time controls */}
      <div className={styles.controls}>
        <div className={styles.operatorWrap}>
          <Select label="operator" fullWidth disabled value={dashboard.operator} options={[{ label: dashboard.operator, value: dashboard.operator }]} />
        </div>
        <Select value={range} onChange={(_e, v) => setRange(v)} options={TIME_RANGE_OPTIONS} icon={Calendar} minWidth="150px" />
        <RefreshButton interval="30s" iconOnly handleRefresh={() => toast.info('Refreshing dashboard…')} />
        <ActionMenu options={dashMenu.options} onClick={dashMenu.onClick} />
      </div>

      {/* Groups */}
      <Collapse
        ghost
        expandIconPosition="start"
        collapsible="icon"
        activeKeys={activeKeys}
        onChange={(k) => {
          const open = Array.isArray(k) ? k : [k]
          setCollapsedGroups(dashboard.groups.map((g) => g.id).filter((id) => !open.includes(id)))
        }}
        items={dashboard.groups.map((group, gi) => {
          const menu = groupMenu(group, gi)
          return {
            key: group.id,
            label: (
              <span className={styles.groupLabel}>
                {group.name}
                <span className={styles.groupCount}>{group.panels.length}</span>
              </span>
            ),
            extra: () => (
              <span onClick={(e) => e.stopPropagation()}>
                <ActionMenu options={menu.options} onClick={menu.onClick} />
              </span>
            ),
            children: (
              <div className={styles.grid}>
                {group.panels.length === 0 ? (
                  <div className={styles.emptyGroup}>
                    <p className={styles.emptyTitle}>This group is empty. How do you want to start?</p>
                    <div className={styles.emptyActions}>
                      <Button color="primary" icon={Sparkles} onClick={askAiFor}>Describe with AI</Button>
                      <Button color="secondary" icon={BarChart3} onClick={() => setIntentGroup(group.id)}>Pick a metric</Button>
                      <Button color="invisible" icon={FileCode} onClick={() => addBlankPanel(group.id)}>Blank SQL panel</Button>
                    </div>
                  </div>
                ) : (
                  group.panels.map((panel) => renderPanel(group, panel))
                )}
              </div>
            ),
          }
        })}
      />

      <EditPanelDrawer
        open={editing !== null}
        draft={editDraft}
        groups={dashboard.groups}
        targetGroup={editTargetGroup}
        setTargetGroup={setEditTargetGroup}
        onChange={setEditDraft}
        onApply={applyEdit}
        onClose={() => { setEditing(null); setEditDraft(null) }}
      />

      <Drawer open={expanded !== null} onClose={() => setExpanded(null)} width={960} title={expanded?.name ?? 'Panel'}>
        {expanded && <LineChart panel={{ ...expanded, span: 3 }} height={420} />}
      </Drawer>

      {/* Rename group */}
      <Modal open={renaming !== null} onCancel={() => setRenaming(null)} title="Rename panel group" width={420}>
        <Modal.Content>
          <Input label="Group name" value={renameValue} size="m" fullWidth onChange={(e) => setRenameValue(e.target.value)} />
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.drawerFoot}>
            <Button color="invisible" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button color="primary" onClick={applyRename}>Save</Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Intent chooser — never start from a blank grid */}
      <Modal open={intentGroup !== null} onCancel={() => setIntentGroup(null)} title="Add a panel" width={520}>
        <Modal.Content>
          <button className={styles.intentOption} onClick={askAiFor}>
            <span className={`${styles.intentIcon} ${styles.intentAi}`}><Sparkles size={18} /></span>
            <span className={styles.intentText}>
              <b>Describe it with AI</b>
              <small>Say what you want in plain English — Kappti AI writes the query.</small>
            </span>
          </button>
          <div className={styles.intentDivider}>or pick a metric</div>
          <div className={styles.metricGrid}>
            {QUICK_METRICS.map((m) => (
              <button key={m.label} className={styles.metricBtn} onClick={() => addFromMetric(m.prompt, intentGroup!)}>
                <BarChart3 size={14} /> {m.label}
              </button>
            ))}
          </div>
          <button className={styles.intentOptionSlim} onClick={() => addBlankPanel(intentGroup!)}>
            <FileCode size={16} /> Start from a blank SQL panel
          </button>
        </Modal.Content>
      </Modal>

      <AiAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}

export default PersesView
