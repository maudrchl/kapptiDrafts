import { Calendar, ChevronDown, RefreshCw } from 'lucide-react'
import styles from './observability.module.scss'

/**
 * Barre temporelle globale (mock statique).
 * Présente sur les vues data ; masquée sur Setup.
 */
const Topbar = () => (
  <div className={styles.topbar}>
    <button className={styles.tbCtl}>
      <Calendar size={15} />
      Past 24h
      <ChevronDown size={15} />
    </button>
    <span className={styles.tbDates}>
      07/07/2026 (10:52 AM) → 08/07/2026 (10:52 AM)
    </span>
    <div className={styles.tbRight}>
      <span className={styles.tbLabel}>Refresh</span>
      <button className={styles.tbCtl}>
        <RefreshCw size={14} />
        Off
        <ChevronDown size={15} />
      </button>
    </div>
  </div>
)

export default Topbar
