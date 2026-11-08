// W467 game-feel shots: title, Learn first screen, Goal card, first turn, rival turn, mid-game, result. UI taps only (touch on phone).
// Usage: node feel.js <url> <w> <h> <shotsDir>   -> prints PASS/FAIL plus small-text / overlap findings
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 844, process.argv[5]];
const shot = (p, n) => { console.error('shot', n, Math.round(process.uptime())); return SH ? p.screenshot({ path: `${SH}/${n}-${W}x${H}.png`, timeout: 90000 }).catch(e => console.log('shot fail', n)) : 0 };
const st = p => p.evaluate(() => ({ me: G.pl.findIndex(x => x.human), a: G.active, ph: G.phase, w: !!G.winner, intro: !!UI.intro, ch: !!UI.choice, turn: G.turn, dice: G.dice.length }));
// visible text under 14px, and visible text boxes that overlap each other
const lint = p => p.evaluate(() => {
  const small = new Set(), boxes = [], seen = new Set(), tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const e = n.parentElement; if (!e || seen.has(e) || !n.textContent.trim()) continue; seen.add(e);
    if (e.closest('svg,script,style,noscript') || !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); if (!t || !(t === e || e.contains(t) || t.contains(e))) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize); if (fs > 0 && fs < 14) small.add(fs + 'px "' + e.textContent.trim().slice(0, 18) + '"');
    boxes.push([r, e]);
  }
  const ov = []; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const [a, ea] = boxes[i], [b, eb] = boxes[j]; if (ea.contains(eb) || eb.contains(ea)) continue; const x = Math.min(a.right, b.right) - Math.max(a.left, b.left), y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (x > 4 && y > 4) ov.push(ea.textContent.trim().slice(0, 14) + ' / ' + eb.textContent.trim().slice(0, 14)) }
  return { small: [...small].slice(0, 8), ov: ov.slice(0, 6) };
});
(async () => {
  console.error('launch'); const b = await L.launch(); console.error('open'); let { p, ctx } = await L.open(b, W, H, url); console.error('opened'); const bad = [], notes = [];
  await shot(p, '1-title'); const lt = await lint(p); if (lt.small.length) notes.push('title small: ' + lt.small.join(', '));
  if (await L.tapSel(p, '#title button, .title button, button', { text: '^New here' })) { await L.sleep(2500); await shot(p, '2-learn'); const l2 = await lint(p); if (l2.small.length) notes.push('learn small: ' + l2.small.join(', ')) } else bad.push('no Learn button');
  await ctx.close(); ({ p, ctx } = await L.open(b, W, H, url));
  await L.tapSel(p, '[data-start="solo"]'); await L.sleep(1800); await shot(p, '3-goal');
  const g = await lint(p); if (g.small.length) notes.push('goal small: ' + g.small.join(', ')); if (g.ov.length) bad.push('goal overlap: ' + g.ov.join('; '));
  const broken = await p.evaluate(() => [...document.querySelectorAll('img')].filter(i => i.getClientRects().length && i.complete && !i.naturalWidth).length); if (broken) bad.push(broken + ' broken image(s)');
  await L.step(p); await L.sleep(1500); let s = await st(p);
  let first = 0; if (s.a === s.me && s.ph === 'roll') { first = 1; await shot(p, '4-first-turn'); const f = await lint(p); if (f.small.length) notes.push('turn small: ' + f.small.join(', ')); if (f.ov.length) bad.push('turn overlap: ' + f.ov.join('; ')) }
  let rival = 0, mid = 0; const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    s = await st(p); if (s.w) break;
    if (!first && s.a === s.me && s.ph === 'roll' && s.dice && !s.intro && !s.ch) { first = 1; await L.sleep(600); await shot(p, '4-first-turn') }
    if (!rival && s.a !== s.me && s.dice && s.ph === 'roll') { await L.sleep(900); await shot(p, '5-rival-turn'); rival = 1 }
    if (!mid && s.turn >= 5 && s.a === s.me && s.ph === 'roll' && !s.intro && !s.ch) { await L.sleep(600); await shot(p, '6-mid-game'); mid = 1; const m = await lint(p); if (m.small.length) notes.push('mid small: ' + m.small.join(', ')); if (m.ov.length) bad.push('mid overlap: ' + m.ov.join('; ')); await p.evaluate(() => { AIDELAY = 60 }) }
    if (!(await L.step(p))) await L.sleep(250); else await L.sleep(150);
  }
  s = await st(p); if (!s.w) bad.push('no winner in 300 s (turn ' + s.turn + ')'); else { await L.sleep(2500); await shot(p, '7-result') }
  if (!rival) bad.push('no rival turn seen'); if (!mid && s.turn >= 5) bad.push('no mid shot');
  if (p.errs.length) bad.push('errors ' + p.errs[0]);
  console.log((bad.length ? 'FAIL' : 'PASS') + ` feel ${W}x${H}` + (bad.length ? ' :: ' + bad.join('; ') : '')); for (const n of notes) console.log('  note ' + n);
  await b.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('FAIL feel', e.message); process.exit(1) });
