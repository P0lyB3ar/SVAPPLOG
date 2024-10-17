import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EditDict from './EditDict.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditDict />
  </StrictMode>,
)
