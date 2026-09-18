// 希腊·西班牙旅行助手 — 离线缓存 Service Worker v13
// 修复：不同网页按各自地址缓存，避免宝宝手册覆盖旅行主页的离线缓存。
const CACHE = 'trip-assistant-v13';
const CORE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('trip-assistant-') && key !== CACHE)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          // 只以请求自己的地址保存页面，不统一写入旅行首页。
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(req, copy)));
        }
        return res;
      }).catch(async () => {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;
        // 只有旅行首页可以回退到首页缓存。其他页面绝不显示错误的网页。
        if (url.pathname === '/' || url.pathname === '/index.html') {
          const home = await caches.match('./index.html');
          if (home) return home;
        }
        return new Response('当前离线，且此页面尚未缓存。请恢复网络后重试。', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(req, copy)));
        }
        return res;
      }).catch(() => Response.error());
    })
  );
});
