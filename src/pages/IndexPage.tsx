import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Text,
  SearchInput,
  Tag,
  Button,
  Table,
  Tabs,
  Dropdown,
  SortIcon,
  FilterIcon,
  EmptyState,
  IconLayoutGrid,
  IconSearchX,
  IconCode,
  IconFileType,
  IconPin,
  IconMousePointer2,
  IconFlag,
  IconRocket,
  IconArchive,
} from '@kapptivate/ui-kit'
import logo from '../assets/kapptidrafts-logo.svg'
import IconBrush from '../protos/BrushIcon'
import {
  catalog,
  protos,
  STATUS_ORDER,
  type CatalogEntry,
  type ProtoStatus,
} from '../protos/registry'
import { useCurrentUser } from '../context/CurrentUser'
import { useAllPresence } from '../components/collab/useAllPresence'
import { useProtoPins } from '../components/collab/useProtoPins'
import RowPresence from '../components/collab/RowPresence'
import css from './index-page.module.css'

// Ligne du tableau = entrée catalogue + son état « épinglé » (partagé).
type Row = CatalogEntry & { pinned: boolean }

// Les protos épinglés restent en tête : on préfixe chaque tri par ce rang.
const pinRank = (a: Row, b: Row) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
const withPin =
  (sorter: (a: Row, b: Row) => number) =>
  (a: Row, b: Row) =>
    pinRank(a, b) || sorter(a, b)

const STATUS_ACCENT: Record<ProtoStatus, string> = {
  'wip design': '#d98a00',
  'wip dev': '#2563eb',
  QA: '#7c3aed',
  deployed: '#16a34a',
}

// Couleur propre par tag (badge/statut de la ligne) — distinct du violet générique.
const TAG_ACCENT: Record<string, string> = {
  Brand: '#db2777', // rose
  PM: '#0ea5e9', // bleu
}
// Fond clair correspondant (pastille d'icône des lignes taguées).
const TAG_ICON_BG: Record<string, string> = {
  Brand: 'rgba(219,39,119,0.12)',
  PM: 'rgba(14,165,233,0.12)',
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

// Seuls les protos React portent la présence temps réel (les archives HTML ne
// montent pas la couche collab). Liste stable dérivée du registry.
const REACT_SLUGS = protos.map((p) => p.slug)

// Icône de tri du design system (rendue dans le slot natif de la Table antd)
const renderSortIcon = ({
  sortOrder,
}: {
  sortOrder: 'ascend' | 'descend' | null
}) => <SortIcon sortOrder={sortOrder ?? undefined} />

const IndexPage = () => {
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const presence = useAllPresence(REACT_SLUGS, user)
  const { pinned, togglePin } = useProtoPins()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProtoStatus>('all')
  const [tab, setTab] = useState<
    'active' | 'brand' | 'pm' | 'deployed' | 'archived'
  >('active')

  useEffect(() => {
    document.title = 'kapptiDrafts'
  }, [])

  const open = (p: Row) => {
    if (p.kind === 'react') navigate(p.target)
    else window.location.href = encodeURI(p.target)
  }

  // Recherche + filtre statut, puis tri de base : épinglés d'abord, ensuite par
  // statut (QA → wip dev → wip design → deployed). La Table peut re-trier au
  // clic, mais cet ordre est l'ordre par défaut garanti.
  const items = useMemo<Row[]>(() => {
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
      .map((p): Row => ({ ...p, pinned: pinned.has(p.slug) }))
      .sort((a, b) => {
        const p = pinRank(a, b)
        if (p !== 0) return p
        const s =
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
        return s !== 0 ? s : a.title.localeCompare(b.title)
      })
  }, [search, statusFilter, pinned])

  // Répartition en onglets. Un tag/collection dédié (Brand, PM, Archive) prime
  // sur le statut ; le reste se répartit entre actifs (WIP/QA) et déployés.
  const activeItems = useMemo(
    () =>
      items.filter(
        (p) =>
          p.collection !== 'Archive' &&
          p.tag !== 'Brand' &&
          p.tag !== 'PM' &&
          p.status !== 'deployed',
      ),
    [items],
  )
  const deployedItems = useMemo(
    () =>
      items.filter(
        (p) =>
          p.collection !== 'Archive' &&
          p.tag !== 'Brand' &&
          p.tag !== 'PM' &&
          p.status === 'deployed',
      ),
    [items],
  )
  const brandItems = useMemo(
    () => items.filter((p) => p.collection !== 'Archive' && p.tag === 'Brand'),
    [items],
  )
  const pmItems = useMemo(
    () => items.filter((p) => p.collection !== 'Archive' && p.tag === 'PM'),
    [items],
  )
  const archivedItems = useMemo(
    () => items.filter((p) => p.collection === 'Archive'),
    [items],
  )
  // Onglets = boutons segmentés : icône + intitulé + compteur natif du Button.
  const TAB_DEFS = [
    { key: 'active' as const, label: 'Active prototypes', icon: IconMousePointer2, items: activeItems },
    { key: 'brand' as const, label: 'Brand', icon: IconBrush, items: brandItems },
    { key: 'pm' as const, label: 'PM', icon: IconFlag, items: pmItems },
    { key: 'deployed' as const, label: 'Deployed', icon: IconRocket, items: deployedItems },
    { key: 'archived' as const, label: 'Archived', icon: IconArchive, items: archivedItems },
  ]
  const currentItems =
    TAB_DEFS.find((t) => t.key === tab)?.items ?? activeItems

  // Menu contextuel (clic droit) d'une ligne : épingler / désépingler.
  const pinMenu = (p: Row) => ({
    items: [
      {
        key: 'pin',
        label: p.pinned ? 'Unpin' : 'Pin to top',
        icon: <IconPin size={12} />,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'pin') togglePin(p.slug, user?.email)
    },
  })

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
      sorter: withPin((a, b) => a.title.localeCompare(b.title)),
      sortIcon: renderSortIcon,
      // Clic droit sur la cellule → menu épingler / désépingler (Dropdown DS).
      render: (_: string, p: Row) => {
        const Icon = p.icon
        const status = p.status
        // Une ligne taguée (Brand/PM) prend la couleur de son tag ; sinon le statut.
        const accent = p.tag ? (TAG_ACCENT[p.tag] ?? '#7c3aed') : STATUS_ACCENT[status]
        const accentBg = p.tag
          ? (TAG_ICON_BG[p.tag] ?? 'rgba(124,58,237,0.12)')
          : STATUS_ICON_BG[status]
        return (
          <Dropdown trigger="contextMenu" menu={pinMenu(p)} placement="bottomLeft">
            {/* Clic gauche = navigation explicite (le wrapper Dropdown
                interceptait le clic sur cette cellule) ; clic droit = épingler. */}
            <div style={{ ...styles.protoCell, cursor: 'pointer' }} onClick={() => open(p)}>
              <span style={{ ...styles.iconBox, background: accentBg }}>
                <Icon size={18} color={accent} />
              </span>
              <div>
                <div style={styles.titleRow}>
                  <Text weight="medium">{p.title}</Text>
                  {/* Indicateur d'épingle : seulement si le proto est épinglé. */}
                  {p.pinned && <IconPin size={13} color="#d26334" />}
                </div>
                {p.description && (
                  <div>
                    <Text size="xs" color="secondary">
                      {p.description}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Dropdown>
        )
      },
    },
    {
      title: 'Type',
      key: 'kind',
      dataIndex: 'kind',
      width: 180,
      sorter: withPin((a, b) => a.kind.localeCompare(b.kind)),
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
      sorter: withPin((a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '')),
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
      width: 150,
      defaultSortOrder: 'ascend' as const,
      sorter: withPin((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)),
      sortIcon: renderSortIcon,
      // Statut en lecture seule — la source de vérité est le `meta.ts` du proto.
      render: (_: ProtoStatus, p: Row) => (
        <div style={styles.statusCell}>
          <span
            style={{
              ...styles.dot,
              background: p.tag
                ? (TAG_ACCENT[p.tag] ?? '#7c3aed')
                : STATUS_ACCENT[p.status],
            }}
          />
          <Text size="s">{p.tag ?? p.status}</Text>
        </div>
      ),
    },
    {
      // Présence temps réel : avatars des personnes qui regardent ce proto,
      // tout à droite de la ligne. Cellule vide si personne (ou proto HTML).
      title: '',
      key: 'presence',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, p: CatalogEntry) => (
        <RowPresence users={presence[p.slug] ?? []} />
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
            {catalog.length} file{catalog.length > 1 ? 's' : ''} · a lab to
            explore and track product work
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

      <div style={{ marginTop: 16 }}>
        <Tabs
          tabs={TAB_DEFS.map((t) => {
            const Icon = t.icon
            return { key: t.key, label: t.label, icon: <Icon size={14} /> }
          })}
          activeKey={tab}
          onChange={(k: string) =>
            setTab(k as 'active' | 'brand' | 'pm' | 'deployed' | 'archived')
          }
        />

        {/* Recherche sous les onglets : filtre le contenu de l'onglet actif. */}
        <div style={{ ...styles.toolbar, marginTop: 16 }}>
          <div style={{ width: 320, maxWidth: '100%' }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search a prototype…"
              fullwidth
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          {currentItems.length === 0 ? (
            <div style={{ padding: '3rem 0' }}>
              <EmptyState
                icon={<IconSearchX color="var(--color-text-secondary)" />}
                text="No prototype"
                description={
                  search.trim() || statusFilter !== 'all'
                    ? 'No result in this tab for the current search or filter.'
                    : 'Nothing here yet.'
                }
              />
            </div>
          ) : (
            <div className={css.tableWrap}>
              <Table
                rowKey="slug"
                outerBorders
                data={currentItems}
                columns={columns}
                onClickRow={open}
                persistSortKey="kapptidrafts:sort-protos-v2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  // flex:1 + minWidth:0 car AntdTheme enveloppe l'app dans un conteneur flex
  page: { flex: 1, minWidth: 0, padding: '7rem' },
  logo: { height: 30, width: 'auto', display: 'block', marginBottom: 8 },
  protoCell: { display: 'flex', alignItems: 'center', gap: 12 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 6 },
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
