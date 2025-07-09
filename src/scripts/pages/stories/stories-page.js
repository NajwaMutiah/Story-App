import { getStoriesWithLocation, isAuthenticated } from '../../data/api';
import L from 'leaflet';

export default class StoriesPage {
  constructor() {
    this.stories = [];
    this.map = null;
  }

  async render() {
    if (!isAuthenticated()) {
      return `
        <section class="container">
          <div class="auth-required">
            <h1>Akses Terbatas</h1>
            <p>Anda perlu masuk untuk melihat halaman ini.</p>
            <a href="#/login" class="btn-primary">Masuk Sekarang</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="container">
        <div class="page-header">
          <h1>Semua Cerita</h1>
          <a href="#/add-story" class="btn-primary" role="button">
            <span aria-hidden="true">+</span> Tambah Cerita Baru
          </a>
        </div>
        
        <div class="stories-content">
          <div class="stories-list" id="stories-list" role="main" aria-label="Daftar cerita">
            <div class="loading" id="loading-stories">
              <div class="loader" role="status" aria-label="Memuat cerita..."></div>
              <p>Memuat cerita...</p>
            </div>
          </div>
          
          <div class="map-container">
            <h2>Peta Lokasi Cerita</h2>
            <div id="map" class="map" role="img" aria-label="Peta menunjukkan lokasi cerita-cerita"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (!isAuthenticated()) return;

    try {
      await this.loadStories();
      this.initializeMap();
      this.renderStories();
      this.addMapMarkers();
    } catch (error) {
      this.showError('Gagal memuat cerita. Silakan coba lagi.');
      console.error('Error loading stories:', error);
    }
  }

  async loadStories() {
    try {
      const response = await getStoriesWithLocation();
      this.stories = response.listStory || [];
    } catch (error) {
      throw new Error('Failed to load stories: ' + error.message);
    }
  }

  renderStories() {
    const storiesContainer = document.getElementById('stories-list');
    const loadingElement = document.getElementById('loading-stories');
    
    if (loadingElement) {
      loadingElement.remove();
    }

    if (this.stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <h3>Belum Ada Cerita</h3>
          <p>Jadilah yang pertama membagikan cerita!</p>
          <a href="#/add-story" class="btn-primary">Tambah Cerita Pertama</a>
        </div>
      `;
      return;
    }

    const storiesHTML = this.stories.map((story, index) => `
      <article class="story-card" tabindex="0" role="article" aria-labelledby="story-title-${index}">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="${story.description}" loading="lazy">
        </div>
        <div class="story-content">
          <h3 id="story-title-${index}">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <time datetime="${story.createdAt}" class="story-date">
              ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            ${story.lat && story.lon ? 
              `<span class="story-location" aria-label="Memiliki informasi lokasi">📍 Lokasi tersedia</span>` : 
              ''
            }
          </div>
        </div>
      </article>
    `).join('');

    storiesContainer.innerHTML = storiesHTML;
  }

  initializeMap() {
    // Initialize map
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = L.map('map').setView([-6.2088, 106.8456], 5);

    // Add tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  addMapMarkers() {
    if (!this.map) return;

    const storiesWithLocation = this.stories.filter(story => story.lat && story.lon);
    
    if (storiesWithLocation.length === 0) {
      // Show message if no stories have location
      const mapContainer = document.querySelector('.map-container');
      const noLocationMessage = document.createElement('p');
      noLocationMessage.className = 'no-location-message';
      noLocationMessage.textContent = 'Belum ada cerita dengan lokasi.';
      mapContainer.appendChild(noLocationMessage);
      return;
    }

    // Add markers for stories with location
    storiesWithLocation.forEach((story) => {
      const marker = L.marker([story.lat, story.lon]).addTo(this.map);
      
      // Create popup content
      const popupContent = `
        <div class="popup-content">
          <img src="${story.photoUrl}" alt="${story.description}" class="popup-image">
          <h4>${story.name}</h4>
          <p>${story.description}</p>
          <small>${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    // Fit map to show all markers
    if (storiesWithLocation.length > 0) {
      const group = new L.featureGroup(
        storiesWithLocation.map(story => L.marker([story.lat, story.lon]))
      );
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  showError(message) {
    const storiesContainer = document.getElementById('stories-list');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="error-state" role="alert">
          <h3>Oops! Terjadi Kesalahan</h3>
          <p>${message}</p>
          <button class="btn-primary" onclick="location.reload()">Coba Lagi</button>
        </div>
      `;
    }
  }
}