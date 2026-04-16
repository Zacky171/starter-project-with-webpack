import { API_BASE } from '../config.js';

const VAPID_PUBLIC_KEY = 'BJwAdABLzVsHBeKLj0z81zEqsQf7Yk8T9s5nKqT0pX0Y5nQ0mG0g0s5f0qR5s5f'; // Demo key

let isSubscribed = false;

export function isPushSubscribed() {
  return isSubscribed;
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

export async function togglePushSubscription(swRegistration) {
  if (isSubscribed) {
    await unsubscribePush(swRegistration);
    isSubscribed = false;
    return 'unsubscribed';
  } else {
    await subscribePush(swRegistration);
    isSubscribed = true;
    return 'subscribed';
  }
}

export async function subscribePush(swRegistration) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission denied');
  
  const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const subscription = await swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKey,
  });
  
  // TODO: Send to real server (stubbed for demo)
  try {
    await fetch(`${API_BASE}/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscription)
    });
  } catch (e) {
    console.warn('Push register server call failed (demo mode):', e.message);
    // Store locally for demo
    localStorage.setItem('pushSubscription', JSON.stringify(subscription));
  }
  
  return subscription;
}

export async function unsubscribePush(swRegistration) {
  const subscription = await swRegistration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    // TODO: Send to real server (stubbed)
    try {
      await fetch(`${API_BASE}/push/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });
    } catch (e) {
      console.warn('Push unregister failed (demo):', e);
      localStorage.removeItem('pushSubscription');
    }
  }
}
