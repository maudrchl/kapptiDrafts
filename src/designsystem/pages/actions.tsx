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
import { Page, Demo, PropsTable } from '../primitives'

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

    <PropsTable
      rows={[
        { name: 'color', type: "'primary' | 'secondary' | 'invisible' | 'danger-p' | 'danger-s'", default: 'invisible', description: 'Visual style. danger-p is solid, danger-s is soft' },
        { name: 'size', type: "'s' | 'm' | 'l'", default: 'm', description: 'Button size' },
        { name: 'icon', type: 'IconComponent', description: 'Icon component rendered before the label' },
        { name: 'iconRight', type: 'boolean', default: 'false', description: 'Render the icon after the label' },
        { name: 'counter', type: 'number', description: 'Badge counter shown next to the label' },
        { name: 'isLoading', type: 'boolean', default: 'false', description: 'Shows a spinner and disables the button' },
        { name: 'isLoadingChildren', type: 'ReactNode', description: 'Content shown while loading' },
        { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to the container width' },
        { name: 'noBorder', type: 'boolean', default: 'false', description: 'Remove the border' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interactions' },
        { name: 'onClick', type: '(e) => void', description: 'Click handler' },
      ]}
    />
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

    <PropsTable
      rows={[
        { name: 'children', type: 'ReactNode[]', required: true, description: 'The buttons to stack together' },
        { name: 'className', type: 'string', description: 'Additional class name' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the wrapper' },
      ]}
    />
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

    <PropsTable
      rows={[
        { name: 'menu', type: '{ items: MenuItem[] }', required: true, description: 'Menu config. Add { type: "divider" } for a separator, danger: true for destructive items' },
        { name: 'children', type: 'ReactNode', required: true, description: 'The trigger element' },
        { name: 'trigger', type: "'click' | 'hover' | 'contextMenu'", default: 'click', description: 'How the menu opens' },
        { name: 'placement', type: "'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'", description: 'Where the menu appears relative to the trigger' },
        { name: 'open', type: 'boolean', description: 'Controlled open state' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the open state changes' },
        { name: 'active', type: 'boolean', description: 'Force the active/pressed style on the trigger' },
      ]}
    />
  </Page>
)

export const ButtonDropdownPage = () => (
  <Page
    title="ButtonDropdown"
    description="A primary button that unfolds a menu, handy for a default action paired with variants."
    importCode={"import { ButtonDropdown } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Button + menu">
      <ButtonDropdown color="primary" icon={IconPlus} menu={MENU}>
        Create
      </ButtonDropdown>
    </Demo>

    <PropsTable
      rows={[
        { name: 'menu', type: '{ items: MenuItem[] }', required: true, description: 'Menu config, same shape as Dropdown' },
        { name: '…Button props', type: 'ButtonProps', description: 'Accepts every Button prop (color, size, icon, counter, disabled, isLoading…)' },
      ]}
    />
  </Page>
)
