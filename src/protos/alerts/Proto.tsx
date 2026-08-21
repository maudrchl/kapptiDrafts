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
  IconPlus,
  IconArrowLeft,
  IconBell,
  IconChevronRight,
  IconPencil,
  IconCopy,
  IconTrash,
  IconSearchX,
  IconAlertTriangle,
} from '@kapptivate/ui-kit'
import { AlertTriangle, Bell, Settings } from 'lucide-react'
import { useReportScreen } from '../../context/ScreenContext'
import { Sidebar } from '../test-campaign-variables/shared'
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
  CHANNEL_LABEL,
} from './constants'
import type { AlertRule, AlertState, Intent, Severity } from './constants'

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

const Proto = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [detail, setDetail] = useState<AlertRule | null>(null)
  // Les épingles de commentaires suivent l'écran affiché (modale et drawer
  // compris), sinon elles bavent d'un écran à l'autre.
  useReportScreen(createOpen ? 'modal:create' : detail ? `detail:${detail.id}` : 'list')

  return (
    // Coquille produit : la page se juge avec la navigation autour d'elle.
    <div className={css.app}>
      <Sidebar active="incidents" />
      <div className={css.main}>
        <nav className={css.tabs}>
          <button type="button" className={css.tab}>
            <AlertTriangle size={14} /> Incidents
          </button>
          <button type="button" className={css.tabActive}>
            <Bell size={14} /> Alerts
          </button>
          <button type="button" className={css.tab}>
            <Settings size={14} /> Configuration
          </button>
        </nav>
        <div className={obs.contentBody}>
          <AlertList onCreate={() => setCreateOpen(true)} detail={detail} onDetail={setDetail} />
        </div>
      </div>

      <CreateAlertModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

/* ────────────────────────────── Liste ────────────────────────────── */

const AlertList = ({
  onCreate,
  detail,
  onDetail,
}: {
  onCreate: () => void
  detail: AlertRule | null
  onDetail: (a: AlertRule | null) => void
}) => {
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ALERTS
    return ALERTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.short.toLowerCase().includes(q) ||
        a.scope.toLowerCase().includes(q),
    )
  }, [search])

  const columns = [
    {
      title: 'Alert',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, a: AlertRule) => (
        <span className={css.nameLine}>
          {/* Pastille = sévérité en cours, grise quand l'alerte ne sonne pas. */}
          <span
            className={obs.sevDot}
            style={{ background: a.firingSeverity ? SEV_COLOR[a.firingSeverity] : IDLE_DOT }}
          />
          {v}
        </span>
      ),
    },
    {
      // La condition en clair, sur une ligne : c'est ce que la colonne
      // « Condition » du produit cache derrière du jargon de requête.
      title: 'Condition',
      dataIndex: 'short',
      key: 'short',
      render: (v: string) => <span className={css.truncate}>{v}</span>,
    },
    {
      title: 'Applies to',
      dataIndex: 'scope',
      key: 'scope',
      width: 190,
      render: (v: string, a: AlertRule) => (
        <span className={css.truncate}>
          {v}
          <span className={obs.cardSub}>
            {' '}
            · {a.scopeCount} {a.kind === 'agent' ? 'agents' : 'tests'}
          </span>
        </span>
      ),
    },
    {
      title: 'Notifies',
      key: 'notifications',
      width: 170,
      render: (_v: unknown, a: AlertRule) =>
        a.notifications.length === 0 ? (
          // Le seul défaut qu'on signale dans la liste : une alerte muette.
          <StatusTag variant="ghost" color="warning">
            nobody
          </StatusTag>
        ) : (
          <span className={css.truncate}>
            {a.notifications[0].target}
            {a.notifications.length > 1 && (
              <span className={obs.cardSub}> +{a.notifications.length - 1}</span>
            )}
          </span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (v: AlertState) => (
        <StatusTag variant="ghost" color={STATE_COLOR[v]}>
          {STATE_LABEL[v]}
        </StatusTag>
      ),
    },
  ]

  return (
    <>
      {/* En-tête volontairement nu : la recherche vit à côté du bouton, et
          l'état du parc se lit dans le tableau, pas dans une rangée de cartes. */}
      <div className={obs.pageHead}>
        <h1 className={obs.pageTitle}>Alerts</h1>
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
        onClickRow={onDetail}
        emptyState={{
          icon: <IconSearchX color="var(--color-text-secondary)" />,
          text: 'No alert matches',
          description: 'Try another search.',
        }}
      />

      <AlertDrawer alert={detail} onClose={() => onDetail(null)} />
    </>
  )
}

/* ─────────────────────────── Détail d'une règle ─────────────────────────── */

const AlertDrawer = ({ alert, onClose }: { alert: AlertRule | null; onClose: () => void }) => {
  const [muted, setMuted] = useState(false)
  const incidents = alert ? INCIDENTS.filter((i) => i.alertId === alert.id) : []
  // Une alerte qui n'a jamais rien fait n'a pas besoin d'un historique de 24
  // cases grises ni d'un tableau vide : une phrase suffit.
  const everFired = !!alert && alert.lastFired !== 'Never'

  return (
    <Drawer open={!!alert} onClose={onClose} width={720} title={alert?.name ?? ''}>
      {alert && (
        <div className={css.drawer}>
          {/* Une seule ligne d'identité : statut, nature, portée, propriétaire. */}
          <div className={css.metaLine}>
            <StatusTag variant="ghost" color={STATE_COLOR[alert.state]}>
              {STATE_LABEL[alert.state]}
            </StatusTag>
            <span className={obs.cardSub}>
              {KIND_LABEL[alert.kind]} · {alert.scope} · {alert.scopeCount}{' '}
              {alert.kind === 'agent' ? 'agents' : 'tests'} · {alert.owner}
            </span>
          </div>

          {/* La règle, écrite comme on la dirait à l'oral. */}
          <div className={css.ruleBox}>
            {alert.sentence}
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
          </div>

          <section className={css.drawerSection}>
            <div className={css.sectionLabel}>Who gets told</div>
            {alert.notifications.length === 0 ? (
              <Banner variant="warning">
                <Banner.Description>
                  Nobody. This alert opens incidents in the platform but sends nothing out.
                </Banner.Description>
              </Banner>
            ) : (
              alert.notifications.map((n) => (
                <div key={n.channel + n.target} className={css.routeRow}>
                  <span>
                    <span className={obs.cellName}>{n.target}</span>{' '}
                    <span className={obs.cardSub}>{CHANNEL_LABEL[n.channel]}</span>
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
              ))
            )}
          </section>

          {/* Une alerte se juge sur ce qu'elle a fait, pas sur sa définition. */}
          <section className={css.drawerSection}>
            <div className={css.sectionLabel}>Track record</div>
            {!everFired ? (
              <div className={obs.cardSub}>
                Never fired since it was created. Either all is well, or the thresholds are out of reach.
              </div>
            ) : (
              <>
                <div className={css.strip}>
                  {alert.history.map((h, i) => (
                    <span
                      key={i}
                      className={css.stripBar}
                      style={{
                        background: h === 2 ? SEV_COLOR.critical : h === 1 ? SEV_COLOR.warning : IDLE_DOT,
                        height: h === 0 ? 8 : h === 1 ? 18 : 26,
                      }}
                    />
                  ))}
                </div>
                <div className={obs.cardSub}>
                  Last 24 evaluations. {alert.firedLast7d} incidents in the last 7 days, last one{' '}
                  {alert.lastFired?.toLowerCase()}.
                </div>

                {incidents.length > 0 && (
                  <div className={css.incidentList}>
                    {incidents.map((i) => (
                      <div key={i.id} className={css.incidentRow}>
                        <span className={css.sevMark}>
                          <span className={obs.sevDot} style={{ background: SEV_COLOR[i.severity] }} />
                          <span className={`${obs.mono} ${css.nowrap}`}>{i.openedAt}</span>
                        </span>
                        <span className={css.truncate}>{i.trigger}</span>
                        <span className={`${obs.cardSub} ${css.nowrap}`}>{i.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <div className={css.drawerFooter}>
            <Toggle
              title={muted ? 'Paused' : 'Active'}
              description={muted ? 'No incident, no notification' : 'Evaluated every minute'}
              value={!muted}
              onChange={(v) => setMuted(!v)}
            />
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
          </div>
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
