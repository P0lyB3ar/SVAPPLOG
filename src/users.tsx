import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import UserD from './UserD';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserD/>
  </StrictMode>,
)
