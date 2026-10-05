// Round-end score test (Playwright).   PW=<path>/playwright node score-flash-test.js [games=2]
// While a round's last reveal is still on screen, no seat's displayed score may count that round twice and the bar may not show the next round.
// Samples the seat scores, the diner chips and the bar every 25 ms through whole guided and 3-diner games.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const path = require('path'); const N = +process.argv[2] || 2;
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); let bad = 0, samples = 0;
  for (let g = 0; g < N; g++) {
    const c = await b.newContext({ viewport: { width: 390, height: 763 }, isMobile: true, hasTouch: true }); const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + (process.env.FILE || path.join(__dirname, 'kaiten.html')) + '?seed=' + (5 + g)); await p.waitForFunction(() => typeof UI !== 'undefined' && document.querySelector('#start .ttl'));
    await p.evaluate(([g]) => { AIDELAY = 120; UI.opt = null; setNp(g % 2 ? 3 : 2); newGame(g % 2 ? 'vs' : 'guided'); window.__bad = []; window.__n = 0;
      setInterval(() => { if (!G || !UI.fz || !G.rs.length) return;
        // the window between the engine scoring a round and the next round's first plates: the old tables are still on screen
        if (!(G.phase === 'over' || (G.turn === 1 && G.players.every(q => !q.table.length && !q.picked)))) return; __n++;
        // expected = earlier rounds (all of G.rs except the round just scored) + the engine's score of the tables still on screen
        const tabs = UI.fz.tables || G.players.map(q => q.table), live = KK.roundScores({ players: tabs.map(t => ({ table: t })) });
        const want = G.players.map((q, s) => G.rs.slice(0, -1).reduce((a, r) => a + r[s].total, 0) + live[s].total);
        const seats = [...document.querySelectorAll('#tbl .seat')].map(e => [+e.dataset.seat, +e.querySelector('.sh .sc').textContent]);
        for (const [s, v] of seats) if (v !== want[s]) __bad.push('seat ' + s + ' shows ' + v + ', expected ' + want[s] + ' after ' + G.rs.length + ' scored round(s)');
        const bar = document.getElementById('barstat').textContent, m = /Round (\d)/.exec(bar);
        if (m && G.rs.length && +m[1] > G.rs.length && UI.fz.tables && G.phase !== 'over') __bad.push('bar shows "' + bar + '" during the round-' + G.rs.length + ' reveal');
      }, 25); }, [g]);
    for (let i = 0; i < 2000; i++) {
      await p.waitForTimeout(60);
      const st = await p.evaluate(() => { const x = document.querySelector('#pc:not([hidden]) [data-a=cont]'); if (x) x.click(); const n = document.querySelector('#rs:not([hidden]) [data-a=rsnext]'); if (n && UI.rsInfo && UI.rsInfo.done) n.click();
        if (canPick()) { document.querySelector('#belt .hc').click(); } return G.phase === 'over' && UI.overShown; });
      if (st) break;
    }
    const r = await p.evaluate(() => ({ bad: __bad.slice(0, 5), nb: __bad.length, n: __n, over: G.phase }));
    samples += r.n; bad += r.nb + errs.length; console.log('game', g, r.over, 'samples', r.n, 'bad', r.nb, r.bad.join(' | '), errs.slice(0, 2).join(' | ')); await c.close();
  }
  console.log('score-flash-test: samples ' + samples + ', problems ' + bad); console.log(bad ? 'SCORE-FLASH TEST FAILED' : 'SCORE-FLASH TEST PASSED'); await b.close(); process.exit(bad ? 1 : 0);
})();
