import { Activity, Lock } from 'lucide-react'
import styles from './observability.module.scss'
import { NAV, type TenantState, type ViewKey } from './constants'

type Props = {
  view: ViewKey
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}

/** Colonne de sous-navigation observabilité (option « top-level »). */
const SecondaryNav = ({ view, tenant, onNavigate }: Props) => {
  const locked = tenant === 'not-provisioned'
  return (
    <nav className={styles.subCol}>
      <div className={styles.subColTitle}>
        <Activity size={18} />
        Observability
      </div>
      {NAV.map((group, gi) => (
        <div key={gi}>
          {group.section && <div className={styles.subSection}>{group.section}</div>}
          {group.items.map((item) => {
            const Icon = item.icon
            const isLocked = Boolean(item.needsTenant) && locked
            return (
              <button
                key={item.key}
                className={view === item.key ? styles.subItemActive : styles.subItem}
                onClick={() => onNavigate(item.key)}
              >
                <Icon size={16} />
                {item.label}
                {isLocked && (
                  <span className={styles.subLock}>
                    <Lock size={12} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export default SecondaryNav
