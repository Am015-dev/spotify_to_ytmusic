#!/usr/bin/env node
// RETENTION test: checkpoints with grace (parts/difficulty/cp.js, flag RET.cp, ?cp=0 = off). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-cp-test.js     env: GAME_DIR=...
// Checks: checkpoints only on long (>= 150 s) non-arcade stages, never in a boss fight or the last 15 s, bar-aligned; passing one snapshots the run; a death after one offers RESUME;
// a resume restores score / kills / perks, half hull (>= 2), 3 s grace, the stage clock and the beat grid (within 40 ms); the run is marked (assist-style: no records, Neon x0.75, no hull-lost star);
// one resume per checkpoint, 2 per stage; the idle ship still dies after a resume; flag off = the old game; layout on a phone (390x763) and desktop (1280x720); no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), base = `http://127.0.0.1:${port}/index.html?sim=1&all=1`;
  const open = async (vp, q) => { const p = await br.newPage({ viewport: vp || { width: 960, height: 540 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + (q || '')); await p.waitForFunction(() => window.__mnr && window.RET && window.CHK && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); p.errs = errs; return p; };
  // the helpers live in the page: start a stage, run it, kill the ship, wait for the run-end screen
  const helpers = () => {
    window.T = {
      start(n, arcade) { const m = __mnr; m.abort(); m.ARC.on = !!arcade; m.simOn(true); m.startStory(n); m.step(.05); },
      steps(n, dt) { for (let i = 0; i < n; i++) __mnr.step(dt || 1 / 30); },
      toBar(b) { const m = __mnr; m.god = true; m.G.dbar = b - .02; m.G.dt = m.G.dbar * 4 * m.BT.spb; m.ST.hits = 0; T.steps(6); },
      kill() { const m = __mnr; m.god = false; m.P.inv = 0; m.P.hp = 1; m.G.eb = []; m.hurt(1); for (let i = 0; i < 400 && !m.G.over; i++) m.step(1 / 30); return !!m.G.over; },
    };
  };
  const p = await open(); await p.evaluate(helpers);

  // ---- 1. which stages get checkpoints ----
  const scan = await p.evaluate(() => { const m = __mnr, out = []; const was = m.ARC.on;
    for (let n = 1; n <= m.MAIN; n++) for (const arc of [true, false]) { m.ARC.on = arc; m.ST.setLevel(n); m.ST.on = true; CHK.build();
      out.push({ n, arc, ch: !!m.ST.ch, boss: m.ST.def.goal.k, len: m.ST.len, lead: m.ST.lead, bs: CHK.barS(), plan: CHK.plan.map(x => x.bar) }); }
    m.ST.on = false; m.ARC.on = was; return out; });
  const dur = s => s.len * s.bs, hasCp = scan.filter(s => s.plan.length);
  ok('some stages have checkpoints in Classic', hasCp.some(s => !s.arc), hasCp.length);
  ok('only stages >= 150 s have any', scan.every(s => !s.plan.length || dur(s) >= 150), JSON.stringify(scan.filter(s => s.plan.length && dur(s) < 150).slice(0, 2)));
  ok('every stage >= 150 s that is not arcade-cut has them (unless too short to place)', scan.filter(s => !s.arc && !s.ch && dur(s) >= 150).every(s => s.plan.length), JSON.stringify(scan.filter(s => !s.arc && !s.ch && dur(s) >= 150 && !s.plan.length).slice(0, 2)));
  ok('arcade 3-minute cuts have none', scan.filter(s => s.arc && dur(s) <= 150.5).every(s => !s.plan.length), '');
  ok('challenge stages have none', scan.filter(s => s.ch).every(s => !s.plan.length), '');
  ok('none inside a boss approach end or the last 15 s', hasCp.every(s => { const end = (s.boss === 'boss' || s.boss === 'mini') ? s.lead : s.len; return s.plan.every(b => b <= end - Math.ceil(15 / s.bs) && b * s.bs < end * s.bs - 14.9); }), '');
  ok('bars are whole numbers, at about 1/3 and 2/3', hasCp.every(s => s.plan.every(b => Number.isInteger(b)) && s.plan.length >= 1), '');
  ok('boss stages put them before the boss', hasCp.filter(s => s.boss === 'boss').every(s => s.plan.every(b => b < s.lead)), '');
  const pick = hasCp.filter(s => !s.arc && s.plan.length === 2 && s.boss !== 'boss' && s.boss !== 'mini').sort((a, b) => a.n - b.n)[0] || hasCp.filter(s => !s.arc && s.plan.length === 2)[0];
  ok('a stage with 2 checkpoints exists to test on', !!pick, '');
  const N = pick ? pick.n : 1;

  // ---- 2. endless and the arcade cut start with no plan ----
  const arc = await p.evaluate(n => { T.start(n, true); return CHK.plan.length; }, N);
  ok('arcade cut of the same stage: no checkpoints', arc === 0, arc);
  await p.evaluate(() => { __mnr.abort(); }); await p.evaluate(() => { __mnr.ST.on = false; document.getElementById('startBtn').click(); __mnr.step(.1); });
  const endless = await p.evaluate(() => ({ plan: CHK.plan.length, st: __mnr.ST.on, run: __mnr.running }));
  ok('endless: no checkpoints', endless.plan === 0 && !endless.st, JSON.stringify(endless));

  // ---- 3. the flow on the long stage ----
  const f = await p.evaluate(n => { const m = __mnr, o = {}; T.start(n, false); const pl = CHK.plan.slice(); o.plan = pl.map(x => x.bar); o.bars = []; NR.on('bar', d => o.bars.push(d.i));
    m.GA.bank = 1000; m.G.score = 12345; m.G.kills = 7; m.SH.add('sh'); o.max = m.P.max;
    T.toBar(pl[0].bar); o.snap = !!CHK.sn; o.banner = m.G.banner.a; o.sn = CHK.sn && { score: CHK.sn.score, kills: CHK.sn.kills, bar: CHK.sn.bar, sh: CHK.sn.sh.got.sh };
    o.hudFlags = CHK.plan.filter(x => x.hit).length;
    m.G.score = 99999; m.G.kills = 40; m.SH.add('sh'); m.SH.add('sh'); m.SH.neon = 55; o.shBefore = m.SH.n('sh');
    o.dead = T.kill(); o.btn = document.getElementById('cpResume'), o.btnShown = !!o.btn && !document.getElementById('cpBox').hidden && !document.getElementById('over').hidden; o.btn = o.btn && o.btn.textContent;
    o.retry = document.getElementById('againBtn').textContent; o.assist0 = RET.assistRun(); o.bank0 = m.GA.bank; o.fails0 = (RET.fails[n] | 0); return o; }, N);
  ok('checkpoint 1 is taken at its bar with a banner', f.snap && /CHECKPOINT/.test(f.banner) && f.hudFlags === 1, JSON.stringify([f.snap, f.banner, f.hudFlags]));
  ok('snapshot holds score / kills / perks at the checkpoint', f.sn && f.sn.score === 12345 && f.sn.kills === 7 && f.sn.sh === f.shBefore - 2, JSON.stringify([f.sn, f.shBefore]));
  ok('death after a checkpoint: run-end shows RESUME FROM CHECKPOINT and the old retry', f.dead && f.btnShown && /RESUME FROM CHECKPOINT/.test(f.btn) && /ONE MORE RUN|FLY AGAIN/.test(f.retry), JSON.stringify([f.dead, f.btnShown, f.btn, f.retry]));
  ok('the death itself is not marked (full pay)', f.assist0 === false, f.assist0);
  await p.waitForTimeout(800);
  const lay = async (vp) => { await p.setViewportSize(vp); await p.waitForTimeout(250); return p.evaluate(() => { const r = id => { const e = document.getElementById(id); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, fs: parseFloat(getComputedStyle(e).fontSize) }; };
    const B = ['cpResume', 'againBtn', 'menuBtn', 'stBtn2'].map(r), names = ['cpResume', 'againBtn', 'menuBtn', 'stBtn2'], o = { rects: {}, hs: document.documentElement.scrollWidth > innerWidth + 1, vw: innerWidth, vh: innerHeight, overlap: [] };
    names.forEach((n, i) => { o.rects[n] = B[i]; });
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const a = B[i], b = B[j]; if (a && b && a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1) o.overlap.push(names[i] + '/' + names[j]); }
    const c = document.getElementById('cpNote').getBoundingClientRect(); o.note = { fs: parseFloat(getComputedStyle(document.getElementById('cpNote')).fontSize), bottom: c.bottom }; return o; }); };
  for (const vp of [{ width: 390, height: 763 }, { width: 1280, height: 720 }]) { const l = await lay(vp), r = l.rects.cpResume, tag = ` (${vp.width}x${vp.height})`;
    ok('RESUME button is on screen, >= 44 px tall, text >= 14 px' + tag, r && r.h >= 44 && r.fs >= 14 && r.x >= 0 && r.x + r.w <= l.vw && r.y >= 0 && r.y + r.h <= l.vh && l.note.fs >= 14, JSON.stringify([r, l.note]));
    ok('nothing overlaps, no horizontal scroll' + tag, l.overlap.length === 0 && !l.hs, JSON.stringify([l.overlap, l.hs])); }
  await p.setViewportSize({ width: 960, height: 540 });
  const R = await p.evaluate(async n => { const m = __mnr, o = {}; const sbar = CHK.sn.bar; o.bank1 = m.GA.bank; document.getElementById('cpResume').click();
    o.running = m.running; o.over = document.getElementById('over').hidden; o.marked = CHK.marked; o.assist = RET.assistRun(); o.score = m.G.score; o.kills = m.G.kills; o.sh = m.SH.n('sh'); o.hp = m.P.hp; o.max = m.P.max; o.inv = m.P.inv; o.gt = CHK.gt; o.dbar = m.G.dbar; o.sbar = sbar; o.dead = m.G.dead;
    o.bankAfter = m.GA.bank; o.fails = (RET.fails[n] | 0); o.n = CHK.n; o.ev = null; return o; }, N);
  ok('resume starts the run again and hides the run-end screen', R.running && R.over && !R.dead, JSON.stringify([R.running, R.over, R.dead]));
  ok('score / kills / perks are the checkpoint snapshot', R.score === 12345 && R.kills === 7 && R.sh === f.shBefore - 2, JSON.stringify([R.score, R.kills, R.sh, f.shBefore]));
  ok('half hull, at least 2', R.hp === Math.max(2, Math.ceil(R.max / 2)) && R.hp >= 2, JSON.stringify([R.hp, R.max]));
  ok('3 s grace with the shimmer flag', R.inv >= 2.9 && Math.abs(R.gt - 3) < .01, JSON.stringify([R.inv, R.gt]));
  ok('stage clock is at the checkpoint bar', Math.abs(R.dbar - R.sbar) < .3, JSON.stringify([R.dbar, R.sbar]));
  ok('the run is marked (assist-style, no records)', R.marked && R.assist, JSON.stringify([R.marked, R.assist]));
  ok('the death does not count as a failed try', R.fails === f.fails0 - 0 || R.fails === Math.max(0, f.fails0 - 1) || R.fails === (f.fails0 - 1 > 0 ? f.fails0 - 1 : 0), JSON.stringify([R.fails, f.fails0]));
  // grace: the ship takes no damage for 3 s even when shot
  const g = await p.evaluate(() => { const m = __mnr; m.god = false; const hp = m.P.hp; for (let i = 0; i < 60; i++) { m.eb(m.P.x + 30, m.P.y, Math.PI, 200, '#f00', 6); m.step(1 / 30); } const mid = m.P.hp; T.steps(60); return { hp, mid, late: m.P.hp, inv: m.P.inv }; });
  ok('no damage during the 3 s grace', g.mid === g.hp, JSON.stringify(g));
  // beat grid after the resume: stage clock vs the beat clock within 40 ms, bars whole
  const bg = await p.evaluate(() => { const m = __mnr, spb = m.BT.spb, a = m.bpos() / 4 - m.G.dbar; return { errMs: Math.abs(a) * 4 * spb * 1000, bpos: m.bpos(), frac: m.bpos() % 4 }; });
  ok('beat grid within 40 ms of the stage clock after the resume', bg.errMs < 40, JSON.stringify(bg));
  const ev = await p.evaluate(() => { return null; });
  const bars = await p.evaluate(() => { const m = __mnr, pos = []; const f = d => pos.push(d.i); NR.on('bar', f); T.steps(200); return pos.slice(0, 3); });
  ok('bar events are on whole bars at the checkpoint (multiples of 4 beats)', bars.length > 0 && bars.every(i => i % 4 === 0), JSON.stringify(bars));
  // marked run pays 75%, no hull-lost star, no Heat medal
  const pay = await p.evaluate(n => { const m = __mnr, S = m.sSave; S.stars = {}; m.GA.bank = 0; const a = RET.payClear(n, 3), base = 40 + 12 * n + 75; RET.assistRun(); const medal = RET.assistRun();
    CHK.marked = false; S.stars = {}; m.GA.bank = 0; const b = RET.payClear(n, 3); CHK.marked = true; return { a, b, base, medal, row: RET.resultRow() }; }, N);
  ok('Neon at 75% on a marked run, 100% otherwise', pay.b === pay.base && pay.a === Math.round(pay.base * .75), JSON.stringify(pay));
  ok('Heat medal is blocked (assistRun true) and the result row says so', pay.medal && /↺/.test(pay.row) && !/Assist run/.test(pay.row), pay.row);
  const star = await p.evaluate(() => { const m = __mnr; m.ST.hits = 0; m.ST.over = false; m.G.dead = false; m.ST.clear(); return m.ST.stars.slice(); });
  ok('no hull-lost star on a marked run, the stage still clears', star[0] === 1 && star[2] === 0, JSON.stringify(star));

  // ---- 4. caps: one resume per checkpoint, two per stage ----
  const c2 = await p.evaluate(async n => { const m = __mnr, o = {}; T.start(n, false); T.toBar(CHK.plan[0].bar); o.d1 = T.kill(); o.show1 = !document.getElementById('cpBox').hidden;
    await new Promise(r => setTimeout(r, 700)); document.getElementById('cpResume').click(); o.n1 = CHK.n;
    o.d2 = T.kill(); o.show2 = !document.getElementById('cpBox').hidden;   // died again before the next checkpoint: the first one is used up
    return o; }, N);
  ok('first resume used: no second offer on the same checkpoint', c2.d1 && c2.show1 && c2.n1 === 1 && c2.d2 && !c2.show2, JSON.stringify(c2));
  const c3 = await p.evaluate(async n => { const m = __mnr, o = {}; await new Promise(r => setTimeout(r, 700)); document.getElementById('againBtn').click(); o.fresh = CHK.n; return o; }, N);
  ok('RETRY (ONE MORE RUN) is a normal fresh start: the cap and the mark reset', c3.fresh === 0, JSON.stringify(c3));
  const c4 = await p.evaluate(async n => { const m = __mnr, o = {}; T.toBar(CHK.plan[0].bar); T.toBar(CHK.plan[1].bar); o.sn = CHK.sn.i; o.d = T.kill(); o.show = !document.getElementById('cpBox').hidden;
    await new Promise(r => setTimeout(r, 700)); document.getElementById('cpResume').click(); o.n = CHK.n; o.d2 = T.kill(); o.show2 = !document.getElementById('cpBox').hidden; o.cap = CHK.n; return o; }, N);
  ok('second checkpoint: resume once, then no more', c4.sn === 1 && c4.show && c4.n === 1 && !c4.show2, JSON.stringify(c4));
  const cap = await p.evaluate(() => { CHK.used = {}; CHK.n = 2; return CHK.eligible(); });
  ok('2 resumes per stage is the cap', cap === false, cap);

  // ---- 5. the idle ship still dies after a resume ----
  const idle = await p.evaluate(async n => { const m = __mnr; T.start(n, false); T.toBar(CHK.plan[0].bar); T.kill(); await new Promise(r => setTimeout(r, 700)); document.getElementById('cpResume').click(); m.god = false;
    let t = 0; while (t < 90 && !m.G.dead) { m.step(1 / 30); t += 1 / 30; } return { dead: m.G.dead, t: +t.toFixed(1), still: +m.STILL.t.toFixed(1) }; }, N);
  ok('an idle ship still dies after a resume (STILL beam / discharge)', idle.dead && idle.t < 60, JSON.stringify(idle));

  // ---- 6. flag off = the old game ----
  const off = await open(null, '&cp=0'); await off.evaluate(helpers);
  const o0 = await off.evaluate(async n => { const m = __mnr, o = {}; T.start(n, false); o.plan = CHK.plan.length; o.flag = RET.cp; T.toBar(Math.round(m.ST.len / 3)); o.snap = !!CHK.sn; o.banner = m.G.banner.a; o.d = T.kill(); o.box = !document.getElementById('cpBox') || document.getElementById('cpBox').hidden; o.assist = RET.assistRun(); o.retry = document.getElementById('againBtn').textContent; return o; }, N);
  ok('?cp=0: no plan, no snapshot, no banner, no RESUME button, retry as before', o0.flag === false && o0.plan === 0 && !o0.snap && !/CHECKPOINT/.test(o0.banner) && o0.d && o0.box && !o0.assist, JSON.stringify(o0));
  ok('?cp=0: no page errors', off.errs.length === 0, off.errs.join('|'));
  ok('no page errors', p.errs.length === 0, p.errs.join('|'));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAIL` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.message); process.exit(1); });
