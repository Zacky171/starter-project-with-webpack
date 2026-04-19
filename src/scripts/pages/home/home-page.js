import { fadeTransition } from '../../utils/transition.js';
import { isLoggedIn } from '../../utils/index.js';
import Map from '../../utils/map.js';

async function renderHome() {
  const content = document.createElement('section');
  content.classList.add('hero-section', 'text-center');
  content.innerHTML = `
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Selamat Datang di Story Map</h1>
        <p class="hero-subtitle mb-6">Bagikan cerita Anda dengan peta interaktif dan foto. Temukan petualangan orang lain di sekitar Anda!</p>
        <div class="hero-buttons">
          <a href="#/register" data-nav class="btn btn-secondary mb-3">🚀 Mulai Petualangan</a>
          ${isLoggedIn() ? '<a href="#/stories" data-nav class="btn btn-secondary">📍 Lihat Stories</a>' : '<a href="#/login" data-nav class="btn btn-secondary">📍 Login untuk Lihat Stories</a>'}
          <button id="push-home-toggle" class="btn btn-accent" onclick="window.togglePush()">🔔 Push Notif</button>
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
  `;
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);
  
  // initialize the map
  try {
    await Map.build('#home-map', { zoom: 5, locate: true });
  } catch (e) {}
  content.classList.add('active');
}

export default renderHome;

