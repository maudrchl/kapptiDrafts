import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const GUEST_KEY = 'ktm_guest_name'

/**
 * Identité de l'utilisateur courant, dérivée de l'email renvoyé par /api/me.
 * V1 : pas de nom/avatar Google — on fabrique un nom lisible et des initiales
 * à partir de l'adresse, plus une couleur stable pour l'avatar.
 */
export type CurrentUser = {
  email: string
  /** Nom d'affichage dérivé de l'email, ex. « Maud Rochel ». */
  name: string
  /** 1 à 2 lettres pour l'avatar, ex. « MR ». */
  initials: string
  /** Couleur de fond de l'avatar, stable pour un email donné. */
  color: string
}

/**
 * Emails avec droits d'administration collab (ex. supprimer les réactions
 * emoji d'autres personnes). `mood@kapptivate.com` est l'identité par défaut
 * en dev (voir `devEmail`).
 */
const ADMIN_EMAILS = new Set(['mood@kapptivate.com'])

/** L'utilisateur courant a-t-il les droits admin collab ? */
export const isAdmin = (user: CurrentUser | null): boolean =>
  !!user && ADMIN_EMAILS.has(user.email.toLowerCase())

const hash = (s: string): number => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Couleur d'avatar dérivée de l'email : une teinte sur toute la roue chromatique
 * plutôt qu'une petite palette figée, pour que chaque personne ait sa propre
 * couleur (quasi-unique, déterministe et stable). Saturation/luminosité fixées
 * pour garder un bon contraste avec les initiales blanches sur toutes les teintes.
 */
const colorFromEmail = (email: string): string =>
  `hsl(${hash(email) % 360}, 62%, 45%)`

const cap = (w: string) => (w ? w[0].toUpperCase() + w.slice(1) : w)

/** « maud.rochel@kapptivate.com » → { name: 'Maud Rochel', initials: 'MR' } */
export function deriveIdentity(email: string): CurrentUser {
  const local = email.split('@')[0] ?? email
  const words = local.split(/[._-]+/).filter(Boolean)
  const name = words.length ? words.map(cap).join(' ') : local
  const initials =
    (words.length >= 2
      ? words[0][0] + words[1][0]
      : (words[0] ?? local).slice(0, 2)
    ).toUpperCase() || '?'
  const color = colorFromEmail(email)
  return { email, name, initials, color }
}

/**
 * Identité de repli en développement uniquement : `vite dev` ne sert pas
 * l'edge function /api/me. Passer `?as=prenom.nom` dans l'URL pour simuler
 * plusieurs personnes (utile pour tester la présence dans deux onglets).
 * En production, ne renvoie jamais rien : seul le vrai cookie fait foi.
 */
const devEmail = (): string | null => {
  if (!import.meta.env.DEV) return null
  const params = new URLSearchParams(window.location.search)
  // `?guest` force le parcours invité (pour tester les liens de partage en local).
  if (params.has('guest')) return null
  const as = params.get('as')
  return `${as || 'mood'}@kapptivate.com`
}

/** Identité « invité » (lien de partage, sans compte Kapptivate). */
export const guestIdentity = (name: string): CurrentUser => {
  const clean = name.trim() || 'Guest'
  const email = `guest:${clean.toLowerCase()}`
  const words = clean.split(/\s+/).filter(Boolean)
  const initials =
    (words.length >= 2 ? words[0][0] + words[1][0] : clean.slice(0, 2)).toUpperCase() || 'G'
  return { email, name: clean, initials, color: colorFromEmail(email) }
}

type CurrentUserState = {
  user: CurrentUser | null
  loading: boolean
  /** Définit une identité invité (persistée localement) — utilisé par les liens de partage. */
  setGuest: (name: string) => void
}

const CurrentUserContext = createContext<CurrentUserState>({
  user: null,
  loading: true,
  setGuest: () => {},
})

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  const setGuest = useCallback((name: string) => {
    try {
      localStorage.setItem(GUEST_KEY, name)
    } catch {
      // localStorage indisponible : identité conservée en mémoire seulement
    }
    setUser(guestIdentity(name))
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    // Repli invité : identité posée précédemment sur ce navigateur (lien de partage).
    const guest = (() => {
      try {
        return localStorage.getItem(GUEST_KEY)
      } catch {
        return null
      }
    })()
    fetch('/api/me', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { email?: string } | null) => {
        if (cancelled) return
        const email = data?.email ?? devEmail()
        setUser(email ? deriveIdentity(email) : guest ? guestIdentity(guest) : null)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        const email = devEmail()
        setUser(email ? deriveIdentity(email) : guest ? guestIdentity(guest) : null)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CurrentUserContext.Provider value={{ user, loading, setGuest }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

/** Renvoie l'utilisateur courant (null tant que non chargé ou non connecté). */
export const useCurrentUser = () => useContext(CurrentUserContext)
