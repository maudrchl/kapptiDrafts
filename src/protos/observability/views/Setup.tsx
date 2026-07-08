import { Button, Banner } from 'ui-kit'
import { Check, Gauge, PlugZap, ServerCog } from 'lucide-react'
import styles from '../observability.module.scss'
import {
  OTLP_ENDPOINT,
  OTLP_HTTP_ENDPOINT,
  type TenantState,
} from '../constants'
import { Card, CodeBox } from '../components'

const Setup = ({
  tenant,
  onTenantChange,
}: {
  tenant: TenantState
  onTenantChange: (t: TenantState) => void
}) => {
  const provisioned = tenant !== 'not-provisioned'

  return (
    <div className={styles.body}>
      {/* Activation / tenant */}
      <Card
        title="Enablement"
        icon={<ServerCog size={15} />}
        aside={
          provisioned ? (
            <span className={styles.pillHealthy}>
              <Check size={12} /> Provisioned
            </span>
          ) : (
            <Button color="primary" onClick={() => onTenantChange('awaiting-data')}>
              Provision tenant
            </Button>
          )
        }
      >
        {provisioned ? (
          <div className={styles.muted} style={{ fontSize: 13 }}>
            The <b>test-obs</b> observability tenant is active in region{' '}
            <b>eu-west</b>. Retention: logs 15d · traces 7d · metrics 30d.
          </div>
        ) : (
          <div className={styles.muted} style={{ fontSize: 13 }}>
            No observability tenant exists yet for <b>test-obs</b>. Provisioning
            creates the ingestion space and applies the default quota.
          </div>
        )}
      </Card>

      <div className={styles.spacer} />

      {/* OTLP */}
      <Card
        title="OpenTelemetry ingestion (OTLP)"
        icon={<PlugZap size={15} />}
        sub="Point your collectors / SDK at these endpoints."
      >
        {!provisioned && (
          <div style={{ marginBottom: 14 }}>
            <Banner
              variant="warning"
              description="Provision the tenant first to enable ingestion."
            />
          </div>
        )}
        <div className={styles.stepDesc} style={{ marginBottom: 6 }}>
          <b>gRPC</b> (recommended)
        </div>
        <CodeBox
          lines={[
            ['OTEL_EXPORTER_OTLP_ENDPOINT=', OTLP_ENDPOINT],
            ['OTEL_EXPORTER_OTLP_PROTOCOL=', 'grpc'],
            ['OTEL_EXPORTER_OTLP_HEADERS=', 'x-kapp-key=••••••••'],
          ]}
        />
        <div className={styles.stepDesc} style={{ margin: '16px 0 6px' }}>
          <b>HTTP</b>
        </div>
        <CodeBox lines={[['POST', `${OTLP_HTTP_ENDPOINT}/logs`], ['POST', `${OTLP_HTTP_ENDPOINT}/traces`]]} />
      </Card>

      <div className={styles.spacer} />

      {/* Quota */}
      <Card title="Quota" icon={<Gauge size={15} />} aside={<Button color="secondary">Configure</Button>}>
        {[
          { label: 'Logs', used: 3.1, total: 10, unit: 'GB/day' },
          { label: 'Traces', used: 0.8, total: 5, unit: 'GB/day' },
          { label: 'Metrics', used: 1.2, total: 2, unit: 'M series' },
        ].map((q) => {
          const pct = Math.round((q.used / q.total) * 100)
          return (
            <div key={q.label} className={styles.resRow}>
              <div className={styles.resTop}>
                <span>{q.label}</span>
                <b>
                  {q.used} / {q.total} {q.unit} ({pct}%)
                </b>
              </div>
              <div className={styles.resBar}>
                <div
                  className={styles.resFill}
                  style={{ width: `${pct}%`, background: pct > 80 ? '#e0372e' : '#1c4a47' }}
                />
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

export default Setup
