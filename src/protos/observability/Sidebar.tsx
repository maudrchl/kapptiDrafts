import { Activity, Lock, PanelLeftClose, Search } from 'lucide-react'
import styles from './observability.module.scss'
import { NAV, type TenantState, type ViewKey } from './constants'

type Props = {
  view: ViewKey
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
}

const Sidebar = ({ view, tenant, onNavigate }: Props) => {
  const locked = tenant === 'not-provisioned'

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbLogo}>
        <div className={styles.sbBrand}>
          <Activity className={styles.sbMark} size={22} />
          kapptivate
        </div>
        <button className={styles.sbCollapse} aria-label="Collapse">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className={styles.sbScroll}>
        <div className={styles.wsCard}>
          <div className={styles.wsAvatar}>t</div>
          <div>
            <div className={styles.wsName}>test-obs</div>
            <div className={styles.wsSub}>Workspace</div>
          </div>
        </div>

        <button className={styles.cmdBtn} onClick={() => onNavigate('explore')}>
          <Search size={15} />
          Search or jump to…
          <span className={styles.cmdKbd}>⌘K</span>
        </button>

        {NAV.map((group, gi) => (
          <div key={gi} className={styles.navGroup}>
            {group.section && (
              <div className={styles.navSection}>{group.section}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const isLocked = Boolean(item.needsTenant) && locked
              const active = view === item.key
              return (
                <button
                  key={item.key}
                  className={`${active ? styles.navItemActive : styles.navItem} ${
                    isLocked ? styles.navDim : ''
                  }`}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon size={16} />
                  {item.label}
                  {isLocked && (
                    <span className={styles.navLock}>
                      <Lock size={12} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={styles.sbFoot}>
        <button className={styles.helpBtn}>?</button>
        <div className={styles.sbVer}>
          V: 8.88.0
          <br />
          GUI: 15.56.0
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
