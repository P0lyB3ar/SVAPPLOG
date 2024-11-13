import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Register from './components/SignIn/Register'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Register />
  </StrictMode>,
)
