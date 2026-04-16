import { fadeTransition } from '../../utils/transition.js';
import { isLoggedIn } from '../../utils/index.js';
import Map from '../../utils/map.js';
import { getStories } from '../../data/api.js';
import { togglePushSubscription, isPushSubscribed } from '../../utils/push.js';
import { showError, showSuccess } from '../../utils/alert.js';

async function renderHome() {
  const content = document.createElement('section');
  content.classList.add('hero-section', 'text-center');
  content.innerHTML = `
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Selamat Datang di Story Map</h1>
        <p class="hero-subtitle mb-6">Bagikan cerita Anda dengan peta interaktif dan foto. Temukan petualangan orang lain di sekitar Anda!</p>
        <div class="hero-buttons">
          <button id="push-toggle" class="btn btn-secondary mb-3" aria-label="Toggle push notifications">
            🔔 Push ${isPushSubscribed() ? 'Aktif' : 'Nonaktif'}
          </button>
          <a href="#/register" data-nav class="cta-btn btn btn-primary large-btn mb-3">🚀 Mulai Petualangan</a>
          <a href="#/stories" data-nav class="btn btn-secondary">📍 Lihat Stories</a>
        </div>
        <div class="hero-features">
          <div class="feature">
            <span>🗺️</span>
            <span>Peta Interaktif</span>
          </div>
          <div class="feature">
            <span>📸</span>
            <span>Foto Cerita</span>
          </div>
          <div class="feature">
            <span>🌍</span>
            <span>Lokasi Real</span>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <div id="home-map" class="hero-map" style="width: 100%;"></div>
      </div>
    </div>
    <section class="stories-preview mt-12">
      <div class="container">
        <h2 class="section-title mb-8">Stories Terbaru</h2>
        <div id="recent-stories" class="stories-grid"></div>
      </div>
    </section>
  `;
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);
  
  // Show loading first
  const recentStoriesEl = content.querySelector('#recent-stories');
  recentStoriesEl.innerHTML = '<div class="loading"></div><p>Loading stories...</p>';

  // Init real map
  let homeMap;
  try {
    homeMap = await Map.build('#home-map', { zoom: 5, locate: true });

    // Load real stories
    const stories = await getStories();
    if (stories.length > 0) {
      // Render story cards (first 6)
      recentStoriesEl.innerHTML = stories.slice(0, 6).map(story => `
        <article class="story-card">
          <img src="${story.photoUrl || '/src/images/logo.png'}" alt="${story.name}" loading="lazy">
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description || 'No description'}</p>
            <small>🕒 ${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
          </div>
        </article>
      `).join('');

      // Add real markers to map
      stories.slice(0, 12).forEach(s => {
        if (s.lat && s.lon) {
          homeMap.addMarker(
            parseFloat(s.lat), 
            parseFloat(s.lon), 
            `<b>${s.name}</b><br/>${s.description?.substring(0, 80) || ''}...<br/>📍 ${s.lat}, ${s.lon}`
          );
        }
      });
    } else {
      recentStoriesEl.innerHTML = '<p>Belum ada stories. Tambahkan yang pertama!</p>';
    }
  } catch (error) {
    console.error('Home page load error:', error);
    await showError('Gagal memuat halaman', 'Tidak dapat memuat stories/map. Periksa koneksi dan refresh.');
    recentStoriesEl.innerHTML = '<p>Stories tidak tersedia saat ini. <a href="#/stories">Coba Stories page</a>.</p>';
  }

  const pushToggle = content.querySelector('#push-toggle');
  pushToggle.addEventListener('click', async () => {
    try {
      const swReg = await navigator.serviceWorker.getRegistration();
      if (!swReg) throw new Error('Service worker not registered');
      const status = await togglePushSubscription(swReg);
      pushToggle.textContent = `🔔 Push ${status === 'subscribed' ? 'Aktif' : 'Nonaktif'}`;
      pushToggle.className = status === 'subscribed' ? 'btn btn-success' : 'btn btn-secondary';
      await showSuccess(status === 'subscribed' ? 'Push Aktif!' : 'Push Nonaktif');
    } catch (e) {
      await showError('Push gagal', e.message + '. Izinkan notifikasi di browser.');
    }
  });

  content.classList.add('active');
}

export default renderHome;

