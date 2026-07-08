import {
  Tabs,
  Breadcrumb,
  Anchor,
  Text,
  IconActivity,
  IconSettings,
  IconBell,
} from '@kapptivate/ui-kit'
import { Page, Demo } from '../primitives'

export const TabsPage = () => (
  <Page
    title="Tabs"
    description="Tabs to segment a view. Default and card types."
    importCode={"import { Tabs } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <Tabs
        defaultActiveKey="overview"
        tabs={[
          { key: 'overview', label: 'Overview', children: <Text color="secondary">Service summary.</Text> },
          { key: 'metrics', label: 'Metrics', children: <Text color="secondary">Latency and traffic charts.</Text> },
          { key: 'logs', label: 'Logs', children: <Text color="secondary">Latest events.</Text> },
        ]}
      />
    </Demo>
    <Demo title="Card type" column>
      <Tabs
        type="card"
        defaultActiveKey="a"
        tabs={[
          { key: 'a', label: 'Production', children: <Text color="secondary">Prod environment.</Text> },
          { key: 'b', label: 'Staging', children: <Text color="secondary">Staging environment.</Text> },
        ]}
      />
    </Demo>
  </Page>
)

export const BreadcrumbPage = () => (
  <Page
    title="Breadcrumb"
    description="Breadcrumbs: a secondary navigation aid showing the current location."
    importCode={"import { Breadcrumb } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <Breadcrumb
        items={[
          { title: 'Products' },
          { title: 'Monitoring' },
          { title: 'checkout-api' },
        ]}
      />
    </Demo>
  </Page>
)

export const AnchorPage = () => (
  <Page
    title="Anchor"
    description="Anchored side navigation that follows the scroll of its sections."
    importCode={"import { Anchor } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <Anchor>
        <Anchor.Item title="Activity" id="a-activity" icon={<IconActivity />}>
          <Text color="secondary">Activity section.</Text>
        </Anchor.Item>
        <Anchor.Item title="Alerts" id="a-alerts" icon={<IconBell />}>
          <Text color="secondary">Alerts section.</Text>
        </Anchor.Item>
        <Anchor.Item title="Settings" id="a-settings" icon={<IconSettings />}>
          <Text color="secondary">Settings section.</Text>
        </Anchor.Item>
      </Anchor>
    </Demo>
  </Page>
)
