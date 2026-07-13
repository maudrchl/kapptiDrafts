export type ExploreTab = 'logs' | 'traces' | 'svcmap' | 'k8s' | 'usage' | 'perses'

export const EXPLORE_TABS: { key: ExploreTab; label: string }[] = [
  { key: 'logs', label: 'Logs explorer' },
  { key: 'traces', label: 'Traces' },
  { key: 'svcmap', label: 'Service map' },
  { key: 'k8s', label: 'Kubernetes' },
  { key: 'usage', label: 'Usage & ingestion' },
  { key: 'perses', label: 'Traces (Perses)' },
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
      { label: 'Compare traces', primary: true },
    ],
  },
  svcmap: {
    title: 'Service map',
    sub: 'Visualize dependencies and traffic flow between your services',
    actions: [
      { label: 'Refresh', primary: false },
      { label: 'Configure', primary: true },
    ],
  },
  k8s: {
    title: 'Kubernetes',
    sub: 'Cluster health, workloads and resource usage at a glance',
    actions: [
      { label: 'Export', primary: false },
      { label: 'Connect cluster', primary: true },
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
}

/* ─────────────────────────────────────────────
 *  Usage & ingestion (mock) — vue "Usage & ingestion"
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

/** Consommation journalière (GB) — mois courant. */
export const DAILY_GB = [
  0.9, 1.4, 1.1, 2.1, 1.7, 0.6, 0.4, 1.9, 2.6, 2.2, 1.5, 1.2, 3.4, 2.9, 1.8, 2.4, 2.7, 3.1, 2.0, 1.6, 2.8, 3.6, 2.3,
]
export const DAILY_BUDGET_GB = 3.0

export const RETENTION_LABELS: Record<string, string> = {
  standard: 'Standard — 15 days',
  extended: 'Extended — 30 days',
  long: 'Long-term — 90 days + cold tier',
}

/* Options du flow de création d'alerte. */
export const ALERT_SEVERITIES = [
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
]
export const ALERT_CHANNELS = [
  { label: 'Email — on-call', value: 'email' },
  { label: 'Slack — #alerts', value: 'slack' },
  { label: 'PagerDuty', value: 'pagerduty' },
]
export const ALERT_OPERATORS = [
  { label: 'is above', value: 'gt' },
  { label: 'is above or equal', value: 'gte' },
  { label: 'is below', value: 'lt' },
]

export type LogEntry = {
  key: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'debug'
  svc: string
  msg: string
}

export const LOGS: LogEntry[] = [
  { key: 'l1', ts: '2026-07-13 08:11:35.501', level: 'info', svc: 'demo-site', msg: 'GET /api/admin/orders 200 — 39ms' },
  { key: 'l2', ts: '2026-07-13 08:11:35.462', level: 'debug', svc: 'demo-site', msg: 'Admin orders list — 24 orders' },
  { key: 'l3', ts: '2026-07-13 08:11:35.417', level: 'info', svc: 'demo-site', msg: 'Order ORD-MRIXZUY9 status: ready → delivered' },
  { key: 'l4', ts: '2026-07-13 08:11:35.417', level: 'info', svc: 'demo-site', msg: 'PATCH /api/orders/ORD-MRIXZUY9/status 200 — 3ms' },
  { key: 'l5', ts: '2026-07-13 08:11:35.204', level: 'info', svc: 'payment-service', msg: 'Payment captured — ORD-MRIXZUY9 — €42.90 — stripe' },
  { key: 'l6', ts: '2026-07-13 08:10:48.544', level: 'info', svc: 'demo-site', msg: 'GET /api/menu 200 — 1ms' },
  { key: 'l7', ts: '2026-07-13 08:10:48.487', level: 'debug', svc: 'demo-site', msg: 'Menu requested — 18 items — cache hit' },
  { key: 'l8', ts: '2026-07-13 08:10:24.944', level: 'info', svc: 'demo-site', msg: 'POST /api/order 200 — 278ms' },
  { key: 'l9', ts: '2026-07-13 08:10:24.902', level: 'info', svc: 'demo-site', msg: 'Order ORD-MRIXGHJY created — 3 items — €58.40' },
  { key: 'l10', ts: '2026-07-13 08:09:20.118', level: 'warn', svc: 'payment-service', msg: 'Payment gateway latency high — stripe p95=1,240ms' },
  { key: 'l11', ts: '2026-07-13 08:08:34.552', level: 'error', svc: 'payment-service', msg: 'Payment declined — card_declined — ORD-MRIWX7E7' },
  { key: 'l12', ts: '2026-07-13 08:08:34.510', level: 'info', svc: 'demo-site', msg: 'POST /api/login 200 — 461ms' },
  { key: 'l13', ts: '2026-07-13 08:08:34.104', level: 'debug', svc: 'demo-site', msg: 'Session created — user_id=u_8823' },
  { key: 'l14', ts: '2026-07-13 08:07:59.330', level: 'warn', svc: 'demo-site', msg: "Slow query — SELECT orders WHERE status='pending' — 842ms" },
]

export type TraceEntry = {
  key: string
  name: string
  svc: string
  dur: string
  durMs: number
  spans: number
  status: 'ok' | 'error'
  bars: { left: number; width: number; color: string; label: string }[]
}

export const TRACES: TraceEntry[] = [
  {
    key: 'tr_MRIXGHJY', name: 'POST /api/order', svc: 'demo-site', dur: '278ms', durMs: 278, spans: 9, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#6366f1', label: 'demo-site' },
      { left: 8, width: 20, color: '#06b6d4', label: 'redis (cart)' },
      { left: 30, width: 45, color: '#1fae7e', label: 'payment-service' },
      { left: 40, width: 28, color: '#a78bfa', label: 'stripe' },
      { left: 78, width: 18, color: '#f59e0b', label: 'postgres' },
    ],
  },
  {
    key: 'tr_536f6018', name: 'GET /api/admin/orders', svc: 'demo-site', dur: '39ms', durMs: 39, spans: 5, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#6366f1', label: 'demo-site' },
      { left: 15, width: 70, color: '#f59e0b', label: 'postgres' },
    ],
  },
  {
    key: 'tr_e8e8cab8', name: 'PATCH /api/orders/ORD-MRIXZUY9/status', svc: 'demo-site', dur: '3ms', durMs: 3, spans: 3, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#6366f1', label: 'demo-site' },
      { left: 25, width: 55, color: '#f59e0b', label: 'postgres' },
    ],
  },
  {
    key: 'tr_MRIWX7E7', name: 'POST /api/payments/charge', svc: 'payment-service', dur: '1.2s', durMs: 1240, spans: 4, status: 'error',
    bars: [
      { left: 0, width: 100, color: '#1fae7e', label: 'payment-service' },
      { left: 5, width: 92, color: '#a78bfa', label: 'stripe (card_declined)' },
    ],
  },
  {
    key: 'tr_cab2adb1', name: 'POST /api/login', svc: 'demo-site', dur: '461ms', durMs: 461, spans: 4, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#6366f1', label: 'demo-site' },
      { left: 6, width: 40, color: '#60a5fa', label: 'auth' },
      { left: 48, width: 45, color: '#f59e0b', label: 'postgres' },
    ],
  },
  {
    key: 'tr_71ba90d0', name: 'GET /api/menu', svc: 'demo-site', dur: '1ms', durMs: 1, spans: 2, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#6366f1', label: 'demo-site' },
      { left: 20, width: 60, color: '#06b6d4', label: 'redis (cache)' },
    ],
  },
  {
    key: 'tr_1cd34f35', name: 'POST /api/register', svc: 'demo-site', dur: '484ms', durMs: 484, spans: 5, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#6366f1', label: 'demo-site' },
      { left: 5, width: 35, color: '#60a5fa', label: 'auth' },
      { left: 38, width: 35, color: '#f59e0b', label: 'postgres' },
      { left: 72, width: 24, color: '#34d399', label: 'notification' },
    ],
  },
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

export type PodEntry = {
  key: string
  name: string
  ns: string
  status: 'Running' | 'CrashLoopBackOff' | 'Pending'
  cpu: string
  mem: string
  restarts: number
  age: string
}

export const PODS: PodEntry[] = [
  { key: 'p1', name: 'demo-site-7f8d9c-x4k2p', ns: 'rocket-corp', status: 'Running', cpu: '210m / 500m', mem: '312Mi / 512Mi', restarts: 0, age: '4d' },
  { key: 'p2', name: 'demo-site-7f8d9c-q9v2m', ns: 'rocket-corp', status: 'Running', cpu: '184m / 500m', mem: '298Mi / 512Mi', restarts: 0, age: '4d' },
  { key: 'p3', name: 'payment-service-9e2f1a-j6h3r', ns: 'rocket-corp', status: 'Running', cpu: '90m / 500m', mem: '220Mi / 1Gi', restarts: 3, age: '2d' },
  { key: 'p4', name: 'payment-service-9e2f1a-t2w5k', ns: 'rocket-corp', status: 'CrashLoopBackOff', cpu: '0m / 500m', mem: '0Mi / 1Gi', restarts: 12, age: '5h' },
  { key: 'p5', name: 'postgres-0', ns: 'rocket-corp', status: 'Running', cpu: '340m / 1000m', mem: '1.2Gi / 2Gi', restarts: 0, age: '9d' },
  { key: 'p6', name: 'redis-0', ns: 'rocket-corp', status: 'Running', cpu: '45m / 250m', mem: '128Mi / 512Mi', restarts: 0, age: '9d' },
  { key: 'p7', name: 'notification-6f1d4e-q3r8w', ns: 'rocket-corp', status: 'Running', cpu: '60m / 250m', mem: '96Mi / 256Mi', restarts: 0, age: '7d' },
]
