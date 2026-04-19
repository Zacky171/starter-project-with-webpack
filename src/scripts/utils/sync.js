import { getPending, deletePending } from './db.js';
import { postStory } from '../data/api.js';

export async function syncAllPending() {
  try {
    const pending = await getPending();
    let synced = 0;
    for (const p of pending) {
      try {
        const formData = new FormData();
        Object.keys(p).forEach(key => {
          if (key !== 'id' && key !== 'timestamp') {
            formData.append(key, p[key]);
          }
        });
        await postStory(formData);
        await deletePending(p.id);
        synced++;
      } catch (err) {
        console.warn('Sync failed for', p.id, err);
      }
    }
    if (synced > 0) {
      console.log(`Synced ${synced} stories!`);
    }
  } catch (err) {
    console.warn('Sync error', err);
  }
};

export function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.SyncManager) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('story-sync').then(() => {
        console.log('Background sync registered');
      }).catch(err => {
        console.warn('Background sync registration failed:', err);
      });
    });
  }
}
