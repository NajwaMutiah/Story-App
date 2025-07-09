import { addStory, isAuthenticated } from '../../data/api';
import L from 'leaflet';
import CONFIG from '../../config';

export default class AddStoryPage {
  constructor() {
    this.map = null;
    this.selectedLocation = null;
    this.currentStream = null;
    this.selectedImage = null;
  }

  async render() {
    if (!isAuthenticated()) {
      return `
        <section class="container">
          <div class="auth-required">
            <h1>Akses Terbatas</h1>
            <p>Anda perlu masuk untuk menambahkan cerita.</p>
            <a href="#/login" class="btn-primary">Masuk Sekarang</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="container">
        <div class="page-header">
          <h1>Tambah Cerita Baru</h1>
          <a href="#/stories" class="btn-secondary">← Kembali ke Cerita</a>
        </div>
        
        <form id="add-story-form" class="story-form" novalidate>
          <div class="form-group">
            <label for="story-description">Deskripsi Cerita <span class="required" aria-label="wajib diisi">*</span></label>
            <textarea 
              id="story-description" 
              name="description" 
              required 
              placeholder="Ceritakan pengalaman menarik Anda..."
              aria-describedby="description-help"
              rows="4"
            ></textarea>
            <small id="description-help" class="form-help">Minimal 10 karakter</small>
            <div class="error-message" id="description-error" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="story-photo">Foto Cerita <span class="required" aria-label="wajib diisi">*</span></label>
            <div class="photo-input-container">
              <div class="camera-controls">
                <button type="button" id="open-camera" class="btn-camera" aria-describedby="camera-help">
                  📷 Buka Kamera
                </button>
                <button type="button" id="choose-file" class="btn-file" aria-describedby="file-help">
                  📁 Pilih File
                </button>
                <input type="file" id="story-photo" name="photo" accept="image/*" style="display: none;" required>
              </div>
              <small id="camera-help" class="form-help">Gunakan kamera untuk mengambil foto langsung</small>
              <small id="file-help" class="form-help">Atau pilih file dari perangkat Anda (JPG, PNG, max 5MB)</small>
              
              <div id="camera-container" class="camera-container" style="display: none;">
                <video id="camera-video" autoplay playsinline aria-label="Preview kamera"></video>
                <div class="camera-overlay">
                  <button type="button" id="capture-photo" class="btn-capture" aria-label="Ambil foto">📸</button>
                  <button type="button" id="close-camera" class="btn-close" aria-label="Tutup kamera">✕</button>
                </div>
              </div>
              
              <div id="photo-preview" class="photo-preview" style="display: none;">
                <img id="preview-image" src="" alt="Preview foto yang dipilih">
                <button type="button" id="remove-photo" class="btn-remove" aria-label="Hapus foto">✕</button>
              </div>
            </div>
            <div class="error-message" id="photo-error" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="location-map">Lokasi Cerita (Opsional)</label>
            <p class="form-help">Klik pada peta untuk menandai lokasi cerita Anda</p>
            <div id="location-map" class="location-map" role="img" aria-label="Peta untuk memilih lokasi cerita"></div>
            <div id="selected-location" class="selected-location" style="display: none;">
              <p>📍 Lokasi dipilih: <span id="location-coords"></span></p>
              <button type="button" id="clear-location" class="btn-link">Hapus Lokasi</button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" id="cancel-story" class="btn-secondary">Batal</button>
            <button type="submit" id="submit-story" class="btn-primary">
              <span class="btn-text">Bagikan Cerita</span>
              <div class="btn-loader" style="display: none;" role="status" aria-label="Sedang memproses..."></div>
            </button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    if (!isAuthenticated()) return;

    this.initializeMap();
    this.setupCameraControls();
    this.setupFormHandlers();
  }

  initializeMap() {
    const mapElement = document.getElementById('location-map');
    if (!mapElement) return;

    // Initialize map
    this.map = L.map('location-map').setView([CONFIG.DEFAULT_LAT, CONFIG.DEFAULT_LNG], 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add click handler for location selection
    this.map.on('click', (e) => {
      this.selectLocation(e.latlng);
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.map.setView([lat, lng], 13);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location
        }
      );
    }
  }

  selectLocation(latlng) {
    // Remove existing marker
    if (this.selectedLocationMarker) {
      this.map.removeLayer(this.selectedLocationMarker);
    }

    // Add new marker
    this.selectedLocationMarker = L.marker([latlng.lat, latlng.lng]).addTo(this.map);
    
    // Store selected location
    this.selectedLocation = {
      lat: latlng.lat,
      lng: latlng.lng
    };

    // Update UI
    const selectedLocationDiv = document.getElementById('selected-location');
    const locationCoordsSpan = document.getElementById('location-coords');
    
    if (selectedLocationDiv && locationCoordsSpan) {
      locationCoordsSpan.textContent = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      selectedLocationDiv.style.display = 'block';
    }
  }

  setupCameraControls() {
    const openCameraBtn = document.getElementById('open-camera');
    const closeCameraBtn = document.getElementById('close-camera');
    const captureBtn = document.getElementById('capture-photo');
    const chooseFileBtn = document.getElementById('choose-file');
    const fileInput = document.getElementById('story-photo');
    const removePhotoBtn = document.getElementById('remove-photo');
    const clearLocationBtn = document.getElementById('clear-location');

    // Open camera
    openCameraBtn?.addEventListener('click', async () => {
      try {
        await this.openCamera();
      } catch (error) {
        this.showError('photo-error', 'Gagal membuka kamera: ' + error.message);
      }
    });

    // Close camera
    closeCameraBtn?.addEventListener('click', () => {
      this.closeCamera();
    });

    // Capture photo
    captureBtn?.addEventListener('click', () => {
      this.capturePhoto();
    });

    // Choose file
    chooseFileBtn?.addEventListener('click', () => {
      fileInput?.click();
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });

    // Remove photo
    removePhotoBtn?.addEventListener('click', () => {
      this.removePhoto();
    });

    // Clear location
    clearLocationBtn?.addEventListener('click', () => {
      this.clearLocation();
    });
  }

  async openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      this.currentStream = stream;
      const video = document.getElementById('camera-video');
      const cameraContainer = document.getElementById('camera-container');
      
      if (video && cameraContainer) {
        video.srcObject = stream;
        cameraContainer.style.display = 'block';
        
        // Hide other controls
        document.getElementById('choose-file').style.display = 'none';
        document.getElementById('open-camera').style.display = 'none';
      }
    } catch (error) {
      throw new Error('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
    }
  }

  closeCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    
    const cameraContainer = document.getElementById('camera-container');
    const video = document.getElementById('camera-video');
    
    if (cameraContainer) cameraContainer.style.display = 'none';
    if (video) video.srcObject = null;
    
    // Show other controls
    document.getElementById('choose-file').style.display = 'inline-block';
    document.getElementById('open-camera').style.display = 'inline-block';
  }

  capturePhoto() {
    const video = document.getElementById('camera-video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      this.handleFileSelect(file);
      this.closeCamera();
    }, 'image/jpeg', 0.8);
  }

  handleFileSelect(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
      this.showError('photo-error', 'File harus berupa gambar');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.showError('photo-error', 'Ukuran file maksimal 5MB');
      return;
    }

    this.selectedImage = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewContainer = document.getElementById('photo-preview');
      const previewImage = document.getElementById('preview-image');
      
      if (previewContainer && previewImage) {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
    
    // Clear error
    this.clearError('photo-error');
  }

  removePhoto() {
    this.selectedImage = null;
    
    const previewContainer = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');
    const fileInput = document.getElementById('story-photo');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewImage) previewImage.src = '';
    if (fileInput) fileInput.value = '';
  }

  clearLocation() {
    this.selectedLocation = null;
    
    if (this.selectedLocationMarker) {
      this.map.removeLayer(this.selectedLocationMarker);
      this.selectedLocationMarker = null;
    }
    
    const selectedLocationDiv = document.getElementById('selected-location');
    if (selectedLocationDiv) {
      selectedLocationDiv.style.display = 'none';
    }
  }

  setupFormHandlers() {
    const form = document.getElementById('add-story-form');
    const cancelBtn = document.getElementById('cancel-story');
    
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
    
    cancelBtn?.addEventListener('click', () => {
      if (confirm('Yakin ingin membatalkan? Data yang sudah diisi akan hilang.')) {
        window.location.hash = '#/stories';
      }
    });
  }

  async handleSubmit() {
    if (!this.validateForm()) return;
    
    const submitBtn = document.getElementById('submit-story');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    
    // Show loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';
    
    try {
      const description = document.getElementById('story-description').value.trim();
      
      const storyData = {
        description,
        photo: this.selectedImage,
      };
      
      if (this.selectedLocation) {
        storyData.lat = this.selectedLocation.lat;
        storyData.lon = this.selectedLocation.lng;
      }
      
      await addStory(storyData);
      
      // Success - redirect to stories page
      alert('Cerita berhasil ditambahkan!');
      
      // Clean up camera stream if still active
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
      }
      
      window.location.hash = '#/stories';
      
    } catch (error) {
      console.error('Error adding story:', error);
      alert('Gagal menambahkan cerita: ' + error.message);
    } finally {
      // Reset loading state
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  }

  validateForm() {
    let isValid = true;
    
    // Validate description
    const description = document.getElementById('story-description').value.trim();
    if (!description || description.length < 10) {
      this.showError('description-error', 'Deskripsi minimal 10 karakter');
      isValid = false;
    } else {
      this.clearError('description-error');
    }
    
    // Validate photo
    if (!this.selectedImage) {
      this.showError('photo-error', 'Foto wajib dipilih');
      isValid = false;
    } else {
      this.clearError('photo-error');
    }
    
    return isValid;
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
}