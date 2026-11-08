// BRIEF-GAMEFEEL shots: title, Learn first screen, Goal card, first turn, mid-game, rival turn, result at 390x844 and 1440x900 -> ../playable-shots/feel/
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.HTML || path.join(__dirname, 'lantern-dive.html')); const OUT = path.join(__dirname, '..', 'playable-shots', 'feel'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tap(p, sel, filter) {
  const t = await p.evaluate(([sel, filter]) => { for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); if (b.width < 4 || b.height < 4) continue; if (filter && !new RegExp(filter, 'i').test(e.textContent.trim())) continue;
    for (const [fx, fy] of [[.5, .5], [.3, .3], [.7, .3], [.3, .7], [.7, .7]]) { const x = b.left + b.width * fx, y = b.top + b.height * fy; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return [x, y]; } } return null; }, [sel, filter || null]);
  if (!t) return false; await p.touchscreen.tap(t[0], t[1]); return true;
}
(async () => {
  const br = await PW.chromium.launch();
  for (const [W, H] of [[390, 844], [1440, 900]]) {
    const m = W < 700, tag = W + 'x' + H, sh = n => path.join(OUT, n + '-' + tag + '.png');
    const ctx = await br.newContext({ viewport: { width: W, height: H }, isMobile: m, hasTouch: true, deviceScaleFactor: m ? 2 : 1 });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); await p.goto('https://gns.test/' + (m ? '?phone=1' : '')); await sleep(900); await p.evaluate(() => localStorage.clear()); await p.reload(); await sleep(1200);
    await p.evaluate(() => showStart()); await sleep(500); await p.screenshot({ path: sh('1-title') });
    await p.evaluate(() => document.querySelector('#start [data-gxt-open]').click()); await sleep(2500); await p.screenshot({ path: sh('2-learn-first') });
    await p.evaluate(() => { const e = document.querySelector('.gxt-skip,[data-gxt-skip]'); try { GXT.skip(); } catch (x) { } }); await sleep(500);
    await p.evaluate(() => { UI.prefs.hints = false; newGame('vs'); AIDELAY = 650; }); await sleep(900); await p.screenshot({ path: sh('3-goal-card') });
    await tap(p, '#dlg .btn.go'); await sleep(600);
    let shots = { first: 0, mid: 0, rival: 0 }, n = 0;
    for (let i = 0; i < 400; i++) {
      const s = await p.evaluate(() => ({ ph: G.phase, must: iMustAct(), busy: UI.busy, tr: G.tricks.length, over: G.phase === 'over' && UI.overShown }));
      if (s.over) break;
      if (s.ph === 'play' && !s.must && s.busy && !shots.rival && s.tr >= 1) { await sleep(500); await p.screenshot({ path: sh('6-rival-turn') }); shots.rival = 1; }
      let a = false;
      if (s.must && !s.busy) {
        if (s.ph === 'assign') a = await tap(p, '.jcard.glow');
        else if (s.ph === 'distress') a = await tap(p, '#acts button', 'No flare|No|Skip');
        else if (s.ph === 'signal') a = await tap(p, '#acts button', 'No signal');
        else if (s.ph === 'predict') a = await tap(p, '#acts button');
        else if (s.ph === 'play') {
          if (!shots.first) { await sleep(400); await p.screenshot({ path: sh('4-first-turn') }); shots.first = 1; }
          if (s.tr >= 3 && !shots.mid) { await sleep(400); await p.screenshot({ path: sh('5-mid-game') }); shots.mid = 1; }
          a = await tap(p, '#hand .hc.glow');
        }
      }
      await sleep(a ? 700 : 250);
    }
    await sleep(2500); await p.screenshot({ path: sh('7-result') }); console.log(tag, JSON.stringify(shots)); await ctx.close();
  }
  await br.close();
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
