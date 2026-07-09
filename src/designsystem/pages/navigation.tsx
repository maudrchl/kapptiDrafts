import {
  Tabs,
  Breadcrumb,
  Anchor,
  Text,
  IconActivity,
  IconSettings,
  IconBell,
} from '@kapptivate/ui-kit'
import { Page, Demo, PropsTable } from '../primitives'

export const TabsPage = () => (
  <Page
    title="Tabs"
    description="Tabs to segment a view. Default and card types."
    importCode={"import { Tabs, IconActivity, IconBell, IconSettings } from '@kapptivate/ui-kit'"}
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
    <Demo title="With icons" column>
      <Tabs
        defaultActiveKey="activity"
        tabs={[
          { key: 'activity', label: 'Activity', icon: <IconActivity />, children: <Text color="secondary">Recent activity.</Text> },
          { key: 'alerts', label: 'Alerts', icon: <IconBell />, children: <Text color="secondary">Triggered alerts.</Text> },
          { key: 'settings', label: 'Settings', icon: <IconSettings />, children: <Text color="secondary">Configuration.</Text> },
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

    <PropsTable
      rows={[
        { name: 'tabs', type: '{ key, label, children, icon? }[]', required: true, description: 'Tab items and their panels' },
        { name: 'type', type: "'default' | 'card'", default: 'default', description: 'Visual style of the tab bar' },
        { name: 'defaultActiveKey', type: 'string', description: 'Initially active tab (uncontrolled)' },
        { name: 'activeKey', type: 'string', description: 'Active tab (controlled)' },
        { name: 'onChange', type: '(key: string) => void', description: 'Called when the active tab changes' },
        { name: 'onTabClick', type: '(key: string) => void', description: 'Called when a tab is clicked' },
        { name: 'centered', type: 'boolean', description: 'Center the tab bar' },
        { name: 'leftExtraContent', type: 'ReactNode', description: 'Content before the tabs' },
        { name: 'rightExtraContent', type: 'ReactNode', description: 'Content after the tabs' },
      ]}
    />
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
    <Demo title="Single item" column>
      <Breadcrumb items={[{ title: 'Products' }]} />
    </Demo>
    <Demo title="Collapsed (long path)" column>
      <Breadcrumb
        maxLength={2}
        items={[
          { title: 'Products' },
          { title: 'Monitoring' },
          { title: 'Environments' },
          { title: 'Production' },
          { title: 'checkout-api' },
          { title: 'Latency check' },
        ]}
      />
    </Demo>

    <PropsTable
      rows={[
        { name: 'items', type: '{ title, onClick? }[]', required: true, description: 'Breadcrumb segments; onClick makes a segment a link' },
        { name: 'maxLength', type: 'number', default: '3', description: 'Collapses the middle into a "…" menu when items.length > maxLength + 1' },
        { name: 'icon', type: 'ReactNode', description: 'Icon shown before each segment' },
      ]}
    />
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

    <PropsTable
      rows={[
        { name: 'children', type: 'Anchor.Item[]', required: true, description: 'The navigable sections' },
        { name: 'padding', type: "'small' | 'large'", description: 'Inner padding of the component' },
        { name: 'gap', type: 'number', description: 'Space between items' },
        { name: 'noPadding', type: 'boolean', description: 'Remove the outer padding' },
        { name: 'noBackground', type: 'boolean', description: 'Remove the grey background' },
      ]}
    />
    <PropsTable
      title="Anchor.Item"
      rows={[
        { name: 'title', type: 'ReactNode', required: true, description: 'Label shown in the nav' },
        { name: 'id', type: 'string', required: true, description: 'Target section id' },
        { name: 'icon', type: 'ReactElement', description: 'Icon before the label' },
        { name: 'children', type: 'ReactNode', required: true, description: 'Section content' },
      ]}
    />
  </Page>
)
