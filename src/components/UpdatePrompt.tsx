import { type CSSProperties } from 'react'
import { Text, Button, IconRefreshCw } from '@kapptivate/ui-kit'
import { useNewVersion } from '../lib/useNewVersion'

/**
 * Bandeau discret, bas-droite, qui apparaît quand un nouveau déploiement est
 * détecté. Un clic sur « Refresh » recharge la page pour récupérer la dernière
 * version (nouveaux assets hashés). Monté une seule fois au niveau racine, il
 * couvre la home comme les protos.
 */
const UpdatePrompt = () => {
  const stale = useNewVersion()
  if (!stale) return null

  return (
    <div style={styles.card} role="status" aria-live="polite">
      <div style={styles.text}>
        <Text weight="medium" size="s">
          A new version is available
        </Text>
        <Text size="xs" color="secondary">
          Refresh to get the latest updates.
        </Text>
      </div>
      <Button
        color="primary"
        size="s"
        icon={IconRefreshCw}
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  card: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '12px 14px',
    maxWidth: 'calc(100vw - 32px)',
    background: 'var(--color-background, #fff)',
    border: '1px solid var(--color-border, #ececf0)',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(16,24,40,0.16)',
  },
  text: { display: 'flex', flexDirection: 'column', gap: 2 },
}

export default UpdatePrompt
