export type ExploreTab = 'logs' | 'traces' | 'svcmap' | 'k8s'

export const EXPLORE_TABS: { key: ExploreTab; label: string }[] = [
  { key: 'logs', label: 'Logs explorer' },
  { key: 'traces', label: 'Traces' },
  { key: 'svcmap', label: 'Service map' },
  { key: 'k8s', label: 'Kubernetes' },
]

export const PAGE_META: Record<
  ExploreTab,
  { title: string; sub: string; actions: { label: string; primary: boolean }[] }
> = {
  logs: {
    title: 'Logs explorer',
    sub: 'Search, filter and analyze logs across all services in real time',
    actions: [
      { label: 'Export', primary: false },
      { label: 'Create alert', primary: true },
    ],
  },
  traces: {
    title: 'Traces',
    sub: 'Distributed tracing — follow requests across your microservices',
    actions: [
      { label: 'Export', primary: false },
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
}

export type LogEntry = {
  key: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'debug'
  svc: string
  msg: string
}

export const LOGS: LogEntry[] = [
  { key: 'l1', ts: '2026-07-08 14:32:18.443', level: 'info', svc: 'api-gateway', msg: 'POST /api/v2/executions/start 200 — 142ms' },
  { key: 'l2', ts: '2026-07-08 14:32:17.891', level: 'warn', svc: 'runner-eu-west', msg: 'Container warmup exceeded 3s threshold — pool=chrome-120 delay=3847ms' },
  { key: 'l3', ts: '2026-07-08 14:32:17.220', level: 'error', svc: 'screenshot-svc', msg: 'Failed to capture screenshot — timeout after 10000ms — test_id=t_4kLm9' },
  { key: 'l4', ts: '2026-07-08 14:32:16.554', level: 'info', svc: 'metrics-proxy', msg: 'Flushed 2,847 datapoints to storage — compression_ratio=0.34' },
  { key: 'l5', ts: '2026-07-08 14:32:15.102', level: 'debug', svc: 'kappticentral', msg: 'Cache hit for test config — test_id=t_9nRw2 — ttl_remaining=847s' },
  { key: 'l6', ts: '2026-07-08 14:32:14.330', level: 'info', svc: 'runner-eu-west', msg: 'Execution completed — exec_id=e_3mKp — duration=28.4s — steps=23 — passed=23' },
  { key: 'l7', ts: '2026-07-08 14:32:13.890', level: 'warn', svc: 'device-server', msg: 'Device d_pixel7 battery level below 20% — current=17%' },
  { key: 'l8', ts: '2026-07-08 14:32:12.110', level: 'error', svc: 'api-gateway', msg: 'Rate limit exceeded for workspace ws_demo — limit=100/min — current=112' },
  { key: 'l9', ts: '2026-07-08 14:32:11.776', level: 'info', svc: 'kappticentral', msg: 'Monitor m_8hNw triggered — schedule=every_5m — target=app.kapptivate.com/health' },
  { key: 'l10', ts: '2026-07-08 14:32:10.442', level: 'info', svc: 'runner-us-east', msg: 'Execution started — exec_id=e_6pLn — test=Login Flow (Staging)' },
  { key: 'l11', ts: '2026-07-08 14:32:09.120', level: 'debug', svc: 'metrics-proxy', msg: 'Received 412 datapoints from runner-eu-west — queue_depth=1,204' },
  { key: 'l12', ts: '2026-07-08 14:32:08.003', level: 'warn', svc: 'screenshot-svc', msg: 'Retrying screenshot capture — attempt=2/3 — test_id=t_4kLm9 step=14' },
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
    key: 'tr_9xKm3', name: 'POST /api/v2/executions/start', svc: 'api-gateway', dur: '142ms', durMs: 142, spans: 8, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#2E7D74', label: 'api-gateway' },
      { left: 5, width: 30, color: '#60a5fa', label: 'auth-service' },
      { left: 20, width: 65, color: '#f59e0b', label: 'runner-eu-west' },
      { left: 25, width: 40, color: '#a78bfa', label: 'kappticentral' },
    ],
  },
  {
    key: 'tr_3pLn7', name: 'GET /api/v2/monitors/m_8hNw/results', svc: 'api-gateway', dur: '89ms', durMs: 89, spans: 5, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#2E7D74', label: 'api-gateway' },
      { left: 8, width: 55, color: '#a78bfa', label: 'kappticentral' },
      { left: 15, width: 30, color: '#60a5fa', label: 'metrics-proxy' },
    ],
  },
  {
    key: 'tr_7wQp1', name: 'POST /api/v2/screenshots/capture', svc: 'screenshot-svc', dur: '10.2s', durMs: 10200, spans: 4, status: 'error',
    bars: [
      { left: 0, width: 100, color: '#e0372e', label: 'screenshot-svc' },
      { left: 2, width: 95, color: '#f87171', label: 'chrome-pool' },
    ],
  },
  {
    key: 'tr_2nRt5', name: 'POST /webhooks/slack/deliver', svc: 'kappticentral', dur: '234ms', durMs: 234, spans: 3, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#a78bfa', label: 'kappticentral' },
      { left: 30, width: 60, color: '#60a5fa', label: 'webhook-worker' },
    ],
  },
  {
    key: 'tr_8hYw4', name: 'GET /api/v2/tests/t_9nRw2', svc: 'api-gateway', dur: '12ms', durMs: 12, spans: 2, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#2E7D74', label: 'api-gateway' },
      { left: 10, width: 40, color: '#a78bfa', label: 'kappticentral (cache)' },
    ],
  },
  {
    key: 'tr_5mDx9', name: 'PUT /api/v2/variables/v_3kLw', svc: 'api-gateway', dur: '67ms', durMs: 67, spans: 4, status: 'ok',
    bars: [
      { left: 0, width: 100, color: '#2E7D74', label: 'api-gateway' },
      { left: 12, width: 50, color: '#a78bfa', label: 'kappticentral' },
      { left: 40, width: 35, color: '#34d399', label: 'vault' },
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
}

export const SERVICES: ServiceNode[] = [
  { id: 'gw', label: 'API Gateway', x: 50, y: 15, color: '#2E7D74', rps: '2.4K', lat: '23ms', err: '0.1%' },
  { id: 'auth', label: 'Auth', x: 15, y: 40, color: '#60a5fa', rps: '1.8K', lat: '12ms', err: '0%' },
  { id: 'core', label: 'Central', x: 50, y: 45, color: '#a78bfa', rps: '3.1K', lat: '34ms', err: '0.2%' },
  { id: 'run', label: 'Runner', x: 85, y: 40, color: '#f59e0b', rps: '890', lat: '142ms', err: '1.4%' },
  { id: 'met', label: 'Metrics', x: 25, y: 72, color: '#34d399', rps: '5.2K', lat: '8ms', err: '0%' },
  { id: 'scr', label: 'Screenshot', x: 75, y: 72, color: '#f87171', rps: '320', lat: '2.1s', err: '3.8%' },
]

export const EDGES: { from: string; to: string }[] = [
  { from: 'gw', to: 'auth' },
  { from: 'gw', to: 'core' },
  { from: 'gw', to: 'run' },
  { from: 'core', to: 'met' },
  { from: 'core', to: 'run' },
  { from: 'run', to: 'scr' },
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
  { key: 'p1', name: 'api-gateway-7f8d9c-x4k2p', ns: 'production', status: 'Running', cpu: '120m / 500m', mem: '256Mi / 512Mi', restarts: 0, age: '4d' },
  { key: 'p2', name: 'kappticentral-5b4a3c-m8n1q', ns: 'production', status: 'Running', cpu: '340m / 1000m', mem: '890Mi / 2Gi', restarts: 0, age: '4d' },
  { key: 'p3', name: 'runner-eu-west-9e2f1a-j6h3r', ns: 'production', status: 'Running', cpu: '780m / 2000m', mem: '1.4Gi / 4Gi', restarts: 2, age: '2d' },
  { key: 'p4', name: 'screenshot-svc-4c7b8d-p2w5t', ns: 'production', status: 'CrashLoopBackOff', cpu: '0m / 500m', mem: '0Mi / 1Gi', restarts: 47, age: '6h' },
  { key: 'p5', name: 'metrics-proxy-1d6e9f-k7m4s', ns: 'production', status: 'Running', cpu: '90m / 250m', mem: '180Mi / 512Mi', restarts: 0, age: '7d' },
  { key: 'p6', name: 'device-server-8a3c2b-n5p7v', ns: 'production', status: 'Running', cpu: '210m / 500m', mem: '420Mi / 1Gi', restarts: 1, age: '3d' },
  { key: 'p7', name: 'webhook-worker-6f1d4e-q3r8w', ns: 'production', status: 'Running', cpu: '45m / 250m', mem: '128Mi / 256Mi', restarts: 0, age: '7d' },
]
