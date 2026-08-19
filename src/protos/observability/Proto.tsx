import { useState, useEffect, useMemo, useRef, type ComponentType, type MouseEvent as ReactMouseEvent } from 'react'
import {
  Button,
  SearchInput,
  Select,
  Table,
  Tag,
  Card,
  CounterCard,
  CounterCardGroup,
  TrendTag,
  StatusTag,
  Tabs,
  Modal,
  Alert,
  Banner,
  IconAlertTriangle,
  Drawer,
  Segmented,
  Collapse,
  CodeBlock,
  DateRangePicker,
  TableFilter,
  Popover,
  Input,
  Toggle,
  EmptyState,
  CopyToClipboard,
  IconDownload,
  IconFilter,
  IconServer,
  IconActivity,
  IconTimer,
  IconPlay,
  IconEye,
  IconZap,
  IconMonitor,
  IconBell,
  IconBarChartBig,
  IconMapPin,
  IconGlobe,
  IconSmartphone,
  IconFile,
  IconBookOpen,
  IconNetwork,
  IconWrench,
  IconBox,
  IconLayers,
  IconSearchX,
  Flex,
  Text,
  Dropdown,
  IconSlidersHorizontal,
  IconListFilter,
  IconGauge,
} from '@kapptivate/ui-kit'
import {
  PanelLeftClose,
  Cpu,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Plus,
  Pin,
  ArrowUpRight,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Square,
  Share2,
  Orbit,
} from 'lucide-react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useInternalNode,
  useReactFlow,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node as FlowNode,
  type Edge as FlowEdge,
  type NodeProps,
  type EdgeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useReportScreen, useScreenNavigation } from '../../context/ScreenContext'
import { useFrameControls } from '../../components/ProtoFrame'
import styles from './explore-tabs.module.scss'
import PersesView from './PersesView'
import LineChart from './LineChart'
import { toast, ToastMount } from './toast'
import { dashboardStore } from './dashboardStore'
import { interpretPrompt, TRACE_OVERVIEW_PANELS, makePanel, K8S_CPU_PANEL, K8S_MEM_PANEL, emptyPanel, rangeShortcuts, rangeKeyFromMinutes, rangeFactor, panelForRange, withPrevious, PALETTE, X_LABELS } from './perses'
import type { PanelSpec, Panel as PanelSpecFull } from './perses'
import type { ExploreTab, OtlpPlatform, PodEntry, PodPhase, DeployResource, SignalKey, TraceEntry, ServiceNode, LogEntry, AlertItem, DestinationItem, IncidentItem, DestinationType, MetricEntry, MetricType } from './constants'
import {
  EXPLORE_TABS,
  PAGE_META,
  LOGS as ALL_LOGS,
  LOG_TOTAL as ALL_LOG_TOTAL,
  TRACES as ALL_TRACES,
  TRACE_COMPARE as ALL_TRACE_COMPARE,
  SERVICES as ALL_SERVICES,
  EDGES as ALL_EDGES,
  PODS as ALL_PODS,
  K8S_NAMESPACES as ALL_K8S_NAMESPACES,
  K8S_DEPLOYMENTS as ALL_K8S_DEPLOYMENTS,
  K8S_CLUSTER as ALL_K8S_CLUSTER,
  SIGNALS,
  DAILY_GB,
  DAILY_BUDGET_GB,
  USAGE_INGESTED_GB,
  USAGE_DAY_OF_MONTH,
  USAGE_DAYS_IN_MONTH,
  OTLP_ENDPOINT_USAGE,
  OTLP_ENDPOINT_HTTP,
  OTLP_INTERNAL_ID,
  OTLP_KEY_MASKED,
  OTLP_PLATFORMS,
  OTLP_PLATFORM_HINT,
  GATE_PROMISE,
  otlpSnippet,
  otlpK8sSnippet,
  otlpTestCurl,
  METRICS as ALL_METRICS,
  METRIC_TOTALS,
  metricPoints,
  metricRate,
  rateUnit,
  isCumulative,
  metricTrend,
  fmtMetric,
  svcColor,
  RETENTION_LABELS,
  ALERT_SEVERITIES,
  ALERT_OPERATORS,
  ALERT_FREQUENCIES,
  ALERT_LOOKBACKS,
  ALERT_COOLDOWNS,
  DESTINATION_TYPES,
  ALERTS,
  DESTINATIONS,
  INCIDENTS,
} from './constants'

const LOGO_SRC = "data:image/svg+xml,%3csvg%20width='178'%20height='28'%20viewBox='0%200%20178%2028'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='178'%20height='28'%20fill=''/%3e%3cpath%20d='M46.6496%2022.9253L40.2032%2015.237L45.816%208.59585H40.62L36.0352%2014.3827L33.979%2017.0282H33.8679L33.9513%2014.3276V5.59691C33.9513%204.36156%2032.9498%203.36011%2031.7145%203.36011C30.4791%203.36011%2029.4777%204.36156%2029.4777%205.5969V22.9253H33.7012L37.5913%2018.3233L41.398%2022.9253H46.6496Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M53.9591%208.1825C49.5689%208.1825%2046.7347%209.31233%2046.8736%2013.0325H50.8471C51.0416%2011.8751%2051.8751%2011.4893%2053.7646%2011.4893C55.8208%2011.4893%2056.6822%2011.9578%2056.6822%2013.3356V14.4378H51.6529C47.8739%2014.4378%2046.1234%2015.8708%2046.1234%2018.7642C46.1234%2021.823%2048.0684%2023.3386%2051.2083%2023.3386C53.5979%2023.3386%2056.2654%2022.4568%2057.488%2020.4176L56.9878%2021.4372L57.3768%2022.9253H61.1558V12.8671C61.1558%209.78079%2058.9606%208.1825%2053.9591%208.1825ZM52.8199%2020.0043C51.2638%2020.0043%2050.6803%2019.4256%2050.6803%2018.5438C50.6803%2017.6344%2051.2638%2017.1384%2052.3753%2017.1384H56.6822V18.8193C55.7374%2019.5909%2054.4315%2020.0043%2053.0144%2020.0043H52.8199Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M72.3795%208.21006C70.1566%208.21006%2068.2949%209.09187%2066.8222%2011.5995L67.628%2010.0839L67.5447%208.59585H63.1544V27.7201H67.628V21.1616C68.795%2022.7324%2070.49%2023.3386%2072.3795%2023.3386C76.7141%2023.3386%2079.4928%2019.9767%2079.4928%2015.7606C79.4928%2011.572%2076.7141%208.21006%2072.3795%208.21006ZM71.3236%2019.4531C69.0173%2019.4531%2067.5724%2017.91%2067.5724%2015.7606C67.5724%2013.6111%2069.0173%2012.068%2071.3236%2012.068C73.6298%2012.068%2075.047%2013.6111%2075.047%2015.7606C75.047%2017.91%2073.6298%2019.4531%2071.3236%2019.4531Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M89.9912%208.21006C87.7683%208.21006%2085.9066%209.09187%2084.4339%2011.5995L85.2397%2010.0839L85.1564%208.59585H80.7662V27.7201H85.2397V21.1616C86.4068%2022.7324%2088.1017%2023.3386%2089.9912%2023.3386C94.3259%2023.3386%2097.1045%2019.9767%2097.1045%2015.7606C97.1045%2011.572%2094.3259%208.21006%2089.9912%208.21006ZM88.9353%2019.4531C86.6291%2019.4531%2085.1842%2017.91%2085.1842%2015.7606C85.1842%2013.6111%2086.6291%2012.068%2088.9353%2012.068C91.2416%2012.068%2092.6587%2013.6111%2092.6587%2015.7606C92.6587%2017.91%2091.2416%2019.4531%2088.9353%2019.4531Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M109.055%2012.3711V8.59585H105.026V3.63567H100.552V8.59585H97.3569V12.3711H100.552V17.8549C100.552%2021.1065%20102.108%2023.063%20106.276%2023.063H109.055V19.0949H107.11C105.721%2019.0949%20105.026%2018.5989%20105.026%2017.1384V12.3711H109.055Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M110.536%2022.9253H115.01V8.59585C113.603%209.30728%20111.942%209.30728%20110.536%208.59585V22.9253Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M121.912%2022.9253H126.691L132.86%208.59585H128.22L124.385%2017.9651H124.218L120.412%208.59585H115.771L121.912%2022.9253Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M139.875%208.1825C135.485%208.1825%20132.651%209.31233%20132.79%2013.0325H136.763C136.958%2011.8751%20137.791%2011.4893%20139.681%2011.4893C141.737%2011.4893%20142.598%2011.9578%20142.598%2013.3356V14.4378H137.569C133.79%2014.4378%20132.039%2015.8708%20132.039%2018.7642C132.039%2021.823%20133.984%2023.3386%20137.124%2023.3386C139.514%2023.3386%20142.181%2022.4568%20143.404%2020.4176L142.904%2021.4372L143.293%2022.9253H147.072V12.8671C147.072%209.78079%20144.877%208.1825%20139.875%208.1825ZM138.736%2020.0043C137.18%2020.0043%20136.596%2019.4256%20136.596%2018.5438C136.596%2017.6344%20137.18%2017.1384%20138.291%2017.1384H142.598V18.8193C141.653%2019.5909%20140.348%2020.0043%20138.93%2020.0043H138.736Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M159.449%2012.3711V8.59585H155.42V3.63567H150.946V8.59585H147.751V12.3711H150.946V17.8549C150.946%2021.1065%20152.503%2023.063%20156.67%2023.063H159.449V19.0949H157.504C156.115%2019.0949%20155.42%2018.5989%20155.42%2017.1384V12.3711H159.449Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M164.573%2017.0833H175.855C176.299%2011.4893%20173.187%208.1825%20168.075%208.1825C162.934%208.1825%20160.072%2011.4893%20160.072%2015.7606C160.072%2020.0318%20163.156%2023.3386%20168.325%2023.3386C171.253%2023.3386%20173.608%2022.2729%20174.993%2020.8479C175.985%2019.8266%20174.987%2018.4887%20173.563%2018.4887C172.645%2018.4887%20171.783%2019.0976%20170.949%2019.4815C170.264%2019.7967%20169.383%2019.9492%20168.575%2019.9492C166.352%2019.9492%20164.935%2018.8744%20164.573%2017.0833ZM168.075%2011.4342C169.936%2011.4342%20171.048%2012.2609%20171.464%2014.4103H164.546C164.879%2012.4538%20166.018%2011.4342%20168.075%2011.4342Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M3.23836%2015.5791C3.77117%2017.0253%204.65214%2017.5873%205.93234%2017.9525L6.18218%2017.5697C6.45474%2017.1389%206.55844%2016.5424%206.58749%2015.9993C6.59931%2015.7022%206.64682%2015.3922%206.99197%2015.2681C7.33711%2015.144%207.6791%2015.3405%207.79606%2015.658C7.83505%2015.7638%207.88055%2015.9605%207.86655%2016.1785C7.83964%2016.6542%207.70142%2017.596%207.23525%2018.2696L6.49976%2019.3462C5.71019%2020.4955%205.36527%2021.3519%205.71181%2022.2924C6.34425%2024.009%207.94592%2024.698%209.386%2024.1802C9.99297%2023.9619%2010.8087%2023.3225%2011.2845%2022.4191L12.5304%2020.0938C12.8278%2019.5475%2012.9498%2018.5982%2012.9355%2018.0841C12.9268%2017.7676%2013.036%2017.5153%2013.3454%2017.4041C13.6787%2017.2843%2014.0401%2017.4605%2014.1658%2017.8015C14.2134%2017.9308%2014.2102%2018.1051%2014.207%2018.2793C14.2039%2018.6%2014.2258%2019.5374%2013.6072%2020.7851C15.8549%2021.6545%2016.5918%2021.6426%2017.532%2021.3045C18.8769%2020.8209%2019.7886%2019.1617%2019.2211%2017.6215C18.9439%2016.8691%2018.4547%2016.4192%2017.5175%2015.9972L15.919%2015.2804C15.2697%2014.9813%2014.6333%2014.571%2014.0359%2014.1201C13.8887%2014.0133%2013.7902%2013.9288%2013.7209%2013.7407C13.6039%2013.4233%2013.7824%2013.0662%2014.0918%2012.955C14.3179%2012.8736%2014.5235%2012.9195%2014.7075%2013.0531C15.4933%2013.6494%2016.2758%2014.1269%2016.8677%2014.3801L18.7482%2013.704C20.6286%2013.0279%2021.4916%2011.3462%2020.8202%209.52384C20.1444%207.68974%2018.3891%206.94947%2016.5086%207.62559L5.40457%2011.6181C3.52413%2012.2942%202.64924%2013.9802%203.23836%2015.5791Z'%20fill='%23FFF9D4'/%3e%3cellipse%20cx='8.35869'%20cy='5.28086'%20rx='3.43657'%20ry='3.39487'%20fill='%23FFF9D4'/%3e%3cellipse%20cx='112.738'%20cy='4.55001'%20rx='3.33041'%20ry='3.29'%20fill='%23ED7846'/%3e%3c/svg%3e"

/* Les deux états qui nous concernent ici. L'observabilité non activée n'est pas
 * modélisée : dans ce cas le client reste sur Run et Explore n'existe pas, donc
 * il n'y a rien à montrer de ce côté. */
type ObsState = 'empty' | 'connected' | 'live'
const OBS_STATE_LABEL: Record<ObsState, string> = {
  empty: 'No data yet',
  connected: 'Connected, no data',
  live: 'Data live',
}
const OBS_STATE_DOT: Record<ObsState, string> = {
  empty: styles.dataDotIdle,
  connected: styles.dataDotWait,
  live: styles.dataDotOn,
}

const NAV_RUN = [
  { section: 'Overview', items: [
    { key: 'overview', icon: IconMonitor, label: 'Realtime status' },
    { key: 'incidents', icon: IconBell, label: 'Incidents' },
    { key: 'analytics', icon: IconBarChartBig, label: 'Analytics' },
  ]},
  { section: 'Run', items: [
    { key: 'live', icon: IconMonitor, label: 'Live session' },
    { key: 'tests', icon: IconZap, label: 'Tests' },
    { key: 'exec', icon: IconPlay, label: 'Executions' },
    { key: 'monitors', icon: IconActivity, label: 'Monitors' },
  ]},
  { section: 'Equipments', items: [
    { key: 'locations', icon: IconMapPin, label: 'Locations' },
    { key: 'browsers', icon: IconGlobe, label: 'Browser presets' },
    { key: 'devices', icon: IconSmartphone, label: 'Devices lab' },
  ]},
]

const NAV_EXPLORE: { section: string; items: { key: ExploreTab; icon: React.ComponentType<{ size?: number }>; label: string }[] }[] = [
  {
    section: 'Explore',
    items: [
      { key: 'logs', icon: IconFile, label: 'Logs explorer' },
      { key: 'traces', icon: IconBookOpen, label: 'Traces' },
      { key: 'metrics', icon: IconGauge, label: 'Metrics' },
      { key: 'perses', icon: IconGlobe, label: 'Traces (Perses)' },
      { key: 'svcmap', icon: IconNetwork, label: 'Service map' },
      { key: 'k8s', icon: IconWrench, label: 'Kubernetes' },
    ],
  },
  {
    section: 'Data',
    items: [{ key: 'usage', icon: IconBarChartBig, label: 'Ingestion' }],
  },
]

/* Sévérité (DA unifiée logs), pastille colorée + label mono discret. */
const SEV_COLOR: Record<LogEntry['level'], string> = {
  error: '#e0372e',
  warn: '#f2b338',
  info: '#7B9F7F',
  debug: '#AEC6B1',
}
const SeverityTag = ({ level }: { level: LogEntry['level'] }) => (
  <span className={styles.sevTag}>
    <span className={styles.sevDot} style={{ background: SEV_COLOR[level] }} />
    {level.toUpperCase()}
  </span>
)

/* Id hexadécimal déterministe (pas de Math.random → stable au re-render). */
const idFrom = (seed: string, len: number) => {
  const hex = 'abcdef0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += hex[(seed.charCodeAt(i % seed.length) * (i + 7)) % 16]
  return out
}

/* Extrait des attributs HTTP d'un message de log type "GET /api/x 200, 39ms". */
const httpAttrs = (msg: string): { method: string; route: string; status: string; dur: string } | null => {
  const m = msg.match(/^(GET|POST|PATCH|PUT|DELETE)\s+(\S+)\s+(\d{3})\s+-\s+(\d+)ms/)
  if (!m) return null
  return { method: m[1], route: m[2], status: m[3], dur: m[4] }
}

/** Compteur compact : 1.2k, 48k, 1.4M. Les volumes changent avec la plage. */
const fmtCount = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`
      : String(Math.round(n))

const genKey = () => {
  const hex = '0123456789abcdef'
  let s = ''
  for (let i = 0; i < 36; i++) s += hex[Math.floor(Math.random() * 16)]
  return `otlp_sk_live_${s}`
}
const fmtGB = (n: number) => `${n.toFixed(1)} GB`
const fmtLeft = (n: number) => (Math.abs(n) < 1 ? `${(Math.abs(n) * 1000).toFixed(0)} MB` : `${Math.abs(n).toFixed(1)} GB`)

type AlertDraft = {
  name: string
  signal: 'logs' | 'traces'
  query: string
  operator: string
  threshold: string
  checkEvery: string
  lookBack: string
  cooldown: string
  severity: string
  destinationKey: string
  createsIncident: boolean
}

/* Log volume: le time range régénère buckets + labels → le contrôle scope
   vraiment le graph (SVG maison, Highcharts absent du proto). */
/* Fenêtre plus courte = buckets plus fins = moins de logs par barre (amplitude
   plus basse). Chaque range a donc une forme + une échelle Y distinctes. */
const VOLUME_RANGES: Record<
  string,
  { n: number; base: number; yMax: number; startMin: number; stepMin: number; labels: string[] }
> = {
  '15m': { n: 15, base: 7, yMax: 20, startMin: 481, stepMin: 1, labels: ['08:01', '08:04', '08:07', '08:10', '08:13'] },
  '1h': { n: 20, base: 22, yMax: 60, startMin: 495, stepMin: 3, labels: ['08:15', '08:30', '08:45', '09:00', '09:15'] },
  '6h': { n: 18, base: 48, yMax: 90, startMin: 240, stepMin: 20, labels: ['04:00', '05:30', '07:00', '08:30', '10:00'] },
  '24h': { n: 24, base: 74, yMax: 120, startMin: 660, stepMin: 60, labels: ['11:00', '15:00', '19:00', '23:00', '03:00', '07:00'] },
}

const LogVolumeBars = ({ range, empty }: { range: string; empty?: boolean }) => {
  const [hover, setHover] = useState<number | null>(null)
  // Position réelle (px) du centre de la barre survolée, relative au conteneur.
  // On la mesure au survol plutôt que la déduire du viewBox, sinon le tooltip
  // ne tombe pas sur la barre (le SVG est étiré en preserveAspectRatio=none).
  const [tipX, setTipX] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const cfg = VOLUME_RANGES[range] ?? VOLUME_RANGES['24h']
  const spread = Math.max(6, Math.round(cfg.base * 0.3))
  const bars = Array.from({ length: cfg.n }, (_, i) => {
    const dip = i % 7 === 6
    // Vide : l'histogramme garde ses axes et ses graduations, sans aucune barre.
    if (empty) return { error: 0, warn: 0, info: 0, debug: 0 }
    return {
      error: cfg.base > 30 && i % 6 === 0 ? 1 : 0,
      warn: i % 4 === 0 ? 1 : 0,
      info: (dip ? Math.round(cfg.base * 0.7) : cfg.base) + ((i * 13) % spread),
      debug: Math.round(cfg.base * 0.3) + ((i * 5) % Math.max(3, Math.round(cfg.base * 0.15))),
    }
  })
  const W = 1040, H = 150, padL = 28, padR = 8, padT = 8, padB = 20
  const plotW = W - padL - padR, plotH = H - padT - padB
  const yMax = cfg.yMax
  const yFor = (v: number) => padT + plotH - (v / yMax) * plotH
  const colW = plotW / bars.length
  const bw = colW * 0.62
  const yTicks = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax]
  const parts: { key: 'error' | 'warn' | 'info' | 'debug'; label: string; color: string }[] = [
    { key: 'error', label: 'Error', color: '#e0372e' },
    { key: 'warn', label: 'Warning', color: '#f2b338' },
    { key: 'info', label: 'Info', color: '#7B9F7F' },
    { key: 'debug', label: 'Debug', color: '#AEC6B1' },
  ]
  // Heure du bucket survolé (pour le tooltip).
  const barTime = (i: number) => {
    const total = (cfg.startMin + i * cfg.stepMin) % 1440
    const p = (x: number) => String(x).padStart(2, '0')
    return `${p(Math.floor(total / 60))}:${p(total % 60)}`
  }
  // Mesure le centre de la barre survolée en px, relatif au conteneur.
  const onEnterBar = (i: number, e: ReactMouseEvent<SVGGElement>) => {
    setHover(i)
    const wrap = wrapRef.current?.getBoundingClientRect()
    const box = e.currentTarget.getBoundingClientRect()
    if (!wrap) return
    const half = 88 // demi-largeur du tooltip, pour le clamp
    const x = box.left + box.width / 2 - wrap.left
    setTipX(Math.min(wrap.width - half, Math.max(half, x)))
  }

  return (
    <div className={styles.volumeWrap} ref={wrapRef}>
      <svg className={styles.volumeChart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Log volume">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={yFor(t)} x2={W - padR} y2={yFor(t)} stroke="#eef0f3" strokeWidth={1} />
            <text x={padL - 6} y={yFor(t) + 3} textAnchor="end" fontSize={9} fill="#98a2b3" fontFamily="Geist Mono, monospace">{t}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const cx = padL + (i + 0.5) * colW
          const hovered = hover === i
          let acc = 0
          return (
            <g key={i} onMouseEnter={(e) => onEnterBar(i, e)} onMouseLeave={() => setHover(null)}>
              {/* colonne survolée : bande grise + guide pointillé, derrière les barres */}
              <rect x={cx - colW / 2} y={padT} width={colW} height={plotH} fill={hovered ? '#f0f2f4' : 'transparent'} />
              {hovered && (
                <line x1={cx} y1={padT} x2={cx} y2={padT + plotH} stroke="#c4ccd4" strokeWidth={1} strokeDasharray="3 3" />
              )}
              {parts.map((p) => {
                const v = b[p.key]
                if (!v) return null
                const y0 = yFor(acc)
                const y1 = yFor(acc + v)
                acc += v
                return <rect key={p.key} x={cx - bw / 2} y={y1} width={bw} height={y0 - y1} fill={p.color} rx={0.5} />
              })}
            </g>
          )
        })}
        {cfg.labels.map((lbl, li) => (
          <text key={lbl + li} x={padL + ((li + 0.5) / cfg.labels.length) * plotW} y={H - 5} textAnchor="middle" fontSize={9} fill="#5b6b6a" fontFamily="Geist Mono, monospace">{lbl}</text>
        ))}
      </svg>
      {hover !== null && (
        <div className={styles.volumeTip} style={{ left: tipX, marginLeft: -88 }}>
          <div className={styles.volumeTipTime}>{barTime(hover)}</div>
          {parts.map((p) => (
            <div key={p.key} className={styles.volumeTipRow}>
              <span className={styles.volumeTipDot} style={{ background: p.color }} />
              <span className={styles.volumeTipLabel}>{p.label}</span>
              <span className={styles.volumeTipVal}>{bars[hover][p.key]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* Horodatage live tail : on manipule des millisecondes dans la journée pour
   fabriquer/insérer les lignes, puis on reformate en `YYYY-MM-DD HH:mm:ss.SSS`. */
const LIVE_DATE = '2026-07-13'
const tsToMs = (ts: string) => {
  const t = ts.split(' ')[1] ?? ts
  const [hms, ms] = t.split('.')
  const [h, m, s] = hms.split(':').map(Number)
  return (h * 3600 + m * 60 + s) * 1000 + Number(ms ?? 0)
}
const msToTs = (total: number) => {
  const ms = total % 1000
  let rem = Math.floor(total / 1000)
  const s = rem % 60
  rem = Math.floor(rem / 60)
  const m = rem % 60
  const h = Math.floor(rem / 60)
  const p = (n: number, l = 2) => String(n).padStart(l, '0')
  return `${LIVE_DATE} ${p(h)}:${p(m)}:${p(s)}.${p(ms, 3)}`
}
// Lignes générées par le live tail. Certaines réutilisent une trace existante
// pour que le regroupement (pastilles) reste visible pendant le stream.
const LIVE_TEMPLATES: Omit<LogEntry, 'key' | 'ts'>[] = [
  { level: 'info', svc: 'demo-site', msg: 'GET /api/menu 200 - 2ms', traceKey: 'tr_g8' },
  { level: 'debug', svc: 'demo-site', msg: 'Menu requested - 18 items', traceKey: 'tr_g8' },
  { level: 'info', svc: 'demo-site', msg: 'POST /api/order 200 - 264ms', traceKey: 'tr_g9' },
  { level: 'info', svc: 'demo-site', msg: 'Order created', traceKey: 'tr_g9' },
  { level: 'info', svc: 'payment-service', msg: 'Payment validation OK - card for €15.50', traceKey: 'tr_g9' },
  { level: 'info', svc: 'demo-site', msg: 'POST /api/login 200 - 372ms', traceKey: 'tr_g11' },
  { level: 'info', svc: 'demo-site', msg: 'User logged in', traceKey: 'tr_g11' },
  { level: 'info', svc: 'demo-site', msg: 'GET /api/admin/orders 200 - 3ms' },
  { level: 'debug', svc: 'demo-site', msg: 'Session refreshed - user_id=u_8823' },
  { level: 'info', svc: 'demo-site', msg: 'GET /api/health 200 - 1ms' },
]

/* ─── Logs View ─── */
const LogsView = ({
  search,
  setSearch,
  level,
  setLevel,
  onOpenLog,
  onOpenTrace,
  empty,
  range,
}: {
  search: string
  setSearch: (v: string) => void
  level: string
  setLevel: (v: string) => void
  onOpenLog: (l: LogEntry) => void
  onOpenTrace: (t: TraceEntry) => void
  /** Connecté mais sans télémétrie : la page reste entière, les données sont vides. */
  empty?: boolean
  /** Plage de temps : elle vit dans l'en-tête de page, elle porte toute la page. */
  range: string
}) => {
  // Vues vides : on masque les jeux de données au lieu de les atténuer. Le chrome
  // de la page (filtres, axes, colonnes) reste, il n'y a simplement rien dedans.
  const LOGS = empty ? [] : ALL_LOGS
  const LOG_TOTAL = empty ? 0 : ALL_LOG_TOTAL
  const TRACES = empty ? [] : ALL_TRACES
  const [live, setLive] = useState(false)
  const [levelFilterOpen, setLevelFilterOpen] = useState(false)
  // Live tail : `rows` = flux courant (initialisé aux logs mockés), `newKeys` =
  // lignes fraîchement arrivées (pour le fondu), refs = horloge + compteur.
  const [rows, setRows] = useState<LogEntry[]>(LOGS)
  const [newKeys, setNewKeys] = useState<Set<string>>(() => new Set())
  const liveClock = useRef<number | null>(null)
  const liveSeq = useRef(0)

  const q = search.trim().toLowerCase()
  const levels = level.split(',').filter(Boolean)
  const filtered = rows.filter(
    (l) =>
      (levels.length === 0 || levels.includes(l.level)) &&
      (q === '' || `${l.msg} ${l.svc} ${l.level}`.toLowerCase().includes(q)),
  )

  // Streaming du live tail : à intervalle régulier on fabrique une ligne et on
  // l'insère à sa place chronologique. Par "la magie du direct" (Benjamin), une
  // ligne arrive parfois en léger retard et s'insère au milieu, pas seulement en
  // tête ; elle est signalée par un fond qui s'estompe (newKeys -> .logRowNew).
  useEffect(() => {
    if (!live) return
    if (liveClock.current === null) liveClock.current = tsToMs(rows[0]?.ts ?? `${LIVE_DATE} 08:11:35.501`)
    const id = setInterval(() => {
      liveClock.current = (liveClock.current ?? 0) + 300 + Math.floor(Math.random() * 900)
      const lag = Math.random() < 0.3 ? 400 + Math.floor(Math.random() * 2100) : 0
      const tpl = LIVE_TEMPLATES[Math.floor(Math.random() * LIVE_TEMPLATES.length)]
      liveSeq.current += 1
      const key = `live-${liveSeq.current}`
      const entry: LogEntry = { ...tpl, key, ts: msToTs((liveClock.current ?? 0) - lag) }
      setRows((prev) =>
        [entry, ...prev].sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0)).slice(0, 300),
      )
      setNewKeys((prev) => new Set(prev).add(key))
      setTimeout(() => {
        setNewKeys((prev) => {
          const n = new Set(prev)
          n.delete(key)
          return n
        })
      }, 1600)
    }, 1200)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  return (
    <>
      <div className={styles.kpiRow}>
        <CounterCardGroup>
          {/* Volumes proportionnels à la plage : changer le picker change ces
              chiffres, c'est ce qui fait comprendre sa portée. */}
          <CounterCard title="Total logs" value={empty ? '0' : fmtCount(50_000 * rangeFactor(range))} trend={empty ? undefined : <TrendTag current={118} previous={100} />} />
          <CounterCard title="Errors" value={empty ? '0' : fmtCount(35 * rangeFactor(range))} trend={empty ? undefined : <TrendTag current={105.2} previous={100} />} />
          <CounterCard title="Warnings" value={empty ? '0' : fmtCount(135 * rangeFactor(range))} trend={empty ? undefined : <TrendTag current={88} previous={100} invertColor />} />
          <CounterCard
            title="Services"
            value={empty ? '0' : '14'}
            trend={
              empty ? (
                <StatusTag variant="ghost" color="info">None reporting</StatusTag>
              ) : (
                <StatusTag variant="ghost" color="success">All reporting</StatusTag>
              )
            }
          />
        </CounterCardGroup>
      </div>

      {/* Vue d'ensemble : le time range scope le graph */}
      <div className={styles.volumeCard}>
        <div className={styles.overviewTitle}>Log volume</div>
        <LogVolumeBars range={range} empty={empty} />
        <MiniLegend items={[{ label: 'Error', color: '#e0372e' }, { label: 'Warning', color: '#f2b338' }, { label: 'Info', color: '#7B9F7F' }, { label: 'Debug', color: '#AEC6B1' }]} />
      </div>

      {/* Liste : la recherche + le niveau filtrent le tableau */}
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SmartSearch
            value={search}
            onChange={setSearch}
            placeholder="Search logs, e.g. level:error service:payment-service"
            schema={{
              level: ['error', 'warn', 'info', 'debug'],
              service: ['demo-site', 'payment-service', 'postgres', 'rabbitmq', 'obs-agent'],
              trace: ['exists', 'none'],
            }}
          />
        </div>
        <div className={styles.filterGroup}>
          <Button
            color={live ? 'danger-s' : 'secondary'}
            disabled={empty}
            onClick={() => {
              setLive((s) => !s)
              toast.info(live ? 'Live tail stopped' : 'Live tail started')
            }}
          >
            <Button.Icon icon={live ? Square : IconPlay} />
            {live ? 'Stop live tail' : 'Live tail'}
          </Button>
        </div>
      </div>

      <div className={styles.resultBar}>
        {/* Le live vit à côté du compteur : il pousse dans le vide, rien d'autre. */}
        <span className={styles.resultCount}>
          <span>Showing {filtered.length} of {empty ? 0 : fmtCount(LOG_TOTAL * rangeFactor(range))} lines</span>
          {live && (
            <span className={styles.otlpListening}>
              <span className={styles.otlpPulse} />
              Live
            </span>
          )}
        </span>
      </div>

      <div className={styles.logTable}>
          <div className={styles.logTableHead}>
            {/* Le filtre vit dans la colonne qu'il filtre, comme partout ailleurs
                dans le produit, plutôt qu'en Select détaché au-dessus. */}
            <span className={styles.logHeadFilter}>
              Severity
              <Popover
                trigger="click"
                placement="bottomLeft"
                noPadding
                open={levelFilterOpen}
                setOpen={setLevelFilterOpen}
                content={
                  <div className={styles.filterMenu}>
                  <TableFilter
                    selectedFilters={level}
                    setFilter={setLevel}
                    items={[
                      // Mêmes pastilles que dans le tableau : la couleur de la
                      // sévérité doit se lire au moment où on la choisit.
                      { label: 'Error', key: 'error', icon: <span className={styles.miniDot} style={{ background: SEV_COLOR.error }} /> },
                      { label: 'Warning', key: 'warn', icon: <span className={styles.miniDot} style={{ background: SEV_COLOR.warn }} /> },
                      { label: 'Info', key: 'info', icon: <span className={styles.miniDot} style={{ background: SEV_COLOR.info }} /> },
                      { label: 'Debug', key: 'debug', icon: <span className={styles.miniDot} style={{ background: SEV_COLOR.debug }} /> },
                    ]}
                  />
                  </div>
                }
              >
                <button
                  type="button"
                  className={levels.length === 0 ? styles.headFilterBtn : styles.headFilterBtnOn}
                  aria-label="Filter by severity"
                >
                  <IconListFilter size={13} />
                </button>
              </Popover>
            </span>
            <span>Time</span>
            <span>Resource</span>
            <span>Body</span>
            <span>Trace</span>
          </div>
        {filtered.length === 0 ? (
          // L'entête reste monté : sinon le filtre disparaît avec les lignes
          // et on ne peut plus le retirer. Impasse classique.
          <div className={styles.emptyInTable}>
            <EmptyState
              icon={<IconSearchX />}
              text={empty ? 'No logs yet' : 'No logs match your filters'}
              description={
                empty
                  ? 'This table fills up on its own as soon as your services start exporting logs.'
                  : 'Try a broader search or reset the level filter.'
              }
            />
          </div>
        ) : (
          <>
          {filtered.map((l) => {
            const tr = l.traceKey ? TRACES.find((t) => t.key === l.traceKey) : undefined
            return (
              <div
                key={l.key}
                data-anchor={`log:${l.key}:row`}
                className={`${styles.logRow}${newKeys.has(l.key) ? ` ${styles.logRowNew}` : ''}`}
                onClick={() => onOpenLog(l)}
              >
                <span><SeverityTag level={l.level} /></span>
                <span className={styles.logCellTime}>{l.ts.slice(11)}</span>
                <span className={styles.logCellSvc}>{l.svc}</span>
                <span className={styles.logCellBody}>{l.msg}</span>
                <span className={styles.logCellTrace}>
                  {tr ? (
                    <button
                      type="button"
                      className={styles.logTraceBtn}
                      title={`Open trace ${tr.traceId}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenTrace(tr)
                      }}
                    >
                      {tr.traceId.slice(0, 16)}…
                    </button>
                  ) : (
                    <span className={styles.logCellTraceEmpty}>-</span>
                  )}
                </span>
              </div>
            )
          })}
          </>
        )}
      </div>
    </>
  )
}

/* Part du temps passé par service dans une trace : on agrège les spans par
   service (libellé nettoyé de ses parenthèses) et on normalise à 100 %.
   La couleur du service vient de la donnée (stable d'une trace à l'autre). */
const serviceBreakdown = (t: TraceEntry) => {
  const agg = new Map<string, { name: string; color: string; w: number }>()
  for (const b of t.bars) {
    const name = b.label.split(' (')[0]
    const cur = agg.get(name)
    if (cur) cur.w += b.width
    else agg.set(name, { name, color: b.color, w: b.width })
  }
  const total = Array.from(agg.values()).reduce((s, x) => s + x.w, 0) || 1
  return Array.from(agg.values())
    .map((x) => ({ name: x.name, color: x.color, pct: (x.w / total) * 100 }))
    .sort((a, b) => b.pct - a.pct)
}

/* ─── Traces View ─── */
const RANGE_LABEL: Record<string, string> = {
  '15m': '15 minutes',
  '1h': '1 hour',
  '6h': '6 hours',
  '24h': '24 hours',
  custom: 'period',
}

const TracesView = ({
  search,
  setSearch,
  svc,
  setSvc,
  onOpenTrace,
  empty,
  range,
}: {
  search: string
  setSearch: (v: string) => void
  svc: string
  setSvc: (v: string) => void
  onOpenTrace: (t: TraceEntry) => void
  empty?: boolean
  /** Plage de temps : dans l'en-tête de page, elle porte toute la page. */
  range: string
}) => {
  const TRACES = empty ? [] : ALL_TRACES
  const SERVICES = empty ? [] : ALL_SERVICES
  const [live, setLive] = useState(false)
  const [svcFilterOpen, setSvcFilterOpen] = useState(false)
  // Comparaison par carte : l'affordance vit DANS le graphe qu'elle modifie,
  // donc chaque graphe se compare indépendamment.
  const [compareIds, setCompareIds] = useState<Set<string>>(() => new Set())
  const toggleCompare = (id: string) =>
    setCompareIds((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  // Live tail : les traces qui arrivent en direct s'empilent devant les autres.
  const [incoming, setIncoming] = useState<TraceEntry[]>([])
  const liveSeq = useRef(0)
  useEffect(() => {
    if (!live || empty) return
    const id = setInterval(() => {
      const tpl = ALL_TRACES[liveSeq.current % ALL_TRACES.length]
      liveSeq.current += 1
      const key = `live_${liveSeq.current}`
      setIncoming((cur) =>
        [{ ...tpl, key, traceId: idFrom(key, 32) }, ...cur].slice(0, 12),
      )
    }, 1600)
    return () => clearInterval(id)
  }, [live, empty])
  useEffect(() => {
    if (!live) setIncoming([])
  }, [live])
  // Rien reçu : tous les compteurs à zéro, et aucune période à comparer.
  const ZERO = { cur: 0, prev: 0 }
  const TRACE_COMPARE = empty
    ? { requests: ZERO, errorRate: ZERO, avg: ZERO, p95: ZERO, p99: ZERO }
    : ALL_TRACE_COMPARE


  const q = search.trim().toLowerCase()
  const source = [...incoming, ...TRACES]
  const svcs = svc.split(',').filter(Boolean)
  const filtered = source.filter(
    (t) =>
      (svcs.length === 0 || svcs.includes(t.svc)) &&
      (q === '' || `${t.name} ${t.svc}`.toLowerCase().includes(q)),
  )
  // Légende bornée : une légende qui énumère tous les services ne tient pas à
  // 300 services. On classe par poids réel (temps cumulé sur les traces filtrées),
  // on montre les 5 premiers, et le reste part dans un « +N » dépliable.
  const weights = new Map<string, { color: string; w: number }>()
  for (const t of filtered)
    for (const b of t.bars) {
      const name = b.label.split(' (')[0]
      const cur = weights.get(name)
      weights.set(name, { color: cur?.color ?? b.color, w: (cur?.w ?? 0) + b.width })
    }
  const ranked = [...weights.entries()]
    .map(([name, v]) => ({ name, color: v.color, w: v.w }))
    .sort((a, b) => b.w - a.w)
  const LEGEND_MAX = 5
  const legend = ranked.slice(0, LEGEND_MAX)
  const legendRest = ranked.slice(LEGEND_MAX)

  return (
    <>

      <div className={styles.kpiRow}>
        <CounterCardGroup>
          <CounterCard
            title="Traces"
            value={fmtCount(TRACE_COMPARE.requests.cur * rangeFactor(range))}
            trend={
              empty ? undefined : (
                <TrendTag
                  current={TRACE_COMPARE.requests.cur * rangeFactor(range)}
                  previous={TRACE_COMPARE.requests.prev * rangeFactor(range)}
                />
              )
            }
          />
          <CounterCard
            title="Avg duration"
            value={`${TRACE_COMPARE.avg.cur}ms`}
            trend={<TrendTag current={TRACE_COMPARE.avg.cur} previous={TRACE_COMPARE.avg.prev} invertColor />}
          />
          <CounterCard
            title="Error rate"
            value={`${TRACE_COMPARE.errorRate.cur}%`}
            trend={<TrendTag current={TRACE_COMPARE.errorRate.cur} previous={TRACE_COMPARE.errorRate.prev} />}
          />
          <CounterCard
            title="P99 latency"
            value={`${TRACE_COMPARE.p99.cur}ms`}
            trend={<TrendTag current={TRACE_COMPARE.p99.cur} previous={TRACE_COMPARE.p99.prev} invertColor />}
          />
        </CounterCardGroup>
      </div>

      <div className={styles.overviewRow}>
        {TRACE_OVERVIEW_PANELS.map((p0) => {
          const on = compareIds.has(p0.id)
          const panel = empty
            ? emptyPanel(p0)
            : on
              ? withPrevious(panelForRange(p0, range))
              : panelForRange(p0, range)
          return (
            <Card key={p0.id} className={styles.overviewCard}>
              <div data-anchor={`trace-overview:${p0.id}`} className={styles.overviewTitle}>
                <span>{panel.unit ? `${panel.name} (${panel.unit})` : panel.name}</span>
                {/* Discret, dans la carte : comparer n'ajoute qu'une courbe ici. */}
                <button
                  type="button"
                  className={on ? styles.cardActionOn : styles.cardAction}
                  disabled={empty}
                  onClick={() => toggleCompare(p0.id)}
                  title={
                    on
                      ? 'Hide the previous period'
                      : `Compare with previous ${RANGE_LABEL[range] ?? 'period'}`
                  }
                  aria-label="Compare with previous period"
                >
                  <ArrowLeftRight size={13} />
                </button>
              </div>
              <LineChart panel={panel} height={150} />
            </Card>
          )
        })}
      </div>

      {/* Recherche + live tail immédiatement au-dessus de la liste qu'ils pilotent,
          exactement comme sur la page Logs. */}
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SmartSearch
            value={search}
            onChange={setSearch}
            placeholder="Search traces, e.g. service:demo-site duration:>100ms"
            schema={{
              service: ['demo-site', 'payment-service', 'postgres'],
              status: ['ok', 'error'],
              duration: ['>100ms', '>500ms', '>1s'],
            }}
          />
        </div>
        <div className={styles.filterGroup}>
          <Button
            color={live ? 'danger-s' : 'secondary'}
            disabled={empty}
            onClick={() => {
              setLive((v) => !v)
              toast.info(live ? 'Live tail stopped' : 'Live tail started')
            }}
          >
            <Button.Icon icon={live ? Square : IconPlay} />
            {live ? 'Stop live tail' : 'Live tail'}
          </Button>
        </div>
      </div>

      <div className={styles.resultBar}>
        {/* Le live vit à côté du compteur, à gauche : il ne pousse plus la légende. */}
        <span className={styles.resultCount}>
          <span>
            Showing {filtered.length} of {empty ? 0 : fmtCount(source.length * 42 * rangeFactor(range))} traces
          </span>
          {live && (
            <span className={styles.otlpListening}>
              <span className={styles.otlpPulse} />
              Live
            </span>
          )}
        </span>
        {legend.length > 0 && (
          <span className={styles.traceLegendItems}>
            {legend.map((l) => (
              <span key={l.name} className={styles.traceLegendItem}>
                <span className={styles.traceLegendDot} style={{ background: l.color }} />
                {l.name}
              </span>
            ))}
            {legendRest.length > 0 && (
              <Popover
                trigger="click"
                placement="bottomRight"
                content={
                  <div className={styles.legendRest}>
                    {legendRest.map((l) => (
                      <span key={l.name} className={styles.traceLegendItem}>
                        <span className={styles.traceLegendDot} style={{ background: l.color }} />
                        {l.name}
                      </span>
                    ))}
                  </div>
                }
              >
                <button type="button" className={styles.legendMore}>
                  +{legendRest.length}
                </button>
              </Popover>
            )}
          </span>
        )}
      </div>

      <div className={styles.traceList}>
        {/* Entête de colonnes, comme sur les logs : le filtre de service vit dans
            la colonne qu'il filtre, plus de Select détaché au-dessus. */}
        <div className={styles.traceListHead}>
          <span className={styles.traceHeadName}>
            Trace
            <Popover
              trigger="click"
              placement="bottomLeft"
              noPadding
              open={svcFilterOpen}
              setOpen={setSvcFilterOpen}
              content={
                <div className={styles.filterMenu}>
                <TableFilter
                  selectedFilters={svc}
                  setFilter={setSvc}
                  items={[
                    // Même couleur de service que dans la légende et les barres.
                    ...['demo-site', 'payment-service', 'postgres'].map((sv) => ({
                      label: sv,
                      key: sv,
                      icon: <span className={styles.miniDot} style={{ background: svcColor(sv) }} />,
                    })),
                  ]}
                />
                </div>
              }
            >
              <button
                type="button"
                className={svcs.length === 0 ? styles.headFilterBtn : styles.headFilterBtnOn}
                aria-label="Filter by service"
                onClick={(e) => e.stopPropagation()}
              >
                <IconListFilter size={13} />
              </button>
            </Popover>
          </span>
          <span className={styles.traceHeadMeta}>
            <span className={styles.traceHeadSpans}>Spans</span>
            <span className={styles.traceHeadDur}>Duration</span>
            <span className={styles.traceHeadBar}>Time by service</span>
          </span>
        </div>
        {filtered.length === 0 ? (
          // Entête monté même à zéro résultat : sinon le filtre de service
          // disparaît avec les lignes et devient impossible à retirer.
          <div className={styles.emptyInTable}>
            <EmptyState
              icon={<IconSearchX />}
              text={empty ? 'No traces yet' : 'No traces match your filters'}
              description={
                empty
                  ? 'Spans land here as soon as your services start exporting traces.'
                  : 'Try a broader search or reset the service filter.'
              }
            />
          </div>
        ) : (
          <>
        {filtered.map((t) => {
          return (
            <div
              key={t.key}
              data-anchor={`trace:${t.key}:row`}
              className={styles.traceRow}
              onClick={() => onOpenTrace(t)}
            >
              <div className={styles.traceHead}>
                <div className={styles.traceName}>
                  {t.status === 'error' ? (
                    <XCircle size={16} className={styles.traceStatusErr} aria-label="Error" />
                  ) : (
                    <CheckCircle2 size={16} className={styles.traceStatusOk} aria-label="OK" />
                  )}
                  <span className={styles.traceNameText}>{t.name}</span>
                  <span className={styles.traceKey}>{t.traceId.slice(0, 16)}…</span>
                </div>
                <div className={styles.traceMeta}>
                  <span className={styles.traceSpans}>{t.spans} spans</span>
                  <span className={styles.traceDur}>{t.dur}</span>
                  <div className={styles.traceMiniBar}>
                    {serviceBreakdown(t).map((s) => (
                      <div
                        key={s.name}
                        className={styles.traceSeg}
                        style={{ width: `${s.pct}%`, background: s.color }}
                        title={`${s.name} · ${Math.round(s.pct)}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
          </>
        )}
      </div>
    </>
  )
}

/* Panels RED (Requests / Errors / Duration) dérivés d'un service, rendus via LineChart. */
const wobble = (base: number, seed: number) =>
  [-4, 3, 0, 6, -2, 4, 1].map((d, i) => Math.max(0, Math.round(base + d + ((seed + i) % 3))))

const serviceRedPanels = (s: ServiceNode) => {
  const avg = parseFloat(s.lat) || 40
  const p95 = Math.round(avg * 1.7)
  const errPct = parseFloat(s.err) || 0
  const errPts = [0, 1, 0, 2, 0, 1, 0].map((x) => Math.round(x * errPct))
  return {
    requests: {
      id: 'red_req',
      ...makePanel({
        name: 'Requests', unit: 'Count', yMin: 0, yMax: 60, yTicks: 7,
        series: [{ name: s.label, color: s.color, points: wobble(48, s.label.length) }],
      }),
    },
    errors: {
      id: 'red_err',
      ...makePanel({
        name: 'Errors', unit: 'Count', yMin: 0, yMax: Math.max(2, Math.ceil(errPct * 2)), yTicks: 5,
        series: [{ name: 'errors', color: '#e0372e', points: errPts }],
      }),
    },
    duration: {
      id: 'red_dur',
      ...makePanel({
        name: 'Duration', unit: 'ms', showLegend: true, yMin: 0, yMax: Math.max(50, Math.ceil((p95 * 1.4) / 50) * 50), yTicks: 6,
        series: [
          { name: 'avg', color: '#3b82f6', points: wobble(avg, 2) },
          { name: 'p95', color: '#8b5cf6', points: wobble(p95, 5) },
        ],
      }),
    },
  }
}

/* Telemetry (onglet du drawer service), scatter spans, bars logs, table metrics */
const SPAN_DOTS: { x: number; y: number; err?: boolean }[] = [
  { x: 0.02, y: 360 }, { x: 0.05, y: 355 }, { x: 0.06, y: 110 }, { x: 0.07, y: 130 }, { x: 0.08, y: 105 },
  { x: 0.1, y: 20 }, { x: 0.12, y: 8 }, { x: 0.15, y: 5 }, { x: 0.2, y: 9 }, { x: 0.25, y: 6 },
  { x: 0.3, y: 505 }, { x: 0.32, y: 405 }, { x: 0.4, y: 215 }, { x: 0.42, y: 165 }, { x: 0.43, y: 80 },
  { x: 0.44, y: 30, err: true }, { x: 0.45, y: 12 }, { x: 0.5, y: 7 }, { x: 0.55, y: 5 },
  { x: 0.62, y: 490 }, { x: 0.66, y: 310 }, { x: 0.68, y: 320 }, { x: 0.7, y: 15 }, { x: 0.71, y: 18 }, { x: 0.72, y: 10 },
  { x: 0.8, y: 8 }, { x: 0.85, y: 6 }, { x: 0.9, y: 560 }, { x: 0.93, y: 360 }, { x: 0.95, y: 290 },
  { x: 0.96, y: 110 }, { x: 0.97, y: 20 }, { x: 0.98, y: 14, err: true },
]

const TelemetrySpans = () => {
  const W = 520, H = 172, padL = 34, padR = 8, padT = 8, padB = 24
  const plotW = W - padL - padR, plotH = H - padT - padB
  const yMax = 600
  const yFor = (v: number) => padT + plotH - (v / yMax) * plotH
  const xFor = (f: number) => padL + f * plotW
  const yTicks = [0, 100, 200, 300, 400, 500, 600]
  const xLabels = ['14:10', '14:20', '14:30', '14:40', '14:50']
  return (
    <svg className={styles.miniChart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Spans">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={W - padR} y2={yFor(t)} stroke="#eef0f3" strokeWidth={1} />
          <text x={padL - 6} y={yFor(t) + 3} textAnchor="end" fontSize={9.5} fill="#98a2b3" fontFamily="Geist Mono, monospace">{t}</text>
        </g>
      ))}
      {xLabels.map((l, i) => (
        <text key={l} x={xFor((i + 0.5) / xLabels.length)} y={H - 6} textAnchor="middle" fontSize={9.5} fill="#98a2b3" fontFamily="Geist Mono, monospace">{l}</text>
      ))}
      {SPAN_DOTS.map((d, i) => (
        <circle key={i} cx={xFor(d.x)} cy={yFor(d.y)} r={2.6} fill={d.err ? '#e0372e' : '#98a2b3'} opacity={0.85} />
      ))}
    </svg>
  )
}

const LOG_BARS = Array.from({ length: 16 }, (_, i) => ({
  debug: 18 + ((i * 3) % 12),
  info: 60 + ((i * 7) % 40),
  warn: i % 5 === 0 ? 3 : 0,
  error: i % 8 === 0 ? 2 : 0,
}))

const TelemetryLogs = () => {
  const W = 520, H = 172, padL = 34, padR = 8, padT = 8, padB = 24
  const plotW = W - padL - padR, plotH = H - padT - padB
  const yMax = 120
  const yFor = (v: number) => padT + plotH - (v / yMax) * plotH
  const bw = (plotW / LOG_BARS.length) * 0.7
  const yTicks = [0, 30, 60, 90, 120]
  const parts: { key: 'debug' | 'info' | 'warn' | 'error'; color: string }[] = [
    { key: 'debug', color: '#AEC6B1' }, { key: 'info', color: '#7B9F7F' }, { key: 'warn', color: '#f2b338' }, { key: 'error', color: '#e0372e' },
  ]
  return (
    <svg className={styles.miniChart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Logs">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={W - padR} y2={yFor(t)} stroke="#eef0f3" strokeWidth={1} />
          <text x={padL - 6} y={yFor(t) + 3} textAnchor="end" fontSize={9.5} fill="#98a2b3" fontFamily="Geist Mono, monospace">{t}</text>
        </g>
      ))}
      {LOG_BARS.map((b, i) => {
        const cx = padL + (i + 0.5) * (plotW / LOG_BARS.length)
        let acc = 0
        return (
          <g key={i}>
            {parts.map((p) => {
              const v = b[p.key]
              if (!v) return null
              const y0 = yFor(acc)
              const y1 = yFor(acc + v)
              acc += v
              return <rect key={p.key} x={cx - bw / 2} y={y1} width={bw} height={y0 - y1} fill={p.color} />
            })}
          </g>
        )
      })}
    </svg>
  )
}

/* Line chart à viewBox large (520) → texte d'axe à taille normale même en pleine
   largeur de drawer (le LineChart partagé, viewBox 360, grossit trop ici). */
const MiniLineChart = ({
  panel,
  height = 132,
}: {
  panel: { yMin: number; yMax: number; yTicks: number; xLabels: string[]; showLegend?: boolean; series: { name: string; color: string; points: (number | null)[] }[] }
  height?: number
}) => {
  const W = 520, H = height, padL = 40, padR = 12, padT = 8, padB = 24
  const plotW = W - padL - padR, plotH = H - padT - padB
  const { yMin, yMax, yTicks, xLabels, series } = panel
  const yFor = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH
  const xFor = (i: number) => padL + (xLabels.length === 1 ? 0 : (i / (xLabels.length - 1)) * plotW)
  const ticks = Array.from({ length: yTicks }, (_, i) => yMin + ((yMax - yMin) / (yTicks - 1)) * i)
  const seg = (points: (number | null)[]) => {
    const segs: string[] = []
    let cur: string[] = []
    points.forEach((p, i) => {
      if (p === null || p === undefined) {
        if (cur.length) segs.push(cur.join(' '))
        cur = []
      } else cur.push(`${xFor(i).toFixed(1)},${yFor(p).toFixed(1)}`)
    })
    if (cur.length) segs.push(cur.join(' '))
    return segs
  }
  return (
    <div>
      <svg className={styles.miniChart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={yFor(t)} x2={W - padR} y2={yFor(t)} stroke="#eef0f3" strokeWidth={1} />
            <text x={padL - 6} y={yFor(t) + 3} textAnchor="end" fontSize={9.5} fill="#98a2b3" fontFamily="Geist Mono, monospace">{t.toFixed(0)}</text>
          </g>
        ))}
        {xLabels.map((lbl, i) => (
          <text key={lbl + i} x={xFor(i)} y={H - 6} textAnchor="middle" fontSize={9.5} fill="#98a2b3" fontFamily="Geist Mono, monospace">{lbl}</text>
        ))}
        {series.map((s) =>
          seg(s.points).map((pts, i) => (
            <polyline key={s.name + i} points={pts} fill="none" stroke={s.color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
          )),
        )}
      </svg>
      {panel.showLegend && (
        <MiniLegend items={series.map((s) => ({ label: s.name, color: s.color }))} />
      )}
    </div>
  )
}

/* ─── Recherche assistée ───
 * Complétion pendant la frappe : on tape `service:` et les valeurs possibles
 * s'affichent, filtrées par ce qui est déjà tapé. Parti pris opposé au bouton
 * « {} » qui ouvre un catalogue à onglets à côté du champ : là, l'aide arrive
 * dans le flux de la frappe, au clavier, sans avoir à savoir qu'un panneau
 * existe. Le catalogue reste utile pour découvrir la syntaxe, pas pour l'écrire.
 */
type SearchSchema = Record<string, string[]>

const SmartSearch = ({
  value,
  onChange,
  placeholder,
  schema,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  schema: SearchSchema
}) => {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Le jeton en cours = ce qui suit le dernier espace. Tout le reste est acquis.
  const cut = value.lastIndexOf(' ') + 1
  const head = value.slice(0, cut)
  const token = value.slice(cut)
  const colon = token.indexOf(':')
  const key = colon === -1 ? '' : token.slice(0, colon)
  const partial = colon === -1 ? token : token.slice(colon + 1)

  const suggestions: { label: string; insert: string }[] =
    colon === -1
      ? Object.keys(schema)
          .filter((k) => k.startsWith(token.toLowerCase()))
          .map((k) => ({ label: `${k}:`, insert: `${k}:` }))
      : (schema[key] ?? [])
          .filter((v) => v.toLowerCase().startsWith(partial.toLowerCase()))
          .map((v) => ({ label: `${key}:${v}`, insert: `${key}:${v} ` }))

  const shown = suggestions.slice(0, 7)
  const accept = (i: number) => {
    const s = shown[i]
    if (!s) return
    onChange(head + s.insert)
    setHi(0)
  }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div
      className={styles.smartSearch}
      ref={wrapRef}
      // Au focus, on propose déjà les clés disponibles : plus besoin d'un bouton
      // « {} » séparé pour découvrir la syntaxe, elle s'offre dans le champ.
      onFocus={() => setOpen(true)}
      onKeyDown={(e) => {
        if (!open || !shown.length) return
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHi((h) => (h + 1) % shown.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHi((h) => (h - 1 + shown.length) % shown.length)
        } else if (e.key === 'Tab') {
          e.preventDefault()
          accept(hi)
        } else if (e.key === 'Escape') {
          setOpen(false)
        }
      }}
    >
      <SearchInput
        value={value}
        onChange={(v) => {
          onChange(v)
          setOpen(true)
          setHi(0)
        }}
        onPressEnter={() => (shown.length ? accept(hi) : setOpen(false))}
        placeholder={placeholder}
        fullwidth
      />
      {open && shown.length > 0 && (
        <div className={styles.ssMenu}>
          {shown.map((s, i) => (
            <button
              key={s.label}
              type="button"
              className={i === hi ? styles.ssItemHi : styles.ssItem}
              onMouseEnter={() => setHi(i)}
              onClick={() => accept(i)}
            >
              <span className={styles.ssLabel}>{s.label}</span>
            </button>
          ))}
          <div className={styles.ssFoot}>
            <kbd>Tab</kbd> or <kbd>Enter</kbd> to complete
          </div>
        </div>
      )}
    </div>
  )
}

const MiniLegend = ({ items }: { items: { label: string; color: string }[] }) => (
  <div className={styles.miniLegend}>
    {items.map((it) => (
      <span key={it.label} className={styles.miniLegendItem}>
        <span className={styles.miniDot} style={{ background: it.color }} />
        {it.label}
      </span>
    ))}
  </div>
)

const telemetryMetrics = (svc: string) => {
  const p = svc.replace(/-/g, '_')
  return [
    { type: 'SUM', name: 'observability.usage.trace_count', unit: '{span}' },
    { type: 'SUM', name: 'observability.usage.rows', unit: '{record}' },
    { type: 'SUM', name: 'observability.usage.bytes', unit: 'By' },
    { type: 'SUM', name: `${p}.http.request.count`, unit: '{request}' },
    { type: 'SUM', name: 'observability.usage.error_count', unit: '{span}' },
    { type: 'GAUGE', name: `${p}.http.server.duration`, unit: 'ms' },
    { type: 'SUM', name: `${p}.order.revenue`, unit: 'EUR' },
    { type: 'GAUGE', name: `${p}.runtime.memory.rss`, unit: 'By' },
  ]
}

/* ─── Service Map View ─── */
/* Échantillon d'appels déterministe pour une dépendance : le proto n'a pas de
   donnée par-appel, on fabrique une liste réaliste et stable au re-render
   (seed = from>to, pas de Math.random pour éviter tout flicker). */
const CALL_ROUTES = [
  '/api/order', '/api/menu', '/api/login', '/api/orders/:id', '/api/admin/orders',
  '/api/payment/capture', '/api/session', '/api/cart/items', '/api/checkout',
  '/api/user/profile', '/api/inventory', '/api/notify',
]
const CALL_METHODS = ['GET', 'GET', 'GET', 'POST', 'POST', 'PATCH', 'DELETE']
const sampleEdgeCalls = (edge: { from: string; to: string }, count: number) => {
  const seed = `${edge.from}>${edge.to}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const rnd = (n: number) => {
    let x = (h ^ ((n + 1) * 2654435761)) >>> 0
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return ((x >>> 0) % 100000) / 100000
  }
  return Array.from({ length: count }, (_, i) => {
    const method = CALL_METHODS[Math.floor(rnd(i * 4) * CALL_METHODS.length)]
    const route = CALL_ROUTES[Math.floor(rnd(i * 4 + 1) * CALL_ROUTES.length)]
    const ms = 1 + Math.floor(rnd(i * 4 + 2) * 320)
    const r = rnd(i * 4 + 3)
    const status = r < 0.05 ? 500 : r < 0.1 ? 404 : 200
    const total = 8 * 3600 + 11 * 60 + 35 - i * 7
    const hh = Math.floor(total / 3600)
    const mm = Math.floor((total % 3600) / 60)
    const ss = ((total % 60) + 60) % 60
    const ts = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    return { key: `${seed}-${i}`, ts, msg: `${method} ${route} ${status} · ${ms}ms` }
  })
}

/* ─── Service map: React Flow (inspiré dash0 : nœuds colorés par santé,
   flux orientés animés, layout Flow gauche→droite ou Force organique) ─── */
type SvcHealth = 'healthy' | 'warn' | 'critical'
type SvcMetric = 'requests' | 'errors' | 'duration'

const HEALTH_COLOR: Record<SvcHealth, string> = {
  healthy: 'var(--color-success, #12b76a)',
  warn: '#f2b338',
  critical: 'var(--color-error, #e0372e)',
}
const HEALTH_LABEL: Record<SvcHealth, string> = {
  healthy: 'Healthy',
  warn: 'Degraded',
  critical: 'Unhealthy',
}
// Santé = pire des deux dimensions : taux d'erreur (seuils fixes 0.5 / 1.5 %)
// et durée moyenne vs seuils configurables (Configure > Status thresholds).
const healthOf = (s: ServiceNode, warnMs: number, critMs: number): SvcHealth => {
  const e = parseFloat(s.err) || 0
  const errSev = e >= 1.5 ? 2 : e >= 0.5 ? 1 : 0
  const dur = parseFloat(s.lat) || 0
  const durSev = critMs > 0 && dur >= critMs ? 2 : warnMs > 0 && dur >= warnMs ? 1 : 0
  const sev = Math.max(errSev, durSev)
  return sev === 2 ? 'critical' : sev === 1 ? 'warn' : 'healthy'
}

// Magnitude numérique d'une métrique, pour la barre "sized by metric".
const rpsNum = (s: string) => (parseFloat(s) || 0) * (/k/i.test(s) ? 1000 : 1)
const metricNum = (s: ServiceNode, m: SvcMetric) =>
  m === 'requests' ? rpsNum(s.rps) : m === 'errors' ? parseFloat(s.err) || 0 : parseFloat(s.lat) || 0

const METRIC_META: Record<SvcMetric, { label: string; get: (s: ServiceNode) => string }> = {
  requests: { label: 'req/s', get: (s) => s.rps },
  errors: { label: 'errors', get: (s) => s.err },
  duration: { label: 'avg', get: (s) => s.lat },
}

// Positions : Force = layout organique fourni (x/y en %), Flow = colonnes par
// profondeur (plus long chemin depuis les racines), lecture gauche → droite.
const SVC_CANVAS_W = 1040
const SVC_CANVAS_H = 600
const ORGANIC_POS: Record<string, { x: number; y: number }> = Object.fromEntries(
  ALL_SERVICES.map((s) => [s.id, { x: (s.x / 100) * SVC_CANVAS_W, y: (s.y / 100) * SVC_CANVAS_H }]),
)
const CIRCULAR_POS: Record<string, { x: number; y: number }> = (() => {
  const n = ALL_SERVICES.length
  // Rayon dimensionné pour que la corde entre 2 nœuds voisins dépasse la
  // largeur d'une carte (~190px) + marge, sinon les cartes se chevauchent.
  const r = Math.max(320, (240 * n) / (2 * Math.PI))
  const cx = r + 120
  const cy = r + 120
  const pos: Record<string, { x: number; y: number }> = {}
  ALL_SERVICES.forEach((s, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2
    pos[s.id] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
  return pos
})()

type SvcNodeData = {
  label: string
  svcColor: string
  health: SvcHealth
  metricVal: string
  metricLabel: string
  secondary: { k: string; v: string }[]
  io: { out: number; in: number }
  barPct: number
  selected: boolean
  dim: boolean
}

function ServiceFlowNode({ data }: NodeProps) {
  const d = data as unknown as SvcNodeData
  const hc = HEALTH_COLOR[d.health]
  return (
    <div
      className={styles.rfNode}
      data-selected={d.selected ? 'true' : undefined}
      data-dim={d.dim ? 'true' : undefined}
    >
      <Handle type="target" position={Position.Left} className={styles.rfHandle} isConnectable={false} />
      <div className={styles.rfNodeHead}>
        <span className={styles.rfDot} style={{ background: hc }} title={HEALTH_LABEL[d.health]} />
        <span className={styles.rfNodeName}>{d.label}</span>
      </div>
      <div className={styles.rfMetricRow}>
        <span className={styles.rfMetricVal}>{d.metricVal}</span>
        <span className={styles.rfMetricLbl}>{d.metricLabel}</span>
      </div>
      <div className={styles.rfBar}>
        <span style={{ width: `${d.barPct}%`, background: hc }} />
      </div>
      <div className={styles.rfSecondary}>
        {d.secondary.map((x) => (
          <span key={x.k}>
            <span className={styles.mono}>{x.v}</span> {x.k}
          </span>
        ))}
      </div>
      <div className={styles.rfConn}>
        {d.io.out > 0 && <span>↑{d.io.out} out</span>}
        {d.io.in > 0 && <span>↓{d.io.in} in</span>}
      </div>
      <Handle type="source" position={Position.Right} className={styles.rfHandle} isConnectable={false} />
    </div>
  )
}

// ─ Floating edge : relie les bords des deux cartes (intersection centre→centre),
//   pour que le tracé reste propre dans les deux layouts. Basé sur l'exemple xyflow.
function nodeCenterIntersection(
  intersectionNode: ReturnType<typeof useInternalNode>,
  targetNode: ReturnType<typeof useInternalNode>,
) {
  const iw = intersectionNode!.measured?.width ?? 200
  const ih = intersectionNode!.measured?.height ?? 120
  const ip = intersectionNode!.internals.positionAbsolute
  const tp = targetNode!.internals.positionAbsolute
  const tw = targetNode!.measured?.width ?? 200
  const th = targetNode!.measured?.height ?? 120
  const w = iw / 2
  const h = ih / 2
  const x2 = ip.x + w
  const y2 = ip.y + h
  const x1 = tp.x + tw / 2
  const y1 = tp.y + th / 2
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h)
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h)
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1)
  const xf = a * xx1
  const yf = a * yy1
  return { x: w * (xf + yf) + x2, y: h * (-xf + yf) + y2 }
}
function edgeSide(node: ReturnType<typeof useInternalNode>, px: number, py: number): Position {
  const nx = node!.internals.positionAbsolute.x
  const ny = node!.internals.positionAbsolute.y
  const w = node!.measured?.width ?? 200
  const h = node!.measured?.height ?? 120
  const x = Math.round(px)
  const y = Math.round(py)
  if (x <= Math.round(nx) + 1) return Position.Left
  if (x >= Math.round(nx + w) - 1) return Position.Right
  if (y <= Math.round(ny) + 1) return Position.Top
  return Position.Bottom
}

type SvcEdgeData = {
  label: string
  dim: boolean
  danger: boolean
  onOpen: () => void
}

function FloatingEdge({ id, source, target, markerEnd, data }: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode) return null
  const d = data as unknown as SvcEdgeData
  const sInt = nodeCenterIntersection(sourceNode, targetNode)
  const tInt = nodeCenterIntersection(targetNode, sourceNode)
  const [path, labelX, labelY] = getBezierPath({
    sourceX: sInt.x,
    sourceY: sInt.y,
    targetX: tInt.x,
    targetY: tInt.y,
    sourcePosition: edgeSide(sourceNode, sInt.x, sInt.y),
    targetPosition: edgeSide(targetNode, tInt.x, tInt.y),
  })
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: d.dim ? '#e4e7ec' : d.danger ? 'var(--color-error, #e0372e)' : '#c4cbd4',
          strokeWidth: d.danger ? 2.25 : 1.75,
        }}
      />
      <EdgeLabelRenderer>
        <div
          data-svcedge
          className={styles.rfEdgeLabel}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            opacity: d.dim ? 0.35 : 1,
          }}
          onClick={(ev) => {
            ev.stopPropagation()
            d.onOpen()
          }}
          title="View calls & logs for this dependency"
        >
          {d.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const svcNodeTypes = { service: ServiceFlowNode }
const svcEdgeTypes = { floating: FloatingEdge }

// Ligne du popover Display (label + Select), calquée sur le composant
// LabelWithSelect de la Realtime status (produit).
function DisplayRow({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  value: string | number
  options: { label: string | number; value: string | number }[]
  onChange: (v: string | number) => void
}) {
  return (
    <Flex align="center" justify="space-between" style={{ width: '100%' }}>
      <Flex align="center" gap={2}>
        <Icon size={13} color="var(--color-text-secondary)" />
        <Text size="sm" weight="medium" color="primary">
          {label}
        </Text>
      </Flex>
      <Select size="s" value={value} options={options} onChange={onChange} minWidth="130px" width="130px" />
    </Flex>
  )
}

type ServiceMapProps = {
  onGoToLogs: (svc: string) => void
  onGoToTraces: (svc: string) => void
  /** Connecté sans télémétrie : canvas vide, pas de faux services. */
  empty?: boolean
}

const ServiceMapInner = ({ onGoToLogs, onGoToTraces, empty }: ServiceMapProps) => {
  const SERVICES = empty ? [] : ALL_SERVICES
  const EDGES = empty ? [] : ALL_EDGES
  const LOGS = empty ? [] : ALL_LOGS
  const PODS = empty ? [] : ALL_PODS
  const K8S_DEPLOYMENTS = empty ? [] : ALL_K8S_DEPLOYMENTS
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(SERVICES[0]?.id ?? null)
  const [drawerSvc, setDrawerSvc] = useState<ServiceNode | null>(null)
  const [drawerEdge, setDrawerEdge] = useState<(typeof EDGES)[number] | null>(null)
  const [edgeTab, setEdgeTab] = useState('calls')
  const [svcTab, setSvcTab] = useState('overview')
  // Filtre local des logs affichés dans le drawer service (level + recherche).
  const [drawerLevel, setDrawerLevel] = useState('all')
  const [drawerLogQ, setDrawerLogQ] = useState('')
  const [metric, setMetric] = useState<SvcMetric>('duration')
  const [layout, setLayout] = useState<'force' | 'circular'>('force')
  const [edgeLabel, setEdgeLabel] = useState<'calls' | 'latency'>('calls')
  const [warnMs, setWarnMs] = useState(300)
  const [critMs, setCritMs] = useState(1000)
  const [highlightErrors, setHighlightErrors] = useState(true)
  const [displayOpen, setDisplayOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const byId = (id: string) => SERVICES.find((s) => s.id === id)!
  const rf = useReactFlow()

  // Données d'un nœud pour la métrique / recherche / sélection courantes.
  const buildNodeData = (s: ServiceNode): SvcNodeData => {
    const maxMetric = Math.max(...SERVICES.map((x) => metricNum(x, metric))) || 1
    const others = (['requests', 'errors', 'duration'] as SvcMetric[]).filter((m) => m !== metric)
    return {
      label: s.label,
      svcColor: s.color,
      health: healthOf(s, warnMs, critMs),
      metricVal: METRIC_META[metric].get(s),
      metricLabel: METRIC_META[metric].label,
      secondary: others.map((m) => ({ k: METRIC_META[m].label, v: METRIC_META[m].get(s) })),
      io: {
        out: EDGES.filter((e) => e.from === s.id).length,
        in: EDGES.filter((e) => e.to === s.id).length,
      },
      barPct: Math.round((metricNum(s, metric) / maxMetric) * 100),
      selected: selected === s.id,
      dim: false,
    }
  }

  const buildNodes = (lay: 'force' | 'circular'): FlowNode[] => {
    const pos = lay === 'circular' ? CIRCULAR_POS : ORGANIC_POS
    return SERVICES.map((s) => ({
      id: s.id,
      type: 'service',
      position: { ...pos[s.id] },
      data: buildNodeData(s) as unknown as Record<string, unknown>,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }))
  }

  const buildEdges = (): FlowEdge[] =>
    EDGES.map((e, i) => {
      const danger = highlightErrors && (parseFloat(byId(e.to).err) || 0) >= 1
      return {
        id: `e${i}`,
        source: e.from,
        target: e.to,
        type: 'floating',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: danger ? 'var(--color-error, #e0372e)' : '#98a2b3',
          width: 16,
          height: 16,
        },
        data: {
          label: edgeLabel === 'latency' ? e.lat : `${e.calls} calls`,
          dim: false,
          danger,
          onOpen: () => {
            setDrawerEdge(e)
            setEdgeTab('calls')
          },
        } as unknown as Record<string, unknown>,
      }
    })

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(buildNodes('force'))
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(buildEdges())

  // Changement de layout → repositionne et recadre.
  useEffect(() => {
    setNodes(buildNodes(layout))
    const t = setTimeout(() => rf.fitView({ padding: 0.2, duration: 350 }), 60)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  // Métrique / recherche / sélection → rafraîchit les data, garde les positions.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: buildNodeData(byId(n.id)) as unknown as Record<string, unknown> })),
    )
    setEdges(buildEdges())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, selected, warnMs, critMs, edgeLabel, highlightErrors])

  const openService = (id: string) => {
    setSelected(id)
    setDrawerSvc(byId(id))
    setSvcTab('overview')
    setDrawerLevel('all')
    setDrawerLogQ('')
  }

  return (
    <>
      <div className={styles.searchRow}>
        <div className={styles.filterGroup} style={{ marginLeft: 0 }}>
          <Select
            options={[
              { label: 'Last 5 min', value: '5m' },
              { label: 'Last 15 min', value: '15m' },
              { label: 'Last 1 hour', value: '1h' },
            ]}
            defaultValue="15m"
            icon={IconTimer}
            minWidth="140px"
          />
          <Dropdown
            open={displayOpen}
            onOpenChange={setDisplayOpen}
            rootClassName={styles.displayDropdown}
            placement="bottomLeft"
            menu={{
              items: [
                {
                  key: 'display',
                  disabled: true,
                  label: (
                    <div className={styles.displayPop}>
                      <div className={styles.displayModes}>
                        <div
                          className={layout === 'force' ? `${styles.modeBtn} ${styles.modeActive}` : styles.modeBtn}
                          onClick={() => setLayout('force')}
                        >
                          <Share2 size={16} color={layout === 'force' ? 'var(--color-primary)' : 'var(--color-text-primary)'} />
                          <span className={styles.modeLabel}>Force</span>
                        </div>
                        <div
                          className={layout === 'circular' ? `${styles.modeBtn} ${styles.modeActive}` : styles.modeBtn}
                          onClick={() => setLayout('circular')}
                        >
                          <Orbit size={16} color={layout === 'circular' ? 'var(--color-primary)' : 'var(--color-text-primary)'} />
                          <span className={styles.modeLabel}>Circular</span>
                        </div>
                      </div>
                      <div className={styles.displayDivider} />
                      <DisplayRow
                        icon={IconActivity}
                        label="Node metric"
                        value={metric}
                        options={[
                          { label: 'Duration', value: 'duration' },
                          { label: 'Requests', value: 'requests' },
                          { label: 'Errors', value: 'errors' },
                        ]}
                        onChange={(v) => setMetric(v as SvcMetric)}
                      />
                      <div className={styles.displayField}>
                        <DisplayRow
                          icon={IconListFilter}
                          label="Edge label"
                          value={edgeLabel}
                          options={[
                            { label: 'Calls', value: 'calls' },
                            { label: 'Latency', value: 'latency' },
                          ]}
                          onChange={(v) => setEdgeLabel(v as 'calls' | 'latency')}
                        />
                        <p className={styles.displayHint}>Show call volume or average latency on each edge.</p>
                      </div>
                      <div className={styles.displayDivider} />
                      <div className={styles.displayField}>
                        <span className={styles.displayGroupLabel}>Status thresholds</span>
                        <p className={styles.displayHint}>Degraded past the first threshold, unhealthy past the second (avg duration).</p>
                        <div className={styles.threshRow}>
                          <Flex align="center" gap={2}>
                            <IconGauge size={13} color="var(--color-text-secondary)" />
                            <Text size="sm" weight="medium" color="primary">
                              Degraded (ms)
                            </Text>
                          </Flex>
                          <Input
                            type="number"
                            size="s"
                            width="120px"
                            value={String(warnMs)}
                            onChange={(e) => setWarnMs(Number(e.target.value) || 0)}
                          />
                        </div>
                        <div className={styles.threshRow}>
                          <Flex align="center" gap={2}>
                            <IconAlertTriangle size={13} color="var(--color-text-secondary)" />
                            <Text size="sm" weight="medium" color="primary">
                              Unhealthy (ms)
                            </Text>
                          </Flex>
                          <Input
                            type="number"
                            size="s"
                            width="120px"
                            value={String(critMs)}
                            onChange={(e) => setCritMs(Number(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className={styles.displayDivider} />
                      <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                        <Text size="sm" weight="medium" color="primary">
                          Highlight error paths
                        </Text>
                        <Toggle value={highlightErrors} onChange={setHighlightErrors} />
                      </Flex>
                    </div>
                  ),
                },
              ],
            }}
          >
            <Button
              color="secondary" onClick={() => setDisplayOpen(true)}
            >
              <Button.Icon icon={IconSlidersHorizontal} />
              Display
            </Button>
          </Dropdown>
        </div>
      </div>

      <div
        data-anchor="svcmap:canvas"
        className={fullscreen ? `${styles.svcFlowWrap} ${styles.svcFlowFull}` : styles.svcFlowWrap}
      >
        {empty ? (
          // Un canvas vide ne dit rien : sans service, on annonce ce qui manque.
          <div className={styles.svcFlowEmpty}>
            <EmptyState
              icon={<IconNetwork color="var(--color-text-secondary)" />}
              text="No service map yet"
              description="The map draws itself from your traces. As soon as your services export spans, their dependencies appear here."
            />
          </div>
        ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={svcNodeTypes}
          edgeTypes={svcEdgeTypes}
          onNodeClick={(_e, n) => openService(n.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          elementsSelectable
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1.6} color="#d5d9e0" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            style={{ width: 132, height: 84 }}
            nodeColor={(n) => HEALTH_COLOR[(n.data as unknown as SvcNodeData).health] ?? '#c4cbd4'}
            nodeStrokeWidth={2}
            maskColor="rgba(16,24,40,0.06)"
          />
          <Panel position="top-right">
            <button
              className={styles.rfIconBtn}
              onClick={() => setFullscreen((f) => !f)}
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </Panel>
          <Panel position="top-left">
            <div className={styles.rfLegend}>
              {(['healthy', 'warn', 'critical'] as SvcHealth[]).map((h) => (
                <span key={h}>
                  <span className={styles.rfLegendDot} style={{ background: HEALTH_COLOR[h] }} />
                  {HEALTH_LABEL[h]}
                </span>
              ))}
            </div>
          </Panel>
        </ReactFlow>
        )}
      </div>

      {/* Service detail drawer */}
      <Drawer
        open={!!drawerSvc}
        onClose={() => setDrawerSvc(null)}
        title={drawerSvc ? `Service: ${drawerSvc.label}` : ''}
        width={640}
      >
        {drawerSvc &&
          (() => {
            const s = drawerSvc
            const inbound = EDGES.filter((e) => e.to === s.id).length
            const outbound = EDGES.filter((e) => e.from === s.id).length
            const logs = LOGS.filter((l) => l.svc === s.label)
            const dq = drawerLogQ.trim().toLowerCase()
            const dLogs = logs.filter(
              (l) =>
                (drawerLevel === 'all' || l.level === drawerLevel) &&
                (dq === '' || `${l.msg} ${l.level}`.toLowerCase().includes(dq)),
            )
            const filtering = drawerLevel !== 'all' || dq !== ''
            const red = serviceRedPanels(s)
            return (
              <>
                <Tabs
                  tabs={[
                    { key: 'overview', label: 'Overview' },
                    { key: 'red', label: 'RED' },
                    { key: 'telemetry', label: 'Telemetry' },
                  ]}
                  activeKey={svcTab}
                  onChange={setSvcTab}
                />

                {svcTab === 'overview' && (
                  <>
                    <div className={styles.metricGrid}>
                      <div className={styles.metricCell}><span className={styles.detailStatLabel}>Spans</span><span className={styles.detailStatValue}>{s.spans.toLocaleString()}</span></div>
                      <div className={styles.metricCell}><span className={styles.detailStatLabel}>Inbound</span><span className={styles.detailStatValue}>{inbound}</span></div>
                      <div className={styles.metricCell}><span className={styles.detailStatLabel}>Outbound</span><span className={styles.detailStatValue}>{outbound}</span></div>
                      <div className={styles.metricCell}><span className={styles.detailStatLabel}>Requests/sec</span><span className={styles.detailStatValue}>{s.rps}</span></div>
                      <div className={styles.metricCell}><span className={styles.detailStatLabel}>Error rate</span><span className={styles.detailStatValue}>{s.err}</span></div>
                      <div className={styles.metricCell}><span className={styles.detailStatLabel}>Duration avg</span><span className={styles.detailStatValue}>{s.lat}</span></div>
                    </div>

                    <div className={styles.tlSection}>
                      Recent logs ({filtering ? `${dLogs.length} of ${logs.length}` : logs.length})
                    </div>
                    {logs.length > 0 && (
                      <div className={styles.svcLogFilter}>
                        <div className={styles.searchFlex}>
                          <SearchInput value={drawerLogQ} onChange={setDrawerLogQ} placeholder="Filter these logs..." fullwidth />
                        </div>
                        <Select
                          options={[
                            { label: 'All levels', value: 'all' },
                            { label: 'Error', value: 'error' },
                            { label: 'Warning', value: 'warn' },
                            { label: 'Info', value: 'info' },
                            { label: 'Debug', value: 'debug' },
                          ]}
                          value={drawerLevel}
                          onChange={(value) => setDrawerLevel(value)}
                          icon={IconFilter}
                          minWidth="120px"
                        />
                      </div>
                    )}
                    {logs.length === 0 ? (
                      <div className={styles.svcEmpty}>No recent logs for this service.</div>
                    ) : dLogs.length === 0 ? (
                      <div className={styles.svcEmpty}>No logs match this filter.</div>
                    ) : (
                      dLogs.map((l) => (
                        <div key={l.key} className={styles.svcLogRow}>
                          <span className={styles.svcLogTime}>{l.ts.slice(11, 19)}</span>
                          <SeverityTag level={l.level} />
                          <span className={styles.svcLogMsg}>{l.msg}</span>
                        </div>
                      ))
                    )}
                  </>
                )}

                {svcTab === 'red' && (
                  <div className={styles.redStack}>
                    <div>
                      <div className={styles.overviewTitle}>Requests <span>Count</span></div>
                      <MiniLineChart panel={red.requests} height={120} />
                    </div>
                    <div>
                      <div className={styles.overviewTitle}>Errors <span>Count</span></div>
                      <MiniLineChart panel={red.errors} height={120} />
                    </div>
                    <div>
                      <div className={styles.overviewTitle}>Duration <span>ms</span></div>
                      <MiniLineChart panel={red.duration} height={120} />
                    </div>
                  </div>
                )}

                {svcTab === 'telemetry' && (
                  <div className={styles.telemetryStack}>
                    <div>
                      <div className={styles.overviewTitle}>Spans <span>{s.spans.toLocaleString()} spans</span></div>
                      <TelemetrySpans />
                      <MiniLegend items={[{ label: 'Error', color: '#e0372e' }, { label: 'OK & unset', color: '#98a2b3' }]} />
                    </div>
                    <div>
                      <div className={styles.overviewTitle}>Logs <span>{logs.length} entries</span></div>
                      <TelemetryLogs />
                      <MiniLegend items={[{ label: 'Error & fatal', color: '#e0372e' }, { label: 'Warning', color: '#f2b338' }, { label: 'Info', color: '#7B9F7F' }, { label: 'Trace & debug', color: '#98a2b3' }]} />
                    </div>
                    <div>
                      <div className={styles.overviewTitle}>Metrics <span>26 discovered</span></div>
                      <div className={styles.metricsTable}>
                        <div className={styles.metricsHead}>
                          <span>Type</span><span>Metric name</span><span>Unit</span>
                        </div>
                        {telemetryMetrics(s.label).map((m) => (
                          <div key={m.name} className={styles.metricsRow}>
                            <span><Tag color="orange" size="sm" smallPadding>{m.type}</Tag></span>
                            <span className={styles.mono}>{m.name}</span>
                            <span className={styles.mono}>{m.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rebond vers la vue complète, pré-filtrée sur ce service.
                    On ne refait pas de moteur de filtre dans le drawer : on
                    envoie vers Logs / Traces qui savent déjà filtrer. */}
                <div className={styles.svcGoToRow}>
                  <Button
                    color="secondary" size="s" onClick={() => onGoToLogs(s.label)}
                  >
                    View logs
                    <Button.Icon icon={ArrowUpRight} />
                  </Button>
                  <Button
                    color="secondary" size="s" onClick={() => onGoToTraces(s.label)}
                  >
                    View traces
                    <Button.Icon icon={ArrowUpRight} />
                  </Button>
                </div>
              </>
            )
          })()}
      </Drawer>

      {/* Dependency (edge) detail drawer, calls & logs de la dépendance */}
      <Drawer
        open={!!drawerEdge}
        onClose={() => setDrawerEdge(null)}
        title={drawerEdge ? `${byId(drawerEdge.from).label} → ${byId(drawerEdge.to).label}` : ''}
        width={560}
        className={styles.edgeDrawer}
      >
        {drawerEdge &&
          (() => {
            const e = drawerEdge
            const from = byId(e.from)
            const to = byId(e.to)
            const logs = LOGS.filter((l) => l.svc === from.label || l.svc === to.label)
            const callRows = sampleEdgeCalls(e, Math.min(20, e.calls))
            return (
              <>
                <Tabs
                  type="card"
                  activeKey={edgeTab}
                  onChange={setEdgeTab}
                  tabs={[
                    {
                      key: 'calls',
                      label: `Calls (${e.calls.toLocaleString()})`,
                      children: (
                        <div className={styles.edgeTabBody}>
                          <div className={styles.svcSampleNote}>
                            {callRows.length} most recent of {e.calls.toLocaleString()} calls
                          </div>
                          {callRows.map((c) => (
                            <div key={c.key} className={styles.svcLogRow}>
                              <span className={styles.svcLogTime}>{c.ts}</span>
                              <span className={styles.svcLogMsg}>{c.msg}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'logs',
                      label: `Logs (${logs.length})`,
                      children: (
                        <div className={styles.edgeTabBody}>
                          {logs.length === 0 ? (
                            <div className={styles.svcEmpty}>No recent logs for this dependency.</div>
                          ) : (
                            logs.map((l) => (
                              <div key={l.key} className={styles.svcLogRow}>
                                <span className={styles.svcLogTime}>{l.ts.slice(11, 19)}</span>
                                <SeverityTag level={l.level} />
                                <span className={styles.svcLogMsg}>{l.msg}</span>
                              </div>
                            ))
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </>
            )
          })()}
      </Drawer>
    </>
  )
}

// useReactFlow() a besoin du provider : on enveloppe l'inner.
const ServiceMapView = (props: ServiceMapProps) => (
  <ReactFlowProvider>
    <ServiceMapInner {...props} />
  </ReactFlowProvider>
)

/* ─── Kubernetes View ─── */
const RESTART_WARN = 5

type Health = 'success' | 'warning' | 'failed'
const HEALTH_DOT: Record<Health, string> = {
  success: 'var(--color-success, #1fae7e)',
  warning: '#f2b338',
  failed: 'var(--color-error, #e0372e)',
}

const podHealth = (p: { status: PodPhase; restarts: number }): Health =>
  p.status === 'CrashLoopBackOff' || p.status === 'Failed' || p.status === 'Pending'
    ? 'failed'
    : p.restarts >= RESTART_WARN
      ? 'warning'
      : 'success'

/* Phase pod -> couleur StatusTag DS. */
const phaseColor = (s: PodPhase): 'success' | 'info' | 'warning' | 'failed' =>
  s === 'Running' ? 'success' : s === 'Succeeded' ? 'info' : s === 'Pending' ? 'warning' : 'failed'

/* Pire santé des pods d'un namespace (pour le point sur la chip). */
const nsHealth = (n: string): Health => {
  const hs = ALL_PODS.filter((p) => p.ns === n).map(podHealth)
  return hs.includes('failed') ? 'failed' : hs.includes('warning') ? 'warning' : 'success'
}

const fmtMem = (v: number) => (v >= 1024 ? `${(v / 1024).toFixed(1)}Gi` : `${v}Mi`)

/* Palette catégorielle stable (par index de déploiement) pour les barres. */
const DEPLOY_COLORS = ['#c2477e', '#ed7846', '#06b6d4', '#a855f7', '#e0372e', '#1fae7e', '#3b82f6', '#f2b338']
const deployColor = (name: string) => {
  const i = ALL_K8S_DEPLOYMENTS.findIndex((d) => d.name === name)
  return DEPLOY_COLORS[(i < 0 ? 0 : i) % DEPLOY_COLORS.length]
}

/* Request by deployment - réutilise le style .sigRow de "Usage by signal". */
const DeployBars = ({ metric, showZero, empty }: { metric: 'cpu' | 'mem'; showZero: boolean; empty?: boolean }) => {
  const K8S_DEPLOYMENTS = empty ? [] : ALL_K8S_DEPLOYMENTS
  const valOf = (d: DeployResource) => (metric === 'cpu' ? d.cpuReq : d.memReq)
  const rows = [...K8S_DEPLOYMENTS].sort((a, b) => valOf(b) - valOf(a)).filter((d) => showZero || valOf(d) > 0)
  const max = Math.max(1, ...rows.map(valOf))
  const total = Math.max(1, K8S_DEPLOYMENTS.reduce((s, d) => s + valOf(d), 0))
  const fmt = (v: number) => (metric === 'cpu' ? `${v}m` : fmtMem(v))
  const hidden = K8S_DEPLOYMENTS.length - rows.length
  return (
    <>
      {rows.map((d) => {
        const v = valOf(d)
        const sp = (v / total) * 100
        return (
          <div key={d.name} className={styles.sigRow}>
            <div className={styles.sigHead}>
              <span className={styles.sigName}><span className={styles.sigDot} style={{ background: deployColor(d.name) }} />{d.name}</span>
              <span className={styles.sigVals}><b>{fmt(v)}</b> <span className={styles.detailLabel}>{sp.toFixed(0)}%</span></span>
            </div>
            <div className={styles.sigTrack}><div className={styles.sigFill} style={{ width: `${Math.max((v / max) * 100, 2)}%`, background: deployColor(d.name) }} /></div>
          </div>
        )
      })}
      {hidden > 0 && <div className={styles.cardSub} style={{ marginTop: 4 }}>{hidden} deployments with no request hidden</div>}
    </>
  )
}

/* ─── Connect data (OTLP onboarding / no-data state) ───
 * Parcours en 3 étapes dans une card : infos de connexion, émission de la clé
 * SUR PLACE, exporter. La clé émise remplit le snippet affiché, donc plus rien
 * à fabriquer à la main et rien à aller chercher sur une autre page. Le statut
 * "listening" + la sonde curl donnent le retour qui manquait : on sait si ça a
 * marché sans partir cliquer dans la nav.
 * La promesse d'en-tête est spécifique à la page où on a atterri (GATE_PROMISE). */
/** Au-delà de ce délai sans rien recevoir, on arrête de dire « ça arrive » et on
 *  envoie vers les causes probables. */
const WAIT_NUDGE_MS = 90_000

const fmtWait = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}

const OtlpOnboardingView = ({
  freshKey,
  keyExists,
  quiet,
  onIssue,
}: {
  /** Clé émise à l'instant, donc encore affichable en clair. */
  freshKey: string | null
  /** Une clé existe déjà mais n'est plus affichable (état où on revient plus tard). */
  keyExists: boolean
  /** Aucun bandeau d'état au-dessus : la card porte alors la pastille d'écoute. */
  quiet: boolean
  onIssue: () => void
}) => {
  const [confirmNew, setConfirmNew] = useState(false)
  const openDocs = () => toast.success('Opening the setup guide')
  return (
    <div className={styles.otlpOnboard}>
      <Card className={styles.otlpCard}>
        <Card.Content>
          <div className={styles.otlpHead}>
            <div className={styles.otlpHeadMain}>
              <div className={styles.otlpHeadTitle}>Connect your first source</div>
              <p className={styles.otlpHeadSub}>
                Point your services at Kapptivate with OpenTelemetry and your logs, traces and
                metrics show up on their own, no refresh needed.
              </p>
            </div>
            {quiet && (
              <span className={styles.otlpListening}>
                <span className={styles.otlpPulse} />
                Listening for data
              </span>
            )}
          </div>

          <ol className={styles.otlpSteps}>
            <li className={styles.otlpStep}>
              <span className={styles.otlpStepNum}>1</span>
              <div className={styles.otlpStepBody}>
                <div className={styles.otlpStepTitle}>Get your connection details</div>
                <div className={styles.otlpStepHint}>These are unique to this workspace. You'll send OTLP over HTTP.</div>
                <div className={styles.otlpKv}>
                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label>Ingestion endpoint</label>
                    <Input value={OTLP_ENDPOINT_HTTP} canCopy mono disabled fullWidth size="m" />
                  </div>
                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label>Internal ID</label>
                    <Input value={OTLP_INTERNAL_ID} canCopy mono disabled fullWidth size="m" />
                  </div>
                </div>
              </div>
            </li>

            <li className={styles.otlpStep}>
              <span className={styles.otlpStepNum}>2</span>
              <div className={styles.otlpStepBody}>
                <div className={styles.otlpStepTitle}>Issue an ingestion key</div>
                <div className={styles.otlpStepHint}>
                  Your Internal ID is the username of the Basic auth pair, this key is the
                  password. It is shown once, here, then only its prefix.
                </div>
                {freshKey ? (
                  <>
                    <div className={styles.field} style={{ marginBottom: 0 }}>
                      <label>Ingestion key</label>
                      <Input value={freshKey} canCopy mono disabled fullWidth size="m" />
                    </div>
                    <div className={styles.otlpKeyNote}>
                      <IconAlertTriangle size={13} />
                      Copy it now, it won't be shown again. Issuing a new one revokes this key immediately.
                    </div>
                    <div className={styles.otlpKeyActions}>
                      <Button color="secondary" size="s" onClick={() => setConfirmNew(true)}>
                        <Button.Icon icon={RefreshCw} />
                        Issue a new key
                      </Button>
                    </div>
                  </>
                ) : keyExists ? (
                  <>
                    <div className={styles.field} style={{ marginBottom: 0 }}>
                      <label>Ingestion key</label>
                      <Input value={OTLP_KEY_MASKED} mono disabled fullWidth size="m" />
                    </div>
                    <div className={styles.otlpKeyNote}>
                      <IconAlertTriangle size={13} />
                      A key already exists. Keys are only shown when created, so this one can't be
                      displayed again. Issue a new one if you don't have it.
                    </div>
                    <div className={styles.otlpKeyActions}>
                      <Button color="secondary" size="s" onClick={() => setConfirmNew(true)}>
                        <Button.Icon icon={RefreshCw} />
                        Issue a new key
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button onClick={onIssue}>
                    <Button.Icon icon={KeyRound} />
                    Generate key
                  </Button>
                )}
              </div>
            </li>

            <li className={styles.otlpStep}>
              <span className={styles.otlpStepNum}>3</span>
              <div className={styles.otlpStepBody}>
                <div className={styles.otlpStepTitle}>Point your services at Kapptivate</div>
                <div className={styles.otlpStepHint}>
                  Do the ones that apply to you, not all of them.{' '}
                  {freshKey
                    ? 'The credentials below are already built from your key, paste them as is.'
                    : keyExists
                      ? 'Your existing key cannot be displayed, so issue a new one above to fill these in.'
                      : 'There is nothing to encode by hand: the credential is built for you as soon as you issue a key above.'}
                </div>
                <Collapse
                  classNames={styles.otlpPlatforms}
                  defaultActiveKey={['collector']}
                  items={OTLP_PLATFORMS.map((pf) => ({
                    key: pf.key,
                    label: pf.label,
                    children: (
                      <>
                        <div className={styles.otlpStepHint}>{OTLP_PLATFORM_HINT[pf.key]}</div>
                        <CodeBlock
                          className={styles.otlpCodeBlock}
                          code={otlpSnippet(pf.key, freshKey)}
                          language={pf.key === 'collector' ? 'yaml' : 'sh'}
                        />
                      </>
                    ),
                  }))}
                />
              </div>
            </li>

            <li className={styles.otlpStep}>
              <span className={styles.otlpStepNum}>4</span>
              <div className={styles.otlpStepBody}>
                <div className={styles.otlpStepTitle}>
                  Add cluster telemetry{' '}
                  <Tag color="grey" size="xxs" smallPadding>Optional</Tag>
                </div>
                <div className={styles.otlpStepHint}>
                  Only on Kubernetes, and only once your services export their own telemetry. The
                  chart installs a per-node agent and a cluster collector, so node and pod metrics,
                  pod logs and cluster events reach the same endpoint. Your credentials land in a
                  chart-managed Secret.
                </div>
                <CodeBlock className={styles.otlpCodeBlock} code={otlpK8sSnippet(freshKey)} language="sh" />
              </div>
            </li>
          </ol>

          <div className={styles.otlpFoot}>
            <Collapse
              ghost
              expandIconPosition="start"
              classNames={styles.otlpTrouble}
              items={[
                {
                  key: 'trouble',
                  label: 'Nothing arriving after a couple of minutes?',
                  children: (
                    <>
                      <ul className={styles.troubleList}>
                        <li>
                          The exporter has to speak OTLP over HTTP with{' '}
                          <code className={styles.mono}>http/protobuf</code>, not gRPC.
                        </li>
                        <li>
                          Point it at the base endpoint. The SDK appends{' '}
                          <code className={styles.mono}>/v1/traces</code>,{' '}
                          <code className={styles.mono}>/v1/logs</code> and{' '}
                          <code className={styles.mono}>/v1/metrics</code> on its own.
                        </li>
                        <li>
                          Check that nothing on the way out strips the{' '}
                          <code className={styles.mono}>Authorization</code> header.
                        </li>
                      </ul>
                      <div className={styles.otlpProbeHint}>
                        Or probe it from your terminal. A 2xx means we accepted the payload, so
                        the credential and the network path are fine.
                      </div>
                      <CodeBlock className={styles.otlpCodeBlock} code={otlpTestCurl(freshKey)} language="sh" />
                    </>
                  ),
                },
              ]}
            />
            <div className={styles.otlpDocs}>
              <Button color="secondary" size="s" onClick={openDocs}>
                Read the setup guide
                <Button.Icon icon={ArrowUpRight} />
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Alert open={confirmNew} onCancel={() => setConfirmNew(false)}>
        <Alert.Title>Issue a new key?</Alert.Title>
        <Alert.Description>
          If you issue a new key, the current one stops working immediately. Every collector using
          the old key will start getting 401s until you roll out the new one.
        </Alert.Description>
        <Alert.Cancel>Cancel</Alert.Cancel>
        <Alert.Action
          danger
          onClick={() => {
            setConfirmNew(false)
            onIssue()
          }}
        >
          Issue new key
        </Alert.Action>
      </Alert>
    </div>
  )
}

/* ─── Metrics ───
 * Catalogue des métriques OTLP du workspace. Ce que la vraie page ne fait pas et
 * qu'on corrige ici : l'unité est LISIBLE (25 GB, pas 25000000000), chaque ligne
 * montre déjà sa forme (sparkline) pour ne pas avoir à ouvrir 100 drawers, le
 * type n'est pas en bleu, et la liste comme les graphes couvrent la MÊME plage
 * (le vrai produit annonce en petit que les deux divergent, ce qui est un piège).
 */
const METRIC_TONE: Record<MetricType, 'dark-green' | 'green' | 'orange'> = {
  gauge: 'dark-green',
  sum: 'green',
  histogram: 'orange',
}

const metricPanel = (m: MetricEntry, rate = false): PanelSpecFull => {
  const raw = rate ? metricRate(m) : metricPoints(m)
  const unit = rate ? rateUnit(m.unit) : m.unit
  const pts = raw.map((v) => (v === null ? null : Math.round(v * 1000) / 1000))
  const nums = pts.filter((v): v is number => v !== null)
  const max = Math.max(...nums, 0)
  // Enveloppe min/max : la dispersion du bucket. Une moyenne seule laisse croire
  // à une valeur stable, c'est ce que fait l'aire claire du vrai produit.
  const band = {
    lo: pts.map((v) => (v === null ? null : Math.round(v * 0.55 * 1000) / 1000)),
    hi: pts.map((v) => (v === null ? null : Math.round(v * 1.35 * 1000) / 1000)),
  }
  return {
    id: `metric_${m.key}${rate ? '_rate' : ''}`,
    ...makePanel({
      name: m.name,
      unit,
      series: [{ name: m.name, color: svcColor(m.service), points: pts, band }],
      yMin: 0,
      yMax: Math.max(1, Math.ceil(max * 1.5)),
      yTicks: 5,
      yFmt: (v: number) => fmtMetric(v, unit),
      xLabels: X_LABELS['24h'],
    }),
  }
}

const MetricsView = ({
  search,
  setSearch,
  empty,
}: {
  search: string
  setSearch: (v: string) => void
  empty?: boolean
}) => {
  const METRICS = empty ? [] : ALL_METRICS
  const totals = empty
    ? { total: 0, gauge: 0, sum: 0, histogram: 0 }
    : METRIC_TOTALS
  const [typeFilterOpen, setTypeFilterOpen] = useState(false)
  const [type, setType] = useState('')
  const [svcFilter, setSvcFilter] = useState('')
  const [svcFilterOpen, setSvcFilterOpen] = useState(false)
  const [detail, setDetail] = useState<MetricEntry | null>(null)
  // Compteur cumulatif : on l'affiche en taux par seconde, seul mode qui informe.
  const [rate, setRate] = useState(false)

  const q = search.trim().toLowerCase()
  // `type:gauge` tapé dans la recherche vaut le filtre de colonne : une seule
  // grammaire, deux façons de l'exprimer.
  const typed = /type:(gauge|sum|histogram)/.exec(q)?.[1]
  const svcTyped = /service:([\w-]+)/.exec(q)?.[1]
  const free = q.replace(/(type|service):[\w-]+/g, '').trim()
  const types = type.split(',').filter(Boolean)
  const svcs = svcFilter.split(',').filter(Boolean)
  const filtered = METRICS.filter(
    (m) =>
      (types.length === 0 || types.includes(m.type)) &&
      (svcs.length === 0 || svcs.includes(m.service)) &&
      (!typed || m.type === typed) &&
      (!svcTyped || m.service === svcTyped) &&
      (free === '' || `${m.name} ${m.service} ${m.unit}`.toLowerCase().includes(free)),
  )

  const cols = [
    {
      // « Name » ne dit pas de quoi : chaque ligne EST une metrique.
      title: 'Metric',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <span className={styles.mono}>{v}</span>,
    },
    {
      title: (
        <span className={styles.logHeadFilter}>
          Service
          <Popover
            trigger="click"
            placement="bottomLeft"
            noPadding
            open={svcFilterOpen}
            setOpen={setSvcFilterOpen}
            content={
              <div className={styles.filterMenu}>
                <TableFilter
                  selectedFilters={svcFilter}
                  setFilter={setSvcFilter}
                  items={[...new Set(ALL_METRICS.map((m) => m.service))].map((sv) => ({
                    label: sv,
                    key: sv,
                    icon: <span className={styles.miniDot} style={{ background: svcColor(sv) }} />,
                  }))}
                />
              </div>
            }
          >
            <button
              type="button"
              className={svcs.length === 0 ? styles.headFilterBtn : styles.headFilterBtnOn}
              aria-label="Filter by service"
            >
              <IconListFilter size={13} />
            </button>
          </Popover>
        </span>
      ),
      dataIndex: 'service',
      key: 'service',
      width: 190,
      // Même couleur de service que sur les traces et la service map.
      render: (v: string) => (
        <span className={styles.metricSvc}>
          <span className={styles.miniDot} style={{ background: svcColor(v) }} />
          <span className={styles.mono}>{v}</span>
        </span>
      ),
    },
    {
      // Le filtre vit dans l'entête de SA colonne, comme sur les logs et les traces.
      title: (
        <span className={styles.logHeadFilter}>
          Type
          <Popover
            trigger="click"
            placement="bottomLeft"
            noPadding
            open={typeFilterOpen}
            setOpen={setTypeFilterOpen}
            content={
              <div className={styles.filterMenu}>
              <TableFilter
                selectedFilters={type}
                setFilter={setType}
                items={[
                  { label: 'gauge', key: 'gauge', icon: <span className={styles.miniDot} style={{ background: '#1C4A47' }} /> },
                  { label: 'sum', key: 'sum', icon: <span className={styles.miniDot} style={{ background: '#12b76a' }} /> },
                  { label: 'histogram', key: 'histogram', icon: <span className={styles.miniDot} style={{ background: '#ED7846' }} /> },
                ]}
              />
              </div>
            }
          >
            <button
              type="button"
              className={types.length === 0 ? styles.headFilterBtn : styles.headFilterBtnOn}
              aria-label="Filter by type"
            >
              <IconListFilter size={13} />
            </button>
          </Popover>
        </span>
      ),
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (v: MetricType) => (
        <Tag color={METRIC_TONE[v]} mono smallPadding size="xs">
          {v}
        </Tag>
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 90,
      render: (v: string) => <span className={styles.metricUnit}>{v}</span>,
    },
    {
      title: 'Last value',
      key: 'last',
      width: 120,
      render: (_v: unknown, m: MetricEntry) => {
        const pts = metricPoints(m)
        return <span className={styles.metricLast}>{fmtMetric(pts[pts.length - 1], m.unit)}</span>
      },
    },
    {
      title: 'Change',
      key: 'trend',
      width: 130,
      // Une variation se compare et se trie d'une ligne à l'autre, une courbe de
      // 96px non : la forme, elle, vit dans le drawer où elle a de la place.
      render: (_v: unknown, m: MetricEntry) => {
        const t = metricTrend(m)
        return <TrendTag current={t.cur} previous={t.prev} invertColor={m.unit === 'ms'} />
      },
    },
  ]

  return (
    <>
      <div className={styles.kpiRow}>
        <CounterCardGroup>
          <CounterCard title="Metrics" value={String(totals.total)} />
          <CounterCard title="Gauges" value={String(totals.gauge)} />
          <CounterCard title="Sums" value={String(totals.sum)} />
          <CounterCard title="Histograms" value={String(totals.histogram)} />
        </CounterCardGroup>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SmartSearch
            value={search}
            onChange={setSearch}
            placeholder="Search metrics, e.g. type:gauge service:demo-site"
            schema={{
              type: ['gauge', 'sum', 'histogram'],
              service: ['demo-site', 'payment-service', 'postgres', 'rabbitmq', 'obs-agent'],
            }}
          />
        </div>
      </div>

      <div className={styles.resultBar}>
        <span className={styles.resultCount}>
          <span>
            Showing {filtered.length} of {totals.total} metrics
          </span>
        </span>
      </div>

      {/* Le Table du DS reste monté avec son propre état vide (prop emptyState) :
          l'entête et ses filtres restent accessibles même à zéro résultat. */}
      <div className={styles.metricTable}>
      <Table
        rowKey="key"
        columns={cols}
        data={filtered}
        showHeader
        compact
        emptyState={{
          icon: <IconGauge color="var(--color-text-secondary)" />,
          text: empty ? 'No metrics yet' : 'No metrics match your filters',
          description: empty
            ? 'Metrics appear here as soon as your services or the Kubernetes agent start emitting them.'
            : 'Try a broader search, or clear the type and service filters in the header.',
        }}
        onClickRow={(m: MetricEntry) => {
          setDetail(m)
          setRate(isCumulative(m))
        }}
      />
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} width={720} title={detail?.name ?? ''}>
        {detail && (
          <div className={styles.metricDrawer}>
            <div className={styles.metricTags}>
              <Tag color={METRIC_TONE[detail.type]} mono smallPadding size="xs">
                {detail.type}
              </Tag>
              <Tag mono smallPadding size="xs">
                {detail.unit}
              </Tag>
              <span className={styles.metricSvc}>
                <span className={styles.miniDot} style={{ background: svcColor(detail.service) }} />
                <span className={styles.mono}>{detail.service}</span>
              </span>
            </div>
            {/* Les stats d'abord : sans elles, une courbe seule ne répond à rien. */}
            <CounterCardGroup>
              {(() => {
                // Les statistiques décrivent ce qui est affiché : en mode taux,
                // elles parlent en taux, sinon elles mentiraient sur le graphe.
                const pts = (rate ? metricRate(detail) : metricPoints(detail)).filter(
                  (v): v is number => v !== null,
                )
                const u = rate ? rateUnit(detail.unit) : detail.unit
                const last = pts[pts.length - 1]
                const min = Math.min(...pts)
                const max = Math.max(...pts)
                const avg = pts.reduce((a, b) => a + b, 0) / pts.length
                return (
                  <>
                    <CounterCard title="Last" value={fmtMetric(last, u)} />
                    <CounterCard title="Min" value={fmtMetric(min, u)} />
                    <CounterCard title="Max" value={fmtMetric(max, u)} />
                    <CounterCard title="Avg" value={fmtMetric(avg, u)} />
                  </>
                )
              })()}
            </CounterCardGroup>
            <Card className={`${styles.overviewCard} ${styles.drawerCard}`}>
              <div className={styles.overviewTitle}>
                <span>
                  {detail.name}
                  {detail.unit ? ` (${rate ? rateUnit(detail.unit) : detail.unit})` : ''}
                </span>
                {/* Un compteur cumulatif se lit en pente : on propose les deux
                    lectures, sur la carte qu'elles changent. */}
                {isCumulative(detail) && (
                  <Segmented<'total' | 'rate'>
                    value={rate ? 'rate' : 'total'}
                    onChange={(v) => setRate(v === 'rate')}
                    options={[
                      { label: 'Total', value: 'total' },
                      { label: 'Rate (per second)', value: 'rate' },
                    ]}
                  />
                )}
              </div>
              <div className={styles.metricChart}>
                <LineChart panel={metricPanel(detail, rate)} height={240} />
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  )
}

/* ─── État vide d'une page télémétrie avant le setup ───
 * Un seul écran porte le guide (Ingestion). Ici, chaque page dit ce qui lui
 * manque à elle, en une ligne, et propose la seule action qui débloque tout.
 * Répéter le guide sous 5 titres différents donnait 5 fois la même page. */
const GATE_ICON: Partial<Record<ExploreTab, ComponentType<{ color?: string }>>> = {
  logs: IconFile,
  traces: IconBookOpen,
  metrics: IconGauge,
  perses: IconGlobe,
  svcmap: IconNetwork,
  k8s: IconWrench,
}
const GATE_TITLE: Partial<Record<ExploreTab, string>> = {
  logs: 'No logs yet',
  traces: 'No traces yet',
  metrics: 'No metrics yet',
  perses: 'No trace data yet',
  svcmap: 'No service map yet',
  k8s: 'No cluster data yet',
}

/* La vraie vue est rendue derrière, atténuée et inerte, avec un fondu vers le bas :
 * on ne DÉCRIT plus ce qu'on obtiendra, on le montre. Le geste reste unique et
 * mène au seul écran de setup. Étiqueté "Sample data" pour ne jamais faire croire
 * que ces chiffres sont les siens. */
/* Bande d'état pleine largeur, façon bandeau applicatif du produit : 50px de
 * haut, fond de couleur, texte blanc, action à droite. Sert sur les pages
 * Explore, où la page reste lisible et vide dessous. */
const StateBand = ({
  tone,
  icon,
  text,
  action,
}: {
  tone: 'success' | 'waiting' | 'warning'
  icon: React.ReactNode
  text: string
  action?: React.ReactNode
}) => (
  <Flex
    align="center"
    justify="space-between"
    gap={5}
    className={styles.stateBand}
    style={{ background: BAND_BG[tone] }}
  >
    <Flex align="center" justify="start" gap={5}>
      {icon}
      <Text size="sm" weight="medium" color="white">
        {text}
      </Text>
    </Flex>
    {action}
  </Flex>
)

const BAND_BG: Record<'success' | 'waiting' | 'warning', string> = {
  success: 'var(--color-success, #12b76a)',
  waiting: '#285c59',
  warning: 'var(--color-warning, #f2b338)',
}

const GatePreview = ({
  tab,
  connected,
  onSetup,
  children,
}: {
  tab: ExploreTab
  /** Déjà connecté mais sans télémétrie : l'action n'est plus « brancher ». */
  connected: boolean
  onSetup: () => void
  children: React.ReactNode
}) => {
  const Icon = GATE_ICON[tab] ?? IconFile
  return (
    <div className={styles.gatePrev}>
      <div className={styles.gatePrevGhost} aria-hidden>
        {children}
      </div>
      <div className={styles.gatePrevOver}>
        <div className={styles.gatePrevCard}>
          <Tag color="grey" size="xxs" smallPadding>Sample data</Tag>
          <div className={styles.gatePrevIcon}>
            <Icon color="var(--color-text-secondary)" />
          </div>
          <div className={styles.gatePrevTitle}>{GATE_TITLE[tab] ?? 'Nothing here yet'}</div>
          <p className={styles.gatePrevSub}>{GATE_PROMISE[tab]}</p>
          <div className={styles.gatePrevAction}>
            <Button color="primary" onClick={onSetup}>
              {connected ? 'Check your setup' : 'Connect your data'}
            </Button>
          </div>
          <div className={styles.gatePrevCost}>
            {connected
              ? 'Your exporter reached us, but sent no telemetry yet.'
              : 'One command, about two minutes.'}
          </div>
        </div>
      </div>
    </div>
  )
}

const KubernetesView = ({ empty }: { empty?: boolean }) => {
  const PODS = empty ? [] : ALL_PODS
  const K8S_NAMESPACES = empty ? [] : ALL_K8S_NAMESPACES
  const K8S_DEPLOYMENTS = empty ? [] : ALL_K8S_DEPLOYMENTS
  const K8S_CLUSTER = empty
    ? { cpuUsedMilli: 0, cpuPct: 0, cpuRequestMilli: 0, cpuMaxMilli: 0, memUsedMi: 0, memPct: 0, memRequestMi: 0, memMaxMi: 0 }
    : ALL_K8S_CLUSTER
  const [ns, setNs] = useState<string>('all')
  const [onlyUnhealthy, setOnlyUnhealthy] = useState(false)
  const [showZero, setShowZero] = useState(false)

  const runningCount = PODS.filter((p) => p.status === 'Running').length
  const doneCount = PODS.filter((p) => p.status === 'Succeeded').length
  const elevated = PODS.filter((p) => podHealth(p) !== 'success')
  const restarters = PODS.filter((p) => p.restarts > 0).sort((a, b) => b.restarts - a.restarts)
  const maxRestart = elevated.length ? Math.max(...elevated.map((p) => p.restarts)) : 0

  // namespaces : les moins sains d'abord (triage)
  const rank: Record<Health, number> = { failed: 0, warning: 1, success: 2 }
  const orderedNs = [...K8S_NAMESPACES].sort((a, b) => rank[nsHealth(a)] - rank[nsHealth(b)])
  const shownNs = ns === 'all' ? orderedNs : [ns]
  const podsOf = (n: string) =>
    PODS.filter((p) => p.ns === n)
      .filter((p) => !onlyUnhealthy || podHealth(p) !== 'success')
      .sort((a, b) => (a.status === 'Running' ? 1 : 0) - (b.status === 'Running' ? 1 : 0) || b.restarts - a.restarts)

  const restartCols = [
    {
      title: 'Pod', dataIndex: 'name', key: 'name',
      render: (v: string, r: PodEntry) => (
        <span className={styles.alertName}><span className={styles.sevDot} style={{ background: HEALTH_DOT[podHealth(r)] }} /><span className={styles.mono}>{v}</span></span>
      ),
    },
    { title: 'Namespace', dataIndex: 'ns', key: 'ns', width: 230, render: (v: string) => <Tag mono>{v}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 130, render: (v: PodPhase) => <StatusTag variant="ghost" color={phaseColor(v)}>{v}</StatusTag> },
    { title: 'Restarts', dataIndex: 'restarts', key: 'restarts', width: 120, render: (v: number) => <StatusTag variant="ghost" color={v >= RESTART_WARN ? 'warning' : 'info'}>{String(v)}</StatusTag> },
  ]

  return (
    <div className={styles.usageStack}>
      {/* Lecture cluster en clair + saut vers les pods à problème (esprit kubeli) */}
      {elevated.length > 0 && (
        <Banner
          variant="warning"
        >
          <Banner.Icon><IconAlertTriangle size={18} /></Banner.Icon>
          <Banner.Description>{`${elevated.length} pods are restarting repeatedly`}</Banner.Description>
          <Banner.SubDescription>
            <>
              cert-manager, the OpenTelemetry operator and the rabbitmq operators keep crash-looping (up to <b>{maxRestart} restarts</b>). CPU and memory usage sit well below requests, so this is a stability issue, not capacity.
            </>
          </Banner.SubDescription>
          <Banner.Aside><Button color="secondary" size="s" onClick={() => { setOnlyUnhealthy(true); setNs('all') }}>View unhealthy pods</Button></Banner.Aside>
        </Banner>
      )}

      {/* Santé cluster en un coup d'oeil (remplace les jauges quasi vides) */}
      <CounterCardGroup>
        <CounterCard title="Pods running" value={`${runningCount} / ${PODS.length}`} trend={<StatusTag variant="ghost" color="success">{`${doneCount} completed`}</StatusTag>} />
        <CounterCard title="Restarting pods" value={String(elevated.length)} trend={<StatusTag variant="ghost" color={elevated.length ? 'warning' : 'success'}>{elevated.length ? 'needs attention' : 'stable'}</StatusTag>} />
        <CounterCard title="CPU usage" value={`${K8S_CLUSTER.cpuUsedMilli}m`} trend={<StatusTag variant="ghost" color="success">{`${K8S_CLUSTER.cpuPct}% of request`}</StatusTag>} />
        <CounterCard title="Memory usage" value={fmtMem(K8S_CLUSTER.memUsedMi)} trend={<StatusTag variant="ghost" color="success">{`${K8S_CLUSTER.memPct}% of request`}</StatusTag>} />
      </CounterCardGroup>

      {/* Pod map orientée santé */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconBox} />Pod map</Card.Header.Title>
          <Card.Header.Aside><Toggle title="Only unhealthy" value={onlyUnhealthy} onChange={setOnlyUnhealthy} /></Card.Header.Aside>
        </Card.Header>
        <Card.Content>
          <div className={styles.usageCardBody}>
            <div className={styles.nsChips}>
              <button className={ns === 'all' ? styles.nsChipActive : styles.nsChip} onClick={() => setNs('all')}>All</button>
              {orderedNs.map((n) => (
                <button key={n} className={ns === n ? styles.nsChipActive : styles.nsChip} onClick={() => setNs(n)}>
                  <span className={styles.nsDot} style={{ background: HEALTH_DOT[nsHealth(n)] }} />
                  {n}
                </button>
              ))}
            </div>
            <div className={styles.nsGroups}>
              {shownNs.map((n) => {
                const pods = podsOf(n)
                if (!pods.length) return null
                return (
                  <div key={n} className={styles.nsGroup}>
                    <div className={styles.nsGroupHead}>{n}<span className={styles.nsGroupCount}>{pods.length}</span></div>
                    <div className={styles.podGrid}>
                      {pods.map((p) => (
                        <div key={p.key} className={styles.podCard} style={{ ['--pod-accent' as string]: HEALTH_DOT[podHealth(p)] }}>
                          <div className={styles.podName} title={p.name}>{p.name}</div>
                          <div className={styles.podMeta}>
                            <StatusTag variant="ghost" color={phaseColor(p.status)}>{p.status}</StatusTag>
                            {p.restarts > 0 && <StatusTag variant="ghost" color={p.restarts >= RESTART_WARN ? 'warning' : 'info'}>{`${p.restarts} restarts`}</StatusTag>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {shownNs.every((n) => podsOf(n).length === 0) && (
                <div className={styles.cardSub}>No unhealthy pods in this scope.</div>
              )}
            </div>
            <div className={styles.podSummary}>{PODS.length} pods across {K8S_NAMESPACES.length} namespaces</div>
          </div>
        </Card.Content>
      </Card>

      {/* Pods qui restartent le plus (remplace la courbe de moyenne, illisible) */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconActivity} />Pods by restart count</Card.Header.Title>
          <Card.Header.Aside><span className={styles.cardSub}>Click a row to filter the pod map</span></Card.Header.Aside>
        </Card.Header>
        <Card.Content>
          <div className={styles.usageCardBody}>
            {empty ? (
              // Le « No result found » du Table parle de filtres : ici il n'y a pas
              // de données du tout, ce n'est pas la même chose.
              <div className={styles.emptyBlock}>
                <EmptyState
                  icon={<IconActivity color="var(--color-text-secondary)" />}
                  text="No pods yet"
                  description="Restart counts appear once the Kubernetes agent starts reporting."
                />
              </div>
            ) : (
              <Table rowKey="key" columns={restartCols} data={restarters} showHeader onClickRow={(r: PodEntry) => { setOnlyUnhealthy(false); setNs(r.ns) }} />
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Usage vs request */}
      <div className={styles.kRow2}>
        <Card className={styles.usageCard}>
          <Card.Header>
            <Card.Header.Title><Card.Header.Icon icon={IconGauge} />CPU usage vs request</Card.Header.Title>
          </Card.Header>
          <Card.Content><div className={styles.usageCardBody}><LineChart panel={empty ? emptyPanel(K8S_CPU_PANEL) : K8S_CPU_PANEL} height={220} /></div></Card.Content>
        </Card>
        <Card className={styles.usageCard}>
          <Card.Header>
            <Card.Header.Title><Card.Header.Icon icon={IconGauge} />Memory usage vs request</Card.Header.Title>
          </Card.Header>
          <Card.Content><div className={styles.usageCardBody}><LineChart panel={empty ? emptyPanel(K8S_MEM_PANEL) : K8S_MEM_PANEL} height={220} /></div></Card.Content>
        </Card>
      </div>

      {/* Request by deployment (déploiements à 0 masqués par défaut) */}
      <div className={styles.kRow2}>
        <Card className={styles.usageCard}>
          <Card.Header>
            <Card.Header.Title><Card.Header.Icon icon={IconBarChartBig} />CPU request by deployment</Card.Header.Title>
            <Card.Header.Aside><Toggle title="Show empty" value={showZero} onChange={setShowZero} /></Card.Header.Aside>
          </Card.Header>
          <Card.Content><div className={styles.usageCardBody}><DeployBars metric="cpu" showZero={showZero} empty={empty} /></div></Card.Content>
        </Card>
        <Card className={styles.usageCard}>
          <Card.Header>
            <Card.Header.Title><Card.Header.Icon icon={IconBarChartBig} />Memory request by deployment</Card.Header.Title>
            <Card.Header.Aside><Toggle title="Show empty" value={showZero} onChange={setShowZero} /></Card.Header.Aside>
          </Card.Header>
          <Card.Content><div className={styles.usageCardBody}><DeployBars metric="mem" showZero={showZero} empty={empty} /></div></Card.Content>
        </Card>
      </div>
    </div>
  )
}

/* ─── Usage & ingestion View ─── */
type Period = '7' | '14' | 'month'
type SignalFilter = 'all' | SignalKey
type KeyState = { status: 'active' | 'revoked' }

const UsageView = ({
  cap,
  setCap,
  quotaOpen,
  setQuotaOpen,
}: {
  cap: number
  setCap: (n: number) => void
  quotaOpen: boolean
  setQuotaOpen: (v: boolean) => void
}) => {
  const LOGS = ALL_LOGS
  const TRACES = ALL_TRACES
  const [period, setPeriod] = useState<Period>('month')
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all')
  const [capDraft, setCapDraft] = useState(String(cap))

  const [retention, setRetention] = useState('standard')
  const [retDraft, setRetDraft] = useState('standard')

  const [keyState, setKeyState] = useState<KeyState>({ status: 'active' })
  const [keyStep, setKeyStep] = useState<'none' | 'issue' | 'reveal' | 'revoke'>('none')
  const [newKey, setNewKey] = useState('')
  const [keyCopied, setKeyCopied] = useState(false)

  const pct = (USAGE_INGESTED_GB / cap) * 100
  const left = cap - USAGE_INGESTED_GB
  const forecast = (USAGE_INGESTED_GB / USAGE_DAY_OF_MONTH) * USAGE_DAYS_IN_MONTH
  const overForecast = forecast > cap
  const status =
    pct >= 95 ? { color: 'failed' as const, label: 'Critical' } : pct >= 80 ? { color: 'warning' as const, label: 'Warning' } : { color: 'success' as const, label: 'Healthy' }

  const totalBytes = SIGNALS.reduce((a, s) => a + s.bytes, 0)

  // chart data
  const days = period === '7' ? 7 : period === '14' ? 14 : DAILY_GB.length
  const slice = DAILY_GB.slice(-days)
  const sig = SIGNALS.find((s) => s.key === signalFilter)
  const series = sig ? slice.map((v) => v * sig.share) : slice
  const showBudget = signalFilter === 'all'
  const chartMax = Math.max(...series, showBudget ? DAILY_BUDGET_GB : 0) * 1.1 || 1

  const revoked = keyState.status === 'revoked'
  const retTier = retention === 'long' ? 'Long-term' : retention === 'extended' ? 'Extended' : 'Standard'

  const saveQuota = () => {
    const n = parseFloat(capDraft)
    if (isNaN(n) || n <= 0) return
    setCap(n)
    setQuotaOpen(false)
    toast.success('Quota updated successfully')
  }

  const issueKey = () => {
    setNewKey(genKey())
    setKeyState({ status: 'active' })
    setKeyCopied(false)
    setKeyStep('reveal')
  }

  return (
    <div className={styles.usageStack}>
      {/* State banner: aligné sur l'expérience AI Usage */}
      {pct >= 80 && (
        <Banner
          variant={pct >= 95 ? 'error' : 'warning'}
        >
          <Banner.Icon><IconAlertTriangle size={18} /></Banner.Icon>
          <Banner.Description>{pct >= 95 ? 'Monthly ingestion quota nearly exhausted' : `${pct.toFixed(0)}% of your monthly ingestion quota used`}</Banner.Description>
          <Banner.SubDescription>
            <>
              At the current rate, your <b>{fmtGB(cap)}</b> monthly quota runs out around{' '}
              <b>day {Math.min(USAGE_DAYS_IN_MONTH, Math.round((cap / USAGE_INGESTED_GB) * USAGE_DAY_OF_MONTH))}</b>. Ingestion keeps working; overage is billed and admins are notified.
            </>
          </Banner.SubDescription>
          <Banner.Aside><Button color="secondary" size="s" onClick={() => setQuotaOpen(true)}>Adjust quota</Button></Banner.Aside>
        </Banner>
      )}

      {/* Quota & consumption */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconBarChartBig} />Quota usage</Card.Header.Title>
          <Card.Header.Aside><StatusTag variant="ghost" color={status.color}>{status.label}</StatusTag></Card.Header.Aside>
        </Card.Header>
        <Card.Content>
          <div data-anchor="usage:quota" className={styles.usageCardBody}>
          <div className={styles.usageHero}>
            <span className={styles.usageHeroNum}>{fmtGB(USAGE_INGESTED_GB)}</span>
            <span className={styles.usageHeroSub}>/ {fmtGB(cap)} included</span>
          </div>
          <div className={styles.k8sBar} style={{ height: 10 }}>
            <div className={styles.k8sBarFill} style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? '#e0372e' : '#ed7846' }} />
          </div>
          <div className={styles.quotaMeta}>
            <span>{pct.toFixed(0)}% of monthly quota used</span>
            <span>{left >= 0 ? `${fmtLeft(left)} left` : `${fmtLeft(left)} over`} · renews Aug 1</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <CounterCardGroup>
              <CounterCard title="Data ingested" value={fmtGB(USAGE_INGESTED_GB)} />
              <CounterCard title="Monthly quota" value={fmtGB(cap)} />
              <CounterCard
                title="End-of-month forecast"
                value={fmtGB(forecast)}
                renderValue={(f) => <span style={{ color: overForecast ? '#e0372e' : undefined }}>{f}</span>}
                trend={
                  <StatusTag variant="ghost" color={overForecast ? 'failed' : 'success'}>{overForecast ? 'over quota' : 'within quota'}</StatusTag>
                }
              />
            </CounterCardGroup>
          </div>
          </div>
        </Card.Content>
      </Card>

      {/* Consumption chart + signal breakdown, side by side (comme AI Usage) */}
      <div className={styles.usageGrid}>
      {/* Daily consumption chart */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconActivity} />Daily consumption</Card.Header.Title>
          <Card.Header.Aside>
            <div className={styles.segRow}>
              <Segmented<SignalFilter>
                size="small"
                value={signalFilter}
                onChange={setSignalFilter}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Metrics', value: 'metrics' },
                  { label: 'Logs', value: 'logs' },
                  { label: 'Traces', value: 'traces' },
                ]}
              />
              <Segmented<Period>
                size="small"
                value={period}
                onChange={setPeriod}
                options={[
                  { label: '7d', value: '7' },
                  { label: '14d', value: '14' },
                  { label: 'Month', value: 'month' },
                ]}
              />
            </div>
          </Card.Header.Aside>
        </Card.Header>
        <Card.Content>
          <div data-anchor="usage:consumption" className={styles.usageCardBody}>
          <div className={styles.cardSub} style={{ marginBottom: 12 }}>Ingested bytes per day vs daily budget · current month (UTC)</div>
          <div className={styles.chart}>
            {showBudget && (
              <div className={styles.chartBudget} style={{ bottom: `${(DAILY_BUDGET_GB / chartMax) * 100}%` }}>
                <span>Daily budget {DAILY_BUDGET_GB} GB</span>
              </div>
            )}
            <div className={styles.chartBars}>
              {series.map((v, i) => {
                const over = showBudget && v > DAILY_BUDGET_GB
                return (
                  <div
                    key={i}
                    className={styles.chartBar}
                    title={`${v.toFixed(2)} GB`}
                    style={{
                      height: `${(v / chartMax) * 100}%`,
                      background: sig ? sig.color : over ? '#ed7846' : '#1fae7e',
                      opacity: over ? 1 : 0.85,
                    }}
                  />
                )
              })}
            </div>
          </div>
          </div>
        </Card.Content>
      </Card>

      {/* Usage by signal */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconLayers} />Usage by signal</Card.Header.Title>
        </Card.Header>
        <Card.Content>
          <div data-anchor="usage:signals" className={styles.usageCardBody}>
          {SIGNALS.map((s) => {
            const sp = (s.bytes / totalBytes) * 100
            return (
              <div key={s.key} className={styles.sigRow}>
                <div className={styles.sigHead}>
                  <span className={styles.sigName}><span className={styles.sigDot} style={{ background: s.color }} />{s.name}</span>
                  <span className={styles.sigVals}><b>{s.size}</b> <span className={styles.detailLabel}>{sp.toFixed(1)}%</span></span>
                </div>
                <div className={styles.sigTrack}><div className={styles.sigFill} style={{ width: `${Math.max(sp, 1)}%`, background: s.color }} /></div>
                <div className={styles.sigMeta}>{s.meta}</div>
              </div>
            )
          })}
          </div>
        </Card.Content>
      </Card>
      </div>

      {/* Connection & OTLP key */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconServer} />OTLP connection & key</Card.Header.Title>
          <Card.Header.Aside><StatusTag variant="ghost" color={revoked ? 'failed' : 'success'}>{revoked ? 'Revoked' : 'Active'}</StatusTag></Card.Header.Aside>
        </Card.Header>
        <Card.Content>
          <div data-anchor="usage:otlp-key" className={styles.usageCardBody}>
          <p className={styles.cardSub} style={{ marginBottom: 12 }}>
            {revoked
              ? 'No active key. Ingestion is disabled until you issue a new one.'
              : 'A single active key secures your OTLP ingestion. Issuing a new key replaces the current one.'}
          </p>
          <div className={styles.field}>
            <label>Ingestion endpoint</label>
            <Input value={OTLP_ENDPOINT_USAGE} canCopy mono disabled fullWidth size="m" />
          </div>
          <div className={styles.field}>
            <label>Internal ID</label>
            <Input value={OTLP_INTERNAL_ID} canCopy mono disabled fullWidth size="m" />
          </div>
          <div className={styles.field}>
            <label>API key</label>
            <Input value={revoked ? '' : OTLP_KEY_MASKED} canCopy={!revoked} mono disabled fullWidth size="m" />
          </div>
          <div className={styles.cardFooter}>
            <Button
              color="primary" onClick={() => setKeyStep('issue')}
            >
              <Button.Icon icon={KeyRound} />
              Issue key
            </Button>
            <Button color="danger-s" disabled={revoked} onClick={() => setKeyStep('revoke')}>Revoke key</Button>
          </div>
          </div>
        </Card.Content>
      </Card>

      {/* Retention */}
      <Card className={styles.usageCard}>
        <Card.Header>
          <Card.Header.Title><Card.Header.Icon icon={IconBox} />Data retention</Card.Header.Title>
          <Card.Header.Aside><StatusTag variant="ghost" color="info">{retTier}</StatusTag></Card.Header.Aside>
        </Card.Header>
        <Card.Content>
          <div data-anchor="usage:retention" className={styles.usageCardBody}>
          <div className={styles.cardSub} style={{ marginBottom: 12 }}>
            How long ingested signals stay queryable. Current tier {RETENTION_LABELS[retention]}.
          </div>
          <div style={{ maxWidth: 360 }}>
            <Select
              fullWidth
              value={retDraft}
              onChange={(_e, v) => setRetDraft(v)}
              options={[
                { label: 'Standard - 15 days', value: 'standard' },
                { label: 'Extended - 30 days', value: 'extended' },
                { label: 'Long-term - 90 days + cold tier', value: 'long' },
              ]}
            />
          </div>
          <div className={styles.cardFooter}>
            <Button
              color="secondary"
              disabled={retDraft === retention}
              onClick={() => {
                setRetention(retDraft)
                toast.success('Retention updated successfully')
              }}
            >
              Save retention
            </Button>
          </div>
          </div>
        </Card.Content>
      </Card>

      {/* Adjust quota modal (triggered from the page header) */}
      <Modal open={quotaOpen} onCancel={() => setQuotaOpen(false)} title="Adjust monthly quota" width={440}>
        <Modal.Content>
          <div className={styles.cardSub} style={{ marginBottom: 14 }}>
            Ingestion keeps working above the cap. You are alerted and billed for overage.
          </div>
          <Input
            label="Monthly cap"
            value={capDraft}
            size="m"
            type="number"
            suffix="GiB"
            onChange={(e) => setCapDraft(e.target.value)}
          />
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFoot}>
            <Button color="invisible" onClick={() => setQuotaOpen(false)}>Cancel</Button>
            <Button color="primary" onClick={saveQuota}>Save quota</Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Issue new key: confirm */}
      <Alert
        open={keyStep === 'issue'}
        onCancel={() => setKeyStep('none')}
      >
        <Alert.Title>Issue a new key?</Alert.Title>
        <Alert.Description>If you issue a new key, the current one stops working immediately. Every collector using the old key will start getting 401s until you roll out the new one.</Alert.Description>
        <Alert.Cancel>Cancel</Alert.Cancel>
        <Alert.Action danger onClick={issueKey}>Issue new key</Alert.Action>
      </Alert>

      {/* Issue new key: reveal once */}
      <Modal open={keyStep === 'reveal'} onCancel={() => setKeyStep('none')} maskClosable={false} title="Your new API key" width={480}>
        <Modal.Content>
          <div className={styles.cardSub} style={{ marginBottom: 12 }}>
            Copy it now. For security it's shown only once and never again.
          </div>
          <Input value={newKey} canCopy mono disabled fullWidth size="m" />
          <div style={{ marginTop: 12 }}>
            <Button
              color="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(newKey)
                setKeyCopied(true)
              }}
            >
              <Button.Icon icon={keyCopied ? Check : Copy} />
              {keyCopied ? 'Copied' : 'Copy key'}
            </Button>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFoot}>
            <Button
              color="primary"
              disabled={!keyCopied}
              onClick={() => {
                setKeyStep('none')
                toast.success('API key issued successfully')
              }}
            >
              {keyCopied ? "I've stored it, done" : 'Copy the key first'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Revoke: confirm */}
      <Alert
        open={keyStep === 'revoke'}
        onCancel={() => setKeyStep('none')}
      >
        <Alert.Title>Revoke key?</Alert.Title>
        <Alert.Description>If you revoke this key, ingestion stops until you issue a new one. This action cannot be undone.</Alert.Description>
        <Alert.Cancel>Keep key</Alert.Cancel>
        <Alert.Action danger onClick={() => {
          setKeyState({ status: 'revoked' })
          setKeyStep('none')
          toast.success('API key revoked successfully')
        }}>Revoke key</Alert.Action>
      </Alert>
    </div>
  )
}

/* ─── Alerting (Alerts / Incidents / Destinations) ─── */
const sevColor = (s: string): 'failed' | 'warning' | 'info' | 'neutral' =>
  s === 'critical' ? 'failed' : s === 'warning' ? 'warning' : s === 'info' ? 'info' : 'neutral'
const sevDotColor = (s: string) =>
  s === 'critical' ? 'var(--color-error, #e0372e)' : s === 'warning' ? '#f2b338' : 'var(--color-accent-blue, #0577ff)'
const alertStatusColor = (s: AlertItem['status']): 'failed' | 'neutral' | 'success' =>
  s === 'firing' ? 'failed' : s === 'silenced' ? 'neutral' : 'success'
const incidentStatusColor = (s: IncidentItem['status']): 'failed' | 'warning' | 'success' =>
  s === 'open' ? 'failed' : s === 'acknowledged' ? 'warning' : 'success'
const opText = (op: string) => ALERT_OPERATORS.find((o) => o.value === op)?.label ?? op
const destTypeLabel = (t: DestinationType) => DESTINATION_TYPES.find((x) => x.value === t)?.label ?? t

const WipView = ({ label }: { label: string }) => (
  <div className={styles.usageStack}>
    <EmptyState
      icon={<IconWrench />}
      text={`${label} - work in progress`}
      description="This view isn't designed yet. It's a placeholder while we shape the flow, not the final version."
    />
  </div>
)

const AlertsView = ({
  alerts,
  destinations,
  onOpen,
}: {
  alerts: AlertItem[]
  destinations: DestinationItem[]
  onOpen: (a: AlertItem) => void
}) => {
  const destName = (k: string) => destinations.find((d) => d.key === k)?.name ?? 'None'
  const columns = [
    {
      title: 'Alert',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r: AlertItem) => (
        <span className={styles.alertName}>
          <span className={styles.sevDot} style={{ background: sevDotColor(r.severity) }} />
          {v}
        </span>
      ),
    },
    { title: 'Signal', dataIndex: 'signal', key: 'signal', width: 90, render: (v: string) => <Tag mono>{v}</Tag> },
    { title: 'Condition', key: 'cond', width: 160, render: (_v: unknown, r: AlertItem) => <span className={styles.mono}>{`count ${opText(r.operator)} ${r.threshold}`}</span> },
    { title: 'Schedule', key: 'sched', width: 200, render: (_v: unknown, r: AlertItem) => <span className={styles.cardSub}>{`every ${r.checkEvery}m · ${r.lookBack}m window`}</span> },
    { title: 'Destination', key: 'dest', render: (_v: unknown, r: AlertItem) => destName(r.destinationKey) },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (v: AlertItem['status']) => <StatusTag variant="ghost" color={alertStatusColor(v)}>{v}</StatusTag> },
    { title: 'Last triggered', dataIndex: 'lastTriggered', key: 'last', width: 130 },
  ]
  return (
    <div className={styles.usageStack}>
      <Table rowKey="key" columns={columns} data={alerts} showHeader onClickRow={onOpen} />
    </div>
  )
}

const IncidentsView = ({
  incidents,
  onOpen,
}: {
  incidents: IncidentItem[]
  onOpen: (i: IncidentItem) => void
}) => {
  const columns = [
    { title: 'Incident', dataIndex: 'title', key: 'title', render: (v: string) => <span className={styles.cellName}>{v}</span> },
    { title: 'Severity', dataIndex: 'severity', key: 'severity', width: 120, render: (v: string) => <span className={styles.sevCell}><span className={styles.sevDot} style={{ background: sevDotColor(v) }} />{v}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 130, render: (v: IncidentItem['status']) => <StatusTag variant="ghost" color={incidentStatusColor(v)}>{v}</StatusTag> },
    { title: 'Service', dataIndex: 'service', key: 'service', width: 150, render: (v: string) => <Tag mono>{v}</Tag> },
    { title: 'Opened', dataIndex: 'openedAt', key: 'openedAt', width: 150, render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 110 },
  ]
  return (
    <div className={styles.usageStack}>
      <Table rowKey="key" columns={columns} data={incidents} showHeader onClickRow={onOpen} />
    </div>
  )
}

const DestinationsView = ({ destinations }: { destinations: DestinationItem[] }) => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string) => <span className={styles.cellName}>{v}</span> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 170, render: (v: DestinationType) => <StatusTag variant="ghost" color="info">{destTypeLabel(v)}</StatusTag> },
    { title: 'Target', dataIndex: 'target', key: 'target', render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Used by', dataIndex: 'usedBy', key: 'usedBy', width: 120, align: 'right' as const, render: (v: number) => `${v} alert${v === 1 ? '' : 's'}` },
  ]
  return (
    <div className={styles.usageStack}>
      <Table rowKey="key" columns={columns} data={destinations} showHeader />
    </div>
  )
}

/* ─── Main Proto ─── */
const ExploreTabsProto = () => {
  const [mode, setMode] = useState<'run' | 'obs'>('obs')
  // Réglage du proto : activée mais vide, ou pleine. L'activation elle-même est
  // notre geste, pas celui du client, et sans elle il n'a pas Explore du tout :
  // rien à démontrer de ce côté.
  // La pilule vit dans le chrome (à côté du fil d'Ariane), pas dans l'UI produit.
  // Persiste via l'URL ?obs=empty (?data=off reste compris, anciens liens).
  const [obsState, setObsState] = useState<ObsState>(() => {
    const q = new URLSearchParams(window.location.search)
    const o = q.get('obs')
    const d = q.get('data')
    if (o === 'connected') return 'connected'
    if (o === 'empty' || d === 'off' || d === 'false' || d === '0') return 'empty'
    return 'live'
  })
  const hasData = obsState === 'live'
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('data')
    if (obsState === 'live') url.searchParams.delete('obs')
    else url.searchParams.set('obs', obsState)
    window.history.replaceState(null, '', url)
  }, [obsState])
  // La promesse du guide, tenue : la première donnée bascule la page toute seule.
  const prevObs = useRef(obsState)
  useEffect(() => {
    if (obsState === 'live' && prevObs.current !== 'live') {
      toast.success('First batch received, your data is live')
    }
    prevObs.current = obsState
  }, [obsState])
  const dataControl = useMemo(
    () => (
      <button
        type="button"
        className={styles.dataPill}
        onClick={() =>
          setObsState((s) => (s === 'empty' ? 'connected' : s === 'connected' ? 'live' : 'empty'))
        }
        title="Proto setting: cycle no data, connected without data, live data"
      >
        <span className={OBS_STATE_DOT[obsState]} />
        {OBS_STATE_LABEL[obsState]}
      </button>
    ),
    [obsState],
  )
  useFrameControls(dataControl)
  // Onglet actif, synchronisé avec l'URL (?tab=…): persiste au refresh, Logs par défaut.
  const [tab, setTab] = useState<ExploreTab>(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    return EXPLORE_TABS.some((x) => x.key === t) ? (t as ExploreTab) : 'logs'
  })
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url)
  }, [tab])
  const [persesHeaderSlot, setPersesHeaderSlot] = useState<HTMLDivElement | null>(null)

  // lifted view state (needed by header actions)
  const [logSearch, setLogSearch] = useState('')
  // Filtres de colonne = multiselect du DS : chaîne de clés séparées par des
  // virgules, et vide veut dire « tout », donc pas d'option « All … » à cocher.
  const [logLevel, setLogLevel] = useState('')
  const [traceSearch, setTraceSearch] = useState('')
  const [traceSvc, setTraceSvc] = useState('')
  const [traceDetail, setTraceDetail] = useState<TraceEntry | null>(null)
  const [logDetail, setLogDetail] = useState<LogEntry | null>(null)

  const [logTab, setLogTab] = useState('body')
  const openLog = (l: LogEntry) => {
    setLogDetail(l)
    setLogTab('body')
  }

  // usage
  const [cap, setCap] = useState(9)
  const [quotaOpen, setQuotaOpen] = useState(false)

  // flows
  const [alertOpen, setAlertOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [connectMethod, setConnectMethod] = useState<'helm' | 'kubectl'>('helm')
  const [clusterName, setClusterName] = useState('')

  const emptyAlert: AlertDraft = { name: '', signal: 'logs', query: '', operator: 'gt', threshold: '', checkEvery: '5', lookBack: '15', cooldown: '15', severity: 'warning', destinationKey: DESTINATIONS[0].key, createsIncident: false }
  const [alertDraft, setAlertDraft] = useState<AlertDraft>(emptyAlert)

  // alerting (mutable mock state)
  const [alerts, setAlerts] = useState<AlertItem[]>(ALERTS)
  const [destinations, setDestinations] = useState<DestinationItem[]>(DESTINATIONS)
  const [incidents, setIncidents] = useState<IncidentItem[]>(INCIDENTS)
  const [alertDetail, setAlertDetail] = useState<AlertItem | null>(null)
  const [incidentDetail, setIncidentDetail] = useState<IncidentItem | null>(null)
  const [destOpen, setDestOpen] = useState(false)
  const [destDraft, setDestDraft] = useState<{ name: string; type: DestinationType; target: string }>({ name: '', type: 'slack', target: '' })

  // Écran courant, à granularité modal / drawer : un commentaire posé sur un
  // modal (Create alert…) ou un drawer s'ancre à cet écran précis, n'apparaît
  // que quand il est ouvert, et le clic depuis l'historique le ré-ouvre.
  const reportedScreen = alertOpen
    ? 'obs:modal:create-alert'
    : quotaOpen
      ? 'obs:modal:adjust-quota'
      : connectOpen
        ? 'obs:modal:connect-cluster'
        : destOpen
          ? 'obs:modal:add-destination'
          : alertDetail
            ? `obs:drawer:alert:${alertDetail.key}`
            : incidentDetail
              ? `obs:drawer:incident:${incidentDetail.key}`
              : logDetail
                ? `obs:log:${logDetail.key}`
                : traceDetail
                  ? `obs:trace:${traceDetail.key}`
                  : `${mode}:${tab}`
  useReportScreen(reportedScreen)

  // Clic sur un commentaire (historique) → rétablit l'écran où il a été posé
  // (onglet + modal/drawer). Ferme d'abord tout, puis ré-ouvre la bonne cible.
  const { pendingScreen, clearPendingScreen } = useScreenNavigation()
  useEffect(() => {
    if (!pendingScreen) return
    const p = pendingScreen
    // Reset des overlays avant de rétablir la cible.
    setAlertOpen(false)
    setQuotaOpen(false)
    setConnectOpen(false)
    setDestOpen(false)
    setLogDetail(null)
    setTraceDetail(null)
    setAlertDetail(null)
    setIncidentDetail(null)
    if (p === 'obs:modal:create-alert') {
      setMode('obs')
      setAlertOpen(true)
    } else if (p === 'obs:modal:adjust-quota') {
      setMode('obs')
      setTab('usage')
      setQuotaOpen(true)
    } else if (p === 'obs:modal:connect-cluster') {
      setMode('obs')
      setTab('k8s')
      setConnectOpen(true)
    } else if (p === 'obs:modal:add-destination') {
      setMode('obs')
      setTab('destinations')
      setDestOpen(true)
    } else if (p.startsWith('obs:drawer:alert:')) {
      const a = alerts.find((x) => x.key === p.slice('obs:drawer:alert:'.length))
      setMode('obs')
      setTab('alerts')
      if (a) setAlertDetail(a)
    } else if (p.startsWith('obs:drawer:incident:')) {
      const inc = incidents.find((x) => x.key === p.slice('obs:drawer:incident:'.length))
      setMode('obs')
      setTab('incidents')
      if (inc) setIncidentDetail(inc)
    } else if (p.startsWith('obs:log:')) {
      const log = ALL_LOGS.find((l) => l.key === p.slice('obs:log:'.length))
      setMode('obs')
      setTab('logs')
      if (log) setLogDetail(log)
    } else if (p.startsWith('obs:trace:')) {
      const tr = ALL_TRACES.find((t) => t.key === p.slice('obs:trace:'.length))
      setMode('obs')
      setTab('traces')
      if (tr) setTraceDetail(tr)
    } else {
      const [m, t] = p.split(':')
      if (m === 'run' || m === 'obs') setMode(m)
      if (EXPLORE_TABS.some((x) => x.key === t)) setTab(t as ExploreTab)
    }
    clearPendingScreen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingScreen, clearPendingScreen])

  // Vues télémétrie : sans data, elles affichent l'empty state à la place de leur contenu.
  const TELEMETRY_TABS: ExploreTab[] = ['logs', 'traces', 'metrics', 'svcmap', 'perses', 'k8s']
  // Une seule destination d'ingestion : sans data, la page Ingestion porte le
  // guide elle aussi (au lieu d'une 2e page de setup), et reste la seule entrée
  // de la nav qui n'est pas atténuée.
  const GATED_TABS: ExploreTab[] = [...TELEMETRY_TABS, 'usage']
  const gatedByData = !hasData && GATED_TABS.includes(tab)
  // Écran de setup : seule vue qui se lit comme une colonne centrée, en-tête incluse.
  const setupScreen = gatedByData && tab === 'usage'

  // Cycle de vie de la clé d'ingestion, porté par le parent pour survivre à la
  // navigation : `ingestKey` = clé encore affichable (vient d'être émise),
  // `keyIssued` = une clé existe. En quittant l'écran, la clé cesse d'être
  // affichable, comme dans le vrai produit : on ne la montre qu'à l'émission.
  // Plages de temps des pages : elles vivent ici parce que le sélecteur est dans
  // l'en-tête de page, à droite du titre, et qu'il porte tout le contenu.
  const [metricSearch, setMetricSearch] = useState('')
  const [logRange, setLogRange] = useState('24h')
  const [traceRange, setTraceRange] = useState('1h')
  // Comparaison de périodes : attribut de la plage, donc piloté depuis l'en-tête.
  const [traceCompare, setTraceCompare] = useState(false)
  const [ingestKey, setIngestKey] = useState<string | null>(null)
  const [keyIssued, setKeyIssued] = useState(false)
  useEffect(() => {
    if (tab !== 'usage' && ingestKey) setIngestKey(null)
  }, [tab, ingestKey])
  const [keyIssuedAt, setKeyIssuedAt] = useState<number | null>(null)
  // Chrono d'attente : démarre à l'émission de la clé, c'est le moment où on sait
  // que l'utilisateur a commencé. Sert au bandeau d'état, en pleine largeur.
  const [waited, setWaited] = useState(0)
  useEffect(() => {
    if (!keyIssuedAt) return
    const tick = () => setWaited(Date.now() - keyIssuedAt)
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [keyIssuedAt])
  const issueIngestKey = () => {
    setIngestKey(genKey())
    setKeyIssued(true)
    setKeyIssuedAt(Date.now())
    toast.success(keyIssued ? 'New ingestion key created successfully' : 'Ingestion key created successfully')
  }
  // On garde le titre de la vue (Logs explorer, etc.) mais on masque ses actions.
  const meta = gatedByData ? { ...PAGE_META[tab], actions: [] } : PAGE_META[tab]

  const toggleSilence = (key: string) => {
    setAlerts((cur) => cur.map((a) => (a.key === key ? { ...a, status: a.status === 'silenced' ? 'active' : 'silenced' } : a)))
    setAlertDetail((d) => (d && d.key === key ? { ...d, status: d.status === 'silenced' ? 'active' : 'silenced' } : d))
    toast.success('Alert updated successfully')
  }
  const deleteAlert = (key: string) => {
    setAlerts((cur) => cur.filter((a) => a.key !== key))
    setAlertDetail(null)
    toast.success('Alert deleted successfully')
  }
  const setIncidentStatus = (key: string, status: IncidentItem['status']) => {
    setIncidents((cur) => cur.map((i) => (i.key === key ? { ...i, status } : i)))
    setIncidentDetail((d) => (d && d.key === key ? { ...d, status } : d))
    toast.success(status === 'resolved' ? 'Incident resolved successfully' : 'Incident acknowledged')
  }
  const addDestination = () => {
    if (!destDraft.name.trim()) {
      toast.error('Enter a name for your destination. Try again.')
      return
    }
    setDestinations((cur) => [{ key: `dst-${Date.now()}`, name: destDraft.name.trim(), type: destDraft.type, target: destDraft.target.trim() || '-', usedBy: 0 }, ...cur])
    setDestOpen(false)
    setDestDraft({ name: '', type: 'slack', target: '' })
    toast.success('Destination added successfully')
  }

  const openAlert = () => {
    // Depuis Logs/Traces : query pré-remplie depuis la vue courante (alert-from-query).
    // Depuis l'onglet Alerts (ou ailleurs) : formulaire vierge.
    if (tab !== 'logs' && tab !== 'traces') {
      setAlertDraft(emptyAlert)
      setAlertOpen(true)
      return
    }
    const signal: 'logs' | 'traces' = tab === 'traces' ? 'traces' : 'logs'
    const query =
      signal === 'traces'
        ? `service:${traceSvc || '*'} ${traceSearch}`.trim()
        : `level:${logLevel || '*'} ${logSearch}`.trim()
    setAlertDraft({ ...emptyAlert, signal, query, name: signal === 'traces' ? 'High trace error rate' : 'High log error rate' })
    setAlertOpen(true)
  }

  const createAlert = () => {
    if (!alertDraft.name.trim()) {
      toast.error("Enter a name for your alert. Try again.")
      return
    }
    const newAlert: AlertItem = {
      key: `al-${Date.now()}`,
      name: alertDraft.name.trim(),
      signal: alertDraft.signal,
      query: alertDraft.query,
      operator: alertDraft.operator,
      threshold: Number(alertDraft.threshold) || 0,
      checkEvery: Number(alertDraft.checkEvery) || 5,
      lookBack: Number(alertDraft.lookBack) || 15,
      cooldown: Number(alertDraft.cooldown) || 0,
      severity: alertDraft.severity,
      destinationKey: alertDraft.destinationKey,
      createsIncident: alertDraft.createsIncident,
      status: 'active',
      lastTriggered: 'Never',
    }
    setAlerts((cur) => [newAlert, ...cur])
    setAlertOpen(false)
    toast.success('Alert created successfully')
  }

  const runAction = (label: string) => {
    switch (label) {
      case 'Export':
        toast.success(`${meta.title} exported successfully`)
        break
      case 'Create alert':
        openAlert()
        break
      case 'Connect cluster':
        setConnectOpen(true)
        break
      case 'Refresh':
        toast.info(`Refreshing ${meta.title.toLowerCase()}…`)
        setTimeout(() => toast.success(`${meta.title} refreshed successfully`), 700)
        break
      case 'Read docs':
        toast.info('Opening documentation')
        break
      case 'Adjust quota':
        setQuotaOpen(true)
        break
      case 'Add destination':
        setDestOpen(true)
        break
      case 'Pin as panel': {
        const spec: PanelSpec =
          tab === 'logs'
            ? {
                name: logSearch.trim() ? `Logs: ${logSearch.trim()}` : 'Log volume',
                unit: 'lines/min',
                queryType: 'clickhouse-sql',
                sql: 'SELECT toStartOfInterval(Timestamp, INTERVAL 60 SECOND) AS t, count() AS value FROM otel_logs\nWHERE Timestamp BETWEEN {from:DateTime64(3)} AND {to:DateTime64(3)}\nGROUP BY t ORDER BY t',
                yMin: 0,
                yMax: 120,
                yTicks: 7,
              }
            : interpretPrompt(traceSearch.trim() || 'spans count').panels[0]
        dashboardStore.addPanel(spec)
        toast.success('Pinned to traces-mirror. Open Traces (Perses)')
        setTab('perses')
        break
      }
      default:
        break
    }
  }

  // État de l'ingestion, une seule source. Deux présentations : bande applicative
  // pleine largeur sur les pages Explore, Banner DS dans la colonne du setup.
  const nudge = waited >= WAIT_NUDGE_MS
  const ingestState:
    | { tone: 'success' | 'waiting' | 'warning'; title: string; sub: string; band: string }
    | null =
    !gatedByData
      ? null
      : obsState === 'connected'
        ? {
            tone: 'success',
            title: "You're connected, no data yet",
            sub: "We're receiving requests from your exporter, so your credentials and your network path are fine. Your logs and traces should arrive within a few minutes.",
            band: "You're connected. We haven't received any data yet, it usually arrives within a few minutes.",
          }
        : keyIssuedAt !== null
          ? nudge
            ? {
                tone: 'warning',
                title: "We still haven't received anything",
                sub: `Nothing has arrived in ${fmtWait(waited)}. Three things explain almost every case where data never shows up, and you can test your credentials with a single command. Both are at the bottom of the setup page.`,
                band: `We still haven't received anything after ${fmtWait(waited)}. Check the usual causes on the setup page.`,
              }
            : {
                tone: 'waiting',
                title: "We're listening for your data",
                sub: `Nothing received in the last ${fmtWait(waited)}. You can leave this page open, it fills in on its own as soon as your data arrives.`,
                band: `We're listening for your data. Nothing received in the last ${fmtWait(waited)}.`,
              }
          : null

  const bandIcon =
    ingestState?.tone === 'success' ? (
      <CheckCircle2 size={16} stroke="white" strokeWidth={1.875} />
    ) : ingestState?.tone === 'warning' ? (
      <IconAlertTriangle size={16} color="white" />
    ) : (
      <span className={styles.otlpWaitIcon}>
        <span className={styles.otlpPulse} />
      </span>
    )

  const renderView = () => {
    if (gatedByData && tab === 'usage') {
      return (
        <OtlpOnboardingView
          freshKey={ingestKey}
          keyExists={keyIssued}
          quiet={ingestState === null}
          onIssue={issueIngestKey}
        />
      )
    }
    const view = renderTabView()
    if (gatedByData) {
      // Connecté : la vue réelle, vide (voir `noData`). Rien à superposer.
      return obsState === 'connected' ? (
        view
      ) : (
        <GatePreview tab={tab} connected={false} onSetup={() => setTab('usage')}>
          {view}
        </GatePreview>
      )
    }
    return view
  }

  // Connecté sans télémétrie : les vues se rendent entières mais sans données.
  const noData = obsState === 'connected'

  const renderTabView = () => {
    switch (tab) {
      case 'logs':
        return <LogsView search={logSearch} setSearch={setLogSearch} level={logLevel} setLevel={setLogLevel} onOpenLog={openLog} onOpenTrace={setTraceDetail} empty={noData} range={logRange} />
      case 'traces':
        return (
          <TracesView
            search={traceSearch}
            setSearch={setTraceSearch}
            svc={traceSvc}
            setSvc={setTraceSvc}
            onOpenTrace={setTraceDetail}
            empty={noData}
            range={traceRange}
          />
        )
      case 'svcmap':
        return (
          <ServiceMapView
            empty={noData}
            onGoToLogs={(svc) => {
              setLogLevel('')
              setLogSearch(svc)
              setTab('logs')
            }}
            onGoToTraces={(svc) => {
              setTraceSearch('')
              setTraceSvc(svc)
              setTab('traces')
            }}
          />
        )
      case 'metrics':
        return <MetricsView search={metricSearch} setSearch={setMetricSearch} empty={noData} />
      case 'k8s':
        return <KubernetesView empty={noData} />
      case 'usage':
        return <UsageView cap={cap} setCap={setCap} quotaOpen={quotaOpen} setQuotaOpen={setQuotaOpen} />
      case 'alerts':
        return <WipView label="Alerts" />
      case 'incidents':
        return <WipView label="Incidents" />
      case 'destinations':
        return <WipView label="Destinations" />
      case 'perses':
        return <PersesView headerSlot={persesHeaderSlot} empty={noData} />
    }
  }

  return (
    <div className={styles.page}>
      <ToastMount />
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img className={styles.brandLogo} src={LOGO_SRC} alt="kapptivate" />
          <span className={styles.collapseBtn}><PanelLeftClose size={18} /></span>
        </div>
        <div className={styles.navSep} />

        <div className={styles.ws}>
          <div className={styles.wsAvatar}>🚀</div>
          <div>
            <div className={styles.wsName}>Rocket Corp</div>
            <div className={styles.wsSub}>Workspace</div>
          </div>
        </div>

        <div className={styles.segmented}>
          <button className={mode === 'run' ? styles.segBtnActive : styles.segBtn} onClick={() => setMode('run')}>
            <IconZap size={12} /> Run
          </button>
          <button className={mode === 'obs' ? styles.segBtnActive : styles.segBtn} onClick={() => setMode('obs')}>
            <IconEye size={12} /> Explore
          </button>
        </div>

        <div className={styles.modeStack}>
          <div className={mode === 'run' ? undefined : styles.hidden}>
            {NAV_RUN.map((section, si) => (
              <div key={section.section}>
                {si > 0 && <div className={styles.navSep} />}
                <div className={styles.navLabel}>{section.section}</div>
                {section.items.map((item) => (
                  <button key={item.key} className={styles.navItem}>
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className={mode === 'obs' ? undefined : styles.hidden}>
            {NAV_EXPLORE.map((section, si) => (
              <div key={section.section}>
                {si > 0 && <div className={styles.navSep} />}
                <div className={styles.navLabel}>{section.section}</div>
                {/* Pas de grisé avant le setup : chaque entrée mène vraiment quelque part
                    (sa promesse + le guide), donc rien ne doit avoir l'air désactivé. */}
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    className={tab === item.key ? styles.navItemActive : styles.navItem}
                    onClick={() => setTab(item.key)}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.spacer} />
        <div className={styles.navSep} />
        <button className={styles.helpBtn}>?</button>
      </aside>

      {/* Content */}
      <div className={styles.content}>
        {ingestState && (
          <StateBand
            tone={ingestState.tone}
            icon={bandIcon}
            text={ingestState.band}
            action={
              tab === 'usage' ? undefined : (
                <Button color="secondary" size="s" onClick={() => setTab('usage')}>
                  {obsState === 'connected' ? 'Check your setup' : 'Open setup'}
                </Button>
              )
            }
          />
        )}
        <div className={tab === 'svcmap' ? `${styles.contentBody} ${styles.contentBodyFill}` : styles.contentBody}>
          <div className={setupScreen ? `${styles.pageHead} ${styles.pageHeadNarrow}` : styles.pageHead}>
            <h1 className={styles.pageTitle}>{meta.title}</h1>
            {tab === 'perses' ? (
              // Le cluster d'actions Perses est téléporté ici depuis PersesView (portal).
              <div className={styles.contentActions} ref={setPersesHeaderSlot} />
            ) : (
              <div className={styles.contentActions}>
                {/* La plage de temps porte TOUT le contenu de la page : elle vit donc
                    dans l'en-tête, à droite du titre, pas dans une carte. */}
                {(tab === 'logs' || tab === 'traces' || tab === 'metrics') && obsState !== 'empty' && (
                  <DateRangePicker
                    size="m"
                    defaultValue={tab === 'logs' ? 3 : 1}
                    options={rangeShortcuts(['15m', '1h', '6h', '24h'])}
                    onChange={(dr) => {
                      if (!dr) return
                      const mins = Math.round(
                        (new Date(dr.end).getTime() - new Date(dr.start).getTime()) / 60_000,
                      )
                      const key = rangeKeyFromMinutes(mins)
                      if (tab === 'logs') setLogRange(key)
                      else if (tab === 'traces') setTraceRange(key)
                    }}
                  />
                )}
                {meta.actions.map((a) => {
                  // Toutes les actions n'ont pas d'icône : le slot Button.Icon en exige
                  // une, donc on ne le rend que s'il y en a.
                  const ActionIcon =
                    a.label === 'Export'
                      ? IconDownload
                      : a.label === 'Create alert'
                        ? Plus
                        : a.label === 'Pin as panel'
                          ? Pin
                          : a.label === 'Refresh'
                            ? RefreshCw
                            : null
                  return (
                    <Button
                      key={a.label}
                      color={a.primary ? 'primary' : 'secondary'}
                      onClick={() => runAction(a.label)}
                    >
                      {ActionIcon && <Button.Icon icon={ActionIcon} />}
                      {a.label}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
          {renderView()}
        </div>
      </div>

      {/* Create alert modal */}
      <Modal open={alertOpen} onCancel={() => setAlertOpen(false)} title="Create alert" width={520}>
        <Modal.Content maxHeight="60vh">
          <div className={styles.field}>
            <label>Alert name</label>
            <Input value={alertDraft.name} size="m" fullWidth onChange={(e) => setAlertDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. High error rate on checkout" />
          </div>
          <div className={styles.field}>
            <label>Signal</label>
            <Segmented<'logs' | 'traces'>
              value={alertDraft.signal}
              onChange={(v) => setAlertDraft((d) => ({ ...d, signal: v }))}
              options={[{ label: 'Logs', value: 'logs' }, { label: 'Traces', value: 'traces' }]}
            />
          </div>
          <div className={styles.field}>
            <label>Query</label>
            <Input value={alertDraft.query} size="m" mono fullWidth onChange={(e) => setAlertDraft((d) => ({ ...d, query: e.target.value }))} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Condition</label>
              <Select
                fullWidth
                value={alertDraft.operator}
                onChange={(_e, v) => setAlertDraft((d) => ({ ...d, operator: v }))}
                options={ALERT_OPERATORS}
              />
            </div>
            <div className={styles.field} style={{ width: 120 }}>
              <label>Threshold</label>
              <Input value={alertDraft.threshold} size="m" type="number" fullWidth onChange={(e) => setAlertDraft((d) => ({ ...d, threshold: e.target.value }))} placeholder="5" />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Check every</label>
              <Select fullWidth value={alertDraft.checkEvery} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, checkEvery: v }))} options={ALERT_FREQUENCIES} />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Look back</label>
              <Select fullWidth value={alertDraft.lookBack} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, lookBack: v }))} options={ALERT_LOOKBACKS} />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Severity</label>
              <Select fullWidth value={alertDraft.severity} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, severity: v }))} options={ALERT_SEVERITIES} />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Destination</label>
              <Select fullWidth value={alertDraft.destinationKey} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, destinationKey: v }))} options={destinations.map((dst) => ({ label: dst.name, value: dst.key }))} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Cooldown</label>
            <Select fullWidth value={alertDraft.cooldown} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, cooldown: v }))} options={ALERT_COOLDOWNS} />
          </div>
          <div className={styles.drawerToggles}>
            <Toggle
              title="Create an incident when this alert fires"
              description="Opens an incident you can acknowledge and resolve, on top of notifying the destination."
              value={alertDraft.createsIncident}
              onChange={(v) => setAlertDraft((d) => ({ ...d, createsIncident: v }))}
            />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFoot}>
            <Button color="invisible" onClick={() => setAlertOpen(false)}>Cancel</Button>
            <Button color="primary" onClick={createAlert}>Create alert</Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Add destination modal */}
      <Modal open={destOpen} onCancel={() => setDestOpen(false)} title="Add destination" width={460}>
        <Modal.Content>
          <div className={styles.field}>
            <label>Name</label>
            <Input value={destDraft.name} size="m" fullWidth onChange={(e) => setDestDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Slack #incidents" />
          </div>
          <div className={styles.field}>
            <label>Type</label>
            <Select fullWidth value={destDraft.type} onChange={(_e, v) => setDestDraft((d) => ({ ...d, type: v as DestinationType }))} options={DESTINATION_TYPES} />
          </div>
          <div className={styles.field}>
            <label>Target</label>
            <Input value={destDraft.target} size="m" mono fullWidth onChange={(e) => setDestDraft((d) => ({ ...d, target: e.target.value }))} placeholder="#channel, email address or webhook URL" />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFoot}>
            <Button color="invisible" onClick={() => setDestOpen(false)}>Cancel</Button>
            <Button color="primary" onClick={addDestination}>Add destination</Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Alert detail drawer */}
      <Drawer open={!!alertDetail} onClose={() => setAlertDetail(null)} title={alertDetail?.name ?? 'Alert'} width={460}>
        {alertDetail &&
          (() => {
            const a = alertDetail
            const dest = destinations.find((d) => d.key === a.destinationKey)
            return (
              <div>
                <div className={styles.field}>
                  <label>Status</label>
                  <div><StatusTag variant="ghost" color={alertStatusColor(a.status)}>{a.status}</StatusTag></div>
                </div>
                <div className={styles.field}>
                  <label>Query</label>
                  <div className={styles.mono}>{a.query}</div>
                </div>
                <div className={styles.field}>
                  <label>Condition</label>
                  <div>{`count ${opText(a.operator)} ${a.threshold}`}</div>
                </div>
                <div className={styles.field}>
                  <label>Evaluation</label>
                  <div>{`Checked every ${a.checkEvery} min over the last ${a.lookBack} min`}</div>
                </div>
                <div className={styles.field}>
                  <label>Cooldown</label>
                  <div>{a.cooldown === 0 ? 'No cooldown' : `${a.cooldown} min`}</div>
                </div>
                <div className={styles.field}>
                  <label>Severity</label>
                  <div><StatusTag variant="ghost" color={sevColor(a.severity)}>{a.severity}</StatusTag></div>
                </div>
                <div className={styles.field}>
                  <label>Destination</label>
                  <div>{dest ? `${dest.name} (${destTypeLabel(dest.type)})` : 'None'}</div>
                </div>
                <div className={styles.field}>
                  <label>Creates incident</label>
                  <div>{a.createsIncident ? 'Yes' : 'No'}</div>
                </div>
                <div className={styles.cardFooter}>
                  <Button color="secondary" onClick={() => toggleSilence(a.key)}>{a.status === 'silenced' ? 'Enable' : 'Silence'}</Button>
                  <Button color="danger-s" onClick={() => deleteAlert(a.key)}>Delete</Button>
                </div>
              </div>
            )
          })()}
      </Drawer>

      {/* Incident detail drawer */}
      <Drawer open={!!incidentDetail} onClose={() => setIncidentDetail(null)} title={incidentDetail?.title ?? 'Incident'} width={460}>
        {incidentDetail &&
          (() => {
            const i = incidentDetail
            const src = alerts.find((a) => a.key === i.alertKey)
            return (
              <div>
                <div className={styles.field}>
                  <label>Status</label>
                  <div><StatusTag variant="ghost" color={incidentStatusColor(i.status)}>{i.status}</StatusTag></div>
                </div>
                <div className={styles.field}>
                  <label>Severity</label>
                  <div><StatusTag variant="ghost" color={sevColor(i.severity)}>{i.severity}</StatusTag></div>
                </div>
                <div className={styles.field}>
                  <label>Service</label>
                  <div className={styles.mono}>{i.service}</div>
                </div>
                <div className={styles.field}>
                  <label>Opened at</label>
                  <div className={styles.mono}>{i.openedAt}</div>
                </div>
                <div className={styles.field}>
                  <label>Duration</label>
                  <div>{i.duration}</div>
                </div>
                <div className={styles.field}>
                  <label>Triggered by alert</label>
                  <div>{src?.name ?? i.alertKey}</div>
                </div>
                {i.status !== 'resolved' && (
                  <div className={styles.cardFooter}>
                    {i.status === 'open' && <Button color="secondary" onClick={() => setIncidentStatus(i.key, 'acknowledged')}>Acknowledge</Button>}
                    <Button color="primary" onClick={() => setIncidentStatus(i.key, 'resolved')}>Resolve</Button>
                  </div>
                )}
              </div>
            )
          })()}
      </Drawer>

      {/* Connect cluster modal */}
      <Modal open={connectOpen} onCancel={() => setConnectOpen(false)} title="Connect a Kubernetes cluster" width={540}>
        <Modal.Content>
          <div className={styles.field}>
            <label>Cluster name</label>
            <Input value={clusterName} size="m" fullWidth onChange={(e) => setClusterName(e.target.value)} placeholder="e.g. prod-eu-west" />
          </div>
          <div className={styles.field}>
            <label>Install method</label>
            <Segmented<'helm' | 'kubectl'>
              value={connectMethod}
              onChange={setConnectMethod}
              options={[{ label: 'Helm', value: 'helm' }, { label: 'kubectl', value: 'kubectl' }]}
            />
          </div>
          <div className={styles.codeBox}>
            <CopyToClipboard
              value={
                connectMethod === 'helm'
                  ? 'helm repo add kapptivate https://charts.kapptivate.com\nhelm install kapp-agent kapptivate/agent \\\n  --set clusterName=' + (clusterName || '<name>')
                  : 'kubectl apply -f https://otlp.eu.kapptivate.com/install/agent.yaml'
              }
            >
              <span className={styles.codeCopy}><Copy size={12} /> Copy</span>
            </CopyToClipboard>
            {connectMethod === 'helm' ? (
              <pre>{`helm repo add kapptivate https://charts.kapptivate.com
helm install kapp-agent kapptivate/agent \\
  --set clusterName=${clusterName || '<name>'}`}</pre>
            ) : (
              <pre>kubectl apply -f https://otlp.eu.kapptivate.com/install/agent.yaml</pre>
            )}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFoot}>
            <Button color="invisible" onClick={() => setConnectOpen(false)}>Cancel</Button>
            <Button
              color="primary"
              onClick={() => {
                setConnectOpen(false)
                toast.success('Cluster connected successfully')
              }}
            >
              Connect cluster
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Trace detail drawer */}
      <Drawer
        open={!!traceDetail}
        onClose={() => setTraceDetail(null)}
        title={traceDetail ? `Trace ${traceDetail.traceId}` : ''}
        width={720}
      >
        {traceDetail &&
          (() => {
            const t = traceDetail
            const services = Array.from(new Set(t.bars.map((b) => b.label)))
            const ticks = Array.from({ length: 6 }, (_, i) => Math.round((t.durMs * i) / 5))
            return (
              <>
                <div className={styles.kpiRow}>
                  <CounterCardGroup>
                    <CounterCard title="Duration" value={t.dur} />
                    <CounterCard title="Spans" value={t.spans} />
                    <CounterCard title="Services" value={services.length} />
                    <CounterCard
                      title="Status"
                      value={t.status === 'error' ? 'Error' : 'OK'}
                      renderValue={() => (
                        <StatusTag variant="ghost" color={t.status === 'error' ? 'failed' : 'success'}>
                          {t.status === 'error' ? 'Error' : 'OK'}
                        </StatusTag>
                      )}
                    />
                  </CounterCardGroup>
                </div>

                <div className={styles.tlSection}>Timeline</div>
                <div className={styles.tlBox}>
                  <div className={styles.tlAxis}>
                    {ticks.map((ms, i) => (
                      <span key={i} className={styles.tlTick} style={{ left: `${(i / 5) * 100}%` }}>
                        {ms}ms
                      </span>
                    ))}
                  </div>
                  <div className={styles.tlBars}>
                    {t.bars.map((b, i) => (
                      <div key={i} className={styles.tlRow}>
                        <div
                          className={styles.tlBar}
                          style={{ left: `${b.left}%`, width: `${b.width}%`, background: b.color }}
                        >
                          <span className={styles.tlBarLabel}>{i === 0 ? `${b.label} · ${t.name}` : b.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.traceLegend}>
                  <span className={styles.traceLegendLabel}>Time by service</span>
                  {services.map((s) => (
                    <span key={s} className={styles.traceLegendItem}>
                      <span className={styles.traceLegendDot} style={{ background: t.bars.find((b) => b.label === s)?.color }} />
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )
          })()}
      </Drawer>

      {/* Log detail drawer */}
      <Drawer
        open={!!logDetail}
        onClose={() => setLogDetail(null)}
        title={logDetail ? `Log · ${logDetail.ts.slice(11)}` : ''}
        width={560}
      >
        {logDetail &&
          (() => {
            const l = logDetail
            const a = httpAttrs(l.msg)
            const spanId = idFrom(l.key, 16)
            const traceId = idFrom(l.key + 't', 32)
            const linkedTrace = l.traceKey ? ALL_TRACES.find((t) => t.key === l.traceKey) : undefined
            const taskId = `${idFrom(l.key, 8)}-${idFrom(l.key + '1', 4)}-${idFrom(l.key + '2', 4)}-${idFrom(l.key + '3', 4)}-${idFrom(l.key + '4', 12)}`
            const headers: [string, string][] = a
              ? [
                  ['content-type', 'application/json'],
                  ['content-length', String(140 + ((l.key.length * 37) % 820))],
                  ['x-request-id', taskId],
                  ['x-kapptivate-region', 'eu-west-1'],
                  ['server', 'kappti-edge/1.24'],
                  ['cache-control', a.method === 'GET' ? 'private, max-age=0' : 'no-store'],
                ]
              : []
            const total = a ? parseInt(a.dur, 10) || 0 : 0
            const phases = a
              ? (() => {
                  const queue = Math.max(1, Math.round(total * 0.08))
                  const db = Math.round(total * 0.34)
                  const serialize = Math.max(1, Math.round(total * 0.06))
                  const server = Math.max(0, total - queue - db - serialize)
                  return [
                    { label: 'Queued', ms: queue, color: '#98a2b3' },
                    { label: 'Server', ms: server, color: '#7B9F7F' },
                    { label: 'Database', ms: db, color: '#f2b338' },
                    { label: 'Serialize', ms: serialize, color: '#AEC6B1' },
                  ]
                })()
              : []
            return (
              <>
                <div className={styles.logDetailHead}>
                  <SeverityTag level={l.level} />
                  <span className={styles.svcLogTime}>{l.ts}</span>
                </div>
                <div data-anchor={`log:${l.key}:message`} className={styles.logBody}>{l.msg}</div>

                <Tabs
                  tabs={[
                    { key: 'body', label: 'Body' },
                    { key: 'headers', label: `Headers${headers.length ? ` (${headers.length})` : ''}` },
                    { key: 'performance', label: 'Performance' },
                  ]}
                  activeKey={logTab}
                  onChange={setLogTab}
                />

                {logTab === 'body' && (
                  <>
                    {a && (
                      <div className={styles.logJson}>
                        {`{\n  "status": ${a.status},\n  "route": "${a.route}",\n  "method": "${a.method}",\n  "duration_ms": ${a.dur}\n}`}
                      </div>
                    )}
                    <div data-anchor={`log:${l.key}:attributes`} className={styles.kvTable}>
                      <div className={styles.kvRow}><span className={styles.kvKey}>service.name</span><span className={styles.kvVal}>{l.svc}</span></div>
                      <div className={styles.kvRow}>
                        <span className={styles.kvKey}>trace.id</span>
                        {linkedTrace ? (
                          <button
                            type="button"
                            className={styles.kvValLink}
                            onClick={() => {
                              setLogDetail(null)
                              setTraceDetail(linkedTrace)
                            }}
                          >
                            {linkedTrace.traceId}
                            <IconBookOpen size={12} />
                          </button>
                        ) : (
                          <span className={styles.kvVal}>{traceId}</span>
                        )}
                      </div>
                      <div className={styles.kvRow}><span className={styles.kvKey}>span.id</span><span className={styles.kvVal}>{spanId}</span></div>
                      <div className={styles.kvRow}><span className={styles.kvKey}>kapptivate.task_id</span><span className={styles.kvVal}>{taskId}</span></div>
                      <div className={styles.kvRow}><span className={styles.kvKey}>deployment.environment</span><span className={styles.kvVal}>production</span></div>
                      <div className={styles.kvRow}><span className={styles.kvKey}>k8s.namespace</span><span className={styles.kvVal}>rocket-corp</span></div>
                      <div className={styles.kvRow}><span className={styles.kvKey}>k8s.pod.name</span><span className={styles.kvVal}>{l.svc}-{idFrom(l.key, 5)}</span></div>
                    </div>
                  </>
                )}

                {logTab === 'headers' && (
                  a ? (
                    <div data-anchor={`log:${l.key}:headers`} className={styles.kvTable}>
                      {headers.map(([k, v]) => (
                        <div key={k} className={styles.kvRow}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.tabEmpty}>No HTTP headers for this log line.</div>
                  )
                )}

                {logTab === 'performance' && (
                  a ? (
                    <>
                      <div className={styles.perfTotal}>{total}<small>ms total</small></div>
                      <div data-anchor={`log:${l.key}:performance`} className={styles.perfBar}>
                        {phases.map((p) => (
                          <div key={p.label} className={styles.perfSeg} style={{ width: `${total ? (p.ms / total) * 100 : 0}%`, background: p.color }} title={`${p.label} · ${p.ms}ms`} />
                        ))}
                      </div>
                      <div className={styles.kvTable}>
                        {phases.map((p) => (
                          <div key={p.label} className={styles.kvRow}>
                            <span className={styles.kvKey}><span className={styles.perfDot} style={{ background: p.color }} />{p.label}</span>
                            <span className={styles.kvVal}>{p.ms}ms</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.tabEmpty}>No timing data for this log line.</div>
                  )
                )}

                <div className={styles.drawerLinks}>
                  <Button
                    color="secondary" onClick={() => toast.info('Opening test result details')}
                  >
                    <Button.Icon icon={IconEye} />
                    Test result details
                  </Button>
                  <Button
                    color="secondary" onClick={() => toast.info('Opening resource metrics')}
                  >
                    <Button.Icon icon={IconActivity} />
                    Resource metrics
                  </Button>
                </div>
              </>
            )
          })()}
      </Drawer>
    </div>
  )
}

export default ExploreTabsProto
