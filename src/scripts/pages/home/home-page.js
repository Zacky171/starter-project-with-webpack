import { fadeTransition } from '../../utils/transition.js';
import { isLoggedIn } from '../../utils/index.js';
import Map from '../../utils/map.js';
import { getStories } from '../../data/api.js';

async function renderHome() {
  const content = document.createElement('section');
  content.classList.add('hero-section', 'text-center');
  content.innerHTML = `
      <div class="hero-container full-width">
        <div class="hero-main">
          <div class="hero-content">
            <h1 class="hero-title">Selamat Datang di Story Map</h1>
            <div style="height: 2rem;"></div>
<span class="hero-subtitle single-line">Bagikan cerita Anda dengan peta interaktif dan foto. Temukan petualangan orang lain di sekitar Anda!</span>
            <div class="hero-map-side">
              <div id="home-map" style="height: 350px; width: 100%; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);"></div>
            </div>
            <div class="hero-buttons">
              <a href="#/register" data-nav class="btn btn-secondary">🚀 Mulai Petualangan</a>
              <a href="#/stories" data-nav class="btn btn-secondary mb-3">📍 Lihat Stories</a>
            </div>
            <div class="hero-features">
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
        </div>
        <section class="stories-preview mt-12">
          <div class="container">
            <h2 class="section-title mb-8">Stories Terbaru</h2>
            <div id="recent-stories" class="stories-grid"></div>
          </div>
        </section>
      </div>
  `;
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);
  
  const recentStoriesEl = content.querySelector('#recent-stories');
  recentStoriesEl.innerHTML = '<div class="loading"></div><p>Loading stories...</p>';

  const homeMap = await Map.build('#home-map', { zoom: 10, locate: true });
  
  try {
    const stories = await getStories();
    if (stories.length > 0) {
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
      
      stories.forEach(story => {
        if (story.lat && story.lon) {
          homeMap.addMarker(parseFloat(story.lat), parseFloat(story.lon), `<b>${story.name}</b>`);
        }
      });
    } else {
      recentStoriesEl.innerHTML = '';
    }
  } catch (error) {
    console.error('Home page load error:', error);
    recentStoriesEl.innerHTML = '';
  }

  content.classList.add('active');
}

export default renderHome;
