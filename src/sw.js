import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { getPending, deletePending, postStory } from '/src/scripts/utils/db.js';
import { syncAllPending } from '/src/scripts/utils/sync.js';

// Precache manifest will replace __WB_MANIFEST below automatically by workbox-webpack-plugin
precacheAndRoute(self.__WB_MANIFEST);

// Cache API stories response - NetworkFirst for advanced offline
registerRoute(
  ({url}) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.includes('/stories'),
  new NetworkFirst({
    cacheName: 'stories-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24h
      }),
    ],
  })
);

// Cache images
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
    ],
  })
);

// Background sync handler
self.addEventListener('sync', event => {
  if (event.tag === 'story-sync') {
    event.waitUntil(syncAllPending());
  }
});

// Push notification handler - DYNAMIC content
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body || `${data.name} membagikan cerita baru!`,
    icon: data.photoUrl || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: data.photoUrl,
    data: {
      storyId: data.storyId || data.id
    },
    actions: [
      {
        action: 'view',
        title: 'Lihat Cerita',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'home',
        title: 'Kembali ke Home',
        icon: '/icons/icon-192.png'
      }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || `${data.name}'s Story`, options)
  );
});

// Notification click handler - Navigate to detail or home
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.action === 'view' 
    ? `/ #/story/${event.notification.data.storyId}`
    : '/';
  
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(clientList => {
      // Focus existing if open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
