// Main App Presenter - MVP Pattern
import { initRouter } from '../routes/routes.js';
import { isLoggedIn, logout } from '../utils/index.js';

export default function App() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runApp());
  } else {
    runApp();
  }
}

function runApp() {
  initRouter();
  
  updateNavVisibility();
  
  // Guard routes
  if (!isLoggedIn() && (window.location.hash === '#/add' || window.location.hash === '#/stories')) {
    window.location.hash = '#/login';
  }
}

function updateNavVisibility() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const storiesLi = nav.querySelector('a[href="#/stories"]')?.parentElement;
  const addLi = nav.querySelector('a[href="#/add"]')?.parentElement;
  const loginLi = nav.querySelector('a[href="#/login"]')?.parentElement;
  const registerLi = nav.querySelector('a[href="#/register"]')?.parentElement;
  let logoutLi = nav.querySelector('.logout-li');

  if (isLoggedIn()) {
    // Show all: stories, add, logout; hide login/register
    if (storiesLi) storiesLi.style.display = '';
    if (addLi) addLi.style.display = '';
    if (loginLi) loginLi.style.display = 'none';
    if (registerLi) registerLi.style.display = 'none';

    if (!logoutLi) {
      logoutLi = document.createElement('li');
      logoutLi.className = 'logout-li';
      const logoutBtn = document.createElement('a');
      logoutBtn.href = '#/login';
      logoutBtn.className = 'logout btn btn-secondary';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        if (!confirm('Yakin ingin logout?')) {
          return;
        }
        logout();
        window.location.hash = '#/login';
        if (typeof window.stopAddCamera === 'function') {
          window.stopAddCamera();
        }
      });
      logoutLi.appendChild(logoutBtn);
      nav.querySelector('ul').appendChild(logoutLi);
    }
  } else {
    // Show only login/register; hide stories, add, logout
    if (storiesLi) storiesLi.style.display = 'none';
    if (addLi) addLi.style.display = 'none';
    if (loginLi) loginLi.style.display = '';
    if (registerLi) registerLi.style.display = '';
    if (logoutLi) logoutLi.remove();
  }
}

// Re-check nav visibility on route changes
window.addEventListener('hashchange', updateNavVisibility);

