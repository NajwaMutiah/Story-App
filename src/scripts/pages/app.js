import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isAuthenticated, logoutUser } from '../data/api';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupAuthLink();
    this.#setupViewTransitions();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', isOpen.toString());
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.#navigationDrawer.classList.contains('open')) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
        this.#drawerButton.focus();
      }
    });
  }

  #setupAuthLink() {
    const authLink = document.getElementById('auth-link');
    if (authLink) {
      this.#updateAuthLink();
      
      // Update auth link when authentication state changes
      window.addEventListener('storage', () => {
        this.#updateAuthLink();
      });
    }
  }

  #updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    if (isAuthenticated()) {
      authLink.textContent = 'Keluar';
      authLink.href = '#/logout';
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Yakin ingin keluar?')) {
          logoutUser();
          this.#updateAuthLink();
          window.location.hash = '#/';
        }
      });
    } else {
      authLink.textContent = 'Masuk';
      authLink.href = '#/login';
      // Remove logout event listener by cloning the node
      const newAuthLink = authLink.cloneNode(true);
      authLink.parentNode.replaceChild(newAuthLink, authLink);
    }
  }

  #setupViewTransitions() {
    // Setup View Transition API for navigation links
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#/"]');
      if (!link || !document.startViewTransition) return;

      event.preventDefault();
      
      document.startViewTransition(() => {
        window.location.hash = link.getAttribute('href');
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = `
        <section class="container">
          <div class="error-state">
            <h1>404 - Halaman Tidak Ditemukan</h1>
            <p>Halaman yang Anda cari tidak ada.</p>
            <a href="#/" class="btn-primary">Kembali ke Beranda</a>
          </div>
        </section>
      `;
      return;
    }

    try {
      // Show loading state for better UX
      this.#content.innerHTML = `
        <div class="loading">
          <div class="loader" role="status" aria-label="Memuat halaman..."></div>
          <p>Memuat halaman...</p>
        </div>
      `;

      // Render page content
      const content = await page.render();
      this.#content.innerHTML = content;
      
      // Execute post-render logic
      await page.afterRender();
      
      // Update auth link after page render
      this.#updateAuthLink();
      
      // Set focus to main content for screen readers
      const mainHeading = this.#content.querySelector('h1');
      if (mainHeading) {
        mainHeading.focus();
        mainHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `
        <section class="container">
          <div class="error-state" role="alert">
            <h1>Oops! Terjadi Kesalahan</h1>
            <p>Gagal memuat halaman. Silakan coba lagi.</p>
            <button class="btn-primary" onclick="location.reload()">Muat Ulang</button>
          </div>
        </section>
      `;
    }
  }
}

export default App;