#!/usr/bin/env node
// FOCUS (parts/menus/focus.js, flag RET.focus): title = FLIGHT / ON FOOT / SETTINGS / LAB; one song per mode; result + pause screens RETRY / TITLE.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/focus-test.js     env: GAME_DIR=<dir with index.html>
// Stepped (no real-time play): flight stage 1 is stepped with __mnr.step, the street with street2-test's bot (FOOT.sim). Audio needs the autoplay switch (set here).
// Every step the song that is really playing (AU.cur.stage, BT.stage, a pending change) is sampled; every AU.startStage / switchTo call is logged with the mode.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + String(i).slice(0, 300))); };
const s3 = fs.readFileSync(path.join(__dirname, 'street3-test.js'), 'utf8'), m = s3.match(/const SEED = (\(\) => \{.*\});\n/), SEED = eval(m[1]);
const s2 = fs.readFileSync(path.join(__dirname, 'street2-test.js'), 'utf8'), RUN = s2.slice(s2.indexOf('const RUN = ') + 12, s2.indexOf('\n(async () =>')).trim().replace(/;$/, '');
const VIS = () => [...document.querySelectorAll('#title button')].filter(b => b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden').map(b => b.textContent.trim().replace(/\s+/g, ' '));
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), errs = [];
  const base = `http://127.0.0.1:${port}/index.html`;
  const page = async q => { const ctx = await br.newContext({ viewport: { width: 1000, height: 700 } }); await ctx.addInitScript(SEED);
    await ctx.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(base + q, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3 && document.documentElement.classList.contains('rdy'), null, { timeout: 25000 }).catch(() => { }); await sleep(800); return p; };
  // ---- focus=0: the old title
  const p0 = await page('?focus=0'); const old = await p0.evaluate(VIS);
  ok(old.length > 4 && !(await p0.evaluate(() => !!document.getElementById('focusBox'))), `?focus=0 keeps the old title (${old.length} buttons: ${old.slice(0, 6).join(' | ')})`); await p0.context().close();
  // ---- focus on
  const p = await page(''); await p.evaluate(() => { SND.AU.init(); SND.AU.a.resume(); }); await sleep(300);
  const tv = await p.evaluate(VIS);
  ok(tv.length === 4 && ['FLIGHT', 'ON FOOT', 'SETTINGS', 'LAB'].every(t => tv.includes(t)), `title has exactly the 4 buttons: ${tv.join(' | ')}`);
  await p.evaluate(() => { window.MODE = 'title'; window.LOG = []; window.PLAY = {}; const AU = SND.AU;
    for (const f of ['startStage', 'switchTo']) { const o = AU[f]; AU[f] = function () { LOG.push(MODE + ':' + f + ':' + [].slice.call(arguments).join(',')); return o.apply(this, arguments); }; }
    window.SAMPLE = () => { const c = SND.AU.cur, B = __mnr.BT, set = (PLAY[MODE] = PLAY[MODE] || new Set()); if (c && c.stage) set.add(c.stage); if (B && B.stage) set.add(B.stage); if (B && B.pend && B.pend.v && B.pend.v.stage) set.add(B.pend.v.stage); if (SND.AU.want) set.add(SND.AU.want); }; });
  await p.evaluate(() => SND.AU.menuMusic()); await sleep(1500); await p.evaluate(() => SAMPLE());
  const tt = await p.evaluate(() => [...PLAY.title]); ok(!tt.length, `the title is silent (playing: ${tt.join(',') || 'nothing'})`);
  const song1 = await p.evaluate(() => __mnr.STAGES[0].song);
  // ---- flight stage 1, stepped: FLIGHT -> to the end -> RETRY -> to the end -> TITLE
  const clickRetry = async () => { const id = await p.evaluate(() => ['srRetry', 'againBtn'].find(i => document.getElementById(i).getClientRects().length)); await p.click('#' + id); };
  const flightRun = async (clearAt) => p.evaluate(async (clearAt) => {
    const M = __mnr; M.simOn(true); let n = 0, why = 'none';
    while (n++ < 60000) {
      M.P.hp = M.P.max; M.step(1 / 60); if (clearAt && n === clearAt) { M.ST.clear(false); for (let k = 0; k < 400 && !M.ST.over; k++) M.step(1 / 60); }
      if (clearAt && n === clearAt + 400) { if (document.getElementById('stres').hidden) M.ST.finish(); }   // the stage-clear timer is the game's own; finish() is its last call if (n % 30 === 0) SAMPLE();
      if (!document.getElementById('stres').hidden) { why = 'clear'; break; } if (!document.getElementById('over').hidden) { why = 'fail'; break; }
    }
    SAMPLE(); return { why, eye: document.getElementById('overEyebrow').textContent, hp: M.P.hp, t: M.G.t, boss: !!M.G.bossDone || !!M.G.boss, st: M.ST.n };
  }, clearAt);
  await p.evaluate(() => { MODE = 'flight'; }); await p.click('#focFlight');
  await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 });
  const f1 = await flightRun(900); console.log(`  flight run 1: ${JSON.stringify(f1)}`);
  const sc = await p.evaluate(() => { const v = id => { const e = document.getElementById(id); return !!(e && e.getClientRects().length); }; return { res: v('stres'), over: v('over'), next: v('srNext'), stages: v('srMenu') || v('stBtn2'), retry: v('srRetry') || v('againBtn'), title: v('focTitle') || v('menuBtn') }; });
  ok(f1.why === 'clear', `flight stage 1 ran to its end (${f1.why}, stage ${f1.st})`);
  ok(!sc.next && !sc.stages && sc.retry && sc.title, `result screen offers RETRY + TITLE only: ${JSON.stringify(sc)}`);
  await clickRetry(); await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 });
  // stage 1 has no boss: ask for the boss song, a boss second part, a fever cue, a sting and a duck the way the boss / music pack code does
  await p.evaluate(() => { __mnr.simOn(true); for (let i = 0; i < 300; i++) { __mnr.P.hp = __mnr.P.max; __mnr.step(1 / 60); } const AU = SND.AU; AU.startStage('boss'); AU.switchTo('boss2'); AU.switchTo('boss-d0~b'); AU.switchTo('fever-120'); AU.startStage('stage2'); AU.sting('clear'); AU.duckMusic(1); for (let i = 0; i < 300; i++) { __mnr.P.hp = __mnr.P.max; __mnr.step(1 / 60); if (i % 30 === 0) SAMPLE(); } });
  const f2 = await flightRun(); console.log(`  flight run 2 (after retry): ${JSON.stringify(f2)}`);
  // pause screen
  await clickRetry(); await p.waitForFunction(() => __mnr.running, null, { timeout: 8000 });
  await p.evaluate(() => { const e = new KeyboardEvent('keydown', { code: 'KeyP', key: 'p' }); dispatchEvent(e); }); await sleep(300);
  const pz = await p.evaluate(() => { const v = id => { const e = document.getElementById(id); return !!(e && e.getClientRects().length); }; return { open: v('pausem'), set: v('pSetBtn'), retry: v('restartBtn'), title: v('quitBtn') }; });
  ok(!pz.open || (!pz.set && pz.retry && pz.title), `pause screen: no SETTINGS, has RETRY + TITLE: ${JSON.stringify(pz)}`);
  await p.evaluate(() => document.getElementById(document.getElementById('pausem').hidden ? 'menuBtn' : 'quitBtn').click()); await sleep(600);
  const fl = await p.evaluate(() => ({ calls: LOG.filter(c => /^flight:/.test(c)), play: [...(PLAY.flight || [])] }));
  ok(fl.play.length === 1 && fl.play[0] === song1, `flight: exactly one song ever playing: ${fl.play.join(',')} (stage-1 song ${song1})`);
  console.log(`  flight calls: ${fl.calls.length} (${[...new Set(fl.calls)].join(' ')})`);
  const back = await p.evaluate(VIS); ok(back.length === 4, `back at the title with the 4 buttons: ${back.join(' | ')}`);
  // ---- street run: ON FOOT -> bot plays the stage -> RETRY -> TITLE
  await p.evaluate(() => { MODE = 'street'; PLAY.street = new Set(); LOG.length = 0; RET.tale = false; });
  await p.click('#focFoot'); await p.waitForFunction(() => FOOT.on && FOOT.S && !document.getElementById('footQ'), null, { timeout: 20000 });
  await sleep(500); await p.evaluate(() => SAMPLE());
  const V = ids => p.evaluate(ids => Object.fromEntries(ids.map(i => { const e = document.getElementById(i); return [i, !!(e && e.getClientRects().length)]; })), ids);
  await p.keyboard.press('KeyP'); await sleep(300);   // pause: RESUME / RETRY / TITLE
  const pv = await V(['fResume', 'fRetry', 'fQuit']); const pt = await p.evaluate(() => document.getElementById('fQuit').textContent);
  ok(pv.fRetry && pv.fQuit && pt === 'TITLE', `street pause: RETRY + TITLE (+ RESUME): ${JSON.stringify(pv)} ${pt}`);
  await p.click('#fRetry'); await sleep(600); await p.evaluate(() => SAMPLE());   // a retry keeps the song running
  await p.evaluate(`(${RUN})(4321)`); await p.evaluate(() => SAMPLE());
  await p.evaluate(() => { FOOT.ui = 1; FOOT.start(FOOT.main); }); await p.waitForFunction(() => FOOT.on && FOOT.S && !document.getElementById('footQ'), null, { timeout: 20000 });
  await p.evaluate(() => { FOOT.S.P.hp = 0; FOOT.S.dead = 0.05; FOOT.sim(2, 1 / 60); }); await sleep(1500); await p.evaluate(() => SAMPLE());   // Kai goes down: the game builds its own result sheet
  const sv = await V(['fAgain', 'fFly', 'fCp', 'fCity']); const ct = await p.evaluate(() => (document.getElementById('fCity') || {}).textContent);
  ok(sv.fAgain && !sv.fFly && !sv.fCp && sv.fCity && ct === 'TITLE', `street result: RETRY + TITLE only: ${JSON.stringify(sv)} ${ct}`);
  await p.evaluate(() => { const b = document.getElementById('fCity'); if (b) b.click(); }); await sleep(800);
  const st = await p.evaluate(() => ({ calls: LOG.filter(c => /^street:/.test(c)), play: [...PLAY.street] }));
  ok(st.play.length === 1 && st.play[0] === 'street1', `street: exactly one song ever playing: ${st.play.join(',')}`);
  ok(st.calls.every(c => /startStage:street1/.test(c)), `street: every call is street1: ${[...new Set(st.calls)].join(' ')}`);
  const end = await p.evaluate(VIS); ok(end.length === 4, `title again after the street: ${end.join(' | ')}`);
  ok(errs.length === 0, `page errors ${errs.length} ${errs[0] || ''}`);
  await br.close(); srv.kill(); const f = res.filter(x => !x).length; console.log(f ? 'FAIL focus-test' : 'PASS focus-test'); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL focus-test ' + e.message); process.exit(1); });
