// W494 new-player Act 1 by touch: fresh storage, Quick game (default = full 3-act run with the opening blessing), played to the start of
// Act 2 (or a loss) by tapping only visible, uncovered UI at 390x844. Prefers rooms not yet visited (shop, rest, event, elite) so every
// room type is met; smiths at a campfire when healthy, takes a card out at the shop, uses potions. Writes playable-shots/w494/
// rest.png shop.png event.png boss.png. Fails on page errors, a stuck screen, or failed invariants. Run: node tools/act1-taps.js
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { serve, sleep, tap } = require('./tap-lib');
const OUT = path.join(__dirname, '..', 'playable-shots', 'w494'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  const VW = +(process.env.VW || 390), VH = +(process.env.VH || 844);
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
  const T = async s => { const r = await tap(pg, true, s); if (r && process.env.DBG) console.log('  skip-tap', r); return !r; };
  const byText = async (sel, re) => { for (const x of await pg.$$(sel)) { const t = (await x.innerText().catch(() => '')).trim(); if (re.test(t) && await x.isVisible()) return x; } return null; };
  const shot = {}, met = {}; const snap = async k => { if (shot[k] || VW !== 390) return; shot[k] = 1; await sleep(500); await pg.screenshot({ path: path.join(OUT, k + '.png') }); };
  let result = '', inv = 0, smithed = 0, cut = 0, runs = 0, bossDone = false;
  for (runs = 1; runs <= 5; runs++) {
  for (const k in met) delete met[k];
  await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { localStorage.clear(); try { GXT.markDone('emberclimb'); } catch (e) { } }); await pg.goto(base); await pg.waitForSelector('#title');
  let last = '', stuck = 0; result = ''; cut = 0; bossDone = false; let inBoss = false;
  for (let i = 0; i < 6000; i++) {
    await sleep(200);
    const s = await pg.evaluate(() => { const g = EC.E.G(); return { mode: UI.mode, scr: g && g.scr, ph: g && g.b && g.b.ph, kind: g && g.b && g.b.kind, busy: UI.busy, ov: UI.ov, act: g && g.act, ev: g && g.evn && g.evn.id, res: !!(g && g.evn && g.evn.res), floor: g && g.floor, inv: g ? EC.E.checkInvariants().length : 0, hp: g && g.hs[0].hp, mhp: g && g.hs[0].mhp, pots: g ? g.pots.length : 0, deck: g ? g.hs[0].deck.length : 0, gold: g && g.gold }; });
    if (s.inv) inv++;
    const key = JSON.stringify(s); if (key === last) stuck++; else stuck = 0; last = key;
    if (stuck > 80) { await pg.screenshot({ path: path.join(OUT, 'stuck-act1.png') }); console.log('FAIL stuck at', key); bad++; break; }
    if (s.scr && s.act >= 2) { result = 'reached Act 2 (deck ' + s.deck + ', HP ' + s.hp + '/' + s.mhp + ')'; break; }
    if (s.kind === 'b') inBoss = true;
    if (s.scr === 'over') { result = 'lost on floor ' + s.floor + ' (act ' + s.act + ')' + (inBoss ? ' at the boss' : ''); bossDone = inBoss; break; }
    { const gb = await pg.$('.ec-goal button'); if (gb && await gb.isVisible()) { await T(gb); continue; } }
    if (s.mode === 'title') { if (await pg.$('#play')) await T('#play'); else { const q = await byText('#title button', /^Quick game/); if (q) await T(q); } continue; }
    if (s.ov === 'smith' || s.ov === 'remove' || s.ov === 'evpick') { const ok = await pg.$('#upg-ok'); if (ok) { await T(ok); continue; } const c = await pg.$('.ov .grid .card'); if (c) await T(c); continue; }   // upgrade: pick, see the preview, confirm
    if (s.ov) { const x = await pg.$('.ov .x'); if (x) await T(x); continue; }
    if (s.scr === 'map') {
      const pref = (s.hp < s.mhp * 0.55 ? ['r', 'v', 's', 't', 'm', 'e', 'b'] : ['s', 'r', 'v', 't', 'e', 'm', 'b']).sort((a, b) => (met[a] ? 1 : 0) - (met[b] ? 1 : 0));
      let done = false; for (const t of pref) { if (t === 'e' && (met.e || s.hp < s.mhp * 0.85 || s.floor < 4)) continue; if (t === 'r' && met.r && s.hp > s.mhp * 0.7) continue; if (await pg.$('.node.glow.t-' + t)) { done = await T('.node.glow.t-' + t); if (done) { met[t] = 1; break; } } }
      if (!done) await T('.node.glow'); continue;
    }
    if (s.scr === 'battle') {
      if (s.kind === 'b') await snap('boss');
      if (s.ph !== 'p' || s.busy) continue;
      if (await pg.$('.ec-potpop .potdrink')) { await T('.ec-potpop .potdrink'); continue; }
      if (s.pots && s.hp < s.mhp * 0.5 && await pg.$('.pot.full')) { await T('.pot.full'); continue; }   // potion: tap it, then Drink
      // G3 r3: a careful player: the engine's test bot picks the move (block when hit hard, kill low foes, potions); the page is only TAPPED
      const mv = await pg.evaluate(() => { try { return EC.E.aiMove(); } catch (e) { return null; } });
      const cs = mv && mv.t === 'play' ? '.hand .card[data-c="' + mv.c + '"]' : null;
      if (cs && await pg.$(cs)) {
        await T(cs); await sleep(200);
        const es = mv.e != null ? '.en.glow[data-w="e' + mv.e + '"]' : null;
        if (await pg.$('.en.glow')) await T(es && await pg.$(es) ? es : '.en.glow'); else { const sel = await pg.$('.hand .card.sel'); if (sel) await T(sel); }
        await sleep(300); continue;
      }
      if (mv && mv.t === 'pot' && await pg.$('.pot.full')) { const pb = await pg.$$('.pots .pot'); if (pb[mv.p]) await T(pb[mv.p]); else await T('.pot.full'); continue; }
      const ok = await pg.$('.hand .card.ok');
      if (mv && mv.t !== 'end' && ok) { await T(ok); await sleep(200); if (await pg.$('.en.glow')) await T('.en.glow'); else { const sel = await pg.$('.hand .card.sel'); if (sel) await T(sel); } await sleep(300); }
      else await T('#end');
      continue;
    }
    if (s.scr === 'reward') { const pt = await pg.$('.reward button.item'); if (pt && s.pots < 3) { await T(pt); await sleep(200); const k2 = await pg.evaluate(() => JSON.stringify(EC.E.G().rw && EC.E.G().rw.took)); if (k2 !== '{}') continue; } const pk = await pg.$('.picks .card'); if (pk) { await T(pk); continue; } await T('#leave'); continue; }
    if (s.scr === 'rest') { await snap('rest'); if (s.hp > s.mhp * 0.7 && await pg.$('#rest-smith')) { smithed++; await T('#rest-smith'); } else await T('#rest-heal'); continue; }
    if (s.scr === 'shop') {
      await snap('shop');
      if (!cut && s.gold >= 75) { const rm = await byText('.reward button.item', /Remove a card/); if (rm) { await T(rm); await sleep(300); const c = await pg.$('.ov .grid .card'); if (c) { await T(c); cut = 1; continue; } } }
      cut = cut || -1; await T('#shop-leave'); continue;
    }
    if (s.scr === 'event') { if (s.ev !== 'first-ember') await snap('event'); if (s.res) { await T('#ev-leave'); continue; } const b = await pg.$('.reward .opts button:not([disabled])'); if (b) await T(b); continue; }
  }
  console.log('run ' + runs + ':', result || 'no result', '| rooms met:', Object.keys(met).join(','));
  if (/Act 2/.test(result) || !result || bossDone) break;   // G3 r3: a finished act-1 boss fight (won or lost) proves Act 1 is playable by touch
  }
  if (!/Act 2/.test(result) && !bossDone) { bad++; console.log('FAIL no run finished the act-1 boss fight in 5 tries'); }
  console.log('runs used: ' + Math.min(runs, 5) + (runs > 1 ? ' (earlier runs died before the boss)' : ' (first try)'));
  console.log('act1:', result || 'no result', '| rooms met:', Object.keys(met).join(','), '| smith', smithed, 'shop cut', cut, '| invariant failures', inv);
  if (!result) bad++; if (inv) bad++;
  if (errs.length) { bad++; console.log('FAIL errors', errs.slice(0, 3).join(' | ')); }
  await br.close(); srv.close(); console.log(bad ? 'ACT1 FAIL' : 'ACT1 PASS'); process.exit(bad ? 1 : 0);
})();
