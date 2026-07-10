import { useState } from 'react'
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
  Plus,
  Pin,
} from 'lucide-react'
import styles from './explore-tabs.module.scss'
import PersesView from './PersesView'
import { toast, ToastMount } from './toast'
import { dashboardStore } from './dashboardStore'
import { interpretPrompt } from './perses'
import type { PanelSpec } from './perses'
import type { ExploreTab, PodEntry, SignalKey } from './constants'
import {
  PAGE_META,
  LOGS,
  TRACES,
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
  ALERT_CHANNELS,
  ALERT_OPERATORS,
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

const NAV_EXPLORE: { key: ExploreTab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { key: 'logs', icon: IconFile, label: 'Logs explorer' },
  { key: 'traces', icon: IconBookOpen, label: 'Traces' },
  { key: 'svcmap', icon: IconNetwork, label: 'Service map' },
  { key: 'k8s', icon: IconWrench, label: 'Kubernetes' },
  { key: 'usage', icon: IconBarChartBig, label: 'Usage & ingestion' },
  { key: 'perses', icon: IconGlobe, label: 'Traces (Perses)' },
]

const LOG_LEVEL_CLASSES: Record<string, string> = {
  info: styles.logLevelInfo,
  warn: styles.logLevelWarn,
  error: styles.logLevelError,
  debug: styles.logLevelDebug,
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
  severity: string
  channel: string
}

/* ─── Logs View ─── */
const LogsView = ({
  search,
  setSearch,
  level,
  setLevel,
}: {
  search: string
  setSearch: (v: string) => void
  level: string
  setLevel: (v: string) => void
}) => {
  const [live, setLive] = useState(false)

  const q = search.trim().toLowerCase()
  const filtered = LOGS.filter(
    (l) =>
      (level === 'all' || l.level === level) &&
      (q === '' || `${l.msg} ${l.svc} ${l.level}`.toLowerCase().includes(q)),
  )

  return (
    <>
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search logs... e.g. level:error service:api-gateway"
            fullwidth
          />
        </div>
        <div className={styles.filterGroup}>
          <Select
            options={[
              { label: 'Last 15 min', value: '15m' },
              { label: 'Last 1 hour', value: '1h' },
              { label: 'Last 6 hours', value: '6h' },
              { label: 'Last 24 hours', value: '24h' },
            ]}
            defaultValue="1h"
            icon={IconTimer}
            minWidth="140px"
          />
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

      <div className={styles.kpiRow}>
        <CounterCardGroup>
          <CounterCard title="Total logs" value="1.2M" trend={<TrendTag current={118} previous={100} />} />
          <CounterCard title="Errors" value="847" trend={<TrendTag current={105.2} previous={100} />} />
          <CounterCard title="Warnings" value="3,241" trend={<TrendTag current={88} previous={100} invertColor />} />
          <CounterCard title="Services" value="14" trend={<StatusTag variant="ghost" color="success">All reporting</StatusTag>} />
        </CounterCardGroup>
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
        <div className={styles.logStream}>
          {filtered.map((l) => (
            <div key={l.key} className={styles.logLine}>
              <span className={styles.logTs}>{l.ts}</span>
              <span className={LOG_LEVEL_CLASSES[l.level]}>{l.level.toUpperCase()}</span>
              <span className={styles.logSvc}>{l.svc}</span>
              <span className={styles.logMsg}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ─── Traces View ─── */
const TracesView = ({
  search,
  setSearch,
  svc,
  setSvc,
  selected,
  toggleSelected,
}: {
  search: string
  setSearch: (v: string) => void
  svc: string
  setSvc: (v: string) => void
  selected: string[]
  toggleSelected: (key: string) => void
}) => {
  const q = search.trim().toLowerCase()
  const filtered = TRACES.filter(
    (t) => (svc === 'all' || t.svc === svc) && (q === '' || `${t.name} ${t.svc}`.toLowerCase().includes(q)),
  )

  return (
    <>
      <div className={styles.searchRow}>
        <div className={styles.searchFlex}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search traces... e.g. service:api-gateway duration:>100ms"
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
            defaultValue="1h"
            icon={IconTimer}
            minWidth="140px"
          />
          <Select
            options={[
              { label: 'All services', value: 'all' },
              { label: 'api-gateway', value: 'api-gateway' },
              { label: 'kappticentral', value: 'kappticentral' },
              { label: 'screenshot-svc', value: 'screenshot-svc' },
            ]}
            value={svc}
            onChange={(_e, v) => setSvc(v)}
            icon={IconServer}
            minWidth="140px"
          />
        </div>
      </div>

      <div className={styles.kpiRow}>
        <CounterCardGroup>
          <CounterCard title="Traces" value="48.2K" trend={<span style={{ fontSize: 12, color: '#98a2b3' }}>Last hour</span>} />
          <CounterCard title="Avg duration" value="127ms" trend={<TrendTag current={127} previous={135} invertColor />} />
          <CounterCard title="Error rate" value="2.1%" trend={<TrendTag current={2.1} previous={1.7} />} />
          <CounterCard title="P99 latency" value="890ms" trend={<TrendTag current={890} previous={1010} invertColor />} />
        </CounterCardGroup>
      </div>

      <div className={styles.resultBar}>
        <span>Showing {filtered.length} of {TRACES.length} traces</span>
        <span>{selected.length}/2 selected to compare</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconSearchX />}
          text="No traces match your filters"
          description="Try a broader search or pick another service."
        />
      ) : (
        filtered.map((t) => {
          const isSel = selected.includes(t.key)
          return (
            <div
              key={t.key}
              className={isSel ? styles.traceRowSelected : styles.traceRow}
              onClick={() => toggleSelected(t.key)}
            >
              <div className={styles.traceHead}>
                <div className={styles.traceName}>
                  {isSel && <Check size={15} color="#ed7846" />}
                  <StatusTag variant="filled" color={t.status === 'error' ? 'failed' : 'success'}>
                    {t.status === 'error' ? 'Error' : 'OK'}
                  </StatusTag>
                  {t.name}
                </div>
                <div className={styles.traceMeta}>
                  <span>{t.spans} spans</span>
                  <Tag mono>{t.dur}</Tag>
                  <Tag color="grey" mono>{t.key}</Tag>
                </div>
              </div>
              <div className={styles.traceWaterfall}>
                {t.bars.map((b, i) => (
                  <div
                    key={i}
                    className={styles.traceSpan}
                    style={{ left: `${b.left}%`, width: `${b.width}%`, background: b.color }}
                    title={b.label}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </>
  )
}

/* ─── Service Map View ─── */
const ServiceMapView = () => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(SERVICES[0]?.id ?? null)
  const sel = SERVICES.find((s) => s.id === selected)
  const q = search.trim().toLowerCase()
  const matches = (label: string) => q === '' || label.toLowerCase().includes(q)

  const W = 600
  const H = 400

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

      <div className={styles.svcMapContainer}>
        <div className={styles.svcMapCanvas}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            {EDGES.map((e, i) => {
              const f = SERVICES.find((s) => s.id === e.from)!
              const t = SERVICES.find((s) => s.id === e.to)!
              return (
                <line
                  key={i}
                  x1={(f.x / 100) * W}
                  y1={(f.y / 100) * H}
                  x2={(t.x / 100) * W}
                  y2={(t.y / 100) * H}
                  stroke="#d0d5dd"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              )
            })}
          </svg>
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className={styles.svcNode}
              style={{
                left: `calc(${s.x}% - 36px)`,
                top: `calc(${s.y}% - 36px)`,
                borderColor: s.color,
                color: s.color,
                opacity: matches(s.label) ? 1 : 0.25,
                boxShadow: selected === s.id ? `0 0 0 3px ${s.color}33` : undefined,
              }}
              onClick={() => setSelected(s.id)}
            >
              <IconServer size={20} />
              <span className={styles.svcNodeLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.svcSidebar}>
          <Card>
            <Card.Content title={sel ? sel.label : 'Select a service'} description={sel ? undefined : 'Click a node on the map'}>
              {sel && (
                <>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Requests/sec</span><b>{sel.rps}</b></div>
                  <div className={styles.detailRow}><span className={styles.detailLabel}>Avg latency</span><b>{sel.lat}</b></div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Error rate</span>
                    <StatusTag variant="filled" color={parseFloat(sel.err) > 1 ? 'failed' : parseFloat(sel.err) > 0 ? 'warning' : 'success'}>{sel.err}</StatusTag>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status</span>
                    <StatusTag variant="filled" color={parseFloat(sel.err) > 2 ? 'failed' : 'success'}>{parseFloat(sel.err) > 2 ? 'Degraded' : 'Healthy'}</StatusTag>
                  </div>
                </>
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Content title="Traffic summary">
              <div className={styles.detailRow}><span className={styles.detailLabel}>Total RPS</span><b>13.7K</b></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Avg latency</span><b>42ms</b></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Active services</span><b>{SERVICES.length}</b></div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </>
  )
}

/* ─── Kubernetes View ─── */
const KubernetesView = () => {
  const [search, setSearch] = useState('')
  const [ns, setNs] = useState('production')
  const q = search.trim().toLowerCase()
  const filtered = PODS.filter(
    (p) => (ns === 'all' || p.ns === ns) && (q === '' || p.name.toLowerCase().includes(q)),
  )

  const podColumns = [
    { title: 'Pod', dataIndex: 'name', key: 'name', render: (v: string) => <Tag mono maxLen={40}>{v}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
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
        defaultActiveKey="pods"
      />

      <Table rowKey="key" columns={podColumns} data={filtered} showHeader />
    </>
  )
}

/* ─── Usage & ingestion View ─── */
type Period = '7' | '14' | 'month'
type SignalFilter = 'all' | SignalKey
type KeyState = { status: 'active' | 'revoked'; created: string; lastUsed: string }

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

  const [keyState, setKeyState] = useState<KeyState>({ status: 'active', created: 'Jun 12, 2025', lastUsed: '2 hours ago' })
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
    setKeyState({ status: 'active', created: 'Just now', lastUsed: 'Never' })
    setKeyCopied(false)
    setKeyStep('reveal')
  }

  return (
    <div className={styles.usageStack}>
      {/* Quota & consumption */}
      <div className={styles.detailCard}>
        <div className={styles.cardHead}>
          <div className={styles.detailCardTitle}>Quota usage</div>
          <StatusTag variant="ghost" color={status.color}>{status.label}</StatusTag>
        </div>
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

      {/* Daily consumption chart */}
      <div className={styles.detailCard}>
        <div className={styles.cardHead}>
          <div>
            <div className={styles.detailCardTitle}>Daily consumption</div>
            <div className={styles.cardSub}>Ingested bytes per day vs daily budget · current month (UTC)</div>
          </div>
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
        </div>
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

      {/* Usage by signal */}
      <div className={styles.detailCard}>
        <div className={styles.detailCardTitle} style={{ marginBottom: 14 }}>Usage by signal</div>
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

      {/* Connection & OTLP key */}
      <div className={styles.detailCard}>
        <div className={styles.cardHead}>
          <div className={styles.detailCardTitle}>OTLP connection & key</div>
          <StatusTag variant="ghost" color={revoked ? 'failed' : 'success'}>{revoked ? 'Revoked' : 'Active'}</StatusTag>
        </div>
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
          <Input value={revoked ? '—' : OTLP_KEY_MASKED} canCopy={!revoked} mono disabled fullWidth size="m" />
        </div>
        <div className={styles.detailRow} style={{ marginTop: 6 }}><span className={styles.detailLabel}>Created</span><span>{keyState.created}</span></div>
        <div className={styles.detailRow}><span className={styles.detailLabel}>Last used</span><span>{keyState.lastUsed}</span></div>
        <div className={styles.cardFooter}>
          <Button color="danger-s" disabled={revoked} onClick={() => setKeyStep('revoke')}>Revoke key</Button>
          <Button color={revoked ? 'primary' : 'secondary'} icon={KeyRound} onClick={() => setKeyStep('issue')}>
            {revoked ? 'Issue key' : 'Issue new key'}
          </Button>
        </div>
      </div>

      {/* Retention */}
      <div className={styles.detailCard}>
        <div className={styles.cardHead}>
          <div className={styles.detailCardTitle}>Data retention</div>
          <StatusTag variant="ghost" color="info">{retTier}</StatusTag>
        </div>
        <div className={styles.cardSub} style={{ marginBottom: 12 }}>
          How long ingested signals stay queryable. Current tier {RETENTION_LABELS[retention]}.
        </div>
        <div style={{ maxWidth: 360 }}>
          <Select
            fullWidth
            value={retDraft}
            onChange={(_e, v) => setRetDraft(v)}
            options={[
              { label: 'Standard — 15 days', value: 'standard' },
              { label: 'Extended — 30 days', value: 'extended' },
              { label: 'Long-term — 90 days + cold tier', value: 'long' },
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

      {/* Adjust quota modal (triggered from the page header) */}
      <Modal open={quotaOpen} onCancel={() => setQuotaOpen(false)} title="Adjust monthly quota" width={440}>
        <Modal.Content>
          <div className={styles.cardSub} style={{ marginBottom: 14 }}>
            Ingestion keeps working above the cap — you are alerted and billed for overage.
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
            Copy it now — for security it's shown only once and never again.
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
              {keyCopied ? "I've stored it — done" : 'Copy the key first'}
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
          setKeyState((k) => ({ ...k, status: 'revoked', lastUsed: 'revoked' }))
          setKeyStep('none')
          toast.success('API key revoked successfully')
        }}
      >
        If you revoke this key, ingestion stops until you issue a new one. This action cannot be undone.
      </Alert>
    </div>
  )
}

/* ─── Main Proto ─── */
const ExploreTabsProto = () => {
  const [mode, setMode] = useState<'run' | 'obs'>('obs')
  const [tab, setTab] = useState<ExploreTab>('perses')

  // lifted view state (needed by header actions)
  const [logSearch, setLogSearch] = useState('')
  const [logLevel, setLogLevel] = useState('all')
  const [traceSearch, setTraceSearch] = useState('')
  const [traceSvc, setTraceSvc] = useState('all')
  const [selectedTraces, setSelectedTraces] = useState<string[]>([])

  // usage
  const [cap, setCap] = useState(9)
  const [quotaOpen, setQuotaOpen] = useState(false)

  // flows
  const [alertOpen, setAlertOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [configureOpen, setConfigureOpen] = useState(false)
  const [connectMethod, setConnectMethod] = useState<'helm' | 'kubectl'>('helm')
  const [clusterName, setClusterName] = useState('')

  // service map settings (Configure drawer)
  const [cfgInterval, setCfgInterval] = useState('15m')
  const [cfgLatencies, setCfgLatencies] = useState(true)
  const [cfgErrors, setCfgErrors] = useState(true)

  const emptyAlert: AlertDraft = { name: '', signal: 'logs', query: '', operator: 'gt', threshold: '', severity: 'warning', channel: 'slack' }
  const [alertDraft, setAlertDraft] = useState<AlertDraft>(emptyAlert)

  const meta = PAGE_META[tab]

  const toggleTrace = (key: string) =>
    setSelectedTraces((cur) => {
      if (cur.includes(key)) return cur.filter((k) => k !== key)
      if (cur.length >= 2) return [cur[1], key] // keep the 2 most recent
      return [...cur, key]
    })

  const openAlert = () => {
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
      case 'Compare traces':
        if (selectedTraces.length === 2) setCompareOpen(true)
        else toast.info('Select two traces to compare')
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
        toast.success('Pinned to traces-mirror — open Traces (Perses)')
        setTab('perses')
        break
      }
      default:
        break
    }
  }

  const actionDisabled = (label: string) => label === 'Compare traces' && selectedTraces.length !== 2

  const renderView = () => {
    switch (tab) {
      case 'logs':
        return <LogsView search={logSearch} setSearch={setLogSearch} level={logLevel} setLevel={setLogLevel} />
      case 'traces':
        return (
          <TracesView
            search={traceSearch}
            setSearch={setTraceSearch}
            svc={traceSvc}
            setSvc={setTraceSvc}
            selected={selectedTraces}
            toggleSelected={toggleTrace}
          />
        )
      case 'svcmap':
        return <ServiceMapView />
      case 'k8s':
        return <KubernetesView />
      case 'usage':
        return <UsageView cap={cap} setCap={setCap} quotaOpen={quotaOpen} setQuotaOpen={setQuotaOpen} />
      case 'perses':
        return <PersesView />
    }
  }

  const compareTraces = TRACES.filter((t) => selectedTraces.includes(t.key))

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
          <div className={styles.wsAvatar}>🐙</div>
          <div>
            <div className={styles.wsName}>kapptivate</div>
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
            <div className={styles.navLabel}>Explore</div>
            {NAV_EXPLORE.map((item) => (
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
        </div>

        <div className={styles.spacer} />
        <div className={styles.navSep} />
        <button className={styles.helpBtn}>?</button>
      </aside>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <div>
            <div className={styles.contentTitle}>{meta.title}</div>
            <div className={styles.contentSub}>{meta.sub}</div>
          </div>
          <div className={styles.contentActions}>
            {meta.actions.map((a) => (
              <Button
                key={a.label}
                color={a.primary ? 'primary' : 'secondary'}
                icon={a.label === 'Export' ? IconDownload : a.label === 'Create alert' ? Plus : a.label === 'Pin as panel' ? Pin : undefined}
                disabled={actionDisabled(a.label)}
                onClick={() => runAction(a.label)}
              >
                {a.label === 'Compare traces' && selectedTraces.length > 0 ? `Compare traces (${selectedTraces.length})` : a.label}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.contentBody}>{renderView()}</div>
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
              <label>Severity</label>
              <Select fullWidth value={alertDraft.severity} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, severity: v }))} options={ALERT_SEVERITIES} />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label>Notify</label>
              <Select fullWidth value={alertDraft.channel} onChange={(_e, v) => setAlertDraft((d) => ({ ...d, channel: v }))} options={ALERT_CHANNELS} />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFoot}>
            <Button color="invisible" onClick={() => setAlertOpen(false)}>Cancel</Button>
            <Button color="primary" onClick={createAlert}>Create alert</Button>
          </div>
        </Modal.Footer>
      </Modal>

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

      {/* Compare traces drawer */}
      <Drawer open={compareOpen} onClose={() => setCompareOpen(false)} title="Compare traces" width={560}>
        <div className={styles.compareGrid}>
          {compareTraces.map((t) => (
            <div key={t.key} className={styles.detailCard}>
              <div className={styles.traceName} style={{ marginBottom: 10 }}>
                <StatusTag variant="filled" color={t.status === 'error' ? 'failed' : 'success'}>{t.status === 'error' ? 'Error' : 'OK'}</StatusTag>
                {t.name}
              </div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Service</span><b>{t.svc}</b></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Duration</span><b>{t.dur}</b></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Spans</span><b>{t.spans}</b></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Trace ID</span><span className={styles.mono}>{t.key}</span></div>
              <div className={styles.traceWaterfall} style={{ marginTop: 12 }}>
                {t.bars.map((b, i) => (
                  <div key={i} className={styles.traceSpan} style={{ left: `${b.left}%`, width: `${b.width}%`, background: b.color }} title={b.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
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
