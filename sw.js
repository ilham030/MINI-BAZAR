// Keş versiyasını hər dəfə saytda əsaslı dəyişiklik edəndə artırın (v1 -> v2 -> v3...)
// Bu, köhnə Service Worker keşinin istifadəçilərdə "yapışıb qalmasının" qarşısını alır.
const CACHE_NAME = 'minibazar-v2';
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

// ============ FETCH STRATEGİYASI: ŞƏBƏKƏ ÖNCƏLİKLİ (network-first) ============
// Qeyd: köhnə versiya "keş öncəlikli" idi (əvvəl caches.match, sonra fetch).
// Bu, admin paneldən data.json-a yazılan yeniliklərin və ya sayta edilən
// yeni dəyişikliklərin PWA quraşdırmış istifadəçilərdə HEÇ VAXT görünməməsinə
// səbəb ola bilərdi — çünki brauzer həmişə köhnə keşlənmiş faylı göstərirdi.
// İndi əvvəlcə şəbəkədən (ən son versiya) cəhd edilir; yalnız internet
// yoxdursa keşdən (offline fallback) istifadə olunur.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone).catch(() => {});
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
