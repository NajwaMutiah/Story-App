import { isAuthenticated } from '../../data/api';

export default class HomePage {
  async render() {
    const isLoggedIn = isAuthenticated();
    
    return `
      <section class="hero container">
        <div class="hero-content">
          <h1>Story App</h1>
          <p>Bagikan cerita menarik Anda dengan dunia</p>
          ${isLoggedIn ? 
            '<a href="#/stories" class="cta-button" role="button">Lihat Semua Cerita</a>' :
            '<a href="#/login" class="cta-button" role="button">Masuk untuk Melihat Cerita</a>'
          }
        </div>
        <div class="hero-image">
          <img src="/images/hero-story.jpg" alt="Ilustrasi berbagi cerita" loading="lazy">
        </div>
      </section>
      
      <section class="features container">
        <h2>Fitur Unggulan</h2>
        <div class="features-grid">
          <article class="feature-card">
            <img src="/images/feature-camera.jpg" alt="Fitur kamera untuk mengambil foto" loading="lazy">
            <h3>Foto dengan Kamera</h3>
            <p>Ambil foto langsung dengan kamera perangkat Anda</p>
          </article>
          <article class="feature-card">
            <img src="/images/feature-location.jpg" alt="Fitur lokasi untuk menandai tempat" loading="lazy">
            <h3>Tandai Lokasi</h3>
            <p>Tambahkan lokasi ke cerita Anda dengan peta interaktif</p>
          </article>
          <article class="feature-card">
            <img src="/images/feature-share.jpg" alt="Fitur berbagi cerita dengan orang lain" loading="lazy">
            <h3>Bagikan Cerita</h3>
            <p>Bagikan momen menarik Anda dengan komunitas</p>
          </article>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add smooth scrolling for CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        if (!document.startViewTransition) return;
        
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.hash = ctaButton.getAttribute('href');
        });
      });
    }
  }
}