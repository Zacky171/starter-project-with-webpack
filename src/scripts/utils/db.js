import { openDB } from 'idb';

const DB_NAME = 'storydb';
const DB_VERSION = 1;
const STORE_STORIES = 'stories';
const STORE_PENDING = 'pendingSyncs';

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_STORIES)) {
        db.createObjectStore(STORE_STORIES, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function getAllStories() {
  const db = await getDB();
  return db.getAll(STORE_STORIES);
}

export async function putStory(story) {
  const db = await getDB();
  return db.put(STORE_STORIES, story);
}

export async function deleteStory(id) {
  const db = await getDB();
  return db.delete(STORE_STORIES, id);
}

export async function addPending(postData) {
  const db = await getDB();
  const timestamp = Date.now();
  return db.add(STORE_PENDING, { ...postData, timestamp });
}

export async function getPending() {
  const db = await getDB();
  return db.getAll(STORE_PENDING);
}

export async function deletePending(id) {
  const db = await getDB();
  return db.delete(STORE_PENDING, id);
}

export async function clearPending() {
  const db = await getDB();
  const pendings = await getPending();
  await Promise.all(pendings.map(p => deletePending(p.id)));
}
