// Addendum 7 check: PLAY (Hints off, the default) is clean: no preview, no coach bubble, no banner, no rating, no board marks, no finger; Hints on shows the preview.
// Usage: CHR=.. node clean.js <url> <w> <h> [shotsDir]
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 763, process.argv[5]];
(async () => {
  const b = await L.launch(), { p } = await L.open(b, W, H, url); const bad = [];
  await L.tapSel(p, '[data-start="solo"]'); await L.sleep(1500); await p.evaluate(() => { AIDELAY = 250 });
  const snap = () => p.evaluate(() => ({ prev: !!document.querySelector('#pppreview.on'), bub: !!document.querySelector('.gxh-bub.on'), ban: !!document.querySelector('#ccbanner.on'), marks: !!(document.querySelector('#bmarks') && document.querySelector('#bmarks').getClientRects().length), what: (document.querySelector('#ppwhat') || {}).style && document.querySelector('#ppwhat').style.display === 'block', rate: /GOOD|OKAY|POOR/.test((document.querySelector('#pppop.on') || {}).textContent || ''), coach: !!document.querySelector('#ppcoach.on'), hints: document.documentElement.classList.contains('pp-hints') }));
  let sawRoll = 0, offBad = {}, turns = 0;
  for (let i = 0; i < 500 && sawRoll < 6; i++) {
    const st = await p.evaluate(() => ({ me: G.pl.findIndex(x => x.human), a: G.active, ph: G.phase, w: !!G.winner, intro: !!UI.intro, ch: !!UI.choice }));
    if (st.w) break;
    const s = await snap(); for (const k of ['prev', 'bub', 'ban', 'marks', 'what', 'rate', 'coach', 'hints']) if (s[k]) offBad[k] = 1;
    if (st.a === st.me && st.ph === 'roll' && !st.intro && !st.ch) { sawRoll++; if (sawRoll === 3 && SH) await p.screenshot({ path: `${SH}/play-clean-${W}.png` }) }
    await L.step(p); await L.sleep(150);
  }
  if (Object.keys(offBad).length) bad.push('Play mode showed: ' + Object.keys(offBad).join(','));
  for (let k = 0; k < 20 && !(await p.evaluate(() => document.documentElement.classList.contains('pp-hints'))); k++) { await L.tapSel(p, '#bulbbtn'); await L.sleep(400); await L.step(p) }
  let onSeen = false;
  for (let i = 0; i < 400 && !onSeen; i++) { const st = await p.evaluate(() => ({ me: G.pl.findIndex(x => x.human), a: G.active, ph: G.phase, w: !!G.winner })); if (st.w) break; const s = await snap(); if (s.prev && s.hints) { onSeen = true; if (SH) await p.screenshot({ path: `${SH}/hints-on-${W}.png` }) } await L.step(p); await L.sleep(150) }
  if (!onSeen) bad.push('Hints on never showed the preview');
  if (p.errs.length) bad.push('errors ' + p.errs[0]);
  console.log((bad.length ? 'FAIL' : 'PASS') + ` play-clean ${W}x${H}` + (bad.length ? ' :: ' + bad.join('; ') : ''));
  await b.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('FAIL clean', e.message); process.exit(1) });
