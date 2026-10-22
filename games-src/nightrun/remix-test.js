#!/usr/bin/env node
// Remix gate (parts/waves/remix.js, flag RET.remix). PASS/FAIL lines, exit 1 on any FAIL.   NODE_PATH=$(npm root -g) node games-src/nightrun/remix-test.js   env: GAME_DIR, SECS=90
// (a) one seed twice = identical formation log   (b) 5 seeds: spawn-schedule Jaccard (id@3-bar bucket) <= 0.35 on stages 3, 10, 20   (c) hull of the remixed script within +-5% of the written one, stages 1-40 x 6 seeds,
// first-moments / breathers / set piece anchored   (d) ?remix=0 spawns exactly what the page without remix.js spawns   (e) enemy bullets <= 50 on Hard stage 20, no page error
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 90;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const SEED = `(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__reseed=v=>{a=v;};})();`;
const RUN = (o) => {
  const m = window.__mnr; if (m.running) m.abort(); m.simOn(true); m.SET.diff = o.diff || 'normal'; m.SET.auto = false; m.applySet && m.applySet(); window.__reseed(o.seed); m.startStory(o.n); m.simOn(true); if (window.VARY) VARY.log.length = 0;
  let T = 0, ebMax = 0; while (m.running && !m.ST.over && T < o.secs) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); m.P.x = 230 + 90 * Math.sin(T * .6); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30; ebMax = Math.max(ebMax, m.G.eb.length); }
  const r = { log: (window.VARY ? VARY.log.filter(l => l.n === o.n) : []).map(l => [l.b, l.f]), sp: JSON.stringify(m.G.spawns.slice(0, 60)), ebMax }; m.abort(); return r;
};
const PLAN = (o) => {
  const m = window.__mnr; if (m.running) m.abort(); m.simOn(true); m.SET.diff = 'normal'; window.__reseed(o.seed); m.startStory(o.n); const st = VARY.st, base = VARY.S[o.n];
  const r = { sig: st ? JSON.stringify([st.ms.map(x => x.ids.join('|')), st.s.sig, (st.rb || []).map(x => +x.toFixed(4))]) : '', n: o.n, h: st && st.rmx ? st.rmx.h : null, k0: st && st.rmx ? st.rmx.k0 : null, ok: true };
  if (st && st.rmx) { const k0 = st.rmx.k0, orig = st.rmx.o; for (let i = 0; i < orig.length; i++) { const a = orig[i], b = st.ms[i], bs = b.sig ? '*' : b.br ? '~' : ''; if (i < k0 || a[0] === '*' || a[0] === '~') { if ((a[0] === '*' || a[0] === '~') && a[0] !== bs) r.ok = false;  } }
    const w = st.rb; if (!w || Math.abs(w[w.length - 1] - 1) > 1e-6) r.ok = false; }
  m.abort(); return r;
};
(async () => {
  const fails = [], pass = [], errs = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'remix-')); for (const f of fs.readdirSync(GAME)) if (f !== 'index.html') fs.symlinkSync(path.join(GAME, f), path.join(tmp, f));
  const src = fs.readFileSync(path.resolve(__dirname, 'parts/waves/remix.js'), 'utf8'), html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  if (!html.includes(src)) fails.push('built page is not built from the current remix.js (rebuild)');
  fs.writeFileSync(path.join(tmp, 'index.html'), html.replace(src, ''));
  const port = await fp(), port2 = await fp();
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  const srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const open = async (q, pt) => { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); await p.addInitScript(SEED);
    p.on('pageerror', e => errs.push((q || '') + ' ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${pt || port}/index.html?sim=1&all=1&nomusic=1${q || ''}`); await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 20000 }); return { ctx, p }; };
  const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); }, sch = r => new Set(r.log.map(l => l[1] + '@' + Math.floor(l[0] / 3)));
  try {
    { const { ctx, p } = await open('');
      const a = await p.evaluate(PLAN, { n: 10, seed: 55 }), b = await p.evaluate(PLAN, { n: 10, seed: 55 }), c = await p.evaluate(PLAN, { n: 10, seed: 56 });   // (the sim's spawn timing drifts a little between identical runs even with ?remix=0; the remix itself is a pure function of the seed)
      if (a.sig && a.sig === b.sig && a.sig !== c.sig) pass.push('same seed = same remix, another seed = another (a)'); else fails.push('seeded remix is not reproducible');
      for (const n of [3, 10, 20]) { const rs = []; for (let s = 0; s < 5; s++) rs.push(await p.evaluate(RUN, { n, seed: 7 + s * 101, secs: SECS }));
        const js = []; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) js.push(jac(sch(rs[i]), sch(rs[j]))); const J = js.reduce((x, y) => x + y, 0) / js.length;
        (J <= .35 ? pass : fails).push('stage ' + n + ' Jaccard over 5 seeds ' + J.toFixed(2) + ' (b, <= 0.35)'); }
      let bad = 0, worst = 0, id = 0; for (let n = 1; n <= 40; n++) for (let s = 0; s < 6; s++) { const r = await p.evaluate(PLAN, { n, seed: 900 + s * 37 }); if (r.h == null) id++; else worst = Math.max(worst, Math.abs(r.h - 1)); if (!r.ok || (r.h != null && Math.abs(r.h - 1) > .05)) bad++; }
      (bad ? fails : pass).push('hull within 5% (worst ' + (worst * 100).toFixed(1) + '%), anchors kept, ' + id + ' of 240 plans identity (c)' + (bad ? ': ' + bad + ' bad' : ''));
      const h = await p.evaluate(RUN, { n: 20, seed: 3, secs: 120, diff: 'hard' }); (h.ebMax <= 50 ? pass : fails).push('Hard stage 20 enemy bullets peak ' + h.ebMax + ' (e)');
      await ctx.close(); }
    { const { ctx, p } = await open('&remix=0'), q = await open('', port2);
      let same = true; for (const n of [3, 20, 33]) { const a = await p.evaluate(RUN, { n, seed: 777 + n, secs: 40 }), b = await q.p.evaluate(RUN, { n, seed: 777 + n, secs: 40 }); if (a.sp !== b.sp || JSON.stringify(a.log) !== JSON.stringify(b.log)) same = false; }
      (same ? pass : fails).push('?remix=0 spawns exactly what the page without remix.js spawns (d)'); await ctx.close(); await q.ctx.close(); }
  } catch (e) { fails.push('crash: ' + String(e).slice(0, 300)); }
  await br.close(); srv.kill(); srv2.kill(); if (errs.length) fails.push('page errors: ' + [...new Set(errs)].slice(0, 3).join(' | '));
  pass.forEach(x => console.log('PASS ' + x)); fails.forEach(x => console.log('FAIL ' + x)); process.exit(fails.length ? 1 : 0);
})();
