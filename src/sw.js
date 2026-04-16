import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

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

// Push notification handler
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body || 'New story added!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: {
      storyId: data.storyId
    },
    actions: [
      {
        action: 'view',
        title: 'Lihat Detail',
        icon: '/icons/icon-192.png'
      }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Story Baru', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(`/ #/stories/${event.notification.data.storyId}`)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
