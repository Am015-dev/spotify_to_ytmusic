// Real-input smoke: from the title by tap, climb into a fight, play 3 turns by tapping cards, then force a result screen.
// Phone portrait 390x763 (touch) and PC 1440x860 (mouse). Shots go to shots/ (gitignored).
// Run: NODE_PATH=/opt/node-tools/node_modules node smoke.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
fs.mkdirSync(path.join(ROOT, 'shots'), { recursive: true });
const srv = http.createServer((q, r) => {
  let p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (p.endsWith('/')) p += 'emberclimb.html';
  fs.readFile(p, (e, d) => {
    if (e) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.webp') ? 'image/webp' : 'application/octet-stream' });
    r.end(d);
  });
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await new Promise(r => srv.listen(0, r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const br = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  let bad = 0;
  const fail = m => { bad++; console.log('FAIL', m); };
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    await pg.goto(base + 'emberclimb.html?anim=0');
    await pg.waitForSelector('#title');
    const at = async (x, y) => { if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); await sleep(80); };
    const tapEl = async el => { const b = await el.boundingBox(); await at(b.x + b.width / 2, b.y + b.height / 2); };
    const tap = async sel => { const el = await pg.$(sel); if (!el) return false; await tapEl(el); return true; };
    await pg.screenshot({ path: `shots/${name}-title.png` });
    await pg.evaluate(() => { UI.sub = 'quick'; UI.render(); }); await tap('#play'); await sleep(100);
    { const gb = await pg.$('.ec-goal button'); if (gb) { await tapEl(gb); await sleep(100); } }
    // W494: quick play opens with the First Ember gift; take the first option, then Continue
    if (await pg.evaluate(() => EC.E.G().scr === 'event')) { await tap('.reward .opts button'); await sleep(150); await tap('#ev-leave'); await sleep(150); }
    if (!(await pg.$('#map'))) fail(name + ': no map after Climb');
    await pg.screenshot({ path: `shots/${name}-map.png` });
    if (await pg.$('#goal-go')) { await tap('#goal-go'); await sleep(200); }   // Addendum 7: the one-card Goal before turn 1
    await tap('.node.glow'); await sleep(200);
    if (!(await pg.$('#stage'))) fail(name + ': no fight after node tap');
    let turns = 0;
    for (; turns < 3; turns++) {
      for (let k = 0; k < 6; k++) {
        const n = await pg.$$('.hand .card.ok');
        if (!n.length) break;
        await tapEl(n[0]);
        if (await pg.$('.hand .card.sel')) {
          const en = await pg.$('.en.glow');
          if (en) await tapEl(en); else await tapEl(await pg.$('.hand .card.sel'));
        }
        if (!(await pg.$('#stage'))) break;
      }
      if (turns === 0) await pg.screenshot({ path: `shots/${name}-fight.png` });
      if (!(await pg.$('#stage'))) break;
      await tap('#end'); await sleep(120);
    }
    const st = JSON.parse(await pg.evaluate(() => window.render_game_to_text()));
    console.log(name, 'turns', turns, 'screen', st.scr, 'hp', st.hs[0].hp);
    await pg.evaluate(() => window.EC_FORCE_RESULT(true)); await sleep(100);
    if (!(await pg.$('#again'))) fail(name + ': no result screen');
    await pg.screenshot({ path: `shots/${name}-result.png` });
    if (await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) fail(name + ': horizontal scroll');
    if (errs.length) fail(name + ' console errors: ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await br.close(); srv.close();
  console.log(bad ? 'SMOKE FAIL' : 'SMOKE PASS');
  process.exit(bad ? 1 : 0);
})();
