import { useState } from 'react'
import { Segmented } from 'ui-kit'
import styles from './ai-usage.module.scss'
import type { BudgetState } from './constants'
import { CHART_DAYS, CHART_CACHE, STATE_FACTOR } from './constants'

type ChartUnit = 'tokens' | 'cost'

const W = 640
const H = 210
const PL = 42
const PR = 8
const PT = 12
const PB = 24
const MAX_V = 100
const BUDGET_LINE = 64.5
const INNER_W = W - PL - PR
const INNER_H = H - PT - PB
const BAR_W = INNER_W / CHART_DAYS.length

const y = (v: number) => PT + INNER_H - (v / MAX_V) * INNER_H

const UNITS: Record<
  ChartUnit,
  {
    ylabel: (g: number) => string
    tip: (v: number) => string
    line: string
    billed: string
    sub: string
  }
> = {
  tokens: {
    ylabel: (g) => (g * 0.03).toFixed(2) + 'M',
    tip: (v) => (v * 0.03).toFixed(2) + 'M',
    line: 'Daily allowance (~1.9M)',
    billed: 'Billed against plan',
    sub: 'Tokens per day vs daily allowance',
  },
  cost: {
    ylabel: (g) => '€' + g,
    tip: (v) => '€' + v.toFixed(0),
    line: 'Daily budget (€64.5)',
    billed: 'Billed cost',
    sub: 'Cost per day vs daily budget',
  },
}

const topRound = (x: number, yy: number, w: number, h: number, r: number) => {
  r = Math.min(r, h)
  return `M${x} ${yy + h} L${x} ${yy + r} Q${x} ${yy} ${x + r} ${yy} L${x + w - r} ${yy} Q${x + w} ${yy} ${x + w} ${yy + r} L${x + w} ${yy + h} Z`
}

type Props = {
  budgetState: BudgetState
}

const ConsumptionChart = ({ budgetState }: Props) => {
  const [unit, setUnit] = useState<ChartUnit>('tokens')
  const u = UNITS[unit]
  const f = STATE_FACTOR[budgetState]

  const gridLines = [25, 50, 75, 100]

  return (
    <div className={styles.card} style={{ marginBottom: 0 }}>
      <div className={styles.cardHead}>
        <div>
          <div className={styles.cardTitle}>Daily consumption</div>
          <div className={styles.cardSub}>{u.sub}</div>
        </div>
        <Segmented
          size="small"
          options={[
            { label: 'Tokens', value: 'tokens' },
            { label: 'Cost', value: 'cost' },
          ]}
          value={unit}
          onChange={(val) => setUnit(val as ChartUnit)}
        />
      </div>
      <div className={styles.cardHr} />

      <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid */}
        <line
          x1={PL}
          y1={y(0)}
          x2={W - PR}
          y2={y(0)}
          stroke="var(--color-border-grey, #e4e4e7)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={PL}
              y1={y(g)}
              x2={W - PR}
              y2={y(g)}
              stroke="var(--color-border-grey, #e4e4e7)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <text
              x={PL - 6}
              y={y(g) + 3}
              textAnchor="end"
              fontSize={10.5}
              fill="var(--color-text-third, #98a2b3)"
            >
              {u.ylabel(g)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {CHART_DAYS.map((d, i) => {
          const v = Math.min(d * f, 100)
          const c = Math.min(CHART_CACHE[i] * f, v)
          const x = PL + i * BAR_W + BAR_W * 0.18
          const w = BAR_W * 0.64

          return (
            <g key={i}>
              <path
                className={styles.chartBar}
                d={topRound(x, y(v), w, y(0) - y(v), 3)}
                fill="#2E7D74"
              >
                <title>
                  Day {i + 1}: {u.tip(v)} total · {u.tip(v - c)} billed
                </title>
              </path>
              <rect
                className={styles.chartBar}
                x={x}
                y={y(c)}
                width={w}
                height={y(0) - y(c)}
                fill="#A3D9D0"
              >
                <title>
                  Day {i + 1}: {u.tip(c)} from cache
                </title>
              </rect>
              {i % 4 === 0 && (
                <text
                  x={x + w / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill="var(--color-text-third, #98a2b3)"
                >
                  {i + 1}
                </text>
              )}
            </g>
          )
        })}

        {/* Budget line */}
        <line
          x1={PL}
          y1={y(BUDGET_LINE)}
          x2={W - PR}
          y2={y(BUDGET_LINE)}
          stroke="var(--color-error, #e0372e)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      </svg>

      <div className={styles.chartLegend}>
        <span>
          <span className={styles.lgDot} style={{ background: '#2E7D74' }} />
          {u.billed}
        </span>
        <span>
          <span className={styles.lgDot} style={{ background: '#A3D9D0' }} />
          Served from cache (free)
        </span>
        <span>
          <span className={styles.lgDot} style={{ background: 'var(--color-error, #e0372e)' }} />
          {u.line}
        </span>
      </div>
    </div>
  )
}

export default ConsumptionChart
