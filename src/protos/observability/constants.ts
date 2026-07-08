import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Search,
  LayoutDashboard,
  Network,
  Boxes,
  Bell,
  PlugZap,
  MonitorDot,
  Eye,
  BarChart3,
  Command,
  MonitorPlay,
  Zap,
  CheckCircle2,
  Timer,
  Braces,
  Smartphone,
  Bot,
} from 'lucide-react'

// Les icônes de cette proto viennent toutes de lucide-react (forwardRef) :
// on type IconCmp avec LucideIcon pour éviter le mismatch avec ComponentType.
export type IconCmp = LucideIcon

/* ─────────────────────────────────────────────
 *  États du tenant observabilité (first-run)
 * ───────────────────────────────────────────── */
export type TenantState = 'not-provisioned' | 'awaiting-data' | 'active'

/* ─────────────────────────────────────────────
 *  Navigation produit repensée
 *  Fini le doublon DASHBOARDS / TEMPLATES.
 *  Explore = investiguer · Dashboards = boards ·
 *  Services + Infra = vues dédiées · Alerts = réagir.
 * ───────────────────────────────────────────── */
export type ViewKey =
  | 'overview'
  | 'explore'
  | 'dashboards'
  | 'services'
  | 'infrastructure'
  | 'alerts'
  | 'setup'

export type NavItem = {
  key: ViewKey
  label: string
  icon: IconCmp
  /** nécessite que le tenant soit provisionné pour être exploitable */
  needsTenant?: boolean
}

export type NavGroup = { section?: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    items: [{ key: 'overview', label: 'Overview', icon: Activity }],
  },
  {
    section: 'Investigate',
    items: [
      { key: 'explore', label: 'Explore', icon: Search, needsTenant: true },
      {
        key: 'dashboards',
        label: 'Dashboards',
        icon: LayoutDashboard,
        needsTenant: true,
      },
    ],
  },
  {
    section: 'Monitor',
    items: [
      { key: 'services', label: 'Services', icon: Network, needsTenant: true },
      {
        key: 'infrastructure',
        label: 'Infrastructure',
        icon: Boxes,
        needsTenant: true,
      },
      { key: 'alerts', label: 'Alerts', icon: Bell, needsTenant: true },
    ],
  },
  {
    section: 'Configure',
    items: [{ key: 'setup', label: 'Setup', icon: PlugZap }],
  },
]

export const VIEW_TITLES: Record<ViewKey, { title: string; sub: string }> = {
  overview: {
    title: 'Overview',
    sub: 'Overall health, ingestion and active signals for this workspace',
  },
  explore: {
    title: 'Explore',
    sub: 'Ad-hoc investigation — logs, traces and metrics in one place',
  },
  dashboards: {
    title: 'Dashboards',
    sub: 'Your saved boards. Create one from a template.',
  },
  services: {
    title: 'Services',
    sub: 'Dependency map and per-service health (APM)',
  },
  infrastructure: {
    title: 'Infrastructure',
    sub: 'Pods, resource usage and Kubernetes cluster health',
  },
  alerts: {
    title: 'Alerts',
    sub: 'Alert rules and currently firing alerts',
  },
  setup: {
    title: 'Setup',
    sub: 'OpenTelemetry ingestion, quota and observability enablement',
  },
}

/* ─────────────────────────────────────────────
 *  Endpoint d'ingestion (mock)
 * ───────────────────────────────────────────── */
export const OTLP_ENDPOINT = 'https://otlp.eu.kapptivate.com:4317'
export const OTLP_HTTP_ENDPOINT = 'https://otlp.eu.kapptivate.com/v1'

/* ─────────────────────────────────────────────
 *  Données mock — état "active"
 * ───────────────────────────────────────────── */
export type Health = 'healthy' | 'degraded' | 'down'

export type Service = {
  name: string
  kind: string
  health: Health
  p95: number // ms
  errorRate: number // %
  throughput: number // req/min
}

export const SERVICES: Service[] = [
  { name: 'api-gateway', kind: 'HTTP', health: 'healthy', p95: 82, errorRate: 0.2, throughput: 12400 },
  { name: 'checkout', kind: 'gRPC', health: 'degraded', p95: 340, errorRate: 2.8, throughput: 3100 },
  { name: 'payments', kind: 'HTTP', health: 'healthy', p95: 128, errorRate: 0.6, throughput: 2050 },
  { name: 'catalog', kind: 'HTTP', health: 'healthy', p95: 64, errorRate: 0.1, throughput: 8800 },
  { name: 'inventory', kind: 'gRPC', health: 'down', p95: 0, errorRate: 100, throughput: 0 },
  { name: 'notifications', kind: 'Worker', health: 'healthy', p95: 210, errorRate: 0.4, throughput: 640 },
]

export type Severity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'firing' | 'pending' | 'resolved'

export type AlertRow = {
  name: string
  service: string
  severity: Severity
  status: AlertStatus
  since: string
  value: string
}

export const ALERTS: AlertRow[] = [
  { name: 'inventory — no data received', service: 'inventory', severity: 'critical', status: 'firing', since: '8 min', value: '0 req/min' },
  { name: 'checkout — error rate > 2%', service: 'checkout', severity: 'critical', status: 'firing', since: '22 min', value: '2.8%' },
  { name: 'checkout — p95 latency > 300ms', service: 'checkout', severity: 'warning', status: 'firing', since: '31 min', value: '340 ms' },
  { name: 'payments — p95 latency > 250ms', service: 'payments', severity: 'warning', status: 'pending', since: '3 min', value: '128 ms' },
  { name: 'api-gateway — 5xx spike', service: 'api-gateway', severity: 'info', status: 'resolved', since: '2 h', value: '0.2%' },
]

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'
export type LogRow = {
  ts: string
  level: LogLevel
  service: string
  message: string
}

export const LOGS: LogRow[] = [
  { ts: '10:52:04.812', level: 'error', service: 'inventory', message: 'connection refused: upstream inventory-db:5432 unreachable' },
  { ts: '10:52:03.440', level: 'error', service: 'checkout', message: 'rpc error: code = DeadlineExceeded calling inventory.Reserve' },
  { ts: '10:51:59.006', level: 'warn', service: 'checkout', message: 'retry 3/3 for inventory.Reserve (order 90d1f2)' },
  { ts: '10:51:58.221', level: 'info', service: 'payments', message: 'charge captured txn_8f21 amount=42.90 EUR' },
  { ts: '10:51:57.918', level: 'info', service: 'api-gateway', message: 'POST /v1/checkout 200 84ms' },
  { ts: '10:51:55.402', level: 'debug', service: 'catalog', message: 'cache hit product:sku-4821 (ttl 58s)' },
  { ts: '10:51:54.771', level: 'warn', service: 'payments', message: '3-D Secure challenge issued for txn_8f10' },
  { ts: '10:51:52.330', level: 'info', service: 'notifications', message: 'email queued: order-confirmation to 3 recipients' },
]

export type TraceRow = {
  name: string
  service: string
  duration: number // ms
  spans: number
  status: 'ok' | 'error'
}

export const TRACES: TraceRow[] = [
  { name: 'POST /v1/checkout', service: 'api-gateway', duration: 512, spans: 24, status: 'error' },
  { name: 'checkout.PlaceOrder', service: 'checkout', duration: 486, spans: 18, status: 'error' },
  { name: 'GET /v1/catalog/search', service: 'catalog', duration: 64, spans: 6, status: 'ok' },
  { name: 'payments.Capture', service: 'payments', duration: 128, spans: 9, status: 'ok' },
  { name: 'GET /v1/cart', service: 'api-gateway', duration: 41, spans: 4, status: 'ok' },
]

export type Dashboard = {
  name: string
  desc: string
  widgets: number
  editedBy: string
  editedAt: string
  fav?: boolean
}

export const DASHBOARDS: Dashboard[] = [
  { name: 'Golden Signals — Production', desc: 'Latency, traffic, errors, saturation', widgets: 12, editedBy: 'Maud R.', editedAt: '2h ago', fav: true },
  { name: 'Checkout funnel', desc: 'End-to-end checkout health', widgets: 8, editedBy: 'Léo P.', editedAt: 'yesterday' },
  { name: 'Kubernetes — cluster', desc: 'Pods, CPU/mem vs request', widgets: 15, editedBy: 'System', editedAt: '3d ago' },
]

export type Template = { name: string; desc: string; icon: IconCmp }

/* ─────────────────────────────────────────────
 *  3 options d'intégration de l'observabilité
 *  dans la navigation produit kapptivate.
 * ───────────────────────────────────────────── */
export type NavModel = 'separate' | 'toplevel' | 'contextual'

export const NAV_MODELS: {
  value: NavModel
  short: string
  title: string
  desc: string
}[] = [
  {
    value: 'separate',
    short: 'Separate app',
    title: 'Standalone workspace',
    desc: 'Observability is its own app with a dedicated sidebar. You enter it from the product switcher.',
  },
  {
    value: 'toplevel',
    short: 'Top-level item',
    title: 'Top-level in the product sidebar',
    desc: 'Observability is a first-level entry in the main sidebar and expands into a second nav column.',
  },
  {
    value: 'contextual',
    short: 'Per product',
    title: 'Contextual, scoped to a product',
    desc: 'Observability is a tab inside a product, next to Tests, Executions… scoped to that product’s services.',
  },
]

/* Sidebar produit principale kapptivate (mock, d'après l'app réelle). */
export type MainNavItem = {
  label: string
  icon: IconCmp
  /** clé de l'entrée observabilité pour la surligner (option top-level) */
  isObs?: boolean
  chevron?: boolean
}
export type MainNavGroup = { section?: string; items: MainNavItem[] }

export const MAIN_NAV: MainNavGroup[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Realtime Status', icon: MonitorDot },
      { label: 'Overview', icon: Eye },
      { label: 'Incidents', icon: Bell },
      { label: 'Analytics', icon: BarChart3 },
      // Option "top-level" : l'observabilité s'insère ici
      { label: 'Observability', icon: Activity, isObs: true },
    ],
  },
  {
    section: 'By product',
    items: [
      { label: 'Website', icon: Command, chevron: true },
      { label: 'Live Session', icon: MonitorPlay },
      { label: 'Tests', icon: Zap },
      { label: 'Executions', icon: CheckCircle2 },
      { label: 'Monitors', icon: Timer },
      { label: 'Variables', icon: Braces },
    ],
  },
  {
    section: 'Equipments',
    items: [
      { label: 'Devices Lab', icon: Smartphone },
      { label: 'Agents', icon: Bot },
    ],
  },
]

/* Onglets d'un produit (option "contextual") : l'observabilité y est un onglet. */
export const PRODUCT_TABS: { label: string; isObs?: boolean }[] = [
  { label: 'Overview' },
  { label: 'Tests' },
  { label: 'Executions' },
  { label: 'Monitors' },
  { label: 'Observability', isObs: true },
  { label: 'Configurations' },
]

