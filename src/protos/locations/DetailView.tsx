import { useState } from 'react'
import { Bot, Check, Globe, RotateCcw, Smartphone, Wrench, Zap } from 'lucide-react'
import { Button, Tabs, Toggle, EmptyState, StatusTag, Tag, IconSearchX } from '@kapptivate/ui-kit'
import styles from './locations.module.scss'
import { zonePretty, type Location } from './constants'
import { StatusBadge, ScopeBadge } from './Badges'

type Props = {
  loc: Location
}

type Kind = 'public' | 'appliance' | 'desktop'

const DetailView = ({ loc }: Props) => {
  const isPublic = loc.kind === 'public'
  const kind: Kind = isPublic ? 'public' : loc.runner === 'appliance' ? 'appliance' : 'desktop'

  const tabList: string[] =
    kind === 'public'
      ? ['General', 'Usage', 'Settings', 'Event logs']
      : kind === 'appliance'
        ? ['General', 'Usage', 'Capacity', 'Monitors', 'Settings', 'Event logs']
        : ['General', 'Usage', ...(loc.devices?.length ? ['Devices'] : []), 'Settings', 'Event logs']

  const [active, setActive] = useState('General')

  const actions = isPublic ? (
    <Button color="secondary" icon={Check}>
      Set as default
    </Button>
  ) : kind === 'appliance' ? (
    <>
      <Button color="danger-s" icon={RotateCcw}>
        Reboot robot
      </Button>
      <Button color="secondary" icon={Zap}>
        Test-only mode
      </Button>
      <Button color="secondary" icon={Wrench}>
        Set in maintenance
      </Button>
    </>
  ) : (
    <>
      <Button color="danger-s" icon={RotateCcw}>
        Reboot runner
      </Button>
      <Button color="secondary" icon={Wrench}>
        Set in maintenance
      </Button>
    </>
  )

  return (
    <div className={styles.content}>
      <div className={styles.detailHead}>
        <div className={styles.detailTitle}>
          <h1>{loc.name}</h1>
          <StatusBadge status={loc.status} />
          <ScopeBadge loc={loc} />
        </div>
        <div className={styles.detailActions}>{actions}</div>
      </div>

      <div className={styles.tabsRow}>
        <Tabs
          activeKey={active}
          onChange={setActive}
          tabs={tabList.map((t) => ({
            key: t,
            label:
              t === 'Monitors' ? (
                <>
                  Monitors<span className={styles.tabCount}>1</span>
                </>
              ) : (
                t
              ),
          }))}
        />
      </div>

      {active === 'General' && <GeneralTab loc={loc} kind={kind} />}
      {active === 'Usage' && <UsageTab loc={loc} />}
      {active === 'Capacity' && <CapacityTab />}
      {active === 'Monitors' && <MonitorsTab loc={loc} />}
      {active === 'Devices' && <DevicesTab loc={loc} />}
      {active === 'Settings' && <SettingsTab loc={loc} />}
      {active === 'Event logs' && <EventsTab />}
    </div>
  )
}

/* ---------- General ---------- */
const GeneralTab = ({ loc, kind }: { loc: Location; kind: Kind }) => {
  const isPublic = kind === 'public'
  const stats: [string, string, string, boolean?][] = isPublic
    ? [
        ['Uptime (30d)', '99.98%', ''],
        ['Test runs (30d)', '1,284', '+12% vs prev', true],
        ['Success rate', '97.3%', ''],
        ['Avg duration', '4.2s', ''],
      ]
    : [
        ['Status', loc.status === 'offline' ? 'Offline' : 'Online', loc.status === 'offline' ? '12h ago' : 'since 6 days'],
        ['Test runs (30d)', '342', ''],
        ['Success rate', '95.1%', ''],
        [loc.devices?.length ? 'Devices' : 'Concurrency', loc.devices?.length ? String(loc.devices.length) : '2 parallel', ''],
      ]

  const runs: [string, 'ok' | 'fail', string, string][] = [
    ['Test Web', 'ok', '5s', '2h ago'],
    ['Test API', 'ok', '0s', '5h ago'],
    ['Test Smartphone', 'ok', '11s', '1d ago'],
    ['Login flow', 'fail', '8s', '2d ago'],
  ]

  return (
    <>
      <div className={styles.kpis}>
        {stats.map((s) => (
          <div className={styles.kpi} key={s[0]}>
            <div className={styles.kpiL}>{s[0]}</div>
            <div className={styles.kpiVal}>{s[1]}</div>
            {s[2] && <div className={`${styles.kpiSub} ${s[3] ? styles.up : ''}`}>{s[2]}</div>}
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        <div>
          <div className={styles.block}>
            <h4>About</h4>
            <div style={{ display: 'flex', gap: 20 }}>
              {kind === 'appliance' && (
                <div className={styles.robotPhoto}>
                  <Bot size={52} />
                </div>
              )}
              <div className={styles.kv} style={{ flex: 1 }}>
                <div>
                  <div className={styles.kvK}>Type</div>
                  <div className={styles.kvV}>
                    {isPublic ? 'Public location' : kind === 'appliance' ? 'Hardware robot' : 'Desktop runner'}
                  </div>
                </div>
                <div>
                  <div className={styles.kvK}>{isPublic ? 'Region' : 'Host'}</div>
                  <div className={styles.kvV}>{isPublic ? loc.region : loc.host}</div>
                </div>
                <div>
                  <div className={styles.kvK}>Zone</div>
                  <div className={styles.kvV}>{isPublic ? loc.zone : zonePretty(loc.zone)}</div>
                </div>
                <div>
                  <div className={styles.kvK}>Capabilities</div>
                  <div className={styles.kvV}>{loc.caps || 'Web · API'}</div>
                </div>
                <div>
                  <div className={styles.kvK}>Version</div>
                  <div className={`${styles.kvV} ${styles.mono}`}>{loc.version}</div>
                </div>
                {!isPublic && (
                  <div>
                    <div className={styles.kvK}>UUID</div>
                    <div className={`${styles.kvV} ${styles.mono}`}>{loc.uuid}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {kind === 'desktop' && (
            <div className={styles.block}>
              <h4>What this runner can run</h4>
              <div className={styles.capLine}>
                <span className={styles.capK}>Browsers</span>
                <span className={styles.capV}>
                  {loc.browsers?.length ? (
                    loc.browsers.map((b) => (
                      <span className={styles.chip2} key={b}>
                        <Globe size={13} />
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className={styles.devSub}>None detected</span>
                  )}
                </span>
              </div>
              <div className={styles.capLine}>
                <span className={styles.capK}>Connected phones</span>
                <span className={styles.capV}>
                  {loc.devices?.length ? (
                    loc.devices.map((d) => (
                      <span className={styles.chip2} key={d.u}>
                        <Smartphone size={13} />
                        {d.n}
                      </span>
                    ))
                  ) : (
                    <span className={styles.devSub}>None connected</span>
                  )}
                </span>
              </div>
              <div className={styles.capLine}>
                <span className={styles.capK}>Prerequisites</span>
                <span className={styles.capV}>
                  <span className={styles.chip2}>
                    <Globe size={13} />
                    Playwright
                  </span>
                  {loc.caps === 'Mobile' && (
                    <span className={styles.chip2}>
                      <Smartphone size={13} />
                      adb · Appium
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className={styles.block}>
            <h4>
              Recent executions
              <Button color="secondary" size="s">
                View all
              </Button>
            </h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r[0]}>
                    <td className={styles.devName}>{r[0]}</td>
                    <td>
                      {r[1] === 'ok' ? (
                        <StatusTag variant="ghost" color="success">
                          Success
                        </StatusTag>
                      ) : (
                        <StatusTag variant="ghost" color="failed">
                          Failed
                        </StatusTag>
                      )}
                    </td>
                    <td className={styles.devSub}>{r[2]}</td>
                    <td className={styles.devSub}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {kind !== 'desktop' && !!loc.devices?.length && <DevicesTab loc={loc} embedded />}
        </div>

        <div>
          <div className={`${styles.block} ${styles.sideBlock}`}>
            {isPublic ? (
              <>
                <h4>About public locations</h4>
                <p>
                  Public locations are hosted and maintained by kapptivate. They run your web and
                  API tests on Playwright, with no installation on your side.
                </p>
                <p>Available to every workspace as soon as you sign up.</p>
              </>
            ) : (
              <>
                <h4>{kind === 'appliance' ? 'Robot' : 'Runner'}</h4>
                <p>
                  This private location is powered by{' '}
                  {kind === 'appliance'
                    ? 'a kapptivate robot on the client network'
                    : 'the kapptivate Desktop app running on a user machine'}
                  .
                </p>
                <p>
                  Scope:{' '}
                  <strong>
                    {loc.scope === 'personal'
                      ? `personal to ${loc.owner || 'the owner'}`
                      : 'shared with the whole workspace'}
                  </strong>
                  .
                </p>
              </>
            )}
          </div>
          <div className={`${styles.block} ${styles.sideBlock}`}>
            <h4>Used by</h4>
            <div className={styles.usedRow}>
              <span>Monitors</span>
              <strong>1</strong>
            </div>
            <div className={styles.usedRow}>
              <span>Scheduled tests</span>
              <strong>7</strong>
            </div>
            <div className={styles.usedRow}>
              <span>Allowed products</span>
              <strong>All</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- Usage (heatmap) ---------- */
const UsageTab = ({ loc }: { loc: Location }) => {
  const hours = ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', '11h']
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hot: Record<string, Record<string, string>> = {
    '0h': { Fri: '0.5%', Sat: '8.8%' },
    '10h': { Fri: '1.0%', Sun: '17.2%' },
    '11h': { Sun: '27.3%' },
  }
  return (
    <div className={styles.block}>
      <h4>
        Usage (weekly average)
        <Tag color="grey">Not used · 0.0%</Tag>
      </h4>
      <div className={styles.ugTop}>
        <span>Global usage on last week</span>
        <span>9.5%</span>
      </div>
      <div className={styles.ugBar}>
        <div className={styles.ugFill} style={{ width: '9.5%' }} />
      </div>
      <div className={styles.hint}>
        <span>ⓘ</span> This {loc.runner === 'appliance' ? 'robot' : 'runner'} is not very used, so
        don't hesitate to distribute your monitoring more evenly to improve efficiency.
      </div>
      <h4 style={{ marginTop: 24 }}>Usage details on last week</h4>
      <table className={styles.heat}>
        <thead>
          <tr>
            <th />
            {days.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h}>
              <td className="h">{h}</td>
              {days.map((d) => {
                const v = hot[h]?.[d]
                return (
                  <td key={d} className={v ? 'hot' : ''}>
                    {v || '0.0%'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Capacity ---------- */
const CapacityTab = () => (
  <>
    <div className={styles.block}>
      <h4>Parallel tests capacity</h4>
      <div style={{ maxWidth: 240 }}>
        <div className={styles.field}>
          <label>Capacity</label>
          <Button color="secondary" fullWidth>
            2 parallel tests
          </Button>
        </div>
      </div>
    </div>
    <div className={styles.hint} style={{ marginTop: 12 }}>
      <span>ⓘ</span> The capacity is determined by your licence. It allows you to increase the
      number of browsers available for web testing.
    </div>
  </>
)

/* ---------- Monitors ---------- */
const MonitorsTab = ({ loc }: { loc: Location }) => (
  <div className={styles.block} style={{ padding: 0, overflow: 'hidden' }}>
    <div className={styles.monGroup}>⌘ POC</div>
    <div className={styles.monRow}>
      <span className={styles.monDot}>✓</span>
      <span style={{ fontWeight: 600 }}>Demo API</span>
      <StatusTag variant="ghost" color="success">
        Up
      </StatusTag>
      <span className={styles.devSub} style={{ marginLeft: 'auto' }}>
        10 min · {loc.zone.split('/').pop()} · {loc.name}
      </span>
    </div>
  </div>
)

/* ---------- Devices ---------- */
const DevicesTab = ({ loc, embedded }: { loc: Location; embedded?: boolean }) => {
  if (!loc.devices?.length)
    return embedded ? null : (
      <EmptyState
        icon={<Smartphone size={40} />}
        text="No connected device"
        description="This runner has no device attached."
      />
    )
  return (
    <div className={styles.block} style={embedded ? { marginTop: 20 } : undefined}>
      <h4>
        Connected devices<span className={styles.tabCount}>{loc.devices.length}</span>
      </h4>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Device</th>
            <th>Status</th>
            <th>UUID</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          {loc.devices.map((d) => (
            <tr key={d.u}>
              <td>
                <div className={styles.devName}>{d.n}</div>
                <div className={styles.devSub}>{d.s}</div>
              </td>
              <td>
                <StatusBadge status="online" />
              </td>
              <td className={styles.devSub} style={{ fontFamily: 'var(--mono)' }}>
                {d.u}
              </td>
              <td className={styles.devSub}>Not used</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Settings ---------- */
const SettingsTab = ({ loc }: { loc: Location }) => {
  const items = [
    'About',
    'Software update',
    'Automatic reboot',
    loc.runner === 'appliance' ? 'Robot credentials' : 'Runner credentials',
    'Network configuration',
    'Danger zone',
  ]
  const [sel, setSel] = useState('About')
  return (
    <div className={styles.setWrap}>
      <div className={styles.setNav}>
        {items.map((s) => (
          <button key={s} className={s === sel ? 'active' : ''} onClick={() => setSel(s)}>
            {s}
          </button>
        ))}
      </div>
      <div>
        <div className={styles.block}>
          <h4>About</h4>
          <div className={styles.field}>
            <label>Name</label>
            <input defaultValue={loc.name} />
          </div>
          <Button color="secondary">Save changes</Button>
        </div>
        <div className={styles.block}>
          <h4>Software update</h4>
          <div style={{ marginBottom: 14 }}>
            <Toggle title="Automatic updates" />
          </div>
          <div style={{ border: '1px solid var(--color-border, #e4e4e7)', borderRadius: 10, padding: 14, fontSize: 13.5 }}>
            <b>Version {loc.version}</b>
            <div className={styles.devSub}>Current version</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Event logs ---------- */
const EventsTab = () => (
  <EmptyState
    icon={<IconSearchX size={40} />}
    text="No history for this time range"
    description="Use the time range picker to refine your search and get better results."
  />
)

export default DetailView
