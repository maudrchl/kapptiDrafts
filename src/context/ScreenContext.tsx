import {
  createContext,
  useCallback,
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
 * `useReportScreen('detail')` ; la couche commentaires lit `useActiveScreen()`.
 *
 * Canal inverse : `goToScreen(id)` demande à revenir sur un écran donné (ex.
 * clic sur un commentaire de l'historique). Le proto écoute `pendingScreen` via
 * `useScreenNavigation()` et rétablit sa vue locale (onglet, drawer…), puis
 * appelle `clearPendingScreen()`. Les protos qui ne l'écoutent pas l'ignorent.
 *
 * Le provider est monté par ProtoFrame et remonte à chaque changement de proto,
 * donc l'état repart de `'default'` automatiquement.
 */
type ScreenState = {
  screenId: string
  setScreenId: (id: string) => void
  pendingScreen: string | null
  goToScreen: (id: string) => void
  clearPendingScreen: () => void
}

const ScreenContext = createContext<ScreenState>({
  screenId: 'default',
  setScreenId: () => {},
  pendingScreen: null,
  goToScreen: () => {},
  clearPendingScreen: () => {},
})

export const ScreenProvider = ({ children }: { children: ReactNode }) => {
  const [screenId, setScreenId] = useState('default')
  const [pendingScreen, setPendingScreen] = useState<string | null>(null)
  const goToScreen = useCallback((id: string) => setPendingScreen(id), [])
  const clearPendingScreen = useCallback(() => setPendingScreen(null), [])
  return (
    <ScreenContext.Provider
      value={{ screenId, setScreenId, pendingScreen, goToScreen, clearPendingScreen }}
    >
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

/** Demande une navigation vers un écran (ex. clic sur un commentaire). */
export const useGoToScreen = () => useContext(ScreenContext).goToScreen

/**
 * Côté proto : lit l'écran demandé (`pendingScreen`) et fournit de quoi le
 * consommer une fois la vue rétablie. Renvoie `null` quand rien n'est demandé.
 */
export const useScreenNavigation = () => {
  const { pendingScreen, clearPendingScreen } = useContext(ScreenContext)
  return { pendingScreen, clearPendingScreen }
}
