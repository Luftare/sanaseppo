const STATIC_CACHE_NAME = 'static-v1';
const retainedCacheNames = [STATIC_CACHE_NAME];

const staticAssets = ['/assets/audio/correct.wav', '/assets/audio/wrong.wav', '/assets/audio/tap.wav', '/assets/audio/victory.wav', '/assets/audio/bling.wav', '/assets/audio/rise.wav', '/assets/audio/fall.wav'];

self.addEventListener('install', e => {
  e.waitUntil(cacheStaticAssets());
});

self.addEventListener('activate', e => {
  e.waitUntil(removeObsoleteCaches());
});

self.addEventListener('fetch', e => {
  e.respondWith(getCachedResponseWithFetchFallback(e));
});

const getCachedResponseWithFetchFallback = async e => {
  const cachedResult = await caches.match(e.request);
  if (cachedResult) return cachedResult;

  return fetchResponse(e);
};

const cacheStaticAssets = () =>
  caches.open(STATIC_CACHE_NAME).then(cache => {
    cache.addAll(staticAssets);
  });

const removeObsoleteCaches = async () => {
  const cacheKeys = await caches.keys();
  const deletePromises = cacheKeys
    .filter(cacheName => !retainedCacheNames.includes(cacheName))
    .map(cacheName => caches.delete(cacheName));

  return Promise.all(deletePromises);
};


const getCachedResponse = async e => {
  return await caches.match(e.request);
};

const fetchResponse = async e => {
  return await fetch(e.request);
};