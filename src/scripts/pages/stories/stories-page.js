import { getStories } from '../../data/api.js';
import { getAllStories, putStory } from '../../utils/db.js';
import Map from '../../utils/map.js';
import { getFavorites, addFavorite, removeFavorite, searchFavorites, sortFavorites } from '../../utils/favorites.js';
import { isLoggedIn } from '../../utils/index.js';

let stories = [];
let favorites = [];
let favIds = new Set();

async function renderStoriesPage() {
  // Explicit guard - should not reach here unauth
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return;
  }

  const content = document.createElement('section');
  content.innerHTML = `
    <header class="stories-header">
      <div class="stories-header-left">
        <h1 class="page-title">Story Map</h1>
      </div>
      <div class="stories-header-center">
        <label for="filter" class="search-label">
          🔍 <input type="search" id="filter" placeholder="Cari story..." aria-label="Filter stories">
        </label>
      </div>
      <div class="stories-header-right">
        <a href="#/add" data-nav class="add-story-btn btn btn-primary"> Tambah Story</a>
      </div>
    </header>
    <div id="story-map" style="height: 500px; width: 100%; min-height: 500px; margin-bottom: 2rem;"></div>
    <section class="stories-preview mt-12">
      <div class="container">
        <h2 class="section-title mb-8">Stories Terbaru</h2>
        <div id="recent-stories" class="stories-grid"></div>
      </div>
    </section>
    <section class="favorites-section mt-12">
      <div class="container">
        <h2 class="section-title mb-8">Favorites <small>(IndexedDB)</small></h2>
        <div class="fav-controls">
          <input type="search" id="fav-search" placeholder="Cari favorites..." aria-label="Search favorites">
          <select id="fav-sort">
            <option value="date-desc">Tanggal ↓</option>
            <option value="date-asc">Tanggal ↑</option>
            <option value="name-desc">Nama ↓</option>
            <option value="name-asc">Nama ↑</option>
          </select>
        </div>
        <div id="favorites-grid" class="stories-grid"></div>
        <p id="fav-status" class="status-msg"></p>
      </div>
    </section>
  `;

  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);

  const mapDiv = content.querySelector('#story-map');
  const recentStoriesEl = content.querySelector('#recent-stories');
  const favGrid = content.querySelector('#favorites-grid');
  const favSearch = content.querySelector('#fav-search');
  const favSort = content.querySelector('#fav-sort');
  const favStatus = content.querySelector('#fav-status');

  // Init map
  const storiesMap = await Map.build('#story-map', { zoom: 12, locate: true });

  // Load stories - Advanced offline: try API → IDB fallback
  const loadStories = async () => {
    try {
      const data = await getStories();
      stories = data;
      // Cache to IDB for future offline
      for (const story of data) {
        await putStory(story);
      }
    } catch (error) {
      console.warn('API failed, loading from IDB:', error);
      stories = await getAllStories();
    }
    
    renderRecentStories(recentStoriesEl, stories);
    addMarkers(storiesMap, stories);
    
    if (!navigator.onLine) {
      favStatus.textContent = `📴 Offline mode - Showing ${stories.length} cached stories from IndexedDB`;
    }
  };

  // Load favorites
  const loadFavorites = async () => {
    try {
      favorites = await getFavorites();
      favIds = new Set(favorites.map(f => f.id));
      renderFavorites(favGrid, favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  await loadStories();
  await loadFavorites();

  // Recent filter
  content.querySelector('#filter').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = stories.filter(s => 
      s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
    );
    renderRecentStories(recentStoriesEl, filtered.slice(0,6));
  });

  // Favorites interactive
  favSearch.addEventListener('input', debounce(renderFavoritesFilter, 300));
  favSort.addEventListener('change', debounce(renderFavoritesFilter, 300));

  function renderFavoritesFilter() {
    const query = favSearch.value;
    let filteredFavs = favorites;
    if (query) {
      filteredFavs = searchFavorites(query);
    }
    const sortValue = favSort.value;
    const [sortBy, direction] = sortValue.split('-');
    filteredFavs = sortFavorites(filteredFavs, sortBy, direction);
    renderFavorites(favGrid, filteredFavs);
    favStatus.textContent = `Showing ${filteredFavs.length} of ${favorites.length} favorites`;
  }

  // Global online/offline
  window.addEventListener('online', loadStories);
}

function renderRecentStories(container, storiesList) {
  container.innerHTML = storiesList.slice(0, 6).map(story => createStoryCard(story)).join('') || 
    '<p style="text-align: center; padding: 2rem; color: #64748b;">Tidak ada stories.</p>';
}

function createStoryCard(story) {
  const isFav = favIds.has(story.id);
  return `
    <article class="story-card" tabindex="0" role="button" onclick="window.location.hash = '#/story/${story.id}'">
      <img src="${story.photoUrl || ''}" alt="${story.name}" loading="lazy">
      <div class="story-info">
        <h3>${story.name}</h3>
        <p>${story.description || 'No description'}</p>
        <small>🕒 ${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
      </div>
      <button class="fav-btn ${isFav ? 'fav-active' : ''}" onclick="toggleFav('${story.id}', event)" aria-label="${isFav ? 'Remove favorite' : 'Add favorite'}" title="${isFav ? 'Unlike' : 'Like'}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </article>
  `;
}

function renderFavorites(container, favList) {
  container.innerHTML = favList.map(story => createStoryCard(story)).join('') || 
    '<p style="text-align: center; padding: 2rem; color: #64748b;">Tidak ada favorites. Tambahkan dari stories.</p>';
}

function addMarkers(map, storyList) {
  storyList.forEach(s => {
    if (s.lat && s.lon) {
      map.addMarker(parseFloat(s.lat), parseFloat(s.lon), `<b>${s.name}</b>`);
    }
  });
}

// Global fav toggle function (for onclick)
async function toggleFav(id, event) {
  event.stopPropagation();
  const story = stories.find(s => s.id === id);
  if (!story) return;
  if (favIds.has(id)) {
    await removeFavorite(id);
    favIds.delete(id);
  } else {
    await addFavorite(story);
    favIds.add(id);
  }
  // Re-render if needed, or live update since single
  const page = document.querySelector('.stories-preview');
  if (page) {
    // Re-render recent/favs
    const recentEl = page.querySelector('#recent-stories');
    const favGrid = page.querySelector('#favorites-grid');
    if (recentEl) renderRecentStories(recentEl, stories);
    if (favGrid) renderFavorites(favGrid, favorites);
  }
}

window.toggleFav = toggleFav;

// Debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default renderStoriesPage;

