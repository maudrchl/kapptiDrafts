import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },

  plugins: [react(), versionPlugin()],

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
