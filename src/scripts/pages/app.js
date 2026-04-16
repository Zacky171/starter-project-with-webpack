// Main App Presenter - MVP Pattern
import { initRouter } from '../routes/routes.js';
import { isLoggedIn, logout } from '../utils/index.js';
import { togglePushNotification } from '../push-utils.js';

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
  
  // Guard routes
  if (!isLoggedIn() && (window.location.hash === '#/add' || window.location.hash === '#/stories')) {
    window.location.hash = '#/login';
  }
}

function updateLogoutButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  
  const loginLi = nav.querySelector('a[href="#/login"]')?.parentElement;
  const registerLi = nav.querySelector('a[href="#/register"]')?.parentElement;
  let logoutLi = nav.querySelector('.logout-li');
  
  if (isLoggedIn()) {
    // Hide login/register, show logout
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

      // Add push toggle btn
      let pushLi = nav.querySelector('.push-li');
      if (!pushLi) {
        pushLi = document.createElement('li');
        pushLi.className = 'push-li';
        const pushBtn = document.createElement('a');
        pushBtn.href = '#';
        pushBtn.className = 'push-toggle btn btn-secondary';
        pushBtn.textContent = '🔔 Push';
        pushBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const isSubbed = localStorage.getItem('pushSubscribed') === 'true';
          const enabled = !isSubbed;
          await togglePushNotification(enabled);
          pushBtn.textContent = enabled ? '🔔 Push ON' : '🔔 Push OFF';
          localStorage.setItem('pushSubscribed', enabled);
        });
        pushLi.appendChild(pushBtn);
        nav.querySelector('ul').appendChild(pushLi);
      }
    }
  } else {
    // Show login/register, hide logout/push
    if (loginLi) loginLi.style.display = '';
    if (registerLi) registerLi.style.display = '';
    if (logoutLi) logoutLi.remove();
    const pushLi = nav.querySelector('.push-li');
    if (pushLi) pushLi.remove();
  }
}

// Re-check logout button on route changes
window.addEventListener('hashchange', updateLogoutButton);

