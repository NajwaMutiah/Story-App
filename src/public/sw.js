const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/scripts/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New story available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };
  event.waitUntil(self.registration.showNotification('Story App', options));
});

// Tambahan untuk memenuhi kriteria submission
// 1. API Cache untuk data API (Kriteria Wajib 3)
const API_CACHE_NAME = 'story-api-v1';

// 2. Enhanced fetch handler untuk API caching
self.addEventListener('fetch', (event) => {
  // Handle API requests khusus
  if (event.request.url.includes('/api/') || event.request.url.includes('story-api')) {
    event.respondWith(
      caches.open(API_CACHE_NAME)
        .then(cache => {
          return fetch(event.request)
            .then(response => {
              // Clone response untuk cache
              const responseClone = response.clone();
              if (response.status === 200) {
                cache.put(event.request, responseClone);
              }
              return response;
            })
            .catch(() => {
              // Return cached version jika offline
              return cache.match(event.request);
            });
        })
    );
  }
  // Handle static assets (kode existing Anda)
  else {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
});

// 3. Enhanced push event untuk format JSON sesuai feedback
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
  
  async function chainPromise() {
    let notificationData;
    
    // Coba parse JSON dari server sesuai feedback
    try {
      const data = await event.data.json();
      notificationData = {
        title: data.title || 'Story App',
        options: {
          body: data.options?.body || data.body || 'New story available!',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        }
      };
    } catch (error) {
      // Fallback ke format lama jika bukan JSON
      notificationData = {
        title: 'Story App',
        options: {
          body: event.data ? event.data.text() : 'New story available!',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        }
      };
    }
    
    await self.registration.showNotification(notificationData.title, notificationData.options);
  }
  
  event.waitUntil(chainPromise());
});

// 4. Activate event untuk cleanup cache
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});