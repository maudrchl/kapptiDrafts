import {
  IconAlertTriangle,
  IconGauge,
  IconBot,
  IconSquareCode,
  IconActivity,
  IconMessageSquare,
  IconMail,
  IconUsers2,
  IconLink,
} from '@kapptivate/ui-kit'
import type { ComponentType } from 'react'

/**
 * Données de démo du proto Alerts.
 *
 * Même univers que le proto Observability (Rocket Corp / demo-site) pour que
 * les deux se lisent comme un seul produit : mêmes destinations de notification,
 * mêmes noms de services. Ici on parle en revanche le vocabulaire du monitoring
 * de tests (tests, produits, agents), pas celui des signaux d'observabilité.
 */

export type Severity = 'warning' | 'critical'

/**
 * Les 5 natures d'alerte de la plateforme, mais nommées par ce qu'elles
 * surveillent et pas par leur type technique. Correspondance avec l'API :
 *   run-failure  → availability_last_point
 *   success-rate → availability
 *   metric       → metric
 *   agent        → agent_availability
 *   script       → raw_alert
 */
export type AlertKind = 'run-failure' | 'success-rate' | 'metric' | 'agent' | 'script'

export type ChannelKind = 'slack' | 'email' | 'teams' | 'webhook'

export type AlertState = 'ok' | 'firing' | 'muted'

export type Notification = {
  channel: ChannelKind
  target: string
  /** Sévérités qui déclenchent cet envoi (une alerte peut router différemment). */
  severities: Severity[]
}

export type AlertRule = {
  id: string
  name: string
  kind: AlertKind
  /** La condition en une phrase lisible : c'est elle qui remplace la colonne « Condition ». */
  sentence: string
  /** Seuils par sévérité, formulés dans l'unité de l'alerte. */
  warning: string
  critical: string
  /** Portée : ce que l'alerte surveille vraiment, et combien d'objets ça fait. */
  scope: string
  scopeCount: number
  notifications: Notification[]
  state: AlertState
  /** Sévérité courante quand l'alerte est en train de sonner. */
  firingSeverity?: Severity
  since?: string
  lastFired?: string
  /** Nombre de déclenchements sur 7 jours : sert à repérer les alertes bruyantes. */
  firedLast7d: number
  /** 24 dernières évaluations : 0 = ok, 1 = warning, 2 = critical. */
  history: (0 | 1 | 2)[]
  owner: string
}

export const KIND_LABEL: Record<AlertKind, string> = {
  'run-failure': 'Run failures',
  'success-rate': 'Success rate',
  metric: 'Metric threshold',
  agent: 'Agent availability',
  script: 'Custom script',
}

export const KIND_ICON: Record<AlertKind, ComponentType<{ size?: number; color?: string }>> = {
  'run-failure': IconAlertTriangle,
  'success-rate': IconActivity,
  metric: IconGauge,
  agent: IconBot,
  script: IconSquareCode,
}

/**
 * Une teinte par nature d'alerte, sur le modèle de l'index kapptiDrafts :
 * icône dans la couleur, pastille dans la même couleur à 12%. Ça donne aux
 * intentions un repère visuel immédiat, là où la page actuelle aligne des
 * titres gris identiques.
 */
export const KIND_ACCENT: Record<AlertKind, string> = {
  'run-failure': '#e0372e',
  'success-rate': '#f2b338',
  metric: '#0577ff',
  agent: '#7c3aed',
  script: '#667085',
}

export const KIND_ACCENT_BG: Record<AlertKind, string> = {
  'run-failure': 'rgba(224,55,46,0.1)',
  'success-rate': 'rgba(242,179,56,0.14)',
  metric: 'rgba(5,119,255,0.1)',
  agent: 'rgba(124,58,237,0.1)',
  script: 'rgba(102,112,133,0.1)',
}

export const CHANNEL_ICON: Record<ChannelKind, ComponentType<{ size?: number; color?: string }>> = {
  slack: IconMessageSquare,
  email: IconMail,
  teams: IconUsers2,
  webhook: IconLink,
}

export const CHANNEL_LABEL: Record<ChannelKind, string> = {
  slack: 'Slack',
  email: 'Email',
  teams: 'Microsoft Teams',
  webhook: 'Webhook',
}

/** Historique d'évaluations : petit générateur pour garder les données lisibles. */
const ok = (n: number): (0 | 1 | 2)[] => Array.from({ length: n }, () => 0 as const)

export const ALERTS: AlertRule[] = [
  {
    id: 'a-checkout',
    name: 'Checkout journey failing',
    kind: 'run-failure',
    sentence: 'When 2 of the last 10 runs fail',
    warning: '2 of 10 runs',
    critical: '4 of 10 runs',
    scope: 'Payments',
    scopeCount: 12,
    notifications: [
      { channel: 'slack', target: '#alerts', severities: ['warning', 'critical'] },
      { channel: 'email', target: 'oncall@rocketcorp.io', severities: ['critical'] },
    ],
    state: 'firing',
    firingSeverity: 'critical',
    since: '14 min',
    lastFired: '14 min ago',
    firedLast7d: 4,
    history: [...ok(14), 1, 1, 0, 1, 1, 2, 2, 2, 2, 2],
    owner: 'Awa Diallo',
  },
  {
    id: 'a-success-rate',
    name: 'Success rate below target',
    kind: 'success-rate',
    sentence: 'When the success rate over the last 24 h falls below 95%',
    warning: 'below 95%',
    critical: 'below 90%',
    scope: 'All products',
    scopeCount: 151,
    notifications: [
      { channel: 'slack', target: '#alerts', severities: ['warning', 'critical'] },
      { channel: 'email', target: 'oncall@rocketcorp.io', severities: ['critical'] },
    ],
    state: 'ok',
    lastFired: '2 days ago',
    firedLast7d: 1,
    history: [...ok(6), 1, 1, 2, 1, ...ok(14)],
    owner: 'Awa Diallo',
  },
  {
    id: 'a-ussd',
    name: 'USSD response time',
    kind: 'metric',
    sentence: 'When the mean response time stays at or above 45 s for 5 min',
    warning: '45 s or more',
    critical: '60 s or more',
    scope: 'FastPay',
    scopeCount: 8,
    notifications: [{ channel: 'email', target: 'oncall@rocketcorp.io', severities: ['warning', 'critical'] }],
    state: 'firing',
    firingSeverity: 'warning',
    since: '3 min',
    lastFired: '3 min ago',
    firedLast7d: 9,
    history: [0, 1, 1, 0, 0, 1, 2, 1, 0, 0, 1, 1, 0, 1, 2, 1, 0, 0, 1, 1, 0, 1, 1, 1],
    owner: 'Samir Benali',
  },
  {
    id: 'a-agent',
    name: 'Abidjan lab agents offline',
    kind: 'agent',
    sentence: 'When an agent stops reporting for 5 min',
    warning: 'after 5 min',
    critical: 'after 15 min',
    scope: 'Abidjan lab',
    scopeCount: 4,
    notifications: [{ channel: 'slack', target: '#ops', severities: ['warning', 'critical'] }],
    state: 'ok',
    lastFired: 'Never',
    firedLast7d: 0,
    history: ok(24),
    owner: 'Samir Benali',
  },
  {
    id: 'a-login',
    name: 'Login failures spike',
    kind: 'metric',
    sentence: 'When failed logins reach 20 over 15 min',
    warning: '20 or more',
    critical: '50 or more',
    scope: 'Accounts',
    scopeCount: 22,
    // Volontairement sans destination : c'est le trou que la page actuelle
    // n'affiche nulle part, alors que l'alerte ne prévient personne.
    notifications: [],
    state: 'ok',
    lastFired: '5 days ago',
    firedLast7d: 2,
    history: [...ok(18), 1, 0, 0, 1, 0, 0],
    owner: 'Léa Marchand',
  },
  {
    id: 'a-legacy',
    name: 'Legacy TICK script',
    kind: 'script',
    sentence: 'Custom script, 34 lines',
    warning: 'set in the script',
    critical: 'set in the script',
    scope: 'All products',
    scopeCount: 151,
    notifications: [{ channel: 'webhook', target: 'hooks.rocketcorp.io/ops', severities: ['critical'] }],
    state: 'muted',
    lastFired: '3 weeks ago',
    firedLast7d: 0,
    history: ok(24),
    owner: 'Samir Benali',
  },
  {
    id: 'a-batch',
    name: 'Weekend batch check',
    kind: 'run-failure',
    sentence: 'When 1 of the last 3 runs fails',
    warning: '1 of 3 runs',
    critical: '2 of 3 runs',
    scope: 'Billing',
    scopeCount: 3,
    notifications: [{ channel: 'teams', target: 'Billing ops', severities: ['critical'] }],
    state: 'muted',
    lastFired: '12 days ago',
    firedLast7d: 0,
    history: ok(24),
    owner: 'Léa Marchand',
  },
]

/** Incidents ouverts par ces alertes, pour le détail d'une règle. */
export type AlertIncident = {
  id: string
  alertId: string
  severity: Severity
  openedAt: string
  duration: string
  status: 'open' | 'resolved'
  trigger: string
}

export const INCIDENTS: AlertIncident[] = [
  { id: 'inc-201', alertId: 'a-checkout', severity: 'critical', openedAt: 'Today 15:12', duration: '14 min', status: 'open', trigger: '5 of the last 10 runs failed' },
  { id: 'inc-198', alertId: 'a-checkout', severity: 'warning', openedAt: 'Yesterday 09:40', duration: '38 min', status: 'resolved', trigger: '2 of the last 10 runs failed' },
  { id: 'inc-192', alertId: 'a-checkout', severity: 'critical', openedAt: '18 Aug 22:05', duration: '1 h 12 min', status: 'resolved', trigger: '7 of the last 10 runs failed' },
  { id: 'inc-200', alertId: 'a-ussd', severity: 'warning', openedAt: 'Today 15:23', duration: '3 min', status: 'open', trigger: 'Mean response time 48 s' },
  { id: 'inc-197', alertId: 'a-ussd', severity: 'warning', openedAt: 'Today 11:02', duration: '22 min', status: 'resolved', trigger: 'Mean response time 47 s' },
  { id: 'inc-195', alertId: 'a-success-rate', severity: 'critical', openedAt: '19 Aug 03:14', duration: '2 h 40 min', status: 'resolved', trigger: 'Success rate 88%' },
  { id: 'inc-188', alertId: 'a-login', severity: 'warning', openedAt: '16 Aug 18:30', duration: '10 min', status: 'resolved', trigger: '23 failed logins' },
]

/**
 * Création : on entre par l'intention, pas par le type. Chaque intention porte
 * l'exemple concret que l'ancienne page mettait en gris sous un titre géant.
 */
export type Intent = {
  kind: AlertKind
  question: string
  example: string
  /** Rangé à part dans l'UI : c'est l'échappatoire, pas un choix de premier rang. */
  advanced?: boolean
}

export const INTENTS: Intent[] = [
  {
    kind: 'run-failure',
    question: 'A test starts failing',
    example: 'Warn me as soon as 2 of the last 10 runs of the checkout journey fail',
  },
  {
    kind: 'success-rate',
    question: 'The success rate drops',
    example: 'Warn me if the success rate of all my tests falls below 95% over 24 h',
  },
  {
    kind: 'metric',
    question: 'A metric crosses a threshold',
    example: 'Warn me if the USSD response time stays above 45 s for 5 min',
  },
  {
    kind: 'agent',
    question: 'An agent goes offline',
    example: 'Warn me if an agent of the Abidjan lab stops reporting for 5 min',
  },
  {
    kind: 'script',
    question: 'Something none of the above covers',
    example: 'Write the condition yourself in a TICK script',
    advanced: true,
  },
]

/** Destinations déjà configurées dans le workspace (mêmes que le proto Observability). */
export const DESTINATIONS: { key: string; channel: ChannelKind; label: string; target: string }[] = [
  { key: 'slack-alerts', channel: 'slack', label: 'Slack #alerts', target: '#alerts' },
  { key: 'slack-ops', channel: 'slack', label: 'Slack #ops', target: '#ops' },
  { key: 'oncall-email', channel: 'email', label: 'On-call email', target: 'oncall@rocketcorp.io' },
  { key: 'teams-billing', channel: 'teams', label: 'Billing ops', target: 'Billing ops' },
  { key: 'ops-webhook', channel: 'webhook', label: 'Ops webhook', target: 'hooks.rocketcorp.io/ops' },
]

/**
 * Aperçu du formulaire de création : ce que la condition en cours aurait donné
 * sur les 7 derniers jours. C'est la réponse à « est-ce que mon seuil est bon ? »,
 * question que la page actuelle laisse entièrement à l'utilisateur.
 */
export const PREVIEW_RUNS: { day: string; failed: number; total: number }[] = [
  { day: 'Thu', failed: 0, total: 48 },
  { day: 'Fri', failed: 1, total: 48 },
  { day: 'Sat', failed: 0, total: 48 },
  { day: 'Sun', failed: 0, total: 48 },
  { day: 'Mon', failed: 4, total: 48 },
  { day: 'Tue', failed: 2, total: 48 },
  { day: 'Wed', failed: 6, total: 48 },
]
