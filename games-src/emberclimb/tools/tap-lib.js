// Shared helpers for the UI-tap tests: local server, and tap() that only taps a visible element whose centre is not covered.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
function serve() {
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let p = path.join(ROOT, u); if (!fs.existsSync(p) || u === '/') p = u === '/' ? path.join(ROOT, 'emberclimb.html') : path.join(ROOT, '..', '..', 'games', 'emberclimb', u); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.webp') ? 'image/webp' : 'application/octet-stream' }); r.end(d); }); });
  return new Promise(res => srv.listen(0, () => res({ srv, base: 'http://127.0.0.1:' + srv.address().port + '/emberclimb.html' })));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
// returns a reason string when the element can't be tapped honestly, else taps and returns null
async function tap(pg, touch, sel) {
  const h = typeof sel === 'string' ? await pg.$(sel) : sel; if (!h) return 'missing ' + sel;
  const info = await h.evaluate(el => { el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const t = document.elementFromPoint(x, y); const cs = getComputedStyle(el); return { x, y, w: r.width, h: r.height, vis: cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0, ok: !!t && (t === el || el.contains(t)), hit: t ? (t.className || t.tagName) + '' : 'none', inv: x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight }; });
  if (!info.vis) return 'hidden ' + sel; if (!info.inv) return 'offscreen ' + sel; if (!info.ok) return 'covered ' + sel + ' by ' + info.hit;
  if (touch) await pg.touchscreen.tap(info.x, info.y); else await pg.mouse.click(info.x, info.y); await sleep(140); return null;
}
module.exports = { serve, sleep, tap, ROOT };
