import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

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

/** Palette d'avatars vive, choisie de façon déterministe par email
 *  (contraste OK avec des initiales blanches). */
const AVATAR_COLORS = [
  '#E5322D', // rouge
  '#EA580C', // orange
  '#CA8A04', // ambre
  '#16A34A', // vert
  '#2563EB', // bleu
  '#7C3AED', // violet
  '#DB2777', // rose
  '#0891B2', // cyan
]

const hash = (s: string): number => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

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
  const color = AVATAR_COLORS[hash(email) % AVATAR_COLORS.length]
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
  const as = new URLSearchParams(window.location.search).get('as')
  return `${as || 'mood'}@kapptivate.com`
}

type CurrentUserState = {
  user: CurrentUser | null
  loading: boolean
}

const CurrentUserContext = createContext<CurrentUserState>({
  user: null,
  loading: true,
})

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CurrentUserState>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    fetch('/api/me', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { email?: string } | null) => {
        if (cancelled) return
        const email = data?.email ?? devEmail()
        setState({ user: email ? deriveIdentity(email) : null, loading: false })
      })
      .catch(() => {
        if (cancelled) return
        const email = devEmail()
        setState({ user: email ? deriveIdentity(email) : null, loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CurrentUserContext.Provider value={state}>
      {children}
    </CurrentUserContext.Provider>
  )
}

/** Renvoie l'utilisateur courant (null tant que non chargé ou non connecté). */
export const useCurrentUser = () => useContext(CurrentUserContext)
