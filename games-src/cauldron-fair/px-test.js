// Painted-table test (Playwright): animations finish, and every sprite ends where the engine says it is.
// node px-test.js [only]  -> WebGL High at 1366x768, WebGL Low at 390x763 (phone), WebGL Medium at 844x390 (phone), canvas renderer, hot-seat, DOM fallback
// Prints "FAIL <run> <check>" lines, then PROBLEMS n.
const L = require('./pwlib'); const fs = require('fs'), path = require('path');
const ONLY = process.argv[2] ? +process.argv[2] : -1;
const RUNS0 = [
  { name: 'webgl high 1366x768', W: 1366, H: 768, gfx: 'high', np: 3, draws: 14 },
  { name: 'webgl low 390x763 phone', W: 390, H: 763, ph: 1, gfx: 'low', np: 3, draws: 10 },
  { name: 'webgl medium 844x390 phone', W: 844, H: 390, ph: 1, gfx: 'medium', np: 4, draws: 8 },
  { name: 'canvas renderer 1100x700', W: 1100, H: 700, gfx: 'high', np: 3, draws: 6, q: '?px=canvas', kind: 'canvas' },
  { name: 'hot-seat 1366x768', W: 1366, H: 768, gfx: 'medium', np: 2, draws: 5, mode: 'hot' },
  { name: 'DOM fallback 1366x768', W: 1366, H: 768, np: 3, draws: 4, q: '?px=0', dom: 1 }];
const RUNS = ONLY >= 0 ? [RUNS0[ONLY]] : RUNS0;
(async () => {
  const b = await L.launch(); let bad = 0;
  for (const R of RUNS) {
    const p = await L.page(b, R.W, R.H, R.ph ? { mobile: true, touch: true } : {});
    const fail = (c, d) => { bad++; console.log('FAIL', R.name, c, d ? String(d).slice(0, 500) : ''); };
    await p.goto('https://gns.test/' + (R.q || '')); await p.waitForTimeout(1500);
    const st0 = await p.evaluate(() => ({ on: PX.on, kind: PX.kind, cls: document.documentElement.classList.contains('px') }));
    if (R.dom) { if (st0.on || st0.cls) fail('px=0 must keep the DOM view', JSON.stringify(st0)); }
    else { if (!st0.on || !st0.cls) fail('painted table did not start', JSON.stringify(st0)); if (R.kind && st0.kind !== R.kind) fail('renderer', st0.kind); if (!R.kind && !/webgl/.test(st0.kind)) fail('renderer', st0.kind); }
    if (R.gfx && !R.dom) await p.evaluate(g => { setGfx(g); }, R.gfx);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 11; AIDELAY = 60; ANIM = 1; });
    await p.click('[data-a=play]'); if (R.ph) { await p.tap('[data-a=cfgopen]'); await p.tap(`#cfg [data-a=opt][data-k=np][data-v="${R.np}"]`); await p.tap('#cfg .cfghead [data-a=cfgclose]'); } else await p.click(`[data-a=opt][data-k=np][data-v="${R.np}"]`);
    await p.click('[data-start=' + (R.mode || 'vs') + ']');
    await p.waitForTimeout(700);
    const settle = async tag => {
      const t0 = Date.now();
      for (;;) {
        const s = await p.evaluate(() => {
          if (!document.querySelector('#rs').hidden) { const c = document.querySelector('#rs [data-a=take],#rs [data-a=rscont]:not([disabled])'); if (c) { c.click(); return { wait: 1 }; } const sb = document.querySelector('#rs [data-a=shopbuy]'); if (sb) { sb.click(); return { wait: 1 }; } const o = document.querySelector('#rs .dec [data-a=mv]'); if (o) { o.click(); return { wait: 1 }; } return { wait: 1 }; }
          const tp = document.querySelector('#pc [data-a=tipok]'); if (tp) { tp.click(); return { wait: 1 }; }
          const S = PX.on ? PX.state() : null; return { can: !!document.querySelector('#acts .drawb'), quiet: S ? !S.tweens && !S.parts && !S.pend : true, over: G.phase === 'over' };
        });
        if (s.over) return 'over';
        if (s.can && s.quiet) return 'ok';
        if (Date.now() - t0 > 15000) { fail('animations did not finish ' + tag, JSON.stringify(s) + ' ' + JSON.stringify(await p.evaluate(() => PX.on ? { t: PX.tweens.length, parts: PX.parts.map(q => q.kind) } : null))); return 'stuck'; }
        await p.waitForTimeout(60);
      }
    };
    // engine -> sprites (or engine -> DOM pot in the fallback)
    const check = async tag => {
      const r = await p.evaluate(() => {
        const out = [], f = focusSeat(), pl = G.players[f], S = PX.on ? PX.state() : null;
        if (S) {
          const ids = pl.pot.map(c => c.i).sort((a, b) => a - b).join(), sp = S.objs.map(o => o.id).sort((a, b) => a - b).join();
          if (ids !== sp) out.push('sprites ' + sp + ' != pot ' + ids);
          for (const c of pl.pot) { const o = S.objs.find(q => q.id === c.i); if (!o) continue; const t = PX.target(c.pos); if (Math.abs(o.x - t.x) > 1.5 || Math.abs(o.y - t.y) > 1.5) out.push('chip ' + c.c + c.v + ' at ' + Math.round(o.x) + ',' + Math.round(o.y) + ' not on space ' + c.pos + ' ' + t.x + ',' + t.y); if (o.key !== c.c + c.v) out.push('chip shows ' + o.key + ' != ' + c.c + c.v); if (!o.visible || o.alpha < .99) out.push('chip invisible/alpha ' + o.alpha); }
          const dt = PX.target(pl.droplet); if (!S.drop || !S.drop.vis || Math.abs(S.drop.x - dt.x) > 1.5 || Math.abs(S.drop.y - dt.y) > 1.5) out.push('droplet not on its space ' + JSON.stringify(S.drop) + ' ' + JSON.stringify(dt));
        } else {
          const n = document.querySelectorAll('#cpot [data-chip],#cpot .chipv,#cpot g[data-i]').length; if (pl.pot.length && !document.querySelector('#cpot svg')) out.push('no SVG cauldron in the fallback'); if (document.querySelector('#cpot svg') && getComputedStyle(document.querySelector('#cpot svg')).visibility === 'hidden') out.push('SVG cauldron hidden');
        }
        return { out: out.slice(0, 5), n: pl.pot.length, S: S && { q: S.q, filters: S.filters, parts: S.parts, res: S.res } };
      });
      if (r.out.length) fail('positions ' + tag, JSON.stringify(r.out)); return r;
    };
    let draws = 0, last = null, maxParts = 0, boomed = false, dstop = 0;
    for (let k = 0; k < R.draws * 3 && draws < R.draws; k++) {
      const s = await settle('draw ' + draws); if (s !== 'ok') break;
      last = await check('draw ' + draws + ' r' + (await p.evaluate(() => G.round)));
      if (R.mode === 'hot') { const hb = await p.evaluate(() => ({ priv: document.querySelectorAll('[data-priv]').length, holder: UI.holder })); if (hb.holder < 0 && hb.priv) fail('private info shown while the device is passed', JSON.stringify(hb)); }
      const bf = await p.evaluate(() => PX.on ? PX.state().nBoom : 0);
      await p.click('#acts .drawb', { timeout: 5000 }).catch(() => { }); draws++;
      await p.waitForTimeout(120);
      const after = await p.evaluate(() => ({ nb: PX.on ? PX.state().nBoom : 0, parts: PX.on ? PX.state().parts : 0, boom: G.players[focusSeat()].boom }));
      maxParts = Math.max(maxParts, after.parts);
      if (after.nb > bf) { boomed = true; if (R.gfx === 'low' && after.parts) fail('Low must have no particles after an explosion'); }
      if (after.boom) { dstop++; break; }
    }
    if (!R.dom) { await L.playTo(p, () => { const S = PX.state(); return !S.tweens && !S.parts && !S.pend && !!document.querySelector('#acts .drawb'); }, 600); await p.waitForTimeout(300); const S = await p.evaluate(() => PX.state()); if (S.nFly < Math.max(1, draws - 1)) fail('flights ' + S.nFly + ' for ' + draws + ' draws'); if (S.nLand < S.nFly - 1 && R.mode !== 'hot') fail('landings ' + S.nLand + ' for ' + S.nFly + ' flights');
      if (R.gfx === 'low' && (S.filters || S.nSplash || maxParts)) fail('Low must have no filters and no particles', JSON.stringify({ f: S.filters, sp: S.nSplash, maxParts }));
      if (R.gfx === 'high' && !S.nSplash) fail('High should splash when a chip lands');
      const ink = await p.evaluate(() => PX.canvasInk()); if (!(ink > .2) && ink !== -1) fail('canvas looks blank', ink); last = last || {}; last.ink = ink; last.nFly = S.nFly; last.nSplash = S.nSplash; last.nBoom = S.nBoom; }
    if (draws < Math.min(3, R.draws) && !dstop) fail('too few draws', draws);
    console.log(R.name, 'draws', draws, 'boomed', boomed, 'last', JSON.stringify(last));
    await p.screenshot({ path: path.join(__dirname, 'shots', 'px_' + R.name.replace(/\W+/g, '_') + '.png') });
    if (p.errs.length) fail('console errors', JSON.stringify(p.errs.slice(0, 3)));
    await p.ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
