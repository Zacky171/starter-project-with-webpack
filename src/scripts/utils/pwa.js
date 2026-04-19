import { VAPID_PUBLIC_KEY } from '../config.js';

let deferredPrompt;
let isPushEnabled = false;
let pushSubscription = null;

export function initPWA() {
  // Install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallPromotion();
  });

  // Offline UI
  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('online', updateOnlineStatus);

  // Init push
  initPushNotifications();
}

async function initPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      pushSubscription = await registration.pushManager.getSubscription();
      isPushEnabled = !!(pushSubscription && Notification.permission === 'granted');
      localStorage.setItem('pushEnabled', isPushEnabled);
    } catch (err) {
      console.warn('Push init failed', err);
    }
  }
}

export async function togglePushNotifications() {
  window.togglePush = togglePushNotifications; // Global for onclick
  
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Push notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (isPushEnabled) {
      pushSubscription?.unsubscribe();
      isPushEnabled = false;
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        isPushEnabled = true;
        // TODO: Send subscription to server for new story triggers
      } else {
        alert('Push notifications blocked');
        return;
      }
    }
    
    localStorage.setItem('pushEnabled', isPushEnabled);
    updatePushUI();
  } catch (err) {
    console.error('Push toggle failed', err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updatePushUI() {
  const btn = document.getElementById('push-toggle-btn');
  if (btn) {
    btn.textContent = isPushEnabled ? '🔔 Push: ON' : '🔔 Push: OFF';
    btn.className = isPushEnabled ? 'btn btn-success' : 'btn btn-secondary';
  }
}

function showInstallPromotion() {
  const container = document.createElement('div');
  container.id = 'pwa-promotion';
  container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px;';
  
  const installBtn = document.createElement('button');
  installBtn.id = 'install-app-btn';
  installBtn.textContent = 'Install App';
  installBtn.ariaLabel = 'Install Story Map as PWA';
  installBtn.style.cssText = 'padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; font-size: 14px;';
  installBtn.addEventListener('click', installApp);
  
  const pushBtn = document.createElement('button');
  pushBtn.id = 'push-toggle-btn';
  pushBtn.textContent = isPushEnabled ? '🔔 Push: ON' : '🔔 Push: OFF';
  pushBtn.className = isPushEnabled ? 'btn btn-success' : 'btn btn-secondary';
  pushBtn.style.cssText = 'padding: 12px; background: #10b981; color: white; border: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; font-size: 14px;';
  pushBtn.addEventListener('click', togglePushNotifications);
  
  container.appendChild(installBtn);
  container.appendChild(pushBtn);
  document.body.appendChild(container);
}

function hideInstallPromotion() {
  const btn = document.getElementById('install-app-btn');
  if (btn) btn.remove();
}

function updateOnlineStatus() {
  const bar = document.getElementById('offline-status');
  if (navigator.onLine) {
    if (bar) bar.remove();
  } else {
    let bar = document.getElementById('offline-status');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'offline-status';
      bar.textContent = '📴 Offline - Some features limited';
      bar.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ef4444; color: white; padding: 12px; text-align: center; z-index: 10000; font-weight: bold;';
      document.body.appendChild(bar);
    }
  }
}

export async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      hideInstallPromotion();
    }
  }
}
