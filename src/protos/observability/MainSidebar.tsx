import { Activity, ChevronRight, PanelLeftClose, Search } from 'lucide-react'
import styles from './observability.module.scss'
import { MAIN_NAV } from './constants'

type Props = {
  /** libellé de l'entrée active dans la nav principale */
  active: string
  onObsClick?: () => void
}

/**
 * Sidebar produit principale kapptivate (mock).
 * Sert de contexte pour les options « top-level » et « contextual ».
 */
const MainSidebar = ({ active, onObsClick }: Props) => (
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

      <button className={styles.cmdBtn}>
        <Search size={15} />
        Search or jump to…
        <span className={styles.cmdKbd}>⌘K</span>
      </button>

      {MAIN_NAV.map((group, gi) => (
        <div key={gi} className={styles.navGroup}>
          {group.section && (
            <div className={styles.navSection}>{group.section}</div>
          )}
          {group.items.map((item) => {
            const Icon = item.icon
            const isActive = item.label === active
            return (
              <button
                key={item.label}
                className={isActive ? styles.navItemActive : styles.navItem}
                onClick={item.isObs ? onObsClick : undefined}
              >
                <Icon size={16} />
                {item.label}
                {item.chevron && (
                  <span className={styles.navChevron}>
                    <ChevronRight size={15} />
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

export default MainSidebar
