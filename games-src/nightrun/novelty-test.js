#!/usr/bin/env node
// Novelty gate (parts/novelty.js, flag RET.novelty). PASS/FAIL lines, exit 1 on any FAIL.   NODE_PATH=$(npm root -g) node games-src/nightrun/novelty-test.js   env: GAME_DIR
// (a) the default page (flag off) spawns exactly what the page without novelty.js spawns   (b) a wave repeated inside 5 min gets a twist, the codex prefers an unseen twist, epochs / unlocks / events fire on the session clock
// (c) every event and every twist spawns and draws in landscape and portrait, ambush leaves a gap >= 96 px   (d) enemy bullets <= 50 with events on Hard stage 20, no page error
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const SEED = `(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__reseed=v=>{a=v;};})();`;
const SP = (o) => { const m = window.__mnr; if (m.running) m.abort(); m.simOn(true); m.SET.diff = 'normal'; m.applySet && m.applySet(); window.__reseed(o.seed); m.startStory(o.n); m.simOn(true);
  let T = 0; while (m.running && !m.ST.over && T < o.secs) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30; }
  const r = JSON.stringify(m.G.spawns.slice(0, 60)); m.abort(); return r; };
const UNIT = () => { const m = window.__mnr, N = window.NOV, out = {}; if (m.running) m.abort(); m.simOn(true); m.startStory(3); m.simOn(true); for (let i = 0; i < 60; i++) m.step(1 / 30);
  N.last = {}; N.cx = {}; N.T = 5000; out.first = N.pick('tst'); N.T = 5100; const c = N.cx; c['tst^swift'] = 1; out.second = N.pick('tst');
  N.T = 6000; N.last.tst2 = 5990; N.tw = ['swift', 'armored']; c['tst2^swift'] = 1; c['tst2^armored'] = 1; N.last['tst2^swift'] = 5995; N.last['tst2^armored'] = 5500; out.lru = N.pick('tst2');
  const x = { id: 'droneLine' }; N.last.droneLine = N.T - 10; N.wave(x); out.wid = x.id;
  const e0 = { ep: N.ep, un: N.unN, ev: N.evN }; N.T = Math.ceil(N.T / 3600) * 3600 + 1; N.lt = m.G.t; for (let i = 0; i < 60; i++) m.step(1 / 30); m.G.boss = null; out.ep = N.ep > e0.ep; out.un = N.unN > e0.un; out.ev = N.evN > e0.ev;
  m.abort(); return out; };
const DRAW = () => { const m = window.__mnr, N = window.NOV, r = { ok: [], bad: [] }; if (m.running) m.abort(); m.simOn(true); m.startStory(5); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 30);
  for (const k of ['ambush', 'convoy', 'rest', 'rush', 'duel']) { const n0 = m.G.en.length; m.P.hp = 1; N.run(k, k === 'rest' ? '' : 'swift');
    const add = m.G.en.slice(n0); if (k === 'rest' ? m.P.hp === 2 : add.length) r.ok.push(k); else r.bad.push(k);
    if (k === 'ambush') { const ys = add.map(e => e.y).concat([0, 540]).sort((a, b) => a - b); let g = 0; for (let i = 1; i < ys.length; i++) g = Math.max(g, ys[i] - ys[i - 1] - 28); r.gap = Math.round(g); } }
  for (const tw of ['swift', 'armored', 'gilded', 'tiny', 'lead', 'swift+armored']) { const e = m.G.en.find(x => x.type !== 'boss' && !x.nvx); if (e) { N.twist(e, tw); if (tw.indexOf('lead') >= 0) N.lead([e]); } }
  for (let ep = 0; ep < N.SK.length; ep++) { N.ep = ep; try { let n = 0; for (const e of m.G.en) { N.drawE(e, m.G.t); n++; } if (!n) throw new Error('nothing drawn'); r.ok.push('skin' + ep); } catch (err) { r.bad.push('skin' + ep + ':' + err.message); } }
  N.ep = 0; m.abort(); return r; };
const CAP = () => { const m = window.__mnr, N = window.NOV; if (m.running) m.abort(); m.simOn(true); m.SET.diff = 'hard'; m.applySet && m.applySet(); window.__reseed(9); m.startStory(20); m.simOn(true);
  let T = 0, eb = 0, k = 0; while (m.running && !m.ST.over && T < 90) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); if (m.SH.active) m.SH.close();
    if (T > 5 && Math.floor(T / 8) > k) { k = Math.floor(T / 8); N.run(['ambush', 'convoy', 'rush', 'duel'][k % 4], k > 4 ? 'swift+armored' : ''); } m.step(1 / 30); T += 1 / 30; eb = Math.max(eb, m.G.eb.length); }
  m.abort(); return eb; };
(async () => {
  const fails = [], pass = [], errs = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'novelty-')); for (const f of fs.readdirSync(GAME)) if (f !== 'index.html') fs.symlinkSync(path.join(GAME, f), path.join(tmp, f));
  const src = fs.readFileSync(path.resolve(__dirname, 'parts/novelty.js'), 'utf8'), html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  if (!html.includes(src)) fails.push('built page is not built from the current novelty.js (rebuild)');
  fs.writeFileSync(path.join(tmp, 'index.html'), html.replace(src, ''));
  const port = await fp(), port2 = await fp();
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  const srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const open = async (q, pt, vp) => { const ctx = await br.newContext({ viewport: vp || { width: 1280, height: 720 } }), p = await ctx.newPage(); await p.addInitScript(SEED);
    p.on('pageerror', e => errs.push((q || '') + ' ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${pt || port}/index.html?sim=1&all=1&nomusic=1${q || ''}`); await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 20000 }); return { ctx, p }; };
  try {
    { const a = await open(''), b = await open('', port2); let same = true;
      for (const n of [3, 12]) { const x = await a.p.evaluate(SP, { n, seed: 4, secs: 60 }), y = await b.p.evaluate(SP, { n, seed: 4, secs: 60 }); if (x !== y) same = false; }
      (same ? pass : fails).push('default (off) spawns exactly what the page without novelty.js spawns (a)'); await a.ctx.close(); await b.ctx.close(); }
    { const { ctx, p } = await open('&novelty=1'); const u = await p.evaluate(UNIT);
      const R = await p.evaluate(() => { const N = window.NOV, t = N.T; N.T = 0; const a = N.ramp(); N.T = 480; const b = N.ramp(); N.T = 1680; const c = N.ramp(); N.T = t; return [a, b, c]; });
      (R[0] === 0 && R[1] === 0 && R[2] === 1 ? pass : fails).push('twists ease in: none before minute 8, all by minute 28 (b) ' + R);
      (u.first === '' ? pass : fails).push('first sight of a wave is plain (b) ' + JSON.stringify(u.first));
      (u.second && u.second !== 'swift' ? pass : fails).push('codex prefers an unseen twist (b) -> ' + u.second);
      (u.lru === 'armored' ? pass : fails).push('all seen: least recently used twist (b) -> ' + u.lru);
      (/\^/.test(u.wid) ? pass : fails).push('repeated wave id carries its twist (b) ' + u.wid);
      (u.ep && u.un && u.ev ? pass : fails).push('epoch / unlock / event fire on the session clock (b) ' + [u.ep, u.un, u.ev]);
      const h = await p.evaluate(CAP); (h <= 50 ? pass : fails).push('Hard stage 20 with events: enemy bullets peak ' + h + ' (d)'); await ctx.close(); }
    for (const vp of [{ width: 1280, height: 720 }, { width: 390, height: 763 }]) { const { ctx, p } = await open('&novelty=1', port, vp); const r = await p.evaluate(DRAW);
      (r.bad.length ? fails : pass).push(`${vp.width}x${vp.height}: events + twists + ${r.ok.filter(x => /skin/.test(x)).length} skins spawn and draw (c)` + (r.bad.length ? ' bad ' + r.bad.join(',') : ''));
      (r.gap >= 96 ? pass : fails).push(`${vp.width}x${vp.height}: ambush free gap ${r.gap} px >= 96 (c)`); await ctx.close(); }
  } catch (e) { fails.push('crash ' + e.message.slice(0, 200)); }
  (errs.length ? fails : pass).push('page errors: ' + (errs.slice(0, 2).join(' | ') || 'none'));
  await br.close(); srv.kill(); srv2.kill();
  pass.forEach(x => console.log('PASS ' + x)); fails.forEach(x => console.log('FAIL ' + x)); process.exit(fails.length ? 1 : 0);
})();
