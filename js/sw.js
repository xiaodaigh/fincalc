//sw.js

var CACHE_NAME = 'fincalc-cache-v1';
var urlsToCache = [
  '/',
  '/Skeleton-2.0.4/css/normalize.css',
  '/Skeleton-2.0.4/css/skeleton.css',
  '/css/custom.css',
  '/css/googleapifont.css',
  '/images/favicon-192x192.png',
  '/dist/site.js',
  "/images/apple-touch-icon-57x57.png",
  "/images/apple-touch-icon-60x60.png",
  "/images/apple-touch-icon-72x72.png",
  "/images/apple-touch-icon-114x114.png",
  "/images/apple-touch-icon-144x144.png",
  "/dist/tax_calc.js",
  "/dist/react.js",
  "/dist/react-dom.js",
  "/dist/jquery.min.js",
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      // console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});