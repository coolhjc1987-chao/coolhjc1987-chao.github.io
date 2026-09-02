// 希腊·西班牙旅行助手 — 离线缓存 Service Worker v12
// 页面（HTML）：网络优先，拿到新版就更新缓存；离线时回退缓存
// 静态资源（带哈希的 JS/CSS/图标）：缓存优先，网络回源并写入缓存
const CACHE = 'trip-assistant-v12';
const CORE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  // 页面导航：网络优先，保证新版本能进来；失败回退缓存（离线可用）
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 静态资源：缓存优先（带哈希文件名，更新即换名，不怕旧）
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
