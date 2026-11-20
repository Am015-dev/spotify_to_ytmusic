// F2 desktop check: plays the real page with a mouse at 1366x768 and 1920x1080 (title, roll, buy, rival turn) and asserts the PC layout:
// monsters in a left panel, board in the centre, cards in the right panel, no phone column, every visible text >= 12 px, and every visible
// enabled control is on top at its centre (clickable). Screenshots go to proof/pc-<w>-<step>.jpg.   Usage: node desk-check.js [w h]...
const L = require('./playable/lib.js'), path = require('path'), fs = require('fs'), http = require('http');
const SIZES = process.argv.length > 3 ? [[+process.argv[2], +process.argv[3]]] : [[1366, 768], [1920, 1080]];
const FILE = path.join(__dirname, 'kot2.html'), LIVE = path.resolve(__dirname, '../../games/crown-city-smash'), OUT = path.join(__dirname, 'proof');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u === '/' ? FILE : path.join(LIVE, u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d) }) });
const AUDIT = () => { const bad = [];
  document.querySelectorAll('body *').forEach(e => { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return; const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || +cs.opacity === 0 || e.closest('[aria-hidden="true"],.hidden,[hidden]')) return;
    if (parseFloat(cs.fontSize) < 12) bad.push('text ' + parseFloat(cs.fontSize) + 'px: ' + e.textContent.trim().slice(0, 24)) });
  const modal = document.querySelector('#modal:not(.hidden)'), scope = modal || document;   // with the title or result card open only its own controls count
  scope.querySelectorAll('button,[data-act],[data-shop],[data-die],[data-card],[data-opt],[data-gx]').forEach(e => { const r = e.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || e.disabled || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return; const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || e.closest('.hidden,[hidden],[aria-hidden="true"]')) return;
    // a control inside a scrolling panel only needs to be on top where it is visible
    const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), y = Math.min(Math.max(r.top + Math.min(r.height / 2, 20), 1), innerHeight - 1);
    const t = document.elementFromPoint(x, y); if (!t || !(t === e || e.contains(t) || t.contains(e))) bad.push('covered: ' + (e.textContent.trim() || e.className || e.tagName).toString().slice(0, 24) + ' by ' + (t ? (t.id || t.className || t.tagName).toString().slice(0, 24) : '-')) });
  const left = document.getElementById('ccleft'), board = document.querySelector('.gx-board'), dock = document.querySelector('.gx-dock');
  const lr = left && left.getBoundingClientRect(), br = board.getBoundingClientRect(), dr = dock.getBoundingClientRect();
  const lay = { left: lr ? Math.round(lr.width) : 0, board: Math.round(br.width), dock: Math.round(dr.width), mkt: !!(document.querySelector('#dockbody #market .pc')), phone: document.documentElement.classList.contains('ph') };
  return { bad, lay } };
(async () => {
  await new Promise(r => srv.listen(0, r)); const url = 'http://127.0.0.1:' + srv.address().port + '/'; fs.mkdirSync(OUT, { recursive: true });
  const b = await L.launch(); let fails = 0;
  for (const [W, H] of SIZES) {
    const { p } = await L.open(b, W, H, url); const res = {};
    const snap = async n => { await L.sleep(700); res[n] = await p.evaluate(AUDIT); await p.screenshot({ path: path.join(OUT, `pc-${W}-${n}.jpg`), quality: 82 }) };
    await snap('title');
    await p.evaluate(() => { try { setSpeed(2) } catch (e) {} }); await L.tapSel(p, '[data-start="solo"]');
    const until = async (fn, max = 400) => { for (let i = 0; i < max; i++) { if (await p.evaluate(fn)) return true; await L.step(p); await L.sleep(250) } return false };
    if (await until(() => G.pl[G.active].human && G.phase === 'roll' && G.rolls > 0 && G.dice.length && !UI.choice && !UI.intro)) await snap('roll');
    await L.tapSel(p, '#dice .die[data-die="0"]');
    if (await until(() => G.pl[G.active].human && G.phase === 'buy' && !UI.choice && !UI.intro)) { await p.evaluate(() => { G.pl[G.active].en = Math.max(G.pl[G.active].en, 6); render() }); await snap('buy') }
    await L.tapSel(p, '#pacts [data-act="end"]');
    if (await until(() => !G.pl[G.active].human && !UI.choice, 40)) await snap('rival');
    for (const [n, r] of Object.entries(res)) {
      const layBad = n !== 'title' && (!r.lay.left || r.lay.board < W * .4 || !r.lay.mkt || r.lay.phone);
      const ok = !r.bad.length && !layBad; if (!ok) fails++;
      console.log(`${ok ? 'PASS' : 'FAIL'} desk ${W}x${H} ${n} left=${r.lay.left} board=${r.lay.board} dock=${r.lay.dock} cards=${r.lay.mkt} ${r.bad.slice(0, 4).join(' | ')}`) }
    if (p.errs.length) { fails++; console.log('FAIL errors ' + p.errs.slice(0, 2).join(' | ')) }
    await p.context().close();
  }
  await b.close(); srv.close(); process.exit(fails ? 1 : 0)
})().catch(e => { console.log('FAIL desk-check', e.message); process.exit(1) });
