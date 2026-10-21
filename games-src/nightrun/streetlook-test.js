#!/usr/bin/env node
// STREETLOOK (parts/streetlook.js): machine gate for the on-foot street on phones. Headless, no screenshots: it wraps the draw calls (ART.drawAnim, fillText, drawImage, arc, fillRect)
// on the foot canvas and measures what lands on screen. Sizes 390x763, 375x553, 430x932 (portrait touch) and 844x390 (landscape touch). Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/streetlook-test.js      env: GAME_DIR=...  BEFORE=1 (also print the same numbers for ?streetlook=0)
// Rules: standing character >= 22% of the field height; props <= 1.3 characters; grounded feet / prop bottoms within 3 px of the road line; every text and visible pickup inside the screen,
// popups inside the field (an actor's own art may scroll in past the edge with its body); dead band between field and controls < 5% of the height; backdrop layers scroll at 3 distinct speeds; HUD boxes + pause pairwise apart; HUD text >= 12 px;
// portrait view keeps >= 0.8 s of warning at 260 u/s; no page errors.
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
        R.act.push({ fr, key, hum: HUM.test(key) && !/crouch|die/.test(key) && !e.crouch && (e === S.P || e.h >= 58), h: b.b - b.t, feet: feet[1], grounded, road: LK().road, kai: e === S.P }); } } } catch (x_) {}
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
    const st = await p.evaluate(() => { document.getElementById('moreBtn').click(); return new Promise(r => setTimeout(() => { const b = document.getElementById('footBtn'); if (!b || b.disabled) return r('no button'); b.click(); setTimeout(() => r(FOOT.on ? 'on' : 'off'), 300); }, 200)); });
    if (st !== 'on') { await ctx.close(); return { err: st }; }
    await p.waitForFunction(() => __mnr.ART && __mnr.ART.anim('kai/run') && __mnr.ART.anim('prop-car/loop'), null, { timeout: 15000 }).catch(() => {});
    const m = await p.evaluate(PROBE); await ctx.close(); return m; };
  const measure = m => { const R = m.R, fh = m.box.h, ch = 64 * m.k * m.sc, o = {};
    const hum = R.act.filter(a => a.hum); o.scale = hum.length ? Math.min(...hum.map(a => a.h / fh)) : 0; o.kai = Math.max(0, ...R.act.filter(a => a.kai && a.hum).map(a => a.h / fh));
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
      ok(tag + ': standing characters >= 22% of the field height (min ' + f2(o.scale) + ')', o.scale >= .22, o.scale);
      ok(tag + ': props <= 1.3 characters (max ' + f2(Math.max(o.props, o.bprop)) + ')', o.props > 0 && o.props <= 1.3 && o.bprop <= 1.3, [o.props, o.bprop]);
      ok(tag + ': grounded feet and prop bottoms within 3 px of the road line', o.nFeet > 20 && o.feet <= 3 && o.propFeet <= 3, [o.feet, o.nFeet, o.propFeet]);
      ok(tag + ': every text inside the screen, popups inside the field', !o.txtOut.length && !o.popOut.length, [o.txtOut.slice(0, 4), o.popOut.slice(0, 4)]);
      ok(tag + ': visible pickups inside the screen', o.nPk > 10 && !o.pkOut, [o.nPk, o.pkOut]);
      ok(tag + ': no dead band (field to controls ' + f2(o.band) + ', top ' + f2(o.top) + ' of the height)', land || (o.band < .05 && o.top < .05), [o.band, o.top]);
      ok(tag + ': backdrop scrolls at 3 distinct speeds (far < mid < near)', o.layers3, o.speeds);
      ok(tag + ': HUD boxes and pause pairwise apart, HUD text >= 12 px (' + f2(o.hudPx) + ')', !o.hudOv.length && o.hudPx >= 12, [o.hudOv, o.hudPx]);
      if (!land) ok(tag + ': >= 0.8 s warning at 260 u/s ahead of Kai (' + f2(o.warn) + ' s)', o.warn >= .8, o.warn); }
    ok('no page errors', !errs.length, errs.slice(0, 5));
  } catch (e) { ok('test ran', false, e.stack); }
  await br.close(); srv.kill(); console.log(res.filter(x => x).length + '/' + res.length + ' passed'); process.exit(res.every(x => x) ? 0 : 1);
})();
