import { Fragment } from 'react'
import type { ComponentType, ReactNode } from 'react'
import {
  Button,
  Card,
  Banner,
  StatusTag,
  Table,
  CounterCard,
  CounterCardGroup,
  useNotification,
  IconActivity,
  IconAlertTriangle,
  IconSparkle,
  IconServer,
  IconPlay,
} from '@kapptivate/ui-kit'
import {
  RefreshCw,
  Pencil,
  Search,
  FileText,
  ArrowRight,
  ChevronRight,
  XCircle,
} from 'lucide-react'
import styles from './rca.module.scss'

/* ─── Mock data (une exécution de test qui échoue + RCA AI) ─── */
const EXEC = {
  title: "1 - Ajout d'un animal entre 0 et 2 mois",
  by: 'alex.kapptivate',
  duration: '32.44s',
  device: 'web-agent-b1',
  environment: 'Production',
}

const VERDICT = {
  cause: 'Payment declined: insufficient funds',
  summary:
    'The payment service declined the transaction for insufficient funds, so the order API returned a 402 Payment Required and the test failed. No performance anomalies: response times were normal for successful calls.',
  confidence: 'High confidence',
}

type ChainNode = {
  key: string
  icon: ComponentType<any>
  label: string
  detail: string
  mono?: boolean
  cause?: boolean
  opens: string
}

const CHAIN: ChainNode[] = [
  { key: 'step', icon: XCircle, label: 'Ajouter un animal', detail: 'Step failed after 5.2s', opens: 'the failed step' },
  { key: 'api', icon: IconActivity, label: 'POST /api/order', detail: '402 Payment Required', mono: true, opens: 'the order API span' },
  { key: 'pay', icon: IconServer, label: 'Payment service', detail: 'Transaction declined', opens: 'the payment service logs' },
  { key: 'cause', icon: IconAlertTriangle, label: 'Insufficient funds', detail: 'Account balance too low', cause: true, opens: 'the decline event' },
]

type EvidenceRow = {
  key: string
  signal: string
  source: string
  detail: ReactNode
  kind: 'trace' | 'log'
  dot: string
  opens: string
}

const RECOMMENDATIONS = [
  "Verify the payment provider's test environment and account balance so it allows the test transaction.",
  'Check that the test credentials are configured for a successful payment, and review the payment service error handling.',
  'If the decline was unexpected, confirm the payment mock/setup; otherwise update the test data to reflect real limits.',
  'Consider adding retry or fallback logic in the automation if transient declines are possible.',
]

const WF_GROUPS = [
  { label: 'Step group #1', flex: 3, fail: false },
  { label: 'Step group #2', flex: 3, fail: false },
  { label: 'Step group #3', flex: 2.5, fail: true },
]
const WF_STEPS = [0.5, 0.6, 1, 1, 1, 0.8, 1, 1, 0.9, 1, 1, 0.8, 1, 2]
const WF_SPANS = [
  { left: 33, error: false, heights: [28] },
  { left: 50, error: false, heights: [28] },
  { left: 78, error: true, heights: [24, 18] },
  { left: 83, error: false, heights: [20, 24] },
]

const Proto = () => {
  const { notification } = useNotification()
  const open = (what: string) => notification.info(`Opening ${what}…`)

  const evidence: EvidenceRow[] = [
    { key: 'e1', signal: 'Order API span', source: 'trace · root span', kind: 'trace', dot: styles.evDotTrace, opens: 'the trace span', detail: (<span className={styles.evDetail}><span className={styles.codeTag}>POST /api/order</span> returned <span className={styles.codeErr}>402</span> in 308ms</span>) },
    { key: 'e2', signal: 'Payment validation', source: 'log · 11:27:57.795', kind: 'log', dot: styles.evDotLog, opens: 'the log line', detail: (<span className={styles.evDetail}>Validation OK for €15.50</span>) },
    { key: 'e3', signal: 'Payment declined', source: 'log · 11:27:58.058', kind: 'log', dot: styles.evDotError, opens: 'the log line', detail: (<span className={styles.evDetail}>Declined with message <span className={styles.codeErr}>insufficient funds</span></span>) },
    { key: 'e4', signal: 'Demo-site log', source: 'log · order ORD-MNX3ZE5G', kind: 'log', dot: styles.evDotLog, opens: 'the log line', detail: (<span className={styles.evDetail}>Payment processing failed: payment declined</span>) },
  ]

  const evColumns = [
    {
      title: 'Signal', dataIndex: 'signal', key: 'signal',
      render: (v: string, r: EvidenceRow) => (
        <span className={styles.evSignal}><span className={r.dot} />{v}</span>
      ),
    },
    { title: 'Source', dataIndex: 'source', key: 'source', width: 200, render: (v: string) => <span className={styles.mono}>{v}</span> },
    { title: 'Detail', key: 'detail', render: (_v: unknown, r: EvidenceRow) => r.detail },
    {
      title: '', key: 'go', width: 60,
      render: (_v: unknown, r: EvidenceRow) => (
        <span className={styles.evChevron} title={r.kind === 'trace' ? 'View span' : 'View log'}>
          {r.kind === 'trace' ? <Search /> : <FileText />}
        </span>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      {/* Contexte d'exécution */}
      <div className={styles.ctxHeader}>
        <div>
          <div className={styles.ctxCrumb}>Executions</div>
          <div className={styles.ctxTitleRow}>
            <h1 className={styles.ctxTitle}>{EXEC.title}</h1>
            <StatusTag variant="ghost" color="failed">Failed</StatusTag>
          </div>
        </div>
        <div className={styles.ctxActions}>
          <Button color="secondary" icon={Pencil} onClick={() => open('the related test')}>Edit related test</Button>
          <Button color="primary" icon={IconPlay} onClick={() => notification.info('Re-running the test…')}>Run again</Button>
        </div>
      </div>

      {/* Meta de l'exécution */}
      <CounterCardGroup>
        <CounterCard title="Duration" value={EXEC.duration} trend={<StatusTag variant="ghost" color="success">no slowdown</StatusTag>} />
        <CounterCard title="Steps run" value="1 / 2" trend={<StatusTag variant="ghost" color="failed">1 failed</StatusTag>} />
        <CounterCard title="Recurrence" value="4×" trend={<StatusTag variant="ghost" color="warning">this week</StatusTag>} />
        <CounterCard title="Environment" value={EXEC.environment} trend={<StatusTag variant="ghost" color="info">{EXEC.device}</StatusTag>} />
      </CounterCardGroup>

      {/* Verdict-first: la cause racine en une ligne */}
      <Banner
        variant="error"
        description={VERDICT.cause}
        subDescription={VERDICT.summary}
        icon={<IconAlertTriangle size={18} />}
        aside={<Button color="secondary" size="s" icon={FileText} onClick={() => open('the related logs')}>View logs</Button>}
      />

      {/* Analyse AI: chaîne de causalité + evidence + recommandations */}
      <Card className={styles.card}>
        <Card.Header
          title="Root cause analysis"
          icon={IconSparkle}
          asideContent={
            <div className={styles.headAside}>
              <StatusTag variant="ghost" color="info">{`AI · ${VERDICT.confidence}`}</StatusTag>
              <Button color="secondary" size="s" icon={RefreshCw} onClick={() => notification.info('Re-analyzing the execution…')}>Re-analyze</Button>
            </div>
          }
        />
        <Card.Content>
          <div className={styles.cardBody}>
            {/* Chaîne de causalité */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}><ArrowRight />Causal chain</div>
              <div className={styles.chain}>
                {CHAIN.map((n, i) => {
                  const Icon = n.icon
                  return (
                    <Fragment key={n.key}>
                      <button
                        type="button"
                        className={n.cause ? `${styles.node} ${styles.nodeCause}` : styles.node}
                        onClick={() => open(n.opens)}
                      >
                        <span className={styles.nodeIcon}><Icon size={15} /></span>
                        <span className={`${styles.nodeLabel} ${n.mono ? styles.nodeMono : ''}`}>{n.label}</span>
                        <span className={styles.nodeDetail}>{n.detail}</span>
                      </button>
                      {i < CHAIN.length - 1 && <span className={styles.chainArrow}><ChevronRight /></span>}
                    </Fragment>
                  )
                })}
              </div>
            </div>

            {/* Evidence corrélée */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}><Search />Evidence</div>
              <Table
                rowKey="key"
                columns={evColumns}
                data={evidence}
                showHeader
                onClickRow={(r: EvidenceRow) => open(r.opens)}
              />
            </div>

            {/* Recommandations */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}><Pencil />Recommendations</div>
              <ul className={styles.recList}>
                {RECOMMENDATIONS.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <p className={styles.conclusion}><strong>Overall,</strong> this is a payment issue, not a system or network performance problem.</p>
          </div>
        </Card.Content>
      </Card>

      {/* Traces */}
      <Card className={styles.card}>
        <Card.Header
          title="Traces"
          icon={IconActivity}
          asideContent={<StatusTag variant="ghost" color="info">9 spans across 5 traces</StatusTag>}
        />
        <Card.Content>
          <div className={styles.cardBody}>
            <div className={styles.wf}>
              <div className={styles.wfRuler}><span>0ms</span><span>50.0s</span><span>100.0s</span></div>

              <div className={styles.wfRow}>
                <span className={styles.wfLabel}>Test</span>
                <div className={styles.wfTrack}>
                  <span className={styles.wfBarFail} style={{ flex: 1 }}><XCircle />Test</span>
                </div>
              </div>

              <div className={styles.wfRow}>
                <span className={styles.wfLabel}>Groups</span>
                <div className={styles.wfTrack}>
                  {WF_GROUPS.map((g) => (
                    <span key={g.label} className={g.fail ? styles.wfBarFail : styles.wfBarGroup} style={{ flex: g.flex }}>
                      {g.fail && <XCircle />}{g.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.wfRow}>
                <span className={styles.wfLabel}>Steps</span>
                <div className={styles.wfTrack} style={{ gap: 2 }}>
                  {WF_STEPS.map((f, i) => (
                    <span key={i} className={i === WF_STEPS.length - 1 ? styles.wfStepFail : styles.wfStep} style={{ flex: f }}>
                      {i === WF_STEPS.length - 1 ? '⊘' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`${styles.wfRow} ${styles.wfSpanRow}`}>
                <span className={styles.wfLabel}>Spans</span>
                <div className={styles.wfTrack}>
                  {WF_SPANS.map((s, i) => (
                    <span key={i} className={styles.wfSpanCol} style={{ left: `${s.left}%` }}>
                      {s.heights.map((h, j) => (
                        <span key={j} className={s.error ? styles.wfSpanErr : styles.wfSpan} style={{ height: h }} />
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default Proto
