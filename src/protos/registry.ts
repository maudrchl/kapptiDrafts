import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { IconListStart, IconActivity, IconComponent, IconNavigation } from '@kapptivate/ui-kit'
import IconBrush from './BrushIcon'

export type ProtoIcon = ComponentType<{ size?: number; color?: string }>

/**
 * ─────────────────────────────────────────────────────────────
 *  Registry auto-découverte des protos
 * ─────────────────────────────────────────────────────────────
 *
 * Convention : 1 dossier = 1 proto sous `src/protos/<slug>/`
 *   - `meta.ts`   → export default d'un `ProtoMeta` (titre, statut, collection…)
 *   - `Proto.tsx` → export default du composant React du proto
 *
 * L'index et les routes se génèrent automatiquement à partir d'ici :
 * pas besoin de toucher App.tsx ni de maintenir une liste à la main.
 *
 * Un dossier préfixé par `_` (ex: `_template`) est ignoré du catalogue.
 */

export const STATUS_ORDER = [
  'wip design',
  'wip dev',
  'QA',
  'deployed',
] as const

export type ProtoStatus = (typeof STATUS_ORDER)[number]

export type ProtoMeta = {
  /** Nom affiché dans le catalogue */
  title: string
  /** Étape d'avancement */
  status: ProtoStatus
  /** Regroupement optionnel dans l'index (ex: "AI", "Observability") */
  collection?: string
  /** Sous-titre optionnel */
  description?: string
  /** Icône affichée dans le catalogue (composant ui-kit) */
  icon?: ProtoIcon
  /** Masque le proto du catalogue et des routes (mettre à true pour le cacher) */
  hidden?: boolean
  /** Date de dernière mise à jour (ISO, ex. '2026-07-08') */
  updatedAt?: string
}

export type ProtoEntry = ProtoMeta & {
  slug: string
  route: string
  Component: LazyExoticComponent<ComponentType>
}

type MetaModule = { default: ProtoMeta }
type CompLoader = () => Promise<{ default: ComponentType }>

const metaModules = import.meta.glob<MetaModule>('./*/meta.ts', {
  eager: true,
})
const compModules = import.meta.glob<{ default: ComponentType }>(
  './*/Proto.tsx',
)

function slugFromPath(path: string): string {
  // './ai-usage/meta.ts' -> 'ai-usage'
  return path.split('/')[1]
}

export type ProtoKind = 'react' | 'html'

/** Entrée normalisée pour le catalogue de la home (React + HTML confondus). */
export type CatalogEntry = ProtoMeta & {
  slug: string
  kind: ProtoKind
  /** route SPA (react) ou chemin du fichier html (html) */
  target: string
  icon: ProtoIcon
}

/**
 * Prototypes HTML legacy (archives autonomes servies depuis `/folder`).
 * On n'en crée plus de nouveaux — les nouveaux protos sont en React.
 */
export const legacyProtos: (ProtoMeta & { slug: string; href: string })[] = [
  {
    slug: 'exploration-ui',
    title: 'Exploration UI',
    status: 'wip design',
    description: 'Explorations de branding — lockups, palette & composants',
    icon: IconBrush,
    href: '/folder/Exploration UI.html',
  },
  {
    slug: 'run-queue',
    title: 'Run Queue',
    status: 'deployed',
    description: "File d'attente d'exécution des runs",
    icon: IconListStart,
    href: '/folder/Run queue.html',
  },
  {
    slug: 'root-cause-analysis',
    title: 'Root Cause Analysis',
    status: 'wip dev',
    collection: 'Observability',
    description: 'Analyse de cause racine des incidents',
    icon: IconActivity,
    href: '/folder/Observability/Root Cause Analysis.html',
  },
  {
    slug: 'observability-navigation',
    title: 'Observability Navigation',
    status: 'wip design',
    collection: 'Observability',
    description: 'Patterns de navigation sidebar pour l\'observabilité',
    icon: IconNavigation,
    href: '/folder/Observability/Navigation.html',
  },
]

export const protos: ProtoEntry[] = Object.entries(metaModules)
  .map(([path, mod]): ProtoEntry | null => {
    const slug = slugFromPath(path)
    if (slug.startsWith('_')) return null
    if (mod.default.hidden) return null

    const loader = compModules[`./${slug}/Proto.tsx`] as CompLoader | undefined
    if (!loader) {
      console.warn(`[registry] "${slug}/meta.ts" trouvé mais pas de Proto.tsx`)
      return null
    }

    return {
      ...mod.default,
      slug,
      route: `/p/${slug}`,
      Component: lazy(loader),
    }
  })
  .filter((entry): entry is ProtoEntry => entry !== null)
  .sort((a, b) => {
    // Regroupé par collection (protos sans collection en dernier),
    // puis par statut, puis alphabétique.
    const ca = a.collection ?? '￿'
    const cb = b.collection ?? '￿'
    if (ca !== cb) return ca.localeCompare(cb)
    const sa = STATUS_ORDER.indexOf(a.status)
    const sb = STATUS_ORDER.indexOf(b.status)
    if (sa !== sb) return sa - sb
    return a.title.localeCompare(b.title)
  })

/** Catalogue unifié pour la home : protos React + prototypes HTML legacy. */
export const catalog: CatalogEntry[] = [
  ...protos.map(
    (p): CatalogEntry => ({
      slug: p.slug,
      kind: 'react',
      target: p.route,
      title: p.title,
      status: p.status,
      collection: p.collection,
      description: p.description,
      icon: p.icon ?? IconComponent,
      updatedAt: p.updatedAt,
    }),
  ),
  ...legacyProtos.map(
    (p): CatalogEntry => ({
      slug: p.slug,
      kind: 'html',
      target: p.href,
      title: p.title,
      status: p.status,
      collection: p.collection,
      description: p.description,
      icon: p.icon ?? IconComponent,
      updatedAt: p.updatedAt,
    }),
  ),
]
