// G3 r2: every visible tap target is at least 44x44 CSS px on each main screen, at 375x667 and 390x844 (touch).
// Also writes shots of the potion menu, upgrade preview, shop and boss phase 2 to playable-shots/g3/. Run: node tools/probe-targets.js
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { serve, sleep } = require('./tap-lib');
const OUT = path.join(__dirname, '..', 'playable-shots', 'g3'); fs.mkdirSync(OUT, { recursive: true });
const SCREENS = {
  title: () => { UI.mode = 'title'; UI.render(); },
  map: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); UI.mode = 'game'; UI.render(); },
  battle: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); const g = EC.E.G(); g.pots = ['fire-flask', 'block-brew']; g.relics.push('iron-bangle', 'bag-of-marbles'); EC.E.performMove({ t: 'go', n: EC.E.validMoves()[0].n }); UI.mode = 'game'; UI.render(); },
  potion: () => { UI.potSel = 0; UI.render(); },
  reward: () => { EC.E.debug.win(); UI.render(); },
  shop: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.debug.shop(); UI.mode = 'game'; UI.render(); },
  rest: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.debug.rest(); UI.mode = 'game'; UI.render(); },
  upgrade: () => { UI.ov = 'smith'; UI.pickSel = 0; UI.render(); },
  event: () => { UI.ov = null; UI.pickSel = -1; EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.debug.event('forge-spirit'); UI.mode = 'game'; UI.render(); },
  boss: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.debug.boss(); UI.mode = 'game'; const g = EC.E.G(); g.hs[0].hp = 999; g.hs[0].mhp = 999; const e = g.b.en[0]; e.hp = Math.floor(e.mhp / 2) + 3; e.blk = 0; g.hs[0].hand.push(EC.E.mk('w-strike')); g.hs[0].en = 3; UI.render(); },
  over: () => { EC.E.newGame({ heroes: ['w'], seed: 9 }); EC.E.G().relics.push('iron-bangle', 'lantern'); EC.E.debug.over(0); UI.mode = 'game'; UI.render(); }
};
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [w, hh] of [[375, 667], [390, 844]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { try { GXT.markDone('emberclimb'); } catch (e) { } window.EC_NOSAVE = 1; });
    for (const [k, fn] of Object.entries(SCREENS)) {
      await pg.evaluate(fn); await sleep(700);
      if (k === 'boss') { await sleep(2500); await pg.evaluate(() => { document.querySelectorAll('.gx-skip,.bossintro,.ec-bossv').forEach(e => e.remove()); const g = EC.E.G(); const i = g.hs[0].hand.length - 1; EC.E.performMove({ t: 'play', h: 0, c: i, e: 0 }); UI.render(); }); await sleep(400); }
      const small = await pg.evaluate(() => { const out = []; document.querySelectorAll('button, [role=button], a[href], .node, .hand .card, .pot.full').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]') || getComputedStyle(e).visibility === 'hidden' || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return; if (e.disabled) return; if (r.width < 44 || r.height < 44) out.push((e.id ? '#' + e.id : e.className.toString().split(' ').slice(0, 2).join('.') || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }); return out; });
      if (small.length) { bad++; console.log('FAIL', w + 'x' + hh, k, small.slice(0, 8).join(', ')); } else console.log('ok', w + 'x' + hh, k);
      if (['potion', 'upgrade', 'shop', 'boss', 'map', 'battle'].includes(k)) await pg.screenshot({ path: path.join(OUT, k + '-' + w + '.png') });
    }
    if (errs.length) { bad++; console.log('page errors', errs.slice(0, 3)); }
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'TARGETS FAIL' : 'TARGETS PASS'); process.exit(bad ? 1 : 0);
})();
