const CACHE_NAME = 'storymap-pwa-v1';
const API_BASE = 'https://story-api.dicoding.dev/v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      '/',
      '/index.html',
      '/bundle.js', // webpack bundle
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      '/styles/styles.css'
    ]))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for pending story posts (uses IndexedDB 'pendingSyncs')
self.addEventListener('sync', event => {
  if (event.tag === 'story-sync') {
    event.waitUntil((async () => {
      try {
        const db = await openDatabase();
        const tx = db.transaction('pendingSyncs', 'readwrite');
        const store = tx.objectStore('pendingSyncs');
        const allReq = store.getAll();
        const pendings = await new Promise((res, rej) => {
          allReq.onsuccess = () => res(allReq.result);
          allReq.onerror = () => rej(allReq.error);
        });
        let synced = 0;
        for (const p of pendings) {
          const formData = new FormData();
          Object.keys(p).forEach(key => {
            if (key === 'id' || key === 'timestamp') return;
            try {
              formData.append(key, p[key]);
            } catch (e) {
              // fallback for non-cloneable values
              formData.append(key, String(p[key]));
            }
          });
          try {
            const res = await fetch(`${API_BASE}/stories/guest`, { method: 'POST', body: formData });
            if (res && res.ok) {
              store.delete(p.id);
              synced++;
            }
          } catch (err) {
            console.warn('Sync post failed', err);
          }
        }
        if (synced > 0) {
          console.log(`Synced ${synced} pending stories`);
        }
      } catch (err) {
        console.warn('Background sync failed', err);
      }
    })());
  }
});

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('storydb', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('stories')) db.createObjectStore('stories', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('pendingSyncs')) db.createObjectStore('pendingSyncs', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(event.request));
  } else if (url.href.startsWith(API_BASE)) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(request);
  if (response) return response;
  try {
    response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (e) {
    return cache.match(request) || new Response('Offline', {status: 503});
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (e) {
    return cache.match(request);
  }
}

// Push notifications disabled in this forked build.


