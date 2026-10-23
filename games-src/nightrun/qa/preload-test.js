#!/usr/bin/env node
// PRELOAD: a flight stage waits for its pictures and song (parts/art/preload.js). Slow network: every .webp / .mp3 is delayed 1.5 s, and the first request of
//   the player ship's flame sheet and of the stage song answers 503. PASS/FAIL lines only.
//   - the veil (#stageQ) shows, game time does not advance while it is up, it is gone within 8 s
//   - at the stage start the player ship, the first enemy sheets, the backdrop and the song are ready (ART.bm / TR.bufs), no page errors
//   - ?preload=0 (the old behaviour) is run too: it starts at once and prints how much was missing at that moment (before -> after)
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/preload-test.js     env: GAME_DIR
const { boot, sleep, ok, done, UA } = require('./lib.js');
const DELAY = 1500;
async function run(b, query, street) {
  const ctx = await b.br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, userAgent: UA, serviceWorkers: 'block' });
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 200)));
  const seen = {}; let songFile = null, n503 = 0;
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/\.(webp|mp3)(\?|$)/, async r => {
    const u = r.request().url(), k = u.replace(/\?.*/, ''); seen[k] = (seen[k] || 0) + 1; await sleep(DELAY);
    if (seen[k] === 1 && (/ship-std\/flame-strip\.webp$/.test(k) || (songFile && k.endsWith('/' + songFile)))) { n503++; return r.fulfill({ status: 503, body: 'busy' }); }
    return r.continue(); });
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); localStorage.setItem('mnr_tut', '2'); } catch (e) { } });
  await p.goto(b.base + query, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr && __mnr.TR && __mnr.TR.list.length && __mnr.ART.rd && __mnr.ART.rd.size, null, { timeout: 30000 });
  songFile = await p.evaluate(() => __mnr.TR.by[__mnr.ST.def.song].file.replace(/^.*\//, ''));
  await sleep(1500);
  if (street) { const q = await p.evaluate(async () => { const t0 = performance.now(); FOOT.stop && FOOT.stop(); FOOT.ui = 1; FOOT.start(FOOT.main || 'zeil'); let seen = false, gone = null, early = false;
      for (let i = 0; i < 400; i++) { await new Promise(r => setTimeout(r, 25)); if (i % 10 === 0 && !seen) { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); } const v = !!document.getElementById('footQ'); if (v) { seen = true; if (FOOT.on) early = true; } else if (seen) { gone = performance.now() - t0; break; } }
      const T = __mnr.TR; return { seen, gone, early, songs: ['stage2', 'street1'].filter(s => T.by[s]).map(s => !!T.bufs[T.by[s].file]) }; });
    q.errs = p.errs; await ctx.close(); return q; }
  const r = await p.evaluate(async () => {
    const m = __mnr, A = m.ART, out = { frames: [], veilSeen: false };
    const t0 = performance.now(); let veilGone = null, startedAt = null, tAtVeil = 0, advanced = false;
    m.startStory(1);
    for (let i = 0; i < 1200; i++) {
      await new Promise(r => setTimeout(r, 25));
      const v = !!document.getElementById('stageQ'), now = performance.now() - t0;
      if (v) { out.veilSeen = true; out.pct = document.getElementById('stageQ').textContent; if (m.running || m.ST.on || (m.G && m.G.live)) advanced = true; }
      if (!v && out.veilSeen && veilGone === null) veilGone = now;
      if (m.running && startedAt === null) { startedAt = now; break; } }
    const f = TR_file(); function TR_file() { const d = m.ST.def, i = m.TR.by[d.song]; return i && i.file; }
    const chk = (k) => !!A.anim(k), pic = n => !!A.bm[n];
    out.startedAt = startedAt; out.veilGone = veilGone; out.advanced = advanced; out.running = m.running;
    out.ship = chk('ship-std/flame') && chk('ship-std/death');
    out.enemy = chk('ship-edrone/flame');
    out.back = pic('bg-bankenviertel-phone') && pic('ly-far-bankenviertel') && pic('ly-mid-bankenviertel') && pic('bg-bankenviertel') !== undefined;
    out.song = !!(f && m.TR.bufs[f]); out.last = window.PRELOAD && window.PRELOAD.last;
    return out; });
  r.n503 = n503; r.errs = p.errs; await ctx.close(); return r;
}
(async () => {
  const b = await boot();
  try {
    const a = await run(b, '?preload=1');
    const sec = x => x == null ? 'n/a' : (x / 1000).toFixed(2) + ' s';
    console.log(`after : stage starts ${sec(a.startedAt)}, veil gone ${sec(a.veilGone)}, ${a.pct}, ship=${a.ship} enemy=${a.enemy} backdrop=${a.back} song=${a.song}, 503s served ${a.n503}`);
    ok('veil shown on a slow network', a.veilSeen);
    ok('game time did not advance while the veil was up', !a.advanced);
    ok('veil gone within 8 s', a.veilGone != null && a.veilGone <= 8200, sec(a.veilGone));
    ok('stage running after the veil', a.running === true);
    ok('player ship sheets ready at stage start', a.ship);
    ok('first enemy sheet ready at stage start', a.enemy);
    ok('backdrop layers ready at stage start', a.back);
    ok('song ready (TR.bufs) at stage start', a.song);
    ok('the 503s were really served (ship sheet + song) and retried', a.n503 >= 2, a.n503);
    ok('no page errors', !a.errs.length, a.errs.join(' | '));
    const st = await run(b, '?preload=1', true);
    console.log(`street: veil ${st.seen}, gone ${sec(st.gone)}, songs ready ${JSON.stringify(st.songs)}`);
    ok('street: veil shown, run not started under it', st.seen && !st.early);
    ok('street: veil gone within 8 s with its song(s) ready', st.gone != null && st.gone <= 8200 && st.songs.every(Boolean), JSON.stringify(st));
    ok('street: no page errors', !st.errs.length, st.errs.join(' | '));
    const o = await run(b, '?preload=0');
    console.log(`before: stage starts ${sec(o.startedAt)}, no veil (${o.veilSeen}), ship=${o.ship} enemy=${o.enemy} backdrop=${o.back} song=${o.song}`);
    ok('?preload=0 starts at once, without the veil', !o.veilSeen && o.running === true);
  } finally { await b.close(); }
  done('preload');
})();
