import { useEffect, useMemo, useState } from 'react'
import {
  Text,
  Button,
  Table,
  Tag,
  StatusTag,
  SearchInput,
  Drawer,
  Toggle,
  Input,
  Select,
  Banner,
  Modal,
  Card,
  CounterCardGroup,
  CounterCard,
  IconPlus,
  IconArrowLeft,
  IconBell,
  IconChevronRight,
  IconPencil,
  IconCopy,
  IconTrash,
  IconSearchX,
  Popover,
  TableFilter,
  IconListFilter,
  IconAlertTriangle,
  IconArrowRight,
} from '@kapptivate/ui-kit'
import { AlertTriangle, Bell, Settings } from 'lucide-react'
import { useReportScreen } from '../../context/ScreenContext'
import { Sidebar } from '../test-campaign-variables/shared'
import IncidentsPage from './IncidentsPage'
import ConfigurationPage from './ConfigurationPage'
// Habillage repris du proto Observability : même en-tête de page, mêmes tables,
// mêmes valeurs mono. Une seule grammaire visuelle pour les deux protos.
import obs from '../observability/explore-tabs.module.scss'
import css from './alerts.module.scss'
import {
  ALERTS,
  INCIDENTS,
  INTENTS,
  DESTINATIONS,
  PREVIEW_RUNS,
  KIND_LABEL,
  KIND_ICON,
  KIND_ACCENT,
  KIND_ACCENT_BG,
  trackRecord,
  CHANNEL_LABEL,
  onCallFor,
} from './constants'
import type { AlertIncident, AlertRule, AlertState, Intent, Severity } from './constants'

/**
 * Proto « Alerts » — reprise de la page Incidents > Alerts.
 *
 * Ce que la page actuelle rate, et ce que ce proto tente :
 *
 * 1. La liste est un dump : ID interne, noms en double, aucune idée de l'état
 *    de la règle ni de qui elle prévient. Ici la ligne répond à « qu'est-ce que
 *    ça surveille, à partir de quand ça sonne, qui est prévenu, est-ce que ça
 *    sonne en ce moment ».
 * 2. Deux trous ne sont visibles NULLE PART aujourd'hui, et remontent en tête :
 *    une alerte qui ne prévient personne, et une alerte qui sonne tellement
 *    souvent qu'elle ne veut plus rien dire.
 * 3. La création commence par un choix de type technique (« Raw alerts »,
 *    « Availability last point », « Bucket », « MEASUREMENT / FILTERED BY »).
 *    Ici on entre par l'intention, la condition s'écrit comme une phrase, et
 *    un aperçu dit ce que le seuil aurait donné sur les 7 derniers jours.
 */

// Mêmes couleurs de sévérité que le proto Observability.
const SEV_COLOR: Record<Severity, string> = {
  warning: '#f2b338',
  critical: 'var(--color-error, #e0372e)',
}

const IDLE_DOT = 'var(--color-border-grey, #e4e4e7)'

const WEEK_DAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']

const STATE_COLOR: Record<AlertState, 'failed' | 'success' | 'neutral'> = {
  firing: 'failed',
  ok: 'success',
  muted: 'neutral',
}

// Vocabulaire repris d'incidents.io : une alerte sonne (firing), est revenue à
// la normale (healthy), ou a été mise en pause (paused). « Watching » et
// « muted » ne disaient pas dans quel état était la règle.
const STATE_LABEL: Record<AlertState, string> = {
  firing: 'firing',
  ok: 'healthy',
  muted: 'paused',
}

/** Au-delà, la règle sonne trop souvent pour qu'on lise encore ses incidents. */
const NOISY_THRESHOLD = 5

/**
 * Ordre par défaut de la liste : ce qui va mal remonte. Ce qui sonne d'abord
 * (critique avant warning), puis ce qui sonne trop pour être encore lu, puis ce
 * qui ne prévient personne, le calme ensuite, et les alertes en pause en bas.
 */
const urgency = (a: AlertRule): number => {
  if (a.state === 'muted') return 5
  if (a.state === 'firing') return a.firingSeverity === 'critical' ? 0 : 1
  if (a.firedLast7d >= NOISY_THRESHOLD) return 2
  if (a.notifications.length === 0) return 3
  return 4
}

const Proto = () => {
  const [tab, setTab] = useState<'incidents' | 'alerts' | 'configuration'>('alerts')
  const [createOpen, setCreateOpen] = useState(false)
  // Le détail d'une alerte vit au-dessus des onglets : on l'ouvre depuis la
  // liste des alertes ET depuis un incident, sans changer de page.
  const [detail, setDetail] = useState<AlertRule | null>(null)
  // Filtre transporté depuis le détail d'une alerte vers la page Incidents.
  const [incidentFilter, setIncidentFilter] = useState<string | null>(null)
  // Sous-onglet de Configuration, piloté depuis le détail d'une alerte.
  const [configTab, setConfigTab] = useState<'oncall' | 'exclusions'>('oncall')

  useReportScreen(
    createOpen ? 'modal:create' : detail ? `detail:${detail.id}` : tab,
  )

  return (
    // Coquille produit : la page se juge avec la navigation autour d'elle.
    <div className={css.app}>
      <Sidebar active="incidents" />
      <div className={css.main}>
        <nav className={css.tabs}>
          <button
            type="button"
            className={tab === 'incidents' ? css.tabActive : css.tab}
            onClick={() => setTab('incidents')}
          >
            <AlertTriangle size={14} /> Incidents
          </button>
          <button
            type="button"
            className={tab === 'alerts' ? css.tabActive : css.tab}
            onClick={() => setTab('alerts')}
          >
            <Bell size={14} /> Alerts
          </button>
          <button
            type="button"
            className={tab === 'configuration' ? css.tabActive : css.tab}
            onClick={() => setTab('configuration')}
          >
            <Settings size={14} /> Configuration
          </button>
        </nav>
        <div className={obs.contentBody}>
          {tab === 'incidents' && (
            <IncidentsPage
              onOpenAlert={setDetail}
              alertFilter={incidentFilter}
              onClearFilter={() => setIncidentFilter(null)}
            />
          )}
          {tab === 'alerts' && (
            <AlertList onCreate={() => setCreateOpen(true)} onDetail={setDetail} />
          )}
          {tab === 'configuration' && (
            <ConfigurationPage tab={configTab} onTabChange={setConfigTab} onOpenAlert={setDetail} />
          )}
        </div>
      </div>

      {/* Détail et création sont des surcouches : on ne perd jamais sa page. */}
      <AlertDrawer
        alert={detail}
        onClose={() => setDetail(null)}
        onSeeIncidents={(a) => {
          // On arrive sur la page Incidents déjà filtrée sur cette règle,
          // sinon on relit tout le flux pour retrouver ses incidents.
          setDetail(null)
          setIncidentFilter(a.name)
          setTab('incidents')
        }}
        onTuneNoise={() => {
          setDetail(null)
          setConfigTab('exclusions')
          setTab('configuration')
        }}
        onOpenOnCall={() => {
          setDetail(null)
          setConfigTab('oncall')
          setTab('configuration')
        }}
      />
      <CreateAlertModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

/* ────────────────────────────── Liste ────────────────────────────── */

const AlertList = ({
  onCreate,
  onDetail,
}: {
  onCreate: () => void
  onDetail: (a: AlertRule | null) => void
}) => {
  const [search, setSearch] = useState('')
  // Filtre par produit : « Applies to » devient une dimension de tri, pas juste
  // une colonne de texte. Les produits viennent des alertes elles-mêmes.
  // TableFilter travaille sur une chaîne de clés séparées par des virgules :
  // vide = tous les produits, donc pas d'entrée « All products » qui doublerait
  // le produit qui porte réellement ce nom.
  const [scope, setScope] = useState('')
  const [scopeOpen, setScopeOpen] = useState(false)
  const scopes = useMemo(() => scope.split(',').filter(Boolean), [scope])
  const allScopes = useMemo(() => [...new Set(ALERTS.map((a) => a.scope))].sort(), [])
  const firing = ALERTS.filter((a) => a.state === 'firing')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const found = ALERTS.filter((a) => {
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.short.toLowerCase().includes(q) ||
        a.scope.toLowerCase().includes(q)
      return matchQ && (scopes.length === 0 || scopes.includes(a.scope))
    })
    return [...found].sort((a, b) => urgency(a) - urgency(b) || a.name.localeCompare(b.name))
  }, [search, scopes])

  const columns = [
    {
      title: 'Alert',
      dataIndex: 'name',
      key: 'name',
      // Le nom seul : la pastille est déjà le vocabulaire du Status, deux
      // pastilles sur une ligne ne veulent plus rien dire. Ce que la règle
      // déclenche est écrit sous ses barres, en mots.
      render: (v: string) => <span className={css.nameLine}>{v}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 110,
      /**
       * Partage du travail avec la colonne « Last 7 days » : ici l'état
       * MAINTENANT (un mot), là-bas le comportement de la semaine (les comptes
       * par sévérité). Écrire « firing · critical » redisait ce que la semaine
       * dit déjà : la sévérité en cours ne garde donc que la couleur.
       */
      render: (v: AlertState, a: AlertRule) => (
        <StatusTag
          variant="ghost"
          color={
            v === 'firing'
              ? a.firingSeverity === 'critical'
                ? 'failed'
                : 'warning'
              : STATE_COLOR[v]
          }
        >
          {STATE_LABEL[v]}
        </StatusTag>
      ),
    },
    {
      // Condition et portée dans la même colonne : « 2 of 10 runs fail » et
      // « Payments » forment une phrase, deux colonnes les séparaient sans
      // raison. Le filtre produit vit dans l'en-tête de cette colonne.
      title: (
        <span className={css.filterHead}>
          Condition
          <Popover
            trigger="click"
            placement="bottomLeft"
            noPadding
            open={scopeOpen}
            setOpen={setScopeOpen}
            content={
              <div className={obs.filterMenu}>
                <TableFilter
                  selectedFilters={scope}
                  setFilter={setScope}
                  items={allScopes.map((sc) => ({ label: sc, key: sc }))}
                />
              </div>
            }
          >
            <button
              type="button"
              className={scopes.length === 0 ? obs.headFilterBtn : obs.headFilterBtnOn}
              aria-label="Filter by product"
            >
              <IconListFilter size={13} />
            </button>
          </Popover>
        </span>
      ),
      dataIndex: 'short',
      key: 'short',
      render: (v: string, a: AlertRule) => (
        <span className={css.conditionCell}>
          <span className={`${css.truncate} ${css.dim}`}>{v}</span>
          <span className={css.metaDot}>·</span>
          <span className={css.scopeName}>{a.scope}</span>
        </span>
      ),
    },
    {
      // Le track record entre dans la liste : sept jours de comportement réel,
      // un seul élément graphique. C'est ce qui distingue une règle utile d'une
      // règle qui sonne tous les jours ou qui n'a jamais servi.
      title: 'Last 7 days',
      dataIndex: 'week',
      key: 'week',
      width: 130,
      render: (week: number[], a: AlertRule) => (
        <span className={css.record} title={trackRecord(a).text}>
          <span className={css.spark}>
            {week.map((n, i) => (
              <span
                key={i}
                className={css.sparkBar}
                style={{
                  height: n === 0 ? 4 : n === 1 ? 12 : 18,
                  // Couleur = ce que l'alerte déclenche, hauteur = combien de fois.
                  background: n === 0 || !a.worst ? IDLE_DOT : SEV_COLOR[a.worst],
                }}
              />
            ))}
          </span>
          {/* En mots, et les deux sévérités séparées : « 3 criticals » seul
              mentait sur une règle qui a aussi produit des warnings. */}
          {a.firedLast7d === 0 ? (
            <span className={css.recordNone}>nothing</span>
          ) : (
            <span className={css.recordCounts}>
              {a.firedCritical > 0 && (
                <span className={css.recordLabel} data-sev="critical">
                  {a.firedCritical} critical{a.firedCritical > 1 ? 's' : ''}
                </span>
              )}
              {a.firedWarning > 0 && (
                <span className={css.recordLabel} data-sev="warning">
                  {a.firedWarning} warning{a.firedWarning > 1 ? 's' : ''}
                </span>
              )}
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Notifies',
      key: 'notifications',
      width: 170,
      render: (_v: unknown, a: AlertRule) =>
        a.notifications.length === 0 ? (
          // Aucune destination : un tiret gris, comme n'importe quelle valeur
          // absente. Le mot « nobody » en ambre tirait l'œil vers une cellule
          // vide, alors que le vrai signal est ailleurs (statut, track record).
          <span className={css.dim}>-</span>
        ) : (
          <span className={css.notifies}>
            <span className={`${css.truncate} ${css.dim}`}>{a.notifications[0].target}</span>
            {/* Les destinations suivantes tiennent dans une bulle, même signe que
                le compteur d'incidents regroupés. */}
            {a.notifications.length > 1 && (
              <span className={css.countPill}>+{a.notifications.length - 1}</span>
            )}
          </span>
        ),
    },
  ]

  return (
    <>
      {/* En-tête volontairement nu : la recherche vit à côté du bouton, et
          l'état du parc se lit dans le tableau, pas dans une rangée de cartes. */}
      <div className={obs.pageHead}>
        <div>
          <h1 className={obs.pageTitle}>Alerts</h1>
          <div className={css.headSub}>
            The rules that watch your tests. {firing.length} of {ALERTS.length} firing right now.
          </div>
        </div>
        <div className={obs.contentActions}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search" width="220px" />
          <Button color="primary" onClick={onCreate}>
            <Button.Icon icon={IconPlus} />
            Create alert
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        data={rows}
        showHeader
        classNames={css.tableMid}
        onClickRow={onDetail}
        emptyState={{
          icon: <IconSearchX color="var(--color-text-secondary)" />,
          text: 'No alert matches',
          description: 'Try another search, or clear the product filter.',
        }}
      />
    </>
  )
}

/* ─────────────────────────── Détail d'une règle ─────────────────────────── */

const AlertDrawer = ({
  alert,
  onClose,
  onSeeIncidents,
  onTuneNoise,
  onOpenOnCall,
}: {
  alert: AlertRule | null
  onClose: () => void
  onSeeIncidents: (a: AlertRule) => void
  onTuneNoise: () => void
  onOpenOnCall: () => void
}) => {
  const [muted, setMuted] = useState(false)
  const incidents = alert ? INCIDENTS.filter((i) => i.alertId === alert.id) : []
  // Une alerte qui n'a jamais rien fait n'a pas besoin d'un historique de 24
  // cases grises ni d'un tableau vide : une phrase suffit.
  const everFired = !!alert && alert.lastFired !== 'Never'
  const record = trackRecord(alert ?? { firedLast7d: 0, firedWarning: 0, firedCritical: 0 })

  return (
    <Drawer
      open={!!alert}
      onClose={onClose}
      width={720}
      title={alert?.name ?? ''}
      // Convention du DS : les actions de l'objet vivent dans l'en-tête du
      // drawer, pas en pied de contenu.
      extra={
        <span className={css.tagRow}>
          <Button color="secondary" size="s">
            <Button.Icon icon={IconPencil} />
            Edit
          </Button>
          <Button color="secondary" size="s">
            <Button.Icon icon={IconCopy} />
            Duplicate
          </Button>
          <Button color="danger-s" size="s">
            <Button.Icon icon={IconTrash} />
            Delete
          </Button>
        </span>
      }
    >
      {alert && (
        <div className={css.drawer}>
          {/* Identité de la règle sur une ligne, son état à droite. */}
          <div className={css.metaLine}>
            <StatusTag
              variant="ghost"
              color={
                alert.state === 'firing'
                  ? alert.firingSeverity === 'critical'
                    ? 'failed'
                    : 'warning'
                  : STATE_COLOR[alert.state]
              }
            >
              {STATE_LABEL[alert.state]}
            </StatusTag>
            <span className={obs.cardSub}>
              {KIND_LABEL[alert.kind]} · {alert.owner}
            </span>
            <span className={css.metaToggle}>
              <Toggle
                title={muted ? 'Paused' : 'Active'}
                value={!muted}
                onChange={(v) => setMuted(!v)}
              />
            </span>
          </div>

          {/* Les chiffres d'abord, comme dans les drawers de l'observabilité :
              sans eux, la définition de la règle ne répond à rien. */}
          <CounterCardGroup>
            <CounterCard
              title="Incidents, 7 days"
              value={alert.firedLast7d}
              trend={
                <StatusTag
                  variant="ghost"
                  color={record.tone === 'noisy' ? 'warning' : record.tone === 'quiet' ? 'neutral' : 'success'}
                >
                  {record.tone === 'noisy' ? 'too noisy' : record.tone === 'quiet' ? 'never fired' : 'reasonable'}
                </StatusTag>
              }
            />
            <CounterCard
              title="Applies to"
              value={`${alert.scopeCount} ${alert.kind === 'agent' ? 'agents' : 'tests'}`}
              trend={
                <StatusTag variant="ghost" color="info">
                  {alert.scope}
                </StatusTag>
              }
            />
            <CounterCard
              title="Last fired"
              value={alert.lastFired ?? 'Never'}
              trend={
                <StatusTag variant="ghost" color={alert.state === 'firing' ? 'failed' : 'neutral'}>
                  {alert.state === 'firing' && alert.since ? `firing for ${alert.since}` : 'not firing'}
                </StatusTag>
              }
            />
          </CounterCardGroup>

          {/* Une carte par question, au lieu d'une suite de libellés à plat. */}
          <Card className={obs.drawerCard}>
            <Card.Header>
              <Card.Header.Title>The rule</Card.Header.Title>
            </Card.Header>
            <Card.Content>
              <div className={css.ruleSentence}>{alert.sentence}</div>
              <div className={css.ruleSev}>
                {alert.kind === 'script' ? (
                  <span className={obs.cardSub}>Thresholds are defined in the script</span>
                ) : (
                  <>
                    <span className={css.sevMark}>
                      <span className={obs.sevDot} style={{ background: SEV_COLOR.warning }} />
                      <span className={obs.cardSub}>warning · {alert.warning}</span>
                    </span>
                    <span className={css.sevMark}>
                      <span className={obs.sevDot} style={{ background: SEV_COLOR.critical }} />
                      <span className={obs.cardSub}>critical · {alert.critical}</span>
                    </span>
                  </>
                )}
              </div>
            </Card.Content>
          </Card>

          <Card className={obs.drawerCard}>
            <Card.Header>
              <Card.Header.Title>Who gets told</Card.Header.Title>
            </Card.Header>
            <Card.Content>
              {alert.notifications.length === 0 ? (
                <>
                  <Banner variant="warning">
                    <Banner.Description>
                      Nobody. This alert opens incidents in the platform but sends nothing out.
                    </Banner.Description>
                  </Banner>
                  <div className={css.drawerLinks}>
                    <Button color="secondary" size="s" onClick={onOpenOnCall}>
                      Open on-call list
                      <Button.Icon icon={IconArrowRight} />
                    </Button>
                  </div>
                </>
              ) : (
                alert.notifications.map((n) => {
                  // Une destination ne dit pas qui la lit : on remonte
                  // l'astreinte derrière le canal, et ses heures.
                  const oc = onCallFor(n.target)
                  return (
                    <div key={n.channel + n.target} className={css.routeRow}>
                      <span className={css.routeWho}>
                        <span className={obs.cellName}>{n.target}</span>
                        <span className={obs.cardSub}>
                          {CHANNEL_LABEL[n.channel]}
                          {oc ? ` · ${oc.who}, ${oc.hours.toLowerCase()}` : ''}
                        </span>
                        {!oc && (
                          <span className={css.nobody}>Nobody is on call for this destination</span>
                        )}
                      </span>
                      <span className={css.tagRow}>
                        {n.severities.map((sev) => (
                          <span key={sev} className={css.sevMark}>
                            <span className={obs.sevDot} style={{ background: SEV_COLOR[sev] }} />
                            <span className={obs.cardSub}>{sev}</span>
                          </span>
                        ))}
                      </span>
                    </div>
                  )
                })
              )}
            </Card.Content>
          </Card>

          <Card className={obs.drawerCard}>
            <Card.Header>
              <Card.Header.Title>Track record</Card.Header.Title>
              <Card.Header.Aside>
                <span className={css.recordSpark}>
                  {alert.week.map((n, i) => (
                    <span key={i} className={css.recordCol}>
                      <span
                        className={css.recordBar}
                        style={{
                          height: n === 0 ? 4 : n === 1 ? 18 : 30,
                          background: n === 0 || !alert.worst ? IDLE_DOT : SEV_COLOR[alert.worst],
                        }}
                      />
                      <span className={css.recordDay}>{WEEK_DAYS[i]}</span>
                    </span>
                  ))}
                </span>
              </Card.Header.Aside>
            </Card.Header>
            <Card.Content>
              <div className={css.recordVerdict} data-tone={record.tone}>
                {record.text}
              </div>
              {!everFired ? (
                <div className={obs.cardSub}>
                  Either all is well, or the thresholds are out of reach. Nothing has crossed them yet.
                </div>
              ) : (
                <>
                  {incidents.length > 0 && (
                    <div className={css.drawerTable}>
                      <Table
                        rowKey="id"
                        showHeader
                        compact
                        columns={[
                          {
                            title: 'Opened',
                            dataIndex: 'openedAt',
                            key: 'openedAt',
                            width: 150,
                            render: (v: string, i: AlertIncident) => (
                              <span className={css.sevMark}>
                                <span
                                  className={obs.sevDot}
                                  style={{ background: SEV_COLOR[i.severity] }}
                                />
                                <span className={`${obs.mono} ${css.nowrap}`}>{v}</span>
                              </span>
                            ),
                          },
                          {
                            title: 'Severity',
                            dataIndex: 'severity',
                            key: 'severity',
                            width: 100,
                            render: (v: Severity) => <span className={css.dim}>{v}</span>,
                          },
                          { title: 'What tripped it', dataIndex: 'trigger', key: 'trigger' },
                          {
                            title: 'Duration',
                            dataIndex: 'duration',
                            key: 'duration',
                            width: 100,
                            render: (v: string) => (
                              <span className={`${obs.mono} ${css.nowrap}`}>{v}</span>
                            ),
                          },
                        ]}
                        data={incidents}
                      />
                    </div>
                  )}
                  <div className={css.drawerLinks}>
                    <Button color="secondary" size="s" onClick={() => onSeeIncidents(alert)}>
                      See incidents
                      <Button.Icon icon={IconArrowRight} />
                    </Button>
                    {record.tone === 'noisy' && (
                      <Button color="secondary" size="s" onClick={onTuneNoise}>
                        Silence expected errors
                        <Button.Icon icon={IconArrowRight} />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card.Content>
          </Card>
        </div>
      )}
    </Drawer>
  )
}

/**
 * La création tient dans une modale : on ne quitte pas la liste pour écrire une
 * règle. Deux temps dans la même fenêtre, l'intention puis la condition, et le
 * bouton d'action vit dans le pied de la modale.
 */
const CreateAlertModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [intent, setIntent] = useState<Intent | null>(null)
  // Fermer la modale remet le flux à son premier temps.
  useEffect(() => {
    if (!open) setIntent(null)
  }, [open])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      // La fenêtre s'élargit quand le formulaire arrive avec son aperçu.
      width={intent ? 960 : 620}
      title={intent ? intent.question : 'Create alert'}
    >
      <Modal.Content maxHeight="70vh" overflow="auto">
        {!intent ? (
          <>
            <div className={css.modalIntro}>
              Pick the situation. The alert type, the query and the thresholds follow from it.
            </div>
            <IntentPicker onPick={setIntent} />
          </>
        ) : (
          <AlertForm intent={intent} />
        )}
      </Modal.Content>
      <Modal.Footer>
        {intent ? (
          <>
            <Button color="primary">Create alert</Button>
            <Button color="secondary" onClick={() => setIntent(null)}>
              <Button.Icon icon={IconArrowLeft} />
              Back
            </Button>
          </>
        ) : (
          <Button color="secondary" onClick={onClose}>
            Cancel
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

/**
 * Étape 1 : l'intention. La page actuelle demande de choisir entre « Threshold
 * alerts », « Success rate alerts over the last runs » et « Raw alerts », trois
 * titres qui parlent du moteur. Ici on demande ce qu'on veut savoir, et le type
 * technique n'apparaît plus.
 */
const IntentPicker = ({ onPick }: { onPick: (i: Intent) => void }) => {
  const main = INTENTS.filter((i) => !i.advanced)
  const advanced = INTENTS.filter((i) => i.advanced)

  const row = (i: Intent, className: string) => {
    const Icon = KIND_ICON[i.kind]
    return (
      <button key={i.kind} type="button" className={className} onClick={() => onPick(i)}>
        {/* Une teinte par nature : on reconnaît l'intention avant de lire. */}
        <span className={css.intentIcon} style={{ background: KIND_ACCENT_BG[i.kind] }}>
          <Icon size={18} color={KIND_ACCENT[i.kind]} />
        </span>
        <span className={css.intentText}>
          <span className={css.intentTitle}>{i.question}</span>
          <span className={obs.cardSub}>{i.example}</span>
        </span>
        <IconChevronRight size={16} color="var(--color-text-third)" />
      </button>
    )
  }

  return (
    <div className={css.intentList}>
      {main.map((i) => row(i, css.intentRow))}
      <div className={css.advancedLabel}>Advanced</div>
      {advanced.map((i) => row(i, css.intentRowAdvanced))}
    </div>
  )
}

/**
 * Étape 2 : la condition s'écrit comme une phrase, et l'aperçu de droite répond
 * tout de suite à « est-ce que mon seuil est bon ? » en rejouant les 7 derniers
 * jours. C'est ce que le formulaire actuel laisse entièrement à l'intuition.
 */
const AlertForm = ({ intent }: { intent: Intent }) => {
  const [name, setName] = useState('Checkout journey failing')
  const [window_, setWindow] = useState('10')
  const [warnAt, setWarnAt] = useState('2')
  const [critAt, setCritAt] = useState('4')
  const [scope, setScope] = useState<string>('payments')
  const [warnDest, setWarnDest] = useState<string>('slack-alerts')
  const [critDest, setCritDest] = useState<string>('oncall-email')
  const [remind, setRemind] = useState(false)

  const warnN = Number(warnAt) || 0
  const critN = Number(critAt) || 0

  // Rejeu des 7 derniers jours avec les seuils saisis : chaque jour compte au
  // plus un déclenchement, comme le fait le moteur avec sa fenêtre glissante.
  const dryRun = useMemo(() => {
    const days = PREVIEW_RUNS.map((d) => ({
      ...d,
      level: critN > 0 && d.failed >= critN ? 2 : warnN > 0 && d.failed >= warnN ? 1 : 0,
    }))
    return {
      days,
      warnings: days.filter((d) => d.level === 1).length,
      criticals: days.filter((d) => d.level === 2).length,
    }
  }, [warnN, critN])

  const fires = dryRun.warnings + dryRun.criticals
  const scopeCount = scope === 'payments' ? 12 : scope === 'accounts' ? 22 : 151
  const scopeLabel = scope === 'all' ? 'all products' : scope
  const dest = (key: string) => DESTINATIONS.find((d) => d.key === key)

  return (
    <div className={css.formGrid}>
      <div className={css.formCol}>
        <section className={css.block}>
          <div className={css.sectionLabel}>Name</div>
          <Input
            size="s"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this alert"
          />
          <div className={css.hint}>This is what shows up in Slack, so write it like a headline.</div>
        </section>

        {/* La condition en une phrase : les champs sont dans le texte, pas dans
            une grille de labels détachés de leur sens. */}
        <section className={css.block}>
          <div className={css.sectionLabel}>Condition</div>
          <div className={css.sentenceEdit}>
            <Text>Warn me when</Text>
            <Input size="s" width="56px" value={warnAt} onChange={(e) => setWarnAt(e.target.value)} />
            <Text>of the last</Text>
            <Input size="s" width="56px" value={window_} onChange={(e) => setWindow(e.target.value)} />
            <Text>runs fail.</Text>
          </div>
          <div className={css.sentenceEdit}>
            <Text>Escalate to critical at</Text>
            <Input size="s" width="56px" value={critAt} onChange={(e) => setCritAt(e.target.value)} />
            <Text>failed runs.</Text>
          </div>
          <div className={css.hint}>
            Technical errors (agent unreachable, timeout) are counted as failures.
          </div>
        </section>

        <section className={css.block}>
          <div className={css.sectionLabel}>What it watches</div>
          <div style={{ maxWidth: 300 }}>
            <Select
              size="s"
              fullWidth
              value={scope}
              onChange={(v: string) => setScope(v)}
              options={[
                { label: 'Payments', value: 'payments' },
                { label: 'Accounts', value: 'accounts' },
                { label: 'All products', value: 'all' },
              ]}
            />
          </div>
          {/* L'impact, chiffré, avant de sauvegarder : la page actuelle affiche
              « All Tests / All Products » sans jamais dire combien. */}
          <div className={css.hint}>This alert will watch {scopeCount} active tests.</div>
        </section>

        <section className={css.block}>
          <div className={css.sectionLabel}>Who gets told</div>
          <div className={css.routeEdit}>
            <span className={css.routeLabel}>
              <span className={obs.sevDot} style={{ background: SEV_COLOR.warning }} />
              warning
            </span>
            <div style={{ width: 260 }}>
              <Select
                size="s"
                fullWidth
                value={warnDest}
                onChange={(v: string) => setWarnDest(v)}
                options={DESTINATIONS.map((d) => ({ label: d.label, value: d.key }))}
              />
            </div>
          </div>
          <div className={css.routeEdit}>
            <span className={css.routeLabel}>
              <span className={obs.sevDot} style={{ background: SEV_COLOR.critical }} />
              critical
            </span>
            <div style={{ width: 260 }}>
              <Select
                size="s"
                fullWidth
                value={critDest}
                onChange={(v: string) => setCritDest(v)}
                options={DESTINATIONS.map((d) => ({ label: d.label, value: d.key }))}
              />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Toggle
              title="Remind every 15 minutes until the incident is closed"
              value={remind}
              onChange={setRemind}
            />
          </div>
        </section>
      </div>

      {/* Aperçu : le seuil se juge sur des données réelles, pas dans le vide. */}
      <aside className={css.preview}>
        <div className={css.sectionLabel}>If this alert had existed</div>
        <div className={obs.cardSub}>Replayed on the last 7 days of {scopeCount} tests.</div>

        <div className={css.previewCount}>{fires}</div>
        <div className={obs.cardSub}>
          {fires === 0
            ? 'It would never have fired. Your thresholds may be too high.'
            : fires > 4
              ? 'That is more than one a day. Expect people to mute it.'
              : `${dryRun.warnings} warnings, ${dryRun.criticals} criticals.`}
        </div>

        <div className={css.previewChart}>
          {dryRun.days.map((d) => (
            <div key={d.day} className={css.previewCol}>
              <span
                className={css.previewBar}
                style={{
                  height: Math.max(4, (d.failed / 8) * 68),
                  background:
                    d.level === 2 ? SEV_COLOR.critical : d.level === 1 ? SEV_COLOR.warning : IDLE_DOT,
                }}
              />
              <span className={css.previewDay}>{d.day}</span>
            </div>
          ))}
        </div>
        <div className={obs.cardSub}>Failed runs per day, against your two thresholds.</div>

        <div className={css.previewSep} />

        {/* Ce qui partira vraiment, écrit tel quel : personne ne devine ce que
            produit un « Warning Description » laissé vide. */}
        <div className={css.sectionLabel}>What lands in {dest(warnDest)?.label ?? 'the destination'}</div>
        <div className={css.notifCard}>
          <span className={css.notifTitle}>
            <IconAlertTriangle size={14} color={SEV_COLOR.warning} />
            {name || 'Unnamed alert'}
          </span>
          <span className={obs.cardSub}>
            Warning · {warnAt} of the last {window_} runs failed on {scopeLabel}.
          </span>
          <span className={obs.cardSub}>Opened just now · 3 tests affected</span>
        </div>
      </aside>
    </div>
  )
}

export default Proto
