import { Card } from '@kapptivate/ui-kit'
import { brands } from './brands'
import type { Integration } from './constants'
import styles from './integrations.module.scss'

type Props = {
  integration: Integration
  connected: boolean
  onOpen: (integration: Integration) => void
}

const IntegrationCard = ({ integration, connected, onOpen }: Props) => {
  const { name, brand, description } = integration

  return (
    <Card className={styles.cardClickable} onClick={() => onOpen(integration)}>
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <div className={styles.brandBox}>{brands[brand]}</div>
          <div className={styles.cardHeadText}>
            <div className={styles.cardName}>{name}</div>
            <div className={connected ? styles.statusOn : styles.statusOff}>
              {connected && <span className={styles.statusDot} />}
              {connected ? 'Connected' : 'Not connected'}
            </div>
          </div>
        </div>
        <div className={styles.cardDesc}>{description}</div>
      </div>
    </Card>
  )
}

export default IntegrationCard
