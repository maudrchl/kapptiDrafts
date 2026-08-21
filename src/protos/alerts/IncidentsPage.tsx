import { useMemo, useState } from 'react'
import {
  Button,
  Text,
  Tag,
  Dropdown,
  Table,
  StatusTag,
  Select,
  CounterCardGroup,
  CounterCard,
  IconSearchX,
  EmptyState,
  IconAlertTriangle,
  IconMoreVertical,
  IconCircleSlash,
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

/** Une ligne du tableau : soit une bande de journée, soit un incident. */
type Row = (Group & { band?: undefined }) | { key: string; band: string }

type Group = {
  key: string
  day: string
  alert: string
  rule?: AlertRule
  severity: Severity
  test: string
  product: string
  zone: string
  status: 'ongoing' | 'resolved' | 'canceled'
  count: number
  ago: string
  at: string
  duration?: string
  lastId: string
}

const groupIncidents = (feed: Incident[]): Group[] => {
  const map = new Map<string, Group>()
  for (const i of feed) {
    const key = `${i.day}::${i.alert}::${i.test}`
    const seen = map.get(key)
    if (seen) {
      seen.count += 1
      // Le groupe reste ouvert dès qu'un de ses déclenchements l'est.
      if (i.status === 'ongoing') seen.status = 'ongoing'
      continue
    }
    map.set(key, {
      key,
      day: i.day,
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
      duration: i.duration,
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
    if (status === 'ongoing') return all.filter((g) => g.status === 'ongoing')
    if (status === 'closed') return all.filter((g) => g.status !== 'ongoing')
    return all
  }, [status, alertFilter, tags])

  // Les compteurs comptent des incidents, pas des déclenchements : sinon ils
  // contredisent la ligne « 10 triggers grouped into 8 incidents ».
  const all = useMemo(() => groupIncidents(INCIDENT_FEED), [])
  const ongoing = all.filter((g) => g.status === 'ongoing')
  const critical = ongoing.filter((g) => g.severity === 'critical')
  const warning = ongoing.filter((g) => g.severity === 'warning')
  const closed = all.filter((g) => g.status !== 'ongoing')

  /**
   * Lignes du tableau : une bande de séparation par journée, comme la page
   * Executions, puis les incidents de la journée avec les incidents en cours
   * d'abord. Les incidents refermés gardent leur place mais perdent leur
   * couleur, pour qu'on puisse se concentrer sur ce qui est ouvert.
   */
  const rows = useMemo(() => {
    const days = [...new Set(groups.map((g) => g.day))]
    return days.flatMap((day) => {
      const inDay = groups
        .filter((g) => g.day === day)
        .sort((a, b) => Number(b.status === 'ongoing') - Number(a.status === 'ongoing'))
      return [{ key: `band-${day}`, band: day } as Row, ...inDay]
    })
  }, [groups])

  // La bande de journée est une ligne qui fusionne toutes les colonnes.
  const bandCell = (r: Row) => (r.band ? { colSpan: 4 } : {})
  const hiddenCell = (r: Row) => (r.band ? { colSpan: 0 } : {})

  const columns = [
    {
      title: 'Alert triggered',
      dataIndex: 'alert',
      key: 'alert',
      onCell: bandCell,
      render: (v: string, r: Row) => {
        // Même composant que la séparation par journée des Executions :
        // Text xs / medium / secondary dans une cellule de 25 px.
        if (r.band)
          return (
            <Text size="xs" weight="medium" color="secondary">
              {r.band}
            </Text>
          )
        const g = r as Group
        return (
        <div className={css.incidentCell}>
          {/* Pastille de type, comme dans le produit : la sévérité se voit avant
              de lire, et elle est collée au nom qu'elle qualifie. */}
          <span
            className={css.typeBadge}
            style={{
              // surface-grey était presque blanc : la pastille disparaissait.
              background:
                g.status === 'ongoing' ? SEV_COLOR[g.severity] : 'var(--color-grey-200, #e4e4e7)',
            }}
            title={g.severity}
          >
            <IconAlertTriangle
              size={15}
              // grey-400 sur grey-200 ne se voyait pas : l'icône passe en
              // text-secondary, plus foncé que son fond.
              color={g.status === 'ongoing' ? '#fff' : 'var(--color-text-secondary, #667085)'}
            />
          </span>
          <span className={css.incidentText}>
          <span className={css.nameLine}>
              {v}
            <span className={css.incidentId}>[{g.lastId}]</span>
            {/* Regroupement : un incident lisible au lieu de quatre lignes. */}
            {g.count > 1 && <span className={css.countPill}>{g.count}</span>}
            {g.rule && g.rule.firedLast7d >= NOISY_THRESHOLD && (
              <span
                className={css.noisyMark}
                title={`This rule opened ${g.rule.firedLast7d} incidents in the last 7 days. Worth tuning its thresholds, or excluding the errors you expect.`}
              >
                {g.rule.firedLast7d} this week
              </span>
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
            {/* Un incident refermé se juge sur sa durée, pas sur son âge :
                « lasted 1 h 12 min » dit quelque chose, « yesterday » non. */}
            <span className={css.metaItem}>
              <IconTimer size={12} color="var(--color-text-third)" />
              {g.status === 'ongoing' || !g.duration ? g.ago : `lasted ${g.duration}`}
            </span>
          </span>
          </span>
        </div>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      onCell: hiddenCell,
      render: (v: Group['status'], r: Row) =>
        r.band ? null : (
        // Résolu = vert, annulé = gris avec son icône barrée : un incident
        // annulé n'a rien été réparé, il n'a simplement pas eu lieu.
        <StatusTag
          variant="outline"
          color={v === 'ongoing' ? 'failed' : v === 'resolved' ? 'success' : 'neutral'}
          icon={v === 'canceled' ? <IconCircleSlash size={12} /> : undefined}
        >
          {v}
        </StatusTag>
        ),
    },
    {
      // Étiquettes du produit : le libellé en gras, la valeur à côté.
      title: 'Tags',
      key: 'tags',
      onCell: hiddenCell,
      render: (_v: unknown, r: Row) => {
        if (r.band) return null
        const g = r as Group
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
      onCell: hiddenCell,
      render: (_v: unknown, r: Row) =>
        r.band ? null : (
        <Dropdown
          menu={{
            items: [
              { key: 'alert', label: 'Open the alert' },
              { key: 'close', label: 'Close incident' },
            ],
            onClick: ({ key }: { key: string }) => {
              const rule = (r as Group).rule
              if (key === 'alert' && rule) onOpenAlert(rule)
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
        <h1 className={obs.pageTitle}>Incidents</h1>
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

      {/* Les cartes de synthèse du DS. Sans commentaire sous le chiffre : « needs
          attention » ne disait rien que le chiffre ne dise déjà. */}
      <div className={obs.kpiRow}>
        <CounterCardGroup>
          <CounterCard title="Ongoing" value={ongoing.length} />
          <CounterCard title="Critical" value={critical.length} />
          <CounterCard title="Warning" value={warning.length} />
          <CounterCard title="Closed today" value={closed.length} />
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

      {rows.length > 0 ? (
        <Table
          rowKey="key"
          columns={columns}
          data={rows}
          showHeader
          // Toute la ligne ouvre la règle qui a créé l'incident : constater le
          // bruit et le régler au même endroit, sans lien souligné dans le nom.
          onClickRow={(r: Row) => {
            if (r.band) return
            const rule = (r as Group).rule
            if (rule) onOpenAlert(rule)
          }}
          conditionalRowClassNames={[
            { condition: (r: Row) => !!r.band, className: css.bandRow },
          ]}
        />
      ) : (
        <div className={obs.emptyBlock}>
          <EmptyState
            icon={<IconSearchX color="var(--color-text-secondary)" />}
            text="Nothing here"
            description="No incident matches these filters today."
          />
        </div>
      )}

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
