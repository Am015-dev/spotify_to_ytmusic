// Clarity checks from the blind playtests (Oct 2026). node clarity-test.js [WxH]   prints "FAIL <check>" lines, then PROBLEMS n
// Each check reproduces something a blind tester hit: it failed on the build they played and must pass now.
//  goal     the landing conditions and the route are on screen during placement (testers lost on rules they never saw)
//  deadly   a die that would end the flight at once (collision) is marked and the first tap only warns
//  coffee   the coffee + button does not move after a press (the second + landed on -)
//  recap    the round summary has a real close button
//  tipsoff  "No more tips" survives "Fly again" after the guided flight (which then becomes a normal flight with new dice)
//  rrwho    when the crewmate spends a reroll token, the prompt says who did it and what to do
//  hint     the Hint reason is visible on screen (it was pushed below the fold)
const PW = (() => { try { return require('playwright'); } catch (e) { return require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); } })();
const fs = require('fs'), path = require('path'); const HERE = __dirname, OUT = path.join(HERE, 'shots', 'clarity'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'final-approach.html'));
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number);
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const fail = (c, d) => { bad++; console.log('FAIL', c, d || ''); }, ok = c => console.log('ok', c);
  await p.goto('http://gns.test/'); await p.waitForTimeout(1500);
  // a vs-computer flight with the computer switched off, so the page state is ours to set
  const fresh = () => p.evaluate(() => { UI.prefs.story = false; UI.prefs.guide = 'off'; newGame('vs', { scenario: 'g1', role: 0, level: 'normal' }); clearTimeout(UI.tm); G.ai = [null, null];
    FA.performMove(G, { t: 'ready' }, 0); FA.performMove(G, { t: 'ready' }, 1); G.turn = 0; hideRecap(); render(); });
  const inView = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden || e.closest('[hidden]')) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || !r.height) return false;
    const x = r.left + Math.min(r.width / 2, 20), y = r.top + Math.min(r.height / 2, 10), t = document.elementFromPoint(x, y); return r.top >= 0 && r.bottom <= innerHeight + 1 && !!t && (t === e || e.contains(t) || t.contains(e)); }, sel);

  // goal: route + landing conditions visible while placing (no tap needed)
  await fresh();
  { const g = await inView('#goal'), t = await p.evaluate(() => { const e = document.querySelector('#goal'); return e ? e.innerText : ''; });
    if (!g || !/Gear/.test(t) || !/Flaps/.test(t) || !/Brake/.test(t) || !/[Aa]irport/.test(t)) fail('goal', JSON.stringify({ g, t })); else ok('goal'); }
  await p.screenshot({ path: path.join(OUT, `${W}x${H}_goal.png`) });

  // deadly: a plane on the plane's own space, the crewmate's 6 on the engines; the pilot's 6 makes 12 = two spaces = collision
  await fresh();
  { const r = await p.evaluate(() => { G.planes[G.pl.pos - 1] = 1; G.slots.en1 = { s: 1, v: 6, k: 'd' }; G.dice[1][0].u = true; G.dice[0].forEach((d, i) => d.v = [6, 1, 1, 1][i]); G.turn = 0; UI.sel = 0; UI.cof = 0; render();
      const b = document.querySelector('.slot[data-slot=en0]'), marked = b.classList.contains('deadly'), txt = document.querySelector('#selinfo').innerText; b.click(); const first = !!G.slots.en0;
      return { marked, first, txt }; });
    await p.screenshot({ path: path.join(OUT, `${W}x${H}_deadly.png`) });
    if (!r.marked || r.first || !/collision|crash/i.test(r.txt)) fail('deadly', JSON.stringify(r)); else ok('deadly'); }

  // coffee: the + button keeps its place after a press
  await fresh();
  { const r = await p.evaluate(() => { G.coffee = 2; G.dice[0][0].v = 3; UI.sel = 0; UI.cof = 0; render(); const plus = () => [...document.querySelectorAll('#selinfo [data-a=cof]')].pop();
      const a = plus().getBoundingClientRect(); plus().click(); const b = plus().getBoundingClientRect(); return { a: [a.left, a.top], b: [b.left, b.top], cof: UI.cof }; });
    if (r.cof !== 1 || Math.abs(r.a[0] - r.b[0]) > 1 || Math.abs(r.a[1] - r.b[1]) > 1) fail('coffee', JSON.stringify(r)); else ok('coffee'); }

  // recap: a real close button
  await fresh();
  { const r = await p.evaluate(() => { showRecap(0); const e = document.querySelector('#recap button'); if (!e) return { btn: false }; e.click(); return { btn: true, closed: document.querySelector('#recap').hidden }; });
    if (!r.btn || !r.closed) fail('recap', JSON.stringify(r)); else ok('recap'); }

  // rrwho: the crewmate spends a reroll token
  await fresh();
  { const r = await p.evaluate(() => { G.rrHand = 1; G.turn = 1; commit(1, { t: 'rr' }); clearTimeout(UI.tm); render(); return { pr: document.querySelector('#barprompt').innerText + ' | ' + document.querySelector('#prompt').innerText, si: document.querySelector('#selinfo').innerText, btn: [...document.querySelectorAll('#acts button')].map(b => b.innerText).join(',') }; });
    if (!/Ravi/.test(r.pr + r.si) || !/Keep/.test(r.btn)) fail('rrwho', JSON.stringify(r)); else ok('rrwho'); }

  // hint: the reason is visible on screen
  await fresh();
  { const r = await p.evaluate(() => { document.querySelector('#acts [data-a=hint]').click(); const w = document.querySelector('#selinfo .why'); return { has: !!w, txt: w ? w.innerText : '' }; });
    const v = r.has && await inView('#selinfo .why'); await p.screenshot({ path: path.join(OUT, `${W}x${H}_hint.png`) });
    if (!v) fail('hint', JSON.stringify(r)); else ok('hint'); }

  // tipsoff: guided flight, "No more tips", then "Fly again"
  { const r = await p.evaluate(() => { UI.prefs.guide = 'full'; newGame('guided'); clearTimeout(UI.tm); const off = document.querySelector('#pc [data-a=tipoff]'); if (!off) return { off: false }; off.click();
      const a = document.createElement('button'); a.dataset.a = 'again'; document.body.appendChild(a); a.click(); a.remove(); clearTimeout(UI.tm); return { off: true, mode: UI.mode, level: UI.coach.level, tip: !document.querySelector('#pc').hidden }; });
    if (!r.off || r.level !== 'off' || r.tip || r.mode !== 'vs') fail('tipsoff', JSON.stringify(r)); else ok('tipsoff'); }

  // deadline: the goal names the real deadline (on the airport when the last round starts), not "land in round 7"
  await fresh();
  { const t = await p.evaluate(() => document.querySelector('#goal').innerText); if (!/airport by round 7/i.test(t) || /Land in round/.test(t)) fail('deadline', t); else ok('deadline'); }
  // rr2tap: the Reroll button explains first and spends on the second tap
  await fresh();
  { const r = await p.evaluate(() => { G.rrHand = 1; render(); const b = () => document.querySelector('#acts [data-a=rr]'); b().click(); const after1 = G.rrHand; b().click(); return { after1, after2: G.rrHand }; });
    if (r.after1 !== 1 || r.after2 !== 0) fail('rr2tap', JSON.stringify(r)); else ok('rr2tap'); }
  // phrases: during the briefing every phrase button is on screen and tappable (they were under the Roll bar)
  { const r = await p.evaluate(() => { UI.prefs.story = false; newGame('vs', { scenario: 'g1', role: 0, level: 'normal' }); clearTimeout(UI.tm); G.ai = [null, 'normal']; render();
      const bs = [...document.querySelectorAll('#says button')]; return { n: bs.length, off: bs.filter(b => { const q = b.getBoundingClientRect(), t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return q.bottom > innerHeight || !(t === b || b.contains(t)); }).map(b => b.innerText) }; });
    await p.screenshot({ path: path.join(OUT, `${W}x${H}_brief.png`) });
    if (!r.n || r.n > 5 || r.off.length) fail('phrases', JSON.stringify(r)); else ok('phrases'); }
  if (errs.length) fail('page errors', errs.slice(0, 3).join(' | '));
  console.log('PROBLEMS', bad); await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
