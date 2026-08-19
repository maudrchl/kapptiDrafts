/* ─────────────────────────────────────────────────────────────
 *  Traces (Perses): mock data & types
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

/** Une valeur `null` = trou dans la série (la ligne s'interrompt).
    `dash`/`opacity` = tracé fantôme (ex. période précédente en comparaison). */
export type Series = {
  name: string
  color: string
  points: (number | null)[]
  dash?: boolean
  opacity?: number
  /** Enveloppe min/max autour de la courbe : la dispersion du bucket, tracée en
   *  aire très peu opaque sous la moyenne. Sans elle, une moyenne seule laisse
   *  croire à une valeur stable. */
  band?: { lo: (number | null)[]; hi: (number | null)[] }
}

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
  /** Bornes de l'axe Y: fixées pour coller aux maquettes. */
  yMin: number
  yMax: number
  /** Nombre de graduations sur l'axe Y (min + max inclus). */
  yTicks: number
  /** Étiquettes de l'axe X (temps). */
  xLabels: string[]
  series: Series[]
  /** Largeur dans la grille : 1 (tiers) ou 3 (pleine largeur). */
  span: 1 | 3
  /** Formate les graduations Y + les valeurs de tooltip (ex. millicores -> "800m" / "1.00 cores").
      Optionnel : sans ça l'axe reste en entiers bruts + `unit`. */
  yFmt?: (v: number) => string
}

/** Panel vidé : les axes et l'unité restent, la courbe n'existe pas (points null).
 *  Sert à l'état « connecté mais aucune télémétrie » : le graphe est prêt, vide. */
export const emptyPanel = (p: Panel): Panel => ({
  ...p,
  series: p.series.map((se) => ({ ...se, points: se.points.map(() => null) })),
})

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

/** Palette des séries: surchargeable ici (source unique) ou par panel via l'éditeur. */
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

/** Durée de chaque raccourci, en minutes : le DateRangePicker du DS attend des
 *  bornes réelles, pas une clé. Sert aussi à retrouver la clé après un choix. */
export const RANGE_MINUTES: Record<string, number> = {
  '15m': 15,
  '1h': 60,
  '6h': 360,
  '24h': 1440,
  '7d': 10080,
}

/** Options prêtes pour <DateRangePicker options=…>, calculées à l'ouverture. */
export const rangeShortcuts = (keys: string[] = Object.keys(RANGE_MINUTES)) =>
  keys.map((k) => ({
    label: TIME_RANGE_OPTIONS.find((o) => o.value === k)?.label ?? k,
    value: {
      start: new Date(Date.now() - RANGE_MINUTES[k] * 60_000).toISOString(),
      end: new Date().toISOString(),
    },
  }))

/** Clé de plage la plus proche d'une durée en minutes (sinon 'custom'). */
export const rangeKeyFromMinutes = (mins: number) =>
  Object.entries(RANGE_MINUTES).find(([, m]) => mins <= m)?.[0] ?? 'custom'

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
          showLegend: true,
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
          showLegend: true,
          yMin: 60,
          yMax: 120,
          yTicks: 7,
          xLabels: X_LABELS['1h'],
          span: 1,
          series: [
            { name: 'demo-site', color: PALETTE[1], points: [88, 94, 100, 105, 108, null, null] },
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
            { name: 'demo-site', color: PALETTE[2], points: [375, 398, 415, 432, 445, null, null] },
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
            { name: 'demo-site', color: PALETTE[3], points: [null, null, null, 13, 13, 13, 13, null] },
          ],
        },
      ],
    },
  ],
}

/** Panels d'aperçu affichés en haut de la vue Traces (comme le vrai produit :
 *  Spans / Avg Duration / p95 avant le tableau). Séries pleines (7 points). */
export const TRACE_OVERVIEW_PANELS: Panel[] = [
  {
    id: 'ov_spans', name: 'Spans', description: '', type: 'timeseries',
    queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('count()'),
    unit: 'Count', showLegend: false, yMin: 0, yMax: 60, yTicks: 7,
    xLabels: X_LABELS['1h'], span: 1,
    series: [{ name: 'demo-site', color: '#6366f1', points: [39, 46, 44, 50, 48, 52, 43] }],
  },
  {
    id: 'ov_avg', name: 'Avg Duration', description: '', type: 'timeseries',
    queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('avg(Duration) / 1e6'),
    unit: 'ms', showLegend: false, yMin: 60, yMax: 150, yTicks: 6,
    xLabels: X_LABELS['1h'], span: 1,
    series: [{ name: 'demo-site', color: '#3b82f6', points: [120, 110, 128, 118, 132, 122, 127] }],
  },
  {
    id: 'ov_p95', name: 'Request Duration (p95)', description: '', type: 'timeseries',
    queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('quantile(0.95)(Duration) / 1e6'),
    unit: 'ms', showLegend: false, yMin: 300, yMax: 600, yTicks: 7,
    xLabels: X_LABELS['1h'], span: 1,
    series: [{ name: 'demo-site', color: '#8b5cf6', points: [430, 470, 450, 500, 460, 480, 445] }],
  },
]

/** Courbe p95 superposée pour le compare period-over-period : période courante
 *  (plein) vs précédente (fantôme pointillé). Pleine largeur, légende visible. */
export const TRACE_COMPARE_PANEL: Panel = {
  id: 'cmp_p95', name: 'Request Duration (p95)', description: '', type: 'timeseries',
  queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('quantile(0.95)(Duration) / 1e6'),
  unit: 'ms', showLegend: true, yMin: 300, yMax: 600, yTicks: 7,
  xLabels: X_LABELS['1h'], span: 3,
  series: [
    { name: 'Previous period', color: '#98a2b3', dash: true, opacity: 0.55, points: [400, 420, 415, 430, 410, 425, 418] },
    { name: 'Current period', color: '#8b5cf6', points: [430, 470, 450, 500, 460, 480, 445] },
  ],
}

/* ─────────────────────────────────────────────
 *  Panels Kubernetes (usage vs request + restarts).
 *  yFmt rend les axes en unités k8s (m / cores, Mi / Gi).
 * ───────────────────────────────────────────── */
const K8S_X = ['10:00', '11:00', '12:00', '13:00']
const fmtCpu = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(2)} cores` : `${Math.round(v)}m`)
const fmtMem = (v: number) => (v >= 1024 ? `${(v / 1024).toFixed(1)}Gi` : `${Math.round(v)}Mi`)

/** CPU usage vs request - usage à plat très bas, request en pointillés hauts. */
export const K8S_CPU_PANEL: Panel = {
  id: 'k8s_cpu', name: 'CPU usage vs request', description: '', type: 'timeseries',
  queryType: 'clickhouse-timeseries', sql: '', unit: '', showLegend: true,
  yMin: 0, yMax: 1000, yTicks: 6, xLabels: K8S_X, span: 1, yFmt: fmtCpu,
  series: [
    { name: 'Request', color: '#f2b338', dash: true, points: [970, 970, 970, 970] },
    { name: 'CPU usage (max)', color: '#e0372e', points: [7, 8, 6, 7] },
    { name: 'CPU usage', color: '#6366f1', points: [5, 5, 4, 5] },
  ],
}

/** Memory usage vs request. */
export const K8S_MEM_PANEL: Panel = {
  id: 'k8s_mem', name: 'Memory usage vs request', description: '', type: 'timeseries',
  queryType: 'clickhouse-timeseries', sql: '', unit: '', showLegend: true,
  yMin: 0, yMax: 2355, yTicks: 6, xLabels: K8S_X, span: 1, yFmt: fmtMem,
  series: [
    { name: 'Request', color: '#f2b338', dash: true, points: [2252, 2252, 2252, 2252] },
    { name: 'Memory usage (max)', color: '#e0372e', points: [96, 102, 90, 98] },
    { name: 'Memory usage', color: '#6366f1', points: [80, 82, 78, 80] },
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
  showLegend: spec.showLegend ?? true,
  yMin: spec.yMin ?? 0,
  yMax: spec.yMax ?? 20,
  yTicks: spec.yTicks ?? 5,
  xLabels: spec.xLabels ?? X_LABELS['1h'],
  span: spec.span ?? 1,
  series: spec.series ?? [{ name: 'demo-site', color: SERIES_PINK, points: [4, 7, 9, 12, 15, null, null] }],
  /* yFmt était perdu ici, d'où des axes en valeurs brutes (33266240084 au lieu
     de 31 GB) dès qu'on passait par makePanel. */
  yFmt: spec.yFmt,
})

const ramp = (min: number, max: number, n = 5): (number | null)[] => {
  const pts: (number | null)[] = []
  for (let i = 0; i < n; i++) pts.push(Math.round(min + ((max - min) * i) / (n - 1)))
  while (pts.length < 7) pts.push(null)
  return pts
}

const series = (points: (number | null)[], color: string = SERIES_PINK): Series[] => [{ name: 'demo-site', color, points }]

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
      { name: 'Request rate', unit: 'req/s', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('count() / 60'), yMin: 0, yMax: 40, yTicks: 5, series: series(ramp(8, 34), PALETTE[1]) },
      { name: 'Error rate', unit: '%', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES("countIf(StatusCode = 'Error') / count() * 100"), yMin: 0, yMax: 8, yTicks: 5, series: series(ramp(1, 5), PALETTE[7]) },
      { name: 'Duration (p95)', unit: 'ms', showLegend: true, queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('quantile(0.95)(Duration) / 1e6'), yMin: 200, yMax: 500, yTicks: 7, series: series(ramp(280, 460), PALETTE[2]) },
    ],
  },
  logs: {
    group: 'Logs · overview',
    panels: [
      { name: 'Log volume', unit: 'lines/min', queryType: 'clickhouse-timeseries', sql: 'SELECT toStartOfInterval(Timestamp, INTERVAL 60 SECOND) AS t, count() AS value FROM otel_logs\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t ORDER BY t', yMin: 0, yMax: 120, yTicks: 7, series: series(ramp(30, 100), PALETTE[3]) },
      { name: 'Errors & warnings', unit: 'lines', showLegend: true, queryType: 'clickhouse-timeseries', sql: "SELECT toStartOfInterval(Timestamp, INTERVAL 60 SECOND) AS t, SeverityText AS level, count() AS value FROM otel_logs\nWHERE SeverityText IN ('ERROR','WARN') AND Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t, level ORDER BY t", yMin: 0, yMax: 40, yTicks: 5, series: series(ramp(4, 22), PALETTE[7]) },
    ],
  },
  metrics: {
    group: 'Metrics · overview',
    panels: [
      { name: 'CPU usage', unit: '%', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('avg(Value)'), yMin: 0, yMax: 100, yTicks: 6, series: series(ramp(28, 62), PALETTE[2]) },
      { name: 'Memory usage', unit: '%', queryType: 'clickhouse-timeseries', sql: SQL_TIMESERIES('avg(Value)'), yMin: 0, yMax: 100, yTicks: 6, series: series(ramp(40, 71), PALETTE[4]) },
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
      reply: `Here's a starter RED board for **${op}**: request rate, error rate and p95 latency, all scoped to the operator. Add it, then tweak any panel.`,
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
        yMin: 200, yMax: 500, yTicks: 7, series: series(ramp(280, 470), PALETTE[2]),
      }],
    }
  }

  if (want('error', 'failure', 'failed', '5xx')) {
    return {
      reply: 'Error rate as a percentage of spans, bucketed by 5 min.',
      panels: [{
        name: 'Error rate', unit: '%', queryType: 'clickhouse-sql',
        sql: "SELECT toStartOfInterval(Timestamp, INTERVAL 300 SECOND) AS t, countIf(StatusCode = 'Error') / count() * 100 AS value FROM otel_traces\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t ORDER BY t",
        yMin: 0, yMax: 8, yTicks: 5, series: series(ramp(1, 6), PALETTE[7]),
      }],
    }
  }

  if (want('rate', 'throughput', 'requests', 'req/s', 'qps')) {
    return {
      reply: 'Request rate (spans per second), bucketed by 5 min.',
      panels: [{
        name: 'Request rate', unit: 'req/s', queryType: 'clickhouse-sql',
        sql: SQL_TIMESERIES('count() / 300'),
        yMin: 0, yMax: 40, yTicks: 5, series: series(ramp(8, 34), PALETTE[1]),
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
    reply: `I turned that into a span-count panel to get you started. Refine the wording (try "p95 duration by service" or "error rate") and I'll adjust the query.`,
    panels: [{ name: raw.slice(0, 40) || 'New panel', queryType: 'clickhouse-sql', sql: SQL_TIMESERIES('count()'), yMin: 0, yMax: 20, yTicks: 5, series: series(ramp(4, 15)) }],
  }
}

/* ─────────────────────────────────────────────
 *  Effet de la plage de temps sur les données (démo).
 *  Un proto doit MONTRER ce que le contrôle change : sans ça on ne comprend pas
 *  la portée du date picker. Les compteurs (volumes) suivent la durée, les taux
 *  et les latences non : ce sont des moyennes, elles ne se cumulent pas.
 * ───────────────────────────────────────────── */

/** Facteur de volume par rapport à la référence 1 heure. */
export const rangeFactor = (range: string) => (RANGE_MINUTES[range] ?? 60) / 60

/** Nombre de points tracés par plage : c'est ce qui rend l'effet du date picker
 *  VISIBLE (une fenêtre courte est dense et nerveuse, une longue est lissée).
 *  Les étiquettes d'axe restent au nombre de ticks, les points sont indépendants. */
const RANGE_POINTS: Record<string, number> = {
  '15m': 15,
  '1h': 12,
  '6h': 18,
  '24h': 24,
  '7d': 28,
}

/** Rééchantillonne un panel sur la plage choisie : densité de points, étiquettes
 *  d'axe, et lissage croissant avec la durée (une longue fenêtre gomme les creux). */
export const panelForRange = (p: Panel, range: string): Panel => {
  const labels = X_LABELS[range] ?? p.xLabels
  const n = RANGE_POINTS[range] ?? labels.length
  const f = rangeFactor(range)
  const smooth = Math.min(0.7, Math.max(0, Math.log10(Math.max(1, f)) / 2.4))
  return {
    ...p,
    xLabels: labels,
    series: p.series.map((s, si) => {
      const src = s.points.filter((v): v is number => v !== null && v !== undefined)
      if (!src.length) return { ...s, points: Array.from({ length: n }, () => null) }
      const avg = src.reduce((a, b) => a + b, 0) / src.length
      return {
        ...s,
        points: Array.from({ length: n }, (_, i) => {
          // Interpolation linéaire entre les points d'origine, puis tirage vers la
          // moyenne selon la durée, plus une ondulation propre à la plage pour que
          // deux fenêtres ne se ressemblent jamais.
          const t = (i / Math.max(1, n - 1)) * (src.length - 1)
          const a = src[Math.floor(t)]
          const b = src[Math.min(src.length - 1, Math.ceil(t))]
          const base = a + (b - a) * (t - Math.floor(t))
          const wave = Math.sin((i / n) * Math.PI * 2 * (1 + si * 0.3) + f) * avg * 0.08
          const v = base * (1 - smooth) + avg * smooth + wave
          return Math.round(Math.max(0, v) * 10) / 10
        }),
      }
    }),
  }
}

/** Ajoute la période précédente EN PLUS, sur le même graphe : une courbe grise
 *  en pointillés sous la courbe courante. Comparer ne doit rien restructurer,
 *  juste superposer un repère. */
export const withPrevious = (p: Panel): Panel => ({
  ...p,
  showLegend: true,
  series: [
    ...p.series.map((s) => ({ ...s, name: s.name === p.name ? 'Current period' : s.name })),
    ...p.series.slice(0, 1).map((s) => ({
      ...s,
      name: 'Previous period',
      color: '#98a2b3',
      dash: true,
      opacity: 0.55,
      // Décalage léger et lissage : un repère, pas une deuxième lecture exacte.
      points: s.points.map((v, i) =>
        v === null || v === undefined ? null : Math.round(v * (0.86 + ((i % 5) * 0.04)) * 10) / 10,
      ),
    })),
  ],
})
