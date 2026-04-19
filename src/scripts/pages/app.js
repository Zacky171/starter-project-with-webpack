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
  
  updateLogoutButton();
  
  // Guard routes - strengthened
  guardStoriesAccess();
}

function guardStoriesAccess() {
  const protectedPaths = ['#/add', '#/stories'];
  if (!isLoggedIn() && protectedPaths.some(path => window.location.hash === path)) {
    window.location.hash = '#/login';
    return;
  }
}

function updateLogoutButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const logoutLi = nav.querySelector('.logout-li') || document.createElement('li');
  const authItems = Array.from(nav.querySelectorAll('.auth-item'));
  const storyItems = Array.from(nav.querySelectorAll('.story-item'));

  function ensureLogoutHandler(li) {
    if (!li) return;
    const newAnchor = document.createElement('a');
    newAnchor.href = '#/login';
    newAnchor.className = 'logout btn btn-secondary logout';
    newAnchor.textContent = 'Logout';
    newAnchor.addEventListener('click', e => {
      e.preventDefault();
      if (!confirm('Yakin ingin logout?')) return;
      logout();
      window.location.hash = '#/login';
      if (typeof window.stopAddCamera === 'function') {
        window.stopAddCamera();
      }
      updateLogoutButton();
    });
    const existing = li.querySelector('a.logout');
    if (existing) {
      li.replaceChild(newAnchor, existing);
    } else {
      li.appendChild(newAnchor);
    }
  }

  if (isLoggedIn()) {
    // Hide all auth-related items and show story items
    authItems.forEach(item => item.style.display = 'none');
    storyItems.forEach(item => item.style.display = '');

    // Ensure logout element exists and has handler
    if (!logoutLi.parentNode) {
      logoutLi.className = 'logout-li';
      nav.querySelector('ul').appendChild(logoutLi);
    }
    ensureLogoutHandler(logoutLi);
    logoutLi.style.display = '';
  } else {
    // Show auth items, hide story items and logout
    authItems.forEach(item => item.style.display = '');
    storyItems.forEach(item => item.style.display = 'none');
    if (logoutLi) logoutLi.style.display = 'none';
  }
}

// Re-check logout button on route changes
window.addEventListener('hashchange', updateLogoutButton);

