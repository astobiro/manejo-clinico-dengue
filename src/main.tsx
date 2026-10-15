import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for offline capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    // When a new version is available, auto update
  },
  onOfflineReady() {
    console.log('App pronto para funcionar offline (PWA)');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
