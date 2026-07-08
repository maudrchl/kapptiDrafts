import { Network } from 'lucide-react'
import styles from '../observability.module.scss'
import { SERVICES, type Health, type TenantState, type ViewKey } from '../constants'
import Gate from '../Gate'
import { Card, HealthPill } from '../components'

/* positions (%) des nœuds pour la carte */
const POS: Record<string, { x: number; y: number }> = {
  'api-gateway': { x: 14, y: 50 },
  checkout: { x: 42, y: 30 },
  catalog: { x: 42, y: 70 },
  payments: { x: 72, y: 22 },
  inventory: { x: 72, y: 50 },
  notifications: { x: 72, y: 78 },
}
const EDGES: [string, string][] = [
  ['api-gateway', 'checkout'],
  ['api-gateway', 'catalog'],
  ['checkout', 'payments'],
  ['checkout', 'inventory'],
  ['checkout', 'notifications'],
]
const NODE_CLS: Record<Health, string> = {
  healthy: styles.nodeHealthy,
  degraded: styles.nodeDegraded,
  down: styles.nodeDown,
}

const Services = ({
  tenant,
  onNavigate,
}: {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}) => {
  if (tenant !== 'active')
    return <Gate tenant={tenant} onNavigate={onNavigate} what="inter-service traces" />

  const healthByName = Object.fromEntries(SERVICES.map((s) => [s.name, s.health]))

  return (
    <div className={styles.body}>
      <Card title="Service map" icon={<Network size={15} />} bodyPad={false}>
        <div style={{ padding: 16 }}>
          <div className={styles.mapWrap}>
            <svg className={styles.mapSvg} preserveAspectRatio="none">
              {EDGES.map(([a, b], i) => {
                const pa = POS[a]
                const pb = POS[b]
                const down = healthByName[b] === 'down'
                return (
                  <line
                    key={i}
                    x1={`${pa.x}%`}
                    y1={`${pa.y}%`}
                    x2={`${pb.x}%`}
                    y2={`${pb.y}%`}
                    stroke={down ? '#e0372e' : '#cbd5d1'}
                    strokeWidth={down ? 2 : 1.5}
                    strokeDasharray={down ? '5 4' : undefined}
                  />
                )
              })}
            </svg>
            {SERVICES.map((s) => (
              <div
                key={s.name}
                className={NODE_CLS[s.health]}
                style={{ left: `${POS[s.name].x}%`, top: `${POS[s.name].y}%` }}
              >
                <span
                  className={
                    s.health === 'healthy'
                      ? styles.dotHealthy
                      : s.health === 'degraded'
                        ? styles.dotDegraded
                        : styles.dotDown
                  }
                />
                {s.name}
              </div>
            ))}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.dotHealthy} /> Healthy
            </span>
            <span className={styles.legendItem}>
              <span className={styles.dotDegraded} /> Degraded
            </span>
            <span className={styles.legendItem}>
              <span className={styles.dotDown} /> Down
            </span>
          </div>
        </div>
      </Card>

      <div className={styles.spacer} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Service</th>
              <th className={styles.th} style={{ width: 90 }}>Type</th>
              <th className={styles.th} style={{ width: 130 }}>Health</th>
              <th className={styles.th} style={{ width: 100 }}>p95</th>
              <th className={styles.th} style={{ width: 100 }}>Errors</th>
              <th className={styles.th} style={{ width: 120 }}>Throughput</th>
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((s) => (
              <tr key={s.name} className={styles.trHover}>
                <td className={styles.td} style={{ fontWeight: 600 }}>{s.name}</td>
                <td className={`${styles.td} ${styles.muted}`}>{s.kind}</td>
                <td className={styles.td}>
                  <HealthPill health={s.health} />
                </td>
                <td className={`${styles.td} ${styles.num} ${styles.mono}`}>
                  {s.health === 'down' ? '—' : `${s.p95} ms`}
                </td>
                <td className={`${styles.td} ${styles.num} ${styles.mono}`}>{s.errorRate}%</td>
                <td className={`${styles.td} ${styles.num} ${styles.mono}`}>
                  {s.throughput.toLocaleString('en-US')}/min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Services
