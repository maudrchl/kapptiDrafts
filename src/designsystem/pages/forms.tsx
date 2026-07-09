import { useState } from 'react'
import {
  Input,
  SearchInput,
  Select,
  Checkbox,
  Radio,
  Toggle,
  Segmented,
  IconMail,
  IconSearch,
} from '@kapptivate/ui-kit'
import { Page, Demo, Stack, PropsTable } from '../primitives'

export const InputPage = () => {
  const [val, setVal] = useState('')
  return (
    <Page
      title="Input"
      description="Text field with label, icon, prefix/suffix and invalid state."
      importCode={"import { Input } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default" column>
        <Input
          label="Project name"
          placeholder="My project…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </Demo>
      <Demo title="With icon & suffix" column>
        <Input label="Email" placeholder="you@kapptivate.com" icon={<IconMail size={16} />} />
        <Input label="Latency" placeholder="0" suffix="ms" />
      </Demo>
      <Demo title="States" column>
        <Input label="Disabled" placeholder="Not editable" disabled />
        <Input
          label="Invalid"
          value="wrong value"
          invalid
          invalidMessage="This field is required"
        />
      </Demo>

      <PropsTable
        rows={[
          { name: 'value', type: 'string', description: 'Controlled value' },
          { name: 'onChange', type: '(e) => void', description: 'Change handler' },
          { name: 'label', type: 'string', description: 'Label shown above the field' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text' },
          { name: 'size', type: "'s' | 'm' | 'l'", default: 'l', description: 'Field size' },
          { name: 'type', type: 'string', default: "'text'", description: 'Native input type (text, password, number…)' },
          { name: 'icon', type: 'ReactNode', description: 'Icon rendered on the left' },
          { name: 'iconRight', type: 'ReactNode', description: 'Icon rendered on the right' },
          { name: 'prefix', type: 'string | ReactNode', description: 'Content before the value' },
          { name: 'suffix', type: 'string | ReactNode', description: 'Content after the value (e.g. "ms")' },
          { name: 'invalid', type: 'boolean', default: 'false', description: 'Error state' },
          { name: 'invalidMessage', type: 'string', description: 'Message shown under the field when invalid' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the field' },
          { name: 'canCopy', type: 'boolean', description: 'Show a copy-to-clipboard button' },
          { name: 'borderless', type: 'boolean', default: 'false', description: 'Remove the border' },
          { name: 'mono', type: 'boolean', default: 'false', description: 'Use the monospace font' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to container width' },
          { name: 'width / maxWidth', type: 'string', description: 'Explicit width constraints' },
          { name: 'maxLength', type: 'number', description: 'Maximum number of characters' },
          { name: 'autofocus', type: 'boolean', default: 'false', description: 'Focus on mount' },
          { name: 'onPressEnter', type: '(e) => void', description: 'Called when Enter is pressed' },
          { name: 'onBlur', type: '(e) => void', description: 'Blur handler' },
        ]}
      />
    </Page>
  )
}

export const SearchInputPage = () => {
  const [q, setQ] = useState('')
  return (
    <Page
      title="SearchInput"
      description="Search field with a built-in icon and quick clear."
      importCode={"import { SearchInput } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default" column>
        <SearchInput value={q} onChange={setQ} placeholder="Search…" fullwidth />
      </Demo>
      <Demo title="Sizes" column>
        <SearchInput value="" onChange={() => {}} placeholder="Small" size="s" />
        <SearchInput value="" onChange={() => {}} placeholder="Medium" size="m" />
      </Demo>

      <PropsTable
        rows={[
          { name: 'value', type: 'string', required: true, description: 'Controlled value' },
          { name: 'onChange', type: '(value: string, e?) => void', description: 'Called with the new value' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text' },
          { name: 'size', type: "'s' | 'm' | 'l'", default: 'm', description: 'Field size' },
          { name: 'fullwidth', type: 'boolean', default: 'false', description: 'Stretch to container width' },
          { name: 'width', type: 'string', description: 'Explicit width' },
          { name: 'autofocus', type: 'boolean', description: 'Focus on mount' },
          { name: 'onPressEnter', type: '(e) => void', description: 'Called when Enter is pressed' },
        ]}
      />
    </Page>
  )
}

const OPTIONS = [
  { label: 'Production', value: 'prod' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'dev' },
]

export const SelectPage = () => {
  const [val, setVal] = useState<string>()
  const [multi, setMulti] = useState<string[]>([])
  return (
    <Page
      title="Select"
      description="Single or multi-value picker, searchable, with a label."
      importCode={"import { Select } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default" column>
        <Select
          label="Environment"
          placeholder="Choose…"
          value={val}
          onChange={(_e, v) => setVal(v)}
          options={OPTIONS}
          fullWidth
        />
      </Demo>
      <Demo title="Searchable" column>
        <Select
          placeholder="Search an environment…"
          searchable
          options={OPTIONS}
          fullWidth
        />
      </Demo>
      <Demo title="Multiple" column>
        <Select
          mode="multiple"
          placeholder="Several environments…"
          value={multi}
          onChange={(_e, v) => setMulti(v)}
          options={OPTIONS}
          fullWidth
        />
      </Demo>

      <PropsTable
        rows={[
          { name: 'options', type: 'Option[]', description: 'Choices: { label, value, description?, options? }' },
          { name: 'value / defaultValue', type: 'any', description: 'Controlled / initial selection' },
          { name: 'onChange', type: '(e, value) => void', description: 'Called with the new selection' },
          { name: 'label', type: 'string', description: 'Label shown above the field' },
          { name: 'labelSize', type: 'Text size', description: 'Size of the label' },
          { name: 'size', type: "'s' | 'm' | 'l'", default: 'm', description: 'Field size' },
          { name: 'placeholder', type: 'string | ReactNode', description: 'Placeholder when empty' },
          { name: 'mode', type: "'multiple' | 'tags'", description: 'Enable multi-select or free tags' },
          { name: 'searchable', type: 'boolean', default: 'false', description: 'Allow filtering options by typing' },
          { name: 'clearable', type: 'boolean', description: 'Show a clear button; pairs with onClear' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the field' },
          { name: 'invalid', type: 'boolean', description: 'Error state' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to container width' },
          { name: 'minWidth', type: 'string', default: '150px', description: 'Minimum width' },
          { name: 'width / maxWidth', type: 'string', description: 'Explicit width constraints' },
          { name: 'maxTagCount', type: "number | 'responsive'", description: 'Max tags shown before collapsing (multi mode)' },
          { name: 'optionRender', type: '(option) => ReactNode', description: 'Custom option renderer' },
          { name: 'showOptionDescription', type: 'boolean', description: 'Show each option description' },
          { name: 'borderless', type: 'boolean', description: 'Remove the border' },
        ]}
      />
    </Page>
  )
}

export const CheckboxPage = () => {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  return (
    <Page
      title="Checkbox"
      description="Checkbox with label, description and disabled state. Each box needs a unique identifier."
      importCode={"import { Checkbox } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default" column>
        <Checkbox
          identifier="cb-notif"
          label="Receive alerts"
          checked={a}
          onChange={(e) => setA(e.target.checked)}
        />
        <Checkbox
          identifier="cb-weekly"
          label="Weekly report"
          description="A summary every Monday morning."
          checked={b}
          onChange={(e) => setB(e.target.checked)}
        />
      </Demo>
      <Demo title="Disabled" column>
        <Checkbox identifier="cb-disabled" label="Locked option" disabled />
      </Demo>

      <PropsTable
        rows={[
          { name: 'identifier', type: 'string', required: true, description: 'Unique id for the checkbox input' },
          { name: 'label', type: 'string | ReactNode', description: 'Label next to the box' },
          { name: 'checked / defaultChecked', type: 'boolean', description: 'Controlled / initial state' },
          { name: 'onChange', type: '(e) => void', description: 'Change handler' },
          { name: 'size', type: "'s' | 'm' | 'l'", description: 'Checkbox size' },
          { name: 'border', type: 'boolean', description: 'Wrap the checkbox in a bordered card' },
          { name: 'description', type: 'string', description: 'Secondary text under the label' },
          { name: 'checkedLabel', type: 'string', description: 'Alternate label shown when checked' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the checkbox' },
          { name: 'renderRight', type: 'ReactNode', description: 'Content aligned to the right' },
          { name: 'expandedContent', type: 'ReactNode', description: 'Content revealed when checked' },
        ]}
      />
    </Page>
  )
}

export const RadioPage = () => {
  const [val, setVal] = useState<string>('day')
  return (
    <Page
      title="Radio"
      description="Group of exclusive choices, horizontal or vertical."
      importCode={"import { Radio } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Horizontal" column>
        <Radio
          value={val}
          onChange={setVal}
          options={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]}
        />
      </Demo>
      <Demo title="Vertical" column>
        <Radio
          vertical
          value={val}
          onChange={setVal}
          options={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]}
        />
      </Demo>

      <PropsTable
        rows={[
          { name: 'options', type: '{ label, value }[]', required: true, description: 'The exclusive choices' },
          { name: 'value', type: 'T', required: true, description: 'Currently selected value' },
          { name: 'onChange', type: '(value: T) => void', required: true, description: 'Called when the selection changes' },
          { name: 'vertical', type: 'boolean', default: 'false', description: 'Stack the options vertically' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the whole group' },
        ]}
      />
    </Page>
  )
}

export const TogglePage = () => {
  const [on, setOn] = useState(true)
  return (
    <Page
      title="Toggle"
      description="On/off switch, with optional title and description."
      importCode={"import { Toggle } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default" column>
        <Stack>
          <Toggle
            title="Notifications"
            description="Receive alerts by email"
            value={on}
            onChange={setOn}
          />
          <Toggle title="Maintenance" value={false} disabled />
        </Stack>
      </Demo>

      <PropsTable
        rows={[
          { name: 'value', type: 'boolean', description: 'On/off state' },
          { name: 'onChange', type: '(checked: boolean) => void', description: 'Called when toggled' },
          { name: 'title', type: 'string', description: 'Label next to the switch' },
          { name: 'description', type: 'string', description: 'Secondary text under the title' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the switch' },
        ]}
      />
    </Page>
  )
}

export const SegmentedPage = () => {
  const [seg, setSeg] = useState('week')
  const [view, setView] = useState('s')
  return (
    <Page
      title="Segmented"
      description="Segmented control to switch between a few mutually exclusive options."
      importCode={"import { Segmented } from '@kapptivate/ui-kit'"}
    >
      <Demo title="Default">
        <Segmented
          value={seg}
          onChange={setSeg}
          options={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]}
        />
      </Demo>
      <Demo title="With icons">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { label: 'Search', value: 's', icon: <IconSearch size={14} /> },
            { label: 'Emails', value: 'm', icon: <IconMail size={14} /> },
          ]}
        />
      </Demo>

      <PropsTable
        rows={[
          { name: 'options', type: '{ label, value, icon? }[]', required: true, description: 'The segments to display' },
          { name: 'value', type: 'T', description: 'Currently selected segment' },
          { name: 'onChange', type: '(value: T) => void', description: 'Called when a segment is picked' },
          { name: 'size', type: "'small' | 'middle' | 'large'", description: 'Control size' },
        ]}
      />
    </Page>
  )
}
