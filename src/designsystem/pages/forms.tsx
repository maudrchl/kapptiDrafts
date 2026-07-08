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
import { Page, Demo, Stack } from '../primitives'

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
          onChange={(v) => setVal(v)}
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
          onChange={(v) => setMulti(v)}
          options={OPTIONS}
          fullWidth
        />
      </Demo>
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
    </Page>
  )
}

export const SegmentedPage = () => {
  const [seg, setSeg] = useState('week')
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
          value=""
          onChange={() => {}}
          options={[
            { label: 'Search', value: 's', icon: <IconSearch size={14} /> },
            { label: 'Emails', value: 'm', icon: <IconMail size={14} /> },
          ]}
        />
      </Demo>
    </Page>
  )
}
