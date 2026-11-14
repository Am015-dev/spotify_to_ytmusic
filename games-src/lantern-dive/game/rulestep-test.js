// Special dive rules (W504): each one shows ONE guided step (<= 12 words, a spotlight, one tap) the first time it appears, and never again.
//   NODE_PATH=/opt/node-tools/node_modules node rulestep-test.js [390x844]
// Per rule: a fresh device starts a dive that has the rule; the computer plays the human seat through the engine until the rule's step shows;
// the step is checked (words, spotlight on screen, a tap outside does nothing) and closed with a touch tap on the spotlight; then the same dive
// again must not show it. Exit 1 on any problem.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.HTML || path.join(__dirname, 'lantern-dive.html')), LIVE = path.join(__dirname, '..', '..', '..', 'games', 'lantern-dive');
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms)), probs = [];
const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const CASES = [
  ['vote', { np: 4, kind: 'log', mission: 6 }], ['handover', { np: 4, kind: 'log', mission: 10 }], ['volunteer', { np: 4, kind: 'log', mission: 14, timer: false }],
  ['predict', { np: 4, kind: 'job', job: 90 }], ['murky', { np: 4, kind: 'log', mission: 9 }], ['narc', { np: 4, kind: 'log', mission: 11 }],
  ['clock', { np: 4, kind: 'log', mission: 14, timer: true }], ['drone', { np: 2, kind: 'log', mission: 1 }]
];
async function drive(p, want, ms) {   // returns the rule step that showed (id) or null; plays the human seat with the engine while no step is up
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const st = await p.evaluate(() => { const e = document.getElementById('rstep'); if (e) return { rule: e.dataset.rule }; if (!G || G.phase === 'over') return { over: 1 };
      if (!UI.busy && !UI.fz && !UI.cards.length) { UI.preReady = true; const v = viewSeat(); if (v >= 0 && LD.pending(G).includes(v)) { const mv = LD.moves(G, v).filter(m => m.t !== 'ping'); if (mv.length) { const m = LD.AI && LD.AI.choose ? null : null; doMove(mv.find(x => x.t === 'take' || x.t === 'yes' || x.t === 'keep' || x.t === 'play' || x.t === 'vote' || x.t === 'predict' || x.t === 'give' || (x.t === 'dist' && !x.on) || x.t === 'done') || mv[0]); } } }
      return {}; });
    if (st.rule) return st.rule; if (st.over) return null; await sleep(120);
  }
  return null;
}
(async () => {
  const b = await PW.chromium.launch();
  for (const [id, opt] of CASES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true });
    await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); if (u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); const f = path.join(LIVE, decodeURIComponent(u.pathname)); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: '' }); });
    const p = await ctx.newPage(); p.on('pageerror', e => probs.push(id + ': PAGE ERROR ' + e.message));
    await p.goto('https://gns.test/?phone=1'); await sleep(800); await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('gxt-lantern-dive', '{"done":1}'); } catch (e) { } }); await p.reload(); await sleep(1000);
    const start = () => p.evaluate(o => { AIDELAY = 60; newGame('vs', Object.assign({ noGoal: true }, o)); UI.dlg = null; try { drawDlg(); } catch (e) { } schedule(); }, opt);
    await start();
    let got = null; const seen = [];
    for (let k = 0; k < 6 && got !== id; k++) {
      got = await drive(p, id, 40000); if (!got) break; seen.push(got);
      const info = await p.evaluate(() => { const e = document.getElementById('rstep'), h = e.querySelector('.rsh').getBoundingClientRect(), bb = e.querySelector('.rsb').getBoundingClientRect(); return { say: e.querySelector('.gxh-tx').textContent, h: { l: h.left, t: h.top, w: h.width, hh: h.height }, b: { t: bb.top, bo: bb.bottom } }; });
      if (wc(info.say) > 12) probs.push(got + ': over 12 words (' + wc(info.say) + ')');
      if (info.h.w < 24 || info.h.hh < 24 || info.h.l < 0 || info.h.t < 0 || info.h.l + info.h.w > W + 1 || info.h.t + info.h.hh > H + 1) probs.push(got + ': spotlight off screen ' + JSON.stringify(info.h));
      if (info.b.t < 0 || info.b.bo > H + 1) probs.push(got + ': bubble off screen');
      if (got === id && W === 390) { fs.mkdirSync(path.join(__dirname, '..', 'playable-shots', 'gameplay'), { recursive: true }); await p.screenshot({ path: path.join(__dirname, '..', 'playable-shots', 'gameplay', 'rule-' + id + '.png') }); }
      await sleep(600);
      const out = info.h.t > 80 ? [W / 2, 30] : [W / 2, H - 20]; await p.touchscreen.tap(out[0], out[1]); await sleep(200);
      if (!(await p.evaluate(() => !!document.getElementById('rstep')))) probs.push(got + ': a tap outside the spotlight closed the step');
      await p.touchscreen.tap(info.h.l + info.h.w / 2, info.h.t + info.h.hh / 2); await sleep(300);
      if (await p.evaluate(g => { const e = document.getElementById('rstep'); return !!e && e.dataset.rule === g; }, got)) { probs.push(got + ': tapping the spotlight did not close the step'); break; }
    }
    if (got !== id) probs.push(id + ': its step never showed (saw ' + seen.join(',') + ')');
    else { // the same dive again: the step must not come back
      await start(); const again = []; let r; const t0 = Date.now();
      while (Date.now() - t0 < 15000 && (r = await drive(p, id, 15000 - (Date.now() - t0)))) { again.push(r); await p.evaluate(() => ruleStepDone()); }
      if (again.includes(id)) probs.push(id + ': shown a second time');
    }
    console.log(id, got === id ? 'shown once' : 'MISSING', seen.join('>'));
    await ctx.close();
  }
  await b.close(); console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0'); process.exit(probs.length ? 1 : 0);
})();
