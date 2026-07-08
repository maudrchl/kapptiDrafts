import { Bot, Monitor } from 'lucide-react'
import { Tag } from '@kapptivate/ui-kit'
import styles from './locations.module.scss'
import { runnerLabel, zonePretty, type Location } from './constants'
import { StatusBadge, ScopeBadge } from './Badges'

type Props = {
  loc: Location
  onClick: () => void
}

const LocationCard = ({ loc, onClick }: Props) => {
  if (loc.kind === 'public') {
    return (
      <button className={styles.card} onClick={onClick}>
        <div className={styles.badgeRow}>
          <StatusBadge status={loc.status} />
          {loc.default && <Tag color="orange">Default</Tag>}
        </div>
        <div className={styles.cardTitle}>
          <span className={styles.cflag}>{loc.flag}</span>
          {loc.city}
        </div>
        <div className={styles.cardZone}>
          {loc.region} · {loc.caps || 'Web · API'}
        </div>
        <div className={styles.verRow}>
          <span className={styles.ver}>{loc.version}</span>
        </div>
      </button>
    )
  }

  const RunnerIcon = loc.runner === 'desktop' ? Monitor : Bot
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.badgeRow}>
        <StatusBadge status={loc.status} />
        <ScopeBadge loc={loc} />
      </div>
      <div className={styles.cardTitle}>{loc.name}</div>
      <div className={styles.cardZone}>{zonePretty(loc.zone)}</div>
      <div className={styles.cardFoot}>
        <span className={styles.rtype}>
          <RunnerIcon size={14} />
          {runnerLabel[loc.runner]}
        </span>
        <span className={styles.ver}>{loc.version}</span>
      </div>
    </button>
  )
}

export default LocationCard
