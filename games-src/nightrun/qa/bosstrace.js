// W301 boss trace: ONE page, in-page bot (keyboard events on window, no CDP round trips), per-second log of the boss fight.
//   GAME_DIR=<dir> NODE_PATH=$(npm root -g) STAGE=5 STRAT=dodger|shooter SEED=1 GOD=0|1 SIMMAX=400 node qa/bosstrace.js
// GOD=1 keeps the ship alive (hp reset every step): separates "boss cannot be killed" from "bot dies". Prints a line per 5 sim-s + deaths + verdict.
const L = require('./lib.js'), { sleep } = L;
const STAGE = +process.env.STAGE || 5, STRAT = process.env.STRAT || 'dodger', SEED = +process.env.SEED || 1, GOD = process.env.GOD === '1', SIMMAX = +process.env.SIMMAX || 400, EVERY = +process.env.EVERY || 5;
const SEEDJS = s => `(()=>{let a=${s}*2654435761>>>0||1;Math.random=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})()`;
(async () => {
  const b = await L.boot(); const ctx = await b.br.newContext({ viewport: { width: 1440, height: 860 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } }); await p.addInitScript(SEEDJS(SEED)); await p.addInitScript('window.__zg=' + require('./botzone.js').toString()); if (process.env.AUDIO !== '1') await p.addInitScript(() => { window.AudioContext = undefined; window.webkitAudioContext = undefined; });   // no audio context: the beat clock follows the stepped game time (default); AUDIO=1 = the real audio clock (beats run on wall time)
 
  await p.goto(b.base + '?nomusic=1', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 }); await sleep(900);
  await p.evaluate(n => window.__mnr.startStory(n), STAGE); await sleep(1200); await p.evaluate(() => window.__mnr.simOn(true));
  const R = await p.evaluate(async ([strat, god, simmax, every, jump, process_zones]) => {
    const m = window.__mnr, K = new Set(); const key = (c, d) => dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c, key: c, bubbles: true, cancelable: true }));
    const setKeys = want => { for (const k of [...K]) if (!want.has(k)) { key(k, 0); K.delete(k); } for (const k of want) if (!K.has(k)) { key(k, 1); K.add(k); } };
    for (let i = 0; i < 30; i++) m.step(1 / 60);
    if (jump) m.G.dbar = Math.max(m.G.dbar, (m.ST.def.lead || 0) + 3);
    const danger = (w, cx, cy) => { let c = 0; for (const b of w.eb) { const px = b[0] + b[2] * .14, py = b[1] + b[3] * .14, q = Math.hypot(px - cx, py - cy); if (q < 70) c += (70 - q) * (70 - q) * (q < 26 ? 30 : 1); }
      for (const e of w.en) { const q = Math.hypot(e[0] - cx, e[1] - cy), r = (e[4] || 22) + 30; if (q < r) c += (r - q) * (r - q) * 4; } if (w.boss) { const q = Math.hypot(w.boss[0] - cx, w.boss[1] - cy); if (q < 110) c += (110 - q) * (110 - q); } return c; };
    const ZONES = process_zones;
    let ZC = null, ZI = 0;
    const q = a => a.map(b => [b.x, b.y, b.vx || 0, b.vy || 0, b.r || 0, b.t || '']);
    const decide = () => { const G = m.G, P = m.P; ZC = ZONES ? window.__zg(m, P.x, P.y) : null; ZI = 0; const w0 = null; const w = { px: P.x, py: P.y, eb: q(G.eb), en: q(G.en), pk: q(G.pk), boss: G.boss ? [G.boss.x, G.boss.y] : null, emp: P.emp };
      let best = [0, 0], bc = 1e18; const tx = 200 + (strat === 'shooter' ? 40 : 0); let near = null; for (const e of w.en) if (e[0] > w.px + 20 && (!near || Math.abs(e[1] - w.py) < Math.abs(near[1] - w.py))) near = e;
      let pk = null; if (strat === 'shooter') for (const k of w.pk) if (k[0] > 20 && k[0] < 700 && (!pk || k[0] < pk[0])) pk = k;
      const aimY = pk ? pk[1] : near ? near[1] : w.boss ? w.boss[1] : 270, aimX = pk ? Math.min(pk[0], 560) : tx;
      for (let gx = -90; gx <= 90; gx += 30) for (let gy = -90; gy <= 90; gy += 30) { const zc = ZC ? ZC[ZI] : 0; ZI++; const cx = w.px + gx, cy = w.py + gy; if (cx < 40 || cx > 900 || cy < 40 || cy > 500) continue; const c = danger(w, cx, cy) + zc + Math.abs(cy - aimY) * 1.2 + Math.abs(cx - aimX) * .6 + Math.hypot(gx, gy) * .4; if (c < bc) { bc = c; best = [gx, gy]; } }
      let close = 0; for (const b of w.eb) if (Math.hypot(b[0] - w.px, b[1] - w.py) < 150) close++; const imminent = w.eb.some(b => Math.hypot(b[0] + b[2] * .08 - w.px, b[1] + b[3] * .08 - w.py) < 30);
      if (ZC && ZC[24] > 0) { const R = 300, S = 50, n = 2 * R / S + 1, Z = window.__zg(m, w.px, w.py, S, R); let bw = null, bwc = 1e18; for (let i = 0; i < Z.length; i++) { const gx = -R + S * Math.floor(i / n), gy = -R + S * (i % n), cx = w.px + gx, cy = w.py + gy; if (cx < 40 || cx > 900 || cy < 40 || cy > 500) continue; const c = Z[i] + Math.hypot(gx, gy) * 2 + danger(w, cx, cy); if (c < bwc) { bwc = c; bw = [gx, gy]; } } if (bw) { const k = Math.min(1, 90 / Math.max(1, Math.hypot(bw[0], bw[1]))); best = [bw[0] * k, bw[1] * k]; } }   // standing inside a telegraphed zone: head for the nearest clear cell within 300 px, not just 90
      return { dx: best[0], dy: best[1], emp: strat === 'shooter' && close >= 4 && w.emp > 0, dash: imminent && Math.random() < .5 }; };
    const HW = []; m.NR.on('hurt', () => { const G = m.G, P = m.P, B = G.boss; const nb = G.eb.map(x => [Math.hypot(x.x - P.x, x.y - P.y), x]).filter(a => a[0] < 60).sort((a, b) => a[0] - b[0]).slice(0, 2).map(a => { const x = a[1]; const o = { d: a[0] | 0 }; for (const k in x) if (typeof x[k] !== 'object' && k !== 'x' && k !== 'y' && k !== 'vx' && k !== 'vy') o[k] = typeof x[k] === 'number' ? +x[k].toFixed(2) : x[k]; return o; });
      const ln = B && B.lasers ? B.lasers.map(l => { const vx = Math.cos(l.a), vy = Math.sin(l.a), px = P.x - l.x, py = P.y - l.y; return { t: +l.t.toFixed(2), perp: Math.abs(px * vy - py * vx) | 0 }; }) : [];
      const en = G.en.filter(e => e.type !== 'boss').map(e => [Math.hypot(e.x - P.x, e.y - P.y), e]).filter(a => a[0] < 90).map(a => a[1].type + (a[1].ph ? ':' + a[1].ph : '') + '@' + (a[0] | 0)); const stk = new Error().stack.split('\n').slice(2, 14).map(l => (l.match(/index.html\?nomusic=1:(\d+:\d+)/) || [0, '?'])[1]).join(' '); const dl = (HW.php === undefined ? 7 : HW.php) - P.hp; HW.php = P.hp; const zs = (window.BMV ? BMV.hz : []).filter(z => !z.mk && m.G.t >= z.on - .05 && m.G.t < z.off + .05).map(z => ({ v: z.v, s: z.s, lead: z.t0 != null ? +(z.on - z.t0).toFixed(2) : null, dur: +(z.off - z.on).toFixed(2), sd: +BMV.zsd(z, P.x, P.y).toFixed(0), hit: z.hit })).filter(z => z.sd < 40); HW.push({ stk: new Error().stack.split('\n').slice(2, 16).map(l => (l.match(/index.html\?nomusic=1:(\d+:\d+)/) || [0, '?'])[1]).slice(-3).join(' '), zs,  lost: dl, sim: +(m.G.t).toFixed(1), hp: P.hp, eb: nb, lasers: ln, en, rt: B && B.rt, rg: B && B.rg && +B.rg.toFixed(2), ph: B && B.ph, gw: B && !!B.gw, hz: (window.__b2 && window.__b2.B2X.hz.length) | 0, bossD: B ? Math.hypot(B.x - P.x, B.y - P.y) | 0 : null, px: P.x | 0, py: P.y | 0 }); });
    const log = [], deaths = [], ev = []; let sim = 0, bossT0 = null, bossKilled = null, lastLog = -1, hp0 = m.P.hp, stage0 = m.ST.n, res = false, maxPh = 0, ref0 = null;
    while (sim < simmax) {
      const G = m.G, P = m.P; if (!G.live || G.over) { const vis = id => { const e = document.getElementById(id); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }; deaths.push({ sim: +sim.toFixed(1), over: G.over, live: G.live, stres: vis('stres'), overEl: vis('over'), why: m.ST.why || null, stOver: !!m.ST.over, php: P.hp, bossNow: !!G.boss, bossDone: !!G.bossDone }); if (vis('stres') && bossT0 !== null && bossKilled === null) { bossKilled = sim; ev.push({ ev: 'boss down (result)', sim: +sim.toFixed(1), fight: +(sim - bossT0).toFixed(1) }); } if (vis('stres')) res = true; break; }
      const a = decide(), want = new Set(['Space']); if (a.dx > 6) want.add('ArrowRight'); if (a.dx < -6) want.add('ArrowLeft'); if (a.dy > 6) want.add('ArrowDown'); if (a.dy < -6) want.add('ArrowUp'); setKeys(want);
      if (a.dash) { key('ShiftLeft', 1); key('ShiftLeft', 0); } if (a.emp) { key('KeyX', 1); key('KeyX', 0); }
      for (let i = 0; i < 4; i++) {
        const hpb = P.hp, bo = G.boss; let nb = null, nd = 1e9; for (const x of G.eb) { const d = Math.hypot(x.x - P.x, x.y - P.y); if (d < nd) { nd = d; nb = x; } }
        m.step(1 / 60); sim += 1 / 60; if (god) m.P.hp = m.P.max;
        if (m.P.hp < hpb) deaths.push({ sim: +sim.toFixed(1), hp: m.P.hp, boss: !!bo, bhp: bo ? +(bo.hp / bo.max).toFixed(3) : null, ph: bo ? bo.ph : null, near: nb ? (nb.t || nb.k || '?') + '@' + (nd | 0) : null, bossD: bo ? Math.hypot(bo.x - P.x, bo.y - P.y) | 0 : null, hz: (window.__b2 && window.__b2.B2X.hz.length) | 0 });
      }
      const B = m.G.boss; if (B && bossT0 === null) { bossT0 = sim; ev.push({ ev: 'boss spawn', sim: +sim.toFixed(1), name: B.name, mini: !!B.mini, max: B.max, hp: B.hp, r: B.r, k: B.k }); }
      if (!B && bossT0 !== null && bossKilled === null && (m.G.bossDone || m.ST.res || document.getElementById('stres') && !document.getElementById('stres').hidden)) { bossKilled = sim; ev.push({ ev: 'boss down', sim: +sim.toFixed(1), fight: +(sim - bossT0).toFixed(1) }); }
      if (B) { maxPh = Math.max(maxPh, B.ph || 0); const s = B.b2; if (sim - lastLog >= every) { lastLog = sim; log.push({ sim: +sim.toFixed(1), fight: +(sim - bossT0).toFixed(1), hp: +(B.hp / B.max).toFixed(3), ref: s ? +(s.ref / B.max).toFixed(3) : null, ph: B.ph, amp: s ? +s.amp.toFixed(2) : null, bk: s ? +(s.bk / B.max).toFixed(3) : null, rate: s ? +(s.rate / B.max * 100).toFixed(2) : null, x: B.x | 0, y: B.y | 0, eb: m.G.eb.length, php: m.P.hp, heat: +m.P.heat.toFixed(0), dead: !!B.dead, gw: !!B.gw, bt: B.bt, p2: B.p2, p3: B.p3, gi: B.gi, pc: B.pc, cores: B.cores ? B.cores.map(c => (c.hp | 0) + '/' + (c.mx || c.max || '?')).join(',') : null, rg: B.rg ? +B.rg.toFixed(2) : null, rt: B.rt, minBar: B.minBar, pb: m.G.pb.length }); } }
      if (bossKilled !== null && sim - bossKilled > 6) break;
      const sr = document.getElementById('stres'); if (sr && !sr.hidden && getComputedStyle(sr).display !== 'none') { res = true; break; }
      if (!(sim % 1 < .07)) await 0; else await new Promise(r => setTimeout(r, 0));
    }
    setKeys(new Set()); const B = m.G.boss; return { HW, stage0, sim: +sim.toFixed(1), bossT0, bossKilled, res, maxPh, deaths, ev, log, endHp: B ? +(B.hp / B.max).toFixed(3) : null, php: m.P.hp, stage: m.ST.n, t: m.G.t, cap: window.__b2 ? window.__b2.B2X.st : null };
  }, [STRAT, GOD, SIMMAX, EVERY, process.env.JUMP === '1', process.env.ZONES !== '0']);
  console.log(JSON.stringify({ STAGE, STRAT, SEED, GOD, errs }));
  console.log('events', JSON.stringify(R.ev)); for (const l of R.log) console.log(JSON.stringify(l));
  console.log('deaths', JSON.stringify(R.deaths)); for (const h of R.HW) console.log('HURT', JSON.stringify(h)); console.log('verdict', JSON.stringify({ sim: R.sim, bossSpawn: R.bossT0 && +R.bossT0.toFixed(1), bossKilledAt: R.bossKilled && +R.bossKilled.toFixed(1), result: R.res, maxPh: R.maxPh, endHp: R.endHp, php: R.php, st: R.cap }));
  await b.close(); process.exit(0);
})();
