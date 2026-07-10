/* ─────────────────────────────────────────────────────────────
 *  Traces (Perses) — mock data & types
 * ─────────────────────────────────────────────────────────────
 *  Reproduit, en mode proto, l'expérience de dashboards Perses
 *  branchés sur ClickHouse (cf. kapptigalaxy · routes/Observability).
 *  Aucune infra réelle : state local + séries en dur, comme les
 *  autres vues de ce proto.
 */

export type PanelType = 'timeseries' | 'bar' | 'stat' | 'table'

export type QueryType =
  | 'clickhouse-sql'
  | 'clickhouse-timeseries'
  | 'clickhouse-table'

/** Une valeur `null` = trou dans la série (la ligne s'interrompt). */
export type Series = { name: string; color: string; points: (number | null)[] }

export type Panel = {
  id: string
  name: string
  description: string
  type: PanelType
  queryType: QueryType
  sql: string
  /** Étiquette de l'axe Y (unité). */
  unit: string
  showLegend: boolean
  /** Bornes de l'axe Y — fixées pour coller aux maquettes. */
  yMin: number
  yMax: number
  /** Nombre de graduations sur l'axe Y (min + max inclus). */
  yTicks: number
  /** Étiquettes de l'axe X (temps). */
  xLabels: string[]
  series: Series[]
  /** Largeur dans la grille : 1 (tiers) ou 3 (pleine largeur). */
  span: 1 | 3
}

export type PanelGroup = {
  id: string
  name: string
  collapsed: boolean
  panels: Panel[]
}

export type Dashboard = {
  name: string
  operator: string
  groups: PanelGroup[]
}

/** Palette des séries — surchargeable ici (source unique) ou par panel via l'éditeur. */
export const PALETTE = [
  '#c2477e', // rose (défaut)
  '#2e7d74', // teal
  '#ed7846', // orange (marque)
  '#3b82f6', // bleu
  '#1fae7e', // vert
  '#a855f7', // violet
  '#f2b338', // ambre
  '#e0372e', // rouge
] as const

/** Couleur de série par défaut = 1er ton de la palette. */
export const SERIES_PINK = PALETTE[0]

/** Couleur de la n-ième série (cycle sur la palette). */
export const seriesColor = (i: number) => PALETTE[i % PALETTE.length]

export const PANEL_TYPE_OPTIONS: { label: string; value: PanelType }[] = [
  { label: 'Time Series Chart', value: 'timeseries' },
  { label: 'Bar Chart', value: 'bar' },
  { label: 'Stat', value: 'stat' },
  { label: 'Table', value: 'table' },
]

export const QUERY_TYPE_OPTIONS: { label: string; value: QueryType }[] = [
  { label: 'ClickHouse SQL query', value: 'clickhouse-sql' },
  { label: 'ClickHouse time series', value: 'clickhouse-timeseries' },
  { label: 'ClickHouse table', value: 'clickhouse-table' },
]

export const TIME_RANGE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Last 15 min', value: '15m' },
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
]

/** Étiquettes d'axe X selon la plage temporelle sélectionnée. */
export const X_LABELS: Record<string, string[]> = {
  '15m': ['08:45', '08:48', '08:51', '08:54', '08:57', '09:00'],
  '1h': ['08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30'],
  '6h': ['04:00', '05:00', '06:00', '07:00', '08:00', '09:00'],
  '24h': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}

const SQL_ROOT_SPANS =
  "SELECT toStartOfInterval(Timestamp, INTERVAL 300 SECOND) AS t, " +
  "ServiceName AS service, count() AS value FROM otel_traces " +
  "WHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)} " +
  "AND ParentSpanId = '' GROUP BY t, service ORDER BY t"

const SQL_TIMESERIES = (metric: string) =>
  "SELECT toStartOfInterval(Timestamp, INTERVAL 300 SECOND) AS t, " +
  `${metric} AS value FROM otel_traces ` +
  "WHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)} " +
  "GROUP BY t ORDER BY t"

/** Dashboard initial reproduit d'après les maquettes. */
export const INITIAL_DASHBOARD: Dashboard = {
  name: 'traces-mirror',
  operator: 'rocket-app',
  groups: [
    {
      id: 'grp_traces',
      name: 'Traces',
      collapsed: false,
      panels: [
        {
          id: 'span_count',
          name: 'Spans',
          description: '',
          type: 'timeseries',
          queryType: 'clickhouse-timeseries',
          sql: SQL_TIMESERIES('count()'),
          unit: 'Count',
          showLegend: false,
          yMin: 10,
          yMax: 35,
          yTicks: 6,
          xLabels: X_LABELS['1h'],
          span: 1,
          series: [
            { name: 'demo-site', color: SERIES_PINK, points: [13, 18, 23, 27, 31, null, null] },
          ],
        },
        {
          id: 'avg_duration',
          name: 'Avg Duration',
          description: '',
          type: 'timeseries',
          queryType: 'clickhouse-timeseries',
          sql: SQL_TIMESERIES('avg(Duration) / 1e6'),
          unit: 'ms',
          showLegend: false,
          yMin: 60,
          yMax: 120,
          yTicks: 7,
          xLabels: X_LABELS['1h'],
          span: 1,
          series: [
            { name: 'demo-site', color: SERIES_PINK, points: [88, 94, 100, 105, 108, null, null] },
          ],
        },
        {
          id: 'request_duration',
          name: 'Request Duration (p95)',
          description: 'p95 of root span duration, per service',
          type: 'timeseries',
          queryType: 'clickhouse-timeseries',
          sql: SQL_TIMESERIES('quantile(0.95)(Duration) / 1e6'),
          unit: 'ms',
          showLegend: true,
          yMin: 300,
          yMax: 480,
          yTicks: 7,
          xLabels: X_LABELS['1h'],
          span: 1,
          series: [
            { name: 'demo-site', color: SERIES_PINK, points: [375, 398, 415, 432, 445, null, null] },
          ],
        },
        {
          id: 'root_spans_by_service',
          name: 'Root spans by service (SQL)',
          description: '',
          type: 'timeseries',
          queryType: 'clickhouse-sql',
          sql: SQL_ROOT_SPANS,
          unit: 'Count',
          showLegend: true,
          yMin: 10,
          yMax: 15,
          yTicks: 6,
          xLabels: ['08:30', '08:40', '08:50', '09:00', '09:10', '09:20', '09:30', '09:40'],
          span: 3,
          series: [
            { name: 'demo-site', color: SERIES_PINK, points: [null, null, null, 13, 13, 13, 13, null] },
          ],
        },
      ],
    },
  ],
}

/** Texte d'aide sous l'éditeur SQL (repris des maquettes). */
export const SQL_HINT =
  'Bucket column aliased t; numeric columns become series; string columns group into labelled series. {from}/{to}/{tenantId} are bound server-side.'

/** Séquence ascendante pour un nouveau panel vierge. */
export const BLANK_SERIES: Series = {
  name: 'demo-site',
  color: SERIES_PINK,
  points: [4, 7, 9, 12, 15, null, null],
}

/* ─────────────────────────────────────────────────────────────
 *  Fabrique de panels + interprétation "langage naturel → panel"
 *  Simulé côté proto : pas de vrai LLM, juste du keyword-matching
 *  qui produit une requête ClickHouse plausible + des séries mock.
 * ───────────────────────────────────────────────────────────── */

export type PanelSpec = { name: string } & Partial<Omit<Panel, 'id' | 'name'>>

/** Complète un PanelSpec partiel en Panel (l'id est posé par le store). */
export const makePanel = (spec: PanelSpec): Omit<Panel, 'id'> => ({
  name: spec.name,
  description: spec.description ?? '',
  type: spec.type ?? 'timeseries',
  queryType: spec.queryType ?? 'clickhouse-sql',
  sql: spec.sql ?? SQL_TIMESERIES('count()'),
  unit: spec.unit ?? 'Count',
  showLegend: spec.showLegend ?? false,
  yMin: spec.yMin ?? 0,
  yMax: spec.yMax ?? 20,
  yTicks: spec.yTicks ?? 5,
  xLabels: spec.xLabels ?? X_LABELS['1h'],
  span: spec.span ?? 1,
  series: spec.series ?? [{ name: 'demo-site', color: SERIES_PINK, points: [4, 7, 9, 12, 15, null, null] }],
})

const ramp = (min: number, max: number, n = 5): (number | null)[] => {
  const pts: (number | null)[] = []
  for (let i = 0; i < n; i++) pts.push(Math.round(min + ((max - min) * i) / (n - 1)))
  while (pts.length < 7) pts.push(null)
  return pts
}

const series = (points: (number | null)[]): Series[] => [{ name: 'demo-site', color: SERIES_PINK, points }]

/** Suggère un type de viz d'après la forme de la requête. */
export const suggestViz = (sql: string): { type: PanelType; reason: string } => {
  const s = sql.toLowerCase()
  const bucketed = s.includes('tostartofinterval') || s.includes('group by t')
  const grouped = /group by[^)]*,/.test(s)
  if (!bucketed && (s.includes('count(') || s.includes('sum(') || s.includes('avg(')) && !grouped)
    return { type: 'stat', reason: 'single aggregate, no time bucket → stat' }
  if (grouped && bucketed) return { type: 'timeseries', reason: 'bucketed + grouped → series by label' }
  if (bucketed) return { type: 'timeseries', reason: 'time-bucketed → time series' }
  return { type: 'table', reason: 'rows without a time bucket → table' }
}

/** Panels "prêts à l'emploi" par signal (méthode RED pour les traces). */
export const SIGNAL_SEEDS: Record<string, { group: string; panels: PanelSpec[] }> = {
  traces: {
    group: 'Traces · RED',
    panels: [
      { name: 'Request rate', unit: 'req/s', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('count() / 60'), yMin: 0, yMax: 40, yTicks: 5, series: series(ramp(8, 34)) },
      { name: 'Error rate', unit: '%', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES("countIf(StatusCode = 'Error') / count() * 100"), yMin: 0, yMax: 8, yTicks: 5, series: series(ramp(1, 5)) },
      { name: 'Duration (p95)', unit: 'ms', showLegend: true, queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('quantile(0.95)(Duration) / 1e6'), yMin: 200, yMax: 500, yTicks: 7, series: series(ramp(280, 460)) },
    ],
  },
  logs: {
    group: 'Logs · overview',
    panels: [
      { name: 'Log volume', unit: 'lines/min', queryType: 'clickhouse-timeseries', sql: 'SELECT toStartOfInterval(Timestamp, INTERVAL 60 SECOND) AS t, count() AS value FROM otel_logs\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t ORDER BY t', yMin: 0, yMax: 120, yTicks: 7, series: series(ramp(30, 100)) },
      { name: 'Errors & warnings', unit: 'lines', showLegend: true, queryType: 'clickhouse-timeseries', sql: "SELECT toStartOfInterval(Timestamp, INTERVAL 60 SECOND) AS t, SeverityText AS level, count() AS value FROM otel_logs\nWHERE SeverityText IN ('ERROR','WARN') AND Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t, level ORDER BY t", yMin: 0, yMax: 40, yTicks: 5, series: series(ramp(4, 22)) },
    ],
  },
  metrics: {
    group: 'Metrics · overview',
    panels: [
      { name: 'CPU usage', unit: '%', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('avg(Value)'), yMin: 0, yMax: 100, yTicks: 6, series: series(ramp(28, 62)) },
      { name: 'Memory usage', unit: '%', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('avg(Value)'), yMin: 0, yMax: 100, yTicks: 6, series: series(ramp(40, 71)) },
    ],
  },
}

export type AiProposal = { reply: string; panels: PanelSpec[] }

/** "LLM" simulé : transforme une phrase en proposition de panel(s). */
export const interpretPrompt = (raw: string): AiProposal => {
  const q = raw.toLowerCase().trim()
  const want = (...w: string[]) => w.some((x) => q.includes(x))

  // "draft / build a dashboard [for X]"
  if (want('draft', 'build a dashboard', 'starter', 'whole dashboard', 'full dashboard') || (want('dashboard') && want('for '))) {
    const opMatch = raw.match(/for\s+([a-z0-9\-_.]+)/i)
    const op = opMatch ? opMatch[1] : 'rocket-app'
    return {
      reply: `Here's a starter RED board for **${op}** — request rate, error rate and p95 latency, all scoped to the operator. Add it, then tweak any panel.`,
      panels: SIGNAL_SEEDS.traces.panels,
    }
  }

  if (want('p95', 'p99', 'latency', 'duration', 'slow')) {
    const p = q.includes('p99') ? 0.99 : 0.95
    const byService = want('by service', 'per service', 'each service')
    return {
      reply: `A p${p * 100} duration time series${byService ? ', broken down by service' : ''}. I bucketed by 5 min and converted nanoseconds to ms.`,
      panels: [{
        name: byService ? `Duration (p${p * 100}) by service` : `Duration (p${p * 100})`,
        unit: 'ms', showLegend: true, queryType: 'clickhouse-sql',
        sql: `SELECT toStartOfInterval(Timestamp, INTERVAL 300 SECOND) AS t,${byService ? ' ServiceName AS service,' : ''} quantile(${p})(Duration) / 1e6 AS value FROM otel_traces\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t${byService ? ', service' : ''} ORDER BY t`,
        yMin: 200, yMax: 500, yTicks: 7, series: series(ramp(280, 470)),
      }],
    }
  }

  if (want('error', 'failure', 'failed', '5xx')) {
    return {
      reply: 'Error rate as a percentage of spans, bucketed by 5 min.',
      panels: [{
        name: 'Error rate', unit: '%', queryType: 'clickhouse-sql',
        sql: "SELECT toStartOfInterval(Timestamp, INTERVAL 300 SECOND) AS t, countIf(StatusCode = 'Error') / count() * 100 AS value FROM otel_traces\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t ORDER BY t",
        yMin: 0, yMax: 8, yTicks: 5, series: series(ramp(1, 6)),
      }],
    }
  }

  if (want('rate', 'throughput', 'requests', 'req/s', 'qps')) {
    return {
      reply: 'Request rate (spans per second), bucketed by 5 min.',
      panels: [{
        name: 'Request rate', unit: 'req/s', queryType: 'clickhouse-sql',
        sql: SQL_TIMESERIES('count() / 300'),
        yMin: 0, yMax: 40, yTicks: 5, series: series(ramp(8, 34)),
      }],
    }
  }

  if (want('span', 'count', 'volume', 'traces')) {
    return {
      reply: 'Span count over time, bucketed by 5 min.',
      panels: [{
        name: 'Spans', unit: 'Count', queryType: 'clickhouse-sql',
        sql: SQL_TIMESERIES('count()'),
        yMin: 0, yMax: 35, yTicks: 6, series: series(ramp(12, 31)),
      }],
    }
  }

  // fallback
  return {
    reply: `I turned that into a span-count panel to get you started — refine the wording (try "p95 duration by service" or "error rate") and I'll adjust the query.`,
    panels: [{ name: raw.slice(0, 40) || 'New panel', queryType: 'clickhouse-sql', sql: SQL_TIMESERIES('count()'), yMin: 0, yMax: 20, yTicks: 5, series: series(ramp(4, 15)) }],
  }
}
