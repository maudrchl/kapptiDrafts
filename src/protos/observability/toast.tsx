import { useEffect } from 'react'
import { useNotification } from '@kapptivate/ui-kit'

/* ─────────────────────────────────────────────────────────────
 *  Toast ui-kit — le vrai composant.
 *
 *  `useNotification()` lit son contexte depuis `NotificationProvider`,
 *  qui est embarqué dans `AntdTheme` — déjà monté à la racine dans
 *  `main.tsx`. Le hook fonctionne donc partout dans l'app, sans provider
 *  supplémentaire (icônes, placement et thème gérés par le kit).
 *
 *  Le hook n'étant appelable que dans un composant, on l'enregistre une
 *  fois via <ToastMount/> dans un singleton `api`, ce qui garde l'API
 *  ergonomique `toast.success(...)` utilisable depuis n'importe quel site
 *  d'appel (y compris hors composant : setTimeout, handlers, etc.).
 * ───────────────────────────────────────────────────────────── */

type ToastApi = ReturnType<typeof useNotification>['notification']

let api: ToastApi | null = null

export const toast = {
  success: (m: string) => api?.success(m),
  info: (m: string) => api?.info(m),
  error: (m: string) => api?.error(m),
  warning: (m: string) => api?.warning(m),
}

/**
 * À monter une seule fois à la racine du proto (déjà sous l'AntdTheme).
 * Enregistre l'API notification du kit dans le singleton.
 */
export const ToastMount = () => {
  const { notification } = useNotification()
  useEffect(() => {
    api = notification
    return () => {
      if (api === notification) api = null
    }
  }, [notification])
  return null
}
