// PERBAIKAN: Import CSS dengan path yang benar sesuai struktur starter project
import '../styles/styles.css';
import './utils/sw-register.js';
import './utils/push-notification.js';
import './data/indexeddb.js';
import './utils/favorite-handler.js';

// Import Leaflet CSS via JavaScript (sebagai fallback)
const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
if (!document.querySelector('link[href*="leaflet"]')) {
  document.head.appendChild(leafletCSS);
}

// PERBAIKAN: Import dengan path yang benar
import App from './pages/app.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Story App initializing...'); // Debug log
  
  try {
    const app = new App({
      content: document.querySelector('#main-content'),
      drawerButton: document.querySelector('#drawer-button'),
      navigationDrawer: document.querySelector('#navigation-drawer'),
    });
    
    console.log('📱 App instance created'); // Debug log
    
    await app.renderPage();
    console.log('🎨 Initial page rendered'); // Debug log

    window.addEventListener('hashchange', async () => {
      console.log('🔄 Route changed to:', window.location.hash); // Debug log
      await app.renderPage();
    });
    
    console.log('✅ Story App initialized successfully'); // Debug log
    
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    
    // Fallback error display
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          <h1>⚠️ Error Loading App</h1>
          <p>Terjadi kesalahan saat memuat aplikasi:</p>
          <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 20px 0;">${error.message}</pre>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🔄 Muat Ulang
          </button>
        </div>
      `;
    }
  }
});