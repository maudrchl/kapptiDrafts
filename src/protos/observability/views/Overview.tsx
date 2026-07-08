import { Button, Banner } from '@kapptivate/ui-kit'
import {
  Activity,
  Bell,
  Boxes,
  Check,
  Gauge,
  Network,
  PlugZap,
  ScrollText,
  Timer,
  Zap,
} from 'lucide-react'
import styles from '../observability.module.scss'
import {
  ALERTS,
  OTLP_ENDPOINT,
  SERVICES,
  type TenantState,
  type ViewKey,
} from '../constants'
import { Card, CodeBox, HealthPill, Kpi } from '../components'

type Props = {
  tenant: TenantState
  onNavigate: (v: ViewKey) => void
  onTenantChange: (t: TenantState) => void
}

/* ---------- Onboarding (états 1 & 2) ---------- */
const Onboarding = ({ tenant, onNavigate, onTenantChange }: Props) => {
  const provisioned = tenant !== 'not-provisioned'

  const stepIx = (done: boolean, active: boolean) =>
    done ? styles.stepIxDone : active ? styles.stepIxActive : styles.stepIx

  return (
    <div className={styles.body}>
      <div className={styles.onbCard}>
        <div className={styles.onbHero}>
          <div className={styles.onbBadge}>
            <Activity size={26} />
          </div>
          <div>
            <div className={styles.onbTitle}>
              {provisioned
                ? 'Almost there — waiting for your first data'
                : 'Enable observability for test-obs'}
            </div>
            <div className={styles.onbText}>
              {provisioned
                ? 'The tenant is provisioned. Point your OpenTelemetry exporters at the endpoint below: logs, metrics and traces will show up here automatically.'
                : 'Collect logs, metrics and traces from your services via OpenTelemetry, without leaving kapptivate. We’ll guide you in 3 steps.'}
            </div>
          </div>
        </div>

        <div className={styles.steps}>
          {/* Étape 1 — provisionnement */}
          <div className={styles.step}>
            <div className={stepIx(provisioned, !provisioned)}>
              {provisioned ? <Check size={15} /> : '1'}
            </div>
            <div className={styles.stepMain}>
              <div className={styles.stepTitle}>Provision the tenant</div>
              <div className={styles.stepDesc}>
                Creates the workspace’s isolated ingestion space and its default quota.
              </div>
              {!provisioned && (
                <div className={styles.stepActions}>
                  <Button
                    color="primary"
                    onClick={() => onTenantChange('awaiting-data')}
                  >
                    Provision
                  </Button>
                  <span className={styles.muted} style={{ fontSize: 12.5 }}>
                    Super-administrators only
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Étape 2 — OTLP */}
          <div className={styles.step}>
            <div className={stepIx(false, provisioned)}>2</div>
            <div className={styles.stepMain}>
              <div className={styles.stepTitle}>
                Configure OpenTelemetry export
                <PlugZap size={15} color="#98a2b3" />
              </div>
              <div className={styles.stepDesc}>
                Add this OTLP endpoint to your collectors / SDK configuration.
              </div>
              {provisioned && (
                <>
                  <CodeBox
                    lines={[
                      ['OTEL_EXPORTER_OTLP_ENDPOINT=', OTLP_ENDPOINT],
                      ['OTEL_EXPORTER_OTLP_PROTOCOL=', 'grpc'],
                      ['OTEL_EXPORTER_OTLP_HEADERS=', 'x-kapp-key=••••••••'],
                    ]}
                  />
                  <div className={styles.stepActions}>
                    <Button color="secondary" onClick={() => onNavigate('setup')}>
                      View ingestion docs
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Step 3 — data */}
          <div className={styles.step}>
            <div className={stepIx(false, false)}>3</div>
            <div className={styles.stepMain}>
              <div className={styles.stepTitle}>Receive data</div>
              <div className={styles.stepDesc}>
                As soon as the first data point arrives, Explore, Services and
                Dashboards activate automatically.
              </div>
              {provisioned && (
                <div className={styles.waiting}>
                  <span className={styles.pulse} />
                  Listening on the OTLP endpoint… no data received yet.
                  <span
                    className={styles.link}
                    onClick={() => onTenantChange('active')}
                  >
                    Simulate reception
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Overview actif (état 3) ---------- */
const ActiveOverview = ({ onNavigate }: Props) => {
  const firing = ALERTS.filter((a) => a.status === 'firing')
  const down = SERVICES.filter((s) => s.health !== 'healthy')

  return (
    <div className={styles.body}>
      {firing.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Banner
            variant="error"
            description={`${firing.length} alerts currently firing`}
            subDescription={
              <>
                <b>inventory</b> stopped receiving data and <b>checkout</b> is over
                its error threshold. Likely impact on the checkout funnel.
              </>
            }
            icon={<Bell size={18} />}
            aside={
              <Button color="secondary" size="s" onClick={() => onNavigate('alerts')}>
                View alerts
              </Button>
            }
          />
        </div>
      )}

      <div className={styles.kpiGrid}>
        <Kpi
          label="Ingestion"
          icon={<Zap size={14} />}
          value="4.2M"
          foot="events / last hour"
          trend="flat"
        />
        <Kpi
          label="p95 latency"
          icon={<Timer size={14} />}
          value="128 ms"
          foot="+18% vs yesterday"
          trend="up"
        />
        <Kpi
          label="Error rate"
          icon={<Gauge size={14} />}
          value="1.4%"
          foot="+0.9 pt vs yesterday"
          trend="up"
        />
        <Kpi
          label="Healthy services"
          icon={<Network size={14} />}
          value={`${SERVICES.length - down.length}/${SERVICES.length}`}
          foot={`${down.length} to watch`}
          trend="down"
        />
      </div>

      <div className={styles.grid2}>
        <Card
          title="Service health"
          icon={<Network size={15} />}
          aside={
            <span className={styles.link} onClick={() => onNavigate('services')}>
              View all
            </span>
          }
          bodyPad={false}
        >
          <table className={styles.table}>
            <tbody>
              {SERVICES.map((s) => (
                <tr key={s.name} className={styles.trHover}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>
                    {s.name}
                  </td>
                  <td className={styles.td}>
                    <HealthPill health={s.health} />
                  </td>
                  <td className={`${styles.td} ${styles.num}`}>
                    {s.health === 'down' ? '—' : `${s.p95} ms`}
                  </td>
                  <td className={`${styles.td} ${styles.num} ${styles.muted}`}>
                    {s.errorRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title="Active alerts"
          icon={<Bell size={15} />}
          aside={
            <span className={styles.link} onClick={() => onNavigate('alerts')}>
              View all
            </span>
          }
          bodyPad={false}
        >
          <table className={styles.table}>
            <tbody>
              {firing.map((a) => (
                <tr key={a.name} className={styles.trHover}>
                  <td className={styles.td}>
                    <span
                      className={
                        a.severity === 'critical' ? styles.dotDown : styles.dotDegraded
                      }
                    />
                  </td>
                  <td className={styles.td} style={{ fontWeight: 500 }}>
                    {a.name}
                  </td>
                  <td className={`${styles.td} ${styles.num} ${styles.mono}`}>
                    {a.value}
                  </td>
                  <td className={`${styles.td} ${styles.muted}`}>{a.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className={styles.spacer} />

      <div className={styles.grid3}>
        {[
          { icon: ScrollText, label: 'Logs', v: '3.1M', s: 'lines / h' },
          { icon: Network, label: 'Traces', v: '842K', s: 'spans / h' },
          { icon: Boxes, label: 'Active pods', v: '48', s: 'across 3 nodes' },
        ].map((c) => {
          const I = c.icon
          return (
            <Card key={c.label} title={c.label} icon={<I size={15} />}>
              <div className={styles.kpiValue} style={{ margin: 0 }}>
                {c.v}
              </div>
              <div className={styles.muted} style={{ fontSize: 12.5 }}>
                {c.s}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const Overview = (props: Props) => {
  if (props.tenant === 'active') return <ActiveOverview {...props} />
  return <Onboarding {...props} />
}

export default Overview
