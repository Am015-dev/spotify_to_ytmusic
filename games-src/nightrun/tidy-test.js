#!/usr/bin/env node
// TIDY (parts/tidy.js, flag RET.tidy, default ON; ?tidy=0 = the old Settings and street run). Headless, no screenshots, prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/tidy-test.js      env: GAME_DIR=...   SECS=60 (street bot run, real time)   ONLY=settings|street
// Settings (390x763 and 375x553): <= 20 visible controls on the main page in the 5 groups Gameplay / Display + Comfort / Audio / Controls / Data; hc, rm and Music are not shown twice;
//   no clipped text on any page (scrollWidth > clientWidth scan + nothing past the card edge); every setting of ?tidy=0 is reachable (main, ASSIST or MORE) and changes SET when tapped.
// Street run (390x763 and 375x553, SECS s bot run through the real draw loop): Kai's screen x is in [0.2, 0.4] of the view (median, p95 <= 0.4, max <= 0.42, measured after the first screen; walking back is allowed, W90), no flyer's drawn box intersects a HUD box, the HUD panel is drawn with the fly HUD plate. ?tidy=0 = the old settings page (>= 36 rows, no tdNav) and no F.post hook. No page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const SECS = +process.env.SECS || 60, ONLY = process.env.ONLY || '';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + (typeof i === 'string' ? i : JSON.stringify(i).slice(0, 500)))); };
const STORY = JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 });
const SIZES = [[390, 763], [375, 553]];

// ---- in the page ----
const VIS = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
const SETSCAN = () => {   // controls on the current page + clipped text
  const sb = document.getElementById('setBody'), card = document.querySelector('#setm .card'), VISF = window.__VIS;
  const rows = [...sb.children].filter(e => (e.classList.contains('seg') || e.classList.contains('sl') || e.classList.contains('tdNav')) && VISF(e));
  const others = [...sb.querySelectorAll('button,input,select')].filter(b => VISF(b) && !rows.some(r => r.contains(b)) && !b.closest('#svBox,#sioBox,#stampRow,#calBox'));
  const heads = [...sb.querySelectorAll('.hubSG')].filter(VISF).map(e => e.textContent.trim());
  const cr = card.getBoundingClientRect(), clip = [];
  for (const e of document.querySelectorAll('#setm *')) {
    if (!VISF(e) || e.id === 'setBody' || e.closest('.sbody') === null && e.closest('.card') === null) continue;
    const cs = getComputedStyle(e); if (e.tagName === 'INPUT' || e.tagName === 'OUTPUT' && false) continue;
    const r = e.getBoundingClientRect();
    if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && e.clientWidth > 0 && (e.textContent || '').trim()) clip.push('sw:' + (e.id || e.tagName + '.' + e.className) + ':' + e.textContent.trim().slice(0, 18));
    if ((e.tagName === 'BUTTON' || e.tagName === 'SPAN' || e.tagName === 'H2' || e.tagName === 'H3') && (r.right > cr.right + 1 || r.left < cr.left - 1)) clip.push('edge:' + e.textContent.trim().slice(0, 18));
  }
  return { n: rows.length + others.length, rows: rows.length, others: others.map(b => b.id || b.textContent.trim().slice(0, 12)), heads, clip };
};
const KEYS = () => { const sb = document.getElementById('setBody'); const o = []; for (const e of sb.children) { const k = e.dataset && e.dataset.k || (e.querySelector && e.querySelector('input[type=range]') ? e.querySelector('input[type=range]').id : '') || ((e.id && !/^hubSG|^td/.test(e.id) && e.tagName !== 'P') ? e.id : ''); if (k && !/^hubComfort$/.test(k)) o.push(k); } return o; };

(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', foot = false) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(([s, f]) => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', f ? '2' : '1'); if (f) { localStorage.setItem('mnr_story', s); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } } } catch (e) { } }, [STORY, foot]);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + q + ' ' + e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }); await sleep(300);
    await p.evaluate(`window.__VIS=${VIS.toString()};window.__SCAN=${SETSCAN.toString()};window.__KEYS=${KEYS.toString()}`); return p; };
  const tap = async (p, sel) => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => { }); const b = await l.boundingBox(); if (!b) throw new Error('not on screen: ' + sel); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(220); };
  const openSet = async p => { await p.evaluate(() => document.getElementById('setBtn').click()); await sleep(350); };

  if (!ONLY || ONLY === 'settings') {
    // ---- the old page, for the key list ----
    const p0 = await open(390, 763, '&tidy=0'); await openSet(p0);
    const old = await p0.evaluate(() => ({ keys: window.__KEYS(), td: document.documentElement.classList.contains('td'), nav: document.querySelectorAll('.tdNav').length, pg: document.querySelectorAll('[data-pg]').length, scan: window.__SCAN(), post: !!(window.FOOT && FOOT.post) }));
    ok('?tidy=0: the old Settings page (no tidy class, no ASSIST / MORE buttons, every row shown, no street hook)', !old.td && !old.nav && !old.pg && old.scan.rows >= 36 && !old.post, { td: old.td, nav: old.nav, pg: old.pg, rows: old.scan.rows, post: old.post });
    console.log('INFO ?tidy=0: ' + old.scan.rows + ' rows, ' + old.scan.n + ' controls, clipped: ' + old.scan.clip.length + ' ' + old.scan.clip.slice(0, 4).join(' | '));
    await p0.context().close();
    for (const [w, h] of SIZES) {
      const tag = ` ${w}x${h}`, p = await open(w, h); await openSet(p);
      const m = await p.evaluate(() => window.__SCAN());
      ok('main Settings page has <= 20 controls' + tag, m.n <= 20 && m.n >= 12, m.n + ' (' + m.rows + ' rows, others ' + m.others.join(',') + ')');
      ok('main page groups: GAMEPLAY | DISPLAY / COMFORT | AUDIO | CONTROLS | DATA' + tag, m.heads.join('|') === 'GAMEPLAY|DISPLAY / COMFORT|AUDIO|CONTROLS|DATA', m.heads.join('|'));
      ok('no clipped text on the main page' + tag, m.clip.length === 0, m.clip);
      // real taps: ASSIST page, its rows, back; MORE page, back
      await tap(p, '#tdAssist'); const a = await p.evaluate(() => ({ pg: __tidy.page(), s: window.__SCAN(), k: [...document.querySelectorAll('#setBody>[data-pg="assist"]')].filter(__VIS).map(e => e.dataset.k).filter(Boolean), title: document.querySelector('#setm .hubHd .ttl').textContent }));
      ok('ASSIST button opens ONE Assist page with all the assists' + tag, a.pg === 'assist' && ['asSpd', 'asBul', 'asHull', 'asWin', 'win', 'asBig', 'hc', 'hbox', 'rm', 'cbp', 'calmm'].every(k => a.k.includes(k)) && a.title === 'ASSIST', a.k.join(','));
      ok('no clipped text on the Assist page' + tag, a.s.clip.length === 0, a.s.clip);
      const dupAssist = await p.evaluate(() => ({ hc: [...document.querySelectorAll('#setBody [data-k="hc"]')].filter(__VIS).length, rm: [...document.querySelectorAll('#setBody [data-k="rm"]')].filter(__VIS).length }));
      ok('hc and rm are shown once' + tag, dupAssist.hc === 1 && dupAssist.rm === 1, dupAssist);
      await tap(p, '#setBody [data-k="asSpd"] button:nth-child(4)'); ok('an Assist row works (world speed 70%)' + tag, await p.evaluate(() => __mnr.SET.asSpd === 70));
      await tap(p, '#tdBack'); ok('back from ASSIST returns to the main page' + tag, await p.evaluate(() => __tidy.page() === 'main' && __VIS(document.getElementById('tdAssist'))));
      await tap(p, '#tdMore'); const mo = await p.evaluate(() => ({ pg: __tidy.page(), s: window.__SCAN(), k: [...document.querySelectorAll('#setBody>[data-pg="more"]')].filter(__VIS).map(e => e.dataset.k || e.id).filter(Boolean) }));
      ok('MORE page reachable and shows the old extras' + tag, mo.pg === 'more' && ['fps', 'fpsc', 'glow', 'scan', 'duck', 'keepmus', 'react', 'mute', 'cue', 'stampRow', 'svBox', 'sioBox', 'labBtnS'].every(k => mo.k.includes(k)), mo.k.join(','));
      ok('no clipped text on the More page' + tag, mo.s.clip.length === 0, mo.s.clip);
      await p.evaluate(() => document.querySelector('#setm .hubHd .hubBk').click()); await sleep(150);
      ok('header arrow on a sub page goes back one level, not out' + tag, await p.evaluate(() => __tidy.page() === 'main' && __VIS(document.getElementById('setm'))));
      // every old key reachable
      const miss = await p.evaluate(old => { const tk = new Set(); for (const e of document.getElementById('setBody').children) { const k = e.dataset.k || (e.querySelector('input[type=range]') ? e.querySelector('input[type=range]').id : '') || e.id; if (k && ['main', 'assist', 'more'].includes(e.dataset.pg)) tk.add(k); } return old.filter(k => !tk.has(k) && k !== 'hubComfort'); }, old.keys);
      ok('every setting of the old page is reachable (main, ASSIST or MORE)' + tag, miss.length === 0, miss);
      // a main row still works through a real tap, and DEFAULTS stays in the footer
      await tap(p, '#setBody [data-k="diff"] button:nth-child(4)'); ok('a main row works (difficulty Hard)' + tag, await p.evaluate(() => __mnr.SET.diff === 'hard'));
      ok('Music is named once (volume) + once as "Music mix"' + tag, await p.evaluate(() => { const t = [...document.querySelectorAll('#setBody>*')].filter(__VIS).map(e => (e.querySelector('span') || e).textContent.trim().toLowerCase()); return t.filter(x => x.startsWith('music')).length === 2 && t.includes('music mix'); }));
      await p.context().close();
    }
  }

  if (!ONLY || ONLY === 'street') {
    for (const [w, h] of SIZES) {
      const tag = ` ${w}x${h}`, p = await open(w, h, '', true);
      const st = await p.evaluate(() => new Promise(r => { document.getElementById('moreBtn').click(); setTimeout(() => { const b = document.getElementById('footBtn'); if (!b || b.disabled) return r('no button'); b.click(); setTimeout(() => r(FOOT.on ? 'on' : 'off'), 300); }, 200); }));
      if (st !== 'on') { ok('street run starts' + tag, false, st); await p.context().close(); continue; }
      await p.waitForFunction(() => __mnr.ART && __mnr.ART.anim('kai/run'), null, { timeout: 15000 }).catch(() => { }); await sleep(800);
      const R = await p.evaluate(secs => new Promise(res => {
        const cv = document.getElementById('footC'), P2 = CanvasRenderingContext2D.prototype, A = __mnr.ART, S = FOOT.S, fr = [], dr = [];
        const css = (g, x, y) => { const t = g.getTransform(), r = cv.getBoundingClientRect(), k = r.width / cv.width; return [r.left + (t.a * x + t.c * y + t.e) * k, r.top + (t.b * x + t.d * y + t.f) * k]; };
        let cur = null, plates = 0, flyBoxes = 0;
        const da = A.drawAnim; A.drawAnim = function (c, key, t, x, y, sc, flip, al, sy) { const r = da.apply(this, arguments);
          try { if (r && c.canvas === cv && A.fE && A.fE !== S.P) { const e = A.fE, fl = e.fly || (e.def && (e.def.fly || e.def.flyer)); if (fl) { const m = A.ANIM.s[key], sv = sc * (sy || 1), p = [css(c, x - m[4] * sc, y - m[5] * sv), css(c, x - m[4] * sc + m[2] * sc, y - m[5] * sv + m[3] * sv)]; cur.dr.push({ l: Math.min(p[0][0], p[1][0]), r: Math.max(p[0][0], p[1][0]), t: Math.min(p[0][1], p[1][1]), b: Math.max(p[0][1], p[1][1]), id: e.id }); } } } catch (x) { } return r; };
        { const U = __mnr.UIK, pl = U.plate; U.plate = function () { plates++; return pl.apply(this, arguments); }; }
        let n = 0, t0 = performance.now(), settled = false; const FLY = ['drone', 'drone'];
        FOOT.ctl = (S_, I) => { for (const k in I) I[k] = 0; const P = S_.P; P.hp = P.max; P.inv = 0; n++; I.fire = 1; if (Math.floor(n / 240) % 8 === 5) I.l = 1; else I.r = 1; if (n % 90 === 0) I.jumpP = 1;
          if (n % 150 === 1 && S_.E.filter(e => !e.dead && e.id === 'drone').length < 2) { const vw = FOOT.hudInfo().vw; try { const e = FOOT.env.spawn('drone', S_.camX + vw * (n % 300 === 1 ? .2 : .6), 120); if (e) { e.seen = 1; e.grace = 0; } } catch (x) { } } };
        const tick = () => { const I = FOOT.hudInfo(); cur = { dr: [] };
          requestAnimationFrame(() => { // after the draw of the previous frame: pair the boxes with the HUD boxes of that frame
            const I2 = FOOT.hudInfo(), pr = document.getElementById('fPause').getBoundingClientRect(), hud = I2.hud.hud.map(q => ({ l: I2.box.x + q.x * I2.sc, r: I2.box.x + (q.x + q.w) * I2.sc, t: I2.box.y + q.y * I2.sc, b: I2.box.y + (q.y + q.h) * I2.sc }));
            if (I2.hud.hint) { const q = I2.hud.hint; hud.push({ l: I2.box.x + q.x * I2.sc, r: I2.box.x + (q.x + q.w) * I2.sc, t: I2.box.y + q.y * I2.sc, b: I2.box.y + (q.y + q.h) * I2.sc }); }
            hud.push({ l: pr.left, r: pr.right, t: pr.top, b: pr.bottom });
            const f = (S.P.x - S.camX) / I2.vw; fr.push([f, S.lock || S.bossOn ? 1 : 0]);
            for (const d of cur.dr) { flyBoxes++; for (const q of hud) if (d.l < q.r && q.l < d.r && d.t < q.b && q.t < d.b) dr.push([d.id, Math.round(d.l), Math.round(d.t), Math.round(d.b), Math.round(q.t), Math.round(q.b)]); }
            if (performance.now() - t0 < secs * 1000 && !S.end) tick(); else { FOOT.ctl = null; res({ fr, dr, plates, flyBoxes, vw: I2.vw }); } }); };
        tick(); }), SECS);
      const ff = R.fr.map(a => a[0]), i0 = ff.findIndex(x => x >= .2), f = ff.slice(Math.max(0, i0)).sort((a, b) => a - b), q = x => f[Math.floor(x * (f.length - 1))], inb = f.filter(x => x >= .2 && x <= .4).length / f.length;
      const lockN = R.fr.filter(a => a[1]).length;
      ok('street: Kai stays in the left third (median x in [0.2, 0.4], p95 <= 0.4, max <= 0.42)' + tag, q(.5) >= .2 && q(.5) <= .4 && q(.95) <= .4 && q(1) <= .42, { n: f.length, p05: +q(.05).toFixed(3), med: +q(.5).toFixed(3), p95: +q(.95).toFixed(3), max: +q(1).toFixed(3), inBand: +inb.toFixed(2), lockFrames: lockN });
      ok('street: the bot spent time in an arena lock (the case that used to pin Kai to the right edge)' + tag, lockN > 120, lockN);
      ok('street: no drone box intersects a HUD box (' + R.flyBoxes + ' drone frames drawn)' + tag, R.flyBoxes > 100 && R.dr.length === 0, R.dr.length ? R.dr.slice(0, 5) : R.flyBoxes);
      ok('street: the HUD panel is drawn with the fly HUD plate (ui-hud-mult)' + tag, R.plates > 100, R.plates);
      await p.context().close();
    }
    // ?tidy=0: the old street run (no hook): Kai pinned right in an arena lock is the old behaviour, so only the hook is checked
    const p0 = await open(390, 763, '&tidy=0', true); ok('?tidy=0: no street hook', await p0.evaluate(() => !(window.FOOT && FOOT.post))); await p0.context().close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 4));
  srv.kill(); await br.close();
  console.log(res.every(Boolean) ? 'ALL PASS (' + res.length + ')' : 'FAILED ' + res.filter(x => !x).length + ' of ' + res.length); process.exit(res.every(Boolean) ? 0 : 1);
})();
