#!/usr/bin/env node
// PILOT CLASSES test (parts/hangar/classes.js, flag RET.classes). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/classes-test.js
//   env: RUNS=24 (balance runs per stage, bot and class) STAGES=5,10,20 CLS=none,none2,gunner (configs; none* = ?classes=0) BAL=0 (skip the balance part) PAR=4
// 1. pick, unlock, persist (reload), row locks, XP; 2. caps: every knob inside CLS.KC with the whole tree, damage <= x1.15 with any streak;
// 3. daily run = base class (no tree); 4. ?classes=0: no PILOT tab, every wrapper passes through; 5. PILOT tab at 390x763 and 375x553:
// touch targets >= 44 px, text >= 13 px, no overlap, nothing cut; 6. no page errors;
// 7. balance (humanbot.js, Normal, mid build, whole tree owned = the strongest class, two no-class baselines pooled): human and dodger survival within 8 points of no class,
//    max-min across classes <= 10 points, kills per minute within 15% of no class.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 24, STAGES = process.env.STAGES || '5,10,20', PAR = process.env.PAR || '4';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const IDS = ['gunner', 'ghost', 'warden', 'tinker', 'gambler'];
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let errs = [];
  const open = async (q, vp) => { const ctx = await br.newContext({ viewport: vp || { width: 960, height: 540 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1${q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 10000 }).catch(() => { }); return p; };
  // 1-3: logic
  let p = await open('');
  const L = await p.evaluate(() => { const C = window.__cls.CLS, o = {};
    o.on = C.on; o.n = C.L.length; o.sizes = C.L.map(c => c.T.length);
    C.pick('ghost'); o.picked = JSON.parse(localStorage.getItem('mnr_cls')).c;
    const c = C.def('ghost'); o.noXp = C.buy(c, 0); C.pay(500); o.b0 = C.buy(c, 0); o.lock = C.buy(c, 4); o.b2 = C.buy(c, 2); o.b4 = C.buy(c, 4); o.xp = C.sv().xp; o.again = C.buy(c, 0);
    o.caps = true; o.dmgMax = 0;
    for (const d of C.L) { C.forceTree = true; const k = C.knobs(d, true); C.forceTree = false; for (const q in C.KC) if (k[q] < C.KC[q][0] - 1e-9 || k[q] > C.KC[q][1] + 1e-9) o.caps = false;
      for (const n of d.T) { const keys = Object.keys(n.k); for (const q of keys) { const v = Math.abs(n.k[q] - 1); if (v < .099 || v > .151) o.caps = false; } if (keys.some(q => /hp|hull|max|armour/.test(q))) o.caps = false; } }
    C.R.live = true; C.R.cls = C.def('gambler'); C.forceTree = true; C.R.k = C.knobs(C.R.cls, true); C.R.streak = 9999; o.dmgMax = C.dmgK(); C.forceTree = false; C.R.live = false; C.R.cls = null;
    const cg = C.def('gunner'); o.dailyK = JSON.stringify(C.knobs(cg, false)); C.pick('gunner'); C.begin({ daily: true }); o.dailyLive = JSON.stringify(C.R.k); C.R.live = false; C.R.cls = null;
    C.pick('ghost'); return o; });
  line(L.on && L.n === 5 && L.sizes.every(s => s >= 6 && s <= 8), `5 classes, tree sizes ${L.sizes.join('/')}`);
  line(L.picked === 'ghost' && L.noXp === 'xp' && L.b0 === 'ok' && L.lock === 'locked' && L.b2 === 'ok' && L.b4 === 'ok' && L.xp === 500 - 40 - 60 - 90 && L.again === 'owned', `pick + unlock + row locks + XP (${L.noXp}/${L.b0}/${L.lock}/${L.b2}/${L.b4}, xp left ${L.xp})`);
  line(L.caps, 'every node moves 1-2 knobs by 10-15%, no hull/armour knob, every class inside CLS.KC with its whole tree');
  line(L.dmgMax <= 1.15 + 1e-9, `shot damage cap x${L.dmgMax.toFixed(3)} <= x1.15 (gambler, whole tree, endless streak)`);
  line(L.dailyK === L.dailyLive, 'daily run uses the base class, no tree');
  const les = await p.evaluate(() => { const Lz = window.__lessons; if (!Lz || !Lz.on) return 'no layer'; const ok = Lz.show('pilot'); const id = Lz.id, open = Lz.open; const sk = document.getElementById('lsSkip'); if (sk) sk.click(); return ok && id === 'pilot' && open ? 'ok' : 'bad'; });
  line(les === 'ok' || les === 'no layer', `first-time PILOT lesson card (lessons.js layer): ${les}`);
  await p.reload(); await p.waitForFunction(() => window.__cls, null, { timeout: 10000 });
  const per = await p.evaluate(() => { const C = window.__cls.CLS; return { c: C.sv().c, own: Object.keys(C.sv().own).length }; });
  line(per.c === 'ghost' && per.own === 3, `persist after reload (class ${per.c}, ${per.own} nodes)`);
  // in a run: signature on EMP, xp on runEnd
  const run = await p.evaluate(() => { const m = window.__mnr, C = window.__cls.CLS; m.SET.diff = 'normal'; m.startStory(5); m.simOn(true); const o = { live: C.R.live, cls: C.R.cls && C.R.cls.id, max: m.P.max };
    for (let i = 0; i < 600; i++) m.step(1 / 60); m.P.emp = 3; for (let k = 0; k < 8; k++) m.G.eb.push({ x: m.P.x + 40 + 10 * k, y: m.P.y + 5, vx: -20, vy: 0, r: 4 }); const s0 = C.stat.sig; window.ABIL.emp(); o.sig = C.stat.sig - s0; const xp0 = C.sv().xp; for (let i = 0; i < 1200 && !m.G.dead; i++) m.step(1 / 60); o.kills = m.G.kills; m.abort(); o.xpQuit = C.sv().xp - xp0; o.after = C.R.live; return o; });
    await p.context().close();
  // 4: ?classes=0
  p = await open('&classes=0');
  const off = await p.evaluate(() => { const m = window.__mnr, C = window.__cls.CLS; localStorage.setItem('mnr_cls', JSON.stringify({ c: 'gunner', xp: 0, own: {} }));
    const tab = document.querySelector('#garage .tabs button[data-t="pilot"]'); m.startStory(5); m.simOn(true); for (let i = 0; i < 120; i++) m.step(1 / 60);
    const o = { on: C.on, hidden: !tab || tab.hidden, live: C.R.live, max: m.P.max, rf: window.ABIL.refill(), dmk: m.SH.dmk() }; m.abort(); return o; });
  const ref = await (async () => { const q = await open('&classes=0&cls=none'); const r = await q.evaluate(() => { const m = window.__mnr; m.startStory(5); m.simOn(true); for (let i = 0; i < 120; i++) m.step(1 / 60); const o = { max: m.P.max, rf: window.ABIL.refill(), dmk: m.SH.dmk() }; m.abort(); return o; }); await q.context().close(); return r; })();
  line(!off.on && off.hidden && !off.live && off.max === ref.max && off.rf === ref.rf && off.dmk === ref.dmk, `?classes=0: no PILOT tab, no class live, hull/refill/damage as before (${off.max}/${off.rf.toFixed(2)}/${off.dmk.toFixed(2)})`);
  line(run.live && run.cls === 'ghost' && run.max === ref.max && run.sig === 1 && run.xpQuit === 0 && !run.after, `in a run: class live ${run.cls}, hull ${run.max} (no class ${ref.max}), signature fired ${run.sig}, quit pays ${run.xpQuit} XP`);
  await p.context().close();
  // 5: UI at two phone sizes
  for (const vp of [{ width: 390, height: 763 }, { width: 375, height: 553 }]) {
    p = await open('', vp);
    const ui = await p.evaluate(async () => { const C = window.__cls.CLS; C.pay(200); window.__cls.open(); const bad = [];
      const chk = () => { const box = document.getElementById('gaCards'); const br = box.getBoundingClientRect(); const els = [...box.querySelectorAll('button')];
        for (const e of els) { const r = e.getBoundingClientRect(); if (r.height < 44 || r.width < 44) bad.push('small ' + (e.id || e.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); if (r.left < br.left - 1 || r.right > br.right + 1) bad.push('cut ' + (e.id || e.className)); }
        for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect(); if (els[i].contains(els[j]) || els[j].contains(els[i])) continue; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) bad.push('overlap ' + (els[i].id || els[i].className) + ' / ' + (els[j].id || els[j].className)); }
        for (const e of box.querySelectorAll('span,small,p,i,b,div')) { if (!e.textContent.trim() || e.children.length && e.tagName !== 'P') continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13) bad.push('font ' + fs + ' ' + e.className); if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') bad.push('spill ' + e.className); } };
      chk(); const nodes = document.querySelectorAll('#gaCards .clsN'); nodes[1].click(); await new Promise(r => setTimeout(r, 30)); chk();
      const buy = document.getElementById('clsBuy'); const can = buy && !buy.disabled; if (buy) buy.click(); await new Promise(r => setTimeout(r, 30));
      const cards = document.querySelectorAll('#gaCards .clsC'); cards[4].click(); await new Promise(r => setTimeout(r, 30)); document.getElementById('clsPick').click(); await new Promise(r => setTimeout(r, 30)); chk();
      return { bad: [...new Set(bad)], can, owned: Object.keys(C.sv().own).length, pick: C.sv().c, tabs: [...document.querySelectorAll('#garage .tabs button')].filter(b => !b.hidden).map(b => b.getBoundingClientRect()).some(r => r.height < 30) }; });
    line(!ui.bad.length && ui.can && ui.owned === 1 && ui.pick === 'gambler', `PILOT tab ${vp.width}x${vp.height}: tap node, unlock, pick (${ui.bad.length} findings${ui.bad.length ? ': ' + ui.bad.slice(0, 4).join('; ') : ''})`);
    await p.context().close();
  }
  await br.close(); srv.kill();
  line(!errs.length, `no page errors (${errs.length}${errs.length ? ': ' + errs[0].slice(0, 120) : ''})`);
  // 7: balance on a reduced bot set
  if (process.env.BAL !== '0') {
    // common random numbers: the n-th run of a stage gets the same game dice in every config (newGame copies Math.random into GR/GX), so a class is compared with
    // the same waves and drops, not with luck (two no-class baselines differed by up to 14 points without this)
    const CRN = "(()=>{const mul=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const m=window.__mnr,s0=m.startStory;m.startStory=function(n){const k='crn'+n,c=(+localStorage.getItem(k)||0)+1;localStorage.setItem(k,c);Math.random=mul(n*7919+c*104729);return s0.apply(this,arguments);};})()";
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cls-')), res = {}, raw = {};
    const CF = (process.env.CLS || 'none,none2,' + IDS.join(',')).split(',');
    for (const id of CF) {
      const out = path.join(tmp, id + '.json'), Q = /^none/.test(id) ? '&classes=0' : `&cls=${id}&clstree=all`;
      const r = cp.spawnSync('node', [path.join(__dirname, 'humanbot.js')], { env: Object.assign({}, process.env, { BOTS: 'human,dodger', BUILDS: 'mid', STAGES, RUNS: String(RUNS), PAR, Q, JSON: out, PRE: CRN }), encoding: 'utf8', timeout: 900000 });
      if (!fs.existsSync(out)) { line(false, `balance run ${id} produced no data ${(r.stdout || '').slice(-200)}`); continue; }
      raw[id] = JSON.parse(fs.readFileSync(out, 'utf8'));
    }
    // survival = share of the stage the bot stays alive (a clear or a run still alive at the time limit = 100%; a death at t = t / stage length):
    // it reads the same as a survive rate but is far less noisy than the yes/no rate, which is printed next to it
    const all = [].concat(...Object.values(raw)), Ln = {}; for (const q of all) if (!q.dead) Ln[q.n] = Math.max(Ln[q.n] || 0, q.t);
    const alive = q => q.dead ? Math.min(1, q.t / (Ln[q.n] || q.t)) : 1;
    const sum = a => { const h = a.filter(q => q.bot === 'human'), d = a.filter(q => q.bot === 'dodger'), m = x => x.length ? 100 * x.reduce((s, q) => s + alive(q), 0) / x.length : 0, pc = (x, f) => x.length ? 100 * x.filter(f).length / x.length : 0;
      const kills = a.reduce((s, q) => s + q.life.length, 0), mins = a.reduce((s, q) => s + q.t, 0) / 60;
      const st = STAGES.split(',').map(Number).map(n => n + ':' + Math.round(m(h.filter(q => q.n === n))) + '/' + Math.round(m(d.filter(q => q.n === n)))).join(' ');
      return { hs: m(h), dc: m(d), hb: pc(h, q => !q.dead), db: pc(d, q => q.clear), kpm: kills / Math.max(mins, .01), st, n: a.length }; };
    const base = [].concat(...Object.keys(raw).filter(k => /^none/.test(k)).map(k => raw[k]));
    if (base.length) {
      res.base = sum(base); for (const id of Object.keys(raw)) res[id] = sum(raw[id]);
      for (const id of ['base'].concat(Object.keys(raw))) { const r = res[id]; console.log(`  ${id.padEnd(8)} human alive ${r.hs.toFixed(0)}% (survive ${r.hb.toFixed(0)}%)  dodger alive ${r.dc.toFixed(0)}% (clear ${r.db.toFixed(0)}%)  kills/min ${r.kpm.toFixed(1)}  per stage human/dodger ${r.st}  n=${r.n}`); }
      const b = res.base;
      for (const id of IDS) { const r = res[id]; if (!r) continue;
        line(Math.abs(r.hs - b.hs) <= 8 && Math.abs(r.dc - b.dc) <= 8, `${id}: human alive ${r.hs.toFixed(0)} vs ${b.hs.toFixed(0)}, dodger alive ${r.dc.toFixed(0)} vs ${b.dc.toFixed(0)} (within 8)`);
        line(Math.abs(r.kpm / b.kpm - 1) <= .15, `${id}: kills/min ${r.kpm.toFixed(1)} vs ${b.kpm.toFixed(1)} (within 15%)`); }
      const C = IDS.filter(i => res[i]), hs = C.map(i => res[i].hs), dc = C.map(i => res[i].dc);
      if (C.length > 1) line(Math.max(...hs) - Math.min(...hs) <= 10 && Math.max(...dc) - Math.min(...dc) <= 10, `no class dominates: human spread ${(Math.max(...hs) - Math.min(...hs)).toFixed(0)}, dodger spread ${(Math.max(...dc) - Math.min(...dc)).toFixed(0)} (<= 10)`);
      if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(res));
    }
  }
  console.log(fails ? `FAIL classes-test: ${fails} check(s)` : 'PASS classes-test'); process.exit(fails ? 1 : 0);
})();
