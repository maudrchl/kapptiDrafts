import { Button } from 'ui-kit'
import { PlugZap, Radar } from 'lucide-react'
import { Empty } from './components'
import { OTLP_ENDPOINT, type TenantState, type ViewKey } from './constants'
import styles from './observability.module.scss'

type Props = {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
  /** libellé de la donnée attendue, ex: "de logs" */
  what: string
}

/**
 * Rendu partagé des vues data quand le tenant n'est pas encore "active".
 * Retourne null si tout est prêt (le parent affiche alors son contenu).
 */
const Gate = ({ tenant, onNavigate, what }: Props) => {
  if (tenant === 'active') return null

  if (tenant === 'not-provisioned') {
    return (
      <div className={styles.body}>
        <Empty
          icon={<PlugZap size={22} />}
          title="Observability not enabled"
          text="This workspace doesn’t have an observability tenant yet. Enable it from the Overview to start collecting data."
          action={
            <Button color="primary" onClick={() => onNavigate('overview')}>
              Enable observability
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className={styles.body}>
      <Empty
        icon={<Radar size={22} />}
        title={`Awaiting ${what}`}
        text={
          <>
            Point your OpenTelemetry exporters at{' '}
            <code className={styles.mono}>{OTLP_ENDPOINT}</code> — data will
            appear here as soon as it’s received.
          </>
        }
        action={
          <Button color="secondary" onClick={() => onNavigate('setup')}>
            Open OTLP setup
          </Button>
        }
      />
    </div>
  )
}

export default Gate
