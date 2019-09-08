var CACHE_NAME = 'Bernoulli_Math_1_4_2_Cache';
var urlsToCache = [
  'index.html',
  'styles.css',
  'script.js',
  'share.svg',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith((function() {
    if(urlsToCache.includes(event.request)) {
      return caches.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          caches.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      })
    } else {
      return fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    }   
  }()));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
