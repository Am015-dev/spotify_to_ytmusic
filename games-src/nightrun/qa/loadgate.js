#!/usr/bin/env node
// LOADGATE: how fast the sprites of the CURRENT stage are drawn (390x763 phone, local files, real time). PASS/FAIL lines only.
//   street: FOOT.start('zeil') -> Kai drawn (his idle sheet decoded and FQ.draw succeeding) within 3.5 s
//   flight: startStory(1)      -> every ship-* sheet asked for in the first 4 s decoded within 2 s of the stage start
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/loadgate.js     env: GAME_DIR, STREET=3.5 FLIGHT=2 (s)
const { boot, open, sleep, ok, done } = require('./lib.js');
const LIM_ST = +process.env.STREET || 3.5, LIM_FL = +process.env.FLIGHT || 2;
const WRAP = () => { window.__ra = {}; const ART = __mnr.ART; if (ART.anim.__w) return; const o = ART.anim; ART.anim = k => { const r = o(k); const a = window.__ra[k] || (window.__ra[k] = { ask: performance.now(), got: 0 }); if (r && !a.got) a.got = performance.now(); return r; }; ART.anim.__w = 1; };
(async () => {
  const b = await boot();
  try {
    { const p = await open(b.br, b.base, 390, 763, '?nomusic=1', 0, true, () => { localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); });
      await p.evaluate(() => document.getElementById('moreBtn').click()); await sleep(300); await p.evaluate(() => document.getElementById('footBtn').click()); await sleep(300);
      for (let i = 0; i < 6; i++) { await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); await sleep(250); }
      await p.evaluate(WRAP); const r = await p.evaluate(async () => { const s = performance.now(); window.__ra = {}; FOOT.stop && FOOT.stop(); FOOT.start('zeil'); let t = -1; for (let i = 0; i < 400; i++) { await new Promise(r => setTimeout(r, 50)); const a = window.__ra['kai/idle'] || window.__ra['kai/run']; if (a && a.got && FOOT.q.calls > 0 && !FOOT.q.miss.kai) { t = performance.now() - s; break; } if (a && a.got && FOOT.q.calls > 0) { const m = FOOT.q.miss.kai; await new Promise(r => setTimeout(r, 200)); if (FOOT.q.miss.kai === m) { t = performance.now() - s; break; } } } return { t, miss: FOOT.q.miss }; });
      ok(`street: Kai drawn in ${(r.t / 1000).toFixed(2)} s (limit ${LIM_ST}) miss=${JSON.stringify(r.miss)}`, r.t > 0 && r.t < LIM_ST * 1000);
      ok('street: no page errors', !p.errs.length, p.errs.join(' | ')); await p.context().close(); }
    { const p = await open(b.br, b.base, 390, 763, '?nomusic=1', 0, true);
      await p.evaluate(WRAP); const r = await p.evaluate(async () => { const s = performance.now(); window.__ra = {}; __mnr.startStory(1); await new Promise(r => setTimeout(r, 4000)); const ks = Object.keys(window.__ra).filter(k => /^ship-/.test(k) && window.__ra[k].ask - s < 4000); const late = ks.map(k => [k, window.__ra[k].got ? window.__ra[k].got - s : 1e9]).filter(x => x[1] > 2000);
        return { n: ks.length, late, max: Math.max(0, ...ks.map(k => window.__ra[k].got ? window.__ra[k].got - s : 1e9)) }; });
      ok(`flight: ${r.n} ship sheets asked, slowest ${(r.max / 1000).toFixed(2)} s (limit ${LIM_FL})`, r.n > 0 && !r.late.length, JSON.stringify(r.late));
      ok('flight: no page errors', !p.errs.length, p.errs.join(' | ')); await p.context().close(); }
  } finally { await b.close(); }
  done('loadgate');
})();
