export type Severity = 'fail' | 'warn'

/** Wording du cadrage en tête de la liste de conditions. */
export type Frame = 'sentence' | 'title' | 'match'

/** Présentation de la sévérité (statut si la condition n'est pas remplie). */
export type SevLayout = 'inline' | 'groups'

/** Famille d'un subject → détermine les contrôles affichés. */
export type SubjectKind = 'num' | 'time' | 'text' | 'body' | 'header'

export type Condition = {
  id: string
  subj: string
  kind: SubjectKind
  op: string | null // num / time
  pred: string | null // text / body / header
  val: string | null // valeur saisie
  unit: string | null // time
  headerName: string | null // header
  sev: Severity
}

export const SUBJECTS: { label: string; kind: SubjectKind }[] = [
  { label: 'Status code', kind: 'num' },
  { label: 'Status text', kind: 'text' },
  { label: 'Response header', kind: 'header' },
  { label: 'Response body', kind: 'body' },
  { label: 'Response time', kind: 'time' },
  { label: 'DNS lookup time', kind: 'time' },
  { label: 'TCP/TLS connection time', kind: 'time' },
  { label: 'Time to first byte', kind: 'time' },
  { label: 'Content transfer time', kind: 'time' },
]

export const NUM_OPS = ['=', '<', '≤', '>', '≥']
export const TEXT_PREDS = ['is exactly', 'contains', 'starts with', 'ends with']
export const BODY_PREDS = ['is valid JSON', 'is empty', 'contains', 'is exactly']
export const UNITS = ['seconds', 'ms', 'minutes']

export const subjectKind = (label: string): SubjectKind =>
  SUBJECTS.find((s) => s.label === label)?.kind ?? 'text'

export const predsFor = (kind: SubjectKind) =>
  kind === 'body' ? BODY_PREDS : TEXT_PREDS

/** Un prédicat texte qui a besoin d'une valeur (tout sauf « is valid JSON » / « is empty »). */
export const predNeedsValue = (pred: string | null) =>
  pred !== null && pred !== 'is valid JSON' && pred !== 'is empty'

/** Réinitialise les champs quand on change de subject. */
export const resetForKind = (subj: string): Partial<Condition> => {
  const kind = subjectKind(subj)
  const base = { subj, kind, op: null, pred: null, val: null, unit: null, headerName: null }
  switch (kind) {
    case 'num':
      return { ...base, op: '=', val: '200' }
    case 'time':
      return { ...base, op: '≤', val: '10', unit: 'seconds' }
    case 'text':
      return { ...base, pred: 'is exactly', val: '' }
    case 'header':
      return { ...base, pred: 'is exactly', headerName: '', val: '' }
    case 'body':
    default:
      return { ...base, pred: 'is valid JSON' }
  }
}

export const SEV_LABEL: Record<Severity, string> = {
  fail: 'Failed',
  warn: 'Warning',
}

export const shortUnit = (u: string | null) =>
  u === 'seconds' ? 's' : u === 'minutes' ? 'm' : u === 'ms' ? 'ms' : ''

export const INITIAL_CONDITIONS: Condition[] = [
  { id: 'c1', subj: 'Status code', kind: 'num', op: '=', pred: null, val: '200', unit: null, headerName: null, sev: 'fail' },
  { id: 'c2', subj: 'Response body', kind: 'body', op: null, pred: 'is valid JSON', val: null, unit: null, headerName: null, sev: 'fail' },
  { id: 'c3', subj: 'Time to first byte', kind: 'time', op: '≤', pred: null, val: '10', unit: 'seconds', headerName: null, sev: 'warn' },
]

/* ---------- Négation, pour la chip du canvas (condition qui déclenche) ---------- */
export const NEG_OP: Record<string, string> = {
  '=': '≠',
  '≠': '=',
  '≤': '>',
  '≥': '<',
  '<': '≥',
  '>': '≤',
}
export const NEG_PRED: Record<string, string> = {
  'is valid JSON': 'is not valid JSON',
  'is empty': 'is not empty',
  'is exactly': 'is not exactly',
  contains: 'does not contain',
  'starts with': 'does not start with',
  'ends with': 'does not end with',
}

export const triggerText = (c: Condition): string => {
  if (c.kind === 'num' || c.kind === 'time') {
    const op = NEG_OP[c.op ?? '='] ?? '≠'
    return `${c.subj} ${op} ${c.val}${shortUnit(c.unit)}`
  }
  const negPred = c.pred ? NEG_PRED[c.pred] ?? `not ${c.pred}` : ''
  const value = predNeedsValue(c.pred) && c.val ? ` ${c.val}` : ''
  if (c.kind === 'header') {
    const name = c.headerName ? ` ${c.headerName}` : ''
    return `${c.subj}${name} ${negPred}${value}`
  }
  return `${c.subj} ${negPred}${value}`
}

// Version positive (ce que la condition doit satisfaire).
export const conditionText = (c: Condition): string => {
  if (c.kind === 'num' || c.kind === 'time') {
    return `${c.subj} ${c.op ?? '='} ${c.val}${shortUnit(c.unit)}`
  }
  const value = predNeedsValue(c.pred) && c.val ? ` ${c.val}` : ''
  if (c.kind === 'header') {
    const name = c.headerName ? ` ${c.headerName}` : ''
    return `${c.subj}${name} ${c.pred}${value}`
  }
  return `${c.subj} ${c.pred}${value}`
}

export const FRAME_OPTIONS: { value: Frame; label: string }[] = [
  { value: 'sentence', label: 'This step passes when…' },
  { value: 'title', label: 'Success conditions' },
  { value: 'match', label: 'Conditions should match' },
]

export const SEV_OPTIONS: { value: SevLayout; label: string }[] = [
  { value: 'inline', label: 'Pastille par ligne' },
  { value: 'groups', label: 'Deux groupes' },
]
