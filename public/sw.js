// Service Worker Dasar (untuk PWA)
self.addEventListener('install', (event) => {
  console.log('Service worker terinstal');
});

self.addEventListener('fetch', (event) => {
  // Untuk saat ini, kita hanya akan mengambil dari network
  event.respondWith(fetch(event.request));
});