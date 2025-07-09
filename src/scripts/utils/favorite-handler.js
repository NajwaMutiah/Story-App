class FavoriteHandler {
  static async createFavoriteButton(story, container) {
    const isFavorite = await this.isFavorite(story.id);
    
    const button = document.createElement('button');
    button.id = 'favorite-btn';
    button.className = `favorite-btn ${isFavorite ? 'favorited' : ''}`;
    button.setAttribute('aria-label', isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit');
    button.innerHTML = `
      <span class="favorite-icon">${isFavorite ? '❤️' : '🤍'}</span>
      <span class="favorite-text">${isFavorite ? 'Favorit' : 'Favorit'}</span>
    `;

    button.addEventListener('click', () => this.toggleFavorite(story, button));
    
    if (container) {
      container.appendChild(button);
    }
    
    return button;
  }

  static async toggleFavorite(story, button) {
    try {
      const isFavorite = await this.isFavorite(story.id);
      
      if (isFavorite) {
        await this.removeFavorite(story.id);
        this.updateButton(button, false);
        this.showToast('💔 Dihapus dari favorit');
      } else {
        await this.addFavorite(story);
        this.updateButton(button, true);
        this.showToast('❤️ Ditambahkan ke favorit');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      this.showToast('❌ Gagal memproses favorit', 'error');
    }
  }

  static async addFavorite(story) {
    const favoriteData = {
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      dateAdded: new Date().toISOString()
    };

    return await window.FavoriteDB.add(favoriteData);
  }

  static async removeFavorite(storyId) {
    return await window.FavoriteDB.delete(storyId);
  }

  static async isFavorite(storyId) {
    try {
      const favorites = await window.FavoriteDB.getAll();
      return favorites.some(fav => fav.id === storyId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  static updateButton(button, isFavorite) {
    const icon = button.querySelector('.favorite-icon');
    const text = button.querySelector('.favorite-text');
    
    if (isFavorite) {
      button.classList.add('favorited');
      icon.textContent = '❤️';
      button.setAttribute('aria-label', 'Hapus dari favorit');
    } else {
      button.classList.remove('favorited');
      icon.textContent = '🤍';
      button.setAttribute('aria-label', 'Tambah ke favorit');
    }

    // Add animation
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
  }

  static showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  }

  static async getFavoriteCount() {
    try {
      const favorites = await window.FavoriteDB.getAll();
      return favorites.length;
    } catch (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }
  }

  // Add this method to any story detail page
  static async initializeFavoriteButton(story) {
    const container = document.querySelector('.story-actions') || 
                     document.querySelector('.story-detail') || 
                     document.querySelector('.container');
    
    if (container && story) {
      await this.createFavoriteButton(story, container);
    }
  }
}

// Export untuk digunakan di halaman lain
window.FavoriteHandler = FavoriteHandler;
export default FavoriteHandler;