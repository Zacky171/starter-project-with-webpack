import '../styles/styles.css';
import './utils/index.js';
import { initPWA } from './utils/pwa.js';
import App from './pages/app.js';

App();

// Init PWA features
initPWA();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {scope: '/'})
      .then(registration => {
        console.log('SW registered', registration);
        
        // Register background sync for pending stories
        if ('sync' in window.SyncManager) {
          registration.sync.register('story-sync').then(() => {
            console.log('Story sync registered');
          }).catch(err => {
            console.warn('Story sync registration failed:', err);
          });
        }
      })
      .catch(error => {
        console.error('SW registration failed', error);
      });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Install prompt ready - add btn to UI if needed');
});

// Global install function for UI btn
window.installApp = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log('Install choice', choiceResult.outcome);
      deferredPrompt = null;
    });
  }
};

