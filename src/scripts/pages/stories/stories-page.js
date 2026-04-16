import { getStories } from '../../data/api.js';
import Map from '../../utils/map.js';
import { getAllStories, putStory, deleteStory } from '../../utils/db.js';
import { isLoggedIn } from '../../utils/index.js';
import { showError } from '../../utils/alert.js';

let stories = [], filteredStories = [], currentMapInstance = null;

async function hybridCacheStories(apiStories) {
  const dbStories = await getAllStories();
  if (navigator.onLine) {
    await Promise.all(apiStories.map(s => putStory({...s, synced: true})));
    return apiStories;
  } else {
    return dbStories;
  }
}

async function renderStoriesPage() {
  const content = document.createElement('section');
  content.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1>Story Map</h1>
      <div class="search-controls">
        <label for="filter" class="search-label">
          🔍<input type="search" id="filter" placeholder="Cari story..." aria-label="Filter stories">
        </label>
        <select id="sort" aria-label="Urutkan stories">
          <option value="default">Default</option>
          <option value="newest">Terbaru</option>
        </select>
      </div>
    </header>
    <div id="story-map" style="height: 500px; width: 100%; min-height: 500px; margin-bottom: 2rem;"></div>
    <section class="stories-preview">
      <div class="container">
        <h2 class="section-title mb-8">Stories Terbaru</h2>
        <div id="recent-stories" class="stories-grid"></div>
      </div>
    </section>
  `;
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);
  
  requestAnimationFrame(async () => {
    await new Promise(r => setTimeout(r, 200));
    
    const mapContainer = document.querySelector('#story-map');
    const storiesContainer = document.querySelector('#recent-stories');
    
    try {
      currentMapInstance = await Map.build('#story-map', { zoom: 12, locate: true });
    } catch (mapErr) {
      console.warn('Map init failed:', mapErr);
    }
    
    try {
      const apiData = await getStories().catch(() => []);
      stories = await hybridCacheStories(apiData);
      filteredStories = [...stories];
      
      renderStoryCards(storiesContainer);
      attachDeleteHandlers(storiesContainer);
      
      if (currentMapInstance) {
        updateStoryMarkers(currentMapInstance);
      }
      
      setupFilters(storiesContainer);
    } catch (loadErr) {
      console.error('Stories load failed:', loadErr);
      if (storiesContainer) {
        storiesContainer.innerHTML = '<p>Gagal memuat stories.</p>';
      }
    }
  });
}

function renderStoryCards(container) {
  if (!container) return;
  
  container.innerHTML = filteredStories.slice(0, 12).map(story => `
    <article class="story-card" data-story-id="${story.id || ''}">
      <img src="${story.photoUrl || '/src/images/logo.png'}" alt="${story.name}" loading="lazy">
      <div class="story-info">
        <h3>${story.name || 'Tanpa nama'}</h3>
        <p>${story.description?.slice(0, 80) || 'Tanpa deskripsi'}</p>
        <small>🕒 ${new Date(story.createdAt || Date.now()).toLocaleDateString('id-ID')}</small>
        ${story.synced === false ? '<span class="local">Lokal</span>' : ''}
      </div>
      ${isLoggedIn() ? '<button class="delete-story-btn">🗑️ Hapus</button>' : ''}
    </article>
  `).join('') || '<p style="text-align:center; padding:4rem; color:#666;">Belum ada story atau sedang offline.</p>';
}

function attachDeleteHandlers(container) {
  if (!container) return;
  
  container.querySelectorAll('.delete-story-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const card = btn.closest('.story-card');
      const storyId = card.dataset.storyId;
      
      if (!storyId || !confirm('Yakin hapus story ini?')) return;
      
      try {
        await deleteStory(storyId);
        filteredStories = filteredStories.filter(s => s.id != storyId);
        renderStoryCards(container);
        if (currentMapInstance) updateStoryMarkers(currentMapInstance);
      } catch (err) {
        showError('Gagal menghapus', err.message || 'Unknown error');
      }
    });
  });
}

function updateStoryMarkers(mapInstance) {
  if (!mapInstance) return;
  
  try {
    // Clear existing markers (custom clear function since #map private)
    // Add new markers only (simple approach for demo)
    filteredStories.slice(0, 25).forEach(story => {
      if (story.lat && story.lon && !isNaN(parseFloat(story.lat)) && !isNaN(parseFloat(story.lon))) {
        mapInstance.addMarker(
          parseFloat(story.lat),
          parseFloat(story.lon),
          `<b>${story.name}</b>`
        );
      }
    });
  } catch (err) {
    console.warn('Map markers failed:', err);
  }
}

function setupFilters(container) {
  const filterInput = document.querySelector('#filter');
  const sortSelect = document.querySelector('#sort');
  
  if (!filterInput || !sortSelect || !container) return;
  
  function handleFilter() {
    const term = filterInput.value.toLowerCase();
    let results = stories.filter(s => 
      s.name?.toLowerCase().includes(term) || 
      s.description?.toLowerCase().includes(term)
    );
    
    if (sortSelect.value === 'newest') {
      results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    filteredStories = results;
    renderStoryCards(container);
    attachDeleteHandlers(container);
    
    if (currentMapInstance) {
      updateStoryMarkers(currentMapInstance);
    }
  }
  
  filterInput.addEventListener('input', handleFilter);
  sortSelect.addEventListener('change', handleFilter);
}

export default renderStoriesPage;

