import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Wakeup ping — keeps Render backend warm on app load
fetch('https://iron-ledger-twy4.onrender.com/api/exercises', { method: 'GET' }).catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
