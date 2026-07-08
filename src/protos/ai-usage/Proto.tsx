import { useState } from 'react'
import {
  Button,
  Banner,
  IconDownload,
  IconAlertTriangle,
  IconBan,
} from 'ui-kit'
import { ShieldCheck } from 'lucide-react'
import styles from './ai-usage.module.scss'
import type { BudgetState, PolicyMode } from './constants'
import SettingsSidebar from './SettingsSidebar'
import BudgetCard from './BudgetCard'
import ConsumptionChart from './ConsumptionChart'
import FeatureBreakdown from './FeatureBreakdown'
import RecentActionsTable from './RecentActionsTable'
import ManageBudgetDrawer from './ManageBudgetDrawer'
import DemoBar from './DemoBar'

const AIUsagePage = () => {
  const [budgetState, setBudgetState] = useState<BudgetState>('warn')
  const [policyMode, setPolicyMode] = useState<PolicyMode>('post')
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.brand}>kapptivate</div>
      </div>

      <div className={styles.body}>
        <SettingsSidebar />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.contentHead}>
            <div>
              <div className={styles.contentTitle}>AI Usage</div>
              <div className={styles.contentSub}>
                Token consumption against your plan allowance, with overage billing
              </div>
            </div>
            <div className={styles.contentActions}>
              <Button color="secondary" icon={IconDownload}>
                Export
              </Button>
              <Button color="primary" onClick={() => setDrawerOpen(true)}>
                Manage budget
              </Button>
            </div>
          </div>

          <div className={styles.contentBody}>
            {/* Banners */}
            {budgetState === 'warn' && (
              <Banner
                variant="warning"
                description="85% of your monthly tokens used"
                subDescription={
                  <>
                    At the current rate, your <b>60M</b> included tokens will run out around{' '}
                    <b>May 27</b>. AI actions keep working; admins have been notified.
                  </>
                }
                icon={<IconAlertTriangle size={18} />}
                aside={<Button color="secondary" size="s">Add tokens</Button>}
              />
            )}

            {budgetState === 'over' && policyMode === 'post' && (
              <Banner
                variant="warning"
                description="Monthly allowance used up — overage billing active"
                subDescription={
                  <>
                    All <b>60M</b> included tokens are used. Extra usage keeps running and is
                    billed as overage (<b>1.2M tokens · €38</b> so far this month). Resets on{' '}
                    <b>Jun 1</b>.
                  </>
                }
                icon={<IconAlertTriangle size={18} />}
                aside={<Button color="secondary" size="s">Manage plan</Button>}
              />
            )}

            {budgetState === 'over' && policyMode === 'ant' && (
              <Banner
                variant="error"
                description="Monthly allowance used up — new AI actions blocked"
                subDescription={
                  <>
                    All <b>60M</b> included tokens are used and the hard limit blocks further
                    actions. No overage is charged. Resumes on <b>Jun 1</b> or after adding tokens.
                  </>
                }
                icon={<IconBan size={18} />}
                aside={
                  <Button color="primary" size="s">
                    Add tokens
                  </Button>
                }
              />
            )}

            {policyMode === 'ant' && budgetState !== 'over' && (
              <Banner
                variant="primary"
                description="Hard limit active"
                subDescription={
                  <>
                    Each action is estimated <b>before it runs</b> and blocked if it would exceed
                    the remaining tokens. No overage, but +120&nbsp;ms average latency and
                    approximate estimates (token cache unknown in advance).
                  </>
                }
                icon={<ShieldCheck size={18} />}
              />
            )}

            {/* Budget card */}
            <BudgetCard budgetState={budgetState} policyMode={policyMode} />

            {/* Chart + Breakdown */}
            <div className={styles.grid2}>
              <ConsumptionChart budgetState={budgetState} />
              <FeatureBreakdown />
            </div>

            <div style={{ height: 18 }} />

            {/* Recent actions table */}
            <RecentActionsTable policyMode={policyMode} />
          </div>
        </div>
      </div>

      {/* Drawer */}
      <ManageBudgetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        policyMode={policyMode}
        onPolicyChange={setPolicyMode}
      />

      {/* Demo bar */}
      <DemoBar
        budgetState={budgetState}
        policyMode={policyMode}
        onStateChange={setBudgetState}
        onModeChange={setPolicyMode}
      />
    </div>
  )
}

export default AIUsagePage
