// R7 phone gate at 375x667 and 390x844 (touch): no visible text under 14px on the main screens; every hand card fully on screen;
// a lifted card never covers End turn or a foe's HP bar; the reward picks sit fully above the bottom bar; taking a potion on the reward
// screen does not move the card picks; on the result screen nothing covers "Final deck". Run: node tools/probe-phone.js
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { serve, sleep } = require('./tap-lib');
const src = fs.readFileSync(path.join(__dirname, 'probe-targets.js'), 'utf8');
const SCREENS = eval('(' + src.slice(src.indexOf('const SCREENS = ') + 16, src.indexOf('};\n(async') + 1) + ')');
const small = () => { const m = []; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; if (e.closest('.gx-scn,[aria-hidden=true],.ec-fly,.fly,script,style')) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue; const r = e.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue; if (parseFloat(cs.fontSize) < 14) m.push(e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' ' + cs.fontSize + ' "' + t.slice(0, 16) + '"'); } return m; };
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  const fail = m => { bad++; console.log('FAIL', m); };
  for (const [w, hh] of [[375, 667], [390, 844]]) {
    const V = w + 'x' + hh, ctx = await br.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { try { GXT.markDone('emberclimb'); } catch (e) { } window.EC_NOSAVE = 1; try { for (const k of ['shiv', 'orbs', 'stance', 'scry', 'retain', 'frail', 'laststand', 'acts', 'split', 'die', 'junk', 'target']) localStorage.setItem('ec-tip-' + k, '1'); } catch (e) { } });
    for (const [k, fn] of Object.entries(SCREENS)) {
      if (k === 'boss' || k === 'potion') continue;
      await pg.evaluate(fn); await sleep(600);
      const s = await pg.evaluate(small); if (s.length) fail(V + ' ' + k + ' text<14: ' + s.slice(0, 5).join(' | ')); else console.log('ok', V, k, 'text');
    }
    for (const n of [5, 7]) {   // hand fits, lifted card covers nothing important
      await pg.evaluate(n => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.performMove({ t: 'go', n: EC.E.validMoves()[0].n }); const g = EC.E.G(); const h = g.hs[0]; while (h.hand.length < n) h.hand.push(EC.E.mk('w-defend')); h.hand.length = n; UI.sel = -1; UI.mode = 'game'; UI.render(); }, n); await sleep(500);
      const off = await pg.evaluate(() => [...document.querySelectorAll('.hand .card')].map(e => e.getBoundingClientRect()).filter(r => r.left < -1 || r.right > innerWidth + 1).map(r => Math.round(r.left) + '..' + Math.round(r.right)));
      if (off.length) fail(V + ' hand of ' + n + ' off screen: ' + off.join(', ')); else console.log('ok', V, 'hand of', n, 'on screen');
      for (const ci of [0, n - 1]) {
        await pg.evaluate(ci => { UI.sel = -1; UI.render(); const c = document.querySelector('.hand .card[data-c="' + ci + '"]'); c.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, ci); await sleep(450);
        const cov = await pg.evaluate(() => { const out = []; const chk = (sel, nm) => { const e = document.querySelector(sel); if (!e) return; const r = e.getBoundingClientRect(); for (const [fx, fy] of [[.5, .5], [.2, .5], [.8, .5]]) { const t = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy); if (t && t.closest('.hand .card.sel, .w4hbf, .peek')) { out.push(nm); return; } } }; chk('#end', 'End turn'); document.querySelectorAll('.en .bar').forEach((b, i) => { const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (t && t.closest('.hand .card.sel, .w4hbf')) out.push('foe HP ' + i); }); return { sel: UI.sel, out }; });
        if (cov.sel < 0) fail(V + ' card ' + ci + ' did not lift'); else if (cov.out.length) fail(V + ' lifted card ' + ci + ' of ' + n + ' covers ' + cov.out.join(', ')); else console.log('ok', V, 'lifted card', ci, 'covers nothing');
      }
    }
    // reward: picks fully visible above the bottom bar; taking the potion keeps the picks in place
    await pg.evaluate(() => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.performMove({ t: 'go', n: EC.E.validMoves()[0].n }); EC.E.debug.win(); const g = EC.E.G(); if (g.rw && !g.rw.pots?.length) g.rw.pots = ['fire-flask']; UI.mode = 'game'; UI.render(); }); await sleep(600);
    const picks = async () => pg.evaluate(() => [...document.querySelectorAll('.picks .card')].map(e => { e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height - 6); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), bot: r.bottom, ok: !!(t && t.closest('.picks .card')), vh: innerHeight }; }));
    const p0 = await picks(); if (!p0.length) fail(V + ' reward has no card picks'); p0.forEach((p, i) => { if (!p.ok) fail(V + ' reward pick ' + i + ' bottom covered/cut'); });
    const hasPot = await pg.evaluate(() => { const b = [...document.querySelectorAll('.reward button, .reward .item')].find(e => /potion|flask|brew|vial/i.test(e.textContent) || e.matches('.rpot, [data-pot]')); if (!b) return false; b.click(); return true; }); await sleep(500);
    if (hasPot) { const p1 = await picks(); const moved = p1.length !== p0.length || p1.some((p, i) => Math.abs(p.y - p0[i].y) > 2 || Math.abs(p.x - p0[i].x) > 2); if (moved) fail(V + ' taking the potion moved the card picks ' + JSON.stringify(p0.map(p => p.y)) + ' -> ' + JSON.stringify(p1.map(p => p.y))); else console.log('ok', V, 'potion take keeps picks in place'); }
    else console.log('note', V, 'no potion on this reward');
    if (!p0.some(p => !p.ok)) console.log('ok', V, 'reward picks visible');
    // result: nothing over the "Final deck" title
    await pg.evaluate(() => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.G().relics.push('iron-bangle', 'lantern'); EC.E.debug.over(1); UI.mode = 'game'; UI.render(); }); await sleep(1500);
    const fd = await pg.evaluate(() => { const e = [...document.querySelectorAll('h2,h3,b,div')].find(x => /^Final deck/.test(x.textContent.trim()) && x.children.length < 3); if (!e) return 'none'; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + Math.min(40, r.width / 2), r.top + r.height / 2); return t && (e.contains(t) || t.contains(e)) ? 'ok' : 'covered by ' + (t ? t.className || t.tagName : 'nothing'); });
    if (fd !== 'ok' && fd !== 'none') fail(V + ' result "Final deck" ' + fd); else console.log('ok', V, 'result Final deck', fd);
    if (errs.length) fail(V + ' page errors ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'PHONE PROBE FAIL' : 'PHONE PROBE PASS'); process.exit(bad ? 1 : 0);
})();
