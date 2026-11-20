// Touch-driven newcomer bench (F2): plays the real page at phone size with touchscreen taps only, like a first-timer
// without hints: keeps obvious sets (pairs and triples), claws and energy, hearts when low outside Downtown, buys a card
// it can afford most of the time, yields when low most of the time, and sometimes misjudges (a wrong keep, an early stop).
// Usage: node touch-bench.js [games=6] [parallel=3] [w=375] [h=667]    prints one line per game and the win/KO rate.
// Env: SEED0 (policy randomness), BENCH_H2 (second height, games alternate sizes), MAXMS per game.
const L = require('./playable/lib.js'), path = require('path'), fs = require('fs'), http = require('http');
const [N, PAR, W, H] = [+process.argv[2] || 6, +process.argv[3] || 3, +process.argv[4] || 375, +process.argv[5] || 667];
const H2 = +process.env.BENCH_H2 || H;
const FILE = path.join(__dirname, 'kot2.html'), LIVE = path.resolve(__dirname, '../../games/crown-city-smash');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u === '/' ? FILE : path.join(LIVE, u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d) }) });
// small seeded rng so a bench run can be repeated
const rng = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 };
// tap like a finger: the centre of the first visible, uncovered match
async function tap(p, sel, opt = {}) {
  const pt = await p.evaluate(({ sel, text }) => { for (const e of document.querySelectorAll(sel)) {
      const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || e.disabled || e.getAttribute('aria-disabled') === 'true') continue;
      if (text && !new RegExp(text, 'i').test(e.textContent)) continue;
      const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      const t = document.elementFromPoint(x, y); if (!t || !(t === e || e.contains(t) || t.contains(e))) continue; return [x, y] } return null }, { sel, text: opt.text });
  if (!pt) return false; await p.touchscreen.tap(pt[0], pt[1]); return true }
async function game(b, url, gi, w, h) {
  const R = rng((+process.env.SEED0 || 7) * 1000 + gi);
  let o = null; for (let t = 0; t < 3 && !o; t++) try { o = await L.open(b, w, h, url) } catch (e) { if (t === 2) throw e }
  const { p, ctx } = o;
  // BENCH_FAST=1: the computer plays at the Fast speed setting (same rules and AI, shorter waits) so a bench takes minutes, not an hour
  if (process.env.BENCH_FAST) await p.evaluate(() => { try { setSpeed(2) } catch (e) {} });
  if (!await tap(p, '[data-start="solo"]')) throw new Error('no Play button');
  await L.sleep(2000);
  const t0 = Date.now(), log = { yields: 0, stays: 0, buys: 0, slips: 0 }; let idle = 0, buys = 0, myTurn = -1, missT = 0;
  while (Date.now() - t0 < +(process.env.MAXMS || 600000)) {
    const st = await p.evaluate(() => typeof G !== 'undefined' && G ? { w: G.winner, me: G.active === G.pl.findIndex(q => q.human), ph: G.phase, rolls: G.rolls, turn: G.turn,
      choice: !!UI.choice, yld: !!(UI.choice && /^Stay or yield/.test(UI.choice.title || '')), hp: (G.pl.find(q => q.human) || {}).hp,
      city: inCity(G.pl.findIndex(q => q.human)), intro: !!UI.intro, dice: G.dice.map(d => d.f + (d.k ? '*' : '')), en: (G.pl.find(q => q.human) || {}).en,
      occ: [G.city, G.bay].filter(i => i >= 0).length } : null);
    if (st && st.w) break;
    if (st && st.me && !st.choice && !st.intro && st.ph === 'roll' && st.dice.length && st.rolls > 0) {
      if (myTurn !== st.turn) { myTurn = st.turn; buys = 0; missT = 0 }
      const cnt = f => st.dice.filter(x => x[0] === f).length;
      // what a first-timer keeps: number pairs/triples (often not 1s), energy, claws (when someone is hittable), hearts when hurt outside Downtown
      const want = st.dice.map((d, i) => { const f = d[0], n = cnt(f); if (d.includes('*')) return -1;
        const k = (/[23]/.test(f) && n >= 2) || (f === '1' && n >= 3) || f === 'E' || (f === 'C' && (st.city || st.occ)) || (f === 'H' && st.hp < 7 && !st.city);
        return k ? i : -1 }).filter(i => i >= 0);
      // misjudge now and then: forget one keep, or keep a stray die
      if (want.length && R() < .12) { want.splice(Math.floor(R() * want.length), 1); log.slips++ }
      else if (R() < .06) { const free = st.dice.map((d, i) => d.includes('*') || want.includes(i) ? -1 : i).filter(i => i >= 0); if (free.length) { want.push(free[Math.floor(R() * free.length)]); log.slips++ } }
      for (const i of want) if (await tap(p, `#dice .die[data-die="${i}"]`)) await L.sleep(220 + R() * 200);
      { const kept = await p.evaluate(() => G.dice.map((d, i) => d.k ? i : -1).filter(i => i >= 0)); const exp = st.dice.map((d, i) => d.includes('*') || want.includes(i) ? i : -1).filter(i => i >= 0);
        if (kept.join() !== exp.join()) { log.keepMiss = (log.keepMiss || 0) + 1; if (process.env.DBG) console.log('keepmiss', st.dice.join(','), 'want', exp.join(), 'got', kept.join()) } }
      const free = await p.evaluate(() => G.dice.filter(d => !d.k).length);
      // a newcomer mostly uses every roll; sometimes stops early when happy
      const kp = () => p.evaluate(() => [...document.querySelectorAll('#dice .die[data-die]')].filter(e => G.dice[+e.dataset.die] && G.dice[+e.dataset.die].k).map(e => { const r = e.getBoundingClientRect(); return e.dataset.die + G.dice[+e.dataset.die].f + '@' + Math.round(r.left / 6) + ',' + Math.round(r.top / 6) }).join(' '));
      const before = await kp();
      if (free && !(st.rolls === 1 && R() < .15) && await tap(p, '#pacts [data-act="reroll"]')) { await L.sleep(1100); const after = await kp(); if (before.split(' ').some(x => x && !after.split(' ').includes(x))) { log.moved = (log.moved || 0) + 1; if (process.env.MOVED_LOG) console.log('moved', before, '->', after) } continue }
      if (await tap(p, '#pacts [data-act="resolve"]')) { await L.sleep(900); continue }
    }
    if (st && st.yld) { const leave = st.hp <= 6 ? R() < .8 : R() < .1; if (await tap(p, '#choice:not(.hidden) [data-opt]', { text: leave ? 'yield' : 'stay' })) { log[leave ? 'yields' : 'stays']++; await L.sleep(300); continue } }
    if (st && st.me && !st.choice && st.ph === 'buy' && buys < 6) {
      const k = await p.evaluate(() => { const q = G.pl[G.active]; for (let i = 0; i < G.market.length; i++) if (canBuy(q, i)) return i; return -1 });
      log.shopSeen = (log.shopSeen || 0) + 1; if (k >= 0) log.affordable = (log.affordable || 0) + 1;
      // the shop is hidden while the dice resolve: wait for it rather than give up (a person waits too)
      const shown = k >= 0 && await p.evaluate(() => { const d = document.querySelector('[data-bf]'); return !(d && d.dataset.bf === 'resolving') });
      if (k >= 0 && !shown) { await L.sleep(300); continue }
      if (k >= 0 && (buys > 0 || R() < .75)) { const t1 = await tap(p, `#pshop [data-shop="${k}"], #buymini [data-card="${k}"]`); if (!t1) { log.shopMiss = (log.shopMiss || 0) + 1; if (process.env.DBG) console.log('shopmiss', await p.evaluate(k => { const e = document.querySelector(`#pshop [data-shop="${k}"]`); if (!e) return 'no tile'; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left) + ',' + Math.round(r.top) + ' top=' + (t ? t.id + '.' + t.className : '-') }, k)) }
        if (!t1 && (missT = (missT || 0) + 1) < 6) { await L.sleep(300); continue }
        if (t1) { await L.sleep(400); await tap(p, `#obcard.on [data-obbuy="${k}"], #pshop [data-shop="${k}"], #buymini [data-card="${k}"]`); buys++; log.buys++; await L.sleep(900); continue } }
      buys = 99;
    }
    if (process.env.DBG && st && st.me && st.ph !== 'roll') console.log('dbg', st.ph, st.choice, JSON.stringify(await p.evaluate(() => UI.choice ? [UI.choice.title, UI.choice.options.map(o => o.l)] : null)), 'buys', buys);
    const a = await (async () => { if (await tap(p, '.gxh-ok')) return 1;
      if (await tap(p, '#choice:not(.hidden) [data-opt]', { text: 'stay|keep|ok|continue|let|smash|start|begin|play' })) return 1;
      if (await tap(p, '#choice:not(.hidden) [data-opt]')) return 1;
      if (await tap(p, '#choice button', { text: "let.?s smash|begin|start|play|continue|close|ok" })) return 1;
      if (await tap(p, '#pacts [data-act="resolve"]')) return 1; if (await tap(p, '#pacts [data-act="reroll"]')) return 1;
      // End turn only once the shop was looked at (a newcomer never ends the turn while the dice are still resolving)
      if (st && st.me && st.ph === 'buy' && buys >= 6 && await tap(p, '#pacts [data-act="end"]')) return 1; return 0 })();
    if (a) idle = 0; else { idle++; await L.sleep(250) }
    if (idle > 400) { log.stuck = 1; break }
    await L.sleep(100);
  }
  await L.sleep(1500);
  const r = await p.evaluate(() => { const i = G.pl.findIndex(q => q.human), me = G.pl[i];
    return { won: G.winner === 'P' + (i + 1), ko: !me.alive, vp: me.vp, turn: G.turn, by: G.winner ? mname(P(+String(G.winner).slice(1) - 1) || me) : '-', final: G.pl.map(q => `${q.human ? 'YOU ' : ''}${mname(q)} ${q.vp}★ ${q.hp}♥${q.alive ? '' : ' KO'}`).join(' | ') } });
  const out = Object.assign(r, log, { gi, size: w + 'x' + h, errs: p.errs.length, min: ((Date.now() - t0) / 60000).toFixed(1) });
  console.log(`g${gi} ${out.size} ${r.won ? 'WON ' : 'lost'}${r.ko ? ' KO' : ''} · ${r.final} · yields ${log.yields} stays ${log.stays} buys ${log.buys}/${log.affordable || 0}/${log.shopSeen || 0} shopMiss ${log.shopMiss || 0} keepMiss ${log.keepMiss || 0} slips ${log.slips} keptMoved ${log.moved || 0}${log.stuck ? ' STUCK' : ''} errs ${out.errs}${out.errs ? " [" + p.errs.slice(0, 2).join(" | ") + "]" : ""} · ${out.min} min`);
  await ctx.close(); return out }
(async () => {
  await new Promise(r => srv.listen(0, r)); const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await L.launch(), res = []; let next = 0;
  await Promise.all(Array.from({ length: Math.min(PAR, N) }, async () => { while (next < N) { const gi = next++; try { res.push(await game(b, url, gi, W, gi % 2 ? H2 : H)) } catch (e) { console.log(`g${gi} ERROR ${e.message}`) } } }));
  const won = res.filter(r => r.won).length, ko = res.filter(r => r.ko).length;
  console.log(`TOUCH-BENCH easy newcomer: won ${won}/${res.length} (${Math.round(100 * won / Math.max(1, res.length))}%), KO'd ${ko}/${res.length}, errors ${res.reduce((a, r) => a + r.errs, 0)}`);
  await b.close(); srv.close(); process.exit(0) })().catch(e => { console.log('FAIL touch-bench', e.message); process.exit(1) });
