import dayjs from 'dayjs'

/** « just now », « 5m ago », « 2h ago », « 3d ago », sinon date courte. */
export function timeAgo(iso: string): string {
  const then = dayjs(iso)
  const diffSec = dayjs().diff(then, 'second')
  if (diffSec < 45) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.round(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return then.format('MMM D, YYYY')
}

/** Date complète pour les tooltips / title. */
export const fullDate = (iso: string) => dayjs(iso).format('MMM D, YYYY, HH:mm')
