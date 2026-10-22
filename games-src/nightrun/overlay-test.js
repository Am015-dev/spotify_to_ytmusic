#!/usr/bin/env node
// OVERLAY gate (review 9 fixes #2 and #5, parts/explain.js): 60 s each of story stages 1, 3, 6, 10 on a 390x763 phone, bot flies + fires, god mode, seeded.
//   overlay inventory  every overlay kind drawn (beams, lanes, rings, chevrons, bars, ticks, marks: known families + any draw spanning > 45% of the field)
//                      has a caption id in EXP.OVL with a caption text, and that caption showed in the run where the overlay was drawn
//   white beam         max run of near-white columns (>= half the field height) <= 4 css px in every probed frame
//   labels (#5)        in stages 1, 3, 10: 0 text boxes (caption box, queued label, word floaters) overlapping each other or an enemy rect
//   off                ?explain=0 restores the old floaters. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/overlay-test.js        env GAME_DIR=<built dir>  SECS=60
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), PARTS = path.join(__dirname, 'parts');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + JSON.stringify(i).slice(0, 600))); };
const lineMap = () => { const m = new Map(); for (const f of fs.readdirSync(PARTS)) if (f.endsWith('.js')) fs.readFileSync(path.join(PARTS, f), 'utf8').split('\n').forEach((l, i) => { if (l.trim().length > 12 && !m.has(l)) m.set(l, f + ':' + (i + 1)); }); return m; };
const PROBE = () => {
  Error.stackTraceLimit = 40; window.__probe = 0; window.__sites = {}; const P = CanvasRenderingContext2D.prototype;
  const add = (c, x, y) => { const t = c.getTransform(), X = t.a * x + t.c * y + t.e, Y = t.b * x + t.d * y + t.f, b = c.__bb || (c.__bb = [1e9, 1e9, -1e9, -1e9]); b[0] = Math.min(b[0], X); b[1] = Math.min(b[1], Y); b[2] = Math.max(b[2], X); b[3] = Math.max(b[3], Y); };
  const bp = P.beginPath; P.beginPath = function () { this.__bb = null; return bp.apply(this, arguments); };
  for (const k of ['moveTo', 'lineTo']) { const o = P[k]; P[k] = function (x, y) { add(this, x, y); return o.apply(this, arguments); }; }
  const rc = P.rect; P.rect = function (x, y, w, h) { add(this, x, y); add(this, x + w, y + h); return rc.apply(this, arguments); };
  for (const k of ['fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'drawImage']) { const o = P[k]; P[k] = function () {
    if (window.__probe) { let big = 0; if (k !== 'drawImage' && !k.endsWith('Text')) { let b; if (k.endsWith('Rect')) { const [x, y, w, h] = arguments; const s = this.__bb; this.__bb = null; add(this, x, y); add(this, x + w, y + h); b = this.__bb; this.__bb = s; } else b = this.__bb;
        if (b) { const W = this.canvas.width, H = this.canvas.height; big = (b[2] - b[0] > W * .45 && b[3] - b[1] < H * .2) || (b[3] - b[1] > H * .45 && b[2] - b[0] < W * .2) ? 1 : 0; } }
      const s = new Error().stack.split('\n').slice(2).filter(l => /index\.html/.test(l)).slice(0, 9).map(l => { const m = l.match(/at (?:(\S+) \()?.*index\.html[^:]*:(\d+):(\d+)/); return m ? (m[1] || '?') + '@' + m[2] : '?'; }).join('<');
      const r = window.__sites[s] || (window.__sites[s] = { n: 0, big: 0, sc: {} }); r.n++; r.big += big; r.sc[window.__scn] = 1; }
    return o.apply(this, arguments); }; }
};
const RUN = new Function('o', `
  const m = window.__mnr; let sd = 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  m.god = true; window.__scn = o.scn; m.startStory(o.story); m.simOn(true);
  const cv = document.querySelector('canvas'), c2 = cv.getContext('2d'), css = cv.getBoundingClientRect().width / cv.width; let wmax = 0, lab = { n: 0, tt: 0, te: 0, ex: [] }, frames = 0;
  const ov = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  const rot = typeof wcv !== 'undefined' && wcv !== cv;
  for (let i = 0; m.running && i < o.secs * 60; i++) { if (m.SH && m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(195 + 150 * Math.sin(i / 50), 520 + 120 * Math.sin(i / 37));
    m.step(1 / 60);
    if (i % 6 === 0) { window.__probe = i % 30 === 0 ? 1 : 0; try { m.render(m.G.t, 1 / 60); } catch (e) {} window.__probe = 0; frames++;
      if (o.lab && window.EXP) { const bx = []; if (EXP.cbox) bx.push(['caption', EXP.cbox]); if (window.LBQ && LBQ.box && LBQ.cur) bx.push(['label ' + LBQ.cur.txt, LBQ.box]);
        for (const f of m.G.fl) if (!f.lbq && f !== (window.LBQ && LBQ.cur) && /[A-Z]{3}/.test(f.txt) && !/^\\+/.test(f.txt)) { const L = f.txt.length * 9 + 16; bx.push(['floater ' + f.txt, rot ? [f.x - 11, f.y - L / 2, 22, L] : [f.x - L / 2, f.y - 11, L, 22]]); }
        lab.n += bx.length; for (let a = 0; a < bx.length; a++) { for (let b = a + 1; b < bx.length; b++) if (ov(bx[a][1], bx[b][1])) { lab.tt++; if (lab.ex.length < 4) lab.ex.push(bx[a][0] + ' x ' + bx[b][0]); }
          for (const e of m.G.en) { if (e.dead) continue; const r = e.r || 14; if (ov(bx[a][1], [e.x - r, e.y - r, 2 * r, 2 * r])) { lab.te++; if (lab.ex.length < 4) lab.ex.push(bx[a][0] + ' x enemy ' + e.type); break; } } } }
      if (i % 12 === 0) { const W = cv.width, H = cv.height, d = c2.getImageData(0, 0, W, H).data, col = new Uint16Array(W); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const j = (y * W + x) * 4; if (d[j] >= 200 && d[j + 1] >= 200 && d[j + 2] >= 200) col[x]++; }
        let run = 0; for (let x = 0; x < W; x++) { if (col[x] >= H * .5) { run++; wmax = Math.max(wmax, run * css); } else run = 0; } } } }
  const r = { scn: o.scn, t: m.G.t, frames, wmax, lab, shown: window.EXP ? Object.keys(EXP.shown) : [] }; m.abort(); return r;`);
// plumbing = ctx wrappers and shared paint helpers (calm.js wraps stroke): the site is the first caller above them
const PLUMB = /^(c|ctx|Object\.c|Object\.ctx)\.\w+$|^(Object\.)?(ART\.(sp|tint|hue|sil|put|paintP|drawAnim|dflash|portrait|pic|span|have)|glow|G_|wtxt|sheet|tintOf|cf|size|scale|P\.\w+|CanvasRenderingContext2D\.\w+|RU\.(ring|tri))$|^\?$/;
// overlay families (review 9: beams, lanes, rings, chevrons, bars, ticks, marks); a site outside them counts too when it draws a thin band across > 45% of the field
const FAM = /^(fun\.js:(evDraw|draw)|rules\.js:|draw\.js:hpBar|variants\.js:VAR\.mark|counter\.js:draw|react\.js:RX\.over|dir\.js:drawWarn|anticamp\.js:|flankers\.js:|ai\.js:|flavor\.js:drawSec|fx\.js:(ring|bar)|zonehint\.js:)/;
const FIELD = /^(bg|legible|readable|diet|comfort|c|calm|bossplay|bossmoves|bossvis|armour|art|uikit|explain|draw|power|powerups|arsenal|fxwave|shop|timing)\.js:/;   // backdrop, HUD, own shots, bosses (own gate), captions: not overlays
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const base = 'http://127.0.0.1:' + port, secs = +(process.env.SECS || 60);
  const browser = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => PW.chromium.launch());
  const errs = [];
  try {
    const lm = lineMap(), lines = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8').split('\n');
    const keyOf = s => { const fr = s.split('<').map(f => { const [fn, ln] = f.split('@'); const loc = lm.get(lines[+ln - 1]) || 'built:' + ln; return { fn, part: loc.split(':')[0] }; });
      const h = fr.find(f => !PLUMB.test(f.fn)) || fr[0]; return h ? h.part + ':' + (h.fn === '?' ? 'anon' : h.fn.replace(/^Object\./, '')) : '?'; };
    const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); await ctx.addInitScript(PROBE); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(base + '/index.html?sim=1&all=1'); await p.waitForFunction(() => window.__mnr && document.getElementById('startBtn')); await sleep(600);
    const out = [], miss = [], unshown = [];
    for (const st of [1, 3, 6, 10]) { await p.evaluate(() => { window.__sites = {}; });
      const r = await p.evaluate(RUN, { scn: 'st' + st, story: st, secs, lab: st !== 6 }); out.push(r);
      const raw = await p.evaluate(() => window.__sites), OVL = await p.evaluate(() => window.EXP && EXP.OVL || {}), TXT = await p.evaluate(() => window.EXP ? Object.keys(EXP.TXT) : []), kinds = {};
      for (const [s, v] of Object.entries(raw)) { const k = keyOf(s); if (FAM.test(k) || (v.big && !FIELD.test(k))) kinds[k] = 1; }
      for (const k of Object.keys(kinds)) { const id = OVL[k]; if (!id || (id !== 'rule' && id !== 'ev' && !TXT.includes(id))) { miss.push(r.scn + ' ' + k); continue; }
        if (!(id === 'rule' ? r.shown.some(x => /^rule:/.test(x)) : id === 'ev' ? r.shown.some(x => /^(lane|supply|gaterun|hail|rescue|gust|blackout)$/.test(x)) : r.shown.includes(id)) && !(id === 'rule' && /zonehint/.test(k))) unshown.push(r.scn + ' ' + k + '->' + id); }
      console.log('INFO ' + r.scn + ' ' + r.t.toFixed(0) + ' s, ' + r.frames + ' frames, overlay kinds ' + Object.keys(kinds).length + ', white column max ' + r.wmax.toFixed(1) + ' css px, text boxes ' + r.lab.n + ', captions ' + r.shown.join(' ')); }
    ok('overlay inventory: 0 overlay kinds without a caption id', miss.length === 0, miss);
    ok('every captioned overlay kind showed its caption in that stage', unshown.length === 0, unshown);
    ok('white beam: max white-pixel column <= 4 css px', out.every(r => r.wmax <= 4), out.map(r => r.scn + ':' + r.wmax.toFixed(1)));
    const L = out.filter(r => r.scn !== 'st6');
    ok('labels: 0 text boxes overlap each other in 60 s of stages 1, 3, 10', L.every(r => r.lab.tt === 0), L.map(r => r.scn + ':' + r.lab.tt + ' ' + r.lab.ex.join('; ')));
    ok('labels: 0 text boxes overlap an enemy rect in 60 s of stages 1, 3, 10', L.every(r => r.lab.te === 0), L.map(r => r.scn + ':' + r.lab.te + ' ' + r.lab.ex.join('; ')));
    ok('labels were seen (the gate measured something)', L.reduce((a, r) => a + r.lab.n, 0) > 20, L.map(r => r.lab.n));
    const off = await browser.newContext({ viewport: { width: 390, height: 763 } }), q2 = await off.newPage();
    await q2.goto(base + '/index.html?explain=0'); await q2.waitForFunction(() => window.__mnr); ok('?explain=0 turns it off', await q2.evaluate(() => !window.EXP || !EXP.on));
    ok('no page errors', errs.length === 0, errs.slice(0, 3));
  } catch (e) { fails++; console.log('FAIL crash :: ' + e.message); }
  await browser.close(); srv.kill(); process.exit(fails ? 1 : 0);
})();
