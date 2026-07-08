import { IconTrendingUp, IconTrendingDown } from '@kapptivate/ui-kit'
import { Hash, Wallet, Database } from 'lucide-react'
import styles from './ai-usage.module.scss'
import type { BudgetState, PolicyMode, StateConfig } from './constants'
import { STATES, HARD_LIMIT_OVER_OVERRIDE } from './constants'

type Props = {
  budgetState: BudgetState
  policyMode: PolicyMode
}

const BudgetCard = ({ budgetState, policyMode }: Props) => {
  const base = STATES[budgetState]
  const isHardOver = budgetState === 'over' && policyMode === 'ant'
  const st: StateConfig = isHardOver ? { ...base, ...HARD_LIMIT_OVER_OVERRIDE } : base

  const fillWidth = isHardOver ? 100 : st.pct
  const showOver = budgetState === 'over' && policyMode === 'post'

  const TrendIcon = st.projTrend.direction === 'down' ? IconTrendingDown : IconTrendingUp

  const trendClass =
    st.projTrend.direction === 'up'
      ? styles.kpiTrendUp
      : st.projTrend.direction === 'down'
        ? styles.kpiTrendDown
        : styles.kpiTrendFlat

  return (
    <div className={styles.card}>
      <div className={styles.budgetTop}>
        <div>
          <div className={styles.budgetLabel}>Tokens used this month</div>
          <div className={styles.budgetAmount}>
            {st.used}{' '}
            <span className={styles.budgetAmountSmall}>{st.usedPlain}</span>
          </div>
        </div>
        <div className={styles.budgetMode}>
          <span>Budget policy</span>{' '}
          <b>{policyMode === 'post' ? 'Soft limit' : 'Hard limit'}</b>
        </div>
      </div>

      <div className={styles.gaugeTrack}>
        <div
          className={styles.gaugeFill}
          style={{ width: `${fillWidth}%`, background: st.color }}
        />
        {showOver && (
          <div className={styles.gaugeOver} style={{ width: '10%' }} />
        )}
        <div className={styles.gaugeMarker}>
          <span>Alert 85%</span>
        </div>
      </div>

      <div className={styles.gaugeLegend}>
        <span>
          <b>{st.gaugePct.split(' ')[0]}</b> {st.gaugePct.split(' ').slice(1).join(' ')}
        </span>
        <span>
          <b>{st.gaugeRemain.split(' ')[0]}</b> {st.gaugeRemain.split(' ').slice(1).join(' ')}
        </span>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>
            <Hash size={14} /> Tokens used
          </div>
          <div className={styles.kpiValue}>{st.usedKpi}</div>
          <div className={styles.kpiTrendUp}>
            <IconTrendingUp size={13} /> 12% vs April
          </div>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>
            <Wallet size={14} /> Plan allowance
          </div>
          <div className={styles.kpiValue}>60M</div>
          <div className={styles.kpiTrendFlat}>Starter plan · per month</div>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>
            <Database size={14} /> Cache savings
          </div>
          <div className={styles.kpiValue}>11.5M</div>
          <div className={styles.kpiTrend}>
            <span className={styles.chipGreen}>24% of tokens cached</span>
          </div>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>
            <IconTrendingUp size={14} /> End-of-month forecast
          </div>
          <div className={styles.kpiValue}>{st.proj}</div>
          <div className={trendClass}>
            <TrendIcon size={13} /> {st.projTrend.label}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetCard
