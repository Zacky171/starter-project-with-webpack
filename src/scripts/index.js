import '../styles/styles.css';
import './utils/index.js';
import App from './pages/app.js';
import { syncAllPending } from './utils/sync.js';
import { initPWA } from './utils/pwa.js';

// Register SW for push/PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.log('SW registration failed', err));
}

// Auto sync on online
window.addEventListener('online', syncAllPending);

// Init PWA
initPWA();

App();

