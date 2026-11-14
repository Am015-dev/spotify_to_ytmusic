// gx-tutor tap timing: no deliberate tap on the spotlight may be lost, and one press may never finish two steps.
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/gxt-tap-test.js [390x844] [path/to/gx-tutor.js]
// A fake game page (no game code, only shell/gx-tutor.js + its css) runs a tutorial of tap steps on one board button. The button calls
// GXT.act() from BOTH pointerdown and click, like the worst shelf games do, so every real tap reaches the tutor twice. Steps 'x2' need
// two taps (the tutor goes back to waiting between them). Real touch taps land 50, 150, 300 and 500 ms after each bubble appears;
// after each one the step count must grow by exactly one (checked again 700 ms later: no late double advance).
// Then a long press: finger down finishes a step and stays down until the next bubble is up, finger up: its trailing click must NOT
// finish the new step, and a fresh tap right after must. Same for a Next-button step. Exit 1 on any failure or page error.
const PW = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path');
const SP = path.resolve(__dirname, '..');
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number);
const TUTOR = process.argv[3] ? path.resolve(process.argv[3]) : path.join(SP, 'shell', 'gx-tutor.js');
const DELAYS = [50, 150, 300, 500];
const css = ['gx-help.css', 'gx-tutor.css'].map(f => fs.readFileSync(path.join(SP, 'shell', f), 'utf8')).join('\n');
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}
body{margin:0;background:#223;font:16px sans-serif}#b{position:absolute;left:120px;top:380px;width:150px;height:90px;font-size:20px}</style></head>
<body><button id="b" type="button">Bag</button><script>
window.__log=[];var b=document.getElementById('b');
function hit(kind){var ok=window.GXT&&GXT.act({type:'tap',kind:kind});__log.push(kind+':'+ok);}
b.addEventListener('pointerdown',function(){hit('down');});b.addEventListener('click',function(){hit('click');});
</script></body></html>`;

(async () => {
  const browser = await PW.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.setContent(html); await page.addScriptTag({ content: fs.readFileSync(TUTOR, 'utf8') });
  const fails = []; let taps = 0;
  const T = { target: () => document.getElementById('b'), wait: { type: 'tap' } };
  async function start(steps) {
    await page.evaluate(steps => {
      GXT.reset('gxt-tap-test');
      GXT.start({ game: 'gxt-tap-test', story: false, steps: steps.map((s, i) => s === 'next' ? { id: 'n' + i, say: 'Read this, then tap Next.', target: () => document.getElementById('b'), wait: null }
        : { id: 's' + i, say: 'Tap the glowing bag.', target: () => document.getElementById('b'), wait: { type: 'tap', times: s === 'x2' ? 2 : 1 } }), onDone: () => { } });
    }, steps);
  }
  const st = () => page.evaluate(() => { const s = GXT.state(); return { active: s.active, i: s.i, count: s.count || 0, shown: s.shown, phase: s.phase, wait: s.wait }; });
  const progress = s => s.active ? s.i * 10 + s.count : 1e6;   // steps done*10 + taps counted in this step
  async function waitShown(ms = 4000) { const t0 = Date.now(); for (;;) { const s = await st(); if (!s.active || s.phase === 'end' || s.shown) return s; if (Date.now() - t0 > ms) return s; await page.waitForTimeout(10); } }
  const centre = () => page.evaluate(() => { const r = document.getElementById('b').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });

  // ---- 1: taps at fixed delays after every bubble
  for (const d of DELAYS) {
    const steps = ['tap', 'x2', 'tap', 'x2', 'tap'];
    await start(steps);
    for (let k = 0; k < 7; k++) {   // 1 + 2 + 1 + 2 + 1 taps
      const s0 = await waitShown(); if (s0.phase === 'end') { fails.push(`delay ${d}: tutorial ended early after ${k} taps`); break; }
      if (!s0.shown) { fails.push(`delay ${d}: bubble never showed (step ${s0.i})`); break; }
      await page.waitForTimeout(d);
      const before = progress(await st()); const c = await centre();
      await page.touchscreen.tap(c.x, c.y); taps++;
      await page.waitForTimeout(60); const mid = await st();
      await page.waitForTimeout(700); const after = await st();
      const grew = (mid.i !== s0.i || mid.count !== s0.count || !mid.active || mid.phase === 'gap' || mid.phase === 'end');
      if (!grew) fails.push(`delay ${d}: tap ${k + 1} on step ${s0.i} (count ${s0.count}) was ignored`);
      // exactly one: either count+1 in the same step, or moved to the next step with count 0 (or tutorial end)
      const one = (after.phase === 'end' || !after.active) ? s0.i === steps.length - 1
        : (after.i === s0.i && after.count === s0.count + 1) || (after.i === s0.i + 1 && after.count === 0);
      if (!one) fails.push(`delay ${d}: tap ${k + 1} moved step ${s0.i}/count ${s0.count} to step ${after.i}/count ${after.count} (expected exactly one)`);
    }
    const fin = await st(); if (fin.active && fin.phase !== 'end') fails.push(`delay ${d}: tutorial not finished after 7 taps (step ${fin.i}, count ${fin.count})`);
    await page.evaluate(() => GXT.stop && GXT.stop());
  }

  // ---- 2: long press across a new bubble (tap step -> tap step, and tap step -> Next step)
  for (const second of ['tap', 'next']) {
    await start(['tap', second, 'tap']);
    let s = await waitShown(); const c = await centre();
    // a mouse press is a real pointerdown/up/click on the button (touchscreen.tap cannot hold)
    await page.mouse.move(c.x, c.y); await page.mouse.down(); taps++;
    for (let t = 0; t < 300; t++) { s = await st(); if (s.i === 1 && s.shown) break; await page.waitForTimeout(10); }
    if (!(s.i === 1 && s.shown)) { fails.push(`long press (${second}): next bubble never showed while held`); continue; }
    await page.waitForTimeout(80); await page.mouse.up(); await page.waitForTimeout(300);
    s = await st(); if (s.i !== 1) fails.push(`long press (${second}): releasing the press that finished step 0 also finished step 1 (now ${s.i})`);
    // fresh press 50 ms later must count
    await page.waitForTimeout(50);
    if (second === 'next') { const nb = await page.evaluate(() => { const e = document.querySelector('.gxt-next'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (!nb) { fails.push('long press (next): no Next button'); continue; } await page.touchscreen.tap(nb.x, nb.y); }
    else await page.touchscreen.tap(c.x, c.y);
    taps++; await page.waitForTimeout(400); s = await st();
    if (s.i !== 2) fails.push(`long press (${second}): a fresh tap right after the release did not finish step 1 (now ${s.i})`);
    await page.evaluate(() => GXT.stop && GXT.stop());
  }

  await browser.close();
  if (errs.length) fails.push(...errs.map(e => 'page error: ' + e));
  console.log(`gxt-tap-test ${W}x${H}: ${taps} taps, ${fails.length} failures`);
  for (const f of fails) console.log('  FAIL ' + f);
  if (!fails.length) console.log('  PASS every tap advanced exactly one step; no press advanced two');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
