import { useState } from 'react'
import { Button } from 'ui-kit'
import { Bell, Plus } from 'lucide-react'
import styles from '../observability.module.scss'
import {
  ALERTS,
  type AlertStatus,
  type Severity,
  type TenantState,
  type ViewKey,
} from '../constants'
import Gate from '../Gate'

const SEV_DOT: Record<Severity, string> = {
  critical: styles.dotDown,
  warning: styles.dotDegraded,
  info: styles.dotHealthy,
}
const STATUS_CLS: Record<AlertStatus, string> = {
  firing: styles.statusFiring,
  pending: styles.statusPending,
  resolved: styles.statusResolved,
}

type Filter = 'all' | AlertStatus

const Alerts = ({
  tenant,
  onNavigate,
}: {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}) => {
  const [filter, setFilter] = useState<Filter>('all')
  if (tenant !== 'active')
    return <Gate tenant={tenant} onNavigate={onNavigate} what="data to monitor" />

  const rows = ALERTS.filter((a) => filter === 'all' || a.status === filter)
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${ALERTS.length})` },
    { key: 'firing', label: `Firing (${ALERTS.filter((a) => a.status === 'firing').length})` },
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
  ]

  return (
    <div className={styles.body}>
      <div className={styles.toolbar}>
        <div className={styles.seg}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={f.key === filter ? styles.segBtnActive : styles.segBtn}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button color="primary" icon={Plus}>
            New rule
          </Button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: 40 }} />
              <th className={styles.th}>Alert</th>
              <th className={styles.th} style={{ width: 130 }}>Service</th>
              <th className={styles.th} style={{ width: 110 }}>Value</th>
              <th className={styles.th} style={{ width: 120 }}>Status</th>
              <th className={styles.th} style={{ width: 90 }}>Since</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.name} className={styles.trHover}>
                <td className={styles.td}>
                  <span className={SEV_DOT[a.severity]} />
                </td>
                <td className={styles.td} style={{ fontWeight: 500 }}>{a.name}</td>
                <td className={`${styles.td} ${styles.mono}`}>{a.service}</td>
                <td className={`${styles.td} ${styles.mono} ${styles.num}`}>{a.value}</td>
                <td className={styles.td}>
                  <span className={STATUS_CLS[a.status]}>
                    {a.status === 'firing' && <Bell size={11} />}
                    {a.status}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.muted}`}>{a.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Alerts
