// FLYLOOK shots (W201): flight stage 1 at 5, 20, 40 s of game time (real time: the waves run on the song's bar clock and need the pictures, so this cannot be stepped; god mode), phone 390x763 and PC 1440x860.
// Usage: node qa/flylook-shots.js <out dir> [query]   (env PAGE=index.html)
const { boot, open, sleep } = require('./lib.js');
const OUT = process.argv[2], Q = process.argv[3] || '';
(async () => { const b = await boot(); try { for (const [W, H, dev] of [[390, 763, 'phone'], [1440, 860, 'pc']]) {
  const q = await open(b.br, b.base.replace('index.html', process.env.PAGE || 'index.html'), W, H, '?x=1' + Q, { mnr_tut: '2' }, W < 500);
  await q.evaluate(async () => { let sd = 7; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const m = __mnr; m.RET.tale = false; for (let i = 0; i < 150 && (!m.ART.paintReady(0) || m.ART.pend > 0); i++) await new Promise(r => setTimeout(r, 100));
    if (m.running) m.abort(); m.startStory(1); for (let i = 0; i < 100 && !m.running; i++) await new Promise(r => setTimeout(r, 100)); m.god = true; if (!m.running) throw new Error('run did not start'); });
  let t = 0; for (const T of [5, 20, 40]) { await q.waitForFunction(T => __mnr.G.t >= T || !__mnr.running, T, { timeout: 150000, polling: 50 }); await q.screenshot({ path: `${OUT}/fly-${T}s-${dev}.png` }); }
  console.log(dev, q.errs.length ? 'ERR ' + q.errs[0] : 'ok'); await q.context().close(); } } finally { await b.close(); } })();
