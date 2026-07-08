import { useState } from 'react'
import { Command } from 'lucide-react'
import styles from './observability.module.scss'
import {
  NAV,
  VIEW_TITLES,
  type NavModel,
  type TenantState,
  type ViewKey,
} from './constants'
import Sidebar from './Sidebar'
import MainSidebar from './MainSidebar'
import SecondaryNav from './SecondaryNav'
import Topbar from './Topbar'
import DemoBar from './DemoBar'
import Overview from './views/Overview'
import Explore from './views/Explore'
import Dashboards from './views/Dashboards'
import Services from './views/Services'
import Infrastructure from './views/Infrastructure'
import Alerts from './views/Alerts'
import Setup from './views/Setup'

const OBS_SECTIONS = NAV.flatMap((g) => g.items)

const ObservabilityPage = () => {
  const [navModel, setNavModel] = useState<NavModel>('separate')
  const [view, setView] = useState<ViewKey>('overview')
  const [tenant, setTenant] = useState<TenantState>('not-provisioned')

  const meta = VIEW_TITLES[view]
  const showTopbar = tenant === 'active' && view !== 'setup'

  const renderView = () => {
    switch (view) {
      case 'overview':
        return <Overview tenant={tenant} onNavigate={setView} onTenantChange={setTenant} />
      case 'explore':
        return <Explore tenant={tenant} onNavigate={setView} />
      case 'dashboards':
        return <Dashboards tenant={tenant} onNavigate={setView} />
      case 'services':
        return <Services tenant={tenant} onNavigate={setView} />
      case 'infrastructure':
        return <Infrastructure tenant={tenant} onNavigate={setView} />
      case 'alerts':
        return <Alerts tenant={tenant} onNavigate={setView} />
      case 'setup':
        return <Setup tenant={tenant} onTenantChange={setTenant} />
    }
  }

  const obsHeader = (
    <div className={styles.head}>
      <div>
        <div className={styles.headTitle}>{meta.title}</div>
        <div className={styles.headSub}>{meta.sub}</div>
      </div>
    </div>
  )

  const demoBar = (
    <DemoBar
      tenant={tenant}
      navModel={navModel}
      onTenantChange={setTenant}
      onNavModelChange={setNavModel}
    />
  )

  /* ---------- Option 1 : app / workspace séparé ---------- */
  if (navModel === 'separate') {
    return (
      <div className={styles.app}>
        <Sidebar view={view} tenant={tenant} onNavigate={setView} />
        <div className={styles.main}>
          {showTopbar && <Topbar />}
          <div className={styles.content}>
            {obsHeader}
            {renderView()}
          </div>
        </div>
        {demoBar}
      </div>
    )
  }

  /* ---------- Option 2 : item top-level + colonne secondaire ---------- */
  if (navModel === 'toplevel') {
    return (
      <div className={styles.app}>
        <MainSidebar active="Observability" onObsClick={() => setView('overview')} />
        <SecondaryNav view={view} tenant={tenant} onNavigate={setView} />
        <div className={styles.main}>
          {showTopbar && <Topbar />}
          <div className={styles.content}>
            {obsHeader}
            {renderView()}
          </div>
        </div>
        {demoBar}
      </div>
    )
  }

  /* ---------- Option 3 : contextuel, dans un produit ---------- */
  return (
    <div className={styles.app}>
      <MainSidebar active="Website" />
      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.prodHead}>
            <div className={styles.prodCrumb}>By product / Website</div>
            <div className={styles.prodTitle}>
              <span className={styles.prodBadge}>
                <Command size={17} />
              </span>
              Website
            </div>
            <div className={styles.prodTabs}>
              {['Overview', 'Tests', 'Executions', 'Monitors', 'Observability', 'Variables'].map(
                (t) => (
                  <div
                    key={t}
                    className={t === 'Observability' ? styles.prodTabActive : styles.prodTab}
                  >
                    {t}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className={styles.subTabs}>
            {OBS_SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  className={view === s.key ? styles.subTabActive : styles.subTab}
                  onClick={() => setView(s.key)}
                >
                  <Icon size={15} />
                  {s.label}
                </button>
              )
            })}
          </div>

          {renderView()}
        </div>
      </div>
      {demoBar}
    </div>
  )
}

export default ObservabilityPage
