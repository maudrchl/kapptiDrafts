import { useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Text,
  SearchInput,
  Tag,
  Button,
  Table,
  Dropdown,
  SortIcon,
  FilterIcon,
  EmptyState,
  IconLayoutGrid,
  IconSearchX,
  IconCode,
  IconFileType,
} from '@kapptivate/ui-kit'
import logo from '../assets/kapptidrafts-logo.svg'
import {
  catalog,
  STATUS_ORDER,
  type CatalogEntry,
  type ProtoStatus,
} from '../protos/registry'
import css from './index-page.module.css'

const STATUS_ACCENT: Record<ProtoStatus, string> = {
  'wip design': '#d98a00',
  'wip dev': '#2563eb',
  QA: '#7c3aed',
  deployed: '#16a34a',
}

// Fond de pastille par statut → donne le ressenti actif (coloré) vs deployed (posé)
const STATUS_ICON_BG: Record<ProtoStatus, string> = {
  'wip design': 'rgba(217,138,0,0.12)',
  'wip dev': 'rgba(37,99,235,0.12)',
  QA: 'rgba(124,58,237,0.12)',
  deployed: 'rgba(22,163,74,0.12)',
}

// Parse une date ISO 'YYYY-MM-DD' en Date locale (évite le décalage UTC).
const parseISO = (iso?: string): Date | null => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) {
    const fallback = iso ? new Date(iso) : null
    return fallback && !Number.isNaN(fallback.getTime()) ? fallback : null
  }
  return new Date(y, m - 1, d)
}

// Date absolue courte, ex. "8 Jul 2026" (pour le tooltip).
const absDate = (iso?: string): string => {
  const d = parseISO(iso)
  return d
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d)
    : ''
}

// Libellé relatif : Today / Yesterday / N days ago, sinon date absolue.
const fmtDate = (iso?: string): string => {
  const d = parseISO(iso)
  if (!d) return '—'
  const dayMs = 86_400_000
  const midnight = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((midnight(new Date()) - midnight(d)) / dayMs)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  if (diff > 1 && diff < 7) return `${diff} days ago`
  return absDate(iso)
}

// Icône de tri du design system (rendue dans le slot natif de la Table antd)
const renderSortIcon = ({
  sortOrder,
}: {
  sortOrder: 'ascend' | 'descend' | null
}) => <SortIcon sortOrder={sortOrder ?? undefined} />

const IndexPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProtoStatus>('all')

  const open = (p: CatalogEntry) => {
    if (p.kind === 'react') navigate(p.target)
    else window.location.href = encodeURI(p.target)
  }

  // Recherche + filtre statut, puis tri de base par statut (QA → wip dev →
  // wip design → deployed). La Table peut re-trier au clic, mais cet ordre est
  // l'ordre par défaut garanti, indépendant de tout tri persisté.
  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return catalog
      .filter((p) => {
        const matchQ =
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
        const matchStatus =
          statusFilter === 'all' || p.status === statusFilter
        return matchQ && matchStatus
      })
      .sort((a, b) => {
        const s =
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
        return s !== 0 ? s : a.title.localeCompare(b.title)
      })
  }, [search, statusFilter])

  // Menu du filtre statut (composant Dropdown du design system)
  const filterMenu = {
    selectable: true as const,
    selectedKeys: [statusFilter],
    onClick: ({ key }: { key: string }) =>
      setStatusFilter(key as 'all' | ProtoStatus),
    items: [
      { key: 'all', label: 'All statuses' },
      { type: 'divider' as const },
      ...STATUS_ORDER.map((s) => ({ key: s, label: s })),
    ],
  }

  const columns = [
    {
      title: 'Prototype',
      key: 'title',
      dataIndex: 'title',
      sorter: (a: CatalogEntry, b: CatalogEntry) =>
        a.title.localeCompare(b.title),
      sortIcon: renderSortIcon,
      render: (_: string, p: CatalogEntry) => {
        const Icon = p.icon
        const status = p.status
        return (
          <div style={styles.protoCell}>
            <span
              style={{ ...styles.iconBox, background: STATUS_ICON_BG[status] }}
            >
              <Icon size={18} color={STATUS_ACCENT[status]} />
            </span>
            <div>
              <Text weight="medium">{p.title}</Text>
              {p.description && (
                <div>
                  <Text size="xs" color="secondary">
                    {p.description}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Type',
      key: 'kind',
      dataIndex: 'kind',
      width: 180,
      sorter: (a: CatalogEntry, b: CatalogEntry) => a.kind.localeCompare(b.kind),
      sortIcon: renderSortIcon,
      render: (kind: 'react' | 'html') => (
        <Tag
          color="grey"
          icon={kind === 'react' ? IconCode : IconFileType}
          size="xs"
        >
          {kind === 'react' ? 'React' : 'HTML'}
        </Tag>
      ),
    },
    {
      title: 'Last update',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      width: 160,
      sorter: (a: CatalogEntry, b: CatalogEntry) =>
        (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
      sortIcon: renderSortIcon,
      render: (updatedAt?: string) => (
        <span title={absDate(updatedAt)}>
          <Text size="s" color="secondary">
            {fmtDate(updatedAt)}
          </Text>
        </span>
      ),
    },
    {
      title: (
        <div style={styles.colHeader}>
          Status
          {/* Filtre dans le tableau : Dropdown DS sur un FilterIcon.
              stopPropagation pour ne pas déclencher le tri de la colonne. */}
          <span
            style={styles.filterTrigger}
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown menu={filterMenu} placement="bottomRight">
              <span style={{ display: 'inline-flex', cursor: 'pointer' }}>
                <FilterIcon filter={statusFilter === 'all' ? '' : 'filter'} />
              </span>
            </Dropdown>
          </span>
        </div>
      ),
      key: 'status',
      dataIndex: 'status',
      width: 300,
      defaultSortOrder: 'ascend' as const,
      sorter: (a: CatalogEntry, b: CatalogEntry) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      sortIcon: renderSortIcon,
      // Statut en lecture seule — la source de vérité est le `meta.ts` du proto.
      render: (_: ProtoStatus, p: CatalogEntry) => (
        <div style={styles.statusCell}>
          <span style={{ ...styles.dot, background: STATUS_ACCENT[p.status] }} />
          <Text size="s">{p.status}</Text>
        </div>
      ),
    },
  ]

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <img src={logo} alt="kapptiDrafts" style={styles.logo} />
          <Text size="s" color="secondary">
            {catalog.length} prototype{catalog.length > 1 ? 's' : ''} · live
            mockups built with the design system
          </Text>
        </div>
        <Button
          color="secondary"
          icon={IconLayoutGrid}
          onClick={() => navigate('/design-system')}
        >
          Design System
        </Button>
      </header>

      {/* Toolbar : recherche (le tri et le filtre statut sont dans le tableau) */}
      <div style={styles.toolbar}>
        <div style={{ width: 320, maxWidth: '100%' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search a prototype…"
            fullwidth
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {items.length === 0 ? (
          <div style={{ padding: '3rem 0' }}>
            <EmptyState
              icon={<IconSearchX color="var(--color-text-secondary)" />}
              text="No prototype"
              description="No result for this search or filter."
            />
          </div>
        ) : (
          <div className={css.tableWrap}>
            <Table
              rowKey="slug"
              outerBorders
              data={items}
              columns={columns}
              onClickRow={open}
              persistSortKey="kapptidrafts:sort-protos-v2"
            />
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  // flex:1 + minWidth:0 car AntdTheme enveloppe l'app dans un conteneur flex
  page: { flex: 1, minWidth: 0, padding: '7rem' },
  logo: { height: 30, width: 'auto', display: 'block', marginBottom: 8 },
  protoCell: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  statusCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  colHeader: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  filterTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
}

export default IndexPage
