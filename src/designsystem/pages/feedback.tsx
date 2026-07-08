import { useState } from 'react'
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
  IconFolder,
  IconHelpCircle,
} from '@kapptivate/ui-kit'
import { Page, Demo, Stack } from '../primitives'

export const BannerPage = () => (
  <Page
    title="Banner"
    description="Contextual information bar. Seven semantic variants."
    importCode={"import { Banner } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Variants" column>
      <Stack>
        <Banner variant="primary" description="Informational message." />
        <Banner variant="success" description="Operation succeeded." />
        <Banner variant="warning" description="Quota almost reached." />
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
  </Page>
)

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
