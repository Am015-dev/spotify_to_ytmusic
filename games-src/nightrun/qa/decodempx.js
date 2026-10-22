#!/usr/bin/env node
// DECODEMPX: decoded picture megapixels (ART.bm bitmaps + anim/ strips) after 20 s on the street stage and on stage 1 (390x763), plus FQ.miss. Numbers only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/decodempx.js     env: GAME_DIR, T=20 (s)
const { boot, open, sleep } = require('./lib.js');
const T = (+process.env.T || 20) * 1000;
const MPX = () => { const A = __mnr.ART, raw = A.bm; let all = 0, an = 0, n = 0, na = 0; for (const k of Object.keys(raw)) { const b = raw[k]; if (!b || !b.width) continue; const m = b.width * b.height / 1e6; all += m; n++; if (k.startsWith('anim/')) { an += m; na++; } } return { mpx: +all.toFixed(1), n, animMpx: +an.toFixed(1), animN: na }; };
(async () => {
  const b = await boot();
  try {
    { const p = await open(b.br, b.base, 390, 763, '?nomusic=1', 0, true, () => { localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); });
      await p.evaluate(() => { FOOT.start('zeil'); }); await sleep(T);
      const r = await p.evaluate(`(${MPX})()`), miss = await p.evaluate(() => JSON.stringify(FOOT.q && FOOT.q.miss));
      console.log('street  after', T / 1000, 's:', JSON.stringify(r), 'FQ.miss', miss, 'errors', p.errs.length); await p.context().close(); }
    { const p = await open(b.br, b.base, 390, 763, '?nomusic=1', 0, true);
      await p.evaluate(() => __mnr.startStory(1)); await sleep(T);
      const r = await p.evaluate(`(${MPX})()`); console.log('stage1  after', T / 1000, 's:', JSON.stringify(r), 'errors', p.errs.length); await p.context().close(); }
  } finally { await b.close(); }
})();
