import { Card, IconSearch, IconWrench, IconSparkle } from '@kapptivate/ui-kit'
import styles from './ai-usage.module.scss'
import { FEATURES } from './constants'

const ICONS: Record<string, typeof IconSearch> = {
  search: IconSearch,
  wrench: IconWrench,
  sparkles: IconSparkle,
}

const FeatureBreakdown = () => {
  return (
    <Card className={styles.uiCard}>
      <Card.Content title="By feature" description="Token breakdown">
      {FEATURES.map((f) => {
        const Icon = ICONS[f.icon] ?? IconSearch
        return (
          <div key={f.name} className={styles.bdRow}>
            <div
              className={styles.bdIco}
              style={{ background: f.iconBg, color: f.iconColor }}
            >
              <Icon size={17} />
            </div>
            <div>
              <div className={styles.bdName}>{f.name}</div>
              <div className={styles.bdMeta}>{f.meta}</div>
            </div>
            <div className={styles.bdCost}>
              <div className={styles.bdAmount}>{f.amount}</div>
              <div className={styles.bdPct}>{f.pct}</div>
            </div>
          </div>
        )
      })}
      </Card.Content>
    </Card>
  )
}

export default FeatureBreakdown
