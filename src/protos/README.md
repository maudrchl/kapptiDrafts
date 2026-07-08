# Protos

Atelier de maquettes live construites avec le design system `ui-kit`.

## Créer un proto

1. Copie le dossier `_template/` et renomme-le. **Le nom du dossier = le slug de l'URL** → `/p/<slug>`.
2. Édite `meta.ts` (titre, statut, collection, description).
3. Construis ta maquette dans `Proto.tsx` (export `default`).

C'est tout : l'index (`/`) et la route se génèrent automatiquement, pas besoin de toucher `App.tsx`.

## Convention

Chaque proto = un dossier `src/protos/<slug>/` contenant :

| Fichier      | Rôle                                                        |
| ------------ | ----------------------------------------------------------- |
| `meta.ts`    | `export default` d'un `ProtoMeta` (voir `registry.ts`)      |
| `Proto.tsx`  | `export default` du composant React du proto                |
| _autres_     | sous-composants / styles `.module.scss` propres au proto    |

Un dossier préfixé par `_` (ex: `_template`) est **ignoré** du catalogue.

## Statuts

`en cours design` · `en cours dev` · `déployé` (voir `STATUS_ORDER` dans `registry.ts`).

## Composants disponibles

Ouvre **`/gallery`** pour la référence visuelle live, ou interroge la doc via le serveur MCP `ui-kit`.

## Lancer

```bash
npm run dev
```
