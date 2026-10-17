/* Mainhattan Nightrun service worker (B30). Built by parts/build.py: 961617dd01 is replaced by a hash of the page, so every deploy makes a new worker and new cache names.
   - shell (index.html, manifest, icons, title art): precached; index.html is NETWORK FIRST (3 s) with the cache as fallback, so a stale page is never served while online
   - tracks.json: network first, cache fallback
   - music/*.mp3 and media/*: cached when first used (size capped), served from the cache, then quietly re-checked with a conditional request (304 = nothing downloaded)
   - Range requests (a plain <audio src>) are answered from the cached file as 206; the game itself fetches songs whole into a blob, which needs no special case
   - other origins (fonts) are never touched; on activate the old shell cache goes and the asset cache is carried over to the new name */
const BUILD = '961617dd01';
const SHELF = 'nr-shell-' + BUILD, ASSETS = 'nr-assets-' + BUILD;
const CAP = { music: 24, media: 420 };
const BASE = new URL('./', self.registration.scope).href;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png', 'media/title.webp', 'media/title-phone.webp', 'media/ready.json', 'music/tracks.json'];
const wait = ms => new Promise(r => setTimeout(r, ms));
const key = u => { u = new URL(u, BASE); const p = u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname; return u.origin + p; };   // "/x/" and "/x/index.html" are one entry, query and hash ignored

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELF);
    await Promise.all(SHELL.map(async u => { try { const r = await fetch(new Request(new URL(u, BASE), { cache: 'reload' })); if (r.ok) await c.put(key(u), r); } catch (_) { } }));   // one missing file must not fail the install
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    const dst = await caches.open(ASSETS);
    for (const n of names.filter(n => n.startsWith('nr-assets-') && n !== ASSETS)) {   // keep the songs the player already has: copy locally, no download
      const src = await caches.open(n);
      for (const rq of await src.keys()) { if (!(await dst.match(rq))) { const r = await src.match(rq); if (r) await dst.put(rq, r); } }
    }
    await Promise.all(names.filter(n => n.startsWith('nr-') && n !== SHELF && n !== ASSETS).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function trim(cache, prefix, cap) {   // oldest first (keys() is in insertion order)
  const ks = (await cache.keys()).filter(r => new URL(r.url).pathname.includes(prefix));
  for (let i = 0; i < ks.length - cap; i++) await cache.delete(ks[i]);
}
async function networkFirst(req, k, ms) {
  const cache = await caches.open(SHELF), hit = await cache.match(k);
  const net = fetch(new Request(req.url, { cache: 'no-cache' })).then(r => { if (r && r.status === 200) cache.put(k, r.clone()); return r; });
  if (!hit) return net.catch(async () => (await caches.match(k)) || Response.error());   // another cache (the shelf's own) may hold the page
  net.catch(() => { });
  return Promise.race([net, wait(ms).then(() => hit)]).catch(() => hit);
}
function ranged(req, hit) {   // slice a cached whole file for a Range request
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  return hit.arrayBuffer().then(buf => {
    const n = buf.byteLength; let s = m && m[1] !== '' ? +m[1] : 0, e = m && m[2] !== '' ? +m[2] : n - 1;
    if (m && m[1] === '' && m[2] !== '') { s = Math.max(0, n - +m[2]); e = n - 1; }
    if (!m || s >= n) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + n } });
    e = Math.min(e, n - 1);
    return new Response(buf.slice(s, e + 1), { status: 206, headers: { 'content-type': hit.headers.get('content-type') || 'audio/mpeg', 'content-range': `bytes ${s}-${e}/${n}`, 'content-length': String(e - s + 1), 'accept-ranges': 'bytes' } });
  });
}
async function asset(req, k, kind) {
  const cache = await caches.open(ASSETS), hit = await cache.match(k);
  const isRange = req.headers.has('range');
  if (hit) {
    const et = hit.headers.get('etag'), lm = hit.headers.get('last-modified');
    if (et || lm) fetch(k, { headers: et ? { 'if-none-match': et } : { 'if-modified-since': lm } }).then(async r => {   // conditional re-check: 304 means unchanged
      if (r && r.status === 200) { await cache.put(k, r); await trim(cache, kind === 'music' ? '/music/' : '/media/', CAP[kind]); }
    }).catch(() => { });
    return isRange ? ranged(req, hit) : hit;
  }
  if (isRange) return fetch(req);   // not cached yet: the browser's own range handling; the whole file is cached when the game fetches it
  const r = await fetch(req);
  if (r && r.status === 200 && r.type === 'basic') { try { await cache.put(k, r.clone()); await trim(cache, kind === 'music' ? '/music/' : '/media/', CAP[kind]); } catch (_) { } }
  return r;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin || !u.href.startsWith(BASE)) return;
  const rel = u.href.slice(BASE.length).split(/[?#]/)[0], k = key(u.href);
  if (rel === '' || rel === 'index.html') e.respondWith(networkFirst(req, k, 3000));
  else if (rel === 'music/tracks.json') e.respondWith(networkFirst(req, k, 3000));
  else if (rel === 'manifest.webmanifest' || rel.startsWith('icons/') || rel === 'media/ready.json') e.respondWith(networkFirst(req, k, 3000));
  else if (/^music\/.+\.mp3$/.test(rel)) e.respondWith(asset(req, k, 'music'));
  else if (/^media\//.test(rel)) e.respondWith(asset(req, k, 'media'));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
