import { useMemo, useState } from 'react'
import {
  Text,
  Button,
  Table,
  Tag,
  StatusTag,
  SearchInput,
  Segmented,
  Drawer,
  Toggle,
  Input,
  Select,
  Banner,
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

const STATE_LABEL: Record<AlertState, string> = {
  firing: 'firing',
  ok: 'watching',
  muted: 'muted',
}

/** Seuil de bruit : au-delà, l'alerte prévient si souvent qu'on l'ignore. */
const NOISY_THRESHOLD = 5

const Proto = () => {
  const [screen, setScreen] = useState<'list' | 'create'>('list')
  const [detail, setDetail] = useState<AlertRule | null>(null)
  // Les épingles de commentaires suivent l'écran affiché, sinon elles bavent
  // de la liste vers le formulaire de création.
  useReportScreen(screen === 'create' ? 'create' : detail ? `detail:${detail.id}` : 'list')

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
          {screen === 'create' ? (
            <CreateAlert onBack={() => setScreen('list')} />
          ) : (
            <AlertList onCreate={() => setScreen('create')} detail={detail} onDetail={setDetail} />
          )}
        </div>
      </div>
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
  const [tab, setTab] = useState<'all' | 'firing' | 'muted'>('all')

  const firing = ALERTS.filter((a) => a.state === 'firing')
  const silent = ALERTS.filter((a) => a.notifications.length === 0)
  const noisy = ALERTS.filter((a) => a.firedLast7d >= NOISY_THRESHOLD)
  const muted = ALERTS.filter((a) => a.state === 'muted')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ALERTS.filter((a) => {
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.sentence.toLowerCase().includes(q) ||
        a.scope.toLowerCase().includes(q)
      const matchTab =
        tab === 'all' || (tab === 'firing' && a.state === 'firing') || (tab === 'muted' && a.state === 'muted')
      return matchQ && matchTab
    })
  }, [search, tab])

  const columns = [
    {
      title: 'Alert',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, a: AlertRule) => (
        <div className={css.nameCell}>
          <span className={css.nameLine}>
            {/* Pastille = sévérité en cours, grise quand l'alerte ne sonne pas. */}
            <span
              className={obs.sevDot}
              style={{ background: a.firingSeverity ? SEV_COLOR[a.firingSeverity] : IDLE_DOT }}
            />
            {v}
          </span>
          {/* La condition en clair, là où la page actuelle met du jargon de requête. */}
          <span className={obs.cardSub}>{a.sentence}</span>
        </div>
      ),
    },
    {
      title: 'Watches',
      dataIndex: 'scope',
      key: 'scope',
      width: 160,
      render: (v: string, a: AlertRule) => (
        <div className={css.stack}>
          <Tag mono>{v}</Tag>
          <span className={obs.cardSub}>
            {a.scopeCount} {a.kind === 'agent' ? 'agents' : 'tests'}
          </span>
        </div>
      ),
    },
    {
      title: 'Escalates at',
      key: 'thresholds',
      width: 190,
      render: (_v: unknown, a: AlertRule) =>
        // Un script custom n'a pas de seuil lisible : on le dit, au lieu de
        // répéter deux fois « set in the script ».
        a.kind === 'script' ? (
          <span className={obs.cardSub}>defined in the script</span>
        ) : (
          <span className={css.thresholds}>
            <span className={css.sevMark}>
              <span className={obs.sevDot} style={{ background: SEV_COLOR.warning }} />
              <span className={obs.mono}>{a.warning}</span>
            </span>
            <span className={css.arrow}>→</span>
            <span className={css.sevMark}>
              <span className={obs.sevDot} style={{ background: SEV_COLOR.critical }} />
              <span className={obs.mono}>{a.critical}</span>
            </span>
          </span>
        ),
    },
    {
      title: 'Notifies',
      key: 'notifications',
      width: 190,
      render: (_v: unknown, a: AlertRule) =>
        a.notifications.length === 0 ? (
          // Le vrai défaut de la règle, dit à l'endroit où on le lirait.
          <StatusTag variant="ghost" color="warning">
            nobody
          </StatusTag>
        ) : (
          <div className={css.stack}>
            {a.notifications.map((n) => (
              <span key={n.channel + n.target} className={css.nowrap}>
                <span className={obs.cellName}>{n.target}</span>
                {n.severities.length === 1 && (
                  <span className={obs.cardSub}> {n.severities[0]} only</span>
                )}
              </span>
            ))}
          </div>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (v: AlertState, a: AlertRule) => (
        <div className={css.stack}>
          <StatusTag variant="ghost" color={STATE_COLOR[v]}>
            {STATE_LABEL[v]}
          </StatusTag>
          {a.state === 'firing' && a.since && <span className={obs.cardSub}>for {a.since}</span>}
        </div>
      ),
    },
    {
      title: 'Last fired',
      dataIndex: 'lastFired',
      key: 'lastFired',
      width: 145,
      render: (v: string, a: AlertRule) => (
        <div className={css.stack}>
          <span className={`${obs.mono} ${css.nowrap}`}>{v}</span>
          {a.firedLast7d >= NOISY_THRESHOLD && (
            <span className={obs.cardSub}>{a.firedLast7d} in 7 days</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className={obs.pageHead}>
        <div>
          <h1 className={obs.pageTitle}>Alerts</h1>
          <div className={css.headSub}>
            {ALERTS.length} alerts on this workspace. {firing.length} firing right now.
          </div>
        </div>
        <div className={obs.contentActions}>
          <Button color="primary" onClick={onCreate}>
            <Button.Icon icon={IconPlus} />
            New alert
          </Button>
        </div>
      </div>

      {/* Les 4 chiffres qui décident quoi faire de cette page, dans l'ordre où
          on s'en soucie : ce qui sonne, ce qui ne prévient personne, ce qui
          sonne trop, ce qui est en pause. */}
      <div className={obs.kpiRow}>
        <CounterCardGroup>
          <CounterCard
            title="Firing now"
            value={firing.length}
            trend={
              <StatusTag variant="ghost" color={firing.length ? 'failed' : 'success'}>
                {firing.length ? `${firing.length} incidents open` : 'all clear'}
              </StatusTag>
            }
          />
          <CounterCard
            title="Notifying nobody"
            value={silent.length}
            trend={
              <StatusTag variant="ghost" color={silent.length ? 'warning' : 'success'}>
                {silent.length ? 'no destination' : 'all routed'}
              </StatusTag>
            }
          />
          <CounterCard
            title="Too noisy"
            value={noisy.length}
            trend={
              <StatusTag variant="ghost" color={noisy.length ? 'warning' : 'success'}>
                {noisy.length ? `${NOISY_THRESHOLD}+ times in 7 days` : 'nothing spamming'}
              </StatusTag>
            }
          />
          <CounterCard
            title="Muted"
            value={muted.length}
            trend={
              <StatusTag variant="ghost" color="neutral">
                {muted.length ? 'not watching' : 'none paused'}
              </StatusTag>
            }
          />
        </CounterCardGroup>
      </div>

      <div className={obs.usageStack}>
        {silent.length > 0 && (
          <Banner variant="warning">
            <Banner.Description>
              {silent.length === 1
                ? `“${silent[0].name}” has no destination: it opens incidents that nobody is told about.`
                : `${silent.length} alerts have no destination: they open incidents that nobody is told about.`}
            </Banner.Description>
            <Banner.Aside>
              <Button color="secondary" size="s" onClick={() => onDetail(silent[0])}>
                Fix routing
              </Button>
            </Banner.Aside>
          </Banner>
        )}

        <div className={css.toolbar}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search alerts" width="280px" />
          <Segmented<'all' | 'firing' | 'muted'>
            value={tab}
            onChange={setTab}
            options={[
              { label: `All (${ALERTS.length})`, value: 'all' },
              { label: `Firing (${firing.length})`, value: 'firing' },
              { label: `Muted (${muted.length})`, value: 'muted' },
            ]}
          />
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
            description: 'Try a broader search, or switch back to all alerts.',
          }}
        />
      </div>

      <AlertDrawer alert={detail} onClose={() => onDetail(null)} />
    </>
  )
}

/* ─────────────────────────── Détail d'une règle ─────────────────────────── */

const AlertDrawer = ({ alert, onClose }: { alert: AlertRule | null; onClose: () => void }) => {
  const [muted, setMuted] = useState(false)
  const incidents = alert ? INCIDENTS.filter((i) => i.alertId === alert.id) : []

  return (
    <Drawer open={!!alert} onClose={onClose} width={720} title={alert?.name ?? ''}>
      {alert && (
        <div className={obs.usageStack}>
          <div className={css.tagRow}>
            <StatusTag variant="ghost" color={STATE_COLOR[alert.state]}>
              {STATE_LABEL[alert.state]}
            </StatusTag>
            <Tag mono>{KIND_LABEL[alert.kind]}</Tag>
            <Tag mono>{alert.scope}</Tag>
            <span className={obs.cardSub}>
              {alert.scopeCount} {alert.kind === 'agent' ? 'agents' : 'tests'} · owned by {alert.owner}
            </span>
          </div>

          {/* La règle, écrite comme on la dirait à l'oral. */}
          <div className={css.sentenceBox}>
            <Text>{alert.sentence}</Text>
            <div className={css.sentenceMeta}>
              <span className={css.sevMark}>
                <span className={obs.sevDot} style={{ background: SEV_COLOR.warning }} />
                <span className={obs.cardSub}>warning at {alert.warning}</span>
              </span>
              <span className={css.sevMark}>
                <span className={obs.sevDot} style={{ background: SEV_COLOR.critical }} />
                <span className={obs.cardSub}>critical at {alert.critical}</span>
              </span>
            </div>
          </div>

          {/* Une alerte se juge sur ce qu'elle a fait, pas sur sa définition. */}
          <section>
            <div className={css.sectionLabel}>Last 24 evaluations</div>
            <div className={css.strip}>
              {alert.history.map((h, i) => (
                <span
                  key={i}
                  className={css.stripBar}
                  style={{
                    background: h === 2 ? SEV_COLOR.critical : h === 1 ? SEV_COLOR.warning : IDLE_DOT,
                    height: h === 0 ? 10 : h === 1 ? 20 : 28,
                  }}
                />
              ))}
            </div>
            <div className={obs.cardSub}>
              {alert.firedLast7d} incidents in the last 7 days. Last one {alert.lastFired?.toLowerCase()}.
            </div>
          </section>

          <section>
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
                    {n.severities.map((s) => (
                      <span key={s} className={css.sevMark}>
                        <span className={obs.sevDot} style={{ background: SEV_COLOR[s] }} />
                        <span className={obs.cardSub}>{s}</span>
                      </span>
                    ))}
                  </span>
                </div>
              ))
            )}
          </section>

          <section>
            <div className={css.sectionLabel}>Recent incidents</div>
            <Table
              rowKey="id"
              compact
              showHeader
              columns={[
                {
                  title: 'Opened',
                  dataIndex: 'openedAt',
                  key: 'openedAt',
                  width: 140,
                  render: (v: string) => <span className={obs.mono}>{v}</span>,
                },
                {
                  title: 'Severity',
                  dataIndex: 'severity',
                  key: 'severity',
                  width: 110,
                  render: (v: Severity) => (
                    <span className={obs.sevCell}>
                      <span className={obs.sevDot} style={{ background: SEV_COLOR[v] }} />
                      {v}
                    </span>
                  ),
                },
                { title: 'What tripped it', dataIndex: 'trigger', key: 'trigger' },
                {
                  title: 'Duration',
                  dataIndex: 'duration',
                  key: 'duration',
                  width: 100,
                  render: (v: string) => <span className={obs.mono}>{v}</span>,
                },
              ]}
              data={incidents}
              emptyState={{
                icon: <IconBell color="var(--color-text-secondary)" />,
                text: 'Never fired',
                description: 'This alert has not opened a single incident yet.',
              }}
            />
          </section>

          <div className={css.drawerFooter}>
            <Toggle
              title={muted ? 'Muted' : 'Watching'}
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

/* ────────────────────────────── Création ────────────────────────────── */

const CreateAlert = ({ onBack }: { onBack: () => void }) => {
  const [intent, setIntent] = useState<Intent | null>(null)

  return (
    <>
      <div className={obs.pageHead}>
        <div>
          <Button color="secondary" size="s" onClick={intent ? () => setIntent(null) : onBack}>
            <Button.Icon icon={IconArrowLeft} />
            {intent ? 'Back to alert types' : 'Back to alerts'}
          </Button>
          <h1 className={obs.pageTitle} style={{ marginTop: 16 }}>
            {intent ? intent.question : 'What do you want to be warned about?'}
          </h1>
          <div className={css.headSub}>
            {intent
              ? KIND_LABEL[intent.kind]
              : 'Pick the situation. The alert type, the query and the thresholds follow from it.'}
          </div>
        </div>
      </div>

      {!intent ? <IntentPicker onPick={setIntent} /> : <AlertForm intent={intent} onCancel={onBack} />}
    </>
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
        <span className={css.intentIcon}>
          <Icon size={17} color="var(--color-text-secondary)" />
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
const AlertForm = ({ intent, onCancel }: { intent: Intent; onCancel: () => void }) => {
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

        <div className={css.formFooter}>
          <Button color="primary">Create alert</Button>
          <Button color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
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
