import styles from './observability.module.scss'
import { NAV_MODELS, type NavModel, type TenantState } from './constants'

type Props = {
  tenant: TenantState
  navModel: NavModel
  onTenantChange: (t: TenantState) => void
  onNavModelChange: (m: NavModel) => void
}

const STATES: { value: TenantState; label: string }[] = [
  { value: 'not-provisioned', label: '1 · Not enabled' },
  { value: 'awaiting-data', label: '2 · Awaiting data' },
  { value: 'active', label: '3 · Data flowing' },
]

/** Barre de démo : choix de l'intégration nav + parcours first-run. */
const DemoBar = ({ tenant, navModel, onTenantChange, onNavModelChange }: Props) => (
  <div className={styles.demoBar}>
    <span className={styles.demoLbl}>Nav integration</span>
    <div className={styles.demoSeg}>
      {NAV_MODELS.map((m) => (
        <button
          key={m.value}
          className={m.value === navModel ? styles.demoBtnActive : styles.demoBtn}
          onClick={() => onNavModelChange(m.value)}
          title={m.desc}
        >
          {m.short}
        </button>
      ))}
    </div>

    <span className={styles.demoSep} />

    <span className={styles.demoLbl}>First-run</span>
    <div className={styles.demoSeg}>
      {STATES.map((o) => (
        <button
          key={o.value}
          className={o.value === tenant ? styles.demoBtnActive : styles.demoBtn}
          onClick={() => onTenantChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
)

export default DemoBar
