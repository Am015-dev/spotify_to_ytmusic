#!/usr/bin/env node
// Strip-sprite loader + boss / player-ship wiring through the real page (prints pass/fail only):  NODE_PATH=$(npm root -g) node games-src/nightrun/sprites-test.js
//   env: GAME_DIR=<dir with index.html>, ONLY=sek-adler,hoplite (bosses for the anchor check)
//  (a) every bundled sheet decodes and its frame count matches the strip; frame math: smoothing.json holds, loop wraps, one-shot stops on its last frame and reports done
//  (b) drawAnim puts the anchor where asked (pixel-identical to a hand-placed drawImage, mirrored with flip); no per-frame allocation (one record per sheet)
//  (c) a missing / unlisted sheet gives null / false and the game still draws the still, no page errors
//  (d) in game: a boss draws from its sheets (idle -> attack on the beat -> hit on damage, flash stays), body bottom / centre stay on the old still's spot (headless frame diff), the ship likewise;
//      frame time with sprites on is not more than 1 ms over sprites off
//  (f) enemy ships (flame / volley / death clip), on-foot actors (pose -> act, feet on the spot, Kai extras, jump / fall frames, die fade), street props; ?sprites=0 and a missing sheet = old art
//  (e) ?sprites=0: no sprite code runs and no media/anim file is requested
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), ONLY = (process.env.ONLY || 'sek-adler,hoplite,kronos').split(',').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const fails = []; let n = 0;
const ok = (name, cond, info) => { n++; if (!cond) { fails.push(name + (info ? ' :: ' + info : '')); console.log('FAIL ' + name + (info ? ' :: ' + info : '')); } else console.log('PASS ' + name); };
(async () => {
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?nomusic=1${q || ''}`;
  const open = async (q, reqs, init) => { const c = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); if (reqs) p.on('request', r => reqs.push(r.url()));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); if (init) await p.addInitScript(init); await p.addInitScript(() => { const t = setInterval(() => { if (window.__mnr) { window.ART = __mnr.ART; window.SPR = __mnr.SPR; window.UIK = __mnr.UIK; clearInterval(t); } }, 5); }); await p.goto(url(q)); return { c, p, errs }; };
  try {
    /* (a)(b)(c) loader */
    { const { c, p, errs } = await open('');
      await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
      const keys = await p.evaluate(() => Object.keys(ART.ANIM.s)); ok('a1 ANIM bundles the boss, ship, weapon fx, explosion, small fx and pickup sheets', keys.length >= 115 && keys.filter(k => /^boss-/.test(k)).length === 40 && keys.filter(k => /^ship-(std|tri|hv|ec|swg|syn|drift|lancer|nova)\//.test(k)).length === 18 && keys.filter(k => /^wpn-/.test(k)).length === 38 && keys.filter(k => /^fx-boom-/.test(k)).length === 13 && keys.includes('fx-shield/glow') && keys.includes('pk-health/spin'), keys.length);
      const nrd = await p.evaluate(() => [...ART.rd].filter(f => /^anim\/.+-strip\.webp$/.test(f)).length); ok('a1 ANIM bundles every listed sheet (bosses, ships, enemy ships, on-foot actors, props)', keys.length === nrd && keys.length > 170 && ['kai/run', 'warden/die', 'medic/heal', 'ship-ecruiser/volley', 'prop-steam/glow', 'prop-car/loop'].every(k => keys.includes(k)), keys.length + '/' + nrd);
      let all = false; try { await p.waitForFunction(() => Object.keys(ART.ANIM.s).every(k => ART.anim(k)), null, { timeout: 90000, polling: 250 }); all = true; } catch (e) { }
      ok('a2 every sheet decodes', all);
      const bad = await p.evaluate(() => Object.entries(ART.ANIM.s).filter(([k, m]) => { const b = ART.anim(k); return !b || b.width !== m[0] * m[2] || b.height !== m[3]; }).map(e => e[0]));
      ok('a3 strip size = frames x w, h', !bad.length, bad.slice(0, 3).join(','));
      const fm = await p.evaluate(() => { const H = ART.ANIM.sm.holds, out = [];
        const exp = (key, t) => { const m = ART.ANIM.s[key], act = key.split('/')[1], hd = H[act], loop = ['idle', 'run', 'flame', 'glow', 'loop', 'spin', 'hover'].includes(act); let u = t, tot = 0; const w = []; for (let i = 0; i < m[0]; i++) { w.push((hd && hd.length === m[0] ? hd[i] : 1) / m[1]); tot += w[i]; }
          if (loop) u = t % tot; else if (t >= tot) return [m[0] - 1, true]; let a = 0; for (let i = 0; i < m[0]; i++) { a += w[i]; if (u < a) return [i, false]; } return [m[0] - 1, false]; };
        for (const key of ['ship-std/death', 'boss-sek-adler/defeat', 'boss-kronos/attack', 'boss-hoplite/hit', 'boss-sek-adler/idle', 'ship-tri/flame', 'boss-talos/idle'])
          for (let t = 0; t < 3; t += .0173) { const i = ART.aframe(key, t), d = ART.aDone, e = exp(key, t); if (i !== e[0] || d !== e[1]) { out.push(key + '@' + t.toFixed(3) + ' got ' + i + '/' + d + ' want ' + e); break; } }
        return out; });
      ok('b1 frame math follows smoothing.json holds (loop wraps, one-shot stops + done)', !fm.length, fm[0]);
      const oneShot = await p.evaluate(() => { const tot = ART.aS('ship-std/death').tot; return [ART.aframe('ship-std/death', tot + 5), ART.aDone, ART.aframe('ship-std/death', 0), ART.aDone, ART.aframe('boss-sek-adler/idle', 1000.3) >= 0, ART.aDone]; });
      ok('b2 one-shot holds the last frame after its end, loop never done', oneShot[0] === 3 && oneShot[1] === true && oneShot[2] === 0 && oneShot[3] === false && oneShot[5] === false, JSON.stringify(oneShot));
      const alloc = await p.evaluate(() => { const a = ART.aS('ship-std/flame'), n0 = Object.keys(ART.as).length; for (let i = 0; i < 3000; i++) { ART.aframe('ship-std/flame', i * .01); ART.aframe('boss-kronos/idle', i * .01); } return [ART.aS('ship-std/flame') === a, Object.keys(ART.as).length - n0]; });
      ok('b3 one cached record per sheet, nothing built per frame', alloc[0] && alloc[1] <= 1, JSON.stringify(alloc));
      const px = await p.evaluate(() => { const mk = () => { const c = document.createElement('canvas'); c.width = 700; c.height = 400; return c; }, key = 'ship-std/flame', m = ART.ANIM.s[key], b = ART.anim(key), res = {};
        for (const flip of [false, true]) { const A = mk(), B = mk(), ga = A.getContext('2d'), gb = B.getContext('2d'); ART.drawAnim(ga, key, 0, 350, 200, 1, flip);
          gb.save(); gb.translate(350, 200); if (flip) gb.scale(-1, 1); gb.drawImage(b, 0, 0, m[2], m[3], -m[4], -m[5], m[2], m[3]); gb.restore();
          const da = ga.getImageData(0, 0, 700, 400).data, db = gb.getImageData(0, 0, 700, 400).data; let d = 0; for (let i = 0; i < da.length; i++) d = Math.max(d, Math.abs(da[i] - db[i])); res[flip ? 'flip' : 'plain'] = d; }
        return res; });
      ok('b4 drawAnim = drawImage of cell 0 at the anchor, mirrored with flip', px.plain === 0 && px.flip === 0, JSON.stringify(px));
      const miss = await p.evaluate(() => { const a = ART.anim('boss-nope/idle'), d = ART.drawAnim(document.createElement('canvas').getContext('2d'), 'boss-nope/idle', 0, 0, 0, 1), f = ART.aframe('boss-nope/idle', 3);
        const had = ART.rd.has('anim/boss-kronos/idle-strip.webp'); ART.rd.delete('anim/boss-kronos/idle-strip.webp'); const u = ART.anim('boss-kronos/idle'); if (had) ART.rd.add('anim/boss-kronos/idle-strip.webp'); return [a, d, f, u]; });
      ok('c1 missing / unlisted sheet: null, false, frame 0', miss[0] === null && miss[1] === false && miss[2] === 0 && miss[3] === null, JSON.stringify(miss));
      ok('a4 no page errors (loader)', !errs.length, errs[0]); await c.close(); }
    /* (d) in game, per boss */
    for (const id of ONLY) {
      const { c, p, errs } = await open('&bpauto=1&boss=' + id); const tag = id;
      try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.boss.x <= 791, null, { timeout: 30000 }); } catch (e) { ok(tag + ' boss arrives', false); await c.close(); continue; }
      await p.addStyleTag({ content: '#labP{display:none!important}' });
      try { await p.waitForFunction(id => ['idle', 'attack', 'hit', 'defeat'].every(a => ART.anim('boss-' + id + '/' + a)), id, { timeout: 30000, polling: 250 }); } catch (e) { ok(tag + ' boss sheets load', false); }
      const r = await p.evaluate(async id => {
        const m = __mnr, g = document.getElementById('game'), cx = g.getContext('2d'); m.SET.calm = false; m.P.hp = 99; m.G.banner.t = 0; const b = m.G.boss; b.hp = b.max; const out = {};
        const mask = (x0, y0, w, h, bg, im) => { let X0 = 1e9, X1 = -1, Y0 = 1e9, Y1 = -1; for (let y = 0; y < h; y++)for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, d = Math.abs(im[i] - bg[i]) + Math.abs(im[i + 1] - bg[i + 1]) + Math.abs(im[i + 2] - bg[i + 2]); if (d > 60) { if (x < X0) X0 = x; if (x > X1) X1 = x; if (y < Y0) Y0 = y; if (y > Y1) Y1 = y; } } return X1 < 0 ? null : { x0: X0 + x0, x1: X1 + x0, y0: Y0 + y0, y1: Y1 + y0 }; };
        const grab = (x0, y0, w, h) => cx.getImageData(x0, y0, w, h).data, S = m.S_;
        const shot = (ent, fn) => { const ox = ent.x; ent.x = -5000; m.render(m.G.t, 0); const x0 = Math.max(0, Math.round((ox - 260) * S)), y0 = Math.max(0, Math.round((ent.y - 260) * S)), w = Math.min(g.width - x0, Math.round(520 * S)), h = Math.min(g.height - y0, Math.round(520 * S));
          const bg = grab(x0, y0, w, h); ent.x = ox; const res = {}; for (const on of [true, false]) { RET.sprites = on; m.render(m.G.t, 0); res[on ? 'on' : 'off'] = mask(x0, y0, w, h, bg, grab(x0, y0, w, h)); } RET.sprites = true; return res; };
        b.flash = 0; b.arm = false; b.fireT = 0; b._sa = undefined; b._hc = 0; m.render(m.G.t, 0); out.sp = !!b._sp; out.idle = b._sa; out.body = shot(b);
        b.arm = true; m.render(m.G.t, 0); out.atk = b._sa; b.arm = false; b.fireT = 0; m.render(m.G.t, 0);
        b._sa = 'idle'; b._hc = 0; b.flash = .2; m.render(m.G.t, 0); out.hit = b._sa; b.flash = 0;
        const t0 = b._st; for (let i = 0; i < 90; i++) m.render(m.G.t, 1 / 60); out.back = b._sa; out.adv = b._st > t0;
        out.S = S; out.ship = shot(m.P); out.shipSp = !!SPR.shipOn(m.shipDef ? m.shipDef().id : 'std'); return out; }, id);
      ok(tag + ' d1 boss drawn from its sheets, idle by default', r.sp && r.idle === 'idle', JSON.stringify([r.sp, r.idle]));
      ok(tag + ' d2 attack on the beat, hit on damage, back to idle after the clip', r.atk === 'attack' && r.hit === 'hit' && r.back === 'idle' && r.adv, JSON.stringify([r.atk, r.hit, r.back]));
      const cmp = (a, b2, S, tw, th) => { if (!a || !b2) return 'no mask'; const wa = a.x1 - a.x0, wb = b2.x1 - b2.x0, ha = a.y1 - a.y0, hb = b2.y1 - b2.y0, cxa = (a.x0 + a.x1) / 2, cxb = (b2.x0 + b2.x1) / 2;
        const ex = [Math.abs(cxa - cxb) / wb, Math.abs(a.y1 - b2.y1) / hb, Math.abs(wa / wb - 1)]; return ex.every((v, i) => v <= tw[i]) ? '' : 'centre ' + ex[0].toFixed(2) + ' bottom ' + ex[1].toFixed(2) + ' width ' + ex[2].toFixed(2); };
      ok(tag + ' d3 boss body: centre, bottom and width within a few % of the old still', r.body && !cmp(r.body.on, r.body.off, r.S, [.08, .12, .3]), r.body && cmp(r.body.on, r.body.off, r.S, [.08, .12, .3]) + ' ' + JSON.stringify(r.body));
      if (id === ONLY[0]) ok('d4 ship: nose and vertical centre where the old still put them', r.ship && r.shipSp && Math.abs(r.ship.on.x1 - r.ship.off.x1) <= 12 * r.S && Math.abs((r.ship.on.y0 + r.ship.on.y1) / 2 - (r.ship.off.y0 + r.ship.off.y1) / 2) <= 10 * r.S, JSON.stringify(r.ship));
      /* frame time, on vs off, same state, interleaved */
      const ft = await p.evaluate(() => { const m = __mnr, on = [], off = []; m.P.hp = 99; for (let i = 0; i < 400; i++) { m.P.hp = 99; m.step && m.step(1 / 60); for (const f of i & 1 ? [true, false] : [false, true]) { RET.sprites = f; const t = performance.now(); m.render(m.G.t, 1 / 60); (f ? on : off).push(performance.now() - t); } } RET.sprites = true;
        const st = a => { a.sort((x, y) => x - y); return { mean: a[Math.floor(a.length / 2)], p95: a[Math.floor(a.length * .95)], max: a[a.length - 1] }; }; return { on: st(on), off: st(off) }; });
      ok(tag + ' d5 frame time with sprites not > 1 ms over the stills (median and p95)', ft.on.mean <= ft.off.mean + 1 && ft.on.p95 <= ft.off.p95 + 1, JSON.stringify(ft));
      const gh = await p.evaluate(() => { const m = __mnr, b = m.G.boss; if (!b) return null; ART.gh.length = 0; const dl = SPR.bossDefeat(b); const g0 = ART.gh.length; m.render(m.G.t, 1 / 60); return [dl > 0, g0, ART.gh.length]; });
      ok(tag + ' d6 defeat clip plays once where the boss stood, explosion waits for it', gh && gh[0] && gh[1] === 1, JSON.stringify(gh));
      ok(tag + ' d7 no page errors', !errs.length, errs[0]); await c.close();
    }
    /* sim page: ships + the zoo scene, frame time and the ship death clip */
    { const { c, p, errs } = await open('&sim=1&all=1&mustmove=0&deck=0&vary=0&vary2=0&variants=0');
      await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
      await p.waitForFunction(() => Object.keys(ART.ANIM.s).every(k => k.startsWith('ship-') ? ART.anim(k) : true), null, { timeout: 60000, polling: 250 });
      const r = await p.evaluate(() => { const m = __mnr; if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = false; m.applySet && m.applySet(); m.startStory(3); m.simOn(true); const on = [], off = []; let T = 0;
        for (let i = 0; i < 1500; i++) { m.P.hp = 99; m.P.inv = 1; m.P.y = 360 + 150 * Math.sin(T * 1.3); m.P.x = 260 + 100 * Math.sin(T * .7); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30;
          if (i > 300 && i % 2) for (const f of i % 4 === 1 ? [true, false] : [false, true]) { RET.sprites = f; const t = performance.now(); m.render(m.G.t, 1 / 30); (f ? on : off).push(performance.now() - t); } }
        RET.sprites = true; const st = a => { a.sort((x, y) => x - y); return { mean: +a[Math.floor(a.length / 2)].toFixed(2), p95: +a[Math.floor(a.length * .95)].toFixed(2), max: +a[a.length - 1].toFixed(2) }; };
        const dl = SPR.shipDeath(), g = ART.gh.length; m.render(m.G.t, 1 / 30); const q = ART.fx.length; ART.gh.length = 0; return { on: st(on), off: st(off), death: [dl > 0, g], enemies: m.G.en.length, q }; });
      ok('d8 zoo scene frame time: sprites on not > 1 ms over off (median and p95)', r.on.mean <= r.off.mean + 1 && r.on.p95 <= r.off.p95 + 1, JSON.stringify(r));
      ok('d9 ship death clip queued once, explosion delayed behind it', r.death[0] && r.death[1] === 1, JSON.stringify(r.death));
      ok('d10 no page errors (sim)', !errs.length, errs[0]); await c.close(); }
    /* (f) weapon fx, explosions, small fx, pickups */
    { const { c, p, errs } = await open('');
      await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
      const want = ['fx-boom-small-fire/burst', 'fx-boom-medium-fire/burst', 'fx-boom-large-fire/burst', 'fx-boom-boss-a/burst', 'fx-spark/burst', 'fx-hitconfirm/burst', 'fx-shield/glow', 'pk-coin/spin', 'pk-health/spin', 'wpn-pulse/muzzle', 'wpn-pulse/impact'];
      try { await p.waitForFunction(w => w.every(k => ART.anim(k)), want, { timeout: 60000, polling: 250 }); } catch (e) { ok('f0 fx sheets decode', false); }
      const m = await p.evaluate(() => ['hit-spark', 'hitconfirm', 'boom-medium-fire', 'boom-boss-b', 'w-pulse-hit', 'w-pulse-muzzle', 'explosion-small', 'muzzle', 'boom-nope', 'w-nope-hit'].map(k => ART.fxSheet(k)));
      ok('f1 old keys map to sheets (impact = hit), keys without a sheet map to 0', JSON.stringify(m) === JSON.stringify(['fx-spark/burst', 'fx-hitconfirm/burst', 'fx-boom-medium-fire/burst', 'fx-boom-boss-b/burst', 'wpn-pulse/impact', 'wpn-pulse/muzzle', 0, 0, 0, 0]), JSON.stringify(m));
      const r = await p.evaluate(() => { const m = __mnr, d = ART.drawAnim; let calls = 0; ART.drawAnim = (...a) => { calls++; return d(...a); };
        const run = key => { ART.fx.length = 0; calls = 0; ART.boom(key, 300, 300, 80, .3); let n = 0; const fr = []; while (ART.fx.length && n < 400) { m.render(m.G.t, 1 / 60); n++; } return { n, calls, left: ART.fx.length }; };
        const on = run('boom-medium-fire'), tot = ART.aS('fx-boom-medium-fire/burst').tot;
        RET.sprites = false; const off = run('explosion-small'); const offSheet = run('boom-medium-fire'); RET.sprites = true;
        const hs = run('w-pulse-hit'), mz = run('w-pulse-muzzle'), sp = run('hit-spark'), hc = run('hitconfirm');
        ART.fx.length = 0; ART.boom('boom-medium-fire', 300, 300, 80, .3); m.render(m.G.t, 1 / 60); const q = ART.fx[0], life0 = q.t;
        ART.drawAnim = d; return { on, tot, off, offSheet, hs, mz, sp, hc, life0 }; });
      const secs = r.on.n / 60;
      ok('f2 explosion plays its 5 frames then ends within the sheet time + the small fade (not the old grow+fade life)', r.on.calls > 5 && r.on.left === 0 && secs >= r.tot && secs <= r.tot + .08 + .1, JSON.stringify(r.on) + ' tot ' + r.tot);
      ok('f3 ?sprites=0 style: stills only (no drawAnim), same life as before (.3 s)', r.off.calls === 0 && r.offSheet.calls === 0 && r.off.n >= 17 && r.off.n <= 20, JSON.stringify([r.off, r.offSheet]));
      ok('f4 weapon impact, muzzle, spark and hit-confirm each play from their sheet and end', [r.hs, r.mz, r.sp, r.hc].every(x => x.calls > 1 && x.left === 0), JSON.stringify([r.hs, r.mz, r.sp, r.hc]));
      const pk = await p.evaluate(() => { const cv = document.createElement('canvas'); cv.width = cv.height = 100; const out = {}; const z = ART.drawAnim; let calls = 0; ART.drawAnim = (...a) => { calls++; return z(...a); };
        out.shard = SPR.pk('shard', 30); out.hp = SPR.pk('hp', 30); out.other = SPR.pk('drum', 30); out.calls = calls; out.sh = SPR.shield(); RET.sprites = false; out.off = [SPR.pk('shard', 30), SPR.shield()]; RET.sprites = true;
        ART.rd.delete('anim/pk-coin/spin-strip.webp'); out.miss = SPR.pk('shard', 30); ART.rd.add('anim/pk-coin/spin-strip.webp'); ART.drawAnim = z; return out; });
      ok('f5 pickups: coin -> pk-shard, health -> pk-hp sheets; other pickups, flag off and a missing sheet use the still', pk.shard === true && pk.hp === true && pk.other === false && pk.calls === 2 && pk.off[0] === false && pk.miss === false, JSON.stringify(pk));
      ok('f6 shield glow loops from its sheet, off with the flag', pk.sh === true && pk.off[1] === false, JSON.stringify(pk));
      const lp = await p.evaluate(() => { const o = ART.aS('fx-shield/glow'), a = ART.aS('pk-coin/spin'); return [o.loop, a.loop, ART.aS('fx-boom-small-fire/burst').loop, ART.aS('wpn-pulse/impact').loop]; });
      ok('f7 glow and spin loop, burst and impact are one-shots', JSON.stringify(lp) === '[true,true,false,false]', JSON.stringify(lp));
      const gm = await p.evaluate(() => { const m = __mnr; m.P.hp = 99; let hit = 0, calls = 0; const d = ART.drawAnim; ART.drawAnim = (cc, k, ...a) => { if (/^(wpn-|fx-|pk-)/.test(k)) calls++; return d(cc, k, ...a); };
        for (let i = 0; i < 600; i++) { m.P.hp = 99; m.step && m.step(1 / 60); m.render(m.G.t, 1 / 60); } ART.drawAnim = d; return { calls, fx: ART.fx.length, FXW: FXW.stat.boom }; });
      ok('f8 in a real run the fx sheets are drawn (muzzle / impact / explosion)', gm.calls > 20, JSON.stringify(gm));
      ok('f9 no page errors (fx)', !errs.length, errs[0]); await c.close(); }
    /* (e) ?sprites=0 */
    { const reqs = [], { c, p, errs } = await open('&sprites=0&bpauto=1&boss=sek-adler', reqs);
      try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.boss.x <= 791, null, { timeout: 30000 }); } catch (e) { ok('e0 boss arrives', false); }
      await sleep(3000);
      const r = await p.evaluate(() => { const m = __mnr, b = m.G.boss; let calls = 0; const d = ART.drawAnim; ART.drawAnim = (...a) => { calls++; return d(...a); }; for (let i = 0; i < 60; i++) m.render(m.G.t, 1 / 60); ART.drawAnim = d; return { f: RET.sprites, a: ART.anim('boss-sek-adler/idle'), sp: b && !!b._sp, sa: b && b._sa, calls, gh: ART.gh.length }; });
      ok('e1 ?sprites=0: flag off, nothing from the loader, no sprite state on the boss', r.f === false && r.a === null && !r.sp && r.sa === undefined && r.calls === 0 && r.gh === 0, JSON.stringify(r));
      const rq = reqs.filter(u => /\/media\/anim\//.test(u)); ok('e2 ?sprites=0: no media/anim file requested', !rq.length, rq[0]);
      ok('e3 no page errors (flag off)', !errs.length, errs[0]); await c.close(); }
    /* (c) a missing sheet inside the game falls back to the still */
    { const { c, p, errs } = await open('&bpauto=1&boss=kronos');
      try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.boss.x <= 791, null, { timeout: 30000 }); } catch (e) { }
      const r = await p.evaluate(() => { ART.rd.delete('anim/boss-kronos/idle-strip.webp'); ART.rd.delete('anim/ship-std/flame-strip.webp'); const m = __mnr, b = m.G.boss; b._sp = null; for (let i = 0; i < 30; i++) m.render(m.G.t, 1 / 60); return { sp: !!(b && b._sp), ship: SPR.shipOn('std') }; });
      ok('c2 idle sheet missing: boss falls back to the old drawing, ship to still + jet, no errors', r.sp === false && r.ship === false && !errs.length, JSON.stringify(r) + (errs[0] || '')); await c.close(); }
    /* (f) enemy ships, on-foot actors, props */
    { const { c, p, errs } = await open('&sim=1&all=1&mustmove=0&deck=0&vary=0&vary2=0&variants=0');
      await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
      await p.waitForFunction(() => Object.keys(ART.ANIM.s).every(k => ART.anim(k)), null, { timeout: 120000, polling: 250 });
      const r = await p.evaluate(() => { const out = {}, mk = () => { const c = document.createElement('canvas'); c.width = 600; c.height = 500; return c; };
        const bb = cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let X0 = 1e9, X1 = -1, Y0 = 1e9, Y1 = -1, n = 0; for (let y = 0; y < cv.height; y++)for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 40) { n++; if (x < X0) X0 = x; if (x > X1) X1 = x; if (y < Y0) Y0 = y; if (y > Y1) Y1 = y; } return { X0, X1, Y0, Y1, n }; };
        /* on-foot: feet (bottom of the opaque pixels) on the old spot, 80 px tall figure, for every actor and pose that has a sheet */
        const FM = ART.FM, foot = [], H = 80; out.who = Object.keys(FM).length;
        for (const who in FM) { const acts = new Set(Object.values(FM[who])); for (const pose in FM[who]) { if (pose === '_all' || pose === '_w') continue; const cv = mk(), g = cv.getContext('2d'); ART.fE = null; const ok = ART.footDraw(g, who, pose, 300, 400, H, false, 0.01); const b = bb(cv);
            if (!ok || b.n < 50 || Math.abs(b.Y1 - 400) > 14 || b.Y1 < b.Y0 + H * .3) foot.push(who + '/' + pose + ' ' + JSON.stringify(b) + ok); } }
        out.footBad = foot.slice(0, 5);
        const f1 = mk(); ART.fE = null; const a1 = bb((() => { ART.footDraw(f1.getContext('2d'), 'grunt', 'idle', 300, 400, H, false, 0); return f1; })()), f2 = mk(); ART.footDraw(f2.getContext('2d'), 'grunt', 'idle', 300, 400, H, true, 0); const a2 = bb(f2);
        out.flip = [a1.X0 + a1.X1, a2.X0 + a2.X1];   // mirrored around the anchor
        /* kai extras: each is its own sheet and draws; entity state carries the act start */
        const kx = {}; for (const a of ['dash', 'runshoot', 'hurt', 'land', 'crouchshoot', 'combo2', 'combo3', 'aimup', 'aimdiag', 'grenade', 'victory', 'die', 'melee', 'shoot', 'run', 'idle']) { const e = { _xa: a }, cv = mk(); ART.fE = e; kx[a] = ART.footDraw(cv.getContext('2d'), 'kai', 'idle', 300, 400, H, false, 1) && e._fa === 'kai/' + a && bb(cv).n > 50; }
        ART.fE = null; out.kai = Object.entries(kx).filter(e => !e[1]).map(e => e[0]);
        /* jump rises on frames 0-1, fall is on frames 2-3; die plays once and ends on the last frame (alpha fades for enemies, not Kai) */
        const jm = ART.aS('grunt/jump'), e1 = {}, e2 = {}; ART.fE = e1; ART.footDraw(mk().getContext('2d'), 'grunt', 'jump', 300, 400, H, false, 5); ART.footDraw(mk().getContext('2d'), 'grunt', 'jump', 300, 400, H, false, 9); const ji = ART.aframe('grunt/jump', Math.min(4, jm.cum[1] - .001));
        ART.fE = e2; ART.footDraw(mk().getContext('2d'), 'grunt', 'fall', 300, 400, H, false, 5); out.jf = [ji, ART.aframe('grunt/jump', jm.cum[1] + .001) >= 2, e2._fa];
        const ed = { _xa: undefined }; ART.fE = ed; ART.footDraw(mk().getContext('2d'), 'grunt', 'die', 300, 400, H, false, 0); const cvd = mk(); ART.footDraw(cvd.getContext('2d'), 'grunt', 'die', 300, 400, H, false, .6); const dd = bb(cvd); ART.fE = null;
        const dk = (() => { const q = mk(); ART.fE = { _xa: 'die' }; ART.footDraw(q.getContext('2d'), 'kai', 'die', 300, 400, H, false, 7); const k0 = bb(q).n; const q2 = mk(); ART.fE = { _xa: 'die' }; ART.footDraw(q2.getContext('2d'), 'kai', 'die', 300, 400, H, false, 7); ART.fE.__ = 1; const e = { _xa: 'die' }; ART.fE = e; ART.footDraw(mk().getContext('2d'), 'kai', 'die', 300, 400, H, false, 7); ART.footDraw(q2.getContext('2d'), 'kai', 'die', 300, 400, H, false, 9); ART.fE = null; return k0; })();
        out.die = [dd.n > 50, ed._fa, dk > 50];
        /* run lean + squash do not move the feet (bottom within 14 px of the road line): covered by the loop above */
        /* enemy ships: drawn width = what the code asks, nose / centre on e.x e.y, arm -> volley, kill -> death ghost, hit flash */
        const sh = []; for (const id of ['einterceptor', 'ebomber', 'ecarrier', 'ecruiser', 'egunship', 'ekamikaze']) { const cv = mk(), g = cv.getContext('2d'), e = { arm: false }, w = 90; const prev = window.ctx; 
          const ok1 = (() => { const c0 = document.getElementById('game').getContext('2d'); return SPR.foe(e, id, 1, 300, 250, w, 0, false); })(); sh.push([id, ok1, e._ea, e._fw === w]); e.arm = true; SPR.foe(e, id, 1.5, 300, 250, w, 0, false); sh[sh.length - 1].push(e._ea); }
        out.ships = sh;
        /* props: draw only with the flag; one drawImage per prop */
        const pcv = mk(), pg = pcv.getContext('2d'); RET.sprites = true; ART.footProps(pg, 0, 560 * 2, 400, 2); const pn = bb(pcv).n; RET.sprites = false; const pcv2 = mk(); ART.footProps(pcv2.getContext('2d'), 0, 1120, 400, 2); const pn2 = bb(pcv2).n; RET.sprites = true; out.props = [pn, pn2];
        const ds = RET.sprites; RET.sprites = false; out.off = [ART.footDraw(mk().getContext('2d'), 'kai', 'idle', 300, 400, H, false, 0), SPR.foe({}, 'einterceptor', 0, 0, 0, 50, 0, false)]; RET.sprites = ds;
        const k = 'grunt/idle-strip.webp'; ART.rd.delete('anim/' + k); out.miss = ART.footDraw(mk().getContext('2d'), 'grunt', 'idle', 300, 400, H, false, 0); ART.rd.add('anim/' + k);
        return out; });
      ok('f1 every on-foot actor and pose with a sheet draws, feet on the spot (+-14 px of 80)', r.who === 16 && !r.footBad.length, JSON.stringify(r.footBad));
      ok('f2 flip mirrors around the anchor (feet centre stays)', Math.abs(r.flip[0] - r.flip[1]) <= 16, JSON.stringify(r.flip));
      ok('f3 Kai extras (dash runshoot hurt land crouchshoot combo2/3 aimup aimdiag grenade victory die) each draw their own sheet', !r.kai.length, r.kai.join(','));
      ok('f4 jump holds frames 0-1, fall starts on frame 2+ (own act key)', r.jf[0] <= 1 && r.jf[1] && r.jf[2] === 'grunt/jumpF', JSON.stringify(r.jf));
      ok('f5 die draws (enemy fades, Kai stays opaque)', r.die[0] && r.die[1] === 'grunt/die' && r.die[2], JSON.stringify(r.die));
      ok('f6 enemy ships: all six kinds draw from flame, arm switches to volley, width as asked', r.ships.every(s => s[1] && s[2] === 'flame' && s[3] && s[4] === 'volley'), JSON.stringify(r.ships));
      ok('f7 props draw only with the flag on', r.props[0] > 200 && r.props[1] === 0, JSON.stringify(r.props));
      ok('f8 flag off / missing sheet: footDraw and SPR.foe return false (old art draws)', r.off[0] === false && r.off[1] === false && r.miss === false, JSON.stringify([r.off, r.miss]));
      ok('f9 no page errors (new categories)', !errs.length, errs[0]); await c.close(); }
    /* (g) the finished foot stage: Kai and the street draw from sheets, and a fleet enemy leaves a death clip */
    { const { c, p, errs } = await open('', null, () => { try { if (!sessionStorage.getItem('_ft')) { sessionStorage.setItem('_ft', 1); localStorage.clear(); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } } catch (e) { } });
      await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0 && window.FOOT, null, { timeout: 20000 });
      const r = await p.evaluate(async () => { const ok = k => ART.anim(k); for (const w of ['kai', 'grunt', 'gunman']) for (const a of ART.FM[w]._all) ART.anim(w + '/' + a); for (const k of ['prop-car/loop', 'prop-police/loop', 'prop-steam/glow', 'prop-neon/loop', 'prop-banner/loop', 'prop-beacon/loop', 'prop-holo/loop', 'prop-windows/loop', 'prop-drone/loop']) ART.anim(k);
        await new Promise(r => setTimeout(r, 6000)); const fm = document.getElementById('fMenu'); if (fm) fm.hidden = true; FOOT.start('zeil'); const S = FOOT.S, P = S.P; const cnt = {}, fd = ART.footDraw; ART.footDraw = (c, who, pose, ...a) => { const r = fd(c, who, pose, ...a); if (r) cnt[who + '/' + (ART.fE && ART.fE._xa || pose)] = (cnt[who + '/' + (ART.fE && ART.fE._xa || pose)] | 0) + 1; return r; };
        const pr = ART.footProps; let pc = 0; ART.footProps = (...a) => { pc++; return pr(...a); }; FOOT.sim && 0;
        P.crouch = false; await new Promise(r => setTimeout(r, 600)); P.dash = .3; await new Promise(r => setTimeout(r, 200)); P.mel = .2; await new Promise(r => setTimeout(r, 200)); P.vx = 120; P.shotT = .3; await new Promise(r => setTimeout(r, 400));
        ART.footDraw = fd; ART.footProps = pr; FOOT.stop(); return { cnt, pc, keys: Object.keys(cnt) }; });
      ok('g1 foot stage: Kai draws idle/dash/melee sheets and the street props are asked each frame', r.pc > 5 && r.keys.some(k => k.startsWith('kai/')) && r.keys.some(k => /^kai\/(dash|melee|combo|runshoot)/.test(k)), JSON.stringify(r));
      ok('g2 no page errors (foot stage)', !errs.length, errs[0]); await c.close(); }
  } catch (e) { fails.push('crash ' + e.message); console.log('FAIL crash ' + e.stack); }
  await br.close(); srv.kill(); console.log(fails.length ? `${fails.length} FAIL of ${n}` : `all ${n} PASS`); process.exit(fails.length ? 1 : 0);
})();
