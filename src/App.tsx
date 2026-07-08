import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageLoader } from 'ui-kit'
import IndexPage from './pages/IndexPage'
import GalleryPage from './pages/GalleryPage'
import ProtoFrame from './components/ProtoFrame'
import { protos } from './protos/registry'

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        {protos.map(({ slug, route, title, Component }) => (
          <Route
            key={slug}
            path={route}
            element={
              <ProtoFrame title={title}>
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
