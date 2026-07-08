import styles from './ai-usage.module.scss'
import type { BudgetState, PolicyMode } from './constants'

type Props = {
  budgetState: BudgetState
  policyMode: PolicyMode
  onStateChange: (state: BudgetState) => void
  onModeChange: (mode: PolicyMode) => void
}

const STATE_OPTIONS: { value: BudgetState; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'warn', label: '85% threshold' },
  { value: 'over', label: 'Exceeded' },
]

const MODE_OPTIONS: { value: PolicyMode; label: string }[] = [
  { value: 'post', label: 'Soft limit' },
  { value: 'ant', label: 'Hard limit' },
]

const DemoBar = ({ budgetState, policyMode, onStateChange, onModeChange }: Props) => {
  const getStateBtnClass = (value: BudgetState) => {
    if (value !== budgetState) return styles.demoBtn
    if (value === 'warn') return styles.demoBtnWarn
    if (value === 'over') return styles.demoBtnErr
    return styles.demoBtnActive
  }

  return (
    <div className={styles.demoBar}>
      <div className={styles.demoGrp}>
        <span className={styles.demoLbl}>Budget state</span>
        <div className={styles.demoSeg}>
          {STATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={getStateBtnClass(opt.value)}
              onClick={() => onStateChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.demoSep} />
      <div className={styles.demoGrp}>
        <span className={styles.demoLbl}>Policy</span>
        <div className={styles.demoSeg}>
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={opt.value === policyMode ? styles.demoBtnActive : styles.demoBtn}
              onClick={() => onModeChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemoBar
