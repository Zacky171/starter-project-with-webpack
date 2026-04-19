import { fadeTransition } from '../../utils/transition.js';
import { register } from '../../utils/auth.js';

function renderRegisterForm() {
  const content = document.createElement('section');
  content.classList.add('card', 'auth-container');
  content.innerHTML = `
    <h1>Daftar Akun Baru</h1>
    <p class="subtitle">Buat akun untuk mulai berbagi cerita dengan peta</p>
    <form id="register-form">
      <div class="form-group">
        <label for="reg-name">Nama Lengkap</label>
        <input type="text" id="reg-name" autocomplete="name" placeholder="Masukkan nama lengkap Anda" required>
      </div>
      <div class="form-group">
        <label for="reg-email">Email</label>
        <input type="email" id="reg-email" autocomplete="email" placeholder="example@email.com" required>
      </div>
      <div class="form-group">
        <label for="reg-password">Password</label>
        <input type="password" id="reg-password" autocomplete="new-password" placeholder="Buat password (min 6 karakter)" minlength="6" required>
      </div>
      <div id="reg-error" class="error" role="alert"></div>
      <button type="submit" class="btn btn-primary large-btn">Buat Akun Saya</button>
    </form>
    <div class="auth-footer">
      <p>Sudah memiliki akun? <a href="#/login" data-nav class="link-btn">Masuk sekarang</a></p>
    </div>
  `;
  
  const form = content.querySelector('#register-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = content.querySelector('#reg-name').value;
    const email = content.querySelector('#reg-email').value;
    const password = content.querySelector('#reg-password').value;
    const errorEl = content.querySelector('#reg-error');
    
    errorEl.style.display = 'none';
    
    if (password.length < 6) {
      errorEl.textContent = 'Password minimal 6 karakter';
      errorEl.style.display = 'block';
      return;
    }
    
    try {
      await register(email, password, name);
      window.location.hash = '#/stories';
    } catch {
      errorEl.textContent = 'Registrasi gagal. Email mungkin sudah digunakan.';
      errorEl.style.display = 'block';
    }
  });
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(content);
  setTimeout(() => content.classList.add('active'), 100);
}

export default renderRegisterForm;

