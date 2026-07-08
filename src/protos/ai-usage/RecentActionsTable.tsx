import { Table, Tag } from 'ui-kit'
import styles from './ai-usage.module.scss'
import type { PolicyMode } from './constants'
import { RECENT_ACTIONS } from './constants'

type Props = {
  policyMode: PolicyMode
}

const columns = [
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_: string, record: (typeof RECENT_ACTIONS)[number]) => (
      <span>
        {record.action} · <Tag>{record.ref}</Tag>
      </span>
    ),
  },
  { title: 'User', dataIndex: 'user', key: 'user' },
  { title: 'Time', dataIndex: 'time', key: 'time' },
  {
    title: 'Tokens',
    dataIndex: 'tokens',
    key: 'tokens',
    align: 'right' as const,
    render: (val: string) => <span className={styles.mono}>{val}</span>,
  },
  {
    title: 'Cache',
    dataIndex: 'cache',
    key: 'cache',
    align: 'right' as const,
    render: (val: string, record: (typeof RECENT_ACTIONS)[number]) => (
      <span className={`${styles.mono} ${record.cacheActive ? styles.cacheSave : ''}`}>
        {val}
      </span>
    ),
  },
  {
    title: 'Cost',
    dataIndex: 'cost',
    key: 'cost',
    align: 'right' as const,
    render: (val: string) => <span className={styles.mono}>{val}</span>,
  },
]

const RecentActionsTable = ({ policyMode }: Props) => {
  const subtitle =
    policyMode === 'post'
      ? 'Tokens counted after each action runs (soft limit)'
      : 'Tokens estimated before each action runs (hard limit)'

  return (
    <div className={styles.card} style={{ marginBottom: 0 }}>
      <div className={styles.cardHead}>
        <div>
          <div className={styles.cardTitle}>Recent AI actions</div>
          <div className={styles.cardSub}>{subtitle}</div>
        </div>
      </div>
      <div className={styles.cardHr} />
      <Table
        rowKey="key"
        columns={columns}
        data={RECENT_ACTIONS}
        outerBorders={false}
        showHeader
      />
    </div>
  )
}

export default RecentActionsTable
