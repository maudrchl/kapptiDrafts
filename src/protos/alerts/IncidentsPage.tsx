import { useMemo, useState } from 'react'
import {
  Button,
  Table,
  StatusTag,
  Select,
  CounterCardGroup,
  CounterCard,
  IconSearchX,
} from '@kapptivate/ui-kit'
import obs from '../observability/explore-tabs.module.scss'
import css from './alerts.module.scss'
import { ALERTS, INCIDENT_FEED } from './constants'
import type { AlertRule, Incident, Severity } from './constants'

/**
 * Page Incidents, l'onglet voisin. Structure reprise du produit (compteurs,
 * filtre de statut, flux daté), avec deux changements qui la relient enfin à
 * la page Alerts :
 *
 * 1. Le produit affiche une ligne par déclenchement, donc la même panne revient
 *    plusieurs fois à quelques secondes d'écart. Ici les déclenchements d'une
 *    même règle sur un même test sont regroupés, avec leur nombre.
 * 2. Le nom de la règle est cliquable : on ouvre l'alerte qui a créé
 *    l'incident, pour la régler là où on constate le bruit. Aujourd'hui il faut
 *    changer d'onglet et retrouver la règle à la main.
 */

const SEV_COLOR: Record<Severity, string> = {
  warning: '#f2b338',
  critical: 'var(--color-error, #e0372e)',
}

/** Au-delà, la règle sonne trop pour qu'on lise encore ses incidents. */
const NOISY_THRESHOLD = 5

type Group = {
  key: string
  alert: string
  rule?: AlertRule
  severity: Severity
  test: string
  product: string
  zone: string
  status: 'ongoing' | 'closed'
  count: number
  ago: string
  at: string
  lastId: string
}

const groupIncidents = (feed: Incident[]): Group[] => {
  const map = new Map<string, Group>()
  for (const i of feed) {
    const key = `${i.alert}::${i.test}`
    const seen = map.get(key)
    if (seen) {
      seen.count += 1
      // Le groupe reste ouvert dès qu'un de ses déclenchements l'est.
      if (i.status === 'ongoing') seen.status = 'ongoing'
      continue
    }
    map.set(key, {
      key,
      alert: i.alert,
      rule: ALERTS.find((a) => a.name === i.alert),
      severity: i.severity,
      test: i.test,
      product: i.product,
      zone: i.zone,
      status: i.status,
      count: 1,
      ago: i.ago,
      at: i.at,
      lastId: i.id,
    })
  }
  return [...map.values()]
}

const IncidentsPage = ({
  onOpenAlert,
  alertFilter,
  onClearFilter,
}: {
  onOpenAlert: (a: AlertRule) => void
  /** Nom de règle : on arrive filtré quand on vient du détail d'une alerte. */
  alertFilter: string | null
  onClearFilter: () => void
}) => {
  const [status, setStatus] = useState<'all' | 'ongoing' | 'closed'>('all')

  const groups = useMemo(() => {
    let all = groupIncidents(INCIDENT_FEED)
    if (alertFilter) all = all.filter((g) => g.alert === alertFilter)
    return status === 'all' ? all : all.filter((g) => g.status === status)
  }, [status, alertFilter])

  const ongoing = INCIDENT_FEED.filter((i) => i.status === 'ongoing')
  const critical = ongoing.filter((i) => i.severity === 'critical')
  const warning = ongoing.filter((i) => i.severity === 'warning')
  const closed = INCIDENT_FEED.filter((i) => i.status === 'closed')

  const columns = [
    {
      title: 'Alert triggered',
      dataIndex: 'alert',
      key: 'alert',
      render: (v: string, g: Group) => (
        <span className={css.nameLine}>
          <span className={obs.sevDot} style={{ background: SEV_COLOR[g.severity] }} />
          {/* Le lien vers la règle : constater le bruit et le régler au même endroit. */}
          {g.rule ? (
            <button
              type="button"
              className={css.linkName}
              onClick={(e) => {
                e.stopPropagation()
                onOpenAlert(g.rule as AlertRule)
              }}
            >
              {v}
            </button>
          ) : (
            v
          )}
          {/* Regroupement : un seul incident lisible au lieu de quatre lignes. */}
          {g.count > 1 && <span className={css.countPill}>{g.count}</span>}
          {g.rule && g.rule.firedLast7d >= NOISY_THRESHOLD && (
            <span className={css.noisyMark}>noisy</span>
          )}
        </span>
      ),
    },
    {
      title: 'Where',
      dataIndex: 'test',
      key: 'test',
      width: 260,
      render: (v: string, g: Group) => (
        <span className={css.truncate}>
          {v}
          <span className={obs.cardSub}> · {g.product}</span>
        </span>
      ),
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
      width: 170,
      render: (v: string) => <span className={obs.cardSub}>{v}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: Group['status']) => (
        <StatusTag variant="ghost" color={v === 'ongoing' ? 'failed' : 'success'}>
          {v}
        </StatusTag>
      ),
    },
    {
      title: 'Last seen',
      dataIndex: 'ago',
      key: 'ago',
      width: 150,
      render: (v: string, g: Group) => (
        <span className={css.stack}>
          <span className={css.nowrap}>{v}</span>
          <span className={`${obs.mono} ${obs.cardSub} ${css.nowrap}`}>{g.lastId}</span>
        </span>
      ),
    },
  ]

  return (
    <>
      <div className={obs.pageHead}>
        <div>
          <h1 className={obs.pageTitle}>Incidents</h1>
          <div className={css.headSub}>
            What those rules opened, most recent first.
          </div>
        </div>
        <div className={obs.contentActions}>
          <Select
            size="s"
            value={status}
            onChange={(v: 'all' | 'ongoing' | 'closed') => setStatus(v)}
            options={[
              { label: 'All incidents', value: 'all' },
              { label: 'Ongoing', value: 'ongoing' },
              { label: 'Closed', value: 'closed' },
            ]}
          />
        </div>
      </div>

      {/* Les cartes de synthèse du DS, comme la page produit, mais elles
          comptent des incidents ouverts : « Daily active alerts » comptait des
          déclenchements, pas des problèmes. */}
      <div className={obs.kpiRow}>
        <CounterCardGroup>
          <CounterCard
            title="Ongoing"
            value={ongoing.length}
            trend={
              <StatusTag variant="ghost" color={ongoing.length ? 'failed' : 'success'}>
                {ongoing.length ? 'needs attention' : 'all clear'}
              </StatusTag>
            }
          />
          <CounterCard
            title="Critical"
            value={critical.length}
            trend={
              <StatusTag variant="ghost" color={critical.length ? 'failed' : 'success'}>
                {critical.length ? 'paging on-call' : 'none'}
              </StatusTag>
            }
          />
          <CounterCard
            title="Warning"
            value={warning.length}
            trend={
              <StatusTag variant="ghost" color={warning.length ? 'warning' : 'success'}>
                {warning.length ? 'worth a look' : 'none'}
              </StatusTag>
            }
          />
          <CounterCard
            title="Closed today"
            value={closed.length}
            trend={
              <StatusTag variant="ghost" color="neutral">
                back to normal
              </StatusTag>
            }
          />
        </CounterCardGroup>
      </div>

      {/* Filtre venu du détail d'une alerte : visible et réversible en un clic. */}
      {alertFilter && (
        <div className={css.filterBar}>
          <span className={obs.cardSub}>Filtered on</span>
          <span className={css.filterChip}>{alertFilter}</span>
          <Button color="invisible" size="s" onClick={onClearFilter}>
            Clear
          </Button>
        </div>
      )}

      <div className={css.dayLabel}>Today, 21 August 2026</div>

      <Table
        rowKey="key"
        columns={columns}
        data={groups}
        showHeader
        emptyState={{
          icon: <IconSearchX color="var(--color-text-secondary)" />,
          text: 'Nothing here',
          description: 'No incident with this status today.',
        }}
      />

      {/* Le pont dans l'autre sens : depuis les incidents, aller régler le parc. */}
      <div className={css.feedFooter}>
        <span className={obs.cardSub}>
          {INCIDENT_FEED.length} triggers grouped into {groupIncidents(INCIDENT_FEED).length} incidents.
        </span>
      </div>
    </>
  )
}

export default IncidentsPage
