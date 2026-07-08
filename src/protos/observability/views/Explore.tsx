import { useState } from 'react'
import { Button } from 'ui-kit'
import { Filter, LineChart, Network, ScrollText, Search } from 'lucide-react'
import styles from '../observability.module.scss'
import { LOGS, TRACES, type LogLevel, type TenantState, type ViewKey } from '../constants'
import Gate from '../Gate'

type Tab = 'logs' | 'traces' | 'metrics'

const LEVEL_CLS: Record<LogLevel, string> = {
  error: styles.tagError,
  warn: styles.tagWarn,
  info: styles.tagInfo,
  debug: styles.tagDebug,
}

const TABS: { key: Tab; label: string; icon: typeof ScrollText; ph: string }[] = [
  { key: 'logs', label: 'Logs', icon: ScrollText, ph: 'service:checkout level:error' },
  { key: 'traces', label: 'Traces', icon: Network, ph: 'duration:>300ms status:error' },
  { key: 'metrics', label: 'Metrics', icon: LineChart, ph: 'rate(http_requests_total[5m])' },
]

const Explore = ({
  tenant,
  onNavigate,
}: {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}) => {
  const [tab, setTab] = useState<Tab>('logs')
  const gate = <Gate tenant={tenant} onNavigate={onNavigate} what="telemetry" />
  if (tenant !== 'active') return gate

  const active = TABS.find((t) => t.key === tab)!

  return (
    <div className={styles.body}>
      <div className={styles.seg} style={{ marginBottom: 14 }}>
        {TABS.map((t) => {
          const I = t.icon
          return (
            <button
              key={t.key}
              className={t.key === tab ? styles.segBtnActive : styles.segBtn}
              onClick={() => setTab(t.key)}
            >
              <I size={15} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} />
          {active.ph}
        </div>
        <Button color="secondary" icon={Filter}>
          Filters
        </Button>
        <Button color="primary">Run</Button>
      </div>

      {tab === 'logs' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: 130 }}>Time</th>
                <th className={styles.th} style={{ width: 80 }}>Level</th>
                <th className={styles.th} style={{ width: 140 }}>Service</th>
                <th className={styles.th}>Message</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((l, i) => (
                <tr key={i} className={styles.trHover}>
                  <td className={`${styles.td} ${styles.mono} ${styles.muted}`}>{l.ts}</td>
                  <td className={styles.td}>
                    <span className={LEVEL_CLS[l.level]}>{l.level}</span>
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>{l.service}</td>
                  <td className={`${styles.td} ${styles.mono}`}>{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'traces' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Trace</th>
                <th className={styles.th} style={{ width: 140 }}>Service</th>
                <th className={styles.th} style={{ width: 90 }}>Spans</th>
                <th className={styles.th} style={{ width: 110 }}>Duration</th>
                <th className={styles.th} style={{ width: 90 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {TRACES.map((t, i) => (
                <tr key={i} className={styles.trHover}>
                  <td className={`${styles.td} ${styles.mono}`}>{t.name}</td>
                  <td className={`${styles.td} ${styles.mono}`}>{t.service}</td>
                  <td className={`${styles.td} ${styles.num}`}>{t.spans}</td>
                  <td className={`${styles.td} ${styles.num} ${styles.mono}`}>{t.duration} ms</td>
                  <td className={styles.td}>
                    <span className={t.status === 'error' ? styles.tagError : styles.tagOk}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'metrics' && (
        <div className={styles.tableWrap}>
          <MetricsChart />
        </div>
      )}
    </div>
  )
}

/* petit graphe SVG mock pour l'onglet Metrics */
const MetricsChart = () => {
  const pts = [22, 28, 24, 30, 42, 38, 55, 48, 62, 58, 40, 44]
  const w = 760
  const h = 220
  const max = 70
  const step = w / (pts.length - 1)
  const path = pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (v / max) * h}`)
    .join(' ')
  return (
    <div style={{ padding: 18 }}>
      <div className={styles.cardTitle} style={{ marginBottom: 4 }}>
        http_requests_total — rate 5m
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 220 }}>
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="#22403b" opacity="0.08" />
        <path d={path} fill="none" stroke="#22403b" strokeWidth={2.5} />
      </svg>
    </div>
  )
}

export default Explore
