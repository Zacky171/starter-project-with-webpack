// Main App Presenter - MVP Pattern
import { initRouter } from '../routes/routes.js';
import { isLoggedIn, logout } from '../utils/auth.js';

export default function App() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runApp());
  } else {
    runApp();
  }
}

function runApp() {
  initRouter();
  updateNavAuth();
  
  // Guard routes - check current hash
  guardProtectedRoutes();
}

function guardProtectedRoutes() {
  const protectedHashes = ['#/add', '#/stories'];
  if (!isLoggedIn() && protectedHashes.includes(window.location.hash)) {
    window.location.hash = '#/login';
  }
}


function updateNavAuth() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  
  const storiesLi = nav.querySelector('a[href="#/stories"]')?.parentElement;
  const addLi = nav.querySelector('a[href="#/add"]')?.parentElement;
  const loginLi = nav.querySelector('a[href="#/login"]')?.parentElement;
  const registerLi = nav.querySelector('a[href="#/register"]')?.parentElement;
  const homeLi = nav.querySelector('a[href="#/"]')?.parentElement;
  let logoutLi = nav.querySelector('.logout-li');

  
  if (isLoggedIn()) {
    // Show Stories/Add, hide Home/login/register, show logout
    if (storiesLi) storiesLi.style.display = '';
    if (addLi) addLi.style.display = '';
    if (homeLi) homeLi.style.display = 'none';
    if (loginLi) loginLi.style.display = 'none';
    if (registerLi) registerLi.style.display = 'none';

    
    if (!logoutLi) {
      logoutLi = document.createElement('li');
      logoutLi.className = 'logout-li';
      const logoutBtn = document.createElement('a');
      logoutBtn.href = '#';
      logoutBtn.className = 'logout btn btn-secondary';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        logout();
        window.location.hash = '#/login';
      });
      logoutLi.appendChild(logoutBtn);
      nav.querySelector('ul').appendChild(logoutLi);
    }
  } else {
    // Show login/register/Home only, hide Stories/Add/Logout
    if (storiesLi) storiesLi.style.display = 'none';
    if (addLi) addLi.style.display = 'none';
    if (homeLi) homeLi.style.display = '';
    if (loginLi) loginLi.style.display = '';
    if (registerLi) registerLi.style.display = '';
    if (logoutLi) logoutLi.remove();
  }

}

// Re-check on route changes
window.addEventListener('hashchange', () => {
  updateNavAuth();
  guardProtectedRoutes();
});

