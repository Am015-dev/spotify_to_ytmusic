// OPEN PROBE (W310): the first 10 seconds. Stepped clock (__mnr.step / FOOT.sim at 1/60), no wall-clock play.
// Flight: the run starts by a real tap/click on the FLIGHT button (no audio: the beat follows stepped time), then the ship is left alone (autofire) and the probe logs
//   foe = first foe fully inside the play field, aim = first enemy bullet whose heading is within 25 deg of the ship at spawn, dive = first foe ramming the ship (alive.js charge phase, after its red aim line).
// Street: FOOT.start('zeil') stepped; bot 'right' holds right as the tutorial line says (stops 300 px short of a foe), bot 'idle' does nothing.
//   view = first foe inside the camera, reach = first foe within 420 px of Kai and inside the camera (the pistol crosses that in 0.45 s).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/open-probe.js   env: NOSTREET=1 (flight only) SEEDS=8 DEVS=phone,pc GATE=1 (fail when a minimum misses the W310 targets) Q=<extra query>
// Prints one line per run and the worst (maximum) time per measure. Times in game seconds from run start.
const L = require('./lib.js'), { PW, sleep } = L;
const SEEDS = +process.env.SEEDS || 8, DEVS = (process.env.DEVS || 'phone,pc').split(','), Q = process.env.Q || '';
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
const SEEDJS = s => `(()=>{let a=${s}*2654435761>>>0||1;Math.random=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.AudioContext=undefined;window.webkitAudioContext=undefined;})()`;
const FLY = () => { const W = 960, H = 540, m = window.__mnr, G = m.G, P = m.P, R = window.__op || (window.__op = { foe: -1, aim: -1, dive: -1, seen: new WeakSet(), first: '' });
  for (let i = 0; i < 12; i++) { m.step(1 / 60); const t = G.t;
    for (const e of G.en) { if (e.dead || e.hp <= 0 || e.type === 'boss') continue; const r = e.r || 14;
      if (R.foe < 0 && e.x + r < W && e.x - r > 0 && e.y > 0 && e.y < H) { R.foe = t; R.first = e.type; }
      if (R.dive < 0 && e.al && e.al.ph === 'charge') R.dive = t;   // alive.js: after its red aim line the foe rams the ship's predicted spot
    }
    window.__nb = (window.__nb || 0); for (const b of G.eb) { if (R.seen.has(b)) continue; R.seen.add(b); window.__nb++; const v = Math.hypot(b.vx || 0, b.vy || 0); if (R.aim >= 0 || !v) continue;
      const dx = P.x - b.x, dy = P.y - b.y, c = ((b.vx || 0) * dx + (b.vy || 0) * dy) / (v * Math.hypot(dx, dy) || 1); if (c > Math.cos(25 * Math.PI / 180)) R.aim = t; } }
  return { t: G.t, live: !!G.live, foe: R.foe, aim: R.aim, dive: R.dive, first: R.first, nb: window.__nb }; };
const STREET = (bot, seed) => { let s = seed; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const F = FOOT; F.ctl = (S, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; if (bot === 'right') { const P = S.P, near = S.E.some(e => !e.dead && e.x > P.x && e.x - P.x < 300); if (!near) I.r = 1; } };
  RET.tale = false; F.start('zeil'); const R = { view: -1, reach: -1, first: '' }; let S = F.S;
  for (let j = 0; j < 12 * 60 && S && !S.end; j++) { S = F.sim(1 / 60, 1 / 60); const vw = F.env.G.viewW || 960, P = S.P;
    for (const e of S.E) { if (e.dead || e.boss) continue; const inV = e.x > S.camX && e.x < S.camX + vw;
      if (inV && R.view < 0) { R.view = +S.time.toFixed(2); R.first = e.def && e.def.id || e.id; } if (inV && R.reach < 0 && Math.abs(e.x - P.x) < 420) R.reach = +S.time.toFixed(2); }
    if (R.view >= 0 && R.reach >= 0) break; }
  R.dbg = S ? [+S.time.toFixed(2), S.E.length, Math.round(S.P.x), Math.round(S.camX), !!S.end, S.s3 && S.s3.intro] : null;
  F.ctl = null; return R; };
(async () => {
  const b = await L.boot(); const out = { fly: [], st: [] };
  for (const dn of DEVS) { const d = DEV[dn];
    for (let sd = 1; sd <= SEEDS; sd++) {
      const ctx = await b.br.newContext({ viewport: { width: d.W, height: d.H }, deviceScaleFactor: 1, hasTouch: d.touch, isMobile: d.touch, userAgent: d.touch ? L.UA : undefined });
      const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160)));
      await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
      await p.addInitScript(SEEDJS(sd)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.goto(b.base + '?nomusic=1' + Q, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 15000 });
      await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(400);
      const bx = await p.evaluate(() => { const e = document.getElementById('focFlight'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      if (!bx) { console.log(`FAIL ${dn} seed ${sd}: no FLIGHT button`); await ctx.close(); continue; }
      if (d.touch) await p.touchscreen.tap(bx[0], bx[1]); else await p.mouse.click(bx[0], bx[1]);
      for (let i = 0; i < 40 && !(await p.evaluate(() => !!window.__mnr.G.live)); i++) await sleep(100);
      await p.evaluate(() => window.__mnr.simOn(true)); let r;
      for (let i = 0; i < 60; i++) { r = await p.evaluate(FLY); if (r.t >= 10 || (r.foe >= 0 && r.aim >= 0 && r.dive >= 0)) break; }
      out.fly.push({ dn, sd, ...r }); console.log(`fly ${dn} seed ${sd}: foe ${r.foe.toFixed(2)} (${r.first}) aim-shot ${r.aim.toFixed(2)} dive ${r.dive.toFixed(2)} (enemy bullets in 10 s: ${r.nb})`);
      if (sd <= 4 && !process.env.NOSTREET) for (const bot of ['right', 'idle']) { await p.goto(b.base + '?nomusic=1' + Q, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3, null, { timeout: 20000 }); await sleep(300); const s = await p.evaluate(`(${STREET.toString()})(${JSON.stringify(bot)},${4321 + sd * 7919})`); out.st.push({ dn, sd, bot, ...s }); console.log(`street ${dn} ${bot} seed ${sd}: view ${s.view} (${s.first}) reach ${s.reach}`); }
      if (p.errs.length) console.log(`FAIL ${dn} seed ${sd} page errors: ${p.errs.join(' | ')}`);
      await ctx.close(); } }
  const mx = (a, k) => a.reduce((m, x) => x[k] < 0 ? Infinity : Math.max(m, x[k]), 0), am = a => a.map(x => Math.min(x.aim < 0 ? 1e9 : x.aim, x.dive < 0 ? 1e9 : x.dive)).reduce((m, v) => Math.max(m, v), 0);
  const fF = mx(out.fly, 'foe'), fA = am(out.fly), sr = out.st.filter(x => x.bot === 'right'), sV = mx(sr, 'view'), sR = mx(sr, 'reach'), iV = mx(out.st.filter(x => x.bot === 'idle'), 'view');
  console.log(`WORST flight first foe ${fF.toFixed(2)} s, first aimed shot or dive ${fA.toFixed(2)} s; street (walks right) in view ${sV} s, in reach ${sR} s; street idle in view ${iV} s`);
  if (process.env.GATE === '1') { L.ok('flight first foe <= 3.0 s', fF <= 3, fF); L.ok('flight first aimed shot/dive <= 6.0 s', fA <= 6, fA); L.ok('street foe in view <= 5.0 s', sV <= 5, sV); L.ok('street foe in reach <= 8.0 s', sR <= 8, sR); }
  await b.close(); if (process.env.GATE === '1') L.done('open-probe');
})();
