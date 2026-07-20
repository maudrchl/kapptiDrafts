import { ManagementSidebar } from '@kapptivate/ui-kit'
import styles from './integrations.module.scss'

/**
 * Sidebar d'administration = composant ui-kit `ManagementSidebar`
 * (compound API : ManagementSidebar.Section + ManagementSidebar.Item).
 * L'item actif est marqué via une classe ancêtre `.active`.
 */
const SettingsSidebar = () => (
  <ManagementSidebar
    footer={
      <div
        style={{
          padding: '12px 12px',
          fontSize: 11,
          lineHeight: 1.6,
          color: 'var(--color-text-third, #98a2b3)',
        }}
      >
        V: 8.85.0
        <br />
        GUI: 15.53.0
      </div>
    }
  >
    <div className={styles.wsCard}>
      <img className={styles.wsLogo} src="/operator-logo.svg" alt="" />
      <div>
        <div className={styles.wsName} title="Rocket Corp">
          Rocket Corp
        </div>
        <div className={styles.wsLabel}>Workspace</div>
      </div>
    </div>

    <ManagementSidebar.Section title="My account">
      <ManagementSidebar.Item label="Preferences" />
      <ManagementSidebar.Item label="Profile" />
    </ManagementSidebar.Section>

    <ManagementSidebar.Section title="Workspace">
      <ManagementSidebar.Item label="Products" />
      <ManagementSidebar.Item label="Users" />
      <ManagementSidebar.Item label="Teams" />
      <ManagementSidebar.Item label="Roles" />
    </ManagementSidebar.Section>

    <ManagementSidebar.Section title="Administration">
      <ManagementSidebar.Item label="Notifications" />
      <div className="active">
        <ManagementSidebar.Item label="Integrations" />
      </div>
      <ManagementSidebar.Item label="API Keys" />
      <ManagementSidebar.Item label="Security policies" />
      <ManagementSidebar.Item label="Event log" />
    </ManagementSidebar.Section>

    <ManagementSidebar.Section title="Help">
      <ManagementSidebar.Item label="Documentation" external />
    </ManagementSidebar.Section>
  </ManagementSidebar>
)

export default SettingsSidebar
