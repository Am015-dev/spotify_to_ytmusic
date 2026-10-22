#!/usr/bin/env node
// STREETLOOK (parts/street/streetlook.js): machine gate for the on-foot street on phones. Headless, no screenshots: it wraps the draw calls (ART.drawAnim, fillText, drawImage, arc, fillRect)
// on the foot canvas and measures what lands on screen. Sizes 390x763, 375x553, 430x932 (portrait touch) and 844x390 (landscape touch). Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/streetlook-test.js      env: GAME_DIR=...  BEFORE=1 (also print the same numbers for ?streetlook=0)
// Rules: standing character >= 22% of the field height; props <= 1.3 characters; grounded feet / prop bottoms within 3 px of the road line; every text and visible pickup inside the screen,
// popups inside the field (an actor's own art may scroll in past the edge with its body); dead band between field and controls < 5% of the height; backdrop layers scroll at 3 distinct speeds; HUD boxes + pause pairwise apart; HUD text >= 12 px;
// portrait view keeps >= 0.8 s of warning at 260 u/s; no page errors.
// Behaviour (390x763, real touch events through CDP): stick right/left moves + mirrors Kai, walk back up to 35% of the view, auto-fire turns to a target behind, aim up-left,
// every foot enemy faces Kai and mirrors, and a 40 s bot run draws no old still frame for any actor that has sheets.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + (typeof i === 'string' ? i : JSON.stringify(i).slice(0, 400)))); };
const STORY = JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 });
const SIZES = [[390, 763], [375, 553], [430, 932], [844, 390]];

// in the page: instrument the foot canvas, drive a short run with props, pickups and popups at the edges, then return the measurements
const PROBE = async () => {
  const cv = document.getElementById('footC'), P2 = CanvasRenderingContext2D.prototype, A = __mnr.ART, LK = () => FOOT.look || {};
  const R = { act: [], prop: [], txt: [], pk: [], lay: [], bp: [], fr: 0 }; let fr = 0;
  const raf = window.requestAnimationFrame; window.requestAnimationFrame = cb => raf(t => { fr++; cb(t); });
  const css = (g, x, y) => { const t = g.getTransform(), r = cv.getBoundingClientRect(), k = r.width / cv.width; return [r.left + (t.a * x + t.c * y + t.e) * k, r.top + (t.b * x + t.d * y + t.f) * k]; };
  const bb = (g, x0, y0, x1, y1) => { const p = [css(g, x0, y0), css(g, x1, y0), css(g, x0, y1), css(g, x1, y1)]; return { l: Math.min(...p.map(q => q[0])), r: Math.max(...p.map(q => q[0])), t: Math.min(...p.map(q => q[1])), b: Math.max(...p.map(q => q[1])) }; };
  const HUM = /^(kai|grunt|gunman|shield|bruiser|knife|sniper|warden|flamer|ninja|medic)\//;
  const da = A.drawAnim; A.drawAnim = function (c, key, t, x, y, sc, flip, al, sy) { const r = da.apply(this, arguments);
    try { if (r && c.canvas === cv) { const m = A.ANIM.s[key], sv = sc * (sy || 1), w = m[2] * sc, h = m[3] * sv, b = bb(c, x - m[4] * sc, y - m[5] * sv, x - m[4] * sc + w, y - m[5] * sv + h), e = A.fE, tag = LK().tag || '';
      if (/^prop-/.test(key)) R.prop.push({ fr, key, tag, x, h: b.b - b.t, bot: b.b, l: b.l, r: b.r, road: LK().road });
      else if (/^pk-/.test(key)) R.pk.push({ fr, l: b.l, r: b.r, t: b.t, b: b.b, a: c.globalAlpha });
      else if (e && !/^fx-|^wpn-/.test(key)) { const feet = css(c, x, y), S = FOOT.S, grounded = e === S.P ? e.onGround && e.y >= 469.5 : (!e.fly && !e.def.flyer && !e.def.fly && e.y >= 469.5);
        R.act.push({ fr, key, hum: HUM.test(key) && !/crouch|die/.test(key) && !e.crouch && !(sy && sy < .9) && (e === S.P || e.h >= 58), h: b.b - b.t, feet: feet[1], grounded, road: LK().road, kai: e === S.P }); } } } catch (x_) {}
    return r; };
  const ft = P2.fillText; P2.fillText = function (s, x, y, mw) { try { if (this.canvas === cv) { const t = this.getTransform(), k = cv.getBoundingClientRect().width / cv.width, sx = Math.hypot(t.a, t.b) * k, sy = Math.hypot(t.c, t.d) * k,
      fp = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)[1]), w0 = Math.min(this.measureText(String(s)).width, mw || 1e9), al = this.textAlign, bl = this.textBaseline,
      x0 = al === 'center' ? x - w0 / 2 : al === 'right' || al === 'end' ? x - w0 : x, y0 = bl === 'top' ? y : bl === 'middle' ? y - fp / 2 : bl === 'bottom' ? y - fp : y - fp * .8, b = bb(this, x0, y0, x0 + w0, y0 + fp);
      R.txt.push({ fr, s: String(s).slice(0, 16), tag: LK().tag || '', px: fp * sy, a: this.globalAlpha, ...b }); } } catch (x_) {} return ft.apply(this, arguments); };
  const di = P2.drawImage; P2.drawImage = function (im, ...a) { try { const tag = LK().tag || ''; if (this.canvas === cv && /^L-/.test(tag) && a.length === 4) R.lay.push({ fr, tag, x: a[0], w: a[2], cam: LK().cam }); } catch (x_) {} return di.apply(this, [im, ...a]); };
  const ar = P2.arc; P2.arc = function (x, y, r) { try { if (this.canvas === cv && LK().tag === 'pk') { const b = bb(this, x - r, y - r, x + r, y + r); R.pk.push({ fr, ...b, a: this.globalAlpha }); } } catch (x_) {} return ar.apply(this, arguments); };
  const fr_ = P2.fillRect; P2.fillRect = function (x, y, w, h) { try { if (this.canvas === cv && LK().tag === 'bprop') { const b = bb(this, x, y, x + w, y + h); R.bp.push({ fr, h: b.b - b.t }); } } catch (x_) {} return fr_.apply(this, arguments); };
  // a run: walk right firing, god mode; every 0.5 s drop pickups and popups at both edges, spawn a walker and a breakable sign
  const S = FOOT.S, vw = () => FOOT.hudInfo().vw; let n = 0;
  FOOT.ctl = (S_, I) => { for (const k in I) I[k] = 0; I.r = 1; I.fire = 1; S_.P.hp = S_.P.max; S_.P.inv = 0;
    if (++n % 30 === 1) { const c = S_.camX, w = vw(); S_.pk.push({ k: 'heal', x: c + w - 4, y: 454, vy: 0, t: 0, on: true, fix: 1 }, { k: 'ammo', x: c + w + 10, y: 454, vy: 0, t: 0, on: true, fix: 1 }, { k: 'speed', x: c + 6, y: 454, vy: 0, t: 0, on: true, fix: 1 });
      S_.pop.push({ x: c + w - 3, y: 300, t: '+225 BEAT x3', c: '#ffd23a', l: 1, m: 1, big: true }, { x: c + 2, y: 120, t: '+90 COMBO', c: '#fff', l: 1, m: 1, big: false });
      if (S_.E.filter(e => !e.dead).length < 4) FOOT.env.spawn(n % 60 === 1 ? 'grunt' : 'knife', c + w - 60, 470); } };
  S.pr.push({ x: S.P.x + 260, y: 150, k: 'sign', hp: 99, w: 70, h: 34, c: '#ff2d95', i: 99, fl: 0 }, { x: S.P.x + 420, y: 470, k: 'door', hp: 99, w: 52, h: 96, c: '#405060', i: 98, fl: 0 });
  await new Promise(r => setTimeout(r, 6000)); FOOT.ctl = null;
  const I = FOOT.hudInfo(), hud = (I.hud && I.hud.hud || []).map(q => ({ l: I.box.x + q.x * I.sc, r: I.box.x + (q.x + q.w) * I.sc, t: I.box.y + q.y * I.sc, b: I.box.y + (q.y + q.h) * I.sc }));
  const pr = document.getElementById('fPause').getBoundingClientRect(); hud.push({ l: pr.left, r: pr.right, t: pr.top, b: pr.bottom, pause: 1 });
  let ctop = 1e9; for (const b of document.querySelectorAll('#footL .fb,#footL .fpad')) { if (b.hidden || b.style.display === 'none') continue; ctop = Math.min(ctop, b.getBoundingClientRect().top); }
  return { R, frames: fr, box: I.box, mode: I.mode, sc: I.sc, vw: I.vw, k: LK().k || 1, camK: FOOT.camK || .38, hud, ctop, W: innerWidth, H: innerHeight }; };

(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch(), errs = [];
  const run = async (w, h, q) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(([s]) => { try { localStorage.clear(); localStorage.setItem('mnr_story', s); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} }, [STORY]);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + q + ' ' + e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn'), null, { timeout: 15000 }); await sleep(400);
    const st = await p.evaluate(() => { document.getElementById('moreBtn').click(); return new Promise(r => setTimeout(() => { const b = document.getElementById('footBtn'); if (!b || b.disabled) return r('no button'); b.click(); const t0 = performance.now(), iv = setInterval(() => { if (FOOT.on || performance.now() - t0 > 12000) { clearInterval(iv); r(FOOT.on ? 'on' : 'off'); } }, 50); }, 200)); });
    if (st !== 'on') { await ctx.close(); return { err: st }; }
    await p.waitForFunction(() => __mnr.ART && __mnr.ART.anim('kai/run') && __mnr.ART.anim('prop-car/loop'), null, { timeout: 15000 }).catch(() => {});
    const m = await p.evaluate(PROBE); await ctx.close(); return m; };
  const measure = m => { const R = m.R, fh = m.box.h, ch = 64 * m.k * m.sc, o = {};
    const hum = R.act.filter(a => a.hum); o.scale = hum.length ? Math.min(...hum.map(a => a.h / fh)) : 0; o.minKey = hum.length ? hum.reduce((a, b) => b.h < a.h ? b : a).key : ''; o.kai = Math.max(0, ...R.act.filter(a => a.kai && a.hum).map(a => a.h / fh));
    o.props = R.prop.length ? Math.max(...R.prop.map(a => a.h / ch)) : 0; o.bprop = R.bp.length ? Math.max(...R.bp.map(a => a.h / ch)) : 0;
    const gr = R.act.filter(a => a.grounded && a.road); o.feet = gr.length ? Math.max(...gr.map(a => Math.abs(a.feet - a.road))) : 99; o.nFeet = gr.length;
    const gp = R.prop.filter(a => a.tag === 'prop'); o.propFeet = gp.length ? Math.max(...gp.map(a => Math.abs(a.bot - a.road))) : 0;
    const vis = q => q.a > .05; o.txtOut = R.txt.filter(t => vis(t) && t.tag !== 'actor' && (t.l < -1 || t.r > m.W + 1 || t.t < -1 || t.b > m.H + 1)).map(t => t.s + '@' + [t.l, t.r, t.t, t.b].map(Math.round) + ':' + t.tag);
    o.popOut = R.txt.filter(t => t.tag === 'pop' && vis(t) && (t.l < m.box.x - 1 || t.r > m.box.x + m.box.w + 1)).map(t => t.s);
    o.pkOut = R.pk.filter(q => vis(q) && (q.l < -1 || q.r > m.W + 1)).length; o.nPk = R.pk.length;
    o.hudPx = Math.min(99, ...R.txt.filter(t => t.tag === 'hud').map(t => t.px));
    o.band = m.mode === 'port' ? Math.max(0, m.ctop - (m.box.y + m.box.h)) / m.H : 0; o.top = m.box.y / m.H;
    const sp = {}; for (const kind of ['L-far', 'L-mid']) { const f = {}; for (const l of R.lay) if (l.tag === kind && f[l.fr] === undefined) f[l.fr] = l; const ks = Object.keys(f).map(Number).sort((a, b) => a - b), v = [];
      for (let i = 1; i < ks.length; i++) { const a = f[ks[i - 1]], b = f[ks[i]], dc = b.cam - a.cam; if (dc < 1) continue; let dx = b.x - a.x; while (dx > a.w / 2) dx -= a.w; while (dx < -a.w / 2) dx += a.w; v.push(-dx / dc); }
      v.sort((a, b) => a - b); sp[kind] = v.length ? v[v.length >> 1] : NaN; }
    { const v = [], fs = {}; for (const p of R.prop) (fs[p.fr] = fs[p.fr] || []).push(p); const ks = Object.keys(fs).map(Number).sort((a, b) => a - b);
      const cam = {}; for (const l of R.lay) if (cam[l.fr] === undefined) cam[l.fr] = l.cam;
      for (let i = 1; i < ks.length; i++) { const A_ = fs[ks[i - 1]], B = fs[ks[i]], dc = cam[ks[i]] - cam[ks[i - 1]]; if (!(dc >= 1)) continue; for (const b of B) { const a = A_.filter(q => q.key === b.key).sort((x, y) => Math.abs(x.x - b.x) - Math.abs(y.x - b.x))[0]; if (a) v.push((a.x - b.x) / dc); } }
      v.sort((a, b) => a - b); sp['near'] = v.length ? v[v.length >> 1] : NaN; }
    o.speeds = sp; const s3 = [sp['L-far'], sp['L-mid'], sp.near]; o.layers3 = s3.every(x => x > 0) && s3[0] + .1 < s3[1] && s3[1] + .1 < s3[2];
    const hb = m.hud; o.hudOv = []; for (let i = 0; i < hb.length; i++) for (let j = i + 1; j < hb.length; j++) { const a = hb[i], b = hb[j]; if (a.l < b.r - .5 && a.r > b.l + .5 && a.t < b.b - .5 && a.b > b.t + .5) o.hudOv.push(i + '/' + j); }
    o.warn = (m.vw * (1 - m.camK) - 32) / 260; return o; };
  const f2 = x => typeof x === 'number' ? +x.toFixed(3) : x;
  try {
    for (const [w, h] of SIZES) { const tag = w + 'x' + h, m = await run(w, h, '');
      if (m.err) { ok(tag + ': street run opens', false, m.err); continue; } const o = measure(m), land = m.mode !== 'port';
      if (process.env.BEFORE) { const b0 = await run(w, h, '&streetlook=0'); if (!b0.err && !b0.box) console.log('BEFORE ' + tag + ' no box ' + Object.keys(b0)); if (!b0.err && b0.box) { const b = measure(b0); console.log('BEFORE ' + tag + ' actor/field ' + f2(b.scale) + ' kai ' + f2(b.kai) + ' props/char ' + f2(b.props) + ' feet ' + f2(b.feet) + ' band ' + f2(b.band) + ' txtOut ' + b.txtOut.length + ' pkOut ' + b.pkOut + ' popOut ' + b.popOut.length + ' hudOverlap ' + b.hudOv.length); } }
      console.log('AFTER  ' + tag + ' actor/field ' + f2(o.scale) + ' kai ' + f2(o.kai) + ' props/char ' + f2(o.props) + ' bprop ' + f2(o.bprop) + ' feet ' + f2(o.feet) + '(' + o.nFeet + ') propFeet ' + f2(o.propFeet) + ' band ' + f2(o.band) + ' speeds ' + JSON.stringify(o.speeds, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v) + ' warn ' + f2(o.warn) + 's frames ' + m.frames);
      ok(tag + ': standing characters >= 22% of the field height (min ' + f2(o.scale) + ')', o.scale >= .22, [o.scale, o.minKey]);
      ok(tag + ': props <= 1.3 characters (max ' + f2(Math.max(o.props, o.bprop)) + ')', o.props > 0 && o.props <= 1.3 && o.bprop <= 1.3, [o.props, o.bprop]);
      ok(tag + ': grounded feet and prop bottoms within 3 px of the road line', o.nFeet > 20 && o.feet <= 3 && o.propFeet <= 3, [o.feet, o.nFeet, o.propFeet]);
      ok(tag + ': every text inside the screen, popups inside the field', !o.txtOut.length && !o.popOut.length, [o.txtOut.slice(0, 4), o.popOut.slice(0, 4)]);
      ok(tag + ': visible pickups inside the screen', o.nPk > 10 && !o.pkOut, [o.nPk, o.pkOut]);
      ok(tag + ': no dead band (field to controls ' + f2(o.band) + ', top ' + f2(o.top) + ' of the height)', land || (o.band < .05 && o.top < .05), [o.band, o.top]);
      ok(tag + ': backdrop scrolls at 3 distinct speeds (far < mid < near)', o.layers3, o.speeds);
      ok(tag + ': HUD boxes and pause pairwise apart, HUD text >= 12 px (' + f2(o.hudPx) + ')', !o.hudOv.length && o.hudPx >= 12, [o.hudOv, o.hudPx]);
      if (!land) ok(tag + ': >= 0.8 s warning at 260 u/s ahead of Kai (' + f2(o.warn) + ' s)', o.warn >= .8, o.warn); }
    // ---- behaviour at 390x763 with REAL touch events (CDP): stick moves and mirrors Kai, auto-fire turns to a target behind, aim up-left, enemies face and mirror, walk back, no still frames
    { const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true });
      await ctx.addInitScript(([s]) => { try { localStorage.clear(); localStorage.setItem('mnr_story', s); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} }, [STORY]);
      const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p); p.on('pageerror', e => errs.push('behave ' + e.message));
      await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn'), null, { timeout: 15000 }); await sleep(400);
      await p.evaluate(() => { document.getElementById('moreBtn').click(); return new Promise(r => setTimeout(() => { document.getElementById('footBtn').click(); setTimeout(r, 400); }, 200)); });
      // every on-foot sheet decoded before counting
      await p.waitForFunction(() => { const A = __mnr.ART; return Object.keys(A.ANIM.s).filter(k => A.FM[k.split('/')[0]]).every(k => A.anim(k)); }, null, { timeout: 60000, polling: 300 }).catch(() => {});
      await p.evaluate(() => { const A = __mnr.ART, fd = A.footDraw, da = A.drawAnim; window.__st = {}; window.__dr = 0;
        A.footDraw = function (c, who, pose) { const r = fd.apply(this, arguments); if (!r && A.FM[who] && Object.keys(A.ANIM.s).some(k => k.startsWith(who + '/'))) __st[who + ':' + pose] = (__st[who + ':' + pose] || 0) + 1; else if (r) __dr++; return r; };
        A.drawAnim = function (c, key, t, x, y, sc, flip) { const e = A.fE; if (e) e._tflip = !!flip; return da.apply(this, arguments); };
        const S = FOOT.S; S.P.hp = S.P.max; FOOT.setAuto(true); FOOT.layout(); });
      const stick = async (dx, dy, ms) => { const r = await p.evaluate(() => { const b = document.getElementById('fStick').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2, b.width / 2]; });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1], id: 1 }] });
        for (let i = 1; i <= 4; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r[0] + dx * r[2] * i / 4, y: r[1] + dy * r[2] * i / 4, id: 1 }] }); await sleep(30); }
        await sleep(ms); const o = await p.evaluate(() => { const P = FOOT.S.P; return { x: P.x, f: P.facing, fl: P._tflip, aim: P.aim, cam: FOOT.S.camX, hi: FOOT.S._camHi, floor: FOOT.look.floor, vw: FOOT.hudInfo().vw }; });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(80); return o; };
      const clear = () => p.evaluate(() => { const S = FOOT.S; S.E.length = 0; S.eb.length = 0; S.P.hp = S.P.max; S.P.inv = 9; for (const w of S.waves) w.done = true; S.lock = null; });
      await clear(); const x0 = await p.evaluate(() => FOOT.S.P.x);
      const R1 = await stick(.9, 0, 900); ok('touch: stick right runs Kai right, faces right, sprite not mirrored', R1.x > x0 + 80 && R1.f === 1 && R1.fl === false, [x0, R1]);
      const R2 = await stick(-.9, 0, 700); ok('touch: stick left runs Kai left, faces left, sprite mirrored', R2.x < R1.x - 60 && R2.f === -1 && R2.fl === true, [R1.x, R2]);
      // walk back: run right well into the stage, then hold left
      await clear(); const R3 = await stick(.9, 0, 2500); await clear(); const R4 = await stick(-.9, 0, 2600);
      ok('walk back: Kai retreats > 30% of the view and the camera eases back, never behind the floor (35% / checkpoint)', R4.x < R3.x - .3 * R4.vw && R4.cam < R4.hi - .15 * R4.vw && R4.cam >= R4.floor - 1 && R4.floor >= R4.hi - .35 * R4.vw - 1, [R3, R4]);
      // auto-fire turns to a target behind
      await clear(); await stick(.9, 0, 300); const AF = await p.evaluate(() => new Promise(r => { const S = FOOT.S, P = S.P; P.facing = 1; const e = FOOT.env.spawn('grunt', P.x - 120, 470); e.seen = 1; e.grace = 0; e.hp = 999; const s0 = S.shots;
        setTimeout(() => r({ f: P.facing, fl: P._tflip, shots: S.shots - s0, aim: P.aim }), 700); }));
      ok('auto-fire: a target only behind Kai turns him round (mirrored) and he shoots it', AF.f === -1 && AF.fl === true && AF.shots > 0 && Math.cos(AF.aim) < 0, AF);
      // aim up-left with auto-fire on a target above-left
      await clear(); const AU = await p.evaluate(() => { const S = FOOT.S, P = S.P; const e = FOOT.env.spawn('drone', P.x - 90, 300); e.seen = 1; e.grace = 0; e.hp = 999; return 1; });
      const R5 = await stick(-.6, -.8, 700); ok('aim: stick up-left with auto-fire aims up-left, Kai faces left and stays mirrored', R5.f === -1 && R5.fl === true && R5.aim < -Math.PI / 2 - .2 && R5.aim > -Math.PI + .2, R5);
      // enemies face Kai and mirror both ways
      await clear(); const EF = await p.evaluate(async () => { const S = FOOT.S, P = S.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = [];
        for (const id of ['grunt', 'gunman', 'shield', 'knife', 'sniper', 'drone', 'turret', 'bruiser', 'mech', 'jetpack', 'hound', 'flamer', 'ninja', 'medic']) {
          S.E.length = 0; S.eb.length = 0; P.inv = 9; P.hp = P.max; const vw = FOOT.hudInfo().vw; P.x = S.camX + vw * .3; let e; try { e = FOOT.env.spawn(id, S.camX + vw * .8, 470); } catch (x) { out.push(id + ':spawn'); continue; }
          if (!e) { out.push(id + ':nospawn'); continue; } e.seen = 1; e.grace = 0; e.hp = 999; await sl(700); const a = [e.facing, e._tflip];
          P.x = Math.min(S.camX + vw - 30, e.x + vw * .35); let b, mis = 0; for (let k = 0; k < 30; k++) { await sl(100); if (e._tflip !== (e.facing < 0)) mis++; const want = P.x > e.x ? 1 : -1; b = [e.facing, e._tflip, want]; if (b[0] === want && b[1] === (want < 0)) break; }   // up to 3 s: some turn on purpose slowly (mech turn delay, a knife mid-dash)
          if (mis) out.push(id + ' drawn flip != facing x' + mis);
          if (!(a[0] === -1 && a[1] === true && b[0] === b[2] && b[1] === (b[2] < 0))) out.push(id + ' ' + JSON.stringify([a, b, e.state, Math.round(e.x - S.camX), Math.round(P.x - S.camX), e.dead])); }
        S.E.length = 0; return out; });
      ok('enemies: every foot enemy faces Kai and mirrors when he moves to its other side (sheets face right; flip = facing left)', !EF.length, EF);
      // 40 s bot run: no actor with sheets ever draws an old still / shape
      await clear(); const ST = await p.evaluate(() => new Promise(r => { const S = FOOT.S, ids = ['grunt', 'gunman', 'shield', 'knife', 'sniper', 'drone', 'bruiser', 'mech', 'jetpack', 'hound', 'flamer', 'ninja', 'medic']; let n = 0; __st = {}; __dr = 0;
        FOOT.ctl = (S_, I) => { for (const k in I) I[k] = 0; const P = S_.P; P.hp = P.max; n++; const ph = Math.floor(n / 90) % 6; I.fire = 1; if (ph === 0 || ph === 3) I.r = 1; else if (ph === 1) I.l = 1; else if (ph === 2) I.d = 1; else if (ph === 4 && n % 40 === 0) I.jumpP = I.jump = 1; else if (n % 50 === 0) I.meleeP = 1;
          if (n % 120 === 1 && S_.E.filter(e => !e.dead).length < 5) { const e = FOOT.env.spawn(ids[(n / 120 | 0) % ids.length], S_.camX + FOOT.hudInfo().vw * .85, 470); if (e) e.seen = 1; } };
        setTimeout(() => { FOOT.ctl = null; r({ st: __st, dr: __dr }); }, 40000); }));
      ok('40 s bot run: no actor that has sheets draws an old still frame (' + ST.dr + ' sheet draws)', ST.dr > 2000 && !Object.keys(ST.st).length, ST.st);
      await ctx.close(); }
    ok('no page errors', !errs.length, errs.slice(0, 5));
  } catch (e) { ok('test ran', false, e.stack); }
  await br.close(); srv.kill(); console.log(res.filter(x => x).length + '/' + res.length + ' passed'); process.exit(res.every(x => x) ? 0 : 1);
})();
