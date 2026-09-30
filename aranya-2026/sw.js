// 阿那亚旅行攻略：只管理 /aranya-2026/，不改动原旅行网站的离线缓存。
const CACHE = 'aranya-family-2026-v1';
const CORE = [
  './', './index.html', './style.css', './days.js', './app.js',
  './manifest.webmanifest', './coast.webp',
  './assets/large_beidaihe11_1_d8756e62cf.webp',
  './assets/large_beidaihe1_1_5797a0dcbc.webp',
  './assets/large_beidaihe2_1_e62b546aa1.webp',
  './assets/large_beidaihe4_1_0129662c0d.webp',
  './schedule-2.jpg', './schedule-3.jpg', './schedule-4.jpg',
  './schedule-5.jpg', './schedule-6.jpg', './schedule-7.jpg',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('aranya-family-2026-') && key !== CACHE)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      return await cache.match(request, { ignoreSearch: true }) ||
        await cache.match('./index.html') ||
        new Response('首次打开请连接网络，之后可离线查看已缓存的攻略。', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }));
    return;
  }

  event.respondWith(caches.open(CACHE).then(async cache => {
    const saved = await cache.match(request, { ignoreSearch: true });
    if (saved) return saved;
    const response = await fetch(request);
    if (response.ok) event.waitUntil(cache.put(request, response.clone()));
    return response;
  }));
});
