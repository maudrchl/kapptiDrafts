import type { ComponentType } from 'react'
import { Overview, Colors, Typography, Icons } from './pages/foundations'
import { ToneOfVoice } from './pages/tone-of-voice'
import {
  ButtonPage,
  ButtonGroupPage,
  DropdownPage,
  ButtonDropdownPage,
} from './pages/actions'
import {
  InputPage,
  SearchInputPage,
  SelectPage,
  CheckboxPage,
  RadioPage,
  TogglePage,
  SegmentedPage,
} from './pages/forms'
import {
  TagPage,
  StatusTagPage,
  TrendTagPage,
  CounterCardPage,
  AvatarPage,
  ProgressBarPage,
  CollapsePage,
  CardPage,
  TimelinePage,
  TablePage,
} from './pages/datadisplay'
import {
  BannerPage,
  AlertPage,
  ModalPage,
  DrawerPage,
  TooltipPage,
  PopoverPage,
  EmptyStatePage,
  LoaderPage,
} from './pages/feedback'
import { TabsPage, BreadcrumbPage, AnchorPage } from './pages/navigation'

export type DsPage = { slug: string; name: string; Component: ComponentType }
export type DsGroup = { label: string; pages: DsPage[] }

export const GROUPS: DsGroup[] = [
  {
    label: 'Foundations',
    pages: [
      { slug: 'overview', name: 'Overview', Component: Overview },
      { slug: 'colors', name: 'Colors', Component: Colors },
      { slug: 'typography', name: 'Typography', Component: Typography },
      { slug: 'icons', name: 'Icons', Component: Icons },
      { slug: 'tone-of-voice', name: 'Tone of voice', Component: ToneOfVoice },
    ],
  },
  {
    label: 'Actions',
    pages: [
      { slug: 'button', name: 'Button', Component: ButtonPage },
      { slug: 'button-group', name: 'ButtonGroup', Component: ButtonGroupPage },
      { slug: 'dropdown', name: 'Dropdown', Component: DropdownPage },
      { slug: 'button-dropdown', name: 'ButtonDropdown', Component: ButtonDropdownPage },
    ],
  },
  {
    label: 'Forms',
    pages: [
      { slug: 'input', name: 'Input', Component: InputPage },
      { slug: 'search-input', name: 'SearchInput', Component: SearchInputPage },
      { slug: 'select', name: 'Select', Component: SelectPage },
      { slug: 'checkbox', name: 'Checkbox', Component: CheckboxPage },
      { slug: 'radio', name: 'Radio', Component: RadioPage },
      { slug: 'toggle', name: 'Toggle', Component: TogglePage },
      { slug: 'segmented', name: 'Segmented', Component: SegmentedPage },
    ],
  },
  {
    label: 'Data display',
    pages: [
      { slug: 'tag', name: 'Tag', Component: TagPage },
      { slug: 'status-tag', name: 'StatusTag', Component: StatusTagPage },
      { slug: 'trend-tag', name: 'TrendTag', Component: TrendTagPage },
      { slug: 'counter-card', name: 'CounterCard', Component: CounterCardPage },
      { slug: 'avatar', name: 'Avatar', Component: AvatarPage },
      { slug: 'progress-bar', name: 'ProgressBar', Component: ProgressBarPage },
      { slug: 'collapse', name: 'Collapse', Component: CollapsePage },
      { slug: 'card', name: 'Card', Component: CardPage },
      { slug: 'timeline', name: 'Timeline', Component: TimelinePage },
      { slug: 'table', name: 'Table', Component: TablePage },
    ],
  },
  {
    label: 'Feedback',
    pages: [
      { slug: 'banner', name: 'Banner', Component: BannerPage },
      { slug: 'alert', name: 'Alert', Component: AlertPage },
      { slug: 'modal', name: 'Modal', Component: ModalPage },
      { slug: 'drawer', name: 'Drawer', Component: DrawerPage },
      { slug: 'tooltip', name: 'Tooltip', Component: TooltipPage },
      { slug: 'popover', name: 'Popover', Component: PopoverPage },
      { slug: 'empty-state', name: 'EmptyState', Component: EmptyStatePage },
      { slug: 'loader', name: 'Loader', Component: LoaderPage },
    ],
  },
  {
    label: 'Navigation',
    pages: [
      { slug: 'tabs', name: 'Tabs', Component: TabsPage },
      { slug: 'breadcrumb', name: 'Breadcrumb', Component: BreadcrumbPage },
      { slug: 'anchor', name: 'Anchor', Component: AnchorPage },
    ],
  },
]

export const ALL_PAGES: DsPage[] = GROUPS.flatMap((g) => g.pages)
