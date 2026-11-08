// A full game by touch as a new player (W500 gameplay gate): fresh storage, Play from the title, then only visible, uncovered taps
// (keep matching dice, roll, smash, buy an affordable card, stay/yield, end turn) until the result screen. Fails on any page error or a stuck screen.
// Usage: node game-walk.js [w] [h] [shotsDir]    shots: first-turn.png, mid-game.png, result.png
const L = require('./playable/lib.js'), path = require('path'), fs = require('fs'), http = require('http');
const [W, H, SH] = [+process.argv[2] || 390, +process.argv[3] || 844, process.argv[4]];
const FILE = path.join(__dirname, 'kot2.html'), LIVE = path.resolve(__dirname, '../../games/crown-city-smash');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u === '/' ? FILE : path.join(LIVE, u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d) }) });
(async () => {
  await new Promise(r => srv.listen(0, r)); const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await L.launch(), { p } = await L.open(b, W, H, url), shot = async n => { if (SH) await p.screenshot({ path: `${SH}/${n}.png` }) };
  if (!await L.tapSel(p, '[data-start="solo"]')) throw new Error('no Play button');
  await L.sleep(2000);
  let taps = 0, idle = 0, buys = 0; const t0 = Date.now(), done = {};
  while (Date.now() - t0 < 480000) {
    const st = await p.evaluate(() => typeof G !== 'undefined' && G ? { w: G.winner, me: G.active === G.pl.findIndex(q => q.human), ph: G.phase, rolls: G.rolls, tid: G.tid, vp: Math.max(...G.pl.map(q => q.vp)), dead: G.pl.filter(q => !q.alive).length, choice: !!UI.choice, intro: !!UI.intro, dice: G.dice.map(d => d.f + (d.k ? '*' : '')) } : null);
    if (st && st.w) break;
    let a = null;
    if (st && st.me && !st.choice && !st.intro && st.ph === 'roll' && st.dice.length && st.rolls > 0) {
      if (!done.first) { done.first = 1; await L.sleep(800); await shot('first-turn') }
      // keep the dice a new player would: numbers with a pair or more, claws and energy
      const want = st.dice.map((d, i) => { const f = d[0], n = st.dice.filter(x => x[0] === f).length; return (!d.includes('*') && ((/[123]/.test(f) && n >= 2) || f === 'C' || f === 'E')) ? i : -1 }).filter(i => i >= 0);
      for (const i of want) if (await L.tapSel(p, `#dice .die[data-die="${i}"]`)) { taps++; await L.sleep(250) }
    }
    if (st && st.me && !st.choice && st.ph === 'buy' && buys < 40) {
      const k = await p.evaluate(() => { const q = G.pl[G.active]; for (let i = 0; i < G.market.length; i++) if (canBuy(q, i)) return i; return -1 });
      if (k >= 0 && await L.tapSel(p, `#pshop [data-shop="${k}"], #buymini [data-card="${k}"]`)) { await L.sleep(400); await L.tapSel(p, `#obcard.on [data-obbuy="${k}"], #pshop [data-shop="${k}"], #buymini [data-card="${k}"]`); buys++; taps += 2; await L.sleep(900); continue }
      buys = 99;
    }
    if (st && st.me && st.ph === 'roll' && st.rolls === 2) buys = 0;
    if (st && !done.mid && (st.vp >= 9 || st.dead) ) { done.mid = 1; await L.sleep(600); await shot('mid-game') }
    a = await L.step(p);
    if (a) { idle = 0; taps++ } else { idle++; await L.sleep(250) }
    if (idle > 400) { console.log('FAIL game-walk stuck: no tappable control for 100 s'); break }
    await L.sleep(120);
  }
  await L.sleep(3000); const w = await p.evaluate(() => typeof G !== 'undefined' && G && G.winner); await shot('result');
  const ok = !!w && !p.errs.length;
  console.log((ok ? 'PASS' : 'FAIL') + ` game-walk ${W}x${H} winner=${w} taps=${taps} errors=${p.errs.length} ` + p.errs.slice(0, 3).join(' | '));
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})().catch(e => { console.log('FAIL game-walk', e.message); process.exit(1) });
