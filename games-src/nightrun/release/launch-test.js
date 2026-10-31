#!/usr/bin/env node
// W298 launch test: title -> flight -> street on any URL (file:// or http://). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node release/launch-test.js file:///tmp/nrdl/index.html [shots-dir]
// Env EXTRA='<js>' runs once in the page after the street test and prints its JSON result (INFO line).
const PW = require('playwright');
const URL_ = process.argv[2], SH = process.argv[3];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + String(i).slice(0, 300))); };
const cards = async p => { for (let i = 0; i < 8; i++) { await sleep(450); await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); } };
(async () => {
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const mode of ['flight', 'street']) {
    const c = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(), errs = [], failed = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    p.on('pageerror', e => errs.push('pageerror ' + String(e.message).slice(0, 160)));
    p.on('requestfailed', r => failed.push(r.url().slice(-60)));
    p.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(-50)); });
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_tut', '2'); } catch (e) { } });
    await p.goto(URL_);
    await p.waitForFunction(() => window.__mnr, null, { timeout: 20000 }).catch(() => { });
    await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 20000 }).catch(() => { }); await sleep(2500);
    const t = await p.evaluate(() => ({ h: !!document.getElementById('title') && !document.getElementById('title').hidden, g: !!window.__mnr }));
    if (mode === 'flight') {
      ok('title screen shown (' + URL_.split(':')[0] + ')', t.h && t.g, JSON.stringify(t));
      if (SH) await p.screenshot({ path: SH + '/title.jpg', type: 'jpeg', quality: 80 });
      await p.click('#focFlight'); await cards(p); await sleep(1500);
      await p.keyboard.down('Space'); await p.keyboard.down('ArrowRight'); await sleep(1500); await p.keyboard.up('ArrowRight');
      const st = await p.evaluate(() => ({ run: __mnr.running, au: __mnr.AU.a && __mnr.AU.a.state }));
      ok('flight runs ' + JSON.stringify(st), st.run === true);
      if (SH) await p.screenshot({ path: SH + '/flight.jpg', type: 'jpeg', quality: 80 });
    } else {
      await p.evaluate(() => { const f = [...document.querySelectorAll('button')].find(x => /ON FOOT/.test(x.textContent) && x.offsetParent); f && f.click(); }); await cards(p); await sleep(2500);
      await p.keyboard.down('d'); await sleep(3000);
      const s = await p.evaluate(() => { try { return { on: !!(window.FOOT && FOOT.S) || !!document.querySelector('canvas'), run: __mnr.running }; } catch (e) { return { err: String(e) }; } });
      if (SH) await p.screenshot({ path: SH + '/street.jpg', type: 'jpeg', quality: 80 });
      await p.keyboard.up('d');
      ok('street starts ' + JSON.stringify(s), !s.err);
    }
    if (process.env.EXTRA && mode === 'street') console.log('INFO extra ' + JSON.stringify(await p.evaluate(process.env.EXTRA)));
    const e2 = errs.filter(e => !/fonts\.(googleapis|gstatic)|ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION|TUNNEL|PROXY)/.test(e));
    ok(mode + ': 0 console errors', e2.length === 0, e2.slice(0, 4).join(' | '));
    const f2 = failed.filter(u => !/fonts\./.test(u)); if (f2.length) console.log('INFO failed requests (' + mode + '): ' + f2.slice(0, 6).join(' , '));
    await c.close();
  }
  await br.close(); console.log((bad ? 'FAIL' : 'PASS') + ' launch-test: ' + bad + ' failed'); process.exit(bad ? 1 : 0);
})();
