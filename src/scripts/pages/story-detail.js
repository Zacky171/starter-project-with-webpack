import { getStories } from '../data/api.js';
import Map from '../utils/map.js';
import { getFavorites, addFavorite, removeFavorite } from '../utils/db.js';

let favIds = new Set();

async function renderStoryDetail(id) {
  const app = document.getElementById('app');
  const content = document.createElement('section');
  content.innerHTML = `
    <header>
      <h1>Story Detail</h1>
      <button onclick="window.history.back()">← Back</button>
    </header>
    <div class="loading">Loading...</div>
  `;

  app.innerHTML = '';
  app.appendChild(content);

  try {
    const stories = await getStories();
    const story = stories.find(s => s.id == id);
    if (!story) {
      content.innerHTML = '<p>Story not found</p>';
      return;
    }

    const favorites = await getFavorites();
    const isFav = favorites.some(f => f.id == story.id);
    favIds = new Set(favorites.map(f => f.id));

    content.innerHTML = `
      <div class="story-detail">
        <img src="${story.photoUrl || ''}" alt="${story.name}">
        <h1>${story.name}</h1>
        <p>${story.description || 'No description'}</p>
        <div class="meta">${new Date(story.createdAt).toLocaleDateString('id-ID')}</div>
        <button onclick="window.toggleFav('${story.id}', event)" class="fav-btn ${isFav ? 'active' : ''}">
          ${isFav ? '❤️ Unlike' : '🤍 Like'}
        </button>
        ${story.lat && story.lon ? `<div id="story-map" style="height: 300px;"></div>` : ''}
      </div>
    `;

    if (story.lat && story.lon) {
      Map.build('#story-map', { center: [parseFloat(story.lat), parseFloat(story.lon)], zoom: 15 })
        .then(map => map.addMarker(parseFloat(story.lat), parseFloat(story.lon), story.name));
    }
  } catch (error) {
    content.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

export default renderStoryDetail;
