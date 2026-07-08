import { Boxes, LayoutDashboard, Network, Plus, ScrollText, Star } from 'lucide-react'
import styles from '../observability.module.scss'
import { DASHBOARDS, type Template, type TenantState, type ViewKey } from '../constants'
import Gate from '../Gate'
import { Card } from '../components'

const TEMPLATES: Template[] = [
  { name: 'Blank', desc: 'Start from an empty board', icon: Plus },
  { name: 'Logs Explorer', desc: 'Volume, errors, top services', icon: ScrollText },
  { name: 'Traces Explorer', desc: 'p50/p95 latency, spans, errors', icon: Network },
  { name: 'Service Map', desc: 'Inter-service dependencies', icon: Network },
  { name: 'Kubernetes', desc: 'Pods, CPU/mem vs request', icon: Boxes },
]

const Dashboards = ({
  tenant,
  onNavigate,
}: {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}) => {
  if (tenant !== 'active')
    return <Gate tenant={tenant} onNavigate={onNavigate} what="dashboard data" />

  return (
    <div className={styles.body}>
      {/* Saved boards */}
      <div className={styles.cardTitle} style={{ marginBottom: 12 }}>
        <LayoutDashboard size={15} />
        Your dashboards
      </div>
      <div className={styles.tplGrid}>
        {DASHBOARDS.map((d) => (
          <div key={d.name} className={styles.boardCard}>
            <div className={styles.boardHead}>
              <div className={styles.boardName}>{d.name}</div>
              {d.fav && <Star size={15} fill="#f2b338" color="#f2b338" />}
            </div>
            <div className={styles.tplDesc}>{d.desc}</div>
            <div className={styles.boardMeta}>
              {d.widgets} widgets · {d.editedBy} · {d.editedAt}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 26 }} />

      {/* Templates = a creation flow, not the nav */}
      <Card
        title="New dashboard"
        icon={<Plus size={15} />}
        sub="Pick a template to get started — templates no longer clutter the navigation."
      >
        <div className={styles.tplGrid}>
          {TEMPLATES.map((t) => {
            const I = t.icon
            return (
              <div key={t.name} className={styles.tpl}>
                <div className={styles.tplIcon}>
                  <I size={18} />
                </div>
                <div className={styles.tplName}>{t.name}</div>
                <div className={styles.tplDesc}>{t.desc}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default Dashboards
