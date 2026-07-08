import { Boxes, Cpu, MemoryStick } from 'lucide-react'
import styles from '../observability.module.scss'
import type { Health, TenantState, ViewKey } from '../constants'
import Gate from '../Gate'
import { Card, Kpi } from '../components'

/* 48 pods : majorité healthy, quelques degraded, 2 down */
const POD_HEALTH: Health[] = Array.from({ length: 48 }, (_, i) => {
  if (i === 11 || i === 34) return 'down'
  if (i % 9 === 0) return 'degraded'
  return 'healthy'
})
const POD_CLS: Record<Health, string> = {
  healthy: styles.podHealthy,
  degraded: styles.podDegraded,
  down: styles.podDown,
}

type Res = { name: string; usage: number; request: number }
const CPU: Res[] = [
  { name: 'checkout', usage: 88, request: 60 },
  { name: 'catalog', usage: 42, request: 55 },
  { name: 'payments', usage: 51, request: 50 },
  { name: 'api-gateway', usage: 63, request: 70 },
]
const MEM: Res[] = [
  { name: 'checkout', usage: 74, request: 65 },
  { name: 'catalog', usage: 38, request: 60 },
  { name: 'payments', usage: 46, request: 50 },
  { name: 'api-gateway', usage: 58, request: 60 },
]

const ResBars = ({ data }: { data: Res[] }) => (
  <>
    {data.map((r) => (
      <div key={r.name} className={styles.resRow}>
        <div className={styles.resTop}>
          <span>{r.name}</span>
          <b className={r.usage > r.request ? styles.trendUp : styles.muted}>
            {r.usage}% / {r.request}%
          </b>
        </div>
        <div className={styles.resBar}>
          <div
            className={styles.resFill}
            style={{
              width: `${Math.min(r.usage, 100)}%`,
              background: r.usage > r.request ? '#e0372e' : '#1c4a47',
            }}
          />
          <div className={styles.resReq} style={{ left: `${r.request}%` }} />
        </div>
      </div>
    ))}
  </>
)

const Infrastructure = ({
  tenant,
  onNavigate,
}: {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}) => {
  if (tenant !== 'active')
    return <Gate tenant={tenant} onNavigate={onNavigate} what="Kubernetes metrics" />

  const down = POD_HEALTH.filter((h) => h === 'down').length
  const degraded = POD_HEALTH.filter((h) => h === 'degraded').length

  return (
    <div className={styles.body}>
      <div className={styles.kpiGrid}>
        <Kpi label="Pods" icon={<Boxes size={14} />} value="48" foot="across 3 nodes" trend="flat" />
        <Kpi label="Running" value={`${POD_HEALTH.length - down}`} foot={`${degraded} degraded`} trend="flat" />
        <Kpi label="CrashLoop" value={String(down)} foot="to investigate" trend="up" />
        <Kpi label="Cluster CPU" icon={<Cpu size={14} />} value="61%" foot="avg usage" trend="flat" />
      </div>

      <Card title="Pod map" icon={<Boxes size={15} />}>
        <div className={styles.podGrid}>
          {POD_HEALTH.map((h, i) => (
            <div key={i} className={POD_CLS[h]} title={`pod-${i}: ${h}`} />
          ))}
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.podHealthy} style={{ width: 10, height: 10, borderRadius: 3 }} /> Running
          </span>
          <span className={styles.legendItem}>
            <span className={styles.podDegraded} style={{ width: 10, height: 10, borderRadius: 3 }} /> Degraded
          </span>
          <span className={styles.legendItem}>
            <span className={styles.podDown} style={{ width: 10, height: 10, borderRadius: 3 }} /> CrashLoopBackOff
          </span>
        </div>
      </Card>

      <div className={styles.spacer} />

      <div className={styles.grid2}>
        <Card title="CPU — usage vs request" icon={<Cpu size={15} />}>
          <ResBars data={CPU} />
        </Card>
        <Card title="Memory — usage vs request" icon={<MemoryStick size={15} />}>
          <ResBars data={MEM} />
        </Card>
      </div>
    </div>
  )
}

export default Infrastructure
