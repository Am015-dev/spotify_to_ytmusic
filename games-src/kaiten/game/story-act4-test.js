// W758: each Act 4 story stage (c11-c15) played to a WIN by a scripted run through the real game (campStart + commit),
// the player's seat driven by the hard AI; tries seeds until the stage's own win rule (campIsWon) passes. Budget 60 s per stage.
// usage: NODE_PATH=$(npm root -g) node games-src/kaiten/game/story-act4-test.js [http://localhost:8779/kaiten-kitchen/]
const { chromium } = require('playwright');
const { turbo, budget } = require('../../scripts/turbo');
const URL = process.argv[2] || 'http://localhost:8779/kaiten-kitchen/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); let fail = 0;
  for (const id of ['c11', 'c12', 'c13', 'c14', 'c15']) {
    const t0 = Date.now(), stop = budget(60000, 'story ' + id);
    const ctx = await b.newContext({ viewport: { width: 402, height: 874 } }); await turbo(ctx);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForFunction(() => typeof campStart === 'function' && window.CAMPAIGN && typeof KK !== 'undefined', null, { timeout: 20000 });
    const r = await p.evaluate(async (id) => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const base = CAMPAIGN.chapters.find(c => c.id === id);
      for (let seed = 1; seed <= 12; seed++) {
        const def = JSON.parse(JSON.stringify(base)); def.setup.seed = seed;
        try { GXH.setEnabled(false); } catch (e) { }
        campStart(def); UI.camp = def; UI.coach.level = 'off'; UI.coach.userOff = true;
        let guard = 0;
        while (G.phase !== 'over' && guard++ < 4000) {
          if (G.phase === 'pick' && !G.players[0].picked && !UI.busy) { const mv = KK.AI.choose(G, 0, 'hard'); if (mv) commit(0, mv); }
          try { if (document.querySelector('[data-a="rsnext"]')) afterRound(UI.rsInfo && UI.rsInfo.ge); } catch (e) { }
          await wait(20);
        }
        if (G.phase === 'over') {
          const m = campMetrics(G);
          if (campIsWon(G, def)) return { won: true, seed, score: m.score, margin: m.margin, twist: G.tw ? G.tw.id + ':' + G.tw.param : 'none', np: G.np };
        }
      }
      return { won: false };
    }, id);
    stop();
    const s = ((Date.now() - t0) / 1000).toFixed(1);
    if (!r.won || errs.length) fail++;
    console.log(`${r.won && !errs.length ? 'PASS' : 'FAIL'} ${id} ${JSON.stringify(r)} ${s}s${errs.length ? ' errors: ' + errs.slice(0, 2).join(' | ') : ''}`);
    await ctx.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
