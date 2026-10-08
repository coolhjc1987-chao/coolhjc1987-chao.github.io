// 趣味衣橱离线缓存（202610081438）：页面先走网络拿最新版，没网时用缓存；字体缓存后离线也能用
const V='lw-202610081438';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(u.origin===location.origin){e.respondWith(fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(req,cp))}return res}).catch(()=>caches.match(req,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return}
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){e.respondWith(caches.match(req).then(m=>m||fetch(req).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(req,cp));return res})))}
});
