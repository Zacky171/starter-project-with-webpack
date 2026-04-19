import { openDB } from 'idb';

const DB_NAME = 'storydb';
const FAV_STORE = 'favorites';

export async function getDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FAV_STORE)) {
        db.createObjectStore(FAV_STORE, { keyPath: 'id' });
      }
    },
  });
}

export async function addFavorite(story) {
  const db = await getDB();
  story.favTimestamp = Date.now();
  await db.put(FAV_STORE, story);
}

export async function removeFavorite(id) {
  const db = await getDB();
  await db.delete(FAV_STORE, id);
}

export async function getFavorites() {
  const db = await getDB();
  return await db.getAll(FAV_STORE);
}

export function searchFavorites(query) {
  return getFavorites().then(favs => 
    favs.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase()) || 
      f.description.toLowerCase().includes(query.toLowerCase())
    )
  );
}

export function sortFavorites(favs, sortBy, direction) {
  return favs.slice().sort((a, b) => {
    let valA, valB;
    if (sortBy === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else {
      valA = new Date(a.createdAt || a.favTimestamp);
      valB = new Date(b.createdAt || b.favTimestamp);
    }
    if (direction === 'asc') {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });
}
