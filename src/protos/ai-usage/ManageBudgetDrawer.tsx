import { Drawer, Button, Input, Select, Tag } from 'ui-kit'
import styles from './ai-usage.module.scss'
import type { PolicyMode } from './constants'

type Props = {
  open: boolean
  onClose: () => void
  policyMode: PolicyMode
  onPolicyChange: (mode: PolicyMode) => void
}

const ManageBudgetDrawer = ({ open, onClose, policyMode, onPolicyChange }: Props) => {
  return (
    <Drawer
      title="Manage budget"
      open={open}
      onClose={onClose}
      width={440}
    >
      <div className={styles.field}>
        <div className={styles.fieldLabel}>Monthly budget</div>
        <div className={styles.fieldHint}>
          Total credit available for AI actions each month. Renews on the 1st.
        </div>
        <Input
          prefix="€"
          value="2,000"
          size="l"
          fullWidth
        />
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Budget policy</div>
        <div className={styles.fieldHint}>What happens when the credit runs out.</div>

        <div
          className={policyMode === 'post' ? styles.optSelected : styles.opt}
          onClick={() => onPolicyChange('post')}
        >
          <div className={policyMode === 'post' ? styles.optRadioSelected : styles.optRadio} />
          <div>
            <div className={styles.optName}>
              Soft limit{' '}
              <Tag color="green" weight="medium">recommended</Tag>
            </div>
            <div className={styles.optDesc}>
              Action runs immediately, cost is counted afterward. Smooth, but tolerates small
              overages at the very end of the budget.
            </div>
          </div>
        </div>

        <div
          className={policyMode === 'ant' ? styles.optSelected : styles.opt}
          onClick={() => onPolicyChange('ant')}
        >
          <div className={policyMode === 'ant' ? styles.optRadioSelected : styles.optRadio} />
          <div>
            <div className={styles.optName}>Hard limit</div>
            <div className={styles.optDesc}>
              Cost is estimated before the action runs and blocked if it would exceed the budget.
              No overage, but slower and based on an estimate.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.field} style={{ marginBottom: 0 }}>
        <div className={styles.fieldLabel}>Alert threshold</div>
        <div className={styles.fieldHint}>
          Notify admins and show a banner when usage reaches this level.
        </div>
        <Select
          options={[
            { label: '75%', value: '75' },
            { label: '85%', value: '85' },
            { label: '90%', value: '90' },
            { label: '95%', value: '95' },
          ]}
          defaultValue="85"
          fullWidth
        />
      </div>

      <div className={styles.drawerFoot}>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={onClose}>
          Save changes
        </Button>
      </div>
    </Drawer>
  )
}

export default ManageBudgetDrawer
