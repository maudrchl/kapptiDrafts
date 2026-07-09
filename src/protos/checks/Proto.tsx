import { useState } from 'react'
import {
  Select,
  Input,
  Button,
  ButtonGroup,
  Breadcrumb,
  StatusTag,
  Dropdown,
  Tabs,
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
  IconChevronDown,
  IconMoreVertical,
  IconZap,
  IconLock,
  IconStar,
  IconTrash,
  IconSave,
  IconFlag,
  IconGlobe,
  IconNetwork,
  IconPlay,
  IconPlus,
  IconMoreHorizontal,
  IconCopy,
} from '@kapptivate/ui-kit'
import styles from './checks.module.scss'
import {
  INITIAL_CONDITIONS,
  SUBJECTS,
  NUM_OPS,
  UNITS,
  predsFor,
  predNeedsValue,
  resetForKind,
  triggerText,
  type Condition,
  type Severity,
} from './constants'

let uid = 100
const nextId = () => `c${++uid}`

const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }))
const optVal = (v: any): string => (v && typeof v === 'object' ? v.value : v)
const ACTION_OPTIONS = ['API Call', 'Navigate', 'Click', 'Fill in', 'Assert', 'Wait']
const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const ChecksProto = () => {
  const [tab, setTab] = useState('checks')
  const [sevLayout, setSevLayout] = useState<'inline' | 'groups'>('groups')
  const [logic, setLogic] = useState<'and' | 'or'>('and')
  const [failLogic, setFailLogic] = useState<'and' | 'or'>('and')
  const [warnLogic, setWarnLogic] = useState<'and' | 'or'>('and')
  const [conds, setConds] = useState<Condition[]>(() =>
    INITIAL_CONDITIONS.map((c) => ({ ...c })),
  )
  const [method, setMethod] = useState('GET')
  const [action, setAction] = useState('API Call')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')
  const [startUrl, setStartUrl] = useState('https://kapptivate.com')

  const patch = (id: string, next: Partial<Condition>) =>
    setConds((cur) => cur.map((c) => (c.id === id ? { ...c, ...next } : c)))
  const remove = (id: string) =>
    setConds((cur) => cur.filter((c) => c.id !== id))
  const add = () =>
    setConds((cur) => [
      ...cur,
      { id: nextId(), sev: 'fail', ...resetForKind('Status code') } as Condition,
    ])
  const duplicate = (c: Condition) =>
    setConds((cur) => {
      const i = cur.findIndex((x) => x.id === c.id)
      const next = [...cur]
      next.splice(i + 1, 0, { ...c, id: nextId() })
      return next
    })

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
            options={toOptions(NUM_OPS)}
            value={c.op ?? '='}
            onChange={(_e: unknown, v: string) => patch(c.id, { op: optVal(v) })}
          />
          {valInput(c)}
          {c.kind === 'time' ? (
            <Select
              size="s"
              borderless
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
        options={SUBJECTS.map((s) => ({ label: s.label, value: s.label }))}
        value={c.subj}
        onChange={(_e: unknown, v: string) => patch(c.id, resetForKind(optVal(v)))}
      />
      {exprTail(c)}
    </div>
  )

  const sevControl = (c: Condition) => (
    <Dropdown
      trigger="click"
      placement="bottomRight"
      menu={{
        onClick: ({ key }: { key: string }) => patch(c.id, { sev: key as Severity }),
        items: [
          { key: 'fail', label: sevLabel(false, 'Fails the step') },
          { key: 'warn', label: sevLabel(true, 'Sets a warning') },
        ],
      }}
    >
      <span className={styles.sevTrigger}>
        <StatusTag variant="ghost" color={c.sev === 'warn' ? 'warning' : 'failed'}>
          {c.sev === 'warn' ? 'Sets a warning' : 'Fails the step'}
        </StatusTag>
        <span className={styles.sevChev}>
          <IconChevronDown size={13} />
        </span>
      </span>
    </Dropdown>
  )

  const rowMenu = (c: Condition, mode: 'inline' | 'groups') => (
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
          ...(mode === 'groups'
            ? [
                {
                  key: 'move',
                  label: c.sev === 'fail' ? 'Move to Warning' : 'Move to Failed',
                },
                { type: 'divider' as const },
              ]
            : []),
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

  // Le dot ouvre un dropdown pour changer la sévérité (reclasse la condition)
  const sevDot = (c: Condition) => (
    <Dropdown
      trigger="click"
      placement="bottomRight"
      menu={{
        onClick: ({ key }: { key: string }) => patch(c.id, { sev: key as Severity }),
        items: [
          { key: 'fail', label: sevLabel(false, 'Fails the step') },
          { key: 'warn', label: sevLabel(true, 'Sets a warning') },
        ],
      }}
    >
      <span className={styles.sevTrigger} aria-label="Change severity">
        <span className={c.sev === 'warn' ? styles.sevDotWarn : styles.sevDotFail} />
        <span className={styles.sevChev}>
          <IconChevronDown size={13} />
        </span>
      </span>
    </Dropdown>
  )

  // Modèle proposé par l'équipe : « Check if [condition], else 🔴 »
  // → condition d'abord, point de sévérité APRÈS, en position « else ».
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
      width="46px"
      disabled={disabled}
      options={toOptions(['and', 'or'])}
      value={value}
      onChange={(_e: unknown, v: string) => onSet(optVal(v) as 'and' | 'or')}
    />
  )

  const addBtn = (
    <div className={styles.addWrap}>
      <Button color="secondary" size="s" icon={IconPlus} onClick={add}>
        Add condition
      </Button>
    </div>
  )

  // Option 1 : sévérité par condition (« Check if …, else 🔴 »), logique partagée.
  const condRow = (c: Condition, i: number) => (
    <div key={c.id} className={styles.cond}>
      {i === 0 ? (
        <span className={styles.checkIf}>Check if</span>
      ) : (
        connSelect(logic, setLogic, i > 1)
      )}
      <span className={styles.exprWrap}>{expr(c)}</span>
      <span className={styles.elseLabel}>, else</span>
      {sevDot(c)}
      {rowMenu(c, 'inline')}
    </div>
  )

  // Option 2 : chaque groupe = une expression and/or, la conséquence est portée
  // par le groupe → pas de pastille par ligne.
  const groupExpr = (
    c: Condition,
    i: number,
    gLogic: 'and' | 'or',
    setG: (v: 'and' | 'or') => void,
  ) => (
    <div key={c.id} className={styles.cond}>
      {i === 0 ? (
        <span className={styles.checkIf}>Check if</span>
      ) : (
        connSelect(gLogic, setG, i > 1)
      )}
      <span className={styles.exprWrap}>{expr(c)}</span>
      {rowMenu(c, 'groups')}
    </div>
  )

  const fails = conds.filter((c) => c.sev === 'fail')
  const warns = conds.filter((c) => c.sev === 'warn')

  const checksBody = () =>
    sevLayout === 'groups' ? (
      <div className={styles.checksBody}>
        <div className={styles.grp}>
          <div className={styles.grpHead}>
            <span className={styles.grpDotFail} />
            <span className={styles.grpTitleFail}>Failed</span>
            <span className={styles.grpNote}>conditions that fail the step</span>
          </div>
          <div className={styles.condList}>
            {fails.length ? (
              fails.map((c, i) => groupExpr(c, i, failLogic, setFailLogic))
            ) : (
              <div className={styles.grpEmpty}>No failing conditions</div>
            )}
          </div>
        </div>
        <div className={styles.grp}>
          <div className={styles.grpHead}>
            <span className={styles.grpDotWarn} />
            <span className={styles.grpTitleWarn}>Warning</span>
            <span className={styles.grpNote}>conditions that only warn</span>
          </div>
          <div className={styles.condList}>
            {warns.length ? (
              warns.map((c, i) => groupExpr(c, i, warnLogic, setWarnLogic))
            ) : (
              <div className={styles.grpEmpty}>No warning conditions</div>
            )}
          </div>
        </div>
        {addBtn}
      </div>
    ) : (
      <div className={styles.checksBody}>
        <div className={styles.condList}>{conds.map((c, i) => condRow(c, i))}</div>
        {addBtn}
      </div>
    )

  const tabPlaceholder = (label: string) => (
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
          {/* canvas */}
          <div className={styles.canvas}>
            <div className={styles.canvasInner}>
              <div className={styles.startRow}>
                <span className={styles.startFlag}><IconFlag size={16} /></span>
                <span className={styles.startLabel}>
                  <IconGlobe size={15} /> Navigate to starting page
                </span>
                <div className={styles.startField}>
                  <Input
                    size="s"
                    fullWidth
                    value={startUrl}
                    onChange={(e) => setStartUrl(e.target.value)}
                    iconRight={<IconBraces size={14} />}
                  />
                </div>
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

                <div className={styles.stepBody}>
                  <div className={styles.stepCard}>
                    <div className={styles.stepTop}>
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
                    <Input
                      size="s"
                      fullWidth
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      iconRight={<IconBraces size={14} />}
                    />
                    <div className={styles.chips}>
                      {conds.length === 0 ? (
                        <span className={styles.chipEmpty}>No success conditions yet</span>
                      ) : (
                        conds.map((c) => (
                          <span key={c.id} className={styles.chip}>
                            {triggerText(c)}
                            <span className={styles.chipArrow}>→</span>
                            <span
                              className={`${styles.chipDot} ${c.sev === 'warn' ? styles.dotWarn : styles.dotFail}`}
                            />
                          </span>
                        ))
                      )}
                    </div>
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

          {/* right panel */}
          <aside className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitleNum}>1</span>
              <span className={styles.panelTitle}>API Call</span>
              <div className={styles.panelHeaderActions}>
                <Button color="secondary" size="s" icon={IconSquareArrowOutUpRight} />
                <Button color="secondary" size="s" icon={IconCopy} />
                <Button color="danger-s" size="s" icon={IconTrash} />
              </div>
            </div>

            <Tabs
              className={styles.panelTabs}
              type="card"
              activeKey={tab}
              onChange={setTab}
              tabs={[
                { key: 'general', label: 'General', children: tabPlaceholder('General settings for this step.') },
                { key: 'variables', label: 'Variables', children: tabPlaceholder('Variables produced and consumed by this step.') },
                { key: 'checks', label: 'Checks', children: checksBody() },
                { key: 'advanced', label: 'Advanced settings', children: tabPlaceholder('Timeouts, retries and other advanced settings.') },
              ]}
            />
          </aside>
        </div>
      </div>

      {/* ---------- floating variants control ---------- */}
      <div className={styles.fab}>
        <div className={styles.fabHead}>Proto · explore</div>
        <div className={styles.fabRow}>
          <span className={styles.fabLbl}>Sévérité</span>
          <div className={styles.seg}>
            <button
              className={sevLayout === 'inline' ? styles.segBtnActive : styles.segBtn}
              onClick={() => setSevLayout('inline')}
            >
              Pastille par ligne
            </button>
            <button
              className={sevLayout === 'groups' ? styles.segBtnActive : styles.segBtn}
              onClick={() => setSevLayout('groups')}
            >
              Deux groupes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChecksProto
