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
import { Page, Demo } from '../primitives'

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
        <CounterCardGroup.Separator />
        <CounterCard
          title="Error rate"
          value="2.4%"
          trend={<TrendTag current={40} previous={55} invertColor />}
        />
        <CounterCardGroup.Separator />
        <CounterCard title="Uptime" value="99.98%" />
      </CounterCardGroup>
    </Demo>
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
  </Page>
)

export const ProgressBarPage = () => (
  <Page
    title="ProgressBar"
    description="Progress bar. Capacity mode (color by threshold) or progress mode (fixed color)."
    importCode={"import { ProgressBar } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Capacity mode" column>
      <ProgressBar value={30} />
      <ProgressBar value={70} />
      <ProgressBar value={92} />
    </Demo>
    <Demo title="Progress mode" column>
      <ProgressBar mode="progress" value={64} />
      <ProgressBar mode="progress" value={64} thickness="large" />
    </Demo>
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
  </Page>
)
