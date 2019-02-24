
var cacheVersion = 4;
var currentCache = {
    offline: 'offline-cache' + cacheVersion
};

var cacheList = [
    '/',
    "/index.html",
    "/styles/main.css",
    "/styles/provided.css",
    "/src/helpers.js",
    "/src/api.js",
    "/styles/login.css",
    "/src/main.js",
    "https://cdn.staticfile.org/twitter-bootstrap/4.1.0/css/bootstrap.min.css",
    "https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js",
    "https://cdn.staticfile.org/popper.js/1.12.5/umd/popper.min.js",
    "https://cdn.staticfile.org/twitter-bootstrap/4.1.0/js/bootstrap.min.js"
]



// Serviceworker internally triggers an installation event when the browser parses the SW file
self.addEventListener('install', function (e) {
    console.log('Cache event!')
    // Open a cache space and add related resources that need to be cached to the cache.
    e.waitUntil(
        caches.open(currentCache).then(function (cache) {
            console.log('Adding to Cache:', cacheList)
            return cache.addAll(cacheList)
        }),
              // Clean up the old version
         caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (cacheName) {
                        if (cacheName !== 'two') {
                            console.log('clean',cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
      
    )
})
self.addEventListener('activate', event => {
    console.log('Service Worker is activated, requests after refreshing the page will go through Service Worker');
});

self.addEventListener('fetch', event => {
    console.log('fetch');
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(fetch(event.request.url).catch(error => {
                // Return the offline page
                return caches.match('/');
            })
        );
    }
    else {
        event.respondWith(caches.match(event.request)
            .then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
});