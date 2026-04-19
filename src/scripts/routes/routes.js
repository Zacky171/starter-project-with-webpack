 // MVP Router with hash routing
import { fadeTransition, slideTransition } from '../utils/index.js';
import { isLoggedIn } from '../utils/index.js';
import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import StoriesPage from '../pages/stories/stories-page.js';
import AddStoryPage from '../pages/add/add-story-page.js';
import HomePage from '../pages/home/home-page.js';
import StoryDetail from '../pages/story-detail.js';

const routes = {
  '/': HomePage,
  '/stories': StoriesPage,
  '/add': AddStoryPage,
  '/login': LoginPage,
  '/register': RegisterPage
};

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const hash = link.getAttribute('href');
      window.location.hash = hash;
    });
  });
}

function handleRoute() {
  if (!document.getElementById('app')) return;

  const app = document.getElementById('app') || document.querySelector('#app');
  const oldSection = app.querySelector('section');
  if (oldSection) oldSection.classList.remove('active');
  
  const path = window.location.hash.slice(1) || '/';
  
  // Auth guard for protected routes
  if (!isLoggedIn() && (path === '/stories' || path === '/add')) {
    window.location.hash = '#/login';
    return;
  }
  
  if (path.startsWith('/story/')) {
    const id = path.split('/')[2];
    StoryDetail(id);
    return;
  }
  const PageComponent = routes[path] || HomePage;
  PageComponent();
  
  // Add active class after render
  requestAnimationFrame(() => {
    const newSection = app.querySelector('section');
    if (newSection) newSection.classList.add('active');
  });
}
