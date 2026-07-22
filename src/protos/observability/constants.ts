export type ExploreTab =
  | 'logs'
  | 'traces'
  | 'svcmap'
  | 'k8s'
  | 'usage'
  | 'perses'
  | 'alerts'
  | 'incidents'
  | 'destinations'

export const EXPLORE_TABS: { key: ExploreTab; label: string }[] = [
  { key: 'logs', label: 'Logs explorer' },
  { key: 'traces', label: 'Traces' },
  { key: 'svcmap', label: 'Service map' },
  { key: 'k8s', label: 'Kubernetes' },
  { key: 'usage', label: 'Usage & ingestion' },
  { key: 'perses', label: 'Traces (Perses)' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'destinations', label: 'Destinations' },
]

export const PAGE_META: Record<
  ExploreTab,
  { title: string; sub: string; actions: { label: string; primary: boolean }[] }
> = {
  logs: {
    title: 'Logs explorer',
    sub: 'Search, filter and analyze logs across all services in real time',
    actions: [
      { label: 'Pin as panel', primary: false },
      { label: 'Create alert', primary: true },
    ],
  },
  traces: {
    title: 'Traces',
    sub: 'Distributed tracing to follow requests across your microservices',
    actions: [
      { label: 'Pin as panel', primary: false },
      { label: 'Create alert', primary: true },
    ],
  },
  svcmap: {
    title: 'Service map',
    sub: 'Visualize dependencies and traffic flow between your services',
    actions: [{ label: 'Refresh', primary: false }],
  },
  k8s: {
    title: 'Kubernetes',
    sub: 'Monitor pods, resource usage and cluster health',
    actions: [
      { label: 'Export', primary: false },
      { label: 'Refresh', primary: false },
    ],
  },
  usage: {
    title: 'Usage & ingestion',
    sub: 'Ingestion volume, quota, retention and OTLP access for this workspace',
    actions: [
      { label: 'Read docs', primary: false },
      { label: 'Adjust quota', primary: true },
    ],
  },
  perses: {
    title: 'Traces (Perses)',
    sub: 'Build and edit trace dashboards backed by ClickHouse, Perses-powered',
    actions: [],
  },
  alerts: {
    title: 'Alerts',
    sub: 'Rules that watch a query and notify a destination when a condition is met',
    actions: [{ label: 'Create alert', primary: true }],
  },
  incidents: {
    title: 'Incidents',
    sub: 'Incidents opened by your alerts, with acknowledge and resolve actions',
    actions: [],
  },
  destinations: {
    title: 'Destinations',
    sub: 'Reusable notification targets used by your alerts',
    actions: [{ label: 'Add destination', primary: true }],
  },
}

/* ─────────────────────────────────────────────
 *  Usage & ingestion (mock) - vue "Usage & ingestion"
 * ───────────────────────────────────────────── */
export const OTLP_ENDPOINT_USAGE = 'https://otlp.eu.kapptivate.com:4317'
export const OTLP_INTERNAL_ID = '3e8bb916-ff44-5a58-b45d-72ef8b0b76d8'
export const OTLP_KEY_MASKED =
  'otlp_sk_live_a91c··················3f9a'

/** Ingéré ce mois-ci (le statut "Critical" dérive de ceci vs le cap, pas d'un chiffre en dur). */
export const USAGE_INGESTED_GB = 8.6
export const USAGE_DAY_OF_MONTH = 23
export const USAGE_DAYS_IN_MONTH = 31

export type SignalKey = 'metrics' | 'logs' | 'traces'
export type SignalDatum = {
  key: SignalKey
  name: string
  size: string
  bytes: number
  color: string
  meta: string
  /** part approximative de la consommation journalière, pour le filtre par signal */
  share: number
}

export const SIGNALS: SignalDatum[] = [
  { key: 'metrics', name: 'Metrics', size: '5.8 GB', bytes: 5800, color: '#1fae7e', meta: '25,243,312 data points', share: 0.76 },
  { key: 'logs', name: 'Logs', size: '999.0 KB', bytes: 0.999, color: '#ed7846', meta: '2,291 log records', share: 0.12 },
  { key: 'traces', name: 'Traces', size: '847.3 KB', bytes: 0.847, color: '#f2b338', meta: '1,344 spans · 1,018 traces · 17 errors', share: 0.12 },
]

/** Consommation journalière (GB) - mois courant. */
export const DAILY_GB = [
  0.9, 1.4, 1.1, 2.1, 1.7, 0.6, 0.4, 1.9, 2.6, 2.2, 1.5, 1.2, 3.4, 2.9, 1.8, 2.4, 2.7, 3.1, 2.0, 1.6, 2.8, 3.6, 2.3,
]
export const DAILY_BUDGET_GB = 3.0

export const RETENTION_LABELS: Record<string, string> = {
  standard: 'Standard - 15 days',
  extended: 'Extended - 30 days',
  long: 'Long-term - 90 days + cold tier',
}

/* Options du flow de création d'alerte. */
export const ALERT_SEVERITIES = [
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
]
export const ALERT_CHANNELS = [
  { label: 'Email - on-call', value: 'email' },
  { label: 'Slack - #alerts', value: 'slack' },
  { label: 'PagerDuty', value: 'pagerduty' },
]
export const ALERT_OPERATORS = [
  { label: 'is above', value: 'gt' },
  { label: 'is above or equal', value: 'gte' },
  { label: 'is below', value: 'lt' },
]

/* Cadence d'évaluation d'une alerte (scheduled), fenêtre de données, anti-spam. */
export const ALERT_FREQUENCIES = [
  { label: 'Every 1 min', value: '1' },
  { label: 'Every 5 min', value: '5' },
  { label: 'Every 10 min', value: '10' },
  { label: 'Every 15 min', value: '15' },
  { label: 'Every 30 min', value: '30' },
  { label: 'Every hour', value: '60' },
]
export const ALERT_LOOKBACKS = [
  { label: 'Last 5 min', value: '5' },
  { label: 'Last 15 min', value: '15' },
  { label: 'Last 30 min', value: '30' },
  { label: 'Last 1 hour', value: '60' },
  { label: 'Last 6 hours', value: '360' },
]
export const ALERT_COOLDOWNS = [
  { label: 'No cooldown', value: '0' },
  { label: '5 min', value: '5' },
  { label: '15 min', value: '15' },
  { label: '30 min', value: '30' },
  { label: '1 hour', value: '60' },
]

/* ─── Destinations (cibles de notification réutilisables) ─── */
export type DestinationType = 'slack' | 'email' | 'webhook' | 'teams' | 'pagerduty'
export const DESTINATION_TYPES: { label: string; value: DestinationType }[] = [
  { label: 'Slack', value: 'slack' },
  { label: 'Email', value: 'email' },
  { label: 'Webhook', value: 'webhook' },
  { label: 'Microsoft Teams', value: 'teams' },
  { label: 'PagerDuty', value: 'pagerduty' },
]
export type DestinationItem = {
  key: string
  name: string
  type: DestinationType
  target: string
  usedBy: number
}
export const DESTINATIONS: DestinationItem[] = [
  { key: 'dst-slack-alerts', name: 'Slack #alerts', type: 'slack', target: '#alerts', usedBy: 3 },
  { key: 'dst-oncall-email', name: 'On-call email', type: 'email', target: 'oncall@rocketcorp.io', usedBy: 2 },
  { key: 'dst-pagerduty', name: 'PagerDuty escalation', type: 'pagerduty', target: 'PD service P3XZ9', usedBy: 1 },
  { key: 'dst-webhook', name: 'Ops webhook', type: 'webhook', target: 'https://hooks.rocketcorp.io/obs', usedBy: 1 },
]

/* ─── Alerts (règles) ─── */
export type AlertStatus = 'active' | 'silenced' | 'firing'
export type AlertItem = {
  key: string
  name: string
  signal: 'logs' | 'traces' | 'metrics'
  query: string
  operator: string
  threshold: number
  checkEvery: number
  lookBack: number
  cooldown: number
  severity: string
  destinationKey: string
  createsIncident: boolean
  status: AlertStatus
  lastTriggered: string
}
export const ALERTS: AlertItem[] = [
  { key: 'al-1', name: 'High checkout error rate', signal: 'logs', query: 'level:error svc:demo-site route:/api/order', operator: 'gt', threshold: 5, checkEvery: 5, lookBack: 15, cooldown: 30, severity: 'critical', destinationKey: 'dst-pagerduty', createsIncident: true, status: 'firing', lastTriggered: '8 min ago' },
  { key: 'al-2', name: 'Payment latency p95 high', signal: 'traces', query: 'service:payment-service p95_ms', operator: 'gt', threshold: 1000, checkEvery: 5, lookBack: 30, cooldown: 15, severity: 'warning', destinationKey: 'dst-slack-alerts', createsIncident: true, status: 'active', lastTriggered: '2 hours ago' },
  { key: 'al-3', name: 'Login failures spike', signal: 'logs', query: 'level:warn route:/api/login', operator: 'gte', threshold: 20, checkEvery: 10, lookBack: 30, cooldown: 30, severity: 'warning', destinationKey: 'dst-slack-alerts', createsIncident: false, status: 'active', lastTriggered: 'Yesterday' },
  { key: 'al-4', name: 'Ingestion quota near limit', signal: 'metrics', query: 'observability.usage.bytes', operator: 'gt', threshold: 90, checkEvery: 60, lookBack: 360, cooldown: 60, severity: 'info', destinationKey: 'dst-oncall-email', createsIncident: false, status: 'active', lastTriggered: 'Never' },
  { key: 'al-5', name: 'Menu service 5xx', signal: 'traces', query: 'service:demo-site status:error route:/api/menu', operator: 'gt', threshold: 3, checkEvery: 5, lookBack: 15, cooldown: 15, severity: 'critical', destinationKey: 'dst-slack-alerts', createsIncident: true, status: 'silenced', lastTriggered: '3 days ago' },
]

/* ─── Incidents (ouverts par les alertes) ─── */
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved'
export type IncidentItem = {
  key: string
  title: string
  alertKey: string
  severity: string
  status: IncidentStatus
  service: string
  openedAt: string
  duration: string
}
export const INCIDENTS: IncidentItem[] = [
  { key: 'inc-1', title: 'Checkout errors above threshold', alertKey: 'al-1', severity: 'critical', status: 'open', service: 'demo-site', openedAt: '2026-07-13 08:03', duration: '8 min' },
  { key: 'inc-2', title: 'Payment latency degraded', alertKey: 'al-2', severity: 'warning', status: 'acknowledged', service: 'payment-service', openedAt: '2026-07-13 06:12', duration: '2 h' },
  { key: 'inc-3', title: 'Menu service returning 5xx', alertKey: 'al-5', severity: 'critical', status: 'resolved', service: 'demo-site', openedAt: '2026-07-10 14:20', duration: '42 min' },
  { key: 'inc-4', title: 'Login failures spike', alertKey: 'al-3', severity: 'warning', status: 'resolved', service: 'demo-site', openedAt: '2026-07-12 19:45', duration: '1 h 10 min' },
]

export type LogEntry = {
  key: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'debug'
  svc: string
  msg: string
  // Trace à laquelle appartient la ligne de log, quand elle est corrélée à une
  // requête tracée. Référence une clé de TRACES ; absent pour les logs hors trace.
  traceKey?: string
}

// LOGS et TRACES sont générés plus bas à partir de RAW_LOGS + GROUP_SPECS
// (scénario Rocket Corp / demo-site), pour que le flux de logs et les traces
// racontent la même histoire.

export type TraceEntry = {
  key: string
  // Identifiant de trace tel qu'exposé à l'utilisateur : 32 caractères hexa
  // (format W3C trace-context). `key` reste l'identifiant interne court.
  traceId: string
  name: string
  svc: string
  dur: string
  durMs: number
  spans: number
  status: 'ok' | 'error'
  bars: { left: number; width: number; color: string; label: string }[]
}

/* Flux de logs (scénario Rocket Corp / demo-site). Format compact :
   [level, heure, service, message, groupe]. Le groupe rassemble les lignes
   d'une même requête -> même trace (alimente le lien log->trace + le
   regroupement au survol). Messages sans em dash (préférence Maud). */
type RawLog = [LogEntry['level'], string, string, string, string]

const RAW_LOGS: RawLog[] = [
  ['info', '13:29:34.562', 'demo-site', 'GET /api/admin/orders 200 - 2ms', 'g1'],
  ['debug', '13:29:34.561', 'demo-site', 'Admin orders list', 'g1'],
  ['info', '13:29:34.528', 'demo-site', 'PATCH /api/orders/ORD-MRNJOHK2/status 200 - 3ms', 'g2'],
  ['info', '13:29:34.528', 'demo-site', 'Order ORD-MRNJOHK2 status: ready → delivered', 'g2'],
  ['info', '13:29:22.206', 'demo-site', 'GET /api/admin/orders 200 - 2ms', 'g3'],
  ['debug', '13:29:22.205', 'demo-site', 'Admin orders list', 'g3'],
  ['info', '13:29:22.161', 'demo-site', 'PATCH /api/orders/ORD-MRNJOHK2/status 200 - 5ms', 'g4'],
  ['info', '13:29:22.161', 'demo-site', 'Order ORD-MRNJOHK2 status: preparing → ready', 'g4'],
  ['info', '13:29:08.614', 'demo-site', 'GET /api/admin/orders 200 - 2ms', 'g5'],
  ['debug', '13:29:08.612', 'demo-site', 'Admin orders list', 'g5'],
  ['info', '13:29:08.555', 'demo-site', 'PATCH /api/orders/ORD-MRNJOHK2/status 200 - 6ms', 'g6'],
  ['info', '13:29:08.554', 'demo-site', 'Order ORD-MRNJOHK2 status: pending → preparing', 'g6'],
  ['info', '13:28:55.541', 'demo-site', 'GET /api/admin/orders 200 - 3ms', 'g7'],
  ['debug', '13:28:55.538', 'demo-site', 'Admin orders list', 'g7'],
  ['info', '13:28:40.510', 'demo-site', 'GET /api/menu 200 - 1ms', 'g8'],
  ['debug', '13:28:40.509', 'demo-site', 'Menu requested - 18 items', 'g8'],
  ['info', '13:28:30.748', 'demo-site', 'POST /api/order 200 - 421ms', 'g9'],
  ['info', '13:28:30.747', 'demo-site', 'Order created', 'g9'],
  ['info', '13:28:30.745', 'demo-site', 'Payment confirmed: txn TXN-MRNJOHSL', 'g9'],
  ['info', '13:28:30.741', 'payment-service', 'Payment processed - order ORD-MRNJOHK2, txn TXN-MRNJOHSL, €15.50', 'g9'],
  ['info', '13:28:30.423', 'payment-service', 'Payment validation OK - card for €15.50', 'g9'],
  ['info', '13:27:26.959', 'demo-site', 'GET /api/menu 200 - 1ms', 'g10'],
  ['debug', '13:27:26.958', 'demo-site', 'Menu requested - 18 items', 'g10'],
  ['info', '13:27:26.837', 'demo-site', 'POST /api/login 200 - 601ms', 'g11'],
  ['info', '13:27:26.837', 'demo-site', 'User logged in', 'g11'],
  ['info', '13:26:41.248', 'demo-site', 'GET /api/menu 200 - 1ms', 'g12'],
  ['debug', '13:26:41.248', 'demo-site', 'Menu requested - 18 items', 'g12'],
  ['info', '13:26:41.061', 'demo-site', 'POST /api/register 200 - 503ms', 'g13'],
  ['info', '13:26:41.060', 'demo-site', 'User registered', 'g13'],
  ['warn', '13:13:31.394', 'demo-site', 'POST /api/order 402 - 247ms', 'g14'],
  ['error', '13:13:31.394', 'demo-site', 'Payment processing failed for order ORD-MRNJ57QC: Payment declined - insufficient funds', 'g14'],
  ['error', '13:13:31.390', 'payment-service', 'Payment DECLINED for order ORD-MRNJ57QC - insufficient funds', 'g14'],
  ['info', '13:13:31.232', 'payment-service', 'Payment validation OK - card for €15.50', 'g14'],
  ['info', '13:12:25.250', 'demo-site', 'GET /api/menu 200 - 2ms', 'g15'],
  ['debug', '13:12:25.250', 'demo-site', 'Menu requested - 18 items', 'g15'],
  ['info', '13:12:25.148', 'demo-site', 'POST /api/login 200 - 445ms', 'g16'],
  ['info', '13:12:25.147', 'demo-site', 'User logged in', 'g16'],
  ['info', '13:11:39.666', 'demo-site', 'GET /api/menu 200 - 2ms', 'g17'],
  ['debug', '13:11:39.665', 'demo-site', 'Menu requested - 18 items', 'g17'],
  ['info', '13:11:39.547', 'demo-site', 'POST /api/register 200 - 587ms', 'g18'],
  ['info', '13:11:39.546', 'demo-site', 'User registered', 'g18'],
  ['error', '12:58:27.573', 'demo-site', 'Payment processing failed for order ORD-MRNILUAA: Payment declined - insufficient funds', 'g19'],
  ['warn', '12:58:27.573', 'demo-site', 'POST /api/order 402 - 359ms', 'g19'],
  ['error', '12:58:27.569', 'payment-service', 'Payment DECLINED for order ORD-MRNILUAA - insufficient funds', 'g19'],
  ['info', '12:58:27.337', 'payment-service', 'Payment validation OK - card for €15.50', 'g19'],
  ['info', '12:57:21.844', 'demo-site', 'GET /api/menu 200 - 1ms', 'g20'],
  ['debug', '12:57:21.844', 'demo-site', 'Menu requested - 18 items', 'g20'],
  ['info', '12:57:21.731', 'demo-site', 'POST /api/login 200 - 391ms', 'g21'],
  ['info', '12:57:21.730', 'demo-site', 'User logged in', 'g21'],
  ['info', '12:56:37.639', 'demo-site', 'GET /api/menu 200 - 1ms', 'g22'],
]

export const LOGS: LogEntry[] = RAW_LOGS.map(([level, time, svc, msg, group], i) => ({
  key: `l${i + 1}`,
  ts: `2026-07-13 ${time}`,
  level,
  svc,
  msg,
  traceKey: group ? `tr_${group}` : undefined,
}))

// Total "serveur" affiché dans la barre de résultats (les lignes chargées sont
// un sous-ensemble d'un flux bien plus large).
export const LOG_TOTAL = 2403

/* Traces dérivées des groupes de logs : chaque requête tracée devient une
   trace cohérente (nom = route, durée = celle de la ligne HTTP, services =
   ceux touchés), pour que le tag d'un log ouvre une trace crédible. */
type GroupSpec = { name: string; durMs: number; status: 'ok' | 'error'; svcs: string[] }

const GROUP_SPECS: Record<string, GroupSpec> = {
  g1: { name: 'GET /api/admin/orders', durMs: 2, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g2: { name: 'PATCH /api/orders/ORD-MRNJOHK2/status', durMs: 3, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g3: { name: 'GET /api/admin/orders', durMs: 2, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g4: { name: 'PATCH /api/orders/ORD-MRNJOHK2/status', durMs: 5, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g5: { name: 'GET /api/admin/orders', durMs: 2, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g6: { name: 'PATCH /api/orders/ORD-MRNJOHK2/status', durMs: 6, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g7: { name: 'GET /api/admin/orders', durMs: 3, status: 'ok', svcs: ['demo-site', 'postgres'] },
  g8: { name: 'GET /api/menu', durMs: 1, status: 'ok', svcs: ['demo-site', 'redis'] },
  g9: { name: 'POST /api/order', durMs: 421, status: 'ok', svcs: ['demo-site', 'payment-service', 'stripe', 'postgres'] },
  g10: { name: 'GET /api/menu', durMs: 1, status: 'ok', svcs: ['demo-site', 'redis'] },
  g11: { name: 'POST /api/login', durMs: 601, status: 'ok', svcs: ['demo-site', 'auth', 'postgres'] },
  g12: { name: 'GET /api/menu', durMs: 1, status: 'ok', svcs: ['demo-site', 'redis'] },
  g13: { name: 'POST /api/register', durMs: 503, status: 'ok', svcs: ['demo-site', 'auth', 'postgres'] },
  g14: { name: 'POST /api/order', durMs: 247, status: 'error', svcs: ['demo-site', 'payment-service'] },
  g15: { name: 'GET /api/menu', durMs: 2, status: 'ok', svcs: ['demo-site', 'redis'] },
  g16: { name: 'POST /api/login', durMs: 445, status: 'ok', svcs: ['demo-site', 'auth', 'postgres'] },
  g17: { name: 'GET /api/menu', durMs: 2, status: 'ok', svcs: ['demo-site', 'redis'] },
  g18: { name: 'POST /api/register', durMs: 587, status: 'ok', svcs: ['demo-site', 'auth', 'postgres'] },
  g19: { name: 'POST /api/order', durMs: 359, status: 'error', svcs: ['demo-site', 'payment-service'] },
  g20: { name: 'GET /api/menu', durMs: 1, status: 'ok', svcs: ['demo-site', 'redis'] },
  g21: { name: 'POST /api/login', durMs: 391, status: 'ok', svcs: ['demo-site', 'auth', 'postgres'] },
  g22: { name: 'GET /api/menu', durMs: 1, status: 'ok', svcs: ['demo-site', 'redis'] },
}

const SVC_COLOR: Record<string, string> = {
  'demo-site': '#6366f1',
  'payment-service': '#1fae7e',
  stripe: '#a78bfa',
  postgres: '#f59e0b',
  redis: '#06b6d4',
  auth: '#60a5fa',
}
const BAR_LAYOUT = [
  { left: 0, width: 100 },
  { left: 18, width: 60 },
  { left: 36, width: 42 },
  { left: 60, width: 32 },
]
// Id de trace 32-hex déterministe (stable au reload) dérivé du groupe.
const hex32 = (seed: string) => {
  const h = '0123456789abcdef'
  let out = ''
  for (let i = 0; i < 32; i++) out += h[(seed.charCodeAt(i % seed.length) * (i + 13) + i * 7) % 16]
  return out
}
const durLabel = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`)

export const TRACES: TraceEntry[] = Object.entries(GROUP_SPECS).map(([g, spec]) => ({
  key: `tr_${g}`,
  traceId: hex32(`${g}:${spec.name}`),
  name: spec.name,
  svc: spec.svcs[0],
  dur: durLabel(spec.durMs),
  durMs: spec.durMs,
  spans: RAW_LOGS.filter((r) => r[4] === g).length + spec.svcs.length,
  status: spec.status,
  bars: spec.svcs.map((s, i) => ({
    ...BAR_LAYOUT[Math.min(i, BAR_LAYOUT.length - 1)],
    color: SVC_COLOR[s] ?? '#94a3b8',
    label: s,
  })),
}))

/* ─── Compare period-over-period (mock) ───
 * Agrégats de la fenêtre courante vs la précédente, pour le mode "Compare to
 * previous period" de la vue Traces. */
export type CompareMetric = { cur: number; prev: number }
export const TRACE_COMPARE: {
  requests: CompareMetric
  errorRate: CompareMetric
  avg: CompareMetric
  p95: CompareMetric
  p99: CompareMetric
} = {
  requests: { cur: 48200, prev: 41000 },
  errorRate: { cur: 2.1, prev: 1.7 },
  avg: { cur: 127, prev: 118 },
  p95: { cur: 445, prev: 418 },
  p99: { cur: 890, prev: 1010 },
}

/** Latence moyenne par service, fenêtre courante vs précédente (ms). */
export const SERVICE_LATENCY_DELTA: { name: string; color: string; prevMs: number; currMs: number }[] = [
  { name: 'stripe', color: '#a78bfa', prevMs: 210, currMs: 342 },
  { name: 'payment-service', color: '#1fae7e', prevMs: 96, currMs: 118 },
  { name: 'postgres', color: '#f59e0b', prevMs: 44, currMs: 39 },
  { name: 'redis', color: '#06b6d4', prevMs: 12, currMs: 11 },
  { name: 'demo-site', color: '#6366f1', prevMs: 58, currMs: 55 },
]

export type ServiceNode = {
  id: string
  label: string
  x: number
  y: number
  color: string
  rps: string
  lat: string
  err: string
  spans: number
}

export const SERVICES: ServiceNode[] = [
  { id: 'site', label: 'demo-site', x: 30, y: 20, color: '#6366f1', rps: '1.4K', lat: '58ms', err: '0.4%', spans: 1377 },
  { id: 'auth', label: 'auth', x: 14, y: 55, color: '#60a5fa', rps: '620', lat: '12ms', err: '0%', spans: 210 },
  { id: 'pay', label: 'payment-service', x: 62, y: 46, color: '#1fae7e', rps: '190', lat: '131ms', err: '2.1%', spans: 190 },
  { id: 'redis', label: 'redis', x: 60, y: 16, color: '#06b6d4', rps: '4.8K', lat: '1ms', err: '0%', spans: 940 },
  { id: 'pg', label: 'postgres', x: 40, y: 82, color: '#f59e0b', rps: '2.1K', lat: '9ms', err: '0.1%', spans: 610 },
  { id: 'notif', label: 'notification', x: 84, y: 78, color: '#34d399', rps: '210', lat: '44ms', err: '0%', spans: 88 },
]

export const EDGES: { from: string; to: string; calls: number; lat: string }[] = [
  { from: 'site', to: 'auth', calls: 210, lat: '12ms' },
  { from: 'site', to: 'pay', calls: 190, lat: '131ms' },
  { from: 'site', to: 'redis', calls: 940, lat: '1ms' },
  { from: 'site', to: 'pg', calls: 610, lat: '9ms' },
  { from: 'pay', to: 'pg', calls: 190, lat: '8ms' },
  { from: 'pay', to: 'notif', calls: 88, lat: '44ms' },
]

/* ─────────────────────────────────────────────
 *  Kubernetes - données alignées sur le vrai cluster (data fournie
 *  par le dev : 17 pods sur 7 namespaces, Rocket Corp).
 * ───────────────────────────────────────────── */
export type PodPhase = 'Running' | 'Succeeded' | 'Pending' | 'CrashLoopBackOff' | 'Failed'

export type PodEntry = {
  key: string
  name: string
  ns: string
  status: PodPhase
  restarts: number
}

/** Ordre d'affichage des namespaces (chips de filtre + groupes du pod map). */
export const K8S_NAMESPACES: string[] = [
  'cert-manager',
  'demo',
  'envoy-gateway-system',
  'external-secrets',
  'opentelemetry-operator-system',
  'pipeline',
  'rabbitmq-system',
]

export const PODS: PodEntry[] = [
  // cert-manager
  { key: 'p1', name: 'cert-manager-5c4d47fbcb-x8k2p', ns: 'cert-manager', status: 'Running', restarts: 14 },
  { key: 'p2', name: 'cert-manager-cainjector-f5c8d99b7-q4m1z', ns: 'cert-manager', status: 'Running', restarts: 12 },
  { key: 'p3', name: 'cert-manager-webhook-7c9b5d6f4-t7w3n', ns: 'cert-manager', status: 'Running', restarts: 0 },
  // demo
  { key: 'p4', name: 'demo-site-5c4587f7d6-9ltw9', ns: 'demo', status: 'Running', restarts: 0 },
  { key: 'p5', name: 'payment-service-64b78785d9-h2k4m', ns: 'demo', status: 'Running', restarts: 0 },
  // envoy-gateway-system
  { key: 'p6', name: 'envoy-gateway-d4c4448491-v6p8q', ns: 'envoy-gateway-system', status: 'Running', restarts: 7 },
  { key: 'p7', name: 'envoy-gateways-main-gateway-7b9c4d5f6-k8s2m', ns: 'envoy-gateway-system', status: 'Running', restarts: 0 },
  { key: 'p8', name: 'envoy-gateways-main-gateway-7b9c4d5f6-p3l9x', ns: 'envoy-gateway-system', status: 'Running', restarts: 0 },
  // external-secrets
  { key: 'p9', name: 'bitwarden-sdk-server-6996d5c8b7-m4t2k', ns: 'external-secrets', status: 'Running', restarts: 0 },
  { key: 'p10', name: 'external-secrets-86dcd58c9f-w7q1n', ns: 'external-secrets', status: 'Running', restarts: 0 },
  { key: 'p11', name: 'external-secrets-cert-controller-5f8d7c6b9-z2x4m', ns: 'external-secrets', status: 'Running', restarts: 0 },
  { key: 'p12', name: 'external-secrets-webhook-6c9b8d7f5-h3k1p', ns: 'external-secrets', status: 'Running', restarts: 0 },
  // opentelemetry-operator-system
  { key: 'p13', name: 'opentelemetry-operator-6497d8f9c-n5m2q', ns: 'opentelemetry-operator-system', status: 'Running', restarts: 10 },
  // pipeline
  { key: 'p14', name: 'obs-agent-event-probe', ns: 'pipeline', status: 'Succeeded', restarts: 0 },
  { key: 'p15', name: 'obs-agent-kapptivate-obs-collector-7d8f9c6b5-l4m2n', ns: 'pipeline', status: 'Running', restarts: 0 },
  // rabbitmq-system
  { key: 'p16', name: 'messaging-topology-operator-6b7d8f9c5-k2m4t', ns: 'rabbitmq-system', status: 'Running', restarts: 1 },
  { key: 'p17', name: 'rabbitmq-cluster-operator-7f8d9c6b5-w3n1q', ns: 'rabbitmq-system', status: 'Running', restarts: 9 },
]

/** Requêtes de ressources par déploiement (cpu en millicores, mémoire en Mi).
 *  Alimente les deux bar charts "Request by deployment", chacun trié par sa
 *  propre métrique côté vue. */
export type DeployResource = { name: string; cpuReq: number; memReq: number }

export const K8S_DEPLOYMENTS: DeployResource[] = [
  { name: 'messaging-topology-operator', cpuReq: 300, memReq: 128 },
  { name: 'envoy-gateways-main-gateway', cpuReq: 220, memReq: 1126 },
  { name: 'rabbitmq-cluster-operator', cpuReq: 200, memReq: 500 },
  { name: 'envoy-gateway', cpuReq: 100, memReq: 256 },
  { name: 'obs-agent-kapptivate', cpuReq: 50, memReq: 128 },
  { name: 'payment-service', cpuReq: 50, memReq: 64 },
  { name: 'demo-site', cpuReq: 50, memReq: 64 },
  { name: 'obs-agent', cpuReq: 0, memReq: 0 },
  { name: 'opentelemetry-operator', cpuReq: 0, memReq: 0 },
  { name: 'external-secrets-webhook', cpuReq: 0, memReq: 0 },
  { name: 'external-secrets-cert-controller', cpuReq: 0, memReq: 0 },
  { name: 'external-secrets', cpuReq: 0, memReq: 0 },
  { name: 'bitwarden-sdk-server', cpuReq: 0, memReq: 0 },
  { name: 'cert-manager-webhook', cpuReq: 0, memReq: 0 },
  { name: 'cert-manager-cainjector', cpuReq: 0, memReq: 0 },
  { name: 'cert-manager', cpuReq: 0, memReq: 0 },
]

/** Santé cluster (jauges CPU / mémoire). Millicores et Mi. */
export const K8S_CLUSTER = {
  cpuUsedMilli: 5,
  cpuPct: 1,
  cpuRequestMilli: 970,
  cpuMaxMilli: 1000,
  memUsedMi: 80,
  memPct: 4,
  memRequestMi: 2252, // 2.2Gi
  memMaxMi: 2355, // 2.3Gi
}

/** Étiquettes de temps communes aux séries k8s (fenêtre ~3h). */
export const K8S_XLABELS = ['10:00', '11:00', '12:00', '13:00']
