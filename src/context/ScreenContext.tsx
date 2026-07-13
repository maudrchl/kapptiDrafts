import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

/**
 * Identité de l'« écran » couramment affiché dans un proto.
 *
 * Les protos gèrent leurs vues en state local (pas dans l'URL), donc il n'existe
 * pas d'ID d'écran stable nativement. Un proto déclare sa vue courante via
 * `useReportScreen('detail')` ; la couche commentaires lit `useActiveScreen()`
 * pour n'afficher que les pins de l'écran visible (sinon un pin posé sur la
 * liste flotterait par-dessus la vue détail).
 *
 * Le provider est monté par ProtoFrame et remonte à chaque changement de proto,
 * donc l'état repart de `'default'` automatiquement.
 */
type ScreenState = {
  screenId: string
  setScreenId: (id: string) => void
}

const ScreenContext = createContext<ScreenState>({
  screenId: 'default',
  setScreenId: () => {},
})

export const ScreenProvider = ({ children }: { children: ReactNode }) => {
  const [screenId, setScreenId] = useState('default')
  return (
    <ScreenContext.Provider value={{ screenId, setScreenId }}>
      {children}
    </ScreenContext.Provider>
  )
}

/** Écran actuellement affiché (lu par la couche commentaires). */
export const useActiveScreen = () => useContext(ScreenContext).screenId

/**
 * Déclare la vue courante du proto. À appeler avec un identifiant stable et
 * lisible (ex. `'list'`, `'detail'`, `'settings-modal'`). Les protos qui ne
 * l'appellent pas restent sur l'écran implicite `'default'`.
 */
export const useReportScreen = (screenId: string) => {
  const { setScreenId } = useContext(ScreenContext)
  useEffect(() => {
    setScreenId(screenId)
  }, [screenId, setScreenId])
}
