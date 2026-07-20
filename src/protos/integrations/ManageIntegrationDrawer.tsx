import { useState } from 'react'
import {
  Button,
  Drawer,
  IconExternalLink,
  IconGlobe,
  IconPlay,
  Select,
  Separator,
  Toggle,
} from '@kapptivate/ui-kit'
import { brands } from './brands'
import type {
  DrawerSetting,
  Integration,
  IntegrationCategory,
  UsageItem,
} from './constants'
import styles from './integrations.module.scss'

/** Toggle piloté par un état local pour que la maquette réagisse au clic. */
const LiveToggle = ({
  title,
  description,
  on,
}: {
  title: string
  description: string
  on: boolean
}) => {
  const [value, setValue] = useState(on)
  return (
    <Toggle title={title} description={description} value={value} onChange={setValue} />
  )
}

/* ── Réglages génériques par catégorie (fallback quand le tool vient d'être connecté) ── */

const DEFAULT_CHANNEL: DrawerSetting = {
  type: 'select',
  title: 'Default channel',
  options: ['#incidents', '#alerts-rocket', '#eng-oncall', '#general'],
  value: '#incidents',
}

const GENERIC_ISSUE_PROPS: DrawerSetting[] = [
  {
    type: 'select',
    title: 'Default project',
    options: ['Rocket Web (RKT)', 'Mobile App (MOB)', 'Infrastructure (INF)'],
    value: 'Rocket Web (RKT)',
  },
  {
    type: 'select',
    title: 'Issue type',
    options: ['Bug', 'Task', 'Incident'],
    value: 'Bug',
  },
]

/** Choix du modèle par défaut pour un assistant IA sans config dédiée. */
const GENERIC_AI_SETTINGS: DrawerSetting[] = [
  {
    type: 'select',
    title: 'Model',
    options: ['Claude Sonnet 5', 'GPT-5', 'Gemini 2.5 Pro'],
    value: 'Claude Sonnet 5',
  },
]

type Resolved = {
  settings?: DrawerSetting[]
  usage?: { title: string; items: UsageItem[] }
  showTest: boolean
  settingsTitle: string
}

const resolve = (integration: Integration, category: IntegrationCategory): Resolved => {
  const m = integration.manage
  const emptyUsage = { title: `Alerts using ${integration.name}`, items: [] as UsageItem[] }

  if (category === 'ai')
    return {
      settings: m?.settings ?? GENERIC_AI_SETTINGS,
      showTest: false,
      settingsTitle: 'Assistant settings',
    }
  if (category === 'communication')
    return {
      settings: m?.settings ?? [DEFAULT_CHANNEL],
      usage: m?.usage ?? emptyUsage,
      showTest: true,
      settingsTitle: 'Channel',
    }
  if (category === 'pm')
    return {
      settings: m?.settings ?? GENERIC_ISSUE_PROPS,
      usage: m?.usage ?? emptyUsage,
      showTest: true,
      settingsTitle: 'Issue properties',
    }
  // device : rien de plus pour l'instant (servira à connecter des devices)
  return { showTest: false, settingsTitle: '' }
}

const websiteFor = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`

type Props = {
  integration: Integration | null
  category: IntegrationCategory
  mode: 'manage' | 'connect'
  open: boolean
  onClose: () => void
  onConnect: (integration: Integration) => void
  onDisconnect: (integration: Integration) => void
  onTestAlert: (integration: Integration, target?: string) => void
}

const ManageIntegrationDrawer = ({
  integration,
  category,
  mode,
  open,
  onClose,
  onConnect,
  onDisconnect,
  onTestAlert,
}: Props) => {
  const since = integration?.manage?.since ?? 'just now'
  const resolved = integration ? resolve(integration, category) : null

  const renderSettings = (settings: DrawerSetting[], title: string) => (
    <div className={styles.settingsSection}>
      <div className={styles.settingsHead}>{title}</div>
      <div className={styles.settings}>
        {settings.map((s) =>
          s.type === 'toggle' ? (
            <LiveToggle key={s.title} title={s.title} description={s.desc} on={s.on} />
          ) : (
            <div key={s.title} className={styles.selectRow}>
              <Select
                label={s.title}
                options={s.options.map((o) => ({ label: o, value: o }))}
                defaultValue={s.value}
                fullWidth
              />
            </div>
          ),
        )}
      </div>
    </div>
  )

  return (
    <Drawer title="Integration details" open={open} onClose={onClose} width={480}>
      {integration && resolved && (
        <div className={styles.drawerBody}>
          {/* Hero */}
          <div className={styles.detailHero}>
            <div className={styles.detailIdentity}>
              <div className={styles.detailIcon}>{brands[integration.brand]}</div>
              <div>
                <div className={styles.detailName}>{integration.name}</div>
                <div className={styles.detailTagline}>{integration.description}</div>
              </div>
            </div>
          </div>

          {mode === 'connect' ? (
            <>
              <div className={styles.metaCard}>
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Built by</div>
                    <div className={styles.metaValue}>{integration.name}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Website</div>
                    <a className={styles.metaLink}>
                      <IconGlobe size={14} />
                      <span className={styles.metaEllipsis}>
                        {websiteFor(integration.name)}
                      </span>
                    </a>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Status</div>
                    <div className={styles.metaStatusOff}>
                      <span className={styles.statusDot} />
                      Not connected
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Docs</div>
                    <a className={styles.metaLink}>
                      <IconExternalLink size={14} />
                      Docs
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.drawerAction}>
                <Button
                  color="primary"
                  icon={IconExternalLink}
                  iconRight
                  onClick={() => onConnect(integration)}
                >
                  Connect
                </Button>
              </div>

              <div className={styles.docSection}>
                <div className={styles.docHead}>How it works</div>
                <p className={styles.docText}>
                  Once {integration.name} is enabled, Kapptivate can push incidents
                  and monitoring events to it and keep statuses in sync. Nothing is
                  shared until you turn it on.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Meta card */}
              <div className={styles.metaCard}>
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Enabled on</div>
                    <div className={styles.metaValue}>{since}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Status</div>
                    <div className={styles.metaStatusOn}>
                      <span className={styles.statusDot} />
                      Connected
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Docs</div>
                    <a className={styles.metaLink}>
                      <IconExternalLink size={14} />
                      Docs
                    </a>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Website</div>
                    <a className={styles.metaLink}>
                      <IconGlobe size={14} />
                      <span className={styles.metaEllipsis}>
                        {websiteFor(integration.name)}
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.drawerAction}>
                <Button color="danger-s" onClick={() => onDisconnect(integration)}>
                  Disconnect
                </Button>
              </div>

              {(resolved.settings?.length || resolved.showTest || resolved.usage) && (
                <Separator type="horizontal" className={styles.drawerDivider} />
              )}

              {resolved.settings?.length
                ? renderSettings(resolved.settings, resolved.settingsTitle)
                : null}

              {resolved.showTest && (
                <div className={styles.drawerAction}>
                  <Button
                    color="secondary"
                    icon={IconPlay}
                    onClick={() =>
                      onTestAlert(
                        integration,
                        resolved.settings?.find(
                          (s): s is Extract<DrawerSetting, { type: 'select' }> =>
                            s.type === 'select',
                        )?.value,
                      )
                    }
                  >
                    Send test alert
                  </Button>
                </div>
              )}

              {resolved.usage && (
                <div className={styles.settingsSection}>
                  {(resolved.settings?.length || resolved.showTest) && (
                    <Separator type="horizontal" className={styles.drawerDivider} />
                  )}
                  <div className={styles.settingsHead}>{resolved.usage.title}</div>
                  {resolved.usage.items.length ? (
                    <div className={styles.usageList}>
                      {resolved.usage.items.map((a) => (
                        <div className={styles.usageRow} key={a.name}>
                          <span className={styles.usageName}>{a.name}</span>
                          <span className={styles.usageTarget}>{a.target}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.usageEmpty}>
                      No alert uses {integration.name} yet. Choose it as a
                      destination when you set up an alert's flow.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Drawer>
  )
}

export default ManageIntegrationDrawer
