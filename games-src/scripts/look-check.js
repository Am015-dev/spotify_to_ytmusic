#!/usr/bin/env node
// Look check: a deterministic visual reviewer (no AI). Opens every shelf game on phone + PC, never plays a full game,
// and reports what LOOKS wrong: small/low-contrast/cut-off/overlapping text, bad fonts, unlabeled/covered/tiny buttons,
// broken/stretched/blurry art, blank boards, cards that overlap or spill, sideways scroll, page errors.
//
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/look-check.js                 # all games -> games/look/
//   node games-src/scripts/look-check.js --game doorkick-dungeon [--game thornbound] [--sizes phone,small,pc]
//   node games-src/scripts/look-check.js --baseline          # run all (or --game ...) and save counts to games-src/look-baseline.json
//   node games-src/scripts/look-check.js --gate --game x     # exit 1 if x has NEW severe findings vs baseline (used by build-all.py --deploy)
// Flags: --games-dir DIR (serve this folder, default games/), --out DIR (default games/look), --timeout SEC per game (default 420), --no-shots
// One game at a time (the machine overloads otherwise). Scene drivers: games-src/scripts/look-scenes.json (copy of screens.html's).
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const optAll = n => argv.flatMap((a, i) => a === '--' + n ? [argv[i + 1]] : []);
const GAMES_DIR = path.resolve(opt('games-dir', path.join(ROOT, 'games')));
const OUT = path.resolve(opt('out', path.join(ROOT, 'games', 'look')));
const BASE = path.join(ROOT, 'games-src', 'look-baseline.json');
const GAME_MS = +opt('timeout', 420) * 1000;
const SCENES = JSON.parse(fs.readFileSync(path.join(__dirname, 'look-scenes.json'), 'utf8'));
const ALL_SIZES = {
  phone: { w: 390, h: 763, dpr: 3, mobile: true, label: '390x763' },
  small: { w: 375, h: 553, dpr: 3, mobile: true, label: '375x553' },
  pc: { w: 1366, h: 768, dpr: 1, mobile: false, label: '1366x768' },
};
const SIZES = (opt('sizes', 'phone,small,pc')).split(',').map(s => ({ id: s, ...ALL_SIZES[s] }));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function listSlugs() {
  let s = [];
  try { s = JSON.parse(fs.readFileSync(path.join(ROOT, 'games', 'status.json'), 'utf8')).games.map(g => g.slug); } catch {}
  if (!s.length) s = fs.readdirSync(GAMES_DIR).filter(d => fs.existsSync(path.join(GAMES_DIR, d, 'index.html')) && !/asset-viewer|^room$/.test(d));
  return s.filter(d => fs.existsSync(path.join(GAMES_DIR, d, 'index.html')));
}

function serve() {
  const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', glb: 'model/gltf-binary', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', webmanifest: 'application/manifest+json' };
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(GAMES_DIR, p);
    if (!f.startsWith(GAMES_DIR) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('nope'); }
    r.writeHead(200, { 'content-type': types[path.extname(f).slice(1)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res([srv, srv.address().port])));
}

// ---------------------------------------------------------------- in page
// Runs inside the game page. Returns raw measurements; judging happens in node.
async function pageCollect(o) {
  const W = innerWidth, H = innerHeight, phone = o.phone;
  const cs = e => getComputedStyle(e), num = v => parseFloat(v) || 0;
  const cls = e => typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || '';
  const parseCol = s => { const m = (s || '').match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const sel = e => {
    const parts = []; let n = e;
    for (let i = 0; n && n.nodeType === 1 && i < 3 && n !== document.body; i++, n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id && !/\d{3,}/.test(n.id)) { parts.unshift(s + '#' + n.id); break; }
      const c = cls(n).split(/\s+/).filter(x => x && !/^(on|show|open|active|sel|selected|hover|glow|rglow|rec|rrec|dis|disabled|cur)$/.test(x) && !/\d/.test(x)).slice(0, 2);
      if (c.length) { s += '.' + c.join('.'); parts.unshift(s); if (i >= 0) break; }
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
  const inter = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  const chainOk = e => {
    let op = 1;
    for (let p = e; p && p.nodeType === 1; p = p.parentElement) {
      const s = cs(p);
      if (s.display === 'none' || (p === e && s.visibility === 'hidden') || s.contentVisibility === 'hidden') return 0;
      op *= num(s.opacity);
      if (p.hasAttribute('hidden') || p.getAttribute('aria-hidden') === 'true' || p.inert) return 0;
    }
    return op;
  };
  // visible rectangle after viewport + overflow clipping; hard = hidden/clip only
  const clipInfo = (e, r) => {
    let vis = [Math.max(0, r[0]), Math.max(0, r[1]), 0, 0];
    let x1 = Math.min(W, r[0] + r[2]), y1 = Math.min(H, r[1] + r[3]), x0 = Math.max(0, r[0]), y0 = Math.max(0, r[1]);
    let hx0 = r[0], hy0 = r[1], hx1 = r[0] + r[2], hy1 = r[1] + r[3], scrollAnc = false;
    let escaping = cs(e).position === 'absolute', fixed = cs(e).position === 'fixed';
    for (let p = e.parentElement; p && p !== document.documentElement && !fixed; p = p.parentElement) {
      const s = cs(p);
      if (escaping) { if (s.position !== 'static' || s.transform !== 'none') escaping = false; else continue; }
      if (s.position === 'fixed') fixed = true;
      const ox = s.overflowX, oy = s.overflowY;
      if (ox === 'visible' && oy === 'visible') continue;
      const pr = R(p), hard = /hidden|clip/.test(ox + oy), sc = /auto|scroll/.test(ox + oy) && (p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1);
      if (sc) scrollAnc = true;
      x0 = Math.max(x0, pr[0]); y0 = Math.max(y0, pr[1]); x1 = Math.min(x1, pr[0] + pr[2]); y1 = Math.min(y1, pr[1] + pr[3]);
      if (hard) { hx0 = Math.max(hx0, pr[0]); hy0 = Math.max(hy0, pr[1]); hx1 = Math.min(hx1, pr[0] + pr[2]); hy1 = Math.min(hy1, pr[1] + pr[3]); }
    }
    const area = Math.max(1, r[2] * r[3]);
    const vf = Math.max(0, x1 - x0) * Math.max(0, y1 - y0) / area;
    const hf = Math.max(0, hx1 - hx0) * Math.max(0, hy1 - hy0) / area;
    const vpf = inter(r, [0, 0, W, H]) / area;
    return { vf, hf, vpf, scrollAnc, vis: [x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)] };
  };
  const related = (a, b) => a === b || a.contains(b) || b.contains(a);
  const modalish = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const s = cs(p); if (s.position === 'fixed' || s.position === 'absolute') { const r = R(p); if (r[2] * r[3] >= 0.45 * W * H) return true; } if (p.getAttribute && /dialog/.test(p.getAttribute('role') || '')) return true; } return false; };
  // fraction of sample points in rect where something unrelated is on top
  const cover = (e, r, vis) => {
    const b = vis && vis[2] > 1 && vis[3] > 1 ? vis : r; const pts = [[.5, .5], [.2, .5], [.8, .5], [.5, .2], [.5, .8]]; let c = 0, n = 0, by = null;
    for (const [fx, fy] of pts) { const x = b[0] + b[2] * fx, y = b[1] + b[3] * fy; if (x < 0 || y < 0 || x >= W || y >= H) continue; n++; const h = document.elementFromPoint(x, y); if (h && !related(e, h)) { c++; by = by || h; } }
    return { frac: n ? c / n : 1, by, n };
  };
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|emoji|math|fangsong|-apple-system|blinkmacsystemfont)$/i;
  const firstFam = ff => { for (const f of ff.split(',')) { const n = f.trim().replace(/^["']|["']$/g, ''); if (n && !/emoji|symbol|icon/i.test(n)) return n; } return ''; };
  const zoomOf = e => { let z = 1; for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const v = num(cs(p).zoom); if (v && v !== 1) z *= v; } return z; };
  const scaleOf = e => { let sc = 1; for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const t = cs(p).transform; if (t && t !== 'none') { try { const m = new DOMMatrix(t); sc *= Math.sqrt(m.a * m.a + m.b * m.b) || 1; } catch {} } const sv = cs(p).scale; if (sv && sv !== 'none') sc *= parseFloat(sv) || 1; } return sc; };
  const rotated = e => { for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const t = cs(p).transform; if (t && t !== 'none') { try { const m = new DOMMatrix(t); if (Math.abs(m.b) > 0.02 || Math.abs(m.c) > 0.02) return true; } catch {} } } return false; };
  const BTN = 'button,[role=button],a[href],[onclick],summary,input[type=button],input[type=submit],[data-act],[tabindex]:not([tabindex="-1"])';
  const OBJRE = /(^|[\s_-])(board|card|tile|token|piece|chip|meeple|cell|pc|hc|pcard)([\s_-]|$)|board|meeple/i;
  const isBtn = e => e.matches && e.matches(BTN);
  let ROOT = null;
  if (o.modal) { const h = document.elementFromPoint(W / 2, H / 2); for (let p = h; p && p !== document.body && p !== document.documentElement; p = p.parentElement) { const ps = cs(p).position; if (ps === 'fixed' || ps === 'absolute') { const r = R(p); if (r[2] * r[3] > 0.15 * W * H) ROOT = p; } } }
  const inRoot = e => !ROOT || ROOT.contains(e);
  const out = { texts: [], btns: [], imgs: [], objs: [], fontsErr: [], fams: [], pageScroll: false, board: null, W, H };

  // fonts
  try { for (const f of document.fonts) if (f.status === 'error') out.fontsErr.push(f.family.replace(/["']/g, '')); } catch {}
  // horizontal scroll
  try {
    const se = document.scrollingElement || document.documentElement;
    if (se.scrollWidth > W + 1) { const x0 = scrollX; scrollTo(120, 0); out.pageScroll = scrollX > 1 || se.scrollLeft > 1; scrollTo(x0, 0); }
  } catch {}

  // ---- texts
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const rng = document.createRange(); const famCount = new Map(); const seenText = new Map();
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const txt = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!txt) continue;
    const el = n.parentElement; if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION|TITLE)$/.test(el.tagName)) continue;
    rng.selectNodeContents(n);
    const rects = [...rng.getClientRects()].map(q => [q.left, q.top, q.width, q.height]).filter(q => q[2] > 0.5 && q[3] > 0.5);
    if (!rects.length) continue;
    const s = cs(el), op = chainOk(el); const fs = num(s.fontSize);
    const x0 = Math.min(...rects.map(q => q[0])), y0 = Math.min(...rects.map(q => q[1])), x1 = Math.max(...rects.map(q => q[0] + q[2])), y1 = Math.max(...rects.map(q => q[1] + q[3]));
    const box = [x0, y0, x1 - x0, y1 - y0]; const ci = clipInfo(el, box);
    const isSvg = el instanceof SVGElement; let svgScale = null, svgStroke = 0, svgStrokeCol = [0, 0, 0, 0];
    if (isSvg) { try { const te = el.closest('text') || el; const m = te.getScreenCTM(); if (m) svgScale = Math.hypot(m.a, m.b) || 1; } catch {} const sw = num(s.strokeWidth); if (s.stroke && s.stroke !== 'none' && sw > 0) { svgStroke = sw * (svgScale || 1); svgStrokeCol = parseCol(s.stroke); } }
    const col = isSvg ? (() => { const c = parseCol(s.fill); c[3] *= num(s.fillOpacity || 1); return c; })() : parseCol(s.color), fill = isSvg ? col : (s.webkitTextFillColor ? parseCol(s.webkitTextFillColor) : col);
    const shown = op > 0.05 && ci.vpf > 0.3 && ci.vf > 0.3 && s.visibility !== 'hidden';
    const rec = {
      el, text: txt.slice(0, 60), box, vis: ci.vis, rects, fs, scale: svgScale != null ? svgScale : scaleOf(el) * zoomOf(el), op, col: fill[3] < col[3] ? fill : col, shown,
      visTxt: ci.vf, hardFrac: ci.hf, vpf: ci.vpf, scrollAnc: ci.scrollAnc, fam: firstFam(s.fontFamily), famRaw: s.fontFamily,
      shadow: s.textShadow, stroke: isSvg ? svgStroke : num(s.webkitTextStrokeWidth), strokeCol: isSvg ? svgStrokeCol : parseCol(s.webkitTextStrokeColor), letters: /[\p{L}\p{N}]/u.test(txt),
      weight: s.fontWeight, clipText: /text/.test(s.webkitBackgroundClip || s.backgroundClip || ''), rot: rotated(el), ell: s.textOverflow === 'ellipsis',
    };
    out.texts.push(rec);
  }
  // judge visibility/cover and attach element-level info
  const textRecs = [];
  for (const t of out.texts) {
    if (!t.shown || t.fs <= 0) { t.skip = 'hidden'; continue; }
    if (!inRoot(t.el)) { t.skip = 'behind'; continue; }
    const cv = cover(t.el, t.box, null);
    t.cover = cv.frac; t.coverModal = cv.by ? modalish(cv.by) : false; t.coverBy = cv.by;
    t.sel = sel(t.el); t.btnEl = t.el.closest(BTN); t.dis = !!t.el.closest(':disabled,[aria-disabled=true],.disabled,.dis,.locked,[disabled]');
    textRecs.push(t);
  }
  const recKeys = new Set();
  const textsOut = [];
  for (const t of textRecs) {
    if (t.cover >= 0.6) { t.skip = 'covered'; }
    const el = t.el, s = cs(el);
    // element-level overflow
    let overflow = null;
    if (!t.skip) {
      const hid = /hidden|clip/;
      const direct = [...el.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim());
      if (direct && el.clientWidth > 0 && el.clientHeight > 0) {
        const lc = s.webkitLineClamp && s.webkitLineClamp !== 'none';
        if (hid.test(s.overflowX) && el.scrollWidth > el.clientWidth + 1.5 && (t.ell || s.whiteSpace === 'nowrap' || s.display !== 'inline')) overflow = (t.ell ? 'ellipsis cuts' : 'clips') + ' the text sideways';
        else if (hid.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1.5) overflow = lc ? 'line clamp cuts' : 'clips the text vertically';
      }
      if (!overflow && t.hardFrac > 0.05 && t.hardFrac < 0.85 && !t.rot) overflow = 'is partly hidden by its container';
      if (!overflow && !t.scrollAnc && t.vpf > 0.1 && t.vpf < 0.85 && !t.rot) overflow = 'runs off the screen edge';
    }
    t.overflow = overflow;
    // plate: nearest painted/card ancestor
    t.plate = null;
    if (!t.skip && !t.rot) {
      for (let p = el, d = 0; p && p !== document.body && d < 7; p = p.parentElement, d++) {
        const ps = cs(p), pr = R(p), ar = pr[2] * pr[3];
        if (ar > 0.8 * W * H) break; if (cs(p).position === 'fixed' && ar > 0.5 * W * H) break;
        const bgi = ps.backgroundImage !== 'none' || ps.borderImageSource !== 'none', bgc = parseCol(ps.backgroundColor)[3] >= 0.5;
        const cardlike = OBJRE.test(cls(p)) && !/board/i.test(cls(p));
        if (bgi || bgc || cardlike) {
          if (rotated(p)) break;
          t.plate = { rect: pr, sel: sel(p), card: cardlike && !bgi && !bgc ? true : cardlike, el: p };
          break;
        }
      }
    }
    textsOut.push(t);
  }
  // ---- overlaps between texts and with buttons/cards
  const hitRel = (x, y, ...els) => { const h = document.elementFromPoint(x, y); return !!h && els.some(e => related(e, h)); };
  const live = textsOut.filter(t => !t.skip);
  const interRect = (a, b) => { const x0 = Math.max(a[0], b[0]), y0 = Math.max(a[1], b[1]), x1 = Math.min(a[0] + a[2], b[0] + b[2]), y1 = Math.min(a[1] + a[3], b[1] + b[3]); return x1 > x0 && y1 > y0 ? [x0, y0, x1 - x0, y1 - y0] : null; };
  const topAt = (ir, ...els) => { let ok = 0, n = 0; for (const [fx, fy] of [[.5, .5], [.25, .5], [.75, .5], [.5, .25], [.5, .75]]) { const x = ir[0] + ir[2] * fx, y = ir[1] + ir[3] * fy; if (x < 0 || y < 0 || x >= W || y >= H) continue; n++; if (hitRel(x, y, ...els)) ok++; } return n && ok / n >= 0.5; };
  const overlaps = [];
  const L = live.filter(t => t.letters && !t.el.closest('[data-help]'));
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i], b = L[j]; if (related(a.el, b.el)) continue;
    let best = null;
    for (const ra of a.rects) for (const rb of b.rects) { const ir = interRect(ra, rb); if (!ir) continue; const sm = Math.min(ra[2] * ra[3], rb[2] * rb[3]); if (ir[2] * ir[3] / sm > 0.15 && (!best || ir[2] * ir[3] > best[2] * best[3])) best = ir; }
    if (best && best[2] > 3 && best[3] > 3 && topAt(best, a.el, b.el)) overlaps.push({ a: a.sel, ta: a.text, b: b.sel, tb: b.text, box: best, boxA: a.box, boxB: b.box, kind: 'text' });
    if (overlaps.length > 60) break;
  }
  const paintedBtn = e => { const s = cs(e); return parseCol(s.backgroundColor)[3] > 0.15 || s.backgroundImage !== 'none' || (num(s.borderTopWidth) > 0 && parseCol(s.borderTopColor)[3] > 0.2) || s.boxShadow !== 'none'; };
  const objEls = [...document.querySelectorAll('button,[role=button],a[href],*')].filter(e => (isBtn(e) || (OBJRE.test(cls(e)) && !/board/i.test(cls(e)))) && e.tagName !== 'BODY').slice(0, 3000);
  const objVis = objEls.map(e => { const r = R(e); return { e, r }; }).filter(({ e, r }) => r[2] >= 24 && r[3] >= 24 && r[2] * r[3] < 0.4 * W * H && chainOk(e) > 0.5 && inter(r, [0, 0, W, H]) / (r[2] * r[3]) > 0.6 && paintedBtn(e) && !modalish(e) && cs(e).pointerEvents !== 'none');
  for (const t of L) {
    for (const { e, r } of objVis) {
      if (related(t.el, e)) continue;
      const ir = interRect(t.box, r); if (!ir) continue;
      if (ir[2] * ir[3] / (t.box[2] * t.box[3]) < 0.3) continue;
      if (t.plate && related(t.plate.el, e)) continue;
      if (!topAt(ir, t.el, e)) continue;
      if (e.contains(t.el) || t.el.contains(e)) continue;
      overlaps.push({ a: t.sel, ta: t.text, b: sel(e), tb: (e.innerText || e.getAttribute('aria-label') || '').slice(0, 30), box: ir, boxA: t.box, boxB: r, kind: isBtn(e) ? 'button' : 'card' });
      if (overlaps.length > 90) break;
    }
  }
  out.overlaps = overlaps;
  // font families on screen
  for (const t of live) if (t.fam) famCount.set(t.fam, (famCount.get(t.fam) || 0) + 1);
  out.fams = [...famCount.keys()];

  // ---- buttons
  const cand = new Set(document.querySelectorAll(BTN));
  const all = document.body.querySelectorAll('*');
  if (all.length < 5000) for (const e of all) { if (cand.has(e) || /^(HTML|BODY|CANVAS|svg|path|g|circle|rect|use|SPAN)$/i.test(e.tagName) && e.tagName !== 'SPAN') continue; if (cs(e).cursor === 'pointer' && !(e.parentElement && cs(e.parentElement).cursor === 'pointer')) cand.add(e); }
  for (const e of cand) {
    if (!inRoot(e)) continue;
    const r = R(e); if (r[2] < 4 || r[3] < 4) continue;
    const op = chainOk(e); if (op < 0.3 || cs(e).visibility === 'hidden') continue;
    const ci = clipInfo(e, r); if (ci.vpf < 0.5 || ci.vf < 0.5) continue;
    if (cs(e).pointerEvents === 'none') continue;
    const cv = cover(e, r, ci.vis);
    if (cv.frac >= 0.6 && cv.by && (cv.by.closest('[data-help]') || modalish(cv.by) || (() => { const q = R(cv.by); return q[2] * q[3] > 0.45 * W * H; })())) continue;
    const s = cs(e);
    let hasText = false, textInvisible = null, hasVisual = false;
    for (const t of out.texts) if (e.contains(t.el)) {
      if (!t.letters && !/[^\s]/.test(t.text)) continue;
      if (t.fs <= 0.5) { textInvisible = 'font-size 0'; continue; }
      if (t.col[3] < 0.05) { textInvisible = 'text colour is transparent'; continue; }
      if (t.op < 0.05) { textInvisible = 'text opacity 0'; continue; }
      if (t.visTxt < 0.3 && t.vpf > 0.3) { textInvisible = 'text is clipped away'; continue; }
      if (t.vpf < 0.3) { textInvisible = 'text is outside the screen'; continue; }
      hasText = true;
    }
    for (const c of [e, ...e.querySelectorAll('*')]) {
      const cr = c === e ? r : R(c); const ct = c.tagName.toLowerCase();
      if (/^(img|svg|canvas|video|picture)$/.test(ct) && cr[2] >= 6 && cr[3] >= 6 && (() => { let op = 1; for (let q = c; q && q !== e.parentElement; q = q.parentElement) { const z = cs(q); if (z.display === 'none' || z.visibility === 'hidden') return false; op *= num(z.opacity); } return op > 0.2; })()) { hasVisual = true; break; }
      const cstl = cs(c);
      if (cstl.backgroundImage !== 'none' && cr[2] >= 6) { hasVisual = true; break; }
      for (const ps of ['::before', '::after']) { const ct2 = getComputedStyle(c, ps).content; if (ct2 && ct2 !== 'none' && ct2 !== 'normal' && ct2 !== '""' && ct2 !== "''") { hasVisual = true; } }
      if (hasVisual) break;
    }
    out.btns.push({ sel: sel(e), text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), aria: e.getAttribute('aria-label') || e.getAttribute('title') || '', box: r, display: s.display, hasText, textInvisible, hasVisual,
      cover: cv.frac, coverBy: cv.by ? sel(cv.by) : '', coverModal: cv.by ? modalish(cv.by) : false, coverBig: cv.by ? (() => { const q = R(cv.by); return q[2] * q[3] > 0.45 * W * H; })() : false,
      isObj: OBJRE.test(cls(e)) || /cell|tile|token|piece|spot|slot|hex|square|pip|dot|swatch/i.test(cls(e)), painted: paintedBtn(e), bgImg: s.backgroundImage !== 'none', disabled: !!e.disabled || e.getAttribute('aria-disabled') === 'true',
      inline: s.display === 'inline', scrollAnc: ci.scrollAnc, borderRadius: s.borderRadius });
  }

  // ---- images (<img> and CSS backgrounds)
  const pend = [];
  const dpr = devicePixelRatio;
  for (const im of document.querySelectorAll('img')) {
    if (!inRoot(im)) continue; const r = R(im); if (r[2] < 8 || r[3] < 8 || chainOk(im) < 0.3) continue; const ci = clipInfo(im, r); if (ci.vpf < 0.5) continue;
    const s = cs(im), nw = im.naturalWidth, nh = im.naturalHeight, src = im.currentSrc || im.src;
    const rec = { kind: 'img', sel: sel(im), src: src.slice(0, 120), box: r, broken: im.complete && nw === 0 && !!src, nw, nh, fit: s.objectFit, svg: /\.svg(\?|$)|^data:image\/svg/.test(src) };
    out.imgs.push(rec);
  }
  const seenBg = new Set();
  for (const e of (all.length < 5000 ? all : [])) {
    const s = cs(e); if (s.backgroundImage === 'none' || !/url\(/.test(s.backgroundImage)) continue;
    if (!inRoot(e)) continue; const r = R(e); if (r[2] < 10 || r[3] < 10 || chainOk(e) < 0.3) continue; const ci = clipInfo(e, r); if (ci.vpf < 0.5) continue;
    const urls = [...s.backgroundImage.matchAll(/url\((["']?)(.*?)\1\)/g)].map(m => m[2]);
    const sizes = s.backgroundSize.split(/,(?![^(]*\))/);
    urls.forEach((u, k) => {
      if (/^data:image\/svg|\.svg(\?|$)|gradient/.test(u)) return;
      let abs; try { abs = new URL(u, document.baseURI).href; } catch { return; }
      const rec = { kind: 'bg', sel: sel(e), src: abs.slice(0, 120), box: r, bsize: (sizes[k] || sizes[0]).trim(), pad: [num(s.borderLeftWidth) + num(s.borderRightWidth), num(s.borderTopWidth) + num(s.borderBottomWidth)] };
      out.imgs.push(rec);
      pend.push(new Promise(res => { const im = new Image(); im.onload = () => { rec.nw = im.naturalWidth; rec.nh = im.naturalHeight; res(); }; im.onerror = () => { rec.broken = true; res(); }; im.src = abs; setTimeout(res, 2500); }));
    });
  }
  await Promise.all(pend);

  // ---- boards, cards, tokens
  const objs = [];
  for (const e of document.querySelectorAll('canvas,svg,*')) {
    const tag = e.tagName.toLowerCase(); if (tag === 'svg' && e.closest('svg') !== e) continue;
    if (!(tag === 'canvas' || tag === 'svg' || OBJRE.test(cls(e)) || OBJRE.test(e.id || ''))) continue;
    if (/^(path|g|circle|rect|use|line|polygon|text|defs)$/.test(tag) || tag === 'body') continue;
    if (!inRoot(e)) continue; const r = R(e); if (r[2] < 12 || r[3] < 12 || chainOk(e) < 0.3) continue; const ci = clipInfo(e, r); if (ci.vpf < 0.1) continue;
    const s = cs(e);
    if (tag === 'svg' && (r[2] < 40 || r[3] < 40)) continue;
    objs.push({ e, r, ci, tag, s });
    if (objs.length > 1500) break;
  }
  const kindOf = o => o.tag === 'canvas' ? 'canvas' : (o.tag === 'svg' ? 'svg' : (/board/i.test(cls(o.e) + o.e.id) ? 'board' : 'card'));
  out.objs = objs.map(o => ({ sel: sel(o.e), tag: o.tag, kind: kindOf(o), box: o.r, vf: o.ci.vf, vpf: o.ci.vpf, scrollAnc: o.ci.scrollAnc, op: chainOk(o.e), cover: cover(o.e, o.r, o.ci.vis).frac,
    modal: false, bgImg: o.s.backgroundImage !== 'none', hasArt: !!o.e.querySelector('img,svg,canvas,picture') || o.s.backgroundImage !== 'none', hasTransform: (() => { for (let p = o.e; p && p !== document.body; p = p.parentElement) { if (cs(p).transform !== 'none') return true; } return false; })(),
    bgCol: parseCol(o.s.backgroundColor), radius: o.s.borderRadius, parent: o.e.parentElement ? sel(o.e.parentElement) : '', _i: 0, hasText: (o.e.innerText || '').trim().length > 0,
    pos: o.s.position, rotated: rotated(o.e), cardlike: kindOf(o) === 'card' }));
  // overlap among card-like siblings
  out.cardOverlaps = [];
  const cards = objs.filter(o => kindOf(o) === 'card' && o.r[2] >= 24 && o.r[3] >= 24 && o.ci.vpf > 0.5);
  for (let i = 0; i < cards.length && out.cardOverlaps.length < 40; i++) for (let j = i + 1; j < cards.length; j++) {
    const a = cards[i], b = cards[j]; if (related(a.e, b.e) || a.e.parentElement !== b.e.parentElement) continue;
    const ir = interRect(a.r, b.r); if (!ir) continue; const sm = Math.min(a.r[2] * a.r[3], b.r[2] * b.r[3]); const fr = ir[2] * ir[3] / sm; if (fr <= 0.4) continue;
    if (cs(a.e).transform !== 'none' || cs(b.e).transform !== 'none' || cs(a.e.parentElement).transform !== 'none') continue;
    if (Math.abs(a.r[2] - b.r[2]) < 3 && Math.abs(a.r[3] - b.r[3]) < 3 && Math.hypot(a.r[0] - b.r[0], a.r[1] - b.r[1]) < 0.3 * Math.max(a.r[2], a.r[3])) { if (fr > 0.85 && Math.hypot(a.r[0] - b.r[0], a.r[1] - b.r[1]) < 1.5) continue; }
    const vis = (x) => cover(x.e, x.r, x.ci.vis).frac < 0.5;
    out.cardOverlaps.push({ a: sel(a.e), b: sel(b.e), box: ir, frac: fr, boxA: a.r, boxB: b.r, vis: vis(a) && vis(b) });
  }
  // board = biggest canvas/board
  const bc = objs.filter(o => (o.tag === 'canvas' || kindOf(o) === 'board') && o.r[2] > 100 && o.r[3] > 100).sort((a, b) => b.r[2] * b.r[3] - a.r[2] * a.r[3])[0];
  if (bc) out.board = { sel: sel(bc.e), box: bc.r, frac: inter(bc.r, [0, 0, W, H]) / (W * H), tag: bc.tag };
  // buttons / objs without art (flat CSS)
  if (o.dbg) { out.dbg = out.texts.filter(t => t.text.includes(o.dbg)).map(t => ({ text: t.text, box: t.box, vf: t.visTxt, hf: t.hardFrac, vpf: t.vpf, cover: t.cover, skip: t.skip, anc: (() => { const a = []; for (let p = t.el; p && p !== document.body; p = p.parentElement) { const s = cs(p), r = R(p); a.push([sel(p), s.overflowX + '/' + s.overflowY, s.position, r.map(Math.round).join(',')]); } return a; })(), hit: (() => { const h = document.elementFromPoint(t.box[0] + t.box[2] / 2, t.box[1] + t.box[3] / 2); return h ? sel(h) : null; })() })); }
  out.texts = out.texts.map(t => { const { el, btnEl, coverBy, plate, ...r } = t; r.plate = plate ? { rect: plate.rect, sel: plate.sel, card: plate.card } : null; r.btn = !!btnEl; return r; });
  return out;
}

// ---------------------------------------------------------------- helper page (pixels, crops)
const HELPER = `
window.__px = {
  async load(id, b64, dpr) { const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); this[id] = { c, g, dpr }; return [img.width, img.height]; },
  drop(id) { delete this[id]; },
  lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); },
  lum(r, g, b) { return 0.2126 * this.lin(r) + 0.7152 * this.lin(g) + 0.0722 * this.lin(b); },
  contrast(id, items) {
    const { c, g, dpr } = this[id]; const out = []; const o1 = this[id.replace(/\|bg$/, '')]; const diffs = [];
    for (const it of items) {
      const ratios = [], ratiosO = [];
      for (const rc of it.rects) {
        const x = Math.max(0, Math.floor(rc[0] * dpr)), y = Math.max(0, Math.floor(rc[1] * dpr)), w = Math.min(c.width - x, Math.ceil(rc[2] * dpr)), h = Math.min(c.height - y, Math.ceil(rc[3] * dpr));
        if (w < 2 || h < 2) continue; const d = g.getImageData(x, y, w, h).data; const d1 = o1 ? o1.g.getImageData(x, y, w, h).data : null; const step = Math.max(1, Math.floor(Math.sqrt(w * h / 600)));
        for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) {
          const i = (yy * w + xx) * 4, br = d[i], bg = d[i + 1], bb = d[i + 2];
          if (d1) diffs.push(Math.max(Math.abs(d1[i] - br), Math.abs(d1[i + 1] - bg), Math.abs(d1[i + 2] - bb)));
          const a = it.a, fr = a * it.col[0] + (1 - a) * br, fg = a * it.col[1] + (1 - a) * bg, fb = a * it.col[2] + (1 - a) * bb;
          const L1 = this.lum(fr, fg, fb), L2 = this.lum(br, bg, bb), hi = Math.max(L1, L2), lo = Math.min(L1, L2);
          ratios.push((hi + 0.05) / (lo + 0.05));
          if (it.out) { const o = it.out, L3 = this.lum(o[0], o[1], o[2]), hi2 = Math.max(L1, L3), lo2 = Math.min(L1, L3); ratiosO.push((hi2 + 0.05) / (lo2 + 0.05)); }
        }
      }
      if (!ratios.length) { out.push(null); continue; }
      if (diffs.length) { diffs.sort((p, q) => p - q); if (diffs[Math.floor(diffs.length * 0.95)] >= 110) { out.push(null); diffs.length = 0; continue; } diffs.length = 0; }
      ratios.sort((p, q) => p - q); let r = ratios[ratios.length >> 1];
      if (ratiosO.length) { ratiosO.sort((p, q) => p - q); r = Math.max(r, ratiosO[ratiosO.length >> 1]); }
      out.push(Math.round(r * 100) / 100);
    }
    return out;
  },
  std(id, rc) { const { c, g, dpr } = this[id]; const x = Math.max(0, Math.floor(rc[0] * dpr)), y = Math.max(0, Math.floor(rc[1] * dpr)), w = Math.min(c.width - x, Math.ceil(rc[2] * dpr)), h = Math.min(c.height - y, Math.ceil(rc[3] * dpr)); if (w < 4 || h < 4) return null;
    const d = g.getImageData(x, y, w, h).data; const step = Math.max(1, Math.floor(Math.sqrt(w * h / 4000))); let n = 0, s = 0, s2 = 0; const set = new Set();
    for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) { const i = (yy * w + xx) * 4, l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; n++; s += l; s2 += l * l; set.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4)); }
    const m = s / n; return { std: Math.sqrt(Math.max(0, s2 / n - m * m)), colours: set.size }; },
  crop(id, rc, boxes, maxW, minPad) {
    const { c, dpr } = this[id]; const W = c.width / dpr, H = c.height / dpr; const pad = Math.max(minPad || 30, Math.max(rc[2], rc[3]) * 0.6);
    let x0 = Math.max(0, rc[0] - pad), y0 = Math.max(0, rc[1] - pad), x1 = Math.min(W, rc[0] + rc[2] + pad), y1 = Math.min(H, rc[1] + rc[3] + pad);
    if (x1 - x0 < 160) { const m = (x0 + x1) / 2; x0 = Math.max(0, m - 80); x1 = Math.min(W, m + 80); }
    if (y1 - y0 < 100) { const m = (y0 + y1) / 2; y0 = Math.max(0, m - 50); y1 = Math.min(H, m + 50); }
    const sw = (x1 - x0) * dpr, sh = (y1 - y0) * dpr; let sc = Math.min(1, maxW / sw); if (sw * sc < 260) sc = Math.min(4, 260 / sw);
    const o = document.createElement('canvas'); o.width = Math.round(sw * sc); o.height = Math.round(sh * sc); const g = o.getContext('2d'); g.imageSmoothingEnabled = sc < 1;
    g.drawImage(c, x0 * dpr, y0 * dpr, sw, sh, 0, 0, o.width, o.height);
    g.strokeStyle = '#ff2a2a'; g.lineWidth = 2.5; for (const b of boxes) g.strokeRect((b[0] - x0) * dpr * sc - 2, (b[1] - y0) * dpr * sc - 2, b[2] * dpr * sc + 4, b[3] * dpr * sc + 4);
    return o.toDataURL('image/webp', 0.78).split(',')[1];
  },
  thumb(id, maxW) { const { c } = this[id]; const sc = Math.min(1, maxW / c.width); const o = document.createElement('canvas'); o.width = Math.round(c.width * sc); o.height = Math.round(c.height * sc); o.getContext('2d').drawImage(c, 0, 0, o.width, o.height); return o.toDataURL('image/webp', 0.7).split(',')[1]; },
};`;

const HUSH = `(() => { try {
  const P = HTMLMediaElement.prototype, M = Object.getOwnPropertyDescriptor(P, 'muted');
  if (M) { Object.defineProperty(P, 'muted', { configurable: true, get() { return M.get.call(this); }, set() { M.set.call(this, true); } });
    const play = P.play; P.play = function () { M.set.call(this, true); return play.apply(this, arguments); }; }
  for (const k of ['AudioContext', 'webkitAudioContext']) { const A = window[k]; if (!A) continue; A.prototype.resume = () => Promise.resolve();
    window[k] = function (...a) { const c = new A(...a); try { c.suspend(); } catch {} return c; }; window[k].prototype = A.prototype; }
  if (window.AudioNode && window.AudioDestinationNode) { const con = AudioNode.prototype.connect; AudioNode.prototype.connect = function (t) { return t instanceof AudioDestinationNode ? t : con.apply(this, arguments); }; }
} catch (e) {} })();`;

const HIDE_TEXT = `*,*::before,*::after{color:transparent !important;-webkit-text-fill-color:transparent !important;text-shadow:none !important;-webkit-text-stroke:0 !important;caret-color:transparent !important}svg text,svg tspan{fill:transparent !important;stroke:none !important}`;

// ---------------------------------------------------------------- drivers
async function findClick(p, step, size) {
  const spec = step.text ? { text: step.text } : { sel: step.sel };
  const pos = await p.evaluate(({ spec }) => {
    const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden],[aria-hidden=true]');
    let el = null;
    if (spec.sel) el = [...document.querySelectorAll(spec.sel)].find(vis);
    else { const re = new RegExp(spec.text, 'i'); el = [...document.querySelectorAll('button, a, [role=button], [data-act]')].find(e => vis(e) && re.test((e.textContent || e.getAttribute('aria-label') || '').trim())); }
    if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, { spec });
  return pos;
}
async function runSteps(p, steps, size) {
  for (const raw of steps) {
    const s = typeof raw === 'string' ? SCENES[raw] : raw;
    if (s.onlyIfNoDrawer && await p.evaluate(() => !!document.querySelector('.gx-drawer.on'))) continue;
    let pos = null;
    for (let t = 0; t < (s.optional ? 6 : 14) && !(pos = await findClick(p, s, size)); t++) await sleep(300);
    if (pos) { await tap(p, pos.x, pos.y, size); await sleep(1100); }
  }
}
async function tap(p, x, y, size) {
  try { if (size.mobile) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); } catch {}
}
async function freeze(p) { await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.pause(); } catch {} }); } catch {} }); }
async function unfreeze(p) { await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.play(); } catch {} }); } catch {} }); }

// ---------------------------------------------------------------- judging
const PHONE_MIN = 11, PC_MIN = 12;
const nice = s => s.replace(/^.*[ >]\s*/, '').replace(/^[a-z0-9]+(?=[.#])/, '').replace(/[.#]/g, ' ').trim().replace(/[-_]+/g, ' ') || s;
const gridPx = (w, h, dpr) => { const up = v => v <= 512 ? 512 : 1024; return [up(Math.ceil(w * dpr)), up(Math.ceil(h * dpr))]; };

function judge(raw, ctx) {
  const { size, screen, contrastOf } = ctx; const phone = size.mobile; const F = [];
  const add = (f) => F.push({ size: size.id, screen, ...f });
  // 1 text size
  for (const t of raw.texts) {
    if (t.skip || !t.letters || t.dis) continue;
    const px = t.fs * t.scale; const th = t.rects[0][3]; const min = phone ? PHONE_MIN : PC_MIN;
    if (px < min - 0.01 && th < min * 1.9) {
      add({ check: 'size', sev: px < 9 ? 'severe' : 'warn', sel: t.sel, text: t.text, box: t.box, key: `size|${t.sel}|${px < 9 ? 'xs' : 's'}`, num: Math.round(px * 10) / 10,
        desc: `${cap(nice(t.sel))} text "${t.text.slice(0, 24)}" is ${Math.round(px * 10) / 10} px on ${phone ? 'phone' : 'PC'}` });
    }
  }
  // 2 contrast (+ button label invisible)
  for (const t of raw.texts) {
    if (t.skip || !t.letters || t.dis || t.__ratio == null || t.clipText) continue;
    const r = t.__ratio;
    if (r < 3) {
      const inBtn = !!t.btn;
      if (r < 1.3 && inBtn) add({ check: 'button', sev: 'severe', sel: t.sel, text: t.text, box: t.box, key: `labelinvis|${t.sel}`, num: r, desc: `Button label "${t.text.slice(0, 24)}" is invisible: same colour as its background (contrast ${r}:1)` });
      else add({ check: 'contrast', sev: r < 2 ? 'severe' : 'warn', sel: t.sel, text: t.text, box: t.box, key: `contrast|${t.sel}`, num: r, desc: `${cap(nice(t.sel))} text "${t.text.slice(0, 24)}" is hard to read: contrast ${r}:1` });
    }
  }
  // 3 cut off
  for (const t of raw.texts) {
    if (t.skip || !t.letters) continue;
    if (t.overflow) add({ check: 'overflow', sev: /hidden by|clips|cuts/.test(t.overflow) ? 'warn' : 'warn', sel: t.sel, text: t.text, box: t.box, key: `ovf|${t.sel}|${t.overflow}`, desc: `${cap(nice(t.sel))} text "${t.text.slice(0, 24)}" ${t.overflow}` });
    else if (t.plate && !t.scrollAnc) {
      const p = t.plate.rect, b = t.box; const out = Math.max(0, p[0] - b[0], p[1] - b[1], b[0] + b[2] - (p[0] + p[2]), b[1] + b[3] - (p[1] + p[3]));
      if (out > Math.max(3, b[3] * 0.18) && out < 200) add({ check: t.plate.card ? 'cards' : 'overflow', sev: 'warn', sel: t.sel, text: t.text, box: t.box, key: `plate|${t.sel}`, el: t.plate, desc: t.plate.card ? `${cap(nice(t.sel))} text "${t.text.slice(0, 24)}" spills out of its card by ${Math.round(out)} px` : `${cap(nice(t.sel))} text "${t.text.slice(0, 24)}" spills ${Math.round(out)} px outside its plate` });
    }
  }
  // 4 overlaps
  for (const o of raw.overlaps) add({ check: 'overlap', sev: o.kind === 'text' ? 'warn' : 'warn', sel: o.a, text: o.ta, box: o.box, key: `ovl|${o.a}|${o.b}`, desc: o.kind === 'text' ? `"${o.ta.slice(0, 20)}" (${nice(o.a)}) overlaps the text "${o.tb.slice(0, 20)}" (${nice(o.b)})` : `"${o.ta.slice(0, 20)}" (${nice(o.a)}) sits on top of ${o.kind} ${nice(o.b)}${o.tb ? ' "' + o.tb.slice(0, 16) + '"' : ''}` });
  // 5 fonts
  for (const f of new Set(raw.fontsErr)) add({ check: 'fonts', sev: 'severe', sel: '@font-face', text: f, box: [0, 0, 1, 1], key: `font|${f}`, desc: `Font "${f}" failed to load` });
  if (raw.fams.length > 4) add({ check: 'fonts', sev: 'warn', sel: 'page', text: raw.fams.join(', '), box: [0, 0, 1, 1], key: 'fams', desc: `${raw.fams.length} font families on one screen (${raw.fams.slice(0, 6).join(', ')})` });
  // 6 buttons
  for (const b of raw.btns) {
    if (b.disabled) continue;
    const w = b.box[2], h = b.box[3];
    const label = nice(b.sel);
    if (phone && !b.inline && !b.isObj && (w < 40 || h < 40) && !b.scrollAnc && (b.text || b.aria || b.hasVisual || b.painted)) add({ check: 'button', sev: Math.min(w, h) < 24 ? 'severe' : 'warn', sel: b.sel, text: b.text || b.aria, box: b.box, key: `tap|${b.sel}`, num: `${Math.round(w)}x${Math.round(h)}`, desc: `${cap(label)} button${b.text ? ' "' + b.text.slice(0, 20) + '"' : ''} is only ${Math.round(w)}x${Math.round(h)} px to tap` });
    if (!b.hasText && !b.hasVisual && (b.aria || b.textInvisible) && (b.painted || b.bgImg) && w >= 20 && h >= 20 && !b.isObj) add({ check: 'button', sev: 'severe', sel: b.sel, text: b.aria || b.text, box: b.box, key: `nolabel|${b.sel}`, desc: `${cap(b.aria ? b.aria.slice(0, 24) : label)} button has no visible label${b.textInvisible ? ' (' + b.textInvisible + ')' : ''}` });
    else if (!b.hasText && b.textInvisible && b.hasVisual && /font-size 0|transparent|opacity|clipped/.test(b.textInvisible) === false) { /* fine */ }
    if (b.cover >= 0.6 && !b.coverModal && !b.coverBig) add({ check: 'button', sev: b.cover >= 0.99 ? 'severe' : 'warn', sel: b.sel, text: b.text || b.aria, box: b.box, key: `cover|${b.sel}|${b.coverBy}`, desc: `${cap(label)} button${b.text ? ' "' + b.text.slice(0, 20) + '"' : ''} is covered by ${nice(b.coverBy) || 'another element'}` });
  }
  // 7 images
  for (const im of raw.imgs) {
    const dpr = size.dpr; let w = im.box[2], h = im.box[3]; const nm = im.src.split('/').pop().slice(0, 40);
    const art = (extra) => ({ needs_art: true, element: extra.element, target_px: gridPx(Math.max(w, 1), Math.max(h, 1), dpr), ratio: Math.round((w / h) * 100) / 100, transparent: extra.transparent !== false && w * h < 0.35 * raw.W * raw.H });
    if (im.broken) { add({ check: 'images', sev: 'severe', sel: im.sel, text: nm, box: im.box, key: `broken|${im.sel}|${nm}`, desc: `${cap(nice(im.sel))} picture ${nm} did not load`, ...art({ element: `${nice(im.sel)} picture` }) }); continue; }
    if (!im.nw || !im.nh || im.svg) continue;
    let dw = w, dh = h, mode = im.kind === 'img' ? im.fit : 'bg:' + im.bsize;
    const ar = im.nw / im.nh, boxAr = w / h;
    let stretched = false, cutFrac = 0; const big = w * h > 0.4 * raw.W * raw.H;
    if (im.kind === 'img') {
      if (im.fit === 'fill') { stretched = Math.abs(boxAr / ar - 1) > 0.04; }
      else if (im.fit === 'cover') { const vis = Math.min(boxAr / ar, ar / boxAr); cutFrac = 1 - vis; const sc = Math.max(w / im.nw, h / im.nh); dw = im.nw * sc; dh = im.nh * sc; }
      else if (im.fit === 'contain' || im.fit === 'scale-down') { const sc = Math.min(w / im.nw, h / im.nh); dw = im.nw * sc; dh = im.nh * sc; }
      else if (im.fit === 'none') { dw = im.nw; dh = im.nh; }
    } else {
      const bs = im.bsize; const bw = w - im.pad[0], bh = h - im.pad[1];
      if (/^100%\s+100%$/.test(bs) || bs === '100%') { if (bs !== '100%') stretched = Math.abs(bw / bh / ar - 1) > 0.04; dw = bw; dh = bh; }
      else if (bs === 'cover') { const vis = Math.min(bw / bh / ar, ar / (bw / bh)); cutFrac = 1 - vis; const sc = Math.max(bw / im.nw, bh / im.nh); dw = im.nw * sc; dh = im.nh * sc; }
      else if (bs === 'contain') { const sc = Math.min(bw / im.nw, bh / im.nh); dw = im.nw * sc; dh = im.nh * sc; }
      else if (bs === 'auto' || bs === 'auto auto') { dw = im.nw; dh = im.nh; }
      else { const m = bs.match(/^([\d.]+)(px|%)\s*([\d.]+)?(px|%)?/); if (m) { dw = m[2] === '%' ? bw * m[1] / 100 : +m[1]; dh = m[3] ? (m[4] === '%' ? bh * m[3] / 100 : +m[3]) : dw / ar; } else { dw = im.nw; dh = im.nh; } }
    }
    const e = nice(im.sel) + (im.kind === 'bg' ? ' plate' : ' picture');
    if (big) { stretched = false; }
    if (stretched) add({ check: 'images', sev: 'warn', sel: im.sel, text: nm, box: im.box, key: `stretch|${im.sel}|${nm}`, desc: `${cap(nice(im.sel))} art ${nm} is stretched (box ${Math.round(w)}x${Math.round(h)}, picture ${im.nw}x${im.nh})`, ...art({ element: e }) });
    else if (cutFrac > 0.35 && !big) add({ check: 'images', sev: 'warn', sel: im.sel, text: nm, box: im.box, key: `crop|${im.sel}|${nm}`, desc: `${cap(nice(im.sel))} art ${nm} is cropped hard (${Math.round(cutFrac * 100)}% cut off)`, ...art({ element: e }) });
    const up = Math.max(dw * dpr / im.nw, dh * dpr / im.nh);
    if (up > 1.6 && Math.min(dw, dh) >= 24) add({ check: 'images', sev: up > 3 ? 'warn' : 'warn', sel: im.sel, text: nm, box: im.box, key: `blur|${im.sel}|${nm}`, num: Math.round(up * 10) / 10, desc: `${cap(nice(im.sel))} art ${nm} is blurry: ${im.nw}x${im.nh} picture drawn at ${Math.round(dw * dpr)}x${Math.round(dh * dpr)} px (${Math.round(up * 10) / 10}x upscale)`, ...art({ element: e }) });
  }
  // 8 boards/cards/tokens
  for (const o of raw.objs) {
    if (o.op < 0.5 || o.cover >= 0.6) continue;
    if (o.__blank) add({ check: 'boards', sev: 'severe', sel: o.sel, text: o.tag, box: o.box, key: `blank|${o.sel}`, desc: `${cap(nice(o.sel))} ${o.tag === 'canvas' ? 'canvas' : 'area'} is blank (nothing drawn)` });
  }
  if (ctx.isBoardScreen && phone && raw.board && raw.board.frac < 0.55) add({ check: 'boards', sev: raw.board.frac < 0.35 ? 'severe' : 'warn', sel: raw.board.sel, text: 'board', box: raw.board.box, key: `boardsize|${raw.board.sel}`, num: Math.round(raw.board.frac * 100), desc: `Board fills only ${Math.round(raw.board.frac * 100)}% of the phone screen (wanted 55% or more)` });
  for (const c of raw.cardOverlaps) if (c.vis) add({ check: 'cards', sev: 'warn', sel: c.a, text: '', box: c.box, key: `cardovl|${c.a}`, desc: `${cap(nice(c.a))} overlaps ${nice(c.b)} by ${Math.round(c.frac * 100)}%` });
  for (const o of raw.objs) {
    if (o.kind !== 'card' || o.hasTransform || o.scrollAnc || o.op < 0.5 || o.cover >= 0.6) continue;
    if (o.box[2] >= 40 && o.box[3] >= 40 && o.vpf > 0.1 && o.vpf < 0.9) add({ check: 'cards', sev: 'warn', sel: o.sel, text: '', box: o.box, key: `cardcut|${o.sel}`, desc: `${cap(nice(o.sel))} is cut off by the screen edge (${Math.round(o.vpf * 100)}% visible)` });
  }
  // 9 page
  if (raw.pageScroll) add({ check: 'page', sev: 'severe', sel: 'html', text: '', box: [0, 0, raw.W, raw.H], key: 'hscroll', desc: 'Page scrolls sideways' });
  for (const e of ctx.errors) add({ check: 'page', sev: e.fatal ? 'severe' : 'warn', sel: 'console', text: e.text.slice(0, 120), box: [0, 0, 1, 1], key: `err|${e.text.slice(0, 50)}`, desc: `${e.fatal ? 'Page error' : 'Console error'}: ${e.text.slice(0, 100)}` });
  for (const n of ctx.net) add({ check: 'images', sev: 'severe', sel: 'network', text: n.url, box: [0, 0, 1, 1], key: `net|${n.url}`, desc: `${n.type} failed to load (${n.status}): ${n.url.split('/').slice(-2).join('/').slice(0, 60)}`, ...(n.type === 'image' ? { needs_art: true, element: 'missing picture ' + n.url.split('/').pop(), target_px: [1024, 1024], ratio: 1, transparent: true } : {}) });
  // flat CSS art: painted-by-CSS-only plates (buttons and cards)
  const seen = new Set();
  for (const b of raw.btns) {
    if (b.disabled || b.isObj || b.bgImg || b.hasVisual || b.inline || !b.painted) continue; const w = b.box[2], h = b.box[3]; if (w < 56 || h < 28 || w * h > 0.3 * raw.W * raw.H) continue;
    if (!(b.text || b.aria)) continue; const k = b.sel; if (seen.has(k)) continue; seen.add(k);
    add({ check: 'art', sev: 'info', sel: b.sel, text: b.text || b.aria, box: b.box, key: `flatbtn|${b.sel}`, desc: `${cap(b.aria ? b.aria.slice(0, 20) : nice(b.sel))} button plate is flat CSS, no painting`, needs_art: true, element: `${nice(b.sel)} button plate`, target_px: gridPx(w, h, size.dpr), ratio: Math.round(w / h * 100) / 100, transparent: true });
  }
  for (const o of raw.objs) {
    if (o.kind !== 'card' || o.hasArt || o.op < 0.5 || o.cover >= 0.6 || o.box[2] < 44 || o.box[3] < 44 || o.box[2] * o.box[3] > 0.3 * raw.W * raw.H) continue; if (!(o.bgCol[3] > 0.3)) continue;
    const k = o.sel; if (seen.has(k)) continue; seen.add(k);
    add({ check: 'art', sev: 'info', sel: o.sel, text: '', box: o.box, key: `flatobj|${o.sel}`, desc: `${cap(nice(o.sel))} is drawn in flat CSS, no painting`, needs_art: true, element: `${nice(o.sel)} frame`, target_px: gridPx(o.box[2], o.box[3], size.dpr), ratio: Math.round(o.box[2] / o.box[3] * 100) / 100, transparent: true });
  }
  return F;
}
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

// ---------------------------------------------------------------- one game
async function checkGame(browser, helper, port, slug, deadline) {
  const findings = []; const screens = []; const shots = {}; const t0 = Date.now();
  const sc = SCENES.SCENES_FOR[slug];
  const boardSteps = sc ? sc[1][1] : SCENES.BOARD;
  const midNeeds = !sc;
  for (const size of SIZES) {
    if (Date.now() > deadline) { findings.push({ size: size.id, screen: 'all', check: 'page', sev: 'warn', sel: 'look-check', text: '', box: [0, 0, 1, 1], key: 'timeout', desc: 'Look check ran out of time before this size' }); break; }
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, isMobile: size.mobile, hasTouch: size.mobile, userAgent: size.mobile ? UA : undefined, serviceWorkers: 'block' });
    await ctx.addInitScript(HUSH);
    const p = await ctx.newPage(); let errors = [], net = []; const ext = new Set();
    p.on('pageerror', e => errors.push({ text: String(e.message || e), fatal: true }));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|favicon|WebGL|GPU stall|GroupMarker/i.test(m.text())) errors.push({ text: m.text(), fatal: false }); });
    p.on('response', r => { const u = r.url(); const t = r.request().resourceType(); if (r.status() >= 400 && u.includes('127.0.0.1') && !/favicon/.test(u) && /image|font|media|fetch|xhr|other|stylesheet|script/.test(t)) net.push({ url: u.replace(/^https?:\/\/[^/]+/, ''), status: r.status(), type: t === 'other' || t === 'fetch' || t === 'xhr' ? (/\.(glb|gltf|bin)/.test(u) ? 'model' : 'file') : t }); });
    p.on('requestfailed', r => { const u = r.url(); if (u.includes('127.0.0.1') && !/favicon/.test(u) && !/ABORTED/.test(r.failure() ? r.failure().errorText : '')) net.push({ url: u.replace(/^https?:\/\/[^/]+/, ''), status: 'failed', type: r.resourceType() }); });
    await p.route(u => !/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(u.toString()), r => r.abort());
    const snap = async (name, opts = {}) => {
      const id = `${slug}|${size.id}|${name}`;
      await freeze(p);
      const raw = await p.evaluate(pageCollect, { phone: size.mobile, dbg: process.env.LOOK_TEXT || '', modal: !!opts.modal });
      if (raw.dbg && raw.dbg.length) console.log('DBG', size.id, name, JSON.stringify(raw.dbg, null, 1));
      if (process.env.LOOK_DEBUG) fs.mkdirSync(process.env.LOOK_DEBUG, { recursive: true });
      // strip DOM refs (not serialisable) - evaluate already serialised plain data only
      const n1 = await p.screenshot({ type: 'jpeg', quality: 88 });
      await p.addStyleTag({ content: HIDE_TEXT }).then(h => h.evaluate(e => e.id = '__lc_hide'));
      const n2 = await p.screenshot({ type: 'jpeg', quality: 88 });
      await p.evaluate(() => { const e = document.getElementById('__lc_hide'); if (e) e.remove(); });
      await unfreeze(p);
      if (process.env.LOOK_DEBUG) { fs.writeFileSync(path.join(process.env.LOOK_DEBUG, `${size.id}-${name}-1.jpg`), n1); fs.writeFileSync(path.join(process.env.LOOK_DEBUG, `${size.id}-${name}-2.jpg`), n2); }
      return { id, raw, n1, n2 };
    };
    // loading both screenshots into helper (explicit, avoids arguments trick)
    const loadPx = async (id, n1, n2) => {
      await helper.evaluate(async ([id, a, b, dpr]) => { await __px.load(id, a, dpr); await __px.load(id + '|bg', b, dpr); }, [id, n1.toString('base64'), n2.toString('base64'), size.dpr]);
    };
    const screen = async (name, isBoard, modal) => {
      const sn = await snap(name, { modal }); const id = sn.id; const raw = sn.raw;
      await loadPx(id, sn.n1, sn.n2);
      const items = [], idx = [];
      raw.texts.forEach((t, i) => { if (t.skip || !t.letters || t.dis) return; const a = Math.min(1, (t.col[3] || 1) * (t.op || 1)); const rects = [...t.rects].map(q => { const v = t.vis, x0 = Math.max(q[0], v[0]), y0 = Math.max(q[1], v[1]), x1 = Math.min(q[0] + q[2], v[0] + v[2]), y1 = Math.min(q[1] + q[3], v[1] + v[3]); return x1 - x0 > 1 && y1 - y0 > 1 ? [x0, y0, x1 - x0, y1 - y0] : null; }).filter(Boolean).sort((x, y) => y[2] * y[3] - x[2] * x[3]).slice(0, 3); if (!rects.length) return;
        const it = { rects, col: t.col, a };
        if (t.stroke > 0 && t.strokeCol[3] > 0.3) it.out = t.strokeCol; else { const m = (t.shadow || '').match(/rgba?\([^)]+\)/); if (m && !/none/.test(t.shadow)) { const c = m[0].match(/[\d.]+/g).map(Number); if ((c.length < 4 || c[3] > 0.3) && !/\b0px 0px 0px\b/.test(t.shadow)) it.out = c.slice(0, 3); } }
        items.push(it); idx.push(i); });
      const rs = items.length ? await helper.evaluate(([id, items]) => __px.contrast(id + '|bg', items), [id, items]) : [];
      idx.forEach((i, k) => { raw.texts[i].__ratio = rs[k]; });
      for (const o of raw.objs) if ((o.tag === 'canvas') && o.box[2] >= 60 && o.box[3] >= 60 && o.op >= 0.5 && o.cover < 0.6 && o.vpf > 0.5) {
        const s = await helper.evaluate(([id, b]) => __px.std(id, b), [id, o.box]); if (s && s.std < 1.2 && s.colours <= 2) o.__blank = true; }
      const f = judge(raw, { size, screen: name, errors, net, isBoardScreen: !!isBoard });
      errors = []; net = [];
      shots[id] = { id, size: size.id, screen: name, dpr: size.dpr };
      findings.push(...f.map(x => ({ ...x, shot: id })));
      screens.push({ id, size: size.id, screen: name });
      return raw;
    };
    try {
      await p.goto(`http://127.0.0.1:${port}/${slug}/index.html?fresh=1`, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
      await sleep(3000);
      await screen('start', false);
      // board
      await runSteps(p, boardSteps, size); await sleep(2500);
      await screen('board', true);
      // mid-game: tap a few glowing targets, let the computer move
      for (let k = 0; k < 3; k++) {
        const pos = await p.evaluate(() => { const e = [...document.querySelectorAll('.glow,.rglow,.rec,.rrec')].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && !e.closest('[data-help],[hidden]'); }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.min(innerWidth - 4, Math.max(4, r.left + Math.min(r.width / 2, 22))), y: r.top + r.height / 2 }; });
        if (pos) { await tap(p, pos.x, pos.y, size); await sleep(1800); } else await sleep(1500);
      }
      await sleep(3000);
      await screen('mid-game', true);
      // help / rules panel
      const before = await p.evaluate(() => document.body.innerHTML.length);
      let opened = false;
      for (const st of SCENES.HELP) { const pos = await findClick(p, st, size); if (pos) { await tap(p, pos.x, pos.y, size); await sleep(900); } }
      let dlg = await p.evaluate(() => !!document.querySelector('.gxh-rules.on, .gxh-rules[open], [role=dialog]:not([hidden])') && [...document.querySelectorAll('.gxh-rules,[role=dialog]')].some(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width > 100));
      if (!dlg) { // try via menu
        const mpos = await findClick(p, { sel: '[aria-label="Menu"]' }, size); if (mpos) { await tap(p, mpos.x, mpos.y, size); await sleep(900);
          const hp = await findClick(p, { text: 'help|how to play|how this works|rules' }, size); if (hp) { await tap(p, hp.x, hp.y, size); await sleep(900); } }
        dlg = await p.evaluate(() => [...document.querySelectorAll('.gxh-rules,[role=dialog],.gx-drawer.on')].some(e => e.getClientRects().length && e.getBoundingClientRect().width > 100));
      }
      if (dlg) await screen('help', false, true); else screens.push({ id: null, size: size.id, screen: 'help (none found)' });
      await p.keyboard.press('Escape').catch(() => {}); await sleep(400);
      for (const s of [{ sel: '.gxh-x, .gx-x, [data-gx=close]' }]) { const pos = await findClick(p, s, size); if (pos) { await tap(p, pos.x, pos.y, size); await sleep(500); } }
      // card zoom / hold
      const cpos = await p.evaluate(() => { const e = [...document.querySelectorAll('.hc,.pc,.pcard,.card:not(.dj),[data-card]')].find(e => { const r = e.getBoundingClientRect(); return r.width > 30 && r.height > 30 && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]'); }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.min(innerWidth - 4, Math.max(4, r.left + r.width / 2)), y: Math.min(innerHeight - 4, r.top + r.height / 2) }; });
      if (cpos) {
        const len0 = await p.evaluate(() => document.body.innerHTML.length);
        await p.mouse.move(cpos.x, cpos.y); await p.mouse.down(); await sleep(750);
        const zoomed = await p.evaluate(() => [...document.querySelectorAll('[class*=zoom],[class*=preview],[class*=big],[class*=peek],[class*=detail]')].some(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width > 80));
        if (zoomed) await screen('card-zoom', false, true);
        await p.mouse.up();
      }
    } catch (e) { findings.push({ size: size.id, screen: 'all', check: 'page', sev: 'warn', sel: 'look-check', text: '', box: [0, 0, 1, 1], key: 'drv|' + String(e.message).slice(0, 40), desc: 'Look check could not drive this screen: ' + String(e.message).slice(0, 80) }); }
    await ctx.close();
    if (flag('no-shots') === false) { /* shots kept in helper until crops are made */ }
  }
  return { findings, screens, shots, ms: Date.now() - t0 };
}

// ---------------------------------------------------------------- merge + crops + report
const SEV = { severe: 3, warn: 2, info: 1 };
function merge(findings) {
  const m = new Map();
  for (const f of findings) {
    const k = `${f.check}|${f.key}`;
    let g = m.get(k);
    if (!g) { g = { ...f, count: 0, sites: [], instances: new Set(), _best: f }; m.set(k, g); }
    g.count++; const site = `${f.size}:${f.screen}`; if (!g.sites.includes(site)) g.sites.push(site);
    if (SEV[f.sev] > SEV[g.sev]) g.sev = f.sev;
    const prefer = (a, b) => (a.size === 'phone' ? 0 : a.size === 'small' ? 1 : 2) < (b.size === 'phone' ? 0 : b.size === 'small' ? 1 : 2) || (a.size === b.size && SEV[a.sev] > SEV[b.sev]);
    if (prefer(f, g._best)) g._best = f;
    if (f.needs_art && f.target_px) { const [aw, ah] = f.target_px, [bw, bh] = g.target_px || [0, 0]; if (aw * ah > bw * bh) g.target_px = f.target_px; }
  }
  return [...m.values()].map(g => { const b = g._best; const o = { check: g.check, sev: g.sev, sel: b.sel, text: b.text, desc: b.desc, box: b.box.map(v => Math.round(v * 10) / 10), size: b.size, screen: b.screen, shot: b.shot, count: g.count, sites: g.sites, num: b.num };
    if (g.needs_art) Object.assign(o, { needs_art: true, element: g.element, target_px: g.target_px, ratio: g.ratio, transparent: g.transparent }); return o; })
    .sort((a, b) => SEV[b.sev] - SEV[a.sev] || b.count - a.count);
}

async function main() {
  const slugsAll = listSlugs();
  const want = optAll('game'); const slugs = want.length ? want : slugsAll;
  for (const s of slugs) if (!slugsAll.includes(s)) { console.error('unknown game', s); process.exit(2); }
  const gate = flag('gate'), saveBase = flag('baseline');
  fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });
  const [srv, port] = await serve();
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  const hctx = await browser.newContext(); const helper = await hctx.newPage(); await helper.setContent('<html></html>'); await helper.evaluate(HELPER);
  let report = { generated: new Date().toISOString(), sizes: SIZES.map(s => s.label), games: {} };
  const repFile = path.join(OUT, 'report.json');
  if (want.length && fs.existsSync(repFile)) { try { const old = JSON.parse(fs.readFileSync(repFile, 'utf8')); report.games = old.games || {}; } catch {} }
  for (const slug of slugs) {
    const t0 = Date.now(); console.log(`[look] ${slug} ...`);
    let res;
    try { res = await Promise.race([checkGame(browser, helper, port, slug, Date.now() + GAME_MS), new Promise((_, rj) => setTimeout(() => rj(new Error('game timeout')), GAME_MS + 60000))]); }
    catch (e) { console.log(`[look] ${slug} FAILED: ${e.message}`); report.games[slug] = { error: e.message, severe: 0, warn: 0, info: 0, findings: [], counts: {}, screens: [] }; continue; }
    const merged = merge(res.findings);
    // crops
    const gdir = path.join(OUT, 'img', slug); fs.rmSync(gdir, { recursive: true, force: true }); fs.mkdirSync(gdir, { recursive: true });
    let n = 0; const cap = +opt('max-crops', 36);
    for (const f of merged) {
      if (n >= cap || f.sel === 'network' || f.sel === 'console' || f.sel === 'look-check' || !f.shot || flag('no-shots')) continue;
      try {
        const b = await helper.evaluate(([id, box]) => __px.crop(id, box, [box], 800, 28), [f.shot, f.box]);
        const file = `f${n++}.webp`; fs.writeFileSync(path.join(gdir, file), Buffer.from(b, 'base64')); f.img = `img/${slug}/${file}`;
      } catch (e) { /* shot missing */ }
    }
    const scr = [];
    for (const s of res.screens) if (s.id && (s.size === 'phone' || s.size === 'pc') && !flag('no-shots')) {
      try { const b = await helper.evaluate(([id, w]) => __px.thumb(id, w), [s.id, s.size === 'pc' ? 640 : 360]); const file = `s-${s.size}-${s.screen}.webp`; fs.writeFileSync(path.join(gdir, file), Buffer.from(b, 'base64')); scr.push({ size: s.size, screen: s.screen, img: `img/${slug}/${file}` }); } catch {}
    }
    for (const s of res.screens) if (s.id) await helper.evaluate(id => { __px.drop(id); __px.drop(id + '|bg'); }, s.id).catch(() => {});
    const counts = {}; for (const f of merged) { const c = counts[f.check] || (counts[f.check] = { severe: 0, warn: 0, info: 0 }); c[f.sev]++; }
    const tot = s => merged.filter(f => f.sev === s).length;
    report.games[slug] = { severe: tot('severe'), warn: tot('warn'), info: tot('info'), counts, findings: merged, screens: scr, seconds: Math.round((Date.now() - t0) / 1000) };
    console.log(`[look] ${slug}: ${tot('severe')} severe, ${tot('warn')} warn, ${tot('info')} info in ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  await browser.close(); srv.close();
  report.generated = new Date().toISOString();
  fs.writeFileSync(repFile, JSON.stringify(report));
  // needs-art list
  const na = [];
  for (const [slug, g] of Object.entries(report.games)) for (const f of g.findings || []) if (f.needs_art) na.push({ game: slug, check: f.check, element: f.element, sel: f.sel, issue: f.desc, target_px: f.target_px, ratio: f.ratio, transparent: f.transparent, needs_art: true, img: f.img || null, sites: f.sites });
  fs.writeFileSync(path.join(OUT, 'needs-art.json'), JSON.stringify({ generated: report.generated, items: na }, null, 1));
  // keys for the gate: check + sel (stable across runs)
  const keysOf = g => (g.findings || []).filter(f => f.sev === 'severe').map(f => `${f.check}|${f.sel}`);
  if (saveBase) {
    let b = {}; try { b = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch {}
    for (const [slug, g] of Object.entries(report.games)) b[slug] = { severe: g.severe, warn: g.warn, severeKeys: [...new Set(keysOf(g))].sort(), counts: Object.fromEntries(Object.entries(g.counts || {}).map(([k, v]) => [k, v.severe + v.warn])) };
    fs.writeFileSync(BASE, JSON.stringify(b, null, 1)); console.log('[look] baseline saved to', path.relative(ROOT, BASE));
  }
  let fail = 0;
  if (gate) {
    let b = {}; try { b = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch {}
    for (const slug of slugs) { const g = report.games[slug]; const base = new Set((b[slug] || {}).severeKeys || []); const fresh = [...new Set(keysOf(g))].filter(k => !base.has(k));
      if (!b[slug]) console.log(`[look] ${slug}: no baseline yet, report only (${g.severe} severe)`);
      else if (fresh.length) { fail++; console.log(`[look] ${slug}: NEW severe findings: ${fresh.slice(0, 6).join('; ')}`); } else console.log(`[look] ${slug}: no new severe findings (${g.severe} known)`); }
  }
  fs.copyFileSync(path.join(__dirname, 'look-index.html'), path.join(OUT, 'index.html'));
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
