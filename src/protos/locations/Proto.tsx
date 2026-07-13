import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useReportScreen } from '../../context/ScreenContext'
import styles from './locations.module.scss'
import { LOCATIONS, type Location } from './constants'
import MainSidebar from './MainSidebar'
import ListView from './ListView'
import DetailView from './DetailView'
import AddLocationModal from './AddLocationModal'

const LocationsPage = () => {
  const [locations, setLocations] = useState<Location[]>(() => LOCATIONS.map((l) => ({ ...l })))
  const [detailId, setDetailId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalScreen, setModalScreen] = useState<'options' | 'public'>('options')

  const detail = detailId ? locations.find((l) => l.id === detailId) : null

  // Déclare la vue courante pour ancrer les commentaires au bon écran.
  useReportScreen(
    modalOpen ? `modal-${modalScreen}` : detail ? `detail:${detailId}` : 'list',
  )

  const openModal = (screen: 'options' | 'public') => {
    setModalScreen(screen)
    setModalOpen(true)
  }

  const toggleRegion = (id: string, on: boolean) =>
    setLocations((cur) => cur.map((l) => (l.id === id ? { ...l, enabled: on } : l)))

  const addRunner = (loc: Location): string => {
    const id = `new-${Date.now()}`
    setLocations((cur) => [...cur, { ...loc, id }])
    return id
  }

  const gotoDetail = (id: string) => {
    setModalOpen(false)
    setDetailId(id)
  }

  return (
    <div className={styles.app}>
      <MainSidebar />

      <div className={styles.main}>
        {detail && (
          <div className={styles.topbar}>
            <div className={styles.crumb}>
              <button onClick={() => setDetailId(null)}>
                <ChevronLeft size={15} />
                Locations
              </button>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbCur}>{detail.name}</span>
            </div>
          </div>
        )}

        {detail ? (
          <DetailView loc={detail} />
        ) : (
          <ListView
            locations={locations}
            onOpenDetail={setDetailId}
            onAddLocation={() => openModal('options')}
            onManageRegions={() => openModal('public')}
          />
        )}
      </div>

      <AddLocationModal
        open={modalOpen}
        initialScreen={modalScreen}
        locations={locations}
        onClose={() => setModalOpen(false)}
        onToggleRegion={toggleRegion}
        onAddRunner={addRunner}
        onGotoDetail={gotoDetail}
      />
    </div>
  )
}

export default LocationsPage
