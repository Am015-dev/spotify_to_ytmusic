// One shared static server for every check (sweep.js, rotate-test.js, phone-check.js, scenarios.spec.js). No file://, no per-game route hacks.
// It serves the game exactly like the live site: /<slug>/ -> the page, /<slug>/media|music|models/... -> the real files.
//   Resolution for /<slug>/<rest>:  1. overrides[slug] (a built html file, for rest '' / index.html)
//                                   2. <stage>/<slug>/<rest>   (build-all staging: index.html, cards/ ...)
//                                   3. games/<slug>/<rest>     (media, music, models, covers: the deployed assets)
//   build-all.py starts ONE server (node gx-serve.js <stage-dir>) and passes its base URL to every check as GX_URL.
//   Standalone runs (no GX_URL) start a private server through gx.url(slug, {file}).
//
//   const gx = require('../scripts/gx-serve.js');
//   const URL = await gx.url('doorkick-dungeon', { file: '/abs/doorkick.html', query: '?phone=1' });   // 'http://127.0.0.1:PORT/doorkick-dungeon/?phone=1'
//   CLI: node gx-serve.js [stageDir] [port]   -> prints "GX_URL http://127.0.0.1:PORT" and serves until killed.
const http = require('http'), fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.woff2': 'font/woff2', '.woff': 'font/font-woff', '.ttf': 'font/ttf', '.txt': 'text/plain' };

function startServer(o) {
  o = o || {};
  const stage = o.stage ? path.resolve(o.stage) : path.join(REPO, 'games-src', '.staging');
  const games = o.games ? path.resolve(o.games) : path.join(REPO, 'games');
  const overrides = Object.assign({}, o.overrides);   // slug -> absolute html file
  const extra = o.extra || {};                         // slug -> [more dirs to look in]
  const inside = (root, f) => f === root || f.startsWith(root + path.sep);
  const find = (slug, rest) => {
    if ((!rest || rest === 'index.html') && overrides[slug]) return overrides[slug];
    const roots = [path.join(stage, slug), path.join(games, slug)].concat(extra[slug] || []);
    for (const r of roots) {
      let f = path.join(r, rest || 'index.html');
      if (!inside(r, f)) continue;
      try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); if (fs.statSync(f).isFile()) return f; } catch (e) { }
    }
    return null;
  };
  const srv = http.createServer((req, res) => {
    let u; try { u = new URL(req.url, 'http://x'); } catch (e) { res.writeHead(400); return res.end(); }
    const parts = decodeURIComponent(u.pathname).split('/').filter(Boolean);
    const slug = parts.shift();
    if (!slug) { res.writeHead(404); return res.end('no slug'); }
    if (!parts.length && /\.(json|html)$/.test(slug)) {   // site-root files the pages fetch with ../ (updates.json, scenarios.json) and the owner pages (lab.html, index.html)
      const rf = [path.join(stage, slug), path.join(games, slug)].find(x => { try { return fs.statSync(x).isFile(); } catch (e) { return false; } });
      if (!rf) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(rf)] || 'text/plain', 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(rf));
    }
    if (u.pathname === '/' + slug) { res.writeHead(301, { Location: '/' + slug + '/' + u.search }); return res.end(); }
    const f = find(slug, parts.join('/'));
    if (!f) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found: ' + u.pathname); }
    const size = fs.statSync(f).size, type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
    const h = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {   // audio / video want Range
      let a = m[1] ? +m[1] : Math.max(0, size - +m[2]), b = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
      if (a > b || a >= size) { res.writeHead(416, { 'Content-Range': 'bytes */' + size }); return res.end(); }
      res.writeHead(206, Object.assign(h, { 'Content-Range': `bytes ${a}-${b}/${size}`, 'Content-Length': b - a + 1 }));
      return fs.createReadStream(f, { start: a, end: b }).pipe(res);
    }
    res.writeHead(200, Object.assign(h, { 'Content-Length': size }));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((resolve, reject) => {
    srv.on('error', reject);
    srv.listen(o.port || 0, '127.0.0.1', () => {
      const port = srv.address().port;
      resolve({ port, base: 'http://127.0.0.1:' + port, overrides, server: srv, close: () => new Promise(r => srv.close(r)) });
    });
  });
}

let _own = null;   // private server of a standalone run (one per process)
// URL of a game for a check. GX_URL (set by build-all.py) wins; a given `file` is only used by standalone runs.
async function url(slug, o) {
  o = o || {};
  let base = process.env.GX_URL;
  if (!base) {
    if (!_own) { _own = await startServer({ stage: process.env.GX_STAGE }); _own.server.unref(); }
    if (o.file) _own.overrides[slug] = path.resolve(o.file);
    base = _own.base;
  }
  return base.replace(/\/+$/, '') + '/' + slug + '/' + (o.query || '');
}

module.exports = { startServer, url, REPO };

if (require.main === module) {
  startServer({ stage: process.argv[2], port: +process.argv[3] || 0 }).then(s => console.log('GX_URL ' + s.base)).catch(e => { console.error(e); process.exit(1); });
}
