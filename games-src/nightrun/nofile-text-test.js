#!/usr/bin/env node
// No source file names in player text. Static: every string literal (comments stripped) in parts/*.js must not contain "name.js" / "(g.js)" style names.
// Runtime: the built page's visible text (menu, Garage, Lab, Stats) holds no "word.js|py|json|webp|html" either.   NODE_PATH=$(npm root -g) node games-src/nightrun/nofile-text-test.js      env: GAME_DIR, NOPAGE=1 (static only)
const fs = require('fs'), path = require('path'), cp = require('child_process'), net = require('net');
const PARTS = path.join(__dirname, 'parts'), RX = /\b[\w-]+\.(js|py|json|webp|html|css)\b/i, fails = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
function literals(src) {   // [{s, line}] of every '...' "..." `...` literal, skipping // and /* */ comments and regex-free enough for this code base
  const out = []; let i = 0, line = 1; const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; } i += 2; continue; }
    if (c === '\'' || c === '"' || c === '`') {
      const q = c, l0 = line; let s = ''; i++;
      while (i < n && src[i] !== q) { if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; continue; } if (src[i] === '\n') { line++; if (q !== '`') break; } s += src[i++]; }
      i++; out.push({ s, line: l0 }); continue;
    }
    if (c === '/' && /[=(,:;!&|?{}\[]\s*$/.test(src.slice(Math.max(0, i - 6), i))) { i++; while (i < n && src[i] !== '/' && src[i] !== '\n') { if (src[i] === '\\') i++; i++; } i++; continue; }   // regex literal
    i++;
  }
  return out;
}
const DEV = new Set(['labassets.js']);   // the Lab ASSETS tab is the owner's asset workbench: it lists file names on purpose (what to paint, save-as name)
let hits = 0;
for (const f of require('./parts-index.js').list().filter(f => f.endsWith('.js'))) {
  for (const l of literals(fs.readFileSync(path.join(PARTS, f), 'utf8'))) {
    if (!RX.test(l.s) || DEV.has(path.basename(f))) continue;
    if (/\bsrc=|url\(|\{[^}]*:[^}]*\}/.test(l.s)) continue;                                                     // markup / CSS: an image path, not text
    if (/^(\.\/|\/|https?:|[\w\/.-]*\/)/.test(l.s) && !/\s/.test(l.s)) continue;                        // a path or URL (a fetch / src), not text
    if (!/\s|\(/.test(l.s) && /^[\w-]+\.(js|json|webp|html|css)$/.test(l.s)) continue;                 // a bare file name used as a key (ART.rd.has('x.webp'))
    if (/(\.js|\.webp|\.json)['"`]?\s*(\+|\))?$/.test(l.s) && !/\s/.test(l.s)) continue;
    fails.push(`static: parts/${f}:${l.line}: "${l.s.slice(0, 80)}"`); hits++;
  }
}
(async () => {
  if (!process.env.NOPAGE) {
    const PW = require('playwright'), GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
    const port = await new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
    const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
    const br = await PW.chromium.launch(), ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push('page error: ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html`); await sleep(1500);
    const txt = async tag => { const t = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetParent !== null && !/^(SCRIPT|STYLE)$/.test(e.tagName)).map(e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ')).join(' | ')); const m = t.match(new RegExp(RX.source, 'gi')); if (m) fails.push(`page (${tag}): ${[...new Set(m)].join(', ')}`); };
    await txt('title');
    // every power-up level text (the toast, the Stats sheet and the Lab read PW3L.*.tx)
    const lv = await p.evaluate(() => { try { return Object.values(__pw3.PW3L).flatMap(o => o.tx || []); } catch (e) { return []; } }); lv.filter(s => RX.test(s)).forEach(s => fails.push('PW3L text: ' + s));
    if (!lv.length) fails.push('PW3L not reachable (test hook missing)');
    await br.close(); srv.kill();
  }
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].slice(0, 30).join('\n') : 'PASS nofile-text-test (' + hits + ' player strings with a file name)'); process.exit(fails.length ? 1 : 0);
})();
