/* Copyright (c) 2026 Am015-dev. All rights reserved. Not licensed for copying, modification or redistribution; see LICENSE in the source repository. */
// Game Night Shelf service worker (scope = the games/ folder).
//  - shelf pages, manifest, icons, covers: network first (3 s), the cached copy when offline or slow
//  - games the player chose to keep (cached by sync.html): cache first, quietly refreshed in the background
//  - a game that was not downloaded and there is no network: a friendly page instead of the browser error
//  - cross-origin requests are never touched or stored
const VER = 'v1';
const SHELF = 'gns-shelf-' + VER;
const GAMES = 'gns-games-' + VER;
const SLUGS = ['crown-city-smash', 'nebula-aces', 'doorkick-dungeon', 'shipwreck-isle', 'sands-of-qamar', 'sunglaze', 'rampart-and-vine', 'short-fuse', 'tidewake', 'hollowbough', 'thornbound', 'kaiten-kitchen', 'mainhattan-nightrun', 'mainhattan-overdrive'];
const PRECACHE = ['./', 'index.html', 'classic.html', 'sync.html', 'suggest.html', 'reference.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png', 'room/plant.webp', 'room/room-back-day.webp', 'room/room-back-night.webp', 'room/room-front-day.webp', 'room/room-front-night.webp', 'room/suitcase.webp', 'room/velour.webp', 'room/wood.webp'];
const BASE = new URL('./', self.registration.scope).pathname;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELF);
    // one missing file must not fail the whole install
    await Promise.all(PRECACHE.map(async u => { try { const r = await fetch(new Request(u, { cache: 'reload' })); if (r.ok) await c.put(key(new URL(u, self.registration.scope)), r); } catch (_) { } }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    // keep VER in step with SHELF_CACHE/GAME_CACHE in sync.html; downloaded games survive a version bump: copy them across before the old cache goes
    const gOld = names.filter(n => n.startsWith('gns-games-') && n !== GAMES);
    if (gOld.length) {
      const dst = await caches.open(GAMES);
      for (const n of gOld) { const src = await caches.open(n); for (const rq of await src.keys()) { if (!(await dst.match(rq))) { const r = await src.match(rq); if (r) await dst.put(rq, r); } } }
    }
    await Promise.all(names.filter(n => n.startsWith('gns-') && n !== SHELF && n !== GAMES).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// one cache key per page: "/x/" and "/x/index.html" are the same entry, query and hash are ignored
function key(u) { const p = u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname; return u.origin + p; }
function isGame(u) { const rel = u.pathname.startsWith(BASE) ? u.pathname.slice(BASE.length) : ''; const s = rel.split('/')[0]; return SLUGS.includes(s) && rel.length > s.length; }
const wait = ms => new Promise(r => setTimeout(r, ms));

async function networkFirst(req, cacheName, k) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(k);
  const net = fetch(req).then(r => { if (r && r.status === 200) cache.put(k, r.clone()); return r; });
  if (!hit) return net;
  net.catch(() => { });
  return Promise.race([net, wait(3000).then(() => hit)]).catch(() => hit);
}

async function cacheFirst(req, k) {
  const cache = await caches.open(GAMES);
  const hit = await cache.match(k);
  if (!hit) return null;
  // refresh behind the scenes; the next open gets the new version
  fetch(k, { cache: 'no-cache' }).then(async r => {
    if (!r || r.status !== 200) return;
    const b = await r.blob(); // keep the real stored size in a header so the shelf can show it
    await cache.put(k, new Response(b, { status: 200, headers: { 'content-type': r.headers.get('content-type') || 'text/html; charset=utf-8', 'x-gns-size': String(b.size) } }));
  }).catch(() => { });
  return hit;
}

function offlinePage(isDoc) {
  if (!isDoc) return new Response('', { status: 504, statusText: 'Offline' });
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Offline</title>' +
    '<style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.55 system-ui,sans-serif;background:#1d1411;color:#f4ead8;padding:24px;box-sizing:border-box}' +
    '@media (prefers-color-scheme:light){body{background:#efe3cc;color:#2a1a10}a{color:#7a4a08!important}}main{max-width:30em}h1{font-size:1.5rem;margin:0 0 .4em}a{color:#e0a948;display:inline-flex;align-items:center;min-height:44px;font-weight:600;margin-right:18px}</style></head>' +
    '<body><main><h1>This game is not on this device</h1><p>You are offline, and this game was not downloaded. Games you keep on this device open without internet. Connect, then download it from Saves &amp; Offline.</p>' +
    '<a href="' + BASE + 'sync.html">Saves &amp; Offline</a><a href="' + BASE + '">Back to the shelf</a></main></body></html>';
  return new Response(html, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin || !u.pathname.startsWith(BASE)) return;
  const doc = req.mode === 'navigate' || req.destination === 'document' || req.destination === 'iframe';
  const k = key(u);
  e.respondWith((async () => {
    try {
      if (isGame(u)) {
        const hit = await cacheFirst(req, k);
        if (hit) return hit;
        try { return await fetch(req); } catch (_) { return offlinePage(doc); }
      }
      return await networkFirst(req, SHELF, k);
    } catch (_) {
      const c = await caches.match(k);
      return c || offlinePage(doc);
    }
  })());
});
