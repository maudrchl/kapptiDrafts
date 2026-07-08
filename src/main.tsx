import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AntdTheme } from '@kapptivate/ui-kit'
import '@kapptivate/ui-kit/dist/style.css'
import './index.css'
import './i18n'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AntdTheme>
        <App />
      </AntdTheme>
    </BrowserRouter>
  </StrictMode>,
)
