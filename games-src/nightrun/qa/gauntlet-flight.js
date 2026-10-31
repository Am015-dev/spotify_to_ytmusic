// W260 FLIGHT GAUNTLET: a bot plays FLIGHT from the title through stages and the boss with REAL input only
// (phone 390x763: CDP touch drag + touch taps on DASH/EMP/PAUSE; PC 1440x860: keyboard + mouse clicks on menus).
// The clock is stepped (__mnr.step) between input bursts; the game never gets a function call that drives it.
//   GAME_DIR=<dir> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/gauntlet-flight.js
//   env: SEEDS=8 STRATS=idle,random,dodger,shooter DEVS=phone,pc STAGES=10 PAR=4 SHOTS=<dir> OUT=<json> TICKS=<game seconds cap per run, default 900>
// Prints one line per run and a summary with minimums. Console/page errors, promise rejections, stuck states, dead controls,
// UI overlap / small targets, boss seen+killed, result screens, HUD vs state, frame time p95 are recorded per run.
const L = require('./lib.js'), { PW, sleep } = L, fs = require('fs');
const SEED0 = +process.env.SEED0 || 0, WALL = +process.env.WALL || 150, SEEDS = +process.env.SEEDS || 8, STAGES = +process.env.STAGES || 10, PAR = +process.env.PAR || 4, TCAP = +process.env.TICKS || 900;
const STRATS = (process.env.STRATS || 'idle,random,dodger,shooter').split(','), DEVS = (process.env.DEVS || 'phone,pc').split(','), SHOTS = process.env.SHOTS;
const FOCUS0 = process.env.FOCUS0 === '1', STARTS = (process.env.STARTS || '').split(',').filter(Boolean).map(Number);   // FOCUS0=1: ?focus=0 (the result screen then offers NEXT STAGE); STARTS=2,5: begin at that story stage through the game's own startStory hook
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
const rngOf = s => { let a = s * 2654435761 >>> 0 || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const SEEDJS = s => `(()=>{let a=${s}*2654435761>>>0||1;Math.random=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 window.__rej=[];addEventListener('unhandledrejection',e=>window.__rej.push(String(e.reason&&e.reason.message||e.reason).slice(0,160)));
 window.__ft=[];let l=0;const f=t=>{if(window.__ftOn&&l)window.__ft.push(t-l);l=t;requestAnimationFrame(f)};requestAnimationFrame(f);})()`;
const stFn = () => { const m = window.__mnr; if (!m.G) return { live: false, over: false, paused: false, title: true, overEl: false, res: false, shop: false, stage: 0, t: 0, score: 0, hp: 0 }; const h = id => { const e = document.getElementById(id); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; };
  return { live: !!m.G.live, over: !!m.G.over, paused: h('pausem'), title: h('title'), overEl: h('over'), res: h('stres'), shop: h('shop'), stage: m.ST.on ? m.ST.n : 0, t: m.G.t, score: m.G.score, hp: m.P.hp, boss: !!m.G.boss, bossDone: !!m.G.bossDone, emp: m.P.emp, dashT: m.P.dashT, dashCd: m.P.dashCd, heat: m.P.heat, pb: m.G.pb.length }; };
const worldFn = () => { const m = window.__mnr, G = m.G, P = m.P; const q = a => a.map(b => [b.x, b.y, b.vx || 0, b.vy || 0, b.r || 0, b.t || '']);
  return { px: P.x, py: P.y, eb: q(G.eb), en: q(G.en), pk: q(G.pk), boss: G.boss ? [G.boss.x, G.boss.y] : null, hp: P.hp, emp: P.emp, rot: m.rotMode }; };
const st = p => p.evaluate(stFn), world = p => p.evaluate(worldFn);
const step = (p, n) => p.evaluate(n => { for (let i = 0; i < n; i++) window.__mnr.step(1 / 60); }, n);
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const STEPS = +process.env.STEPS || 8;   // sim steps (1/60 s) between decisions; one page round trip per decision
// W284: read-only recorder inside the same page round trip: per sim step, a hp drop is logged with the nearest bullet/enemy kind (window.__hits), and every new bullet is counted (window.__bs, split boss / not boss)
const snap = (p, n) => p.evaluate(([n, a, b]) => { const m = window.__mnr; const H = window.__hits = window.__hits || [], seen = window.__seen = window.__seen || new WeakSet(), B = window.__bs = window.__bs || { boss: 0, bossS: 0, all: 0, allS: 0 };
  for (let i = 0; i < n; i++) { let G = m.G, P = m.P; const hp0 = P.hp, bo = !!G.boss; let nb = null, nd = 1e9, ne = null, ned = 1e9;
    for (const x of G.eb) { const d = Math.hypot(x.x - P.x, x.y - P.y); if (d < nd) { nd = d; nb = x; } } for (const x of G.en) { const d = Math.hypot(x.x - P.x, x.y - P.y); if (d < ned) { ned = d; ne = x; } }
    m.step(1 / 60); G = m.G; P = m.P; for (const x of G.eb) if (!seen.has(x)) { seen.add(x); B.all++; if (G.boss) B.boss++; } B.allS += 1 / 60; if (G.boss) B.bossS += 1 / 60;
    if (P.hp < hp0 && G.live) H.push({ t: +G.t.toFixed(1), boss: bo, st: m.ST.on ? m.ST.n : 0, b: nb && nd < 90 ? (nb.t || nb.k || '?') + '@' + (nd | 0) : null, en: ne && ned < 70 ? (ne.t || ne.k || '?') + '@' + (ned | 0) : null, bossD: G.boss ? Math.hypot(G.boss.x - P.x, G.boss.y - P.y) | 0 : null }); }
  return { s: eval('(' + a + ')')(), w: eval('(' + b + ')')() }; }, [n, stFn.toString(), worldFn.toString()]);   // step + state + world in ONE round trip

// ---- real input layers ----
function makeInput(p, dev) {
  const I = { dev, cdp: null, finger: null, keys: new Set() };
  I.init = async () => { if (dev.touch) I.cdp = await p.context().newCDPSession(p);
    I.geo = await p.evaluate(() => { const e = document.getElementById('frame') || document.querySelector('canvas'); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; }); };
  const tp = (type, x, y, id) => I.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: id || 1 }] });
  I.tap = async (x, y) => { const f = I.finger ? [{ x: I.finger.x, y: I.finger.y, id: 1 }] : []; await I.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [...f, { x, y, id: 7 }] }); await I.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: f }); };   // a second finger taps; the steering finger stays down
  I.clickEl = async sel => { const bb = await p.locator(sel).boundingBox(); if (!bb) return false; const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; if (dev.touch) await I.tap(x, y); else await p.mouse.click(x, y); return true; };
  // movement: want = unit-ish vector in game coords (gx forward = right on PC / up on phone). PC: keys; phone: finger drag, re-grabbed at the edge
  I.move = async (dx, dy, rot, fire) => {
    if (!dev.touch) { const want = new Set(); if (dx > 6) want.add('ArrowRight'); if (dx < -6) want.add('ArrowLeft'); if (dy > 6) want.add('ArrowDown'); if (dy < -6) want.add('ArrowUp'); if (fire) want.add('Space');
      for (const k of I.keys) if (!want.has(k)) { await p.keyboard.up(k); I.keys.delete(k); } for (const k of want) if (!I.keys.has(k)) { await p.keyboard.down(k); I.keys.add(k); } return; }
    const g = I.geo, sx = rot ? g.w / 540 : g.w / 960, sy = rot ? g.h / 960 : g.h / 540;
    const gain = 0.55;   // ship travel per finger travel is SENS (1.5 default); the finger moves a bit less than the error
    const ddx = rot ? dy * sx * gain : dx * sx * gain, ddy = rot ? -dx * sy * gain : dy * sy * gain;
    if (!fire && !I.finger) return;
    if (!I.finger) { I.finger = { x: g.l + g.w / 2, y: g.t + g.h * .72 }; await tp('touchStart', I.finger.x, I.finger.y); }
    let nx = I.finger.x + ddx, ny = I.finger.y + ddy;
    const m = 30; if (nx < g.l + m || nx > g.l + g.w - m || ny < g.t + m || ny > g.t + g.h - m) { await tp('touchEnd'); I.finger = null; return; }   // let go, re-grab next tick
    if (Math.hypot(nx - I.finger.x, ny - I.finger.y) < 1.5) return; I.finger = { x: nx, y: ny }; await tp('touchMove', nx, ny);   // a CDP touch costs ~30 ms: skip moves under 1.5 px
  };
  I.release = async () => { if (dev.touch) { if (I.finger) { await tp('touchEnd'); I.finger = null; } } else { for (const k of I.keys) await p.keyboard.up(k); I.keys.clear(); } };
  I.dash = async () => { if (dev.touch) await I.clickEl('#bDash'); else { await p.keyboard.down('ShiftLeft'); await p.keyboard.up('ShiftLeft'); } };
  I.emp = async () => { if (dev.touch) await I.clickEl('#bEmp'); else { await p.keyboard.down('KeyX'); await p.keyboard.up('KeyX'); } };
  I.pause = async () => { if (dev.touch) await I.clickEl('#bPause'); else await p.keyboard.press('KeyP'); };
  return I;
}
// ---- strategies: return {dx,dy,fire,dash,emp} from the world ----
function brain(name, rnd) {
  let wx = 0, wy = 0, wt = 0;
  const danger = (w, cx, cy, d) => { let c = 0; for (const b of w.eb) { const px = b[0] + b[2] * .14, py = b[1] + b[3] * .14, q = Math.hypot(px - cx, py - cy); if (q < 70) c += (70 - q) * (70 - q) * (q < 26 ? 30 : 1); }
    for (const e of w.en) { const q = Math.hypot(e[0] - cx, e[1] - cy), r = (e[4] || 22) + 30; if (q < r) c += (r - q) * (r - q) * 4; } if (w.boss) { const q = Math.hypot(w.boss[0] - cx, w.boss[1] - cy); if (q < 110) c += (110 - q) * (110 - q); } return c; };
  return w => {
    if (name === 'idle') return { dx: 0, dy: 0, fire: false };
    if (name === 'random') { wt -= 1; if (wt <= 0) { wt = 8 + rnd() * 20; wx = (rnd() - .5) * 2 * 30; wy = (rnd() - .5) * 2 * 30; } return { dx: wx, dy: wy, fire: rnd() < .8, dash: rnd() < .01, emp: rnd() < .005 }; }
    // dodger / shooter: grid search around the ship for the lowest cost
    let best = null, bc = 1e18; const tx = 200 + (name === 'shooter' ? 40 : 0);
    let near = null; for (const e of w.en) if (e[0] > w.px + 20 && (!near || Math.abs(e[1] - w.py) < Math.abs(near[1] - w.py))) near = e;
    let pk = null; if (name === 'shooter') for (const q of w.pk) if (q[0] > 20 && q[0] < 700 && (!pk || q[0] < pk[0])) pk = q;
    const aimY = pk ? pk[1] : near ? near[1] : w.boss ? w.boss[1] : 270, aimX = pk ? Math.min(pk[0], 560) : tx;
    for (let gx = -90; gx <= 90; gx += 30) for (let gy = -90; gy <= 90; gy += 30) { const cx = w.px + gx, cy = w.py + gy; if (cx < 40 || cx > 900 || cy < 40 || cy > 500) continue;
      const c = danger(w, cx, cy) + Math.abs(cy - aimY) * 1.2 + Math.abs(cx - aimX) * .6 + Math.hypot(gx, gy) * .4; if (c < bc) { bc = c; best = [gx, gy]; } }
    if (!best) best = [0, 0]; let close = 0; for (const b of w.eb) if (Math.hypot(b[0] - w.px, b[1] - w.py) < 150) close++;
    const imminent = w.eb.some(b => Math.hypot(b[0] + b[2] * .08 - w.px, b[1] + b[3] * .08 - w.py) < 30);
    return { dx: best[0], dy: best[1], fire: true, emp: name === 'shooter' && close >= 4 && w.emp > 0, dash: imminent && rnd() < .5 };
  };
}
// ---- UI audit: visible buttons, size, overlap, off-screen ----
const uiAudit = (p, phone) => p.evaluate(phone => { const out = [], R = []; for (const e of document.querySelectorAll('button,[role=button],.btn')) { if (e.hidden || e.offsetParent === null && getComputedStyle(e).position !== 'fixed') continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    let anc = e, hid = false; while (anc) { if (anc.hidden) { hid = true; break; } anc = anc.parentElement; } if (hid) continue;
    const id = e.id || e.className || e.tagName; R.push({ id: String(id).slice(0, 24), r });
    if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) out.push('offscreen ' + id);
    if (phone && (r.width < 44 || r.height < 44)) out.push(`small ${id} ${r.width | 0}x${r.height | 0}`); }
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i].r, b = R[j].r; const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (w > 4 && h > 4) out.push(`overlap ${R[i].id}/${R[j].id} ${w | 0}x${h | 0}`); } return out; }, phone);
const shot = async (p, tag) => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/${tag}.png` }).catch(() => { }); };
async function openPage(br, devName, seed) {
  const d = DEV[devName]; const ctx = await br.newContext({ viewport: { width: d.W, height: d.H }, deviceScaleFactor: 1, hasTouch: d.touch, isMobile: d.touch, userAgent: d.touch ? L.UA : undefined });
  const p = await ctx.newPage(); p.errs = []; p.cons = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error' && !/net::ERR_FAILED/.test(m.text())) p.cons.push(m.text().slice(0, 160)); }); p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)|^blob:/.test(r.url())) p.cons.push('requestfailed ' + r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 100)); }); p.on('response', r => { if (r.status() >= 400) p.cons.push('http ' + r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 100)); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
  await p.addInitScript(SEEDJS(seed));
  await p.goto(L.GAME_DIR ? global.__BASE + '?nomusic=1' + (FOCUS0 ? '&focus=0' : '') : '', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 }); await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(400);
  return p;
}
async function startFlight(p, I, start) { if (FOCUS0 && !start) start = 1;   // no FLIGHT button when focus is off
  if (start) await p.evaluate(n => window.__mnr.startStory(n), start); else await I.clickEl('#focFlight'); for (let i = 0; i < 40 && !(await st(p)).live; i++) await sleep(100); await p.evaluate(() => window.__mnr.simOn(true)); await step(p, 20); return (await st(p)).live; }
// ---- one gauntlet run ----
async function run(br, devName, strat, seed, start) {
  const d = DEV[devName], rnd = rngOf(seed * 31 + strat.length), R = { dev: devName, strat, seed, errs: [], defects: [], stages: [], deaths: 0, maxStage: 0, bossSeen: 0, bossKilled: 0, results: 0, stuck: 0, hudBad: 0, hudN: 0, ui: new Set(), gameSec: 0, wall: 0 };
  const t0 = Date.now(); const p = await openPage(br, devName, seed), I = makeInput(p, d); await I.init(); const tag = `${devName}-${strat}-${seed}` + (start ? `-from${start}` : '');
  R.start = start || 0; if (!(await startFlight(p, I, start))) { R.defects.push('FLIGHT did not start from the ' + (start ? 'startStory hook' : 'title click')); R.errs.push(...p.errs); await p.context().close(); return R; }
  const brn = brain(strat, rnd); let nextSteps = 0, s = await st(p), lastChange = s.t, lastKey = s.score + ':' + s.hp, stageSeen = -1, bossWas = false, sec = 0, tick = 0, attempts = 0;
  const hudCheck = async () => { const r = await p.evaluate(() => { const m = window.__mnr; try { m.render(); } catch (e) { return { err: String(e) }; } const h = m.HUD; return { sc: h.score, hp: h.hp, gs: String(m.G.score).padStart(8, '0'), ghp: m.P.hp, mx: h.hpMax, gmx: m.P.max, ht: h.heat, gh: Math.round(m.P.heat), emp: h.emp, gemp: m.P.emp }; });
    R.hudN++; if (r.err || r.sc !== r.gs || r.hp !== r.ghp || r.emp !== r.gemp) { R.hudBad++; if (R.hudBad <= 3) R.defects.push('HUD!=state ' + JSON.stringify(r)); } };
  while (R.gameSec < TCAP && R.maxStage <= STAGES) {
    if (Date.now() - t0 > WALL * 1000) { R.defects.push('run wall cap hit: ' + JSON.stringify(await st(p))); break; }
    const SN = await snap(p, nextSteps); nextSteps = STEPS; s = SN.s;
    if (s.stage && s.stage !== stageSeen) { stageSeen = s.stage; R.maxStage = Math.max(R.maxStage, s.stage); R.stages.push(s.stage); lastChange = s.t; await I.release(); await step(p, 40); await shot(p, `${tag}-stage${s.stage}`);
      const ui = await uiAudit(p, d.touch); ui.forEach(u => R.ui.add('play: ' + u)); }
    if (s.res) { R.results++; R.gold = (R.gold || []).concat(await p.evaluate(() => { const e = document.getElementById('srGold'); return e ? e.textContent.trim() : '-'; })); await shot(p, `${tag}-result${s.stage}`);   // W293: the GOLD n/5 line (await uiAudit(p, d.touch)).forEach(u => R.ui.add('result: ' + u)); if (s.stage >= STAGES && !start) break; await I.release();
      const dg = await p.evaluate(() => { const e = document.getElementById('srNext'); if (!e) return 'no #srNext'; const r = e.getBoundingClientRect(), cs = getComputedStyle(e), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return JSON.stringify({ hidden: e.hidden, display: cs.display, pe: cs.pointerEvents, disabled: e.disabled, box: [r.width | 0, r.height | 0], topAtCentre: t ? (t.id || t.className || t.tagName) : null, focusMode: document.documentElement.classList.contains('focus') }); });
      if (!(await I.clickEl('#srNext'))) { R.defects.push('result NEXT STAGE not clickable ' + dg); break; } await sleep(300); await step(p, 30); const nx = await st(p);
      if (nx.stage === s.stage + 1 && nx.live) { R.nextOk = (R.nextOk || 0) + 1; await shot(p, `${tag}-next${nx.stage}`); if (start) break; } else { R.defects.push(`NEXT STAGE click did not start stage ${s.stage + 1}: ${JSON.stringify({ stage: nx.stage, live: nx.live, res: nx.res })} ${dg}`); break; } nextSteps = 0; continue; }
    if (s.shop) { (await uiAudit(p, d.touch)).forEach(u => R.ui.add('pit: ' + u)); await I.release(); if (!(await I.clickEl('#shGo'))) { R.defects.push('pit SKIP not clickable'); break; } await sleep(200); await step(p, 30); nextSteps = 0; continue; }
    if (s.overEl || s.over && !s.res && !s.live) { R.deaths++; await I.release(); await shot(p, `${tag}-death${R.deaths}-s${s.stage}`); (await uiAudit(p, d.touch)).forEach(u => R.ui.add('over: ' + u));
      if (++attempts > 3) break; if (!(await I.clickEl('#againBtn'))) { R.defects.push('game over AGAIN not clickable'); break; } await sleep(300); await step(p, 40); lastChange = (await st(p)).t; stageSeen = -1; nextSteps = 0; continue; }
    if (s.title || s.paused) { R.defects.push('left play unexpectedly: ' + JSON.stringify({ title: s.title, paused: s.paused })); break; }
    if (s.boss && !bossWas) { bossWas = true; R.bossSeen++; await shot(p, `${tag}-boss${s.stage}`); }
    if (!s.boss && bossWas) { bossWas = false; if (s.bossDone || s.res) R.bossKilled++; }
    const w = SN.w, a = brn(w);
    if (s.boss && w.rot) { const ys = w.eb.filter(b => b[0] > w.px + 10 && b[0] < w.px + 320).map(b => b[1]).concat([40, 500]).sort((x, y) => x - y); let g = 0; for (let i = 1; i < ys.length; i++) g = Math.max(g, ys[i] - ys[i - 1]); (R.corr = R.corr || []).push([ys.length - 2, g | 0]); }   // W284: bullets within 320 world px ahead of the ship, widest free lateral gap in the 40..500 field
    await I.move(a.dx, a.dy, w.rot, a.fire); if (a.dash) await I.dash(); if (a.emp) await I.emp();
    await frames(p);   // W283: let the page paint two frames so the input just sent is applied before the next stepped burst (without it a fast machine lost every run: 0/4 PC dodger on W272 vs 2/2 with it)
    R.gameSec += STEPS / 60; tick++;
    const n = s; if (n.score + ':' + n.hp !== lastKey) { lastKey = n.score + ':' + n.hp; lastChange = n.t; }
    if (n.t - lastChange > 20 && n.live && !n.over) { R.stuck++; R.defects.push(`stuck 20s at stage ${n.stage} t=${n.t.toFixed(0)} score=${n.score} hp=${n.hp} ship=${w.px | 0},${w.py | 0} boss=${JSON.stringify(w.boss)} en=${w.en.length} eb=${w.eb.length} enemies=${JSON.stringify(w.en.slice(0, 4).map(e => [e[0] | 0, e[1] | 0, e[5]]))}`); lastChange = n.t; if (R.stuck >= 2) break; }
    if (tick % 40 === 0) await hudCheck();
    if (n.stage && n.stage !== stageSeen) lastChange = n.t;
  }
  await I.release(); R.errs.push(...p.errs.map(e => 'page: ' + e), ...p.cons.map(e => 'console: ' + e)); R.rej = await p.evaluate(() => window.__rej.slice()); R.hits = await p.evaluate(() => window.__hits || []); R.bs = await p.evaluate(() => window.__bs || null); R.ui = [...R.ui]; R.wall = (Date.now() - t0) / 1000;
  const bad = await p.evaluate(() => (window.__mnr.G.boss ? 1 : 0)); await p.context().close(); return R;
}
// ---- controls probe: every control must visibly do something ----
async function controls(br, devName, seed) {
  const d = DEV[devName], R = { dev: devName, seed, defects: [], ok: {} }; const p = await openPage(br, devName, seed), I = makeInput(p, d); await I.init();
  if (!(await startFlight(p, I))) { R.defects.push('FLIGHT did not start'); await p.context().close(); return R; }
  await step(p, 200); const rot = (await world(p)).rot; const chk = (n, c, i) => { R.ok[n] = !!c; if (!c) R.defects.push('control does nothing: ' + n + (i ? ' ' + i : '')); };
  const d0 = await world(p); await step(p, 90); const d1 = await world(p); chk('dead input: no events = no movement', Math.hypot(d1.px - d0.px, d1.py - d0.py) < 1, JSON.stringify([d0.px, d0.py, d1.px, d1.py]));   // the bot cannot steer by calling game code
  { let pm = 0, hm = 0; for (let i = 0; i < 40; i++) { await step(p, 3); const f = await st(p); pm = Math.max(pm, f.pb); hm = Math.max(hm, f.heat); } chk('autofire without any key (title text: the ship also fires itself)', pm > 0 || hm > 0, JSON.stringify([pm, hm])); }
  if (!d.touch) { for (const [k, up] of [['KeyW', 1], ['KeyS', 1], ['KeyA', 0], ['KeyD', 0]]) { const a = await world(p); await p.keyboard.down(k); await step(p, 20); await p.keyboard.up(k); const b2 = await world(p); chk('title text WASD: ' + k, Math.hypot(b2.px - a.px, b2.py - a.py) > 2, JSON.stringify([a.px, a.py, b2.px, b2.py])); await step(p, 40); }
    const m0 = await world(p); await p.mouse.move(m0.px + 5, 40); await p.mouse.move(700, 400); await step(p, 40); const m1 = await world(p); R.mouseSteers = Math.hypot(m1.px - m0.px, m1.py - m0.py) > 20;   // recorded, not a defect: no text promises it
    await p.evaluate(() => { window.__mnr.P.emp = Math.max(window.__mnr.P.emp, 2); }); const e1 = (await st(p)).emp;   // fixture: an EMP in stock so the key can be seen to spend it
     await p.keyboard.press('KeyL'); await step(p, 6); chk('title text L = EMP', (await st(p)).emp < e1, 'emp ' + e1);   // e1===0: nothing to spend
    await p.keyboard.press('KeyK'); let dm = 0; for (let i = 0; i < 20; i++) { await step(p, 3); const f = await st(p); dm = Math.max(dm, f.dashT, f.dashCd); } chk('title text K = dash', dm > 0, 'dash ' + dm); }
  let w0 = await world(p); await I.move(0, -30, rot, true); await I.move(0, -30, rot, true); await step(p, 30); let w1 = await world(p); chk('move up/down axis', Math.hypot(w1.px - w0.px, w1.py - w0.py) > 8, JSON.stringify([w0.px, w0.py, w1.px, w1.py]));
  await I.move(30, 0, rot, true); await I.move(30, 0, rot, true); await step(p, 30); const w2 = await world(p); chk('move forward axis', Math.hypot(w2.px - w1.px, w2.py - w1.py) > 8, JSON.stringify([w1.px, w1.py, w2.px, w2.py]));
  await I.move(0, 0, rot, true); const f0 = await st(p); let pbMax = 0, hMax = 0; for (let i = 0; i < 20; i++) { await step(p, 3); const f = await st(p); pbMax = Math.max(pbMax, f.pb); hMax = Math.max(hMax, f.heat); } chk('fire (shots appear or heat rises)', pbMax > 0 || hMax > f0.heat, JSON.stringify([pbMax, f0.heat, hMax]));
  await I.release(); const g0 = await st(p); const e0 = g0.emp; await I.dash(); let dMax = 0, cMax = 0; for (let i = 0; i < 20; i++) { await step(p, 3); const f = await st(p); dMax = Math.max(dMax, f.dashT); cMax = Math.max(cMax, f.dashCd); } chk('dash (queued to the beat, <= 0.3 s)', dMax > 0 || cMax > 0, JSON.stringify([g0.dashT, dMax, cMax]));
  await p.evaluate(() => { window.__mnr.P.emp = Math.max(window.__mnr.P.emp, 2); }); const e1b = (await st(p)).emp; await step(p, 120); await I.emp(); await step(p, 6); const g2 = await st(p); chk('EMP', g2.emp < e1b, JSON.stringify([e1b, g2.emp]))   // e1b: an EMP in stock (fixture);
  await I.pause(); await sleep(150); const q1 = await st(p); chk('pause', q1.paused); const t0 = q1.t; await step(p, 30); chk('frozen while paused', (await st(p)).t === t0);
  const ui = await uiAudit(p, d.touch); ui.forEach(u => R.defects.push('pause UI: ' + u));
  await I.clickEl('#resumeBtn'); await sleep(1800); await step(p, 20); const q2 = await st(p); chk('resume', !q2.paused && q2.live);
  R.errs = [...p.errs, ...p.cons]; await p.context().close(); return R;
}
// ---- real-time frame time sample (the loop runs on rAF, a dodger plays) ----
async function perf(br, devName, seed) {
  const d = DEV[devName]; const p = await openPage(br, devName, seed), I = makeInput(p, d); await I.init(); await I.clickEl('#focFlight'); await sleep(1500);
  await p.evaluate(() => { window.__ft.length = 0; window.__ftOn = true; }); const brn = brain('dodger', rngOf(seed)); const t0 = Date.now();
  while (Date.now() - t0 < 12000) { const w = await world(p); const a = brn(w); await I.move(a.dx, a.dy, w.rot, true); await sleep(60); }
  const ft = await p.evaluate(() => window.__ft.slice().sort((a, b) => a - b)); await I.release(); await p.context().close();
  return { dev: devName, n: ft.length, p50: ft[ft.length >> 1], p95: ft[Math.floor(ft.length * .95)], max: ft[ft.length - 1] };
}
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; };
(async () => {
  const b = await L.boot(); global.__BASE = b.base; const jobs = [];
  // one browser PROCESS per worker (below): contexts sharing a process starved each other (30 sim-s in 400 s)
  for (const dv of DEVS) for (const sd of Array.from({ length: SEEDS }, (_, i) => i + 1 + SEED0)) { jobs.push(br => controls(br, dv, sd)); for (const stg of STRATS) for (const sn of (STARTS.length ? STARTS : [0])) jobs.push(br => run(br, dv, stg, sd, sn)); }
  const out = [], ctl = []; let ji = 0;
  await Promise.all(Array.from({ length: PAR }, async (_, wi) => { const wb = wi ? await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }) : b.br; while (ji < jobs.length) { const j = jobs[ji++]; try { const r = await j(wb); (r.strat ? out : ctl).push(r);
    if (r.strat) console.log(`${r.dev} ${r.strat} s${r.seed}${r.start ? ' from' + r.start : ''}: gold [${(r.gold || []).join('|')}] next ${r.nextOk || 0} bossname ${r.bossName || '-'} maxStage ${r.maxStage} deaths ${r.deaths} boss ${r.bossSeen}/${r.bossKilled} results ${r.results} stuck ${r.stuck} hud ${r.hudBad}/${r.hudN} err ${r.errs.length} rej ${(r.rej || []).length} ui ${r.ui.length} sim ${r.gameSec.toFixed(0)}s wall ${r.wall.toFixed(0)}s${r.hits && r.hits.length ? ' HITS ' + r.hits.map(h => (h.boss ? 'B' : 's' + h.st) + ':' + (h.b || h.en || 'none') + (h.bossD != null ? '/bd' + h.bossD : '')).join(',') : ''}${r.defects.length ? ' DEF ' + r.defects.slice(0, 2).join(' | ').slice(0, 200) : ''}`);
    else console.log(`${r.dev} controls s${r.seed}: ${JSON.stringify(r.ok)}${r.defects.length ? ' DEF ' + r.defects.join(' | ').slice(0, 300) : ''}`); } catch (e) { console.log('RUNNER ERROR', String(e.stack).split('\n').filter(l => /gauntlet|Error/.test(l)).join(' / ').slice(0, 400)); out.push({ dev: 'x', strat: 'crash', seed: 0, errs: ['runner: ' + e], defects: [String(e)], ui: [], stages: [] }); } } }));
  const pf = []; for (const dv of DEVS) { try { pf.push(await perf(b.br, dv, 1)); } catch (e) { console.log('perf failed', dv, String(e).slice(0, 120)); } }
  await b.close();
  console.log('\n== SUMMARY (minimums over runs) ==');
  for (const dv of DEVS) for (const stg of STRATS) for (const sn of (STARTS.length ? STARTS : [0])) { const rs = out.filter(r => r.dev === dv && r.strat === stg && (r.start || 0) === sn); if (!rs.length) continue; const mn = f => Math.min(...rs.map(f));
    console.log(`${dv} ${stg}${sn ? ' from' + sn : ''}: runs ${rs.length} minStage ${mn(r => r.maxStage)} bossSeen ${rs.filter(r => r.bossSeen).length} bossKilled ${rs.filter(r => r.bossKilled).length} resultRuns ${rs.filter(r => r.results).length} stuckRuns ${rs.filter(r => r.stuck).length} errRuns ${rs.filter(r => r.errs.length).length} rejRuns ${rs.filter(r => (r.rej || []).length).length} hudBad ${rs.reduce((a, r) => a + r.hudBad, 0)}/${rs.reduce((a, r) => a + r.hudN, 0)} uiRuns ${rs.filter(r => r.ui.length).length}`); }
  const uniq = {}; for (const r of out) for (const d of [...r.defects, ...r.errs, ...(r.ui || []), ...(r.rej || []).map(x => 'rej: ' + x)]) { const k = d.replace(/\d+/g, '#').slice(0, 110); (uniq[k] = uniq[k] || { n: 0, ex: d, who: `${r.dev}/${r.strat}/s${r.seed}` }).n++; }
  for (const r of ctl) for (const d of [...r.defects, ...r.errs]) { const k = 'ctl ' + d.replace(/\d+/g, '#').slice(0, 100); (uniq[k] = uniq[k] || { n: 0, ex: d, who: `${r.dev}/controls/s${r.seed}` }).n++; }
  console.log('controls probe: ' + DEVS.map(dv => `${dv} ${ctl.filter(r => r.dev === dv && !r.defects.length).length}/${ctl.filter(r => r.dev === dv).length} clean`).join(', '));
  console.log('frame time (real time, headless software GL): ' + JSON.stringify(pf));
  console.log('DISTINCT FINDINGS:'); Object.values(uniq).sort((a, b) => b.n - a.n).forEach(u => console.log(`  x${u.n} [${u.who}] ${u.ex.slice(0, 260)}`));
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify({ out, ctl, pf }, null, 1)); process.exit(0);
})();
