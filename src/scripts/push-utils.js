const VAPID_PUBLIC_KEY = 'BJMC5ROZad0v9NEFAdIrRP7G3bitXKBrMFN9kI-9RJFqfNUOmKWf6QXv5VYzMWRCCcBPVVbAL4nu0bIfg9HJY5c';

export async function getSubscription() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }
  return null;
}

export async function subscribeToPush() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    return subscription;
  }
  return null;
}

export async function unsubscribeFromPush() {
  const subscription = await getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }
  return false;
}

export async function togglePushNotification(enable) {
  if (enable) {
    return await subscribeToPush();
  } else {
    return await unsubscribeFromPush();
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

