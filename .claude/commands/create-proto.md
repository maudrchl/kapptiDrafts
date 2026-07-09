# Create a new kapptidrafts prototype

You are creating a new interactive React prototype in the **kapptidrafts** project. This is a Vite+React+TypeScript app that imports real production components from the `@kapptivate/ui-kit` library.

## User input

The user will describe what they want to prototype. Ask clarifying questions if the brief is vague, but don't over-ask — infer sensible defaults.

$ARGUMENTS

## Step 1 — Gather info

Before writing any code:

1. **Slug**: derive a kebab-case slug from the proto name (e.g. "Run Queue Settings" → `run-queue-settings`). The slug becomes the folder name AND the URL (`/p/<slug>`).
2. **Collection**: ask the user which collection it belongs to (AI, Observability, or none) — or infer from context.
3. **Icon**: pick a fitting icon from the ui-kit exports below. Default to `IconComponent` if unsure.
4. **Description**: write a one-line English description of what the proto shows.

## Step 2 — Create files

Create the following files under `src/protos/<slug>/`:

### `meta.ts`

```ts
import { <IconName> } from '@kapptivate/ui-kit'
import type { ProtoMeta } from '../registry'

const meta: ProtoMeta = {
  title: '<Proto Title>',
  status: 'wip design',
  collection: '<Collection>',       // omit if none
  description: '<one-line English description>',
  icon: <IconName>,
  updatedAt: '<today YYYY-MM-DD>',
}

export default meta
```

### `Proto.tsx`

The main React component (default export). Structure:

```ts
import { useState } from 'react'
import { Button, SearchInput, ... } from '@kapptivate/ui-kit'
import styles from './<slug>.module.scss'
import { ... } from './constants'

const Proto = () => {
  // state, handlers
  return (
    <div className={styles.page}>
      {/* proto content */}
    </div>
  )
}

export default Proto
```

### `<slug>.module.scss`

CSS modules file for all custom styles. Use CSS custom properties from ui-kit tokens when they exist:
- `var(--color-primary)` (#ed7846 orange)
- `var(--color-surface-white)`, `var(--color-surface-grey)`
- `var(--color-border-grey)`, `var(--color-border-strong)`
- `var(--color-text-primary)`, `var(--color-text-secondary)`
- `var(--color-success)`, `var(--color-error)`, `var(--color-warning)`
- `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`
- `var(--color-grey-100)`, `var(--color-grey-200)`, etc.

### `constants.ts`

Types and mock data. Keep data realistic and Kapptivate-themed (test automation, monitoring, devices, runners, etc.). Export typed arrays/objects — never inline large data in Proto.tsx.

## Critical rules

### UI language & microcopy
**All user-facing text in the proto MUST be in English.** Labels, descriptions, placeholders, table headers, button text, mock data — everything the user reads is English. Code comments can be in any language.

Follow Kapptivate's tone of voice rules for all UI copy:
- **Sentence case everywhere** — buttons, labels, headers, page titles, banners, tooltips. Only capitalize proper nouns and acronyms (API Keys, CI/CD).
- **Buttons**: `"Verb entity"` — e.g. "Create monitor", "Save changes". Compound: `"Save & run"` (lowercase after &). Bulk: `"Delete (3)"`. Picker triggers: `"Move to..."`.
- **Empty states**: title = `"Create your first [entity] to [benefit]"`, desc = 1–2 benefit sentences in second person ending with period, CTA = `"Create [entity]"`.
- **Success toasts**: `"Entity verbed successfully"` — e.g. "Monitor created successfully".
- **Error toasts**: `"We couldn't verb the entity. Try again."` — empathetic, actionable.
- **Confirm dialogs**: title = `"Verb entity?"`, body = `"If you verb this entity, consequence."`, button = `"Verb entity"`. Irreversibility = `"This action cannot be undone."`.
- **Form labels**: sentence case noun phrase, no colon. Optional = `"(optional)"` lowercase. Validation = imperative (`"Enter a name for your monitor"`).
- **Placeholders**: example values (`"e.g. user_email"`, `"My website monitor"`), search = `"Search..."`, selects = `"Select a [entity]..."`.
- **Banners**: 1–2 sentences, declarative or instructional, second person, ends with period.
- **Tooltips**: 1 sentence max, ends with period. Explain why or what happens.
- **Voice**: professional but friendly, contractions OK (don't, can't, we'll), second person (your tests), no emoji in UI text.

### Use ui-kit components — NEVER recreate them
The whole point of this project is to use the real production components. Before writing any custom HTML/CSS for a UI element, check if a ui-kit component exists. Use the MCP tool `mcp__ui-kit__get-documentation` to look up component APIs when unsure.

**Available ui-kit components:**
- **Layout**: Card, Card.Header, Card.Content, Panel, Collapse, Drawer, Modal, Tabs, ManagementSidebar, Topbar, Header
- **Data display**: Table, Tag, StatusTag, TrendTag, CounterCard, CounterCardGroup, CounterCardGroup.Separator, LabelAndValueList, LabelAndValueListItem, Timeline, CodeBlock, InlineMeta, Indicators
- **Input**: Button, ButtonGroup, ButtonDropdown, SearchInput, Input, Select, SelectGroup, Checkbox, Radio, Toggle, DatePicker, DateRangePicker, TimePicker, Segmented, InputTag, PhoneNumberInput, CountrySelector, Dropzone
- **Navigation**: Breadcrumb, Breadcrumbs, BackButton, Link, ExternalLink, Anchor, Paginator
- **Feedback**: Banner, Alert, ErrorBanner, EmptyState, NoContent, Loader, PageLoader, ProgressBar, Tooltip, TooltipText, Popover
- **Actions**: ActionMenu, ContextMenu, Dropdown, CopyToClipboard, ExportCSVButton, RefreshButton, FiltersButton, FiltersModal, MultiSelectModal
- **Misc**: Avatar, Brand, CircleIcon, SquareIcon, Image, ImagePreviewGroup, Illustration, Separator, Key, Keyboard, Form, FormLayout, Checklist, Checkitem, DragAndDrop

**Available icons** (all from `@kapptivate/ui-kit`):
IconActivity, IconAlertCircle, IconAlertTriangle, IconArchive, IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconBarChartBig, IconBell, IconBolt, IconBookOpen, IconBot, IconBox, IconBraces, IconBrowser, IconBug, IconCalculator, IconCalendar, IconCheck, IconCheckCircle2, IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp, IconCircleGauge, IconCirclePlay, IconClose, IconCode, IconCommand, IconComponent, IconCopy, IconCuboid, IconDownload, IconEdit, IconExternalLink, IconEye, IconEyeOff, IconFile, IconFilter, IconFlag, IconFolder, IconGlobe, IconGripVertical, IconHardDrive, IconHelpCircle, IconHistory, IconHome, IconInfo, IconKey, IconLaptop, IconLayers, IconLayoutGrid, IconLineChart, IconLink, IconList, IconListStart, IconLock, IconLogOut, IconMail, IconMapPin, IconMenu, IconMonitor, IconMonitorCheck, IconMore, IconMoreHorizontal, IconMoreVertical, IconNetwork, IconPackage2, IconPanelLeftClose, IconPanelLeftOpen, IconPencil, IconPieChart, IconPlay, IconPlus, IconPointer, IconPower, IconRefreshCw, IconRepeat, IconRocket, IconRss, IconRun, IconSave, IconSearch, IconServer, IconSettings, IconShield, IconSignal, IconSlidersHorizontal, IconSmartphone, IconSparkle, IconSquareCode, IconStar, IconTag, IconTimer, IconTrash, IconTrendingDown, IconTrendingUp, IconUpload, IconUser2, IconUsers2, IconWrench, IconZap, IconZoomIn

If an icon doesn't exist in ui-kit, use one from `lucide-react` (already installed) as fallback.

### Import path
Always import from `'@kapptivate/ui-kit'` (never `'ui-kit'` — the linter rewrites it but be explicit).

### AntdTheme wrapper awareness
The app wraps all content in `AntdTheme` which renders a `div.ui-kit` with `display: flex; flex: 1 1 auto; width: 100%`. If your proto needs full-width layout, add `width: 100%` to your root element.

### CounterCardGroup gotchas
- Do NOT use `CounterCardGroup.Separator` — it creates spacing issues. The `.group > div` CSS already handles connected borders.
- Wrap in a container with `width: 100%` so the flex children stretch.

### Card gotchas
- Card has `height: 100%` and `flex: 1 0 0` by default.
- For standalone cards outside a grid, override with `height: auto !important` via a CSS module class.
- For grid-stretch cards, just use `margin-bottom: 0`.

### Layout: flexbox first
**Always prefer flexbox over CSS grid** for layout. Use `display: flex` as the default for rows, columns, sidebars, toolbars, card groups, filter bars, etc. Only reach for `display: grid` when you genuinely need a 2D grid (e.g. a dashboard tile layout with fixed columns). When in doubt, flex.

Key flex patterns:
- Always add `min-width: 0` on flex children that can overflow (prevents flex blowout).
- For search + filters rows: use `display: flex; gap: 8px; align-items: center` with `margin-left: auto` on the filter group to push it right.
- For search inputs that should stretch: `flex: 1; max-width: 680px; min-width: 200px`.
- Sidebar + content: `display: flex` on parent, fixed `width` on sidebar, `flex: 1; min-width: 0` on content.
- Vertical stacking: `display: flex; flex-direction: column; gap: <spacing>`.
- Equal-width children: `flex: 1 1 0` on each child.

## Step 3 — Verify

After creating all files:
1. Run `npx tsc --noEmit` to catch type errors.
2. Fix any issues (common: wrong icon names, missing imports, type mismatches on icon props — use `React.ComponentType<{ size?: number }>` for icon type annotations).
3. Start the dev server if not running (`npm run dev`) and tell the user to check the proto at `/p/<slug>`.

## Auto-discovery

No need to touch `registry.ts`, `App.tsx`, or any routing file. The registry auto-discovers protos from `src/protos/<slug>/meta.ts` + `Proto.tsx` via `import.meta.glob`. Folders prefixed with `_` are ignored.

## Tone & mock data

This project prototypes Kapptivate's product UI — a test automation & monitoring SaaS. Mock data should feel real:
- Service names: api-gateway, kappticentral, runner-eu-west, screenshot-svc, metrics-proxy, device-server, webhook-worker
- Test names: "Login Flow (Staging)", "Checkout E2E", "Mobile Onboarding"
- Workspace: "Acme Corp", "Demo Workspace"
- Realistic metrics: response times in ms, error rates as %, request counts
- ISO timestamps, proper status values
