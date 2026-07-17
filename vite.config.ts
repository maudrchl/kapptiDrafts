import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

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
