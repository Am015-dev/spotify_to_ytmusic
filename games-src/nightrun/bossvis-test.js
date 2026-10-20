#!/usr/bin/env node
// Boss phase visuals through the real page (prints pass/fail only):  NODE_PATH=$(npm root -g) node games-src/nightrun/bossvis-test.js
//   env: GAME_DIR=<dir with index.html>, ONLY=kronos,hoplite, SHOTS=<dir> (writes boss-<id>-<vp>-p<N>.png, keep it out of git), THR=<min mean abs diff, default 3>
// For every boss (air + ground) on desktop 1280x720 and phone 390x763 (touch):
//  - each phase 1/2/3 is forced on a bar line (as review-tour does); the frame is re-rendered at a frozen time with the flag on and off, so (on - off) isolates what bossvis adds
//  - the added picture differs from zero in phases 2 and 3 (phase 1 is the base look: its pip 1/3 is checked below; with bossplay on the boss is silent in the open window, so shots cannot be counted) and between every two phases (three distinct looks, mean |diff| in the boss rect above THR)
//  - pips 1/3 2/3 3/3 on the boss bar; "NEW ATTACK: <name>" through the hint (or banner) at every change; hit-stop 40-60 ms per change, 0 with reduced motion
//  - a ground boss stays on the road line in every phase; no page errors; ?bossvis=0 = nothing added, no flash text, no pips
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), ONLY = (process.env.ONLY || '').split(',').filter(Boolean), THR = +process.env.THR || 3, SHOTS = process.env.SHOTS;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const GND = ['hoplite', 'talos'], AIR = ['sek-adler', 'kronos'];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); return s / (a.length / 4 * 3); };
(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?nomusic=1${q}`;
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const run = async (id, vp, flagOff, reduce) => {
    const tag = `${id} ${vp.tag}${flagOff ? ' flag-off' : ''}${reduce ? ' reduced' : ''}`, bad = m => fails.push(`${tag}: ${m}`);
    const ctx = await br.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.touch, isMobile: vp.touch, deviceScaleFactor: 1, userAgent: vp.touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => bad('page error ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(url('&bpauto=1' + (process.env.QS || '') + '&boss=' + id + (flagOff ? '&bossvis=0' : '')));   // bpauto: each boss gate resolves 1.5 s after it rises (a player who plays); QS='&bossplay=1' tests with the encounter rules on
    try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.boss.x <= 791, null, { timeout: 25000 }); } catch (e) { bad('boss did not arrive'); await ctx.close(); return; }
    await p.addStyleTag({ content: '#labP{display:none!important}' });
    await p.evaluate(rd => { const m = __mnr; m.SET.calm = false; if (rd) m.SET.rm = true; }, reduce);
    const frames = {}, jn0 = await p.evaluate(() => [RET.JU.n, RET.JU.tot]);
    for (const ph of [1, 2, 3]) {
      if (ph > 1) {
        await p.evaluate(ph => { const m = __mnr, b = m.G.boss; m.P.hp = 99; m.SET.calm = false; m.G.hint = { t: 0, txt: '' }; const bar = Math.floor(b.bt / 4) + 1; if (ph === 2) b.p2 = bar; else { b.p2 = Math.min(b.p2, 1); b.p3 = bar; } b.bt = bar * 4 - 1; window.__fl = []; }, ph);
        try { await p.waitForFunction(ph => { const m = __mnr, b = m.G.boss; if (b) { m.P.hp = 99; if (b.ph === ph && !window.__fl.length) window.__fl.push([BV.flash, (window.HINT&&HINT.cur?HINT.cur.txt:'')+' '+(HINT&&HINT.q.map(h=>h.txt).join(' '))+' '+m.G.hint.txt, m.G.banner.b || '']); } return b && b.ph >= ph; }, ph, { timeout: 15000, polling: 100 }); } catch (e) { bad('phase ' + ph + ' never started'); break; }
        await sleep(150);
      }
      const r = await p.evaluate(async ph => {
        const m = __mnr, b = m.G.boss, g = document.getElementById('game'), c = g.getContext('2d'); m.G.banner.t = 0; if (b.bv) b.bv.t = 0; m.P.hp = 99;
        const grab = () => { m.render(m.G.t, 0); const R = BV.rect && Object.assign({}, BV.rect); if (!R) return null; if (R.rot) { const t = R.cx; R.cx = R.cy; R.cy = g.height - t; } const k = 1.5, q = Math.max(R.hw, R.hh), w = Math.max(8, Math.min(Math.round(2 * q * R.s * k), g.width)), h = Math.max(8, Math.min(Math.round(2 * q * R.s * k), g.height));
          const x = Math.max(0, Math.min(g.width - w, Math.round(R.cx - w / 2))), y = Math.max(0, Math.min(g.height - h, Math.round(R.cy - h / 2))); return { w, h, d: Array.from(c.getImageData(x, y, w, h).data) }; };
        BV.rect = null; const on = grab(), was = RET.bossvis; RET.bossvis = false; const rr = BV.rect; const off0 = (BV.rect = rr, grab()); RET.bossvis = was;
        return { on, off0, pips: BV.pips, tinted: BV.tinted, ph: b.ph, up: m.UIK.groundY() - (b.y + (b._dh || 0) / 2), mv: m.UIK.moveOf(b), hits: [RET.JU.n, RET.JU.tot], bvOn: BV.on };
      }, ph);
      frames[ph] = r; if (SHOTS) await p.screenshot({ path: path.join(SHOTS, `boss-${id}-${vp.tag}-p${ph}.png`) });
      if (r.mv !== 'air' && Math.abs(r.up) > 6) bad(`phase ${ph}: ground boss ${r.up.toFixed(1)} px off the road line`);
      if (!flagOff && r.pips !== ph) bad(`phase ${ph}: pips ${r.pips}`);
      if (flagOff && (r.tinted || r.pips)) bad(`flag off but tint/pips drawn (phase ${ph})`);
    }
    const fl = await p.evaluate(() => window.__fl), [jn, jt] = await p.evaluate(() => [RET.JU.n, RET.JU.tot]);
    if (!flagOff) {
      if (fl && fl.length) { if (!/NEW ATTACK: [A-Z ]+/.test(fl[0][1] || fl[0][0]) && !/·/.test(fl[0][2])) bad('no attack name flash: ' + JSON.stringify(fl)); }
      const d = Object.values(frames).filter(f => f.on && f.off0).map(f => { const o = f.on.d, q = f.off0.d; return { w: f.on.w, d: o.map((v, i) => v - q[i] + 128) }; });   // (on - off) + grey
      const ds = (ph) => { const f = frames[ph]; if (!f || !f.on || !f.off0) return null; const a = new Uint8Array(f.on.d.length / 1), e = new Array(f.on.d.length); for (let i = 0; i < e.length; i++) e[i] = f.on.d[i] - f.off0.d[i]; return e; };
      const D = [1, 2, 3].map(ds), pdiff = (a, b) => { const n = Math.min(a.length, b.length); let s = 0, c = 0; for (let i = 0; i < n; i += 4) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); c += 3; } return s / c; };
      const zero = x => pdiff(x, new Array(x.length).fill(0));
      if (D.every(Boolean)) {
        const z = D.map(zero), pr = [pdiff(D[0], D[1]), pdiff(D[1], D[2]), pdiff(D[0], D[2])];
        console.log(`  ${tag}: added-picture size per phase ${z.map(v => v.toFixed(1)).join(' / ')}; between phases ${pr.map(v => v.toFixed(1)).join(' / ')}`);
        z.forEach((v, i) => { if (i > 0 && v < THR / 3) bad(`phase ${i + 1}: bossvis adds almost nothing (${v.toFixed(2)})`); });
        pr.forEach((v, i) => { if (v < THR) bad(`phases ${['1-2', '2-3', '1-3'][i]} look the same (${v.toFixed(2)} < ${THR})`); });
      } else bad('no boss rect captured');
      if (reduce) { if (jt - jn0[1] > 0) bad('hit-stop with reduced motion: ' + (jt - jn0[1]) + ' ms'); }
      else { const dn = jn - jn0[0], per = dn ? (jt - jn0[1]) / dn : 0; if (dn < 2) bad('hit-stop on phase change: only ' + dn + ' grants'); else if (per < 40 || per > 60) bad('hit-stop ' + per.toFixed(0) + ' ms per change (want 40-60)'); }
    } else {
      if (fl && fl.length && /NEW ATTACK/.test(fl[0][0] + fl[0][1])) bad('flag off but attack flash shown');
      for (const ph of [1, 2, 3]) { const f = frames[ph]; if (f && f.on && f.off0 && mad(f.on.d, f.off0.d) > 0.01) bad(`flag off: frame differs (phase ${ph})`); }
    }
    await ctx.close();
  };
  const VPS = [{ tag: 'desktop', w: 1280, h: 720, touch: false }, { tag: 'phone', w: 390, h: 763, touch: true }];
  for (const vp of VPS) for (const id of [...AIR, ...GND]) { if (ONLY.length && !ONLY.includes(id)) continue; if (vp.touch && GND.includes(id)) continue; await run(id, vp, false, false); }   // portrait swaps ground bosses for fliers (ground-test c)
  if (!ONLY.length || ONLY.includes('kronos')) { await run('kronos', VPS[0], true, false); await run('kronos', VPS[0], false, true); await run('kronos', VPS[1], true, false); }
  if (!ONLY.length || ONLY.includes('hoplite')) await run('hoplite', VPS[0], false, false);
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'bossvis-test: ok'); process.exit(fails.length ? 1 : 0);
})();
