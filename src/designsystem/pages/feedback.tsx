import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  Banner,
  Alert,
  Modal,
  Drawer,
  Tooltip,
  Popover,
  EmptyState,
  Loader,
  Button,
  Text,
  ExternalLink,
  IconFolder,
  IconHelpCircle,
} from '@kapptivate/ui-kit'
import { Page, Demo, Stack } from '../primitives'

/** Un bloc de guideline : exemple vivant + « quand l'utiliser » + astuce. */
const GuidelineBlock = ({
  variant,
  heading,
  when,
  example,
  tip,
}: {
  variant: 'danger' | 'warning' | 'secondary' | 'success'
  heading: string
  when: string[]
  example: string
  tip?: ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Text weight="semibold">{heading}</Text>
    <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {when.map((w) => (
        <li key={w}>
          <Text size="s" color="secondary">
            {w}
          </Text>
        </li>
      ))}
    </ul>
    {tip && (
      <Text size="s" color="secondary">
        {tip}
      </Text>
    )}
    <Banner variant={variant} description={example} />
  </div>
)

const GUIDE_ROWS: [string, string][] = [
  [
    'An ongoing incident may impact your experience with kapptivate. Our team is actively working to fix it.',
    'Un incident pouvant perturber votre expérience sur kapptivate est en cours. Nous sommes mobilisées pour le résoudre au plus vite.',
  ],
  [
    'Due to the year-end holidays, platform support will be exceptionally limited from December 25 to 28.',
    'En raison des fêtes de fin d’année, le support de la plateforme sera exceptionnellement limité du 25 au 28 décembre.',
  ],
  [
    'Your kapptivate licence has expired. Please contact our sales team to renew it.',
    'Votre licence kapptivate a expiré. Merci de contacter notre équipe commerciale pour la renouveler au plus vite.',
  ],
]

export const BannerPage = () => (
  <Page
    title="Banner"
    description="Contextual information bar shown at the top of the interface. Keep messages short, action-oriented, and pick the color by message type."
    importCode={"import { Banner } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Variants" column>
      <Stack>
        <Banner variant="primary" description="Informational message." />
        <Banner variant="success" description="Operation succeeded." />
        <Banner variant="warning" description="Quota almost reached." />
        <Banner variant="danger" description="Immediate action required." />
        <Banner variant="error" description="Something went wrong." />
      </Stack>
    </Demo>
    <Demo title="With sub-description" column>
      <Banner
        variant="warning"
        description="SSL certificate expiring soon"
        subDescription="Renew it before the 30th to avoid an outage."
      />
    </Demo>

    <Demo
      title="When to use each variant"
      description="Pick the color by the type of message. Never mix multiple message types in one banner."
      column
    >
      <Stack>
        <GuidelineBlock
          variant="danger"
          heading="🔴 Danger — the user must take immediate action to avoid being blocked"
          when={[
            'License expiration or renewal required',
            'Payment issues',
            'Critical configuration missing',
          ]}
          tip="✅ Always include clear instructions on how to act (link or contact email)."
          example="Your license has expired. Contact us at sales@kapptivate.com to renew it."
        />
        <GuidelineBlock
          variant="warning"
          heading="🟠 Warning — a problem that affects the user but needs no action from them"
          when={[
            'Service degradation / production incident on our side',
            'Agent or monitor update required',
            'Temporary feature limitation',
          ]}
          example="We’re currently experiencing performance issues. Our team is investigating."
        />
        <GuidelineBlock
          variant="secondary"
          heading="⚪️ Info — neutral or general information, no action required"
          when={[
            'Scheduled maintenance',
            'Release announcements',
            'Contextual updates',
          ]}
          example="Scheduled maintenance is planned on September 15 from 10–11 PM UTC."
        />
        <GuidelineBlock
          variant="success"
          heading="🟢 Success — a positive outcome at the environment or account level"
          when={[
            'Major setup or configuration completed',
            'Milestones reached (first monitor created, X tests executed…)',
            'Environment health fully restored after an incident',
          ]}
          example="Service is fully restored. Everything is back to normal."
        />
      </Stack>
    </Demo>

    <Demo title="Tone & style" column>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          'Keep messages short and direct — one sentence if possible.',
          'Start with the key information.',
          'Add a clear call-to-action if needed (e.g. “Update your agent →”).',
          'Avoid technical jargon — use simple, user-friendly language.',
          'Don’t mix multiple message types in one banner.',
        ].map((r) => (
          <li key={r}>
            <Text size="s" color="secondary">
              {r}
            </Text>
          </li>
        ))}
      </ul>
    </Demo>

    <Demo title="Message examples (EN / FR)" column>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>EN</th>
            <th style={thStyle}>FR</th>
          </tr>
        </thead>
        <tbody>
          {GUIDE_ROWS.map(([en, fr]) => (
            <tr key={en}>
              <td style={tdStyle}>{en}</td>
              <td style={tdStyle}>{fr}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Text size="s" color="secondary">
        Source :{' '}
        <ExternalLink href="https://app.notion.com/p/kapptivate/Banners-Guidelines-2621c6485ddc80b6830cf7660fbde878">
          Banners Guidelines (Notion)
        </ExternalLink>
      </Text>
    </Demo>
  </Page>
)

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-surface-grey, #fafafb)',
  borderBottom: '1px solid var(--color-border)',
}

const tdStyle: CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'top',
  color: 'var(--color-text-primary)',
  lineHeight: 1.5,
}

export const AlertPage = () => {
  const [open, setOpen] = useState(false)
  const [danger, setDanger] = useState(false)
  return (
    <Page
      title="Alert"
      description="A small confirmation modal with a title, a message and two actions."
      importCode={"import { Alert } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Confirmation">
        <Button color="secondary" onClick={() => setOpen(true)}>
          Open a confirmation
        </Button>
        <Button color="danger-s" onClick={() => setDanger(true)}>
          Dangerous confirmation
        </Button>
        <Alert
          open={open}
          title="Publish changes?"
          okText="Publish"
          cancelText="Cancel"
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          Changes will be visible immediately.
        </Alert>
        <Alert
          open={danger}
          danger
          title="Delete this test?"
          okText="Delete"
          cancelText="Cancel"
          onOk={() => setDanger(false)}
          onCancel={() => setDanger(false)}
        >
          This action cannot be undone.
        </Alert>
      </Demo>
    </Page>
  )
}

export const ModalPage = () => {
  const [open, setOpen] = useState(false)
  return (
    <Page
      title="Modal"
      description="Rich, customizable modal with dedicated Content and Footer."
      importCode={"import { Modal } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default">
        <Button color="primary" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal open={open} title="New monitor" onCancel={() => setOpen(false)}>
          <Modal.Content>
            <Text color="secondary">
              Configure the frequency, target and alert thresholds of the monitor.
            </Text>
          </Modal.Content>
          <Modal.Footer>
            <Button color="invisible" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => setOpen(false)}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
      </Demo>
    </Page>
  )
}

export const DrawerPage = () => {
  const [open, setOpen] = useState(false)
  return (
    <Page
      title="Drawer"
      description="Sliding side panel. Driven by the open prop to preserve the animation."
      importCode={"import { Drawer } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default">
        <Button color="secondary" onClick={() => setOpen(true)}>
          Open panel
        </Button>
        <Drawer open={open} title="Run details" onClose={() => setOpen(false)} width={420}>
          <Text color="secondary">
            Logs, screenshots and metrics from the latest test run.
          </Text>
        </Drawer>
      </Demo>
    </Page>
  )
}

export const TooltipPage = () => (
  <Page
    title="Tooltip"
    description="Hover tooltip, positionable on all four sides."
    importCode={"import { Tooltip } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Placements">
      <Tooltip content="Top" placement="top">
        <Button color="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="Right" placement="right">
        <Button color="secondary">Right</Button>
      </Tooltip>
      <Tooltip content="Bottom" placement="bottom">
        <Button color="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" placement="left">
        <Button color="secondary">Left</Button>
      </Tooltip>
    </Demo>
  </Page>
)

export const PopoverPage = () => (
  <Page
    title="Popover"
    description="Rich floating content triggered on click or hover."
    importCode={"import { Popover } from '@kapptivate/ui-kit'"}
  >
    <Demo title="On click">
      <Popover
        trigger="click"
        content={
          <div style={{ maxWidth: 220 }}>
            <Text weight="semibold">Contextual help</Text>
            <div style={{ marginTop: 4 }}>
              <Text size="s" color="secondary">
                This threshold triggers an alert when latency exceeds the value.
              </Text>
            </div>
          </div>
        }
      >
        <Button color="secondary" icon={IconHelpCircle}>
          Learn more
        </Button>
      </Popover>
    </Demo>
  </Page>
)

export const EmptyStatePage = () => (
  <Page
    title="EmptyState"
    description="Centered icon + title + description. Ideal for empty lists or tables."
    importCode={"import { EmptyState } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Default" column>
      <EmptyState
        icon={<IconFolder color="var(--color-text-secondary)" />}
        text="No folders"
        description="Items you create will appear here."
      />
    </Demo>
  </Page>
)

export const LoaderPage = () => (
  <Page
    title="Loader"
    description="Loading animation. Three sizes."
    importCode={"import { Loader } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Sizes">
      <Loader size="small" />
      <Loader size="medium" />
      <Loader size="large" />
    </Demo>
  </Page>
)
