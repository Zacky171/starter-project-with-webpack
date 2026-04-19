import { fadeTransition } from '../../utils/transition.js';
import { login } from '../../utils/auth.js';

function renderLoginForm() {
  const content = document.createElement('section');
  content.classList.add('card', 'auth-container');
  content.innerHTML = `
    <h1>Selamat Datang Kembali</h1>
    <p class="subtitle">Masuk untuk melanjutkan petualangan cerita Anda</p>
    <form id="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" autocomplete="email" placeholder="Masukkan email Anda" required aria-describedby="email-error">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" autocomplete="current-password" placeholder="Masukkan password" required aria-describedby="pass-error">
      </div>
      <div id="login-error" class="error" role="alert" aria-live="polite"></div>
      <button type="submit" class="btn btn-primary large-btn">Masuk Sekarang</button>
    </form>
    <div class="auth-footer">
      <p>Belum punya akun? <a href="#/register" data-nav class="link-btn">Buat akun baru</a></p>
    </div>
  `;
  
  const form = content.querySelector('#login-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = content.querySelector('#email').value;
    const password = content.querySelector('#password').value;
    const errorEl = content.querySelector('#login-error');
    
    errorEl.style.display = 'none';
    
    try {
      await login(email, password);
      window.location.hash = '#/stories';
    } catch {
      errorEl.textContent = 'Email atau password salah. Coba lagi.';
      errorEl.style.display = 'block';
    }
  });
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);
  setTimeout(() => content.classList.add('active'), 100);
}

export default renderLoginForm;

