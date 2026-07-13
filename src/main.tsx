import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AntdTheme } from '@kapptivate/ui-kit'
import '@kapptivate/ui-kit/dist/style.css'
import './index.css'
import './i18n'
import App from './App'
import UpdatePrompt from './components/UpdatePrompt'
import { CurrentUserProvider } from './context/CurrentUser'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AntdTheme>
        <CurrentUserProvider>
          <App />
          <UpdatePrompt />
        </CurrentUserProvider>
      </AntdTheme>
    </BrowserRouter>
  </StrictMode>,
)
