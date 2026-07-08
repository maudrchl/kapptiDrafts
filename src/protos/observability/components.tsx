import { useState, type ReactNode } from 'react'
import { Check, Copy, TrendingDown, TrendingUp } from 'lucide-react'
import styles from './observability.module.scss'
import type { Health } from './constants'

export const Card = ({
  title,
  icon,
  aside,
  sub,
  bodyPad = true,
  children,
}: {
  title?: ReactNode
  icon?: ReactNode
  aside?: ReactNode
  sub?: ReactNode
  bodyPad?: boolean
  children: ReactNode
}) => (
  <div className={styles.card}>
    {(title || aside) && (
      <div className={styles.cardHead}>
        <div>
          <div className={styles.cardTitle}>
            {icon}
            {title}
          </div>
          {sub && <div className={styles.cardSub}>{sub}</div>}
        </div>
        {aside}
      </div>
    )}
    {bodyPad ? <div className={styles.cardBody}>{children}</div> : children}
  </div>
)

export const Kpi = ({
  label,
  icon,
  value,
  foot,
  trend,
}: {
  label: string
  icon?: ReactNode
  value: ReactNode
  foot?: ReactNode
  trend?: 'up' | 'down' | 'flat'
}) => {
  const cls =
    trend === 'up'
      ? styles.trendUp
      : trend === 'down'
        ? styles.trendDown
        : styles.trendFlat
  const Arrow = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>
        {icon}
        {label}
      </div>
      <div className={styles.kpiValue}>{value}</div>
      {foot && (
        <div className={`${styles.kpiFoot} ${cls}`}>
          {Arrow && <Arrow size={13} />}
          {foot}
        </div>
      )}
    </div>
  )
}

const HEALTH_CLS: Record<Health, string> = {
  healthy: styles.pillHealthy,
  degraded: styles.pillDegraded,
  down: styles.pillDown,
}
const HEALTH_DOT: Record<Health, string> = {
  healthy: styles.dotHealthy,
  degraded: styles.dotDegraded,
  down: styles.dotDown,
}
const HEALTH_LABEL: Record<Health, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
}

export const HealthPill = ({ health }: { health: Health }) => (
  <span className={HEALTH_CLS[health]}>
    <span className={HEALTH_DOT[health]} />
    {HEALTH_LABEL[health]}
  </span>
)

export const Empty = ({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: ReactNode
  action?: ReactNode
}) => (
  <div className={styles.empty}>
    <div className={styles.emptyIcon}>{icon}</div>
    <div className={styles.emptyTitle}>{title}</div>
    <div className={styles.emptyText}>{text}</div>
    {action && <div style={{ marginTop: 10 }}>{action}</div>}
  </div>
)

export const CodeBox = ({ lines }: { lines: [string, string?][] }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const text = lines.map(([k, v]) => (v ? `${k} ${v}` : k)).join('\n')
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className={styles.codeBox}>
      <button className={styles.copyBtn} onClick={copy}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      {lines.map(([k, v], i) => (
        <div key={i}>
          <span className={styles.codeKey}>{k}</span>
          {v ? ` ${v}` : ''}
        </div>
      ))}
    </div>
  )
}
