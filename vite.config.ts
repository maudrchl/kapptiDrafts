import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { execFileSync } from 'child_process'

// Racine du projet. `process.cwd()` est fiable sous vite build/dev (lancé
// depuis la racine) alors que `__dirname` d'une config ESM bundlée peut pointer
// vers un fichier temporaire.
const ROOT = process.cwd()

// Date (YYYY-MM-DD) du commit le plus récent (ou le plus ancien si `reverse`)
// touchant `pathspec`. `undefined` si git indisponible ou chemin sans commit.
function gitDate(pathspec: string, reverse: boolean): string | undefined {
  try {
    const args = ['log', '--format=%cd', '--date=short']
    args.push(reverse ? '--reverse' : '-1')
    args.push('--', pathspec)
    const out = execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
    return out.split('\n').find((l) => l.trim())?.trim() || undefined
  } catch {
    return undefined
  }
}

// Dates par proto, dérivées de git au build → « Last update » toujours à jour
// (dernier commit) sans entretien manuel, avec la date de création en fallback.
// Clé = slug (dossier des protos React) ou href `/folder/....html` (archives).
function protoDates(): Record<string, { created?: string; updated?: string }> {
  const map: Record<string, { created?: string; updated?: string }> = {}
  const add = (key: string, pathspec: string) => {
    map[key] = { created: gitDate(pathspec, true), updated: gitDate(pathspec, false) }
  }
  const base = path.resolve(ROOT, 'src/protos')
  try {
    for (const dir of fs.readdirSync(base)) {
      if (dir.startsWith('_') || dir.startsWith('.')) continue
      if (!fs.existsSync(path.join(base, dir, 'meta.ts'))) continue
      add(dir, `src/protos/${dir}`)
    }
  } catch {
    // pas de dossier protos : rien à dater
  }
  const pub = path.resolve(ROOT, 'public')
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const fp = path.join(d, e.name)
      if (e.isDirectory()) walk(fp)
      else if (e.name.endsWith('.html')) {
        const rel = path.relative(pub, fp).split(path.sep).join('/')
        add(`/${rel}`, `public/${rel}`)
      }
    }
  }
  try {
    walk(path.join(pub, 'folder'))
  } catch {
    // pas d'archives HTML : rien à dater
  }
  return map
}

const PROTO_DATES = protoDates()

// Identifiant de build, figé à chaque `vite build`. Injecté dans le bundle via
// `__BUILD_ID__` et écrit dans `version.json` : l'app compare les deux au runtime
// pour détecter qu'un nouveau déploiement est en ligne.
const BUILD_ID = String(Date.now())

// Émet /version.json (build) et le sert en dev, avec le même BUILD_ID que le
// bundle — donc jamais de faux positif en local.
function versionPlugin(): Plugin {
  const body = JSON.stringify({ version: BUILD_ID })
  return {
    name: 'emit-version',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: body })
    },
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(body)
      })
    },
  }
}

// Rejoue en dev les rewrites "slug propre -> /folder/xxx.html" de vercel.json,
// sinon les URLs propres des protos HTML (ex. /suivi-poc2-lbc) ne marchent
// qu'en prod. Source de vérité unique = vercel.json.
function folderRewritesPlugin(): Plugin {
  let rules: { source: string; destination: string }[] = []
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'vercel.json'), 'utf8'),
    )
    rules = (cfg.rewrites ?? []).filter(
      (r: { source: string; destination: string }) =>
        r.destination?.startsWith('/folder/') && !r.source.includes('('),
    )
  } catch {
    // pas de vercel.json en local : rien à rejouer
  }
  return {
    name: 'folder-rewrites-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        const hit = rules.find((r) => r.source === url)
        if (!hit) return next()
        // On sert le fichier tel quel (vite transformerait un .html en entrée
        // SPA, d'où un simple rewrite d'URL qui retombe sur index.html).
        try {
          const file = path.resolve(__dirname, 'public' + hit.destination)
          const html = fs.readFileSync(file, 'utf8')
          res.setHeader('Content-Type', 'text/html')
          res.end(html)
        } catch {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
    __PROTO_DATES__: JSON.stringify(PROTO_DATES),
  },

  plugins: [folderRewritesPlugin(), react(), versionPlugin()],

  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      lodash: path.resolve(__dirname, 'node_modules/lodash'),
      formik: path.resolve(__dirname, 'node_modules/formik'),
      dayjs: path.resolve(__dirname, 'node_modules/dayjs'),
    },
  },

  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api'],
      },
    },
  },
})
