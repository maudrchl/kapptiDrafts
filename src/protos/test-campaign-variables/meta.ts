import { IconBraces } from '@kapptivate/ui-kit'
import type { ProtoMeta } from '../registry'

const meta: ProtoMeta = {
  title: 'Test campaign - variable changes',
  status: 'wip dev',
  collection: 'Testing',
  description:
    'Two entry points to propagate a changed variable value: from a campaign (review + update saved values) and from the variable itself in Configurations (apply the new value across the tests and monitors that use it)',
  icon: IconBraces,
  updatedAt: '2026-07-24',
}

export default meta
