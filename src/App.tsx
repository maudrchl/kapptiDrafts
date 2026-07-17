import { Suspense } from 'react'
import { Routes, Route, useParams, Navigate } from 'react-router-dom'
import { PageLoader } from '@kapptivate/ui-kit'
import IndexPage from './pages/IndexPage'
import SharePage from './pages/SharePage'
import DesignSystem from './designsystem/DesignSystem'
import ProtoFrame from './components/ProtoFrame'
import HtmlProtoFrame from './components/HtmlProtoFrame'
import { protos, legacyProtos } from './protos/registry'

/** Route d'hébergement d'une archive HTML legacy (iframe + couche collab). */
const HtmlProtoRoute = () => {
  const { slug } = useParams<{ slug: string }>()
  const entry = legacyProtos.find((p) => p.slug === slug)
  // Slug inconnu → retour à l'index plutôt qu'une page blanche.
  if (!entry) return <Navigate to="/" replace />
  return <HtmlProtoFrame slug={entry.slug} title={entry.title} href={entry.href} />
}

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/design-system/:slug" element={<DesignSystem />} />
        <Route path="/html/:slug" element={<HtmlProtoRoute />} />
        {protos.map(({ slug, route, title, Component }) => (
          <Route
            key={slug}
            path={route}
            element={
              <ProtoFrame title={title} slug={slug}>
                <Component />
              </ProtoFrame>
            }
          />
        ))}
      </Routes>
    </Suspense>
  )
}

export default App
