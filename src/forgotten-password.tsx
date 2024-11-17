import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ForgottenPassword from './components/SignIn/ForgottenPassword';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ForgottenPassword />
  </StrictMode>,
)
