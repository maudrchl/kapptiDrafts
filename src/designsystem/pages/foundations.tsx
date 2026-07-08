import {
  Title,
  Text,
  Banner,
  IconActivity,
  IconAlertTriangle,
  IconArchive,
  IconArrowRight,
  IconBell,
  IconBolt,
  IconBookOpen,
  IconBug,
  IconCalendarDays,
  IconCheck,
  IconChevronRight,
  IconClock10,
  IconCode,
  IconCopy,
  IconDownload,
  IconEye,
  IconFile,
  IconFolder,
  IconGauge,
  IconGlobe,
  IconHome,
  IconInfo,
  IconLayers,
  IconLineChart,
  IconLock,
  IconMail,
  IconMonitor,
  IconPencil,
  IconPlay,
  IconPlus,
  IconRefreshCw,
  IconRocket,
  IconSearch,
  IconSettings,
  IconShield,
  IconSparkle,
  IconStar,
  IconTrash,
  IconTrendingUp,
  IconUser2,
  IconWrench,
  IconZap,
} from '@kapptivate/ui-kit'
import { Page, Demo } from '../primitives'

/* ------------------------------- Overview ------------------------------- */
export const Overview = () => (
  <Page
    title="Kapptivate Design System"
    description="The live reference for @kapptivate/ui-kit components. Each page shows the component's real variants, ready to copy into a prototype."
  >
    <Demo title="Getting started" column>
      <Text color="secondary">
        Every example on this site uses the real{' '}
        <Text mono inline>
          @kapptivate/ui-kit
        </Text>{' '}
        package. Browse by category in the sidebar: Foundations, Actions, Forms,
        Data display, Feedback and Navigation.
      </Text>
      <Banner
        variant="primary"
        description="Tip: the “Copy” button on each import block gives you the exact line to paste."
      />
    </Demo>
  </Page>
)

/* -------------------------------- Colors -------------------------------- */
type Swatch = { name: string; varName: string }

const SWATCH_GROUPS: { title: string; swatches: Swatch[] }[] = [
  {
    title: 'Text',
    swatches: [
      { name: 'Primary', varName: '--color-text-primary' },
      { name: 'Secondary', varName: '--color-text-secondary' },
      { name: 'Third', varName: '--color-text-third' },
      { name: 'Warning', varName: '--color-text-warning' },
    ],
  },
  {
    title: 'Semantic',
    swatches: [
      { name: 'Primary', varName: '--color-primary-hover' },
      { name: 'Primary light', varName: '--color-primary-light' },
      { name: 'Secondary', varName: '--color-secondary-hover' },
      { name: 'Success', varName: '--color-success' },
      { name: 'Success light', varName: '--color-success-light' },
      { name: 'Error', varName: '--color-error' },
      { name: 'Error light', varName: '--color-error-light' },
      { name: 'Third / amber', varName: '--color-third' },
    ],
  },
  {
    title: 'Accents',
    swatches: [
      { name: 'Blue', varName: '--color-accent-blue' },
      { name: 'Dark blue', varName: '--color-accent-dark-blue' },
      { name: 'Purple', varName: '--color-accent-purple' },
      { name: 'Pink', varName: '--color-accent-pink' },
      { name: 'Brown', varName: '--color-accent-brown' },
    ],
  },
  {
    title: 'Neutrals',
    swatches: [
      { name: 'Grey 100', varName: '--color-grey-100' },
      { name: 'Grey 200', varName: '--color-grey-200' },
      { name: 'Grey 300', varName: '--color-grey-300' },
      { name: 'Grey 700', varName: '--color-grey-700' },
      { name: 'Grey 800', varName: '--color-grey-800' },
      { name: 'Grey 900', varName: '--color-grey-900' },
      { name: 'Border grey', varName: '--color-border-grey' },
      { name: 'Surface grey', varName: '--color-surface-grey' },
    ],
  },
]

export const Colors = () => (
  <Page
    title="Colors"
    description="Color tokens exposed as CSS variables. Use them via var(--token) to stay in sync with the theme."
  >
    {SWATCH_GROUPS.map((group) => (
      <Demo key={group.title} title={group.title}>
        <div className="dsSwatchGrid">
          {group.swatches.map((s) => (
            <div key={s.varName} className="dsSwatch">
              <div
                className="dsSwatchColor"
                style={{ background: `var(${s.varName})` }}
              />
              <div className="dsSwatchMeta">
                <Text size="sm" weight="medium">
                  {s.name}
                </Text>
                <div>
                  <Text size="xs" color="third" mono>
                    {s.varName}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Demo>
    ))}
  </Page>
)

/* ------------------------------ Typography ------------------------------ */
export const Typography = () => (
  <Page
    title="Typography"
    description="The Title and Text components cover the whole typographic hierarchy."
    importCode={"import { Title, Text } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Titles" column>
      <Title size="h1">Heading 1</Title>
      <Title size="h2">Heading 2</Title>
      <Title size="h3">Heading 3</Title>
      <Title size="h4">Heading 4</Title>
      <Title size="h5">Heading 5</Title>
      <Title size="h6">Heading 6</Title>
    </Demo>

    <Demo title="Text — sizes" column>
      <Text size="lg">Large — ~15px</Text>
      <Text size="base">Base — 14px</Text>
      <Text size="sm">Small (sm) — ~13px</Text>
      <Text size="s">Small (s) — ~12px</Text>
      <Text size="xs">Extra small — ~11px</Text>
      <Text size="xxs">Tiny — ~9px</Text>
    </Demo>

    <Demo title="Text — weights" column>
      <Text weight="light">Light — 300</Text>
      <Text weight="normal">Normal — 400</Text>
      <Text weight="medium">Medium — 500</Text>
      <Text weight="semibold">Semibold — 600</Text>
      <Text weight="bold">Bold — 700</Text>
    </Demo>

    <Demo title="Text — colors">
      <Text color="primary">primary</Text>
      <Text color="secondary">secondary</Text>
      <Text color="third">third</Text>
      <Text color="success">success</Text>
      <Text color="error">error</Text>
      <Text color="blue">blue</Text>
      <Text color="purple">purple</Text>
      <Text color="orange">orange</Text>
    </Demo>

    <Demo title="Monospace">
      <Text mono>const uptime = 99.98%</Text>
    </Demo>
  </Page>
)

/* -------------------------------- Icons --------------------------------- */
const ICONS = {
  IconActivity,
  IconAlertTriangle,
  IconArchive,
  IconArrowRight,
  IconBell,
  IconBolt,
  IconBookOpen,
  IconBug,
  IconCalendarDays,
  IconCheck,
  IconChevronRight,
  IconClock10,
  IconCode,
  IconCopy,
  IconDownload,
  IconEye,
  IconFile,
  IconFolder,
  IconGauge,
  IconGlobe,
  IconHome,
  IconInfo,
  IconLayers,
  IconLineChart,
  IconLock,
  IconMail,
  IconMonitor,
  IconPencil,
  IconPlay,
  IconPlus,
  IconRefreshCw,
  IconRocket,
  IconSearch,
  IconSettings,
  IconShield,
  IconSparkle,
  IconStar,
  IconTrash,
  IconTrendingUp,
  IconUser2,
  IconWrench,
  IconZap,
}

export const Icons = () => (
  <Page
    title="Icons"
    description="A sample of the icon library (Lucide + custom). All accept size and color."
    importCode={"import { IconActivity, IconBell } from '@kapptivate/ui-kit'"}
  >
    <Demo title="Library sample">
      <div className="dsIconGrid">
        {Object.entries(ICONS).map(([name, Icon]) => (
          <div key={name} className="dsIconCell">
            <Icon size={22} />
            <span className="dsIconLabel">{name}</span>
          </div>
        ))}
      </div>
    </Demo>
  </Page>
)
