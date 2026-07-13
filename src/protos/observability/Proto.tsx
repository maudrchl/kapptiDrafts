import { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { useReportScreen } from '../../context/ScreenContext'
import styles from './explore-tabs.module.scss'
import PersesView from './PersesView'
import LineChart from './LineChart'
import { toast, ToastMount } from './toast'
import { dashboardStore } from './dashboardStore'
import { interpretPrompt, TRACE_OVERVIEW_PANELS, TRACE_COMPARE_PANEL, makePanel } from './perses'
import type { PanelSpec } from './perses'
import type { ExploreTab, PodEntry, SignalKey, TraceEntry, ServiceNode, LogEntry, AlertItem, DestinationItem, IncidentItem, DestinationType } from './constants'
import {
  EXPLORE_TABS,
  PAGE_META,
  LOGS,
  TRACES,
  TRACE_COMPARE,
  SERVICE_LATENCY_DELTA,
  SERVICES,
  EDGES,
  PODS,
  SIGNALS,
  DAILY_GB,
  DAILY_BUDGET_GB,
  USAGE_INGESTED_GB,
  USAGE_DAY_OF_MONTH,
  USAGE_DAYS_IN_MONTH,
  OTLP_ENDPOINT_USAGE,
  OTLP_INTERNAL_ID,
  OTLP_KEY_MASKED,
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
      { key: 'perses', icon: IconGlobe, label: 'Traces (Perses)' },
      { key: 'svcmap', icon: IconNetwork, label: 'Service map' },
      { key: 'k8s', icon: IconWrench, label: 'Kubernetes' },
    ],
  },
  {
    section: 'Alerting',
    items: [
      { key: 'alerts', icon: IconBell, label: 'Alerts' },
      { key: 'incidents', icon: IconAlertTriangle, label: 'Incidents' },
      { key: 'destinations', icon: IconServer, label: 'Destinations' },
    ],
  },
  {
    section: 'Data',
    items: [{ key: 'usage', icon: IconBarChartBig, label: 'Usage & ingestion' }],
  },
]

/* Sévérité (DA unifiée logs) — pastille colorée + label mono discret. */
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

/* Extrait des attributs HTTP d'un message de log type "GET /api/x 200 — 39ms". */
const httpAttrs = (msg: string): { method: string; route: string; status: string; dur: string } | null => {
  const m = msg.match(/^(GET|POST|PATCH|PUT|DELETE)\s+(\S+)\s+(\d{3})\s+-\s+(\d+)ms/)
  if (!m) return null
  return { method: m[1], route: m[2], status: m[3], dur: m[4] }
}

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

/* Log volume — le time range régénère buckets + labels → le contrôle scope
   vraiment le graph (SVG maison, Highcharts absent du proto). */
/* Fenêtre plus courte = buckets plus fins = moins de logs par barre (amplitude
   plus basse). Chaque range a donc une forme + une échelle Y distinctes. */
const VOLUME_RANGES: Record<string, { n: number; base: number; yMax: number; labels: string[] }> = {
  '15m': { n: 15, base: 7, yMax: 20, labels: ['08:01', '08:04', '08:07', '08:10', '08:13'] },
  '1h': { n: 20, base: 22, yMax: 60, labels: ['08:15', '08:30', '08:45', '09:00', '09:15'] },
  '6h': { n: 18, base: 48, yMax: 90, labels: ['04:00', '05:30', '07:00', '08:30', '10:00'] },
  '24h': { n: 24, base: 74, yMax: 120, labels: ['11:00', '15:00', '19:00', '23:00', '03:00', '07:00'] },
}

const LogVolumeBars = ({ range }: { range: string }) => {
  const [hover, setHover] = useState<number | null>(null)
  const cfg = VOLUME_RANGES[range] ?? VOLUME_RANGES['24h']
  const spread = Math.max(6, Math.round(cfg.base * 0.3))
  const bars = Array.from({ length: cfg.n }, (_, i) => {
    const dip = i % 7 === 6
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
  const parts: { key: 'error' | 'warn' | 'info' | 'debug'; color: string }[] = [
    { key: 'error', color: '#e0372e' },
    { key: 'warn', color: '#f2b338' },
    { key: 'info', color: '#7B9F7F' },
    { key: 'debug', color: '#AEC6B1' },
  ]
  return (
    <svg className={styles.volumeChart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Log volume">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={W - padR} y2={yFor(t)} stroke="#eef0f3" strokeWidth={1} />
          <text x={padL - 6} y={yFor(t) + 3} textAnchor="end" fontSize={9} fill="#98a2b3" fontFamily="Geist Mono, monospace">{t}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const cx = padL + (i + 0.5) * colW
        const dim = hover !== null && hover !== i
        let acc = 0
        return (
          <g
            key={i}
            opacity={dim ? 0.2 : 1}
            style={{ transition: 'opacity 0.18s ease' }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <rect x={cx - colW / 2} y={padT} width={colW} height={plotH} fill="transparent" />
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
  )
}

/* ─── Logs View ─── */
const LogsView = ({
  search,
  setSearch,
  level,
  setLevel,
  onOpenLog,
}: {
  search: string
  setSearch: (v: string) => void
  level: string
  setLevel: (v: string) => void
  onOpenLog: (l: LogEntry) => void
}) => {
  const [live, setLive] = useState(false)
  const [range, setRange] = useState('24h')

  const q = search.trim().toLowerCase()
  const filtered = LOGS.filter(
    (l) =>
      (level === 'all' || l.level === level) &&
      (q === '' || `${l.msg} ${l.svc} ${l.level}`.toLowerCase().includes(q)),
  )

  return (
    <>
      <div className={styles.kpiRow}>
        <CounterCardGroup>
          <CounterCard title="Total logs" value="1.2M" trend={<TrendTag current={118} previous={100} />} />
          <CounterCard title="Errors" value="847" trend={<TrendTag current={105.2} previous={100} />} />
          <CounterCard title="Warnings" value="3,241" trend={<TrendTag current={88} previous={100} invertColor />} />
          <CounterCard title="Services" value="14" trend={<StatusTag variant="ghost" color="success">All reporting</StatusTag>} />
        </CounterCardGroup>
      </div>

      {/* Vue d'ensemble : le time range scope le graph */}
      <div className={styles.volumeCard}>
        <div className={styles.volumeHead}>
          <div className={styles.overviewTitle}>Log volume</div>
          <Select
            options={[
              { label: 'Last 15 min', value: '15m' },
              { label: 'Last 1 hour', value: '1h' },
              { label: 'Last 6 hours', value: '6h' },
              { label: 'Last 24 hours', value: '24h' },
            ]}
            value={range}
            onChange={(_e, v) => setRange(v)}
            icon={IconTimer}
            minWidth="160px"
          />
        </div>
        <LogVolumeBars range={range} />
        <MiniLegend items={[{ label: 'Error', color: '#e0372e' }, { label: 'Warning', color: '#f2b338' }, { label: 'Info', color: '#7B9F7F' }, { label: 'Debug', color: '#AEC6B1' }]} />
      </div>

      {/* Liste : la recherche + le niveau filtrent le tableau */}
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search logs... e.g. level:error service:payment-service"
            fullwidth
          />
        </div>
        <div className={styles.filterGroup}>
          <Select
            options={[
              { label: 'All levels', value: 'all' },
              { label: 'Error', value: 'error' },
              { label: 'Warning', value: 'warn' },
              { label: 'Info', value: 'info' },
              { label: 'Debug', value: 'debug' },
            ]}
            value={level}
            onChange={(_e, v) => setLevel(v)}
            icon={IconFilter}
            minWidth="120px"
          />
          <Button
            color={live ? 'primary' : 'secondary'}
            icon={IconPlay}
            onClick={() => {
              setLive((s) => !s)
              toast.info(live ? 'Live tail stopped' : 'Live tail started')
            }}
          >
            {live ? 'Streaming…' : 'Live tail'}
          </Button>
        </div>
      </div>

      <div className={styles.resultBar}>
        <span>Showing {filtered.length} of {LOGS.length} lines</span>
        {live && <span className={styles.liveDot}>● live</span>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconSearchX />}
          text="No logs match your filters"
          description="Try a broader search or reset the level filter."
        />
      ) : (
        <div className={styles.logTable}>
          <div className={styles.logTableHead}>
            <span>Severity</span>
            <span>Time</span>
            <span>Resource</span>
            <span>Body</span>
            <span>Trace</span>
          </div>
          {filtered.map((l) => (
            <div key={l.key} className={styles.logRow} onClick={() => onOpenLog(l)}>
              <span><SeverityTag level={l.level} /></span>
              <span className={styles.logCellTime}>{l.ts.slice(11)}</span>
              <span className={styles.logCellSvc}>{l.svc}</span>
              <span className={styles.logCellBody}>{l.msg}</span>
              <span className={styles.logCellTrace}>{idFrom(l.key, 8)}…</span>
            </div>
          ))}
        </div>
      )}
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
const RANGE_LABEL: Record<string, string> = { '15m': '15 minutes', '1h': '1 hour', '6h': '6 hours' }

const TracesView = ({
  search,
  setSearch,
  svc,
  setSvc,
  onOpenTrace,
}: {
  search: string
  setSearch: (v: string) => void
  svc: string
  setSvc: (v: string) => void
  onOpenTrace: (t: TraceEntry) => void
}) => {
  const [range, setRange] = useState('1h')
  const [comparePrev, setComparePrev] = useState(false)
  const q = search.trim().toLowerCase()
  const filtered = TRACES.filter(
    (t) => (svc === 'all' || t.svc === svc) && (q === '' || `${t.name} ${t.svc}`.toLowerCase().includes(q)),
  )
  // Delta de latence par service, trié par plus gros écart (régression en tête).
  const svcDeltas = [...SERVICE_LATENCY_DELTA].sort(
    (a, b) => Math.abs(b.currMs - b.prevMs) - Math.abs(a.currMs - a.prevMs),
  )
  // Légende unique au-dessus de la liste : chaque service présent une seule
  // fois, dans l'ordre de première apparition. Évite de répéter les libellés
  // sur chaque ligne tout en gardant les couleurs signifiantes.
  const legend: { name: string; color: string }[] = []
  const seen = new Set<string>()
  for (const t of filtered)
    for (const b of t.bars) {
      const name = b.label.split(' (')[0]
      if (!seen.has(name)) {
        seen.add(name)
        legend.push({ name, color: b.color })
      }
    }

  return (
    <>
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search traces... e.g. service:demo-site duration:>100ms"
            fullwidth
          />
        </div>
        <div className={styles.filterGroup}>
          <Select
            options={[
              { label: 'Last 15 min', value: '15m' },
              { label: 'Last 1 hour', value: '1h' },
              { label: 'Last 6 hours', value: '6h' },
            ]}
            value={range}
            onChange={(_e, v) => setRange(v)}
            icon={IconTimer}
            minWidth="140px"
          />
          <Select
            options={[
              { label: 'All services', value: 'all' },
              { label: 'demo-site', value: 'demo-site' },
              { label: 'payment-service', value: 'payment-service' },
              { label: 'postgres', value: 'postgres' },
            ]}
            value={svc}
            onChange={(_e, v) => setSvc(v)}
            icon={IconServer}
            minWidth="140px"
          />
          <Toggle title="Compare to previous period" value={comparePrev} onChange={setComparePrev} />
        </div>
      </div>

      <div className={styles.kpiRow}>
        <CounterCardGroup>
          <CounterCard
            title="Traces"
            value={`${(TRACE_COMPARE.requests.cur / 1000).toFixed(1)}K`}
            trend={<TrendTag current={TRACE_COMPARE.requests.cur} previous={TRACE_COMPARE.requests.prev} />}
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

      {comparePrev ? (
        <Card className={styles.cmpPanel}>
          <div className={styles.cmpPanelTitle}>
            Compared to previous {RANGE_LABEL[range]}
          </div>
          <LineChart panel={TRACE_COMPARE_PANEL} height={220} />
          <div className={styles.cmpDeltaList}>
            {svcDeltas.map((s) => {
              const d = s.currMs - s.prevMs
              return (
                <div key={s.name} className={styles.cmpDeltaRow}>
                  <span className={styles.traceLegendDot} style={{ background: s.color }} />
                  <span className={styles.cmpDeltaName}>{s.name}</span>
                  <span className={styles.cmpDeltaVals}>
                    {s.prevMs}ms <span className={styles.cmpArrow}>→</span> {s.currMs}ms
                  </span>
                  <span className={d > 0 ? styles.cmpBad : styles.cmpGood}>
                    {d > 0 ? '+' : ''}
                    {d}ms
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <div className={styles.overviewRow}>
          {TRACE_OVERVIEW_PANELS.map((p) => (
            <Card key={p.id} className={styles.overviewCard}>
              <div className={styles.overviewTitle}>
                {p.name} <span>{p.unit}</span>
              </div>
              <LineChart panel={p} height={150} />
            </Card>
          ))}
        </div>
      )}

      <div className={styles.resultBar}>
        <span>Showing {filtered.length} of {TRACES.length} traces</span>
      </div>

      {legend.length > 0 && (
        <div className={styles.traceLegend}>
          <span className={styles.traceLegendLabel}>Time by service</span>
          {legend.map((l) => (
            <span key={l.name} className={styles.traceLegendItem}>
              <span className={styles.traceLegendDot} style={{ background: l.color }} />
              {l.name}
            </span>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconSearchX />}
          text="No traces match your filters"
          description="Try a broader search or pick another service."
        />
      ) : (
        <div className={styles.traceList}>
        {filtered.map((t) => {
          return (
            <div
              key={t.key}
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
                  <span className={styles.traceKey}>{t.key}</span>
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
        </div>
      )}
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

/* Telemetry (onglet du drawer service) — scatter spans, bars logs, table metrics */
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
const ServiceMapView = () => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(SERVICES[0]?.id ?? null)
  const [drawerSvc, setDrawerSvc] = useState<ServiceNode | null>(null)
  const [svcTab, setSvcTab] = useState('overview')
  const q = search.trim().toLowerCase()
  const matches = (label: string) => q === '' || label.toLowerCase().includes(q)
  const byId = (id: string) => SERVICES.find((s) => s.id === id)!
  const outCount = (id: string) => EDGES.filter((e) => e.from === id).length
  const inCount = (id: string) => EDGES.filter((e) => e.to === id).length

  // pan + zoom + fullscreen
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const [fullscreen, setFullscreen] = useState(false)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const clamp = (n: number) => Math.min(1.8, Math.max(0.5, +n.toFixed(2)))
  const startPan = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-svcnode]')) return
    drag.current = { x: e.clientX, y: e.clientY }
  }
  const onPan = (e: React.MouseEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = { x: e.clientX, y: e.clientY }
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }
  const endPan = () => {
    drag.current = null
  }

  return (
    <>
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SearchInput value={search} onChange={setSearch} placeholder="Filter services..." fullwidth />
        </div>
        <div className={styles.filterGroup}>
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
        </div>
      </div>

      <div
        className={fullscreen ? `${styles.svcMapCanvas} ${styles.svcMapFullscreen}` : styles.svcMapCanvas}
        onMouseDown={startPan}
        onMouseMove={onPan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
      >
        <div className={styles.svcCanvasBar}>
          <button className={styles.zoomBtn} onClick={() => setView((v) => ({ ...v, scale: clamp(v.scale - 0.2) }))} title="Zoom out">−</button>
          <button className={styles.zoomBtn} onClick={() => setView((v) => ({ ...v, scale: clamp(v.scale + 0.2) }))} title="Zoom in">+</button>
          <button className={styles.zoomBtn} onClick={() => setView({ x: 0, y: 0, scale: 1 })} title="Reset view">⟲</button>
          <button className={styles.zoomBtn} onClick={() => { setFullscreen((f) => !f); setView({ x: 0, y: 0, scale: 1 }) }} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{fullscreen ? '✕' : '⤢'}</button>
        </div>

        <div
          className={styles.svcViewport}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transition: drag.current ? 'none' : 'transform 0.2s ease',
          }}
        >
          {/* connectors */}
          <svg className={styles.svcEdgeLayer} viewBox="0 0 100 100" preserveAspectRatio="none">
            {EDGES.map((e, i) => {
              const f = byId(e.from)
              const t = byId(e.to)
              const mx = (f.x + t.x) / 2
              return (
                <path
                  key={i}
                  d={`M ${f.x} ${f.y} C ${mx} ${f.y}, ${mx} ${t.y}, ${t.x} ${t.y}`}
                  className={styles.svcEdge}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>

          {/* edge labels */}
          {EDGES.map((e, i) => {
            const f = byId(e.from)
            const t = byId(e.to)
            return (
              <div
                key={i}
                className={styles.svcEdgeLabel}
                style={{ left: `${(f.x + t.x) / 2}%`, top: `${(f.y + t.y) / 2}%` }}
              >
                {e.calls} calls · {e.lat}
              </div>
            )
          })}

          {/* nodes */}
          {SERVICES.map((s) => {
            const out = outCount(s.id)
            const inb = inCount(s.id)
            return (
              <div
                key={s.id}
                data-svcnode
                className={styles.svcCard}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  borderColor: s.color,
                  opacity: matches(s.label) ? 1 : 0.3,
                  boxShadow: selected === s.id ? `0 0 0 3px ${s.color}33` : undefined,
                }}
                onClick={() => {
                  setSelected(s.id)
                  setDrawerSvc(s)
                  setSvcTab('overview')
                }}
              >
                <div className={styles.svcCardName}>{s.label}</div>
                <div className={styles.svcCardMeta}>{s.spans.toLocaleString()} spans · {s.lat} avg</div>
                <div className={styles.svcCardConn}>
                  {out > 0 && <span style={{ color: s.color }}>↑{out} out</span>}
                  {inb > 0 && <span style={{ color: s.color }}>↓{inb} in</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* minimap */}
        <div className={styles.svcMiniMap}>
          {SERVICES.map((s) => (
            <span key={s.id} className={styles.svcMiniNode} style={{ left: `${s.x}%`, top: `${s.y}%`, background: s.color }} />
          ))}
        </div>
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

                    <div className={styles.tlSection}>Recent logs ({logs.length})</div>
                    {logs.length === 0 ? (
                      <div className={styles.svcEmpty}>No recent logs for this service.</div>
                    ) : (
                      logs.map((l) => (
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
                            <span><Tag color="orange">{m.type}</Tag></span>
                            <span className={styles.mono}>{m.name}</span>
                            <span className={styles.mono}>{m.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
      </Drawer>
    </>
  )
}

/* ─── Kubernetes mock data (deployments / services / events) ─── */
const K8S_DEPLOYMENTS = [
  { key: 'd1', name: 'demo-site', ready: '2/2', uptodate: 2, available: 2, age: '9d', ns: 'rocket-corp' },
  { key: 'd2', name: 'payment-service', ready: '1/2', uptodate: 2, available: 1, age: '9d', ns: 'rocket-corp' },
  { key: 'd3', name: 'notification', ready: '1/1', uptodate: 1, available: 1, age: '7d', ns: 'rocket-corp' },
  { key: 'd4', name: 'postgres', ready: '1/1', uptodate: 1, available: 1, age: '9d', ns: 'rocket-corp' },
  { key: 'd5', name: 'redis', ready: '1/1', uptodate: 1, available: 1, age: '9d', ns: 'rocket-corp' },
]
const K8S_SERVICES = [
  { key: 's1', name: 'demo-site', type: 'LoadBalancer', clusterIP: '10.24.1.10', ports: '443/TCP', age: '9d', ns: 'rocket-corp' },
  { key: 's2', name: 'payment-service', type: 'ClusterIP', clusterIP: '10.24.2.31', ports: '8080/TCP', age: '9d', ns: 'rocket-corp' },
  { key: 's3', name: 'postgres', type: 'ClusterIP', clusterIP: '10.24.2.44', ports: '5432/TCP', age: '9d', ns: 'rocket-corp' },
  { key: 's4', name: 'redis', type: 'ClusterIP', clusterIP: '10.24.2.58', ports: '6379/TCP', age: '9d', ns: 'rocket-corp' },
]
const K8S_EVENTS = [
  { key: 'e1', type: 'Warning', reason: 'BackOff', object: 'pod/payment-service-9e2f1a-t2w5k', message: 'Back-off restarting failed container', age: '2m', ns: 'rocket-corp' },
  { key: 'e2', type: 'Warning', reason: 'Unhealthy', object: 'pod/payment-service-9e2f1a-t2w5k', message: 'Liveness probe failed: HTTP 500', age: '3m', ns: 'rocket-corp' },
  { key: 'e3', type: 'Normal', reason: 'Scheduled', object: 'pod/demo-site-7f8d9c-q9v2m', message: 'Successfully assigned to node-2', age: '8m', ns: 'rocket-corp' },
  { key: 'e4', type: 'Normal', reason: 'Pulled', object: 'pod/demo-site-7f8d9c-x4k2p', message: 'Container image already present on machine', age: '14m', ns: 'rocket-corp' },
]

/* ─── Kubernetes View ─── */
const KubernetesView = () => {
  const [search, setSearch] = useState('')
  const [ns, setNs] = useState('production')
  const [k8sTab, setK8sTab] = useState('pods')
  const q = search.trim().toLowerCase()
  const byNsQ = (row: { ns: string; name?: string; object?: string }) =>
    (ns === 'all' || row.ns === ns) &&
    (q === '' || `${row.name ?? ''} ${row.object ?? ''}`.toLowerCase().includes(q))
  const filtered = PODS.filter(
    (p) => (ns === 'all' || p.ns === ns) && (q === '' || p.name.toLowerCase().includes(q)),
  )

  const deployColumns = [
    { title: 'Deployment', dataIndex: 'name', key: 'name', render: (v: string) => <Tag mono maxLen={40}>{v}</Tag> },
    { title: 'Ready', dataIndex: 'ready', key: 'ready', width: 100, render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Up-to-date', dataIndex: 'uptodate', key: 'uptodate', width: 110 },
    { title: 'Available', dataIndex: 'available', key: 'available', width: 100 },
    { title: 'Age', dataIndex: 'age', key: 'age', width: 80 },
  ]
  const svcColumns = [
    { title: 'Service', dataIndex: 'name', key: 'name', render: (v: string) => <Tag mono maxLen={40}>{v}</Tag> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 150, render: (v: string) => <StatusTag variant="ghost" color={v === 'LoadBalancer' ? 'info' : 'neutral'}>{v}</StatusTag> },
    { title: 'Cluster IP', dataIndex: 'clusterIP', key: 'clusterIP', width: 150, render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Ports', dataIndex: 'ports', key: 'ports', width: 130, render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Age', dataIndex: 'age', key: 'age', width: 80 },
  ]
  const eventColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', width: 110, render: (v: string) => <StatusTag variant="ghost" color={v === 'Warning' ? 'warning' : 'success'}>{v}</StatusTag> },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', width: 130, render: (v: string) => <Tag mono>{v}</Tag> },
    { title: 'Object', dataIndex: 'object', key: 'object', render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Message', dataIndex: 'message', key: 'message' },
    { title: 'Age', dataIndex: 'age', key: 'age', width: 70 },
  ]

  const podColumns = [
    { title: 'Pod', dataIndex: 'name', key: 'name', render: (v: string) => <Tag mono maxLen={40}>{v}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (v: PodEntry['status']) => (
        <StatusTag variant="ghost" color={v === 'Running' ? 'success' : v === 'CrashLoopBackOff' ? 'failed' : 'warning'}>{v}</StatusTag>
      ),
    },
    { title: 'CPU', dataIndex: 'cpu', key: 'cpu', width: 130, render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Memory', dataIndex: 'mem', key: 'mem', width: 130, render: (v: string) => <span className={styles.mono}>{v}</span> },
    {
      title: 'Restarts',
      dataIndex: 'restarts',
      key: 'restarts',
      width: 90,
      align: 'right' as const,
      render: (v: number) => (v > 5 ? <Tag color="red" weight="semibold">{String(v)}</Tag> : <span>{v}</span>),
    },
    { title: 'Age', dataIndex: 'age', key: 'age', width: 70 },
  ]

  return (
    <>
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search pods, deployments, services..." fullwidth />
        </div>
        <div className={styles.filterGroup}>
          <Select
            options={[
              { label: 'production', value: 'production' },
              { label: 'staging', value: 'staging' },
              { label: 'All namespaces', value: 'all' },
            ]}
            value={ns}
            onChange={(_e, v) => setNs(v)}
            icon={IconFilter}
            minWidth="150px"
          />
          <Select
            options={[
              { label: 'eu-west-1', value: 'eu-west-1' },
              { label: 'us-east-1', value: 'us-east-1' },
            ]}
            defaultValue="eu-west-1"
            icon={IconLayers}
            minWidth="130px"
          />
        </div>
      </div>

      <div className={styles.k8sGrid}>
        <div className={styles.k8sCard}>
          <div className={styles.k8sCardTitle}><Cpu size={14} /> CPU usage</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>42%</div>
          <div className={styles.k8sBar}><div className={styles.k8sBarFill} style={{ width: '42%', background: '#2E7D74' }} /></div>
          <div className={styles.k8sBarLabel}><span>1.59 cores used</span><span>3.8 cores allocated</span></div>
        </div>
        <div className={styles.k8sCard}>
          <div className={styles.k8sCardTitle}><IconServer size={14} /> Memory usage</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>61%</div>
          <div className={styles.k8sBar}><div className={styles.k8sBarFill} style={{ width: '61%', background: '#f59e0b' }} /></div>
          <div className={styles.k8sBarLabel}><span>5.2 Gi used</span><span>8.5 Gi allocated</span></div>
        </div>
        <div className={styles.k8sCard}>
          <div className={styles.k8sCardTitle}><IconBox size={14} /> Pods</div>
          <div className={styles.k8sPodSummary}>
            <div><div className={styles.k8sPodCount} style={{ color: '#1fae7e' }}>18</div><div className={styles.k8sPodLabel}>Running</div></div>
            <div><div className={styles.k8sPodCount} style={{ color: '#e0372e' }}>1</div><div className={styles.k8sPodLabel}>CrashLoop</div></div>
            <div><div className={styles.k8sPodCount} style={{ color: '#d97706' }}>0</div><div className={styles.k8sPodLabel}>Pending</div></div>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'pods', label: 'Pods' },
          { key: 'deployments', label: 'Deployments' },
          { key: 'services', label: 'Services' },
          { key: 'events', label: 'Events' },
        ]}
        activeKey={k8sTab}
        onChange={setK8sTab}
      />

      {k8sTab === 'pods' && <Table rowKey="key" columns={podColumns} data={filtered} showHeader />}
      {k8sTab === 'deployments' && <Table rowKey="key" columns={deployColumns} data={K8S_DEPLOYMENTS.filter(byNsQ)} showHeader />}
      {k8sTab === 'services' && <Table rowKey="key" columns={svcColumns} data={K8S_SERVICES.filter(byNsQ)} showHeader />}
      {k8sTab === 'events' && <Table rowKey="key" columns={eventColumns} data={K8S_EVENTS.filter(byNsQ)} showHeader />}
    </>
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
      {/* State banner — aligné sur l'expérience AI Usage */}
      {pct >= 80 && (
        <Banner
          variant={pct >= 95 ? 'error' : 'warning'}
          description={pct >= 95 ? 'Monthly ingestion quota nearly exhausted' : `${pct.toFixed(0)}% of your monthly ingestion quota used`}
          subDescription={
            <>
              At the current rate, your <b>{fmtGB(cap)}</b> monthly quota runs out around{' '}
              <b>day {Math.min(USAGE_DAYS_IN_MONTH, Math.round((cap / USAGE_INGESTED_GB) * USAGE_DAY_OF_MONTH))}</b>. Ingestion keeps working; overage is billed and admins are notified.
            </>
          }
          icon={<IconAlertTriangle size={18} />}
          aside={<Button color="secondary" size="s" onClick={() => setQuotaOpen(true)}>Adjust quota</Button>}
        />
      )}

      {/* Quota & consumption */}
      <Card className={styles.usageCard}>
        <Card.Header
          title="Quota usage"
          icon={IconBarChartBig}
          asideContent={<StatusTag variant="ghost" color={status.color}>{status.label}</StatusTag>}
        />
        <Card.Content>
          <div className={styles.usageCardBody}>
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
        <Card.Header
          title="Daily consumption"
          icon={IconActivity}
          asideContent={
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
          }
        />
        <Card.Content>
          <div className={styles.usageCardBody}>
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
        <Card.Header title="Usage by signal" icon={IconLayers} />
        <Card.Content>
          <div className={styles.usageCardBody}>
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
        <Card.Header
          title="OTLP connection & key"
          icon={IconServer}
          asideContent={<StatusTag variant="ghost" color={revoked ? 'failed' : 'success'}>{revoked ? 'Revoked' : 'Active'}</StatusTag>}
        />
        <Card.Content>
          <div className={styles.usageCardBody}>
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
            <Button color="primary" icon={KeyRound} onClick={() => setKeyStep('issue')}>Issue key</Button>
            <Button color="danger-s" disabled={revoked} onClick={() => setKeyStep('revoke')}>Revoke key</Button>
          </div>
          </div>
        </Card.Content>
      </Card>

      {/* Retention */}
      <Card className={styles.usageCard}>
        <Card.Header
          title="Data retention"
          icon={IconBox}
          asideContent={<StatusTag variant="ghost" color="info">{retTier}</StatusTag>}
        />
        <Card.Content>
          <div className={styles.usageCardBody}>
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

      {/* Issue new key — confirm */}
      <Alert
        open={keyStep === 'issue'}
        danger
        title="Issue a new key?"
        okText="Issue new key"
        cancelText="Cancel"
        onCancel={() => setKeyStep('none')}
        onOk={issueKey}
      >
        If you issue a new key, the current one stops working immediately. Every collector using the old key will start getting 401s until you roll out the new one.
      </Alert>

      {/* Issue new key — reveal once */}
      <Modal open={keyStep === 'reveal'} onCancel={() => setKeyStep('none')} maskClosable={false} title="Your new API key" width={480}>
        <Modal.Content>
          <div className={styles.cardSub} style={{ marginBottom: 12 }}>
            Copy it now. For security it's shown only once and never again.
          </div>
          <Input value={newKey} canCopy mono disabled fullWidth size="m" />
          <div style={{ marginTop: 12 }}>
            <Button
              color="secondary"
              icon={keyCopied ? Check : Copy}
              onClick={() => {
                navigator.clipboard?.writeText(newKey)
                setKeyCopied(true)
              }}
            >
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

      {/* Revoke — confirm */}
      <Alert
        open={keyStep === 'revoke'}
        danger
        title="Revoke key?"
        okText="Revoke key"
        cancelText="Keep key"
        onCancel={() => setKeyStep('none')}
        onOk={() => {
          setKeyState({ status: 'revoked' })
          setKeyStep('none')
          toast.success('API key revoked successfully')
        }}
      >
        If you revoke this key, ingestion stops until you issue a new one. This action cannot be undone.
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
  // Onglet actif, synchronisé avec l'URL (?tab=…) — persiste au refresh, Logs par défaut.
  const [tab, setTab] = useState<ExploreTab>(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    return EXPLORE_TABS.some((x) => x.key === t) ? (t as ExploreTab) : 'logs'
  })
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url)
  }, [tab])
  useReportScreen(`${mode}:${tab}`)
  const [persesHeaderSlot, setPersesHeaderSlot] = useState<HTMLDivElement | null>(null)

  // lifted view state (needed by header actions)
  const [logSearch, setLogSearch] = useState('')
  const [logLevel, setLogLevel] = useState('all')
  const [traceSearch, setTraceSearch] = useState('')
  const [traceSvc, setTraceSvc] = useState('all')
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
  const [configureOpen, setConfigureOpen] = useState(false)
  const [connectMethod, setConnectMethod] = useState<'helm' | 'kubectl'>('helm')
  const [clusterName, setClusterName] = useState('')

  // service map settings (Configure drawer)
  const [cfgInterval, setCfgInterval] = useState('15m')
  const [cfgLatencies, setCfgLatencies] = useState(true)
  const [cfgErrors, setCfgErrors] = useState(true)

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

  const meta = PAGE_META[tab]

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
        ? `service:${traceSvc === 'all' ? '*' : traceSvc} ${traceSearch}`.trim()
        : `level:${logLevel} ${logSearch}`.trim()
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
      case 'Configure':
        setConfigureOpen(true)
        break
      case 'Refresh':
        toast.info('Refreshing service map…')
        setTimeout(() => toast.success('Service map refreshed successfully'), 700)
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

  const renderView = () => {
    switch (tab) {
      case 'logs':
        return <LogsView search={logSearch} setSearch={setLogSearch} level={logLevel} setLevel={setLogLevel} onOpenLog={openLog} />
      case 'traces':
        return (
          <TracesView
            search={traceSearch}
            setSearch={setTraceSearch}
            svc={traceSvc}
            setSvc={setTraceSvc}
            onOpenTrace={setTraceDetail}
          />
        )
      case 'svcmap':
        return <ServiceMapView />
      case 'k8s':
        return <KubernetesView />
      case 'usage':
        return <UsageView cap={cap} setCap={setCap} quotaOpen={quotaOpen} setQuotaOpen={setQuotaOpen} />
      case 'alerts':
        return <AlertsView alerts={alerts} destinations={destinations} onOpen={setAlertDetail} />
      case 'incidents':
        return <IncidentsView incidents={incidents} onOpen={setIncidentDetail} />
      case 'destinations':
        return <DestinationsView destinations={destinations} />
      case 'perses':
        return <PersesView headerSlot={persesHeaderSlot} />
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

        <div className={styles.segmented}>
          <button className={mode === 'run' ? styles.segBtnActive : styles.segBtn} onClick={() => setMode('run')}>
            <IconZap size={12} /> Run
          </button>
          <button className={mode === 'obs' ? styles.segBtnActive : styles.segBtn} onClick={() => setMode('obs')}>
            <IconEye size={12} /> Explore
          </button>
        </div>

        <div className={styles.ws}>
          <div className={styles.wsAvatar}>🚀</div>
          <div>
            <div className={styles.wsName}>Rocket Corp</div>
            <div className={styles.wsSub}>Workspace</div>
          </div>
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
        <div className={styles.contentBody}>
          <div className={styles.pageHead}>
            <h1 className={styles.pageTitle}>{meta.title}</h1>
            {tab === 'perses' ? (
              // Le cluster d'actions Perses est téléporté ici depuis PersesView (portal).
              <div className={styles.contentActions} ref={setPersesHeaderSlot} />
            ) : (
              <div className={styles.contentActions}>
                {meta.actions.map((a) => (
                  <Button
                    key={a.label}
                    color={a.primary ? 'primary' : 'secondary'}
                    icon={a.label === 'Export' ? IconDownload : a.label === 'Create alert' ? Plus : a.label === 'Pin as panel' ? Pin : undefined}
                    onClick={() => runAction(a.label)}
                  >
                    {a.label}
                  </Button>
                ))}
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
        title={traceDetail ? `Trace ${traceDetail.key}` : ''}
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
                <div className={styles.logBody}>{l.msg}</div>

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
                    <div className={styles.kvTable}>
                      <div className={styles.kvRow}><span className={styles.kvKey}>service.name</span><span className={styles.kvVal}>{l.svc}</span></div>
                      <div className={styles.kvRow}><span className={styles.kvKey}>trace.id</span><span className={styles.kvVal}>{traceId}</span></div>
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
                    <div className={styles.kvTable}>
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
                      <div className={styles.perfBar}>
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
                  <Button color="secondary" icon={IconEye} onClick={() => toast.info('Opening test result details')}>Test result details</Button>
                  <Button color="secondary" icon={IconActivity} onClick={() => toast.info('Opening resource metrics')}>Resource metrics</Button>
                </div>
              </>
            )
          })()}
      </Drawer>


      {/* Service map settings drawer */}
      <Drawer
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        title="Service map settings"
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button color="invisible" onClick={() => setConfigureOpen(false)}>Cancel</Button>
            <Button
              color="primary"
              onClick={() => {
                setConfigureOpen(false)
                toast.success('Service map settings saved successfully')
              }}
            >
              Save changes
            </Button>
          </div>
        }
      >
        <div className={styles.field}>
          <label>Auto-refresh interval</label>
          <Select
            fullWidth
            value={cfgInterval}
            onChange={(_e, v) => setCfgInterval(v)}
            options={[
              { label: 'Off', value: 'off' },
              { label: 'Every 15 seconds', value: '15s' },
              { label: 'Every 1 minute', value: '1m' },
              { label: 'Every 15 minutes', value: '15m' },
            ]}
          />
        </div>
        <div className={styles.drawerToggles}>
          <Toggle
            title="Show latencies on edges"
            description="Display p95 latency labels on the connections between services."
            value={cfgLatencies}
            onChange={setCfgLatencies}
          />
          <Toggle
            title="Highlight error paths"
            description="Emphasize service paths with an error rate above 1%."
            value={cfgErrors}
            onChange={setCfgErrors}
          />
        </div>
      </Drawer>
    </div>
  )
}

export default ExploreTabsProto
