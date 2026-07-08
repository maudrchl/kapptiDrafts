import { ManagementSidebar } from '@kapptivate/ui-kit'
import styles from './ai-usage.module.scss'

/**
 * Sidebar d'administration = vrai composant ui-kit `ManagementSidebar`
 * (compound API : ManagementSidebar.Section + ManagementSidebar.Item).
 *
 * Note : le composant réel ne gère ni icône ni prop `active`.
 * L'item actif est marqué via une classe ancêtre `.active`
 * (cf. `:global(.active) &` dans item.module.scss du ui-kit).
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
        V: 8.85.0-hotfix.1
        <br />
        GUI: 15.53.0-hotfix.1
      </div>
    }
  >
    <div className={styles.wsCard}>
      <div className={styles.wsAvatar}>k</div>
      <div>
        <div className={styles.wsName}>kapptivate</div>
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
      <ManagementSidebar.Item label="Settings" />
    </ManagementSidebar.Section>

    <ManagementSidebar.Section title="Administration">
      <div className="active">
        <ManagementSidebar.Item label="AI Usage" />
      </div>
      <ManagementSidebar.Item label="Notifications" />
      <ManagementSidebar.Item label="CI/CD" />
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
