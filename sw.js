const CACHE_NAME = 'minibazar-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './script.js'
];

// Quraşdırma mərhələsi (Keşləmə)
// Qeyd: cache.addAll() əvəzinə hər faylı ayrıca keşləyirik.
// addAll() all-or-nothing işləyir — siyahıdakı BİR fayl belə 404 versə,
// bütün "install" mərhələsi uğursuz olur və Service Worker heç vaxt
// aktivləşmir (bu da brauzerin PWA-nı "quraşdırıla bilən" saymamasına səbəb olur).
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn('SW: keşlənmədi ->', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Köhnə keşləri təmizləmə mərhələsi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Sayta daxil olanda məlumatları keşdən və ya internetdən yükləmək
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
