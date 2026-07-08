import type { ProtoMeta } from '../registry'

// Dossier préfixé par `_` → ignoré du catalogue. Copie-le pour démarrer un proto.
const meta: ProtoMeta = {
  title: 'Nouveau proto',
  status: 'en cours design',
  // collection: 'AI',            // optionnel : regroupe dans l'index
  description: 'Décris le proto en une phrase',
}

export default meta
