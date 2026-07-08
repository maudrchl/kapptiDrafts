import { useMemo, useState } from 'react'
import {
  Button,
  Segmented,
  SearchInput,
  Select,
  Tabs,
  EmptyState,
  IconMapPin,
  IconExternalLink,
  IconPlus,
  IconListFilter,
  IconMonitor,
  IconDownload,
} from '@kapptivate/ui-kit'
import styles from './locations.module.scss'
import {
  CAT,
  CONTINENTS,
  catLabel,
  runnerLabel,
  type Location,
  type PrivateCat,
} from './constants'
import LocationCard from './LocationCard'

type Tab = 'public' | 'private'

type Props = {
  locations: Location[]
  onOpenDetail: (id: string) => void
  onAddLocation: () => void
  onManageRegions: () => void
}

const ListView = ({
  locations,
  onOpenDetail,
  onAddLocation,
  onManageRegions,
}: Props) => {
  const [tab, setTab] = useState<Tab>('public')
  const [privateCat, setPrivateCat] = useState<PrivateCat>('desktop')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [scope, setScope] = useState('all')
  const [zone, setZone] = useState('all')

  const pub = useMemo(
    () => locations.filter((l) => l.kind === 'public' && l.enabled),
    [locations],
  )
  const priv = useMemo(
    () => locations.filter((l) => l.kind === 'private'),
    [locations],
  )

  const changeTab = (t: Tab) => {
    setTab(t)
    setStatus('all')
    setScope('all')
    setZone('all')
  }

  // Filtrage commun (search + selects)
  const matches = (l: Location) => {
    const hay = (
      l.kind === 'public'
        ? `${l.city} ${l.region} ${l.cont}`
        : `${l.name} ${l.zone} ${l.caps || ''} ${runnerLabel[l.runner]}`
    ).toLowerCase()
    const okQ = !search || hay.includes(search.trim().toLowerCase())
    const okS = status === 'all' || l.status === status
    const okSc = scope === 'all' || l.scope === scope
    const zk = l.kind === 'public' ? l.cont : l.zone.split('/')[0]
    const okZ = zone === 'all' || zk === zone
    return okQ && okS && okSc && okZ
  }

  const zoneOptions = useMemo(() => {
    const src = tab === 'public' ? pub : priv
    const keys = [
      ...new Set(
        src.map((l) => (l.kind === 'public' ? l.cont! : l.zone.split('/')[0])),
      ),
    ]
    return [
      { label: 'All zones', value: 'all' },
      ...keys.map((k) => ({ label: k, value: k })),
    ]
  }, [tab, pub, priv])

  const statusOptions =
    tab === 'private'
      ? [
          { label: 'All statuses', value: 'all' },
          { label: 'Online', value: 'online' },
          { label: 'Offline', value: 'offline' },
        ]
      : [
          { label: 'All statuses', value: 'all' },
          { label: 'Online', value: 'online' },
        ]

  const renderPublic = () => {
    const visible = pub.filter(matches)
    if (!visible.length)
      return (
        <EmptyState
          icon={<IconMapPin size={40} />}
          text="No public region enabled yet."
          description="Turn on the regions your users are in to run tests from there."
        />
      )
    return CONTINENTS.map((c) => {
      const items = visible.filter((l) => l.cont === c)
      if (!items.length) return null
      return (
        <div key={c}>
          <div className={styles.contGrp}>{c}</div>
          <div className={styles.grid}>
            {items.map((l) => (
              <LocationCard key={l.id} loc={l} onClick={() => onOpenDetail(l.id)} />
            ))}
          </div>
        </div>
      )
    })
  }

  const renderPrivate = () => {
    const items = priv.filter((l) => l.cat === privateCat).filter(matches)
    const banner =
      privateCat === 'desktop' ? (
        <div className={styles.banner}>
          <div className={styles.bannerIc}>
            <IconMonitor size={20} />
          </div>
          <div className={styles.bannerTxt}>
            <strong>Add a desktop runner</strong>
            <span>
              Install the kapptivate Desktop app on any machine, sign in to your
              workspace, and it appears here as a personal or shared runner.
            </span>
          </div>
          <div className={styles.bannerActions}>
            <Button color="secondary" icon={IconDownload} onClick={onAddLocation}>
              Download app
            </Button>
            <Button color="primary" onClick={onAddLocation}>
              Connect a runner
            </Button>
          </div>
        </div>
      ) : null

    if (!items.length)
      return (
        <>
          {banner}
          <EmptyState
            icon={<IconMapPin size={40} />}
            text={`No ${catLabel(privateCat)} yet.`}
            description={
              privateCat === 'desktop'
                ? 'Install kapptivate Desktop to run tests from your own machine.'
                : 'Contact our sales team to order a new robot.'
            }
          />
        </>
      )

    return (
      <>
        {banner}
        <div className={styles.grid}>
          {items.map((l) => (
            <LocationCard key={l.id} loc={l} onClick={() => onOpenDetail(l.id)} />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className={styles.content}>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>Locations</h1>
        <div className={styles.headActions}>
          <Button color="secondary" icon={IconExternalLink}>
            Help
          </Button>
          <Button color="primary" icon={IconPlus} onClick={onAddLocation}>
            Add location
          </Button>
        </div>
      </div>

      <div className={styles.tabsRow}>
        <Tabs
          activeKey={tab}
          onChange={(k) => changeTab(k as Tab)}
          tabs={[
            {
              key: 'public',
              label: (
                <>
                  Public<span className={styles.tabCount}>{pub.length}</span>
                </>
              ),
            },
            {
              key: 'private',
              label: (
                <>
                  Private<span className={styles.tabCount}>{priv.length}</span>
                </>
              ),
            },
          ]}
        />
      </div>

      {tab === 'private' && (
        <div className={styles.subtabs}>
          <Segmented<PrivateCat>
            value={privateCat}
            onChange={(v) => setPrivateCat(v)}
            options={CAT.map(([val, label]) => ({
              label: `${label} · ${priv.filter((l) => l.cat === val).length}`,
              value: val,
            }))}
          />
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.search}>
          <SearchInput
            placeholder="Search locations…"
            value={search}
            onChange={(v) => setSearch(v)}
            fullwidth
          />
        </div>
        <Select
          options={statusOptions}
          value={status}
          onChange={(_e, v) => setStatus(v)}
          minWidth="150px"
        />
        {tab === 'private' && (
          <Select
            options={[
              { label: 'All scopes', value: 'all' },
              { label: 'Shared', value: 'shared' },
              { label: 'Personal', value: 'personal' },
            ]}
            value={scope}
            onChange={(_e, v) => setScope(v)}
            minWidth="150px"
          />
        )}
        <Select
          options={zoneOptions}
          value={zone}
          onChange={(_e, v) => setZone(v)}
          minWidth="150px"
        />
        {tab === 'public' && (
          <Button
            color="secondary"
            icon={IconListFilter}
            onClick={onManageRegions}
            style={{ marginLeft: 'auto' }}
          >
            Manage regions
          </Button>
        )}
      </div>

      {tab === 'public' ? renderPublic() : renderPrivate()}
    </div>
  )
}

export default ListView
