export type BudgetState = 'normal' | 'warn' | 'over'
export type PolicyMode = 'post' | 'ant'

export type StateConfig = {
  pct: number
  color: string
  overPct: number
  used: string
  usedPlain: string
  usedKpi: string
  gaugePct: string
  gaugeRemain: string
  proj: string
  projTrend: { direction: 'up' | 'down' | 'flat'; label: string }
}

export const STATES: Record<BudgetState, StateConfig> = {
  normal: {
    pct: 55,
    color: 'var(--color-success)',
    overPct: 0,
    used: '33M',
    usedPlain: '/ 60M included',
    usedKpi: '33M',
    gaugePct: '55% of monthly tokens used',
    gaugeRemain: '27M tokens left \u00b7 renews on Jun 1',
    proj: '59M',
    projTrend: { direction: 'down', label: '1% under plan' },
  },
  warn: {
    pct: 85,
    color: 'var(--color-third)',
    overPct: 0,
    used: '51M',
    usedPlain: '/ 60M included',
    usedKpi: '51M',
    gaugePct: '85% of monthly tokens used',
    gaugeRemain: '9M tokens left \u00b7 renews on Jun 1',
    proj: '61M',
    projTrend: { direction: 'up', label: '1.7% over plan' },
  },
  over: {
    pct: 100,
    color: 'var(--color-error)',
    overPct: 2,
    used: '61.2M',
    usedPlain: '/ 60M included',
    usedKpi: '61.2M',
    gaugePct: '102% of monthly tokens used',
    gaugeRemain: '1.2M over plan \u00b7 billed as overage',
    proj: '61.2M',
    projTrend: { direction: 'up', label: '2% over plan' },
  },
}

export const HARD_LIMIT_OVER_OVERRIDE: Partial<StateConfig> = {
  used: '60M',
  usedPlain: '/ 60M included',
  usedKpi: '60M',
  gaugePct: '100% of monthly tokens used',
  gaugeRemain: '0 tokens left \u00b7 actions blocked',
  proj: '60M',
  projTrend: { direction: 'flat', label: 'capped at plan' },
}

export const CHART_DAYS = [42, 55, 48, 61, 58, 66, 72, 69, 64, 71, 78, 74, 68, 82, 77, 63, 70, 88, 80, 75, 84, 91, 86, 79, 90, 72, 64]
export const CHART_CACHE = CHART_DAYS.map((v) => v * (0.18 + Math.random() * 0.12))

export const STATE_FACTOR: Record<BudgetState, number> = {
  normal: 0.72,
  warn: 1.0,
  over: 1.12,
}

export const RECENT_ACTIONS = [
  { key: '1', action: 'RCA', ref: 'INC-2041', user: 'Maud', time: '10:42', tokens: '132K', cache: '\u221224%', cacheActive: true, cost: '\u20ac4.10' },
  { key: '2', action: 'Auto-repair', ref: 'SMS OTP', user: 'System', time: '10:31', tokens: '88K', cache: '\u221218%', cacheActive: true, cost: '\u20ac2.85' },
  { key: '3', action: 'Generate description', ref: 'Monitor "API latency"', user: 'L\u00e9a', time: '10:18', tokens: '6K', cache: '\u2014', cacheActive: false, cost: '\u20ac0.12' },
  { key: '4', action: 'Summarize', ref: 'INC-2039', user: 'Guillaume', time: '09:58', tokens: '18K', cache: '\u22129%', cacheActive: true, cost: '\u20ac0.41' },
  { key: '5', action: 'Suggest name', ref: 'Checkout step', user: 'L\u00e9a', time: '09:44', tokens: '3K', cache: '\u2014', cacheActive: false, cost: '\u20ac0.07' },
]

export const FEATURES = [
  { name: 'Incident analysis (RCA)', meta: '308 actions \u00b7 ~66K tokens/action', amount: '20.5M', pct: '43% \u00b7 \u20ac735', iconBg: 'var(--color-blue-light, #EFF8FF)', iconColor: 'var(--color-blue, #2E90FA)', icon: 'search' },
  { name: 'Test auto-repair', meta: '540 actions \u00b7 ~31K tokens/action', amount: '16.8M', pct: '31% \u00b7 \u20ac525', iconBg: '#FEF6E6', iconColor: '#B8860B', icon: 'wrench' },
  { name: 'Assistant & quick actions', meta: '6,240 actions \u00b7 ~1.7K tokens/action', amount: '10.9M', pct: '26% \u00b7 \u20ac455', iconBg: '#F4F0FE', iconColor: '#7C3AED', icon: 'sparkles' },
]
