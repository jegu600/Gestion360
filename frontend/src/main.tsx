import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { GestionApp } from './GestionApp';
import './index.css';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GestionApp />
  </StrictMode>
)
