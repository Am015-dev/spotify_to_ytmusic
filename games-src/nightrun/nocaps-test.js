#!/usr/bin/env node
// NOCAPS gate (parts/hud/nocaps.js): stages 1, 3, 10 and endless play 60 s each with 0 caption / hint / chip / card text drawn; the pre-stage card shows on the first visit
// of a stage with a new thing and never on the second; PLAY DRILL runs the right drill and then the stage starts. MEASURE=1 prints NC.TAB (what each stage brings). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/nocaps-test.js
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + JSON.stringify(i))); };
const PROBE = () => {   // text drawn on the canvas while probing
  window.__txt = []; const P = CanvasRenderingContext2D.prototype, ft = P.fillText; P.fillText = function (t) { if (window.__probe) window.__txt.push(String(t)); return ft.apply(this, arguments); };
};
const PLAY = new Function('o', `
  const m = window.__mnr; let sd = 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  m.god = true; if (o.story) m.startStory(o.story); else document.getElementById('startBtn').click(); m.simOn(true);
  let i = 0, bad = [], texts = new Set(); const isCap = s => { const T = (window.EXP && EXP.TXT) || {}; return Object.values(T).some(v => v && s && String(v).replace('%SIDE%', '').slice(0, 14) === s.slice(0, 14)); };
  while (m.running && i < o.steps) { if (m.SH && m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(195 + 150 * Math.sin(i / 50), 520 + 60 * Math.sin(i / 37)); m.step(1 / 60); i++;
    if (i % 20 === 0) { window.__txt = []; window.__probe = 1; try { m.render(m.G.t, 1 / 60); } catch (e) {} window.__probe = 0;
      for (const s of window.__txt) { texts.add(s); if (isCap(s) || /^(TAP: use|NEW: |TWIST: |NEW ATTACK|CHOOSE:|EMP charged|DASH has charges|RED SCREEN|GREEN SQUARES|PURPLE RING)/.test(s) || s === 'KEEP MOVING') bad.push('canvas:' + s); }
      const cpEl = document.querySelector('#bPwr .cp'); if (cpEl && cpEl.offsetParent && getComputedStyle(cpEl).display !== 'none' && cpEl.textContent) bad.push('chip:' + cpEl.textContent);
      const sg = document.getElementById('sgCard'); if (sg && !sg.hidden && getComputedStyle(sg).display !== 'none' && sg.classList.contains('live')) bad.push('storycard');
      if (window.EXP && EXP.cap) bad.push('EXP.cap'); if (window.ZH && ZH.cap) bad.push('ZH.cap'); if (window.HINT && HINT.cur) bad.push('HINT.cur'); if (m.G.hint && m.G.hint.t > 0) bad.push('G.hint'); if (document.getElementById('ncCard') && !document.getElementById('ncCard').hidden) bad.push('card in stage'); } }
  const r = { t: Math.round(m.G.t), bad: [...new Set(bad)], sup: Object.keys(NC.sup), steps: i }; m.abort(); return r;`);
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const base = 'http://127.0.0.1:' + port, errs = [];
  const browser = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => PW.chromium.launch());
  const open = async q => { const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); await ctx.addInitScript(PROBE); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(base + '/index.html?sim=1&all=1' + q); await p.waitForFunction(() => window.__mnr && document.getElementById('startBtn') && window.NC); await sleep(700); return { ctx, p }; };
  try {
    if (process.env.MEASURE) {   // what does each stage bring, in order of appearance (suppressed ids are recorded in NC.sup, insertion order)
      const { ctx, p } = await open(''); const tab = {};
      for (const s of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'endless']) { const r = await p.evaluate(PLAY, { story: s === 'endless' ? 0 : s, steps: 60 * 60 }); tab[s === 'endless' ? 'endless' : 's' + s] = r.sup.filter(k => k !== 'hint' && k !== 'rulebanner' && k !== 'still'); }
      console.log('TAB ' + JSON.stringify(tab)); await ctx.close(); return;
    }
    // 1 play: nothing is drawn
    {
      const { ctx, p } = await open(''); let sup = 0;
      for (const s of [{ n: 'stage 1', story: 1 }, { n: 'stage 3', story: 3 }, { n: 'stage 10', story: 10 }, { n: 'endless', story: 0 }]) {
        const r = await p.evaluate(PLAY, { story: s.story, steps: 60 * 60 }); sup += r.sup.length;
        ok(s.n + ': 60 s played, 0 caption / hint / chip / card text drawn', r.t >= 55 && r.bad.length === 0, r);
      }
      ok('captions WOULD have fired (suppressed ids recorded), so the gate bites', sup > 0, sup);
      ok('pause list reference still has entries', await p.evaluate(() => !!window.EX10 && Array.isArray(EX10.list)));
      await ctx.close();
    }
    // 1b ?nocaps=0 = old behaviour (captions drawn)
    {
      const { ctx, p } = await open('&nocaps=0'); const r = await p.evaluate(PLAY, { story: 1, steps: 60 * 40 });
      ok('?nocaps=0: old captions still draw', r.bad.some(b => /canvas|HINT|EXP/.test(b)), r); await ctx.close();
    }
    // 2 the card
    {
      const { ctx, p } = await open('&nocapscard=1');
      const tab = await p.evaluate(() => window.NC.TAB), keys = Object.keys(tab);
      ok('NC.TAB has stages 1..12 and endless', ['s1', 's3', 's10', 'endless'].every(k => tab[k]), keys);
      const first = await p.evaluate(() => { __mnr.startStory(1); const c = document.getElementById('ncCard'); return { shown: !!c && !c.hidden, txt: c && c.querySelector('#ncT').textContent, running: __mnr.running, last: NC.last, btns: c ? [...c.querySelectorAll('button')].map(b => b.textContent) : [] }; });
      ok('first visit of stage 1: card "NEW: ... Try the 30 s drill?" with PLAY DRILL / SKIP, stage not started', first.shown && /^NEW: .+\. Try the 30 s drill\?$/.test(first.txt) && first.btns.join() === 'PLAY DRILL,SKIP' && !first.running, first);
      await p.screenshot({ path: '/tmp/nc-card.png' });
      const want = first.last && first.last.drill;
      await p.click('#ncPlay'); await sleep(400);
      const dr = await p.evaluate(() => ({ cur: __school.cur, tut: __school.tutOn, running: __mnr.running, card: !document.getElementById('ncCard').hidden }));
      ok('PLAY DRILL runs the matching drill (' + want + ')', dr.cur === want && dr.tut && !dr.card, { want, dr });
      await p.evaluate(() => __school.pass()); await sleep(2500);
      let st = await p.evaluate(() => ({ running: __mnr.running, tut: __school.tutOn, story: __mnr.ST && __mnr.ST.n, card: !document.getElementById('ncCard').hidden }));
      for (let i = 0; i < 20 && !st.running; i++) { await sleep(500); st = await p.evaluate(() => ({ running: __mnr.running, tut: __school.tutOn, story: __mnr.ST && __mnr.ST.n, card: !document.getElementById('ncCard').hidden })); }
      ok('after the drill the stage 1 starts (no result card in between)', st.running && !st.tut && st.story === 1, st);
      await p.evaluate(() => { __mnr.abort(); }); await sleep(300);
      const second = await p.evaluate(() => { __mnr.startStory(1); const c = document.getElementById('ncCard'); return { shown: !!c && !c.hidden, running: __mnr.running }; });
      ok('second visit of stage 1: no card, stage starts at once', !second.shown && second.running, second);
      await p.evaluate(() => { __mnr.abort(); });
      // SKIP path on another stage: stage starts, the thing is not offered again
      const s3 = await p.evaluate(() => { __mnr.startStory(3); const c = document.getElementById('ncCard'); return { shown: !!c && !c.hidden, k: NC.last && NC.last.k }; });
      if (s3.shown) { await p.click('#ncSkip'); await sleep(300); const r = await p.evaluate(() => ({ running: __mnr.running, card: !document.getElementById('ncCard').hidden })); ok('SKIP starts the stage', r.running && !r.card, r); await p.evaluate(() => __mnr.abort()); }
      else ok('stage 3 first visit offered a card', false, s3);
      const prof = await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_nocaps') || '{}'));
      ok('profile remembers the offered things once', prof.off && Object.keys(prof.off).length >= 2 && prof.vis && prof.vis.s1, prof);
      await ctx.close();
    }
    ok('no page errors', errs.length === 0, errs.slice(0, 3));
  } catch (e) { fails++; console.log('FAIL exception :: ' + (e && e.message || e).toString().slice(0, 400)); } finally { srv.kill(); await browser.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0); }
})();
