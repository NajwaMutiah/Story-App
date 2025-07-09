class FavoritesPage {
  static async render() {
    return `
      <section class="container">
        <div class="page-header">
          <h1 tabindex="0">📖 Cerita Favorit</h1>
          <p>Kumpulan cerita yang telah Anda simpan</p>
        </div>
        
        <div id="favorites-container" class="favorites-container">
          <div class="loading" id="favorites-loading">
            <div class="loader" role="status" aria-label="Memuat favorit..."></div>
            <p>Memuat cerita favorit...</p>
          </div>
        </div>
      </section>
    `;
  }

  static async afterRender() {
    try {
      await this.loadFavorites();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.showError();
    }
  }

  static async loadFavorites() {
    const loadingElement = document.getElementById('favorites-loading');
    const container = document.getElementById('favorites-container');

    try {
      const favorites = await window.FavoriteDB.getAll();
      
      if (loadingElement) {
        loadingElement.remove();
      }

      if (favorites.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">💝</div>
            <h2>Belum Ada Cerita Favorit</h2>
            <p>Mulai menjelajahi cerita dan simpan yang menarik untuk dibaca nanti!</p>
            <a href="#/stories" class="btn-primary">
              <span>📚</span> Jelajahi Cerita
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="favorites-header">
          <h2>💫 ${favorites.length} Cerita Tersimpan</h2>
          <button id="clear-all-btn" class="btn-secondary" ${favorites.length === 0 ? 'disabled' : ''}>
            🗑️ Hapus Semua
          </button>
        </div>
        <div class="favorites-grid">
          ${favorites.map(story => this.createFavoriteCard(story)).join('')}
        </div>
      `;

    } catch (error) {
      console.error('Error loading favorites:', error);
      this.showError();
    }
  }

  static createFavoriteCard(story) {
    const addedDate = new Date(story.dateAdded).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <article class="favorite-card" data-story-id="${story.id}">
        <div class="favorite-card-header">
          <h3 class="favorite-title">${story.name || 'Cerita Tanpa Judul'}</h3>
          <button class="remove-favorite-btn" 
                  data-story-id="${story.id}" 
                  aria-label="Hapus ${story.name || 'cerita'} dari favorit"
                  title="Hapus dari favorit">
            <span class="remove-icon">❌</span>
          </button>
        </div>
        
        <div class="favorite-content">
          <p class="favorite-description">
            ${story.description ? story.description.substring(0, 150) + '...' : 'Tidak ada deskripsi'}
          </p>
          
          <div class="favorite-meta">
            <span class="favorite-date">
              <span class="meta-icon">📅</span>
              Disimpan: ${addedDate}
            </span>
            ${story.createdAt ? `
              <span class="story-date">
                <span class="meta-icon">✍️</span>
                Dibuat: ${new Date(story.createdAt).toLocaleDateString('id-ID')}
              </span>
            ` : ''}
          </div>
        </div>

        <div class="favorite-actions">
          <a href="#/stories/${story.id}" class="btn-primary btn-sm">
            <span>👁️</span> Lihat Detail
          </a>
          <button class="btn-secondary btn-sm share-story-btn" 
                  data-story-id="${story.id}"
                  data-story-name="${story.name || 'Cerita'}">
            <span>📤</span> Bagikan
          </button>
        </div>
      </article>
    `;
  }

  static setupEventListeners() {
    // Remove individual favorite
    document.addEventListener('click', async (event) => {
      if (event.target.closest('.remove-favorite-btn')) {
        const button = event.target.closest('.remove-favorite-btn');
        const storyId = button.getAttribute('data-story-id');
        await this.removeFavorite(storyId);
      }
    });

    // Clear all favorites
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearAllFavorites());
    }

    // Share story
    document.addEventListener('click', (event) => {
      if (event.target.closest('.share-story-btn')) {
        const button = event.target.closest('.share-story-btn');
        const storyId = button.getAttribute('data-story-id');
        const storyName = button.getAttribute('data-story-name');
        this.shareStory(storyId, storyName);
      }
    });
  }

  static async removeFavorite(storyId) {
    if (!confirm('Yakin ingin menghapus cerita ini dari favorit?')) {
      return;
    }

    try {
      await window.FavoriteDB.delete(storyId);
      
      // Remove card with animation
      const card = document.querySelector(`[data-story-id="${storyId}"]`);
      if (card) {
        card.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
          card.remove();
          this.updateFavoritesCount();
        }, 300);
      }

      // Show success message
      this.showToast('✅ Cerita berhasil dihapus dari favorit');

    } catch (error) {
      console.error('Error removing favorite:', error);
      this.showToast('❌ Gagal menghapus cerita', 'error');
    }
  }

  static async clearAllFavorites() {
    if (!confirm('Yakin ingin menghapus SEMUA cerita favorit? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const favorites = await window.FavoriteDB.getAll();
      
      for (const favorite of favorites) {
        await window.FavoriteDB.delete(favorite.id);
      }

      this.showToast('✅ Semua cerita favorit berhasil dihapus');
      await this.loadFavorites();

    } catch (error) {
      console.error('Error clearing favorites:', error);
      this.showToast('❌ Gagal menghapus cerita favorit', 'error');
    }
  }

  static async updateFavoritesCount() {
    const favorites = await window.FavoriteDB.getAll();
    const header = document.querySelector('.favorites-header h2');
    if (header) {
      header.textContent = `💫 ${favorites.length} Cerita Tersimpan`;
    }

    // If no favorites left, show empty state
    if (favorites.length === 0) {
      const container = document.getElementById('favorites-container');
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💝</div>
          <h2>Belum Ada Cerita Favorit</h2>
          <p>Mulai menjelajahi cerita dan simpan yang menarik untuk dibaca nanti!</p>
          <a href="#/stories" class="btn-primary">
            <span>📚</span> Jelajahi Cerita
          </a>
        </div>
      `;
    }
  }

  static shareStory(storyId, storyName) {
    const url = `${window.location.origin}#/stories/${storyId}`;
    
    if (navigator.share) {
      navigator.share({
        title: storyName,
        text: `Baca cerita menarik: ${storyName}`,
        url: url
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('🔗 Link cerita berhasil disalin!');
      }).catch(() => {
        this.showToast('❌ Gagal menyalin link', 'error');
      });
    }
  }

  static showError() {
    const container = document.getElementById('favorites-container');
    container.innerHTML = `
      <div class="error-state" role="alert">
        <div class="error-icon">⚠️</div>
        <h2>Gagal Memuat Favorit</h2>
        <p>Terjadi kesalahan saat memuat cerita favorit Anda.</p>
        <button class="btn-primary" onclick="location.reload()">
          <span>🔄</span> Coba Lagi
        </button>
      </div>
    `;
  }

  static showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

export default FavoritesPage;