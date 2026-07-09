import {
  Text,
  Tag,
  StatusTag,
  TrendTag,
  CounterCard,
  CounterCardGroup,
  Avatar,
  ProgressBar,
  Collapse,
  Card,
  Timeline,
  Table,
  IconCode,
  IconActivity,
} from '@kapptivate/ui-kit'
import { Page, Demo, PropsTable } from '../primitives'

export const TagPage = () => (
  <Page
    title="Tag"
    description="Compact colored label to categorize an item."
    importCode={"import { Tag } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Colors">
      <Tag color="blue">blue</Tag>
      <Tag color="green">green</Tag>
      <Tag color="orange">orange</Tag>
      <Tag color="purple">purple</Tag>
      <Tag color="red">red</Tag>
      <Tag color="grey">grey</Tag>
      <Tag color="dark-green">dark-green</Tag>
    </Demo>
    <Demo title="Variants">
      <Tag color="grey" uppercase>
        uppercase
      </Tag>
      <Tag color="blue" icon={IconCode}>
        with icon
      </Tag>
      <Tag color="grey" border="dashed">
        dashed
      </Tag>
      <Tag color="purple" mono>
        mono
      </Tag>
    </Demo>

    <PropsTable
      rows={[
        { name: 'children', type: 'ReactNode', description: 'The label content' },
        { name: 'color', type: "'black' | 'red' | 'grey' | 'brown' | 'dark-green' | 'green' | 'yellow' | 'orange' | 'pink' | 'purple' | 'blue' | 'dark-blue'", default: 'black', description: 'Background/text color' },
        { name: 'icon', type: 'IconComponent', description: 'Icon rendered inside the tag' },
        { name: 'iconColor', type: 'string', description: 'Override the icon color' },
        { name: 'iconRight', type: 'boolean', default: 'false', description: 'Place the icon after the label' },
        { name: 'weight', type: "'normal' | 'medium' | 'semibold'", default: 'normal', description: 'Label font weight' },
        { name: 'uppercase', type: 'boolean', default: 'false', description: 'Uppercase the label' },
        { name: 'mono', type: 'boolean', default: 'false', description: 'Use the monospace font' },
        { name: 'size', type: 'Text size', default: 'sm', description: 'Label text size' },
        { name: 'border', type: "'solid' | 'dashed'", default: 'solid', description: 'Border style' },
        { name: 'smallPadding', type: 'boolean', default: 'false', description: 'Tighter horizontal padding' },
        { name: 'maxLen', type: 'number', description: 'Truncate the label past this length' },
        { name: 'onClick', type: '(e) => void', description: 'Makes the tag clickable' },
      ]}
    />
  </Page>
)

export const StatusTagPage = () => (
  <Page
    title="StatusTag"
    description="Semantic status pill (deployment, run, incident…). Three visual variants."
    importCode={"import { StatusTag } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Colors (ghost)">
      <StatusTag variant="ghost" color="success">
        deployed
      </StatusTag>
      <StatusTag variant="ghost" color="info">
        running
      </StatusTag>
      <StatusTag variant="ghost" color="warning">
        warning
      </StatusTag>
      <StatusTag variant="ghost" color="failed">
        failed
      </StatusTag>
      <StatusTag variant="ghost" color="loading">
        loading
      </StatusTag>
      <StatusTag variant="ghost" color="neutral">
        neutral
      </StatusTag>
    </Demo>
    <Demo title="Variants">
      <StatusTag variant="filled" color="success">
        filled
      </StatusTag>
      <StatusTag variant="outline" color="info">
        outline
      </StatusTag>
      <StatusTag variant="ghost" color="alert">
        ghost
      </StatusTag>
    </Demo>

    <PropsTable
      rows={[
        { name: 'variant', type: "'filled' | 'outline' | 'ghost'", required: true, description: 'Visual weight of the pill' },
        { name: 'color', type: "'success' | 'alert' | 'loading' | 'failed' | 'neutral' | 'warning' | 'info' | 'canceled'", required: true, description: 'Semantic status color' },
        { name: 'children', type: 'string', description: 'Status label' },
        { name: 'icon', type: 'ReactNode | string', description: 'Custom icon (defaults to a status icon)' },
        { name: 'tooltip', type: 'string', description: 'Tooltip shown on hover' },
        { name: 'tooltipMaxWidth', type: 'string', description: 'Max width of the tooltip' },
      ]}
    />
  </Page>
)

export const TrendTagPage = () => (
  <Page
    title="TrendTag"
    description="Shows a trend computed between two values (up, down, flat)."
    importCode={"import { TrendTag } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Trends">
      <TrendTag current={110} previous={100} />
      <TrendTag current={40} previous={55} />
      <TrendTag current={50} previous={50} />
      <TrendTag current={40} previous={55} invertColor />
    </Demo>

    <PropsTable
      rows={[
        { name: 'current', type: 'number', required: true, description: 'The current value to display' },
        { name: 'previous', type: 'number', description: 'Previous value; the trend is computed against it' },
        { name: 'variant', type: "'positive' | 'negative' | 'equal'", description: 'Force the trend direction instead of auto-detecting' },
        { name: 'invertColor', type: 'boolean', default: 'false', description: 'Swap the colors (e.g. when a rise is bad)' },
      ]}
    />
  </Page>
)

export const CounterCardPage = () => (
  <Page
    title="CounterCard"
    description="Metric card with title, value and trend. Grouped via CounterCardGroup."
    importCode={"import { CounterCard, CounterCardGroup } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Metric group" column>
      <CounterCardGroup>
        <CounterCard
          title="Active users"
          value={100000}
          trend={<TrendTag current={110} previous={100} />}
        />
        <CounterCard
          title="Error rate"
          value="2.4%"
          trend={<TrendTag current={40} previous={55} invertColor />}
        />
        <CounterCard title="Uptime" value="99.98%" />
      </CounterCardGroup>
    </Demo>

    <PropsTable
      rows={[
        { name: 'title', type: 'string | ReactNode', required: true, description: 'Metric label' },
        { name: 'value', type: 'string | number | Date', description: 'The value to display' },
        { name: 'renderValue', type: '(formatted: string) => ReactNode', description: 'Custom renderer for the formatted value' },
        { name: 'trend', type: 'ReactNode', description: 'Trend indicator, usually a <TrendTag>' },
      ]}
    />
    <PropsTable
      title="CounterCardGroup"
      rows={[
        { name: 'children', type: 'ReactNode', required: true, description: 'CounterCard items joined into a segmented row (optional CounterCardGroup.Separator between them)' },
      ]}
    />
  </Page>
)

export const AvatarPage = () => (
  <Page
    title="Avatar"
    description="A circle with a person's initials. Three sizes."
    importCode={"import { Avatar } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Sizes">
      <Avatar name="Maud" size="small" />
      <Avatar name="Maud" additionalName="Rochel" />
      <Avatar name="Kapptivate" size="large" />
    </Demo>

    <PropsTable
      rows={[
        { name: 'name', type: 'string', required: true, description: 'Name used for the first initial' },
        { name: 'additionalName', type: 'string', description: 'Second name, adds a second initial' },
        { name: 'size', type: "'small' | 'default' | 'large' | number", default: 'default', description: 'Avatar size' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Dim the avatar' },
      ]}
    />
  </Page>
)

export const ProgressBarPage = () => (
  <Page
    title="ProgressBar"
    description="Progress bar that colors by threshold: green → yellow → orange → red as the value rises."
    importCode={"import { ProgressBar } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Values" column>
      <ProgressBar value={30} />
      <ProgressBar value={70} />
      <ProgressBar value={92} />
    </Demo>
    <Demo title="Thickness" column>
      <ProgressBar value={64} thickness="thin" />
      <ProgressBar value={64} thickness="medium" />
      <ProgressBar value={64} thickness="large" />
    </Demo>

    <PropsTable
      rows={[
        { name: 'value', type: 'number', required: true, description: 'Progress between 0 and 100' },
        { name: 'thickness', type: "'thin' | 'medium' | 'large'", default: 'medium', description: 'Bar thickness' },
      ]}
    />
  </Page>
)

export const CollapsePage = () => (
  <Page
    title="Collapse"
    description="Collapsible panels to organize dense content."
    importCode={"import { Collapse } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <Collapse
        defaultActiveKey={['1']}
        items={[
          {
            key: '1',
            label: 'Network configuration',
            children: <Text color="secondary">Proxy, DNS and timeout settings.</Text>,
          },
          {
            key: '2',
            label: 'Authentication',
            children: <Text color="secondary">API keys, OAuth and secret rotation.</Text>,
          },
        ]}
      />
    </Demo>

    <PropsTable
      rows={[
        { name: 'items', type: 'CollapseItem[]', required: true, description: 'Panels: { key, label, children, description?, extra?, disabled? }' },
        { name: 'defaultActiveKey', type: 'string[]', description: 'Keys open by default (uncontrolled)' },
        { name: 'activeKeys', type: 'string[]', description: 'Controlled open keys' },
        { name: 'onChange', type: '(key: string | string[]) => void', description: 'Called when a panel toggles' },
        { name: 'ghost', type: 'boolean', description: 'Borderless, transparent style' },
        { name: 'size', type: "'s' | 'm' | 'l'", description: 'Panel size' },
        { name: 'expandIconPosition', type: "'start' | 'end'", description: 'Side of the expand icon' },
        { name: 'collapsible', type: "'header' | 'icon' | 'disabled'", description: 'What triggers expansion' },
        { name: 'noContentPadding', type: 'boolean', description: 'Remove the panel body padding' },
        { name: 'noBorder', type: 'boolean', description: 'Remove borders' },
      ]}
    />
  </Page>
)

export const CardPage = () => (
  <Page
    title="Card"
    description="Container surface with optional header, content and footer."
    importCode={"import { Card } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Composed card" column>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <Card>
          <Card.Header icon={IconActivity} title="Realtime status" />
          <Card.Content
            title="All systems operational"
            description="No incident in the last 24 hours."
          />
        </Card>
      </div>
    </Demo>

    <PropsTable
      rows={[
        { name: 'children', type: 'ReactNode', required: true, description: 'Card content, usually Card.Header / Content / Footer' },
        { name: 'onClick', type: '(e) => void', description: 'Makes the whole card clickable' },
      ]}
    />
    <PropsTable
      title="Card.Header"
      rows={[
        { name: 'title', type: 'string', required: true, description: 'Header title' },
        { name: 'icon', type: 'IconComponent', description: 'Icon before the title' },
        { name: 'asideContent', type: 'ReactNode', description: 'Content aligned to the right' },
      ]}
    />
    <PropsTable
      title="Card.Content"
      rows={[
        { name: 'title', type: 'string', description: 'Section title' },
        { name: 'description', type: 'string', description: 'Section description' },
        { name: 'children', type: 'ReactNode', description: 'Body content' },
        { name: 'asideContent', type: 'ReactNode', description: 'Content aligned to the right' },
        { name: 'compact', type: 'boolean', description: 'Tighter spacing' },
      ]}
    />
    <PropsTable
      title="Card.Footer"
      rows={[
        { name: 'children', type: 'ReactNode', required: true, description: 'Footer content, e.g. action buttons' },
      ]}
    />
  </Page>
)

export const TimelinePage = () => (
  <Page
    title="Timeline"
    description="Chronological sequence of events."
    importCode={"import { Timeline } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <Timeline
        items={[
          { color: 'green', children: <Text>Deployment succeeded — 2:02 PM</Text> },
          { color: 'blue', children: <Text>Build started — 1:58 PM</Text> },
          { color: 'gray', children: <Text>Commit pushed — 1:55 PM</Text> },
        ]}
      />
    </Demo>

    <PropsTable
      rows={[
        { name: 'items', type: 'TimelineItem[]', required: true, description: 'Events: { color?, children, dot?, label? } (Antd Timeline items)' },
        { name: 'itemPaddingBottom', type: 'number', description: 'Vertical spacing between items' },
        { name: 'className', type: 'string', description: 'Additional class name' },
      ]}
    />
  </Page>
)

type Row = { key: string; name: string; env: string; status: string }
const DATA: Row[] = [
  { key: '1', name: 'checkout-api', env: 'prod', status: 'healthy' },
  { key: '2', name: 'auth-service', env: 'staging', status: 'degraded' },
  { key: '3', name: 'search-index', env: 'prod', status: 'healthy' },
]

export const TablePage = () => (
  <Page
    title="Table"
    description="Sorted data table styled with the design system."
    importCode={"import { Table } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <Table
        rowKey="key"
        outerBorders
        data={DATA}
        columns={[
          { title: 'Service', dataIndex: 'name', key: 'name' },
          {
            title: 'Env',
            dataIndex: 'env',
            key: 'env',
            render: (env: string) => <Tag color="grey">{env}</Tag>,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => (
              <StatusTag
                variant="ghost"
                color={s === 'healthy' ? 'success' : 'warning'}
              >
                {s}
              </StatusTag>
            ),
          },
        ]}
      />
    </Demo>

    <PropsTable
      rows={[
        { name: 'data', type: 'T[]', required: true, description: 'Rows to render' },
        { name: 'columns', type: 'ColumnsType', required: true, description: 'Antd column definitions (title, dataIndex, render…)' },
        { name: 'rowKey', type: 'string | (row) => string', required: true, description: 'Unique key per row' },
        { name: 'isLoading', type: 'boolean', description: 'Show the loading state' },
        { name: 'emptyState', type: '{ icon?, text, description? }', description: 'Content shown when there is no data' },
        { name: 'pagination', type: '{ current?, pageSize, totalItemCount, getPage }', description: 'Server-side pagination config' },
        { name: 'onClickRow', type: '(row: T) => void', description: 'Called when a row is clicked' },
        { name: 'rowSelection', type: 'TableRowSelection', description: 'Enable row checkboxes' },
        { name: 'onChange', type: '(pagination, filters, sorter) => void', description: 'Called on sort/filter/paginate' },
        { name: 'showHeader', type: 'boolean', default: 'true', description: 'Show the header row' },
        { name: 'outerBorders', type: 'boolean', default: 'true', description: 'Draw the outer border' },
        { name: 'verticalBorders', type: 'boolean', description: 'Draw column separators' },
        { name: 'noHorizontalBorders', type: 'boolean', description: 'Remove row separators' },
        { name: 'compact', type: 'boolean', description: 'Tighter row height' },
        { name: 'persistSortKey', type: 'string', description: 'Persist the sort under this key' },
      ]}
    />
  </Page>
)
