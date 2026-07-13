import { useEffect, useState } from 'react'

/**
 * Détecte qu'un nouveau déploiement est en ligne. Le build fige un `__BUILD_ID__`
 * (voir vite.config) et écrit le même identifiant dans `/version.json`. On
 * interroge ce fichier périodiquement — et à chaque retour d'onglet — et on
 * renvoie `true` dès que la version servie diffère de celle chargée.
 *
 * En dev, le middleware sert le même BUILD_ID que le bundle : aucune fausse
 * alerte tant qu'on n'a pas rebuild.
 */
export function useNewVersion(pollMs = 60_000): boolean {
  const [stale, setStale] = useState(false)

  useEffect(() => {
    let active = true

    const check = async () => {
      if (!active || stale) return
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data: { version?: string } = await res.json()
        if (active && data.version && data.version !== __BUILD_ID__) {
          setStale(true)
        }
      } catch {
        // Réseau indisponible : on retentera au prochain tick.
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }

    const id = window.setInterval(check, pollMs)
    document.addEventListener('visibilitychange', onVisible)
    void check()

    return () => {
      active = false
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [pollMs, stale])

  return stale
}
