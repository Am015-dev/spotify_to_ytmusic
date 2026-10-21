#!/usr/bin/env node
// LAYOUT (parts/layout.js, flag RET.layout): strict review 8 fixes 20-23 and 25. Headless, no screenshots. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/layout-test.js     env: GAME_DIR=...
// Gates (390x763 and 375x553): section pills centred within 4 px, one colour, no clipping, buttons pairwise non-overlapping (MISSIONS / TRAINING / PROFILE, result, pause);
// controls below the field at 375x553 (?strip=1, default OFF: hud-cover 21.0% > 20% until the HUD diet lands); the stage card sits beside its node, the bottom sheet <= half the screen, ARCADE shows m:ss;
// story cards and the start banner never intersect the ship on stages 1-5 (real taps through CDP Input.dispatchTouchEvent, ?story=2); ?layout=0 = the old layout; no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[390, 763], [375, 553]];
let base, browser; const errs = [];
async function open(w, h, q) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await ctx.newPage(); p.ctx = ctx;
  p.on('pageerror', e => errs.push(e.message)); await p.goto(base + '/index.html' + (q || '')); await p.waitForFunction(() => window.__hub && window.__mnr && document.getElementById('playBtn')); await sleep(900); return p;
}
async function tap(p, x, y) {   // a real touch through the browser, not element.click()
  const c = await p.ctx.newCDPSession(p);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach();
}
const centre = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
const BOXES = `(root,sel)=>{const R=document.querySelector(root);const bs=[...R.querySelectorAll(sel)].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;});const ov=[];
  for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i].getBoundingClientRect(),b=bs[j].getBoundingClientRect();if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1)ov.push(bs[i].textContent.trim().slice(0,10)+'/'+bs[j].textContent.trim().slice(0,10));}
  return{n:bs.length,ov,boxes:bs.map(b=>{const r=b.getBoundingClientRect();return{t:b.textContent.trim().slice(0,10),cx:r.left+r.width/2,l:r.left,r:r.right,bg:getComputedStyle(b).backgroundImage.slice(-40),col:getComputedStyle(b).color}})}}`;
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); base = 'http://127.0.0.1:' + port;
  browser = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => PW.chromium.launch());
  try {
    for (const [w, h] of SIZES) {
      const tag = w + 'x' + h + ': ';
      // ---- 20: section screens
      {
        let p = await open(w, h, '');
        for (const k of ['missions', 'training', 'profile']) {
          await p.evaluate(k => __hub.open(k), k); await sleep(500);
          const r = await p.evaluate(`(${BOXES})('#hub_${k}Scr','.hubAct')`), sc = await p.evaluate(k => { const b = document.querySelector('#hub_' + k + 'Scr .hubBody'); return { clip: b.scrollWidth > b.clientWidth + 1, wide: document.documentElement.scrollWidth > innerWidth + 1 }; }, k);
          const off = r.boxes.filter(b => Math.abs(b.cx - w / 2) > 4).map(b => b.t + ' ' + Math.round(b.cx - w / 2)), same = new Set(r.boxes.map(b => b.bg + b.col)).size === 1;
          ok(tag + k + ': ' + r.n + ' pills centred within 4 px, one colour', r.n > 0 && !off.length && same, off.join(',') + (same ? '' : ' colours differ'));
          ok(tag + k + ': no clipping, no overlap', !sc.clip && !sc.wide && !r.ov.length, JSON.stringify([sc, r.ov]));
          await p.evaluate(() => __hub.shut());
        }
        // ---- 21: pause and result
        await p.evaluate(() => document.getElementById('startBtn').click()); await p.waitForFunction(() => __mnr.running); await sleep(600); await p.keyboard.press('Escape'); await sleep(500);
        let r = await p.evaluate(`(${BOXES})('#pausem','button')`), t = await p.evaluate(() => { const e = document.querySelector('#pausem .eyebrow'); return { eb: e && getComputedStyle(e).display !== 'none', h1: document.querySelectorAll('#pausem h1').length }; });
        ok(tag + 'pause: one title, ' + r.n + ' buttons not overlapping, centred', !t.eb && t.h1 === 1 && !r.ov.length && r.boxes.filter(b => b.t === 'RESUME').every(b => Math.abs(b.cx - w / 2) <= 4), JSON.stringify([t, r.ov, r.boxes.map(b => Math.round(b.cx))]));
        await p.ctx.close(); p = await open(w, h, '');
        await p.evaluate(() => { __mnr.sSave.all = true; __mnr.startStory(1); }); await sleep(700); await p.evaluate(() => { __mnr.ST.fail(); }); await sleep(1500);
        r = await p.evaluate(`(${BOXES})('#over','#over .row button')`);
        ok(tag + 'result: ' + r.n + ' buttons not overlapping, the first centred', r.n >= 2 && !r.ov.length && Math.abs(r.boxes[0].cx - w / 2) <= 4, JSON.stringify([r.ov, r.boxes.map(b => Math.round(b.cx))]));
        await p.ctx.close();
      }
      // ---- 22: controls below the field
      if (h < 600) {
        const p = await open(w, h, '?strip=1'); await p.evaluate(() => { __mnr.sSave.all = true; __mnr.startStory(2); }); await sleep(2500);
        const r = await p.evaluate(() => { const cv = document.getElementById('game').getBoundingClientRect(), bs = ['bPause', 'bDash', 'bEmp'].map(i => document.getElementById(i).getBoundingClientRect()), lab = document.getElementById('bEmp').getBoundingClientRect();
          return { cvB: cv.bottom, tops: bs.map(b => b.top), over: bs.filter(b => b.top < cv.bottom - 1).length, ovB: bs.some((a, i) => bs.some((b, j) => i < j && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)), side: document.getElementById('stage').classList.contains('sd') }; });
        ok(tag + 'touch controls below the field, not overlapping each other, no side column', !r.over && !r.ovB && !r.side, JSON.stringify(r));
        await p.ctx.close();
      }
      // ---- 23: stage map
      {
        const p = await open(w, h, ''); await p.evaluate(() => { __mnr.sSave.all = true; document.getElementById('storyBtn').click(); }); await sleep(1200);
        for (const n of [1, 9]) {
          await p.evaluate(n => { const b = document.querySelector('#stRows .nd[data-n="' + n + '"]'); b.scrollIntoView({ block: 'center' }); b.click(); }, n); await sleep(700);
          const r = await p.evaluate(n => { const nd = document.querySelector('#stRows .nd[data-n="' + n + '"] .md').getBoundingClientRect(), c = document.querySelector('.lyCard'), d = document.getElementById('stDet').getBoundingClientRect(); if (!c) return { nocard: 1 };
            const q = c.getBoundingClientRect(), hit = !(q.right <= nd.left || q.left >= nd.right || q.bottom <= nd.top || q.top >= nd.bottom), bans = [...document.querySelectorAll('#stRows .ban')].filter(b => getComputedStyle(b).visibility !== 'hidden').some(b => { const x = b.getBoundingClientRect(); return !(x.right <= nd.left || x.left >= nd.right || x.bottom <= nd.top || x.top >= nd.bottom); });
            return { hit, bans, beside: Math.abs((q.top + q.bottom) / 2 - (nd.top + nd.bottom) / 2) < q.height, sheet: d.height / innerHeight, arc: document.querySelector('#arcA small').textContent }; }, n);
          ok(tag + 'stage ' + n + ': card beside its node (no overlap), plate off the node, sheet <= half, real length', !r.nocard && !r.hit && !r.bans && r.beside && r.sheet <= .501 && /^~\d:\d\d$/.test(r.arc), JSON.stringify(r));
        }
        await p.ctx.close();
      }
      // ---- 25: story cards and the start banner never touch the ship, stages 1-5, real taps
      for (let n = 1; n <= 5; n++) {
        const p = await open(w, h, '?story=2&all=1');
        await p.evaluate(() => { document.getElementById('storyBtn').click(); }); await sleep(900);
        await p.evaluate(n => { const b = document.querySelector('#stRows .nd[data-n="' + n + '"]'); b.scrollIntoView({ block: 'center' }); }, n); await sleep(300);
        let c = await centre(p, '#stRows .nd[data-n="' + n + '"] .md'); await tap(p, c.x, c.y); await sleep(600);
        c = await centre(p, '#stPlay'); await tap(p, c.x, c.y);
        const bad = []; let seen = 0, banner = 0;
        for (let i = 0; i < 40; i++) {
          await sleep(250);
          const s = await p.evaluate(() => { const g = id => document.getElementById(id), vis = e => e && !e.hidden && e.getBoundingClientRect().width > 0;
            const card = g('sgCard'), run = __mnr.running; let sh = null; try { sh = SAGA.t.ship(); } catch (e) { }
            const cm = g('sgComms'), cv = g('game').getBoundingClientRect(), G = __mnr.G, rot = g('stage').classList.contains('p'), k = cv.width / (rot ? 540 : 960);
            const bn = run && G && G.banner && G.banner.t > 0 ? { l: cv.left, r: cv.right, t: cv.top + cv.height / 2 - 58 * k * (rot ? 1 : 1), b: cv.top + cv.height / 2 + 38 * k } : null;
            const hit = (a, b) => a && b && !(a.right <= b.l || a.left >= b.r || a.bottom <= b.t || a.top >= b.b);
            const cb = vis(cm) ? cm.getBoundingClientRect() : null;
            return { card: vis(card), btn: vis(card) ? (() => { const bs = [...card.querySelectorAll('button')].filter(vis); const r = bs[bs.length - 1].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() : null, run, comm: hit(cb, sh), ban: bn ? hit({ left: bn.l, right: bn.r, top: bn.t, bottom: bn.b }, sh) : false, bn: !!bn }; });
          if (s.card && s.btn) { seen++; await tap(p, s.btn.x, s.btn.y); continue; }
          if (s.bn) banner++;
          if (s.comm) bad.push('comms@' + i); if (s.ban) bad.push('banner@' + i);
        }
        ok(tag + 'stage ' + n + ': story card/comms/banner never intersect the ship (' + seen + ' cards tapped, ' + banner + ' banner samples)', !bad.length, bad.slice(0, 4).join(' '));
        await p.ctx.close();
      }
    }
    // ---- ?layout=0 = the old layout
    {
      const p = await open(375, 553, '?layout=0'); await p.evaluate(() => __hub.open('missions')); await sleep(500);
      const r = await p.evaluate(() => ({ lay: document.documentElement.classList.contains('lay'), card: !!document.querySelector('.lyCard'), cls: document.querySelector('#hub_missionsScr .hubAct').className }));
      await p.evaluate(() => { __hub.shut(); __mnr.sSave.all = true; __mnr.startStory(2); }); await sleep(1500);
      const sd = await p.evaluate(() => document.getElementById('stage').classList.contains('sd'));
      ok('?layout=0: no lay class, no stage card, first pill keeps its own style, side column as before', !r.lay && !r.card && !/dim/.test(r.cls) && sd, JSON.stringify([r, sd]));
      await p.ctx.close();
    }
  } finally { await browser.close(); srv.kill(); }
  ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  const f = res.filter(x => !x).length; console.log(f ? 'FAIL ' + f + ' of ' + res.length : 'ALL PASS ' + res.length); process.exit(f ? 1 : 0);
})();
