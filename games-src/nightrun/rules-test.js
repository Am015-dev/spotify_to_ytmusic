#!/usr/bin/env node
// New-mechanic cadence gate (parts/waves/rules.js, flag RET.rules). Real page, ?sim=1 stepping. Prints PASS/FAIL lines, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/rules-test.js      env: GAME_DIR=<dir with index.html>
// (a) every mechanic (plain + twist) spawns, ticks and draws without errors, phone 390x763 and landscape 1280x720; DASH and EMP hooks run; no NaN
// (b) caps: enemy bullets <= ebCap, player shots <= 64, pickups <= 40, mechanic objects bounded; the ship keeps a free band >= 96 px
// (c) the NEW card shows once per profile (second meeting: no card), the codex counts it
// (d) flag off (?rules=0) spawns exactly what the page without rules.js spawns (seeded, stages 5 and 20)
// (e) cadence: the plan brings a new mechanic, twist or combination on every stage from 2 to 45 (report: longest stretch without one, distinct signatures)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const SEED = `(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__reseed=v=>{a=v;};})();`;

const EACH = () => {   // (a) (b) (c), inside the page
  const m = window.__mnr, errs = [], out = { n: 0, maxEb: 0, maxPb: 0, maxPk: 0, cards: 0, objs: 0, band: 999 };
  try { localStorage.removeItem('mnr_rulecodex'); localStorage.removeItem('mnr_hintseen'); } catch (e) { }
  if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = true; m.applySet && m.applySet(); m.startStory(8); m.simOn(true);
  const run = (id, tw, secs) => {
    if (m.running) m.abort(); m.startStory(8); m.simOn(true);
    RU.st = { i: 8, list: [{ id, tw, age: 0, o: {}, on: 0 }], card: 0 }; const D = RU.T[id];
    for (let f = 0; f < secs * 30; f++) {
      m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(f / 33); m.P.x = 230 + 90 * Math.sin(f / 50); if (m.SH.active) m.SH.close(); if (m.G.boss) m.G.boss.hp = 0;
      const S = RU.st; if (!S || !S.list[0]) { errs.push(id + ' plan lost'); return; } const q = S.list[0];
      try { m.step(1 / 30); if (q.on && q.age >= RU.TEL) { D.tick(q, 1 / 60); D.draw(q, false); } else if (q.on) D.draw(q, true); if (f === 200 && D.dash) D.dash(q); if (f === 260 && D.emp) D.emp(q); }
      catch (x) { errs.push(id + (tw ? '~tw' : '') + ': ' + x.message); return; }
      out.maxEb = Math.max(out.maxEb, m.G.eb.length - RU.cap()); out.maxPb = Math.max(out.maxPb, m.G.pb.length); out.maxPk = Math.max(out.maxPk, m.G.pk.length);
      for (const k of ['g', 'p', 'b', 'z', 'h', 'o', 'w']) if (q.o[k] && q.o[k].length) out.objs = Math.max(out.objs, q.o[k].length);
      if (id === 'tide') out.band = Math.min(out.band, 540 - q.o.h - (q.o.h2 || 0)); if (id === 'lane') out.band = Math.min(out.band, q.o.h);
      if (!(m.P.x === m.P.x && m.P.y === m.P.y)) { errs.push(id + ' NaN ship'); return; } }
    if (!RU.st.list[0].on) errs.push(id + ' never switched on'); out.n++; };
  const c0 = RU.stat.card;
  for (const id of RU.ORDER) for (const tw of [0, 1]) run(id, tw, 10);
  out.cards = RU.stat.card - c0; const c1 = RU.stat.card; run('well', 0, 3); out.again = RU.stat.card - c1;
  out.codex = RU.count(); out.ids = RU.ORDER.length; m.abort(); return { out, errs: errs.slice(0, 6) };
};
const SPAWNS = (o) => {   // (d)
  const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = true; m.applySet && m.applySet(); window.__reseed && window.__reseed(900 + o.n); m.startStory(o.n); m.simOn(true);
  const sp = [], fn = e => sp.push([e.type, Math.round(e.x), Math.round(e.y), e.hp]); m.NR.on('spawn', fn); let T = 0;
  while (m.running && !m.ST.over && T < o.secs) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); m.P.x = 230 + 90 * Math.sin(T * .6); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30; }
  m.abort(); return sp.slice(0, 400);
};
const PLAN = () => { const r = []; for (let n = 1; n <= 45; n++) r.push([n, RU.plan(n).map(x => x.id + (x.tw ? '~tw' : '')).join('+')]); return r; };

(async () => {
  const fails = [], pass = [], errs = []; const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  const a = html.indexOf('/* ---------- RULES:'), b = html.indexOf('if(window.CTR){const cd=CTR.dash', a), b2 = html.indexOf('\n', b);
  if (a < 0 || b < 0) { console.log('FAIL rules.js is not in the page'); process.exit(1); }
  const cut = html.slice(0, a) + html.slice(b2); const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rt-')); for (const f of fs.readdirSync(GAME)) if (f !== 'index.html') fs.symlinkSync(path.join(GAME, f), path.join(tmp, f)); fs.writeFileSync(path.join(tmp, 'index.html'), cut);
  const port = await fp(), port2 = await fp();
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  const srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const open = async (q, pt, seed, vp) => { const ctx = await br.newContext({ viewport: vp || { width: 1280, height: 720 } }), p = await ctx.newPage(); if (seed) await p.addInitScript(SEED);
    p.on('pageerror', e => errs.push((q || '') + ' ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${pt || port}/index.html?sim=1&all=1&nomusic=1${q || ''}`); await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 20000 }); return { ctx, p }; };
  try {
    for (const [nm, vp] of [['portrait 390x763', { width: 390, height: 763 }], ['landscape 1280x720', { width: 1280, height: 720 }]]) {
      const { ctx, p } = await open('', 0, 1, vp); const r = await p.evaluate(EACH), o = r.out;
      if (r.errs.length) fails.push(nm + ': ' + r.errs.join('; ')); else pass.push(nm + ': ' + o.n + ' mechanic runs (' + o.ids + ' mechanics x plain/twist) spawn, tick, draw, take DASH + EMP');
      if (o.maxEb > 0) fails.push(nm + ': enemy bullets above ebCap by ' + o.maxEb); if (o.maxPb > 64) fails.push(nm + ': player shots ' + o.maxPb + ' > 64'); if (o.maxPk > 40) fails.push(nm + ': pickups ' + o.maxPk + ' > 40');
      if (o.objs > 8) fails.push(nm + ': a mechanic holds ' + o.objs + ' objects (> 8)'); if (o.band < 96) fails.push(nm + ': free band ' + Math.round(o.band) + ' px < 96');
      if (o.maxEb <= 0 && o.maxPb <= 64 && o.maxPk <= 40 && o.objs <= 8 && o.band >= 96) pass.push(nm + ': caps hold (pb max ' + o.maxPb + ', pk max ' + o.maxPk + ', objects max ' + o.objs + ', free band >= ' + Math.round(o.band) + ' px)');
      if (nm.startsWith('portrait')) { if (o.cards >= o.ids && o.again === 0 && o.codex === o.ids) pass.push('NEW/TWIST cards: ' + o.cards + ' shown, a second meeting shows none, codex ' + o.codex + '/' + o.ids);
        else fails.push('cards: ' + o.cards + ' shown (need >= ' + o.ids + '), again ' + o.again + ' (need 0), codex ' + o.codex + '/' + o.ids); }
      await ctx.close(); }
    for (const n of [5, 20]) { const A = await open('&rules=0', 0, 1), B = await open('', port2, 1);
      const ra = await A.p.evaluate(SPAWNS, { n, secs: 30 }), rb = await B.p.evaluate(SPAWNS, { n, secs: 30 });
      const same = JSON.stringify(ra) === JSON.stringify(rb) && ra.length > 5;
      (same ? pass : fails).push('flag off, stage ' + n + ': ' + ra.length + ' spawns ' + (same ? 'identical to the page without rules.js' : 'DIFFER from the page without rules.js'));
      await A.ctx.close(); await B.ctx.close(); }
    { const { ctx, p } = await open('', 0, 1); const pl = await p.evaluate(PLAN), seen = new Set(); let gap = 0, g = 0, newN = 0;
      for (const [n, s] of pl) { const parts = s ? s.split('+').concat(s.includes('+') ? [s] : []) : []; const nw = parts.filter(x => !seen.has(x)); nw.forEach(x => seen.add(x)); newN += nw.length; if (n >= 2) { g = nw.length ? 0 : g + 1; gap = Math.max(gap, g); } }
      console.log('plan: ' + pl.filter(x => x[1]).map(x => x[0] + ' ' + x[1]).join(' | '));
      (gap <= 1 ? pass : fails).push('cadence: ' + newN + ' new rule signatures over 45 stages, longest run of stages without one: ' + gap);
      await ctx.close(); }
  } catch (x) { fails.push('crash: ' + x.message); }
  if (errs.length) fails.push('page errors: ' + [...new Set(errs)].slice(0, 4).join(' | ')); else pass.push('no page errors');
  await br.close(); srv.kill(); srv2.kill();
  for (const l of pass) console.log('PASS ' + l); for (const l of fails) console.log('FAIL ' + l);
  process.exit(fails.length ? 1 : 0);
})();
