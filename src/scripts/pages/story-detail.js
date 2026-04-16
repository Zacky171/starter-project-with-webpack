import Map from '../../utils/map.js';
import { getStories } from '../../data/api.js';

async function renderStoryDetail(id) {
  const app = document.getElementById('app');
  const content = document.createElement('section');
  content.innerHTML = `
    <header>
      <h1>Detail Story</h1>
    </header>
    <article id="story-detail">
      <p>Loading story ID: ${id}...</p>
    </article>
    <div id="detail-map" style="height: 400px; margin: 2rem 0;"></div>
    <a href="#/stories" class="btn btn-secondary">Kembali ke Stories</a>
  `;
  app.innerHTML = '';
  app.appendChild(content);
  content.classList.add('active');

  // Try get from API list or local
  try {
    const stories = await getStories();
    const story = stories.find(s => s.id === id);
    if (story) {
      document.getElementById('story-detail').innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}" style="max-width: 100%; height: auto;">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <small>${new Date(story.createdAt).toLocaleString('id-ID')}</small>
      `;
      if (story.lat && story.lon) {
        const detailMap = await Map.build('#detail-map');
        detailMap.addMarker(parseFloat(story.lat), parseFloat(story.lon), story.name);
        detailMap.setView(story.lat, story.lon, 15);
      }
    } else {
      document.getElementById('story-detail').innerHTML = '<p>Story tidak ditemukan.</p>';
    }
  } catch {
    document.getElementById('story-detail').innerHTML = '<p>Error loading story (offline?).</p>';
  }
}

export default renderStoryDetail;
</xai:function_call name="edit_file">
<parameter name="path">src/scripts/pages/app.js
