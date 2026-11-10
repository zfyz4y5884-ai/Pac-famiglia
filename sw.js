/* Ginevra PAC: cache del solo codice pubblico, mai dei dati finanziari */
const CACHE = 'ginevra-pac-shell-v1.4';
const OFFLINE_FILES = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png',
  './apple-touch-icon.png', './favicon.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(OFFLINE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('ginevra-pac-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const cache = await caches.open(CACHE);
        cache.put('./index.html', response.clone()).catch(() => {});
        return response;
      } catch {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    return fetch(request);
  })());
});
