import {
  Button,
  ButtonGroup,
  ButtonDropdown,
  Dropdown,
  IconPlus,
  IconDownload,
  IconTrash,
  IconPencil,
  IconChevronDown,
  IconCopy,
  IconSettings,
} from '@kapptivate/ui-kit'
import { Page, Demo } from '../primitives'

export const ButtonPage = () => (
  <Page
    title="Button"
    description="The action button. Five colors, three sizes, an optional icon and loading / disabled states."
    importCode={"import { Button } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Colors">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="invisible">Invisible</Button>
      <Button color="danger-p">Danger</Button>
      <Button color="danger-s">Danger soft</Button>
    </Demo>

    <Demo title="Sizes">
      <Button color="secondary" size="s">
        Small
      </Button>
      <Button color="secondary" size="m">
        Medium
      </Button>
      <Button color="secondary" size="l">
        Large
      </Button>
    </Demo>

    <Demo title="With icon">
      <Button color="primary" icon={IconPlus}>
        Create
      </Button>
      <Button color="secondary" icon={IconDownload}>
        Export
      </Button>
      <Button color="secondary" icon={IconChevronDown} iconRight>
        Options
      </Button>
      <Button color="danger-s" icon={IconTrash}>
        Delete
      </Button>
    </Demo>

    <Demo title="States">
      <Button color="primary" isLoading>
        Loading
      </Button>
      <Button color="primary" disabled>
        Disabled
      </Button>
      <Button color="secondary" counter={4}>
        Filters
      </Button>
    </Demo>
  </Page>
)

export const ButtonGroupPage = () => (
  <Page
    title="ButtonGroup"
    description="Stacks several buttons together to form a segmented action bar."
    importCode={"import { ButtonGroup, Button } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Action group">
      <ButtonGroup>
        <Button color="secondary" icon={IconPencil}>
          Edit
        </Button>
        <Button color="secondary" icon={IconCopy}>
          Duplicate
        </Button>
        <Button color="secondary" icon={IconSettings}>
          Settings
        </Button>
      </ButtonGroup>
    </Demo>
  </Page>
)

const MENU = {
  items: [
    { key: 'edit', label: 'Edit', icon: <IconPencil size={12} /> },
    { key: 'dup', label: 'Duplicate', icon: <IconCopy size={12} /> },
    { type: 'divider' as const },
    {
      key: 'del',
      label: 'Delete',
      danger: true,
      icon: <IconTrash size={12} />,
    },
  ],
}

export const DropdownPage = () => (
  <Page
    title="Dropdown"
    description="A contextual menu anchored to any trigger. Supports icons, dividers and dangerous items."
    importCode={"import { Dropdown } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Menu on a button">
      <Dropdown menu={MENU}>
        <Button color="secondary" icon={IconChevronDown} iconRight>
          Actions
        </Button>
      </Dropdown>
    </Demo>
  </Page>
)

export const ButtonDropdownPage = () => (
  <Page
    title="ButtonDropdown"
    description="A primary button that unfolds a menu — handy for a default action paired with variants."
    importCode={"import { ButtonDropdown } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Button + menu">
      <ButtonDropdown color="primary" icon={IconPlus} menu={MENU}>
        Create
      </ButtonDropdown>
    </Demo>
  </Page>
)
