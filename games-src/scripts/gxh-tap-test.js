// gx-help touch hammer: every coach / bulb bubble must go away on ONE tap, whatever the timing.
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/gxh-tap-test.js [rounds=60] [390x844]
// A fake game page (no game code, only shell/gx-help.js + gx-help.css) calls GXH.phase() on every render AND from a 450 ms
// interval, like the shelf games do, while targets move, re-render and change phase. Touch taps land at random moments:
// before a bubble opens, during its open animation (0-180 ms), long after, right after a phase change (two bubbles in quick
// succession), on the bubble itself, on its Got it button, on the board, on the lightbulb. After every tap: no .gxh-bub may still be on screen
// 140 ms later, and no bubble may open later from a phase that was already pending when the user tapped (the tap answers it).
// Fails (exit 1) on any surviving bubble, any page error, or a bubble shown twice.
const PW = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path');
const SP = path.resolve(__dirname, '..');
const N = +(process.argv[2] || 60), [W, H] = (process.argv[3] || '390x844').split('x').map(Number);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const css = fs.readFileSync(path.join(SP, 'shell', 'gx-help.css'), 'utf8'), js = fs.readFileSync(path.join(SP, 'shell', 'gx-help.js'), 'utf8');
const PAGE = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}
body{margin:0;font:16px sans-serif;background:#2a1820;color:#fff;touch-action:manipulation}
.gx-bar{position:fixed;left:0;right:0;top:0;height:52px;background:#40242c;display:flex;align-items:center;gap:8px;padding:0 8px}
.gx-bar .ic{width:40px;height:40px;border-radius:8px;background:#6a3a44}
#board{position:absolute;left:0;right:0;top:60px;bottom:0}
.t{position:absolute;width:64px;height:64px;border-radius:10px;background:#8a5a30;border:0;color:#fff}
.t.glow{box-shadow:0 0 0 3px gold}</style></head><body>
<header class="gx-bar"><span class="ic" id="neutral"></span><b>Fake game</b><button id="bulbbtn" style="margin-left:auto;width:44px;height:44px">?</button></header>
<div id="board"></div>
<script>${js}</script>
<script>
  var PH = null, N = 0, ids = [];
  for (var i = 0; i < 12; i++) ids.push('p' + i);
  function render() {   // a game re-render: targets are rebuilt (new elements), sometimes moved, sometimes hidden
    var b = document.getElementById('board'); b.innerHTML = '';
    ids.forEach(function (id, k) {
      var e = document.createElement('button'); e.className = 't' + (k % 3 === 0 ? ' glow' : ''); e.id = id; e.textContent = id;
      var j = (k + N) % 12; e.style.left = (12 + (j % 4) * (window.innerWidth - 88) / 3) + 'px'; e.style.top = (20 + Math.floor(j / 4) * 150 + (N % 3) * 8) + 'px';
      if (window.__hide === id) e.hidden = true;
      b.appendChild(e);
    });
    GXH.phase(PH);
  }
  var steps = {};
  ids.forEach(function (id) { steps[id] = { target: function () { return document.getElementById(id); }, title: 'Step ' + id, text: 'Tap anywhere to close this tip.' }; });
  GXH.init({ game: 'gxh-tap-test', steps: steps, rules: [{ title: 'A', text: 'a' }, { title: 'B', text: 'b' }], avoid: '.glow' });
  GXH.bulb({ el: '#bulbbtn', suggest: function () { return { target: function () { return document.getElementById(ids[N % 12]); }, why: 'Try this one.' }; }, rulesFor: function () { return PH; } });
  setInterval(function () { GXH.phase(PH); }, 450);
  window.go = function (ph, move) { PH = ph; if (move) N++; render(); };
  window.bubs = function () { return [].slice.call(document.querySelectorAll('.gxh-bub')).map(function (e) { return (e.dataset.phase || 'bulb') + (e.classList.contains('on') ? '' : '(off)'); }); };
  render();
</script></body></html>`;
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA });
  const p = await ctx.newPage(); const errs = [], fails = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.setContent(PAGE);
  let rs = 7; const R = () => (rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296;
  const sleep = ms => p.waitForTimeout(Math.round(ms));
  const tap = async where => {
    const pt = await p.evaluate(w => {
      const c = e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
      const bub = document.querySelector('.gxh-bub.on');
      if (w === 'bubble' && bub) return c(bub.querySelector('.gxh-tx') || bub);
      if (w === 'ok' && bub && bub.querySelector('.gxh-ok')) return c(bub.querySelector('.gxh-ok'));
      if (w === 'board') return [innerWidth / 2, innerHeight - 20];
      if (w === 'bulb' && bub) return c(document.getElementById('bulbbtn'));   // with no help open, a bulb tap rightly opens the bulb help
      return c(document.getElementById('neutral'));
    }, where);
    await p.touchscreen.tap(pt[0], pt[1]);
  };
  const check = async tag => {
    await sleep(140); const l = await p.evaluate(() => bubs());
    if (l.length) fails.push(tag + ': bubble survived a tap (' + l.join() + ')');
    await sleep(500); const l2 = await p.evaluate(() => bubs());   // a bubble that was pending when the user tapped must not pop up after the tap
    if (l2.length) fails.push(tag + ': bubble opened right after a tap (' + l2.join() + ')');
    await p.evaluate(() => GXH.hide());
  };
  let ph = 0; const next = () => 'p' + (ph++ % 12);
  const reset = () => p.evaluate(() => { GXH.reset(); GXH.setEnabled(true); GXH.hide(); });
  const where = () => ['neutral', 'neutral', 'board', 'bubble', 'ok', 'bulb'][Math.floor(R() * 6)];
  const waitOn = async () => { const t = Date.now(); while (Date.now() - t < 2000) { if ((await p.evaluate(() => bubs())).some(x => !/off/.test(x))) return true; await sleep(15); } return false; };
  for (let i = 0; i < N; i++) {
    await reset(); await p.evaluate(() => go(null)); await sleep(60);
    const kind = i % 6, w = where(), tag = '#' + i + ' ' + ['slow', 'during-open', 'two-quick', 'before-open', 'moving', 'bulb'][kind] + '/' + w;
    if (kind === 0) { await p.evaluate(x => go(x), next()); if (!(await waitOn())) { fails.push(tag + ': no bubble'); continue; } await sleep(300 + R() * 900); await tap(w); }
    else if (kind === 1) { await p.evaluate(x => go(x), next()); if (!(await waitOn())) { fails.push(tag + ': no bubble'); continue; } await sleep(R() * 180); await tap(w); }
    else if (kind === 2) { await p.evaluate(x => go(x), next()); await waitOn(); await sleep(R() * 250); await p.evaluate(x => go(x, true), next()); await sleep(R() * 600); await tap(w); }
    else if (kind === 3) { await p.evaluate(x => go(x), next()); await sleep(R() * 270); await tap(w === 'bubble' || w === 'ok' ? 'neutral' : w); }
    else if (kind === 4) { await p.evaluate(x => go(x), next()); await waitOn(); const t = Date.now() + R() * 900; while (Date.now() < t) { await p.evaluate(() => go(PH, true)); await sleep(40 + R() * 80); } await tap(w); }
    else { await p.evaluate(() => go(null)); const bb = await p.evaluate(() => { const r = document.getElementById('bulbbtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await p.touchscreen.tap(bb[0], bb[1]); await sleep(R() * 400); await tap(w === 'ok' ? 'bubble' : w); }
    await check(tag);
  }
  errs.forEach(e => fails.push('pageerror ' + e));
  await b.close();
  fails.forEach(f => console.log('FAIL ' + f));
  console.log((fails.length ? 'GXH TAP TEST FAILED: ' + fails.length : 'GXH TAP TEST CLEAN') + ' (' + N + ' rounds at ' + W + 'x' + H + ')');
  process.exit(fails.length ? 1 : 0);
})();
