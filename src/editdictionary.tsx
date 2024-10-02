import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EditDict from './EditDict.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditDict />
  </StrictMode>,
)
