// F3 repro: won potions fill the slots, relic effects apply and show. node tools/f3-repro.js [shotdir]
const { chromium } = require('playwright'); const { serve, sleep, tap } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  let bad = 0; const ck = (n, ok, x) => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + n + (x ? ' ' + x : '')); };
  const dir = process.argv[2] || '/tmp/x';
  await pg.goto(base + '?scn=ec-reward'); await sleep(1500);
  // potions
  for (const id of ['venom-vial', 'healing-draught']) {
    await pg.evaluate(id => { const g = EC.E.G(); g.rw.pot = id; g.rw.took.pot = 0; UI.render(); }, id);
    const r = await tap(pg, true, '.reward .item:not(.taken)'); await sleep(300);
    const n = await pg.evaluate(() => ({ pots: EC.E.G().pots.slice(), full: document.querySelectorAll('.pots .pot.full').length, vis: [...document.querySelectorAll('.pots .pot.full')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.bottom <= innerHeight; }).length }));
    ck('potion ' + id + ' in slot', n.pots.indexOf(id) >= 0 && n.full === n.pots.length && n.vis === n.full, JSON.stringify(n) + (r || ''));
  }
  await pg.screenshot({ path: dir + '/f3-potions.png' });
  // relics through real taps: Oak Heart must raise max HP, and the top bar must show it
  await pg.evaluate(() => { const g = EC.E.G(); g.relics = g.relics.filter(r => ['oak-heart', 'pocket-satchel', 'lucky-coin'].indexOf(r) < 0); g.rw.relics = ['oak-heart', 'pocket-satchel', 'lucky-coin']; g.rw.took = {}; g.rw.nrel = 3; g.hs[0].hp = 40; UI.render(); });
  const before = await pg.evaluate(() => ({ mhp: EC.E.G().hs[0].mhp, gold: EC.E.G().gold, sl: EC.E.G().pslots }));
  for (const nm of ['Oak Heart', 'Pocket Satchel', 'Lucky Coin']) { const h = await pg.evaluateHandle(nm => [...document.querySelectorAll('.reward button.item')].find(b => b.textContent.indexOf(nm) >= 0 && !b.disabled), nm); const r = await tap(pg, true, h.asElement()); if (r) console.log('tap ' + nm + ': ' + r); }
  const after = await pg.evaluate(() => ({ mhp: EC.E.G().hs[0].mhp, hp: EC.E.G().hs[0].hp, gold: EC.E.G().gold, sl: EC.E.G().pslots, chip: [...document.querySelectorAll('.chip')].map(c => c.textContent).join('|') }));
  ck('Oak Heart +8 max HP', after.mhp === before.mhp + 8 && after.hp === 48, JSON.stringify([before, after]));
  ck('top bar shows the new max', /48\s*\/\s*80/.test(after.chip || ''), after.chip);
  ck('Satchel +1 slot', after.sl === before.sl + 1); ck('Lucky Coin +8 gold', after.gold === before.gold + 8);
  ck('no page errors', errs.length === 0, errs.join('|'));
  await b.close(); srv.close(); process.exit(bad ? 1 : 0);
})();
