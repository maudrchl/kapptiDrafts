import {
  IconSlidersHorizontal,
  IconUser2,
  IconBox,
  IconUsers2,
  IconShield,
  IconBell,
  IconKeyRound,
  IconList,
  IconBookOpen,
  IconExternalLink,
} from 'ui-kit'
import { Wallet, ShieldCheck } from 'lucide-react'
import styles from './ai-usage.module.scss'

const NAV_ITEMS = [
  { section: 'My account' },
  { label: 'Preferences', icon: IconSlidersHorizontal },
  { label: 'Profile', icon: IconUser2 },
  { section: 'Workspace' },
  { label: 'Products', icon: IconBox },
  { label: 'Users', icon: IconUsers2 },
  { label: 'Teams', icon: IconUsers2 },
  { label: 'Roles', icon: IconShield },
  { section: 'Administration' },
  { label: 'AI Usage', icon: Wallet, active: true },
  { label: 'Notifications', icon: IconBell },
  { label: 'API Keys', icon: IconKeyRound },
  { label: 'Security policies', icon: ShieldCheck },
  { label: 'Event log', icon: IconList },
  { section: 'Help' },
  { label: 'Documentation', icon: IconBookOpen, external: true },
] as const

const SettingsSidebar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.navScroll}>
        <div className={styles.wsCard}>
          <div className={styles.wsAvatar}>
            <Wallet size={14} />
          </div>
          <div>
            <div className={styles.wsName}>kapptivate</div>
            <div className={styles.wsLabel}>Workspace</div>
          </div>
        </div>

        {NAV_ITEMS.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} className={styles.navSection}>
                {item.section}
              </div>
            )
          }
          const Icon = item.icon
          return (
            <div
              key={i}
              className={
                'active' in item && item.active
                  ? styles.navItemActive
                  : styles.navItem
              }
            >
              <Icon size={16} />
              {item.label}
              {'external' in item && item.external && (
                <IconExternalLink size={13} style={{ marginLeft: -4 }} />
              )}
            </div>
          )
        })}
      </div>
      <div className={styles.navFoot}>
        V: 8.85.0-hotfix.1
        <br />
        GUI: 15.53.0-hotfix.1
      </div>
    </nav>
  )
}

export default SettingsSidebar
