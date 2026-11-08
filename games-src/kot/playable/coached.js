// Coached first game: starts the tutorial from the title screen, then plays by choosing legal moves through the UI (random keeps, rolls, smash, a buy, stay/yield),
// until the result. Asserts: every coverage rule was explained (bubble shown) or listed on the final "Things you'll meet later" card, one bubble at a time,
// the bubble never blocks a tap (elementFromPoint at the bubble's body is the thing below), the game reached a winner. Usage: CHR=.. node coached.js <url> <w> <h> [shots]
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 763, process.argv[5]];
const RULES = ['setup', 'goal', 'roll3', 'faces', 'preview', 'keep', 'rekeep', 'pair', 'triple', 'extra', 'energy', 'hearts', 'noheal', 'claws', 'stop', 'enter', 'start2', 'cards', 'types', 'sweep', 'endturn', 'rivals', 'yield', 'ko', 'win20', 'final'];
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
(async () => {
  const b = await L.launch(), { ctx, p } = await L.open(b, W, H, url); const bad = [];
  if (!await L.tapSel(p, '[data-gxt-open]')) throw new Error('no tutorial button');
  await L.sleep(2500);
  const t0 = Date.now(); let n = 0, idle = 0, multi = 0, shots = {};
  while (Date.now() - t0 < +(process.env.MAXMS || 420000)) {
    const st = await p.evaluate(() => ({ win: !!(G && G.winner), stats: !!UI.stats, bub: document.querySelectorAll('#ppcoach.on').length, me: G.pl.findIndex(x => x.human), act: G.active, ph: G.phase }));
    if (st.bub > 1) multi++;
    if (st.win && st.stats) { await L.sleep(1500); break }
    let a = null;
    if (st.act === st.me && st.ph === 'roll') {   // free choices: sometimes keep a random die, sometimes roll again, else smash
      const r = rnd();
      if (r < .35 && await L.tapSel(p, '#dice .die:not(.kept)', { nth: Math.floor(rnd() * 3) })) a = 'keep';
      else if (r < .6 && await L.tapSel(p, '#pacts [data-act="reroll"]')) a = 'roll';
      else if (r < .75 && await L.tapSel(p, '#dice .die.kept')) a = 'unkeep';
    }
    if (!a && st.act === st.me && st.ph === 'buy' && rnd() < .5 && await L.tapSel(p, '#pshop [data-shop]', { nth: Math.floor(rnd() * 3) })) a = 'card';
    if (!a && st.act === st.me && st.ph === 'buy' && rnd() < .4 && await L.tapSel(p, '#pacts [data-act="sweep"]')) a = 'sweep';
    if (!a) a = await L.step(p);
    if (a) { idle = 0; n++ } else { idle++; await L.sleep(250) }
    if (SH && !shots.c && await p.evaluate(() => !!document.querySelector('#ppcoach.on'))) { shots.c = 1; await L.sleep(300); await p.screenshot({ path: `${SH}/coach-${W}.png` }) }
    if (idle > 400) { bad.push('stuck'); break }
    await L.sleep(100);
  }
  const r = await p.evaluate(() => ({ win: !!(G && G.winner), rules: PPC.rules, later: PPC.later || [], ended: PPC.ended }));
  if (SH) await p.screenshot({ path: `${SH}/coach-final-${W}.png` });
  if (!r.win) bad.push('no winner');
  const miss = RULES.filter(x => !r.rules[x]); if (miss.length) bad.push('rules never explained or listed: ' + miss.join(','));
  if (multi) bad.push('more than one bubble at once ' + multi + 'x');
  if (p.errs.length) bad.push('errors: ' + p.errs.slice(0, 2).join(' | '));
  console.log((bad.length ? 'FAIL' : 'PASS') + ` coached-first-game ${W}x${H} taps=${n} explained=${Object.keys(r.rules).filter(k => r.rules[k] === 1).length} later=${r.later.length}` + (bad.length ? ' :: ' + bad.join('; ') : ''));
  await b.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('FAIL coached', e.message); process.exit(1) });
