import { StatusTag, Tag } from '@kapptivate/ui-kit'
import type { Location } from './constants'

/** Online / Offline: vrai composant ui-kit StatusTag. */
export const StatusBadge = ({ status }: { status?: Location['status'] }) =>
  status === 'offline' ? (
    <StatusTag variant="ghost" color="failed">
      Offline
    </StatusTag>
  ) : (
    <StatusTag variant="ghost" color="success">
      Online
    </StatusTag>
  )

/** Managed (public) / Shared / Personal. */
export const ScopeBadge = ({ loc }: { loc: Location }) => {
  if (loc.kind === 'public') return <Tag color="grey">Managed</Tag>
  if (loc.scope === 'personal') return <Tag color="purple">Personal</Tag>
  return <Tag color="dark-green">Shared</Tag>
}
