// Addendum 5 check (with Hints ON; Play mode must show none of it, see clean.js): the player SEES how they score. Plays a game by UI taps and asserts: the live preview shows on the player's roll with real text, the reason pop with a
// GOOD/OKAY/POOR line appears after a smash, a leader mark appears on the score strip once someone has stars. Usage: CHR=.. node score.js <url> <w> <h> [shotsDir]
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 763, process.argv[5]];
(async () => {
  const b = await L.launch(), { p } = await L.open(b, W, H, url); const seen = {};
  await L.tapSel(p, '[data-start="solo"]'); await L.sleep(1500); for (let k = 0; k < 20 && !(await p.evaluate(() => document.documentElement.classList.contains('pp-hints'))); k++) { await L.tapSel(p, '#bulbbtn'); await L.sleep(400); await L.step(p) }   // HINTS on (the bulb); off by default await p.evaluate(() => { AIDELAY = 250 });
  const t0 = Date.now();
  while (Date.now() - t0 < 200000 && !(seen.pv && seen.pop && seen.lead)) {
    const st = await p.evaluate(() => ({ w: !!G.winner, pv: (document.querySelector('#pppreview.on') || {}).textContent || '', pop: (document.querySelector('#pppop.on') || {}).textContent || '', lead: !!document.querySelector('#pchips .pchip.lead, #ppstand span.lead') }));
    if (st.w) break;
    if (st.pv && !seen.pv) { seen.pv = st.pv; if (SH) await p.screenshot({ path: `${SH}/score-preview-${W}.png` }) }
    if (st.pop && !seen.pop) { seen.pop = st.pop; await L.sleep(500); if (SH) await p.screenshot({ path: `${SH}/score-pop-${W}.png` }) }
    if (st.lead && !seen.lead) { seen.lead = 1; if (SH) await p.screenshot({ path: `${SH}/score-lead-${W}.png` }) }
    await L.step(p); await L.sleep(120);
  }
  const bad = []; if (!seen.pv) bad.push('no live preview'); if (!seen.pop) bad.push('no reason pop'); else if (!/(GOOD|OKAY|POOR) turn/.test(seen.pop)) bad.push('no rating line: ' + seen.pop.slice(0, 80)); if (!seen.lead) bad.push('no leader mark');
  if (p.errs.length) bad.push('errors ' + p.errs[0]);
  console.log((bad.length ? 'FAIL' : 'PASS') + ` score-visible ${W}x${H} preview="${String(seen.pv).slice(0, 60)}" pop="${String(seen.pop).replace(/\s+/g, ' ').slice(0, 80)}"` + (bad.length ? ' :: ' + bad.join('; ') : ''));
  await b.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('FAIL score', e.message); process.exit(1) });
