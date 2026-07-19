self.addEventListener('install', (e) => {
 e.waitUntil(
   caches.open('minibazar-store').then((cache) => cache.addAll([
     '/',
     '/index.html',
     '/style.css' // Əgər varsa
   ]))
 );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
