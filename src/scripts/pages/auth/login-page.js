import { loginUser, registerUser, isAuthenticated } from '../../data/api';

export default class LoginPage {
  async render() {
    if (isAuthenticated()) {
      window.location.hash = '#/stories';
      return '';
    }

    return `
      <section class="container">
        <div class="auth-container">
          <div class="auth-tabs">
            <button id="login-tab" class="tab-button active" role="tab" aria-selected="true" aria-controls="login-form">Masuk</button>
            <button id="register-tab" class="tab-button" role="tab" aria-selected="false" aria-controls="register-form">Daftar</button>
          </div>
          
          <div id="login-form" class="auth-form active" role="tabpanel" aria-labelledby="login-tab">
            <h1>Masuk ke Akun Anda</h1>
            <form id="login-form-element" novalidate>
              <div class="form-group">
                <label for="login-email">Email <span class="required" aria-label="wajib diisi">*</span></label>
                <input 
                  type="email" 
                  id="login-email" 
                  name="email" 
                  required 
                  placeholder="contoh@email.com"
                  aria-describedby="login-email-help"
                  autocomplete="email"
                >
                <small id="login-email-help" class="form-help">Masukkan alamat email yang valid</small>
                <div class="error-message" id="login-email-error" role="alert"></div>
              </div>
              
              <div class="form-group">
                <label for="login-password">Password <span class="required" aria-label="wajib diisi">*</span></label>
                <input 
                  type="password" 
                  id="login-password" 
                  name="password" 
                  required 
                  placeholder="Masukkan password"
                  aria-describedby="login-password-help"
                  autocomplete="current-password"
                >
                <small id="login-password-help" class="form-help">Password minimal 8 karakter</small>
                <div class="error-message" id="login-password-error" role="alert"></div>
              </div>
              
              <button type="submit" class="btn-primary btn-full">
                <span class="btn-text">Masuk</span>
                <div class="btn-loader" style="display: none;" role="status" aria-label="Sedang memproses..."></div>
              </button>
            </form>
          </div>
          
          <div id="register-form" class="auth-form" role="tabpanel" aria-labelledby="register-tab" style="display: none;">
            <h1>Buat Akun Baru</h1>
            <form id="register-form-element" novalidate>
              <div class="form-group">
                <label for="register-name">Nama Lengkap <span class="required" aria-label="wajib diisi">*</span></label>
                <input 
                  type="text" 
                  id="register-name" 
                  name="name" 
                  required 
                  placeholder="Nama Lengkap Anda"
                  aria-describedby="register-name-help"
                  autocomplete="name"
                >
                <small id="register-name-help" class="form-help">Nama minimal 3 karakter</small>
                <div class="error-message" id="register-name-error" role="alert"></div>
              </div>
              
              <div class="form-group">
                <label for="register-email">Email <span class="required" aria-label="wajib diisi">*</span></label>
                <input 
                  type="email" 
                  id="register-email" 
                  name="email" 
                  required 
                  placeholder="contoh@email.com"
                  aria-describedby="register-email-help"
                  autocomplete="email"
                >
                <small id="register-email-help" class="form-help">Gunakan email yang valid dan belum terdaftar</small>
                <div class="error-message" id="register-email-error" role="alert"></div>
              </div>
              
              <div class="form-group">
                <label for="register-password">Password <span class="required" aria-label="wajib diisi">*</span></label>
                <input 
                  type="password" 
                  id="register-password" 
                  name="password" 
                  required 
                  placeholder="Buat password yang kuat"
                  aria-describedby="register-password-help"
                  autocomplete="new-password"
                >
                <small id="register-password-help" class="form-help">Password minimal 8 karakter, kombinasi huruf dan angka</small>
                <div class="error-message" id="register-password-error" role="alert"></div>
              </div>
              
              <button type="submit" class="btn-primary btn-full">
                <span class="btn-text">Daftar</span>
                <div class="btn-loader" style="display: none;" role="status" aria-label="Sedang memproses..."></div>
              </button>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupTabs();
    this.setupForms();
  }

  setupTabs() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginTab?.addEventListener('click', () => {
      this.switchTab(loginTab, registerTab, loginForm, registerForm);
    });

    registerTab?.addEventListener('click', () => {
      this.switchTab(registerTab, loginTab, registerForm, loginForm);
    });
  }

  switchTab(activeTab, inactiveTab, activeForm, inactiveForm) {
    // Update tab states
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    inactiveTab.classList.remove('active');
    inactiveTab.setAttribute('aria-selected', 'false');

    // Update form visibility
    activeForm.style.display = 'block';
    activeForm.classList.add('active');
    inactiveForm.style.display = 'none';
    inactiveForm.classList.remove('active');

    // Clear any existing errors
    this.clearAllErrors();
  }

  setupForms() {
    const loginForm = document.getElementById('login-form-element');
    const registerForm = document.getElementById('register-form-element');

    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegister();
    });
  }

  async handleLogin() {
    if (!this.validateLoginForm()) return;

    const submitBtn = document.querySelector('#login-form-element button[type="submit"]');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');

    // Show loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';

    try {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      await loginUser({ email, password });

      // Success - redirect to stories page
      alert('Login berhasil! Selamat datang.');
      window.location.hash = '#/stories';

    } catch (error) {
      console.error('Login error:', error);
      this.showError('login-email-error', 'Login gagal: ' + error.message);
    } finally {
      // Reset loading state
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  }

  async handleRegister() {
    if (!this.validateRegisterForm()) return;

    const submitBtn = document.querySelector('#register-form-element button[type="submit"]');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');

    // Show loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';

    try {
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;

      await registerUser({ name, email, password });

      // Success - automatically login
      alert('Registrasi berhasil! Silakan login dengan akun Anda.');
      
      // Switch to login tab and fill email
      const loginTab = document.getElementById('login-tab');
      const registerTab = document.getElementById('register-tab');
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      
      this.switchTab(loginTab, registerTab, loginForm, registerForm);
      
      // Fill email in login form
      document.getElementById('login-email').value = email;

    } catch (error) {
      console.error('Register error:', error);
      this.showError('register-email-error', 'Registrasi gagal: ' + error.message);
    } finally {
      // Reset loading state
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  }

  validateLoginForm() {
    let isValid = true;

    // Validate email
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
      this.showError('login-email-error', 'Email wajib diisi');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showError('login-email-error', 'Format email tidak valid');
      isValid = false;
    } else {
      this.clearError('login-email-error');
    }

    // Validate password
    const password = document.getElementById('login-password').value;
    if (!password) {
      this.showError('login-password-error', 'Password wajib diisi');
      isValid = false;
    } else if (password.length < 8) {
      this.showError('login-password-error', 'Password minimal 8 karakter');
      isValid = false;
    } else {
      this.clearError('login-password-error');
    }

    return isValid;
  }

  validateRegisterForm() {
    let isValid = true;

    // Validate name
    const name = document.getElementById('register-name').value.trim();
    if (!name) {
      this.showError('register-name-error', 'Nama wajib diisi');
      isValid = false;
    } else if (name.length < 3) {
      this.showError('register-name-error', 'Nama minimal 3 karakter');
      isValid = false;
    } else {
      this.clearError('register-name-error');
    }

    // Validate email
    const email = document.getElementById('register-email').value.trim();
    if (!email) {
      this.showError('register-email-error', 'Email wajib diisi');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showError('register-email-error', 'Format email tidak valid');
      isValid = false;
    } else {
      this.clearError('register-email-error');
    }

    // Validate password
    const password = document.getElementById('register-password').value;
    if (!password) {
      this.showError('register-password-error', 'Password wajib diisi');
      isValid = false;
    } else if (password.length < 8) {
      this.showError('register-password-error', 'Password minimal 8 karakter');
      isValid = false;
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      this.showError('register-password-error', 'Password harus kombinasi huruf dan angka');
      isValid = false;
    } else {
      this.clearError('register-password-error');
    }

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
      element.textContent = '';
      element.style.display = 'none';
    });
  }
}