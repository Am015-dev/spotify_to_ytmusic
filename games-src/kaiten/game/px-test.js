// Painted-table test (Playwright): animations finish, and every sprite ends where the engine and the DOM say it is.
// node px-test.js            -> WebGL High at 1366x768, WebGL Low at 390x763 (phone), WebGL Medium at 844x390, canvas renderer, DOM fallback, hot-seat backs
// Prints "FAIL <run> <check>" lines, then PROBLEMS n.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const ONLY = process.argv[2] ? +process.argv[2] : -1;
const RUNS0 = [
  { name: 'webgl high 1366x768', W: 1366, H: 768, gfx: 'high', np: 4, turns: 11 },
  { name: 'webgl low 390x763 phone', W: 390, H: 763, ph: 1, gfx: 'low', np: 3, turns: 10 },
  { name: 'webgl medium 844x390 phone', W: 844, H: 390, ph: 1, gfx: 'medium', np: 5, turns: 8 },
  { name: 'canvas renderer 1100x700', W: 1100, H: 700, gfx: 'high', np: 3, turns: 5, q: '?px=canvas', kind: 'canvas' },
  { name: 'hot-seat backs 1366x768', W: 1366, H: 768, gfx: 'medium', np: 2, turns: 4, mode: 'hot' },
  { name: 'DOM fallback 1366x768', W: 1366, H: 768, np: 3, turns: 3, q: '?px=0', dom: 1 }];
const RUNS = ONLY >= 0 ? [RUNS0[ONLY]] : RUNS0;
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); let bad = 0;
  for (const R of RUNS) {
    const ctx = await b.newContext(Object.assign({ viewport: { width: R.W, height: R.H }, deviceScaleFactor: 1 }, R.ph ? { isMobile: true, hasTouch: true } : {}));
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', R.name, c, d ? String(d).slice(0, 400) : ''); };
    await p.goto('https://gns.test/' + (R.q || '')); await p.waitForTimeout(1500);
    const st0 = await p.evaluate(() => ({ on: PX.on, kind: PX.kind, cls: document.documentElement.classList.contains('kkpx') }));
    if (R.dom) { if (st0.on || st0.cls) fail('px=0 must keep the DOM view', JSON.stringify(st0)); }
    else { if (!st0.on || !st0.cls) fail('painted table did not start', JSON.stringify(st0)); if (R.kind && st0.kind !== R.kind) fail('renderer', st0.kind); if (!R.kind && !/webgl/.test(st0.kind)) fail('renderer', st0.kind); }
    if (R.gfx && !R.dom) await p.evaluate(g => { setGfx(g); }, R.gfx);
    await p.evaluate(([np, mode]) => { try { localStorage.clear(); } catch (e) { } UI.seed = 11; AIDELAY = 60; ANIM = 1; UI.opt = { np, level: 'normal', lv: ['normal', 'normal', 'normal', 'normal'] }; showStart(); UI.sv = 'setup'; renderStart(); document.querySelector('[data-start=' + (mode || 'vs') + ']').click(); }, [R.np, R.mode]);
    // wait until a human may pick, the reveal sequence is over and nothing moves any more
    const settle = async tag => {
      const t0 = Date.now();
      for (;;) {
        const s = await p.evaluate(() => { if (!document.querySelector('#pc').hidden) { const c = document.querySelector('#pc [data-a=take],#pc [data-a=cont]'); if (c) c.click(); return { wait: 1 }; } if (!document.querySelector('#rs').hidden) { const n = document.querySelector('#rs [data-a=rsnext]'); if (n) n.click(); return { wait: 1 }; }
          return { can: canPick(), busy: UI.busy, moving: PX.on ? PX.state().moving : false, over: G.phase === 'over' }; });
        if (s.over) return 'over';
        if (s.can && !s.busy && !s.moving) return 'ok';
        if (Date.now() - t0 > 15000) { const why = await p.evaluate(() => PX.state().objs.filter(o => Math.abs(o.x - o.tx) > .5 || Math.abs(o.y - o.ty) > .5 || Math.abs(o.w - o.tw) > .5).map(o => o.key + ' ' + [o.x, o.tx, o.y, o.ty, o.w, o.tw].map(v => Math.round(v * 10) / 10).join('/'))); fail('animations did not finish ' + tag, JSON.stringify(s) + ' ' + JSON.stringify(why.slice(0, 5))); return 'stuck'; }
        await p.waitForTimeout(60);
      }
    };
    // the check: engine -> DOM -> sprites
    const check = async tag => {
      const r = await p.evaluate(() => {
        const out = [], B = document.querySelector('#bd').getBoundingClientRect(), S = PX.on ? PX.state() : null, v = viewSeat();
        const rel = e => { const r = e.getBoundingClientRect(); return [r.left - B.left, r.top - B.top, r.width, r.height]; };
        const near = (a, b, t) => Math.abs(a - b) <= (t || 1.01);
        // hand: the engine's hand (minus the served plate) = the belt buttons = the card sprites, each at its button with the right face
        const eng = v >= 0 ? G.players[v].hand.filter(id => !(G.players[v].picked && G.players[v].pick && G.players[v].pick.includes(id))).slice().sort((a, b) => a - b) : [];
        const dom = [...document.querySelectorAll('#belt .hc[data-id]')].map(e => +e.dataset.id).sort((a, b) => a - b);
        if (eng.join() !== dom.join()) out.push('DOM hand ' + dom.join() + ' != engine ' + eng.join());
        if (S) {
          const cards = S.objs.filter(o => o.kind === 'card');
          const faces = cards.filter(o => o.key.startsWith('h:')).map(o => +o.key.slice(2)).sort((a, b) => a - b);
          if (faces.join() !== dom.join()) out.push('card sprites ' + faces.join() + ' != DOM ' + dom.join());
          for (const e of document.querySelectorAll('#belt .hc')) {
            const key = e.dataset.id != null ? 'h:' + e.dataset.id : null; if (!key) continue; const o = cards.find(c => c.key === key); if (!o) continue; const [x, y, w] = rel(e);
            if (!near(o.x, x) || !near(o.y, y) || !near(o.w, w)) out.push('card ' + key + ' at ' + [o.x, o.y, o.w].map(Math.round) + ' not at its button ' + [x, y, w].map(Math.round));
            if (o.type !== tkey(+e.dataset.id)) out.push('card ' + key + ' shows ' + o.type);
            if (!o.face) out.push('card ' + key + ' has no face texture'); if (o.alpha < .99) out.push('card ' + key + ' alpha ' + o.alpha);
          }
          const backs = document.querySelectorAll('#belt .hc.back').length, sb = cards.filter(o => o.back).length; if (backs !== sb) out.push('back sprites ' + sb + ' != DOM backs ' + backs);
          // counters: every group the engine scores (groupsOf on the engine tables) has a plate sprite with the right stack at its button
          const tab = G.players.map(q => q.table), info = seatScoreInfo(tab), pc = pudCounts();
          const want = new Map(); G.players.forEach((q, s) => { groupsOf(s, tab, info).list.forEach(g => want.set('g:' + s + '|' + g.k, { n: g.n, type: g.type })); want.set('g:' + s + '|pud', { n: pc[s], type: 'pudding' }); });
          const plates = S.objs.filter(o => o.kind === 'plate');
          for (const [k, w] of want) { const o = plates.find(q => q.key === k); if (!o) { out.push('no plate sprite for ' + k); continue; } if (o.layers !== Math.min(Math.max(w.n, 1), 3)) out.push(k + ' layers ' + o.layers + ' for ' + w.n); if (o.type !== w.type) out.push(k + ' type ' + o.type); }
          for (const o of plates) if (!want.has(o.key)) out.push('extra plate sprite ' + o.key);
          for (const g of document.querySelectorAll('#tbl .grp')) { const k = 'g:' + g.dataset.seat + '|' + g.dataset.k, o = plates.find(q => q.key === k), pl = g.querySelector('.pl'); if (!o || !pl) continue; const [x, y, w, hh] = rel(pl); if (o.vis && (!near(o.x, x) || !near(o.y, y) || !near(o.w, hh))) out.push('plate ' + k + ' at ' + [o.x, o.y, o.w].map(Math.round) + ' not at ' + [x, y, hh].map(Math.round)); if (o.vis && o.shown !== o.layers) out.push(k + ' shows ' + o.shown + ' of ' + o.layers); }
          if (S.tweens) out.push('tweens still running: ' + S.tweens);
        } else {
          // DOM fallback: the cards are real pictures
          const svg = [...document.querySelectorAll('#belt .hc svg.kk-card')]; if (svg.length !== dom.length) out.push('DOM cards ' + svg.length); if (svg.some(e => getComputedStyle(e).visibility === 'hidden' || !e.getBoundingClientRect().width)) out.push('DOM card pictures hidden');
        }
        return { out: out.slice(0, 6), n: dom.length, q: S && S.q, blur: S && S.blur, parts: S && S.parts, paint: S && S.canvasOK, res: S && S.res };
      });
      if (r.out.length) fail('positions ' + tag, JSON.stringify(r.out));
      return r;
    };
    let turns = 0, flights = 0, last = null, maxParts = 0;
    for (let k = 0; k < R.turns * 3 && turns < R.turns; k++) {
      const s = await settle('turn ' + turns); if (s !== 'ok') break;
      last = await check('turn ' + turns + ' r' + (await p.evaluate(() => G.round)));
      maxParts = Math.max(maxParts, last.parts || 0);
      if (R.mode === 'hot') { // between holders only backs are drawn, never a face
        const hb = await p.evaluate(() => { const S = PX.state(); return { faces: S.objs.filter(o => o.kind === 'card' && !o.back).length, holder: UI.holder }; });
        if (hb.holder < 0 && hb.faces) fail('face sprites while the device is being passed', JSON.stringify(hb));
      }
      // serve a plate with two real taps; the flight must start and finish
      const n = await p.evaluate(() => document.querySelectorAll('#belt .hc[data-up="1"]').length); if (!n) { fail('no plates to tap'); break; }
      const i = (turns * 2 + 1) % n;
      await p.click(`#belt .hc[data-up="1"] >> nth=${i}`); await p.waitForTimeout(40); await p.click('#belt .hc.sel');
      const fl = await p.evaluate(() => PX.on ? PX.state().nServe : 0); if (!R.dom && fl > flights) flights = fl;
      turns++;
    }
    if (!R.dom && turns && flights < turns) fail('serve flights ' + flights + ' for ' + turns + ' served turns');
    // every completed table turn lands one plate (or two with Twin Sticks) per diner from the reveal slots
    if (!R.dom) { await settle('end'); const ln = await p.evaluate(t0 => ({ nl: PX.state().nLand, done: (G.round - 1) * G.hand + G.turn - 1 - t0, np: G.np }), 0); if (ln.nl < ln.done * ln.np) fail('landing flights ' + ln.nl + ' for ' + ln.done + ' table turns x ' + ln.np + ' diners'); }
    if (turns < Math.min(3, R.turns)) fail('too few turns', turns);
    if (!R.dom && last) {
      if (R.gfx === 'low' && (last.blur || maxParts)) fail('Low must have no blur filters and no particles', JSON.stringify({ blur: last.blur, maxParts }));
      if (R.gfx === 'high' && !last.blur) fail('High should blur the steam layer');
      if (!(last.paint > .2)) fail('canvas looks blank', last.paint);
    }
    console.log(R.name, 'turns', turns, 'flights', flights, 'last', JSON.stringify(last && { n: last.n, q: last.q, blur: last.blur, maxParts, paint: last.paint, res: last.res }));
    await p.screenshot({ path: path.join(__dirname, 'shots', 'px_' + R.name.replace(/\W+/g, '_') + '.png') });
    if (errs.length) fail('console errors', JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
