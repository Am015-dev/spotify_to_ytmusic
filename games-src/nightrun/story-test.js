#!/usr/bin/env node
// SAGA (parts/storydata.js + parts/saga.js): the campaign through-line. Headless, no screenshots. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/story-test.js     env: GAME_DIR=...
// Checks: data (every trigger has its line, speakers exist, <= 2 lines x 140 chars per card), opening + briefing + SKIP, each chapter end fires once,
// comms lines never overlap the ship or the HUD (390x763, 375x553), saves record seen scenes, ?story=0 = the game as before, no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '') => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('playBtn'), null, { timeout: 15000 }); await sleep(400); p.ctx = ctx; return p; };
  const until = async (p, fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await p.evaluate(fn)) return true; await sleep(60); } return false; };
  try {
    // ---- data
    {
      const p = await open(390, 763, '&story=2');
      const d = await p.evaluate(() => { const S = window.SAGA, st = window.__mnr, bad = [], T = {}; for (const r of S.rows) (T[r.trig] = T[r.trig] || []).push(r);
        const need = ['open', 'epi', 'credits', 'foot:before', 'foot:after', 'sofar:foot']; for (let n = 1; n <= 40; n++) need.push('brief:' + n, 'go:' + n, 'mid:' + n);
        for (let c = 1; c <= S.ch.length; c++) need.push('end:' + c, 'sofar:' + c);
        for (const c of S.ch) need.push('boss:' + c[2], 'down:' + c[2]);   // every chapter ends on a boss or mini-boss
        const miss = need.filter(t => !T[t]);
        const ids = {}; for (const r of S.rows) { if (ids[r.id]) bad.push('dup ' + r.id); ids[r.id] = 1;
          if (!r.l.length || r.l.length > 2) bad.push(r.id + ' lines ' + r.l.length); for (const l of r.l) if (l.length > 140) bad.push(r.id + ' ' + l.length + ' chars');
          if (!(r.who in S.cast) && r.who !== 'brief' && !/^b:\d+$/.test(r.who)) bad.push(r.id + ' speaker ' + r.who);
          if (/^(go|mid|boss|down):/.test(r.trig) && r.l.length > 1) bad.push(r.id + ' comms has 2 lines'); }
        const unknown = Object.keys(T).filter(t => !need.includes(t)); const chs = S.ch.every((c, i) => i === 0 ? c[1] === 1 : c[1] === S.ch[i - 1][2] + 1) && S.ch[S.ch.length - 1][2] === 40;
        return { miss, bad, unknown, chs, n: S.rows.length, nch: S.ch.length }; });
      ok('data: every trigger has its line (' + d.n + ' lines, ' + d.nch + ' chapters)', !d.miss.length && !d.unknown.length, JSON.stringify(d.miss.concat(d.unknown)));
      ok('data: cards <= 2 lines x 140 chars, speakers exist, ids unique, comms 1 line', !d.bad.length, JSON.stringify(d.bad));
      ok('data: 10 chapters cover stages 1-40 without gaps', d.chs && d.nch === 10);
      const src = fs.readFileSync(path.join(__dirname, 'parts/storydata.js'), 'utf8');
      ok('data: no AI or franchise names in the text', !/\b(claude|anthropic|openai|gpt)\b/i.test(src));
      // ---- opening, briefing, comms on the first start
      await p.click('#playBtn'); await sleep(300);
      const o1 = await p.evaluate(() => ({ open: SAGA.open, kind: SAGA.kind, run: SAGA.t.run(), n: document.querySelectorAll('#sgCard .sgdots').length }));
      ok('first PLAY opens the opening sequence (not a run)', o1.open && o1.kind === 'open' && !o1.run, JSON.stringify(o1));
      await p.click('#sgCard'); await sleep(150);
      const o2 = await p.evaluate(() => document.querySelector('#sgCard .sgdots').textContent);
      ok('tap advances the opening', /○●/.test(o2), o2);
      const auto = await until(p, () => document.querySelector('#sgCard .sgdots') && /○○●/.test(document.querySelector('#sgCard .sgdots').textContent), 6000);
      ok('opening auto-advances (~4 s a card)', auto);
      await p.click('#sgSkip'); await sleep(250);
      const o3 = await p.evaluate(() => ({ open: SAGA.open, kind: SAGA.kind, brief: !!document.querySelector('#sgCard.brief .sgh'), txt: (document.querySelector('#sgCard .sgg') || {}).textContent }));
      ok('SKIP ends the opening, the stage 1 briefing follows', o3.open && o3.brief && /GOAL/.test(o3.txt || ''), JSON.stringify(o3));
      await p.click('#sgCard'); const ran = await until(p, () => SAGA.t.run(), 3000);
      ok('one tap on the briefing starts the stage', ran);
      const cm = await until(p, () => !document.getElementById('sgComms').hidden, 3000);
      ok('comms line at the stage start', cm, await p.evaluate(() => document.getElementById('sgComms').textContent));
      const gone = await until(p, () => document.getElementById('sgComms').hidden, 4500);
      ok('comms line leaves after ~3 s', gone);
      await p.evaluate(() => SAGA.t.bar(SAGA.t.stageLen())); const mid = await until(p, () => !document.getElementById('sgComms').hidden && /Halfway/.test(document.getElementById('sgComms').textContent), 1500);
      ok('comms line at the mid-point', mid);
      await p.evaluate(() => SAGA.t.finish()); await sleep(600);
      const so = await p.evaluate(() => { const e = document.getElementById('sgSofar'); return e ? e.textContent : ''; });
      ok('result screen shows the story so far', /CHAPTER 1\/10/.test(so), so);
      const sv = await p.evaluate(() => JSON.parse(localStorage.mnr_saga || '{}'));
      const keys = await p.evaluate(() => (window.__mnr.RET.sioKeys || []).includes('mnr_saga'));
      ok('saves record seen scenes (open, brief:1, comms) and mnr_saga is exported', sv.s && sv.s.open && sv.s['brief:1'] && sv.s['c:g01'] && keys, JSON.stringify(sv));
      // reload: nothing repeats
      await p.reload(); await p.waitForFunction(() => window.SAGA && document.getElementById('playBtn')); await sleep(400);
      await p.evaluate(() => SAGA.t.start(1)); await sleep(300);
      const r2 = await p.evaluate(() => ({ open: SAGA.open, run: SAGA.t.run() }));
      ok('stage 1 again after a reload: no opening, no briefing (straight into the run)', !r2.open && r2.run, JSON.stringify(r2));
      await p.ctx.close();
    }
    // ---- chapter end fires once, replay from the log, tile
    {
      const p = await open(390, 763, '&story=2&all=1');
      await p.evaluate(() => { localStorage.mnr_saga = JSON.stringify({ s: { open: 1, 'brief:5': 1 } }); }); await p.reload(); await p.waitForFunction(() => window.SAGA && document.getElementById('playBtn')); await sleep(300);
      await p.evaluate(() => SAGA.t.start(5)); await sleep(300);
      ok('a seen briefing never shows again (stage 5 runs at once)', await p.evaluate(() => SAGA.t.run() && !SAGA.open));
      await p.evaluate(() => { SAGA.t.boss(); }); const bl = await until(p, () => /Return it/.test(document.getElementById('sgComms').textContent), 1500);
      ok('boss intro line when the boss appears', bl);
      await p.evaluate(() => SAGA.t.finish()); const e1 = await until(p, () => SAGA.open && SAGA.kind === 'end', 2500);
      ok('chapter 1 end scene plays after its last stage', e1);
      await p.click('#sgSkip'); await sleep(200);
      await p.evaluate(() => { document.getElementById('stres').hidden = true; SAGA.t.start(5); }); await sleep(300); await p.evaluate(() => SAGA.t.finish()); await sleep(1500);
      ok('chapter end fires once', await p.evaluate(() => !SAGA.open));
      await p.evaluate(() => { document.getElementById('stres').hidden = true; SAGA.openLog(); }); await sleep(200);
      const lg = await p.evaluate(() => ({ rows: document.querySelectorAll('#sgList li').length, last: document.querySelector('#sgList li[data-ch="1"] .cl').textContent, btns: [...document.querySelectorAll('#sgList li[data-ch="1"] .cr button')].map(b => b.textContent) }));
      ok('chapter list: 10 chapters + street run, last line of chapter 1, replay buttons', lg.rows === 11 && /vault sixty/.test(lg.last) && lg.btns.includes('OPENING') && lg.btns.includes('CHAPTER END'), JSON.stringify(lg));
      await p.evaluate(() => [...document.querySelectorAll('#sgList li[data-ch="1"] .cr button')].find(b => b.textContent === 'CHAPTER END').click()); await sleep(200);
      ok('replay plays a scene from the log', await p.evaluate(() => SAGA.open && SAGA.kind === 'replay'));
      await p.click('#sgSkip'); await sleep(200);
      ok('closing a replay returns to the log', await p.evaluate(() => !document.getElementById('sgLog').hidden));
      await p.evaluate(() => SAGA.closeLog());
      const tl = await p.evaluate(() => { const t = document.getElementById('sgTile'); return t ? t.textContent : ''; });
      ok('HOME tile shows the chapter and Chapter k/10', /STORY · CHAPTER \d+\/10/.test(tl), tl);
      ok('MENU has STORY LOG, the old tale button stands down', await p.evaluate(() => !!document.getElementById('sgBtn') && !document.getElementById('taleBtn')));
      await p.ctx.close();
    }
    // ---- comms never overlap the ship or the HUD
    for (const [w, h] of [[390, 763], [375, 553]]) {
      const p = await open(w, h, '&story=2&all=1');
      await p.evaluate(() => { localStorage.mnr_saga = JSON.stringify({ s: { open: 1 } }); for (let n = 1; n <= 40; n++) JSON.parse(localStorage.mnr_saga); const o = { s: { open: 1 } }; for (let n = 1; n <= 40; n++) o.s['brief:' + n] = 1; localStorage.mnr_saga = JSON.stringify(o); });
      await p.reload(); await p.waitForFunction(() => window.SAGA && document.getElementById('playBtn')); await sleep(300);
      await p.evaluate(() => SAGA.t.start(12)); await until(p, () => !document.getElementById('sgComms').hidden, 3000);
      const POS = [[110, 270], [110, 60], [110, 480], [300, 270], [500, 270], [700, 100], [900, 270], [60, 270]], bad = [];
      for (const [x, y] of POS) {
        const r = await p.evaluate(([x, y]) => { const m = window.__mnr; m.simOn(true); m.P.x = x; m.P.y = y; return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
          const c = document.getElementById('sgComms'); if (c.hidden) return res({ hidden: 1 }); const a = c.getBoundingClientRect(), s = SAGA.t.ship();
          const hit = (b) => !(a.right <= b.l || a.left >= b.r || a.bottom <= b.t || a.top >= b.b);
          const dom = ['bDash', 'bEmp', 'bPause'].map(id => document.getElementById(id)).filter(e => e && e.getBoundingClientRect().width > 0).map(e => { const q = e.getBoundingClientRect(); return { id: e.id, l: q.left, r: q.right, t: q.top, b: q.bottom }; }).filter(hit).map(b => b.id);
          // canvas HUD pixels inside the line's box: render with and without the HUD, diff
          const cv = document.getElementById('game'), g = cv.getContext('2d'), cr = cv.getBoundingClientRect(), kx = cv.width / cr.width, ky = cv.height / cr.height;
          const x0 = Math.max(0, Math.floor((a.left - cr.left) * kx)), y0 = Math.max(0, Math.floor((a.top - cr.top) * ky)), x1 = Math.min(cv.width, Math.ceil((a.right - cr.left) * kx)), y1 = Math.min(cv.height, Math.ceil((a.bottom - cr.top) * ky));
          let hud = 0; if (x1 > x0 && y1 > y0) { m.hudOff = false; m.render(m.G.t, 0); const A = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; m.hudOff = true; m.render(m.G.t, 0); const B = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; m.hudOff = false;
            for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 30) hud++; }
          res({ ship: hit(s), dom, hud, top: Math.round(a.top), inView: a.left >= 0 && a.right <= innerWidth && a.top >= 0 && a.bottom <= innerHeight }); }))); }, [x, y]);
        if (r.hidden) { bad.push('hidden at ' + x + ',' + y); continue; }
        if (r.ship || r.dom.length || r.hud > 20 || !r.inView) bad.push(JSON.stringify([x, y, r]));
      }
      ok(w + 'x' + h + ': comms line never overlaps the ship, the touch buttons or the canvas HUD (' + POS.length + ' ship positions)', !bad.length, bad.join(' '));
      await p.ctx.close();
    }
    // ---- automated pages never meet a scene; ?story=0 is the old game
    {
      const p = await open(390, 763, '');
      await p.click('#playBtn'); await sleep(400);
      ok('without ?story=2 an automated page never meets a scene (PLAY runs at once)', await p.evaluate(() => SAGA.t.run() && !SAGA.open));
      await p.ctx.close();
      const q = await open(390, 763, '&story=0');
      const o = await q.evaluate(() => ({ api: !!window.SAGA, tile: !!document.getElementById('sgTile'), card: !!document.getElementById('sgCard'), cm: !!document.getElementById('sgComms'), flag: window.__mnr.RET.story, tale: !!document.getElementById('taleBtn') }));
      ok('?story=0: no tile, card, comms or API, the old STORY LOG button is back', !o.api && !o.tile && !o.card && !o.cm && o.flag === false && o.tale, JSON.stringify(o));
      await q.click('#playBtn'); await sleep(400);
      ok('?story=0: PLAY starts the run at once', await q.evaluate(() => !!document.getElementById('title').hidden));
      await q.ctx.close();
    }
  } catch (e) { ok('test ran', false, e.stack); }
  ok('no page errors', !errs.length, JSON.stringify(errs.slice(0, 5)));
  await br.close(); srv.kill();
  const f = res.filter(x => !x).length; console.log((f ? 'FAIL ' : 'PASS ') + 'story-test ' + (res.length - f) + '/' + res.length); process.exit(f ? 1 : 0);
})();
