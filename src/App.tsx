import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageLoader } from '@kapptivate/ui-kit'
import IndexPage from './pages/IndexPage'
import DesignSystem from './designsystem/DesignSystem'
import ProtoFrame from './components/ProtoFrame'
import { protos } from './protos/registry'

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/design-system/:slug" element={<DesignSystem />} />
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
