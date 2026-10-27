import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './i18n/config.js';

// Gestion automatique des mises à jour Vite / Vercel (Chunk Load Error lors des redéploiements)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloaded = sessionStorage.getItem('bca_vite_preload_reloaded');
  if (!reloaded) {
    sessionStorage.setItem('bca_vite_preload_reloaded', 'true');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
