#!/usr/bin/env node
// Strip-sprite loader + boss / player-ship wiring through the real page (prints pass/fail only):  NODE_PATH=$(npm root -g) node games-src/nightrun/sprites-test.js
//   env: GAME_DIR=<dir with index.html>, ONLY=sek-adler,hoplite (bosses for the anchor check)
//  (a) every bundled sheet decodes and its frame count matches the strip; frame math: smoothing.json holds, loop wraps, one-shot stops on its last frame and reports done
//  (b) drawAnim puts the anchor where asked (pixel-identical to a hand-placed drawImage, mirrored with flip); no per-frame allocation (one record per sheet)
//  (c) a missing / unlisted sheet gives null / false and the game still draws the still, no page errors
//  (d) in game: a boss draws from its sheets (idle -> attack on the beat -> hit on damage, flash stays), body bottom / centre stay on the old still's spot (headless frame diff), the ship likewise;
//      frame time with sprites on is not more than 1 ms over sprites off
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
  const open = async (q, reqs) => { const c = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); if (reqs) p.on('request', r => reqs.push(r.url()));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.addInitScript(() => { const t = setInterval(() => { if (window.__mnr) { window.ART = __mnr.ART; window.SPR = __mnr.SPR; window.UIK = __mnr.UIK; clearInterval(t); } }, 5); }); await p.goto(url(q)); return { c, p, errs }; };
  try {
    /* (a)(b)(c) loader */
    { const { c, p, errs } = await open('');
      await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
      const keys = await p.evaluate(() => Object.keys(ART.ANIM.s)); ok('a1 ANIM bundles 58 sheets (10 bosses x4, 9 ships x2)', keys.length === 58, keys.length);
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
  } catch (e) { fails.push('crash ' + e.message); console.log('FAIL crash ' + e.stack); }
  await br.close(); srv.kill(); console.log(fails.length ? `${fails.length} FAIL of ${n}` : `all ${n} PASS`); process.exit(fails.length ? 1 : 0);
})();
