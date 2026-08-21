import { useMemo, useState } from 'react'
import {
  Button,
  Tag,
  Dropdown,
  Table,
  StatusTag,
  Select,
  CounterCardGroup,
  CounterCard,
  IconSearchX,
  IconAlertTriangle,
  IconMoreVertical,
  IconCalendarDays,
  IconTimer,
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

type TagFilter = { kind: 'zone' | 'test' | 'product'; value: string }

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
  // Filtres d'étiquettes : on clique une étiquette de ligne pour restreindre le
  // flux (zone, test, produit), plusieurs se combinent.
  const [tags, setTags] = useState<TagFilter[]>([])
  const toggleTag = (t: TagFilter) =>
    setTags((cur) =>
      cur.some((x) => x.kind === t.kind && x.value === t.value)
        ? cur.filter((x) => !(x.kind === t.kind && x.value === t.value))
        : [...cur, t],
    )

  const groups = useMemo(() => {
    let all = groupIncidents(INCIDENT_FEED)
    if (alertFilter) all = all.filter((g) => g.alert === alertFilter)
    for (const t of tags) all = all.filter((g) => g[t.kind] === t.value)
    return status === 'all' ? all : all.filter((g) => g.status === status)
  }, [status, alertFilter, tags])

  const ongoing = INCIDENT_FEED.filter((i) => i.status === 'ongoing')
  const critical = ongoing.filter((i) => i.severity === 'critical')
  const warning = ongoing.filter((i) => i.severity === 'warning')
  const closed = INCIDENT_FEED.filter((i) => i.status === 'closed')

  const columns = [
    {
      // Pastille de type, comme dans le produit : la sévérité se voit avant de
      // lire quoi que ce soit.
      title: 'Type',
      key: 'type',
      width: 70,
      render: (_v: unknown, g: Group) => (
        <span
          className={css.typeBadge}
          style={{ background: SEV_COLOR[g.severity] }}
          title={g.severity}
        >
          <IconAlertTriangle size={15} color="#fff" />
        </span>
      ),
    },
    {
      title: 'Alert triggered',
      dataIndex: 'alert',
      key: 'alert',
      render: (v: string, g: Group) => (
        <div className={css.incidentCell}>
          <span className={css.nameLine}>
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
            <span className={css.incidentId}>[{g.lastId}]</span>
            {/* Regroupement : un incident lisible au lieu de quatre lignes. */}
            {g.count > 1 && <span className={css.countPill}>{g.count}</span>}
            {g.rule && g.rule.firedLast7d >= NOISY_THRESHOLD && (
              <span className={css.noisyMark}>noisy</span>
            )}
          </span>
          {/* Pas de mono ici : c'est de la métadonnée de lecture, pas une valeur
              technique à aligner. Geist, 12 px, comme le reste de la ligne. */}
          {/* Chaque icône forme un groupe avec sa valeur : l'écart ne vit
              qu'entre les groupes, pas entre l'icône et son texte. */}
          <span className={css.incidentMeta}>
            <span className={css.metaItem}>
              <IconCalendarDays size={12} color="var(--color-text-third)" />
              {g.at}
            </span>
            <span className={css.metaDot}>·</span>
            <span className={css.metaItem}>
              <IconTimer size={12} color="var(--color-text-third)" />
              {g.ago}
            </span>
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: Group['status']) => (
        <StatusTag variant="outline" color={v === 'ongoing' ? 'failed' : 'success'}>
          {v}
        </StatusTag>
      ),
    },
    {
      // Étiquettes du produit : le libellé en gras, la valeur à côté.
      title: 'Tags',
      key: 'tags',
      render: (_v: unknown, g: Group) => {
        // Cliquer une étiquette filtre le flux : c'est le geste qu'on essaie
        // naturellement, et le produit ne le propose pas.
        const chip = (kind: TagFilter['kind'], label: string, value: string) => {
          const on = tags.some((t) => t.kind === kind && t.value === value)
          return (
            <Tag
              color={on ? 'orange' : 'grey'}
              size="xs"
              smallPadding
              className={css.tagChip}
              onClick={(e) => {
                e.stopPropagation()
                toggleTag({ kind, value })
              }}
            >
              <b>{label}:</b> {value}
            </Tag>
          )
        }
        return (
          <span className={css.tagsCell}>
            {chip('zone', 'Zone', g.zone)}
            {chip('test', 'Test', g.test)}
            {chip('product', 'Product', g.product)}
          </span>
        )
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_v: unknown, g: Group) => (
        <Dropdown
          menu={{
            items: [
              { key: 'alert', label: 'Open the alert' },
              { key: 'close', label: 'Close incident' },
            ],
            onClick: ({ key }: { key: string }) => {
              if (key === 'alert' && g.rule) onOpenAlert(g.rule)
            },
          }}
          placement="bottomRight"
        >
          <span className={css.kebab} aria-label="Actions">
            <IconMoreVertical size={16} color="var(--color-text-secondary)" />
          </span>
        </Dropdown>
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

      {/* Filtres actifs : celui venu du détail d'une alerte et ceux posés en
          cliquant une étiquette. Tous visibles, tous réversibles. */}
      {(alertFilter || tags.length > 0) && (
        <div className={css.filterBar}>
          <span className={obs.cardSub}>Filtered on</span>
          {alertFilter && (
            <button type="button" className={css.filterChip} onClick={onClearFilter}>
              {alertFilter} ✕
            </button>
          )}
          {tags.map((t) => (
            <button
              key={t.kind + t.value}
              type="button"
              className={css.filterChip}
              onClick={() => toggleTag(t)}
            >
              {t.value} ✕
            </button>
          ))}
          <Button
            color="invisible"
            size="s"
            onClick={() => {
              onClearFilter()
              setTags([])
            }}
          >
            Clear all
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
