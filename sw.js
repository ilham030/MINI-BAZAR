const CACHE_NAME = 'minibazar-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './script.js'
];

// Quraşdırma mərhələsi (Keşləmə)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Sayta daxil olanda məlumatları keşdən və ya internetdən yükləmək
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
