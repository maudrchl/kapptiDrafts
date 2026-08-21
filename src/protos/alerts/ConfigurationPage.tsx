import { Button, Table, EmptyState, IconPlus, IconFileX2, IconExternalLink } from '@kapptivate/ui-kit'
import obs from '../observability/explore-tabs.module.scss'
import css from './alerts.module.scss'
import { ON_CALL, alertsRoutedTo } from './constants'
import type { AlertRule, OnCall, Severity } from './constants'

/**
 * Page Configuration, l'onglet voisin : l'astreinte et les exclusions d'erreurs.
 *
 * C'est ici que vit déjà la réduction du bruit dans le produit. Donc l'alerte
 * repérée comme bruyante dans la liste des alertes doit pointer ici, au lieu de
 * laisser l'utilisateur deviner qu'une exclusion existe.
 */

const SEV_COLOR: Record<Severity, string> = {
  warning: '#f2b338',
  critical: 'var(--color-error, #e0372e)',
}

const ConfigurationPage = ({
  tab,
  onTabChange,
  onOpenAlert,
}: {
  tab: 'oncall' | 'exclusions'
  onTabChange: (t: 'oncall' | 'exclusions') => void
  onOpenAlert: (a: AlertRule) => void
}) => {

  return (
    <>
      <div className={obs.pageHead}>
        <h1 className={obs.pageTitle}>Configuration</h1>
      </div>

      <div className={css.subTabs}>
        <button
          type="button"
          className={tab === 'oncall' ? css.subTabActive : css.subTab}
          onClick={() => onTabChange('oncall')}
        >
          On-call list
        </button>
        <button
          type="button"
          className={tab === 'exclusions' ? css.subTabActive : css.subTab}
          onClick={() => onTabChange('exclusions')}
        >
          Error exclusions
          <span className={css.countPill}>0</span>
        </button>
      </div>

      {tab === 'oncall' ? (
        <>
          <div className={css.pageIntro}>
            Who receives what, and when. An alert with no matching entry here notifies nobody.
          </div>
          <Table
            rowKey="key"
            showHeader
            columns={[
              {
                title: 'Who',
                dataIndex: 'who',
                key: 'who',
                render: (v: string) => <span className={obs.cellName}>{v}</span>,
              },
              { title: 'Destination', dataIndex: 'channel', key: 'channel', width: 260 },
              { title: 'When', dataIndex: 'hours', key: 'hours', width: 240 },
              {
                // Le lien retour : depuis une astreinte, les alertes qui la
                // réveillent. Sans ça, on ne sait pas ce qu'on porte.
                title: 'Alerts routed here',
                key: 'alerts',
                width: 230,
                render: (_v: unknown, o: OnCall) => {
                  const routed = alertsRoutedTo(o)
                  return routed.length === 0 ? (
                    <span className={css.dim}>-</span>
                  ) : (
                    <span className={css.routedList}>
                      {routed.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className={css.linkName}
                          onClick={() => onOpenAlert(a)}
                        >
                          {a.name}
                        </button>
                      ))}
                    </span>
                  )
                },
              },
              {
                title: 'Receives',
                dataIndex: 'severities',
                key: 'severities',
                width: 160,
                render: (v: Severity[]) => (
                  <span className={css.tagRow}>
                    {v.map((s) => (
                      <span key={s} className={css.sevMark}>
                        <span className={obs.sevDot} style={{ background: SEV_COLOR[s] }} />
                        <span className={obs.cardSub}>{s}</span>
                      </span>
                    ))}
                  </span>
                ),
              },
            ]}
            data={ON_CALL}
          />
        </>
      ) : (
        <div className={css.emptyBox}>
          <EmptyState
            icon={<IconFileX2 color="var(--color-text-secondary)" />}
            text="Reduce alert noise with error exclusions"
            description="Exclude expected or harmless errors from triggering alerts, so that only meaningful failures open an incident."
          />
          <div className={css.emptyActions}>
            <Button color="primary" size="s">
              <Button.Icon icon={IconPlus} />
              Create error exclusion
            </Button>
            <Button color="secondary" size="s">
              Learn more about alerts
              <Button.Icon icon={IconExternalLink} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default ConfigurationPage
