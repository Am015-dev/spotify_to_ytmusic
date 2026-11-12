// R21 newcomer by touch: plays default Quick games (1 act, Warrior) at a phone size with page.touchscreen.tap only. Page state is READ to
// choose like a new player who reads the screen: block when the foes' intents show incoming damage and a Block card is in hand, else
// attack the weakest foe, else any playable card, else End turn; potion only when low; random glowing room; random reward card or skip;
// rest when hurt; leave shops; random event option. TUT=1 runs the coached tutorial climb by following the coach (same play in free steps).
// Run: VW=390 VH=844 RUNS=3 node tools/newcomer-taps.js
const { chromium } = require('playwright'), path = require('path'), { serve, sleep, tap } = require('./tap-lib');
const VW = +(process.env.VW || 390), VH = +(process.env.VH || 844), RUNS = +(process.env.RUNS || 1), TUT = !!process.env.TUT, SEED0 = +(process.env.SEED || 1);
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch(); let bad = 0;
  for (let run = 0; run < RUNS; run++) {
    const ctx = await br.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    let rs = SEED0 * 977 + run * 131; const r = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    const T = async s => { const x = await tap(pg, true, s); if (x && process.env.DBG) console.log('  skip', x); return !x; };
    const byText = async (sel, re) => { for (const x of await pg.$$(sel)) { const t = (await x.innerText().catch(() => '')).trim(); if (re.test(t) && await x.isVisible()) return x; } return null; };
    await pg.goto(base); await pg.waitForSelector('#title'); const t0 = Date.now(); let last = '', stuck = 0, out = null, maxFloor = 0, blocked = 0;
    if (TUT) { const b = await byText('#title button, #title a', /New here|Learn/i); if (b) await T(b); }
    for (let i = 0; i < 6000 && !out; i++) {
      await sleep(200);
      const s = await pg.evaluate(() => {
        const g = window.EC && EC.E.G(); const c = window.GXT && GXT.active() ? (GXT.current() || {}) : null; let pick = null;
        if (g && g.scr === 'battle' && g.b.ph === 'p' && !UI.busy) {
          const h = g.hs[g.b.cur]; let inc = 0; g.b.en.forEach((e, i) => { if (!e.dead && e.intent && e.intent.atk) inc += EC.E.previewHit(i, g.b.cur) * (e.intent.hits || 1); });
          const cards = h.hand.map((c, i) => { const e = EC.E.eff(c), js = JSON.stringify(e.ops); return { i, ok: EC.E.canPlay(h, c) && EC.E.cost(h, c) <= h.en, blk: /"blk"/.test(js), atk: /"(dmg|hit|all|dmgx|bodyslam)"/.test(js) || !!e.tgt }; }).filter(x => x.ok);
          const alive = g.b.en.map((e, i) => ({ i, v: e.dead ? 1e9 : e.hp + e.blk })).sort((a, b) => a.v - b.v);
          pick = { inc, blk: h.blk, hp: h.hp, mhp: h.mhp, pots: g.pots.length, cards, tgt: alive[0] && alive[0].i };
        }
        return { mode: UI.mode, scr: g && g.scr, ph: g && g.b && g.b.ph, busy: UI.busy, floor: g && g.floor, tut: c ? { free: !!c.free, next: !c.wait, ready: !c.ready || c.ready(), times: (c.wait && c.wait.times) || 1 } : null, end: !!document.querySelector('.gxt-end'), won: g && g.won, pick, hp: g && g.hs[0].hp, mhp: g && g.hs[0].mhp, txt: document.body.innerText.length };
      });
      maxFloor = Math.max(maxFloor, s.floor || 0);
      const key = JSON.stringify([s.mode, s.scr, s.ph, s.busy, s.tut, s.end, s.txt, s.hp]); if (key === last) stuck++; else stuck = 0; last = key;
      if (stuck > 60) { out = 'STUCK ' + key; break; }
      if (s.end) { out = 'TUTORIAL END CARD (coached climb won)'; break; }
      if (s.scr === 'over') { out = s.won ? 'WON' : 'LOST'; break; }
      { const gb = await pg.$('.ec-goal button'); if (gb && await gb.isVisible()) { await T(gb); continue; } }
      if (s.tut && !s.tut.free) {
        if (!s.tut.ready) continue;
        if (s.tut.next && await pg.$('.gxt-next')) { await T('.gxt-next'); continue; }
        const mark = () => pg.evaluate(() => { document.querySelectorAll('[data-spot]').forEach(x => x.removeAttribute('data-spot')); const c = GXT.current(); const t = c && c.target && c.target(); if (t) t.setAttribute('data-spot', '1'); });
        await mark(); if (!(await T('[data-spot]'))) blocked++; if (s.tut.times > 1) { await sleep(300); await mark(); await T('[data-spot]'); } await sleep(600); continue;
      }
      if (s.mode === 'title') { if (await pg.$('#play')) await T('#play'); else { const q = await byText('#title button', /^Quick game/); if (q) await T(q); } continue; }
      if (!s.scr) { const go = await byText('button', /^(Start climb|Climb)$/); if (go) await T(go); continue; }
      if (s.scr === 'map') { const ns = await pg.$$('.node.glow'); if (ns.length) await T(ns[Math.floor(r() * ns.length)]); continue; }
      if (s.scr === 'battle') {
        const p = s.pick; if (!p) continue;
        const def = p.cards.filter(x => x.blk && !x.atk); let c;
        if (p.inc > p.blk && def.length) c = def[0]; else c = p.cards.find(x => x.atk) || p.cards.find(x => !x.blk) || (r() < 0.5 ? def[0] : null);
        if (!c) { await T('#end'); continue; }
        const el = await pg.$('.hand .card[data-c="' + c.i + '"]'); if (!el) { await T('#end'); continue; }
        await T(el); await sleep(220);
        if (await pg.$('.en.glow')) { const e = await pg.$('.en.glow[data-w="e' + p.tgt + '"]') || await pg.$('.en.glow'); await T(e); }
        else { const sel = await pg.$('.hand .card.sel'); if (sel) await T(sel); }
        await sleep(350); continue;
      }
      if (s.scr === 'reward') {
        for (const b of await pg.$$('.reward button.item:not(.taken)')) { await T(b); await sleep(200); }
        const pk = await pg.$$('.picks .card'); if (pk.length && r() < 0.6) { await T(pk[Math.floor(r() * pk.length)]); await sleep(200); }
        else { const sk = await byText('.reward button', /^Skip$/); if (sk) { await T(sk); await sleep(200); } }
        await T('#leave'); continue;
      }
      if (s.scr === 'rest') { await T('#rest-heal'); continue; }
      if (s.scr === 'shop') { const b = await byText('#app button', /^(Leave|Continue|Walk on|Move on)/i); if (b) await T(b); continue; }
      if (s.scr === 'event') {
        const dc = await pg.$$eval('.card', ns => ns.map((n, i) => ((!n.closest('#app') && n.offsetParent) || (n.closest('.ov') && n.getBoundingClientRect().height > 0)) ? i : -1).filter(i => i >= 0)).catch(() => []);   // R24: the upgrade picker opens in a drawer outside #app
        if (dc.length) { const all = await pg.$$('.card'); await T(all[dc[Math.floor(r() * dc.length)]]); await sleep(300); const ok2 = await byText('button', /^(Upgrade|Confirm|Choose|Pick)/i); if (ok2) await T(ok2); continue; }
        const os = await pg.$$('.opts .btn:not([disabled])'); if (os.length) { await T(os[Math.floor(r() * os.length)]); continue; }
        const b = await byText('#app button', /^(Leave|Continue|Walk on|Move on)/i) || await pg.$('#app button.btn'); if (b) { await T(b); continue; }
        const c2 = await pg.$$('#app .card'); if (c2.length) await T(c2[0]); continue;
      }
    }
    const shot = path.join(process.env.SHOTDIR || '/tmp', (TUT ? 'tut' : 'quick') + '-' + VW + '-' + run + '.png'); await pg.screenshot({ path: shot });
    console.log(`${TUT ? 'tutorial climb' : 'quick'} ${VW}x${VH} run ${run}: ${out || 'ran out of steps'} | floor reached ${maxFloor} | ${((Date.now() - t0) / 60000).toFixed(1)} min | page errors ${errs.length}${blocked ? ' | coach target not tappable ' + blocked : ''}`);
    if (errs.length) { bad++; console.log('  ', errs.slice(0, 3).join(' | ')); } if (!out || /STUCK/.test(out)) bad++;
    await ctx.close();
  }
  await br.close(); srv.close(); process.exit(bad ? 1 : 0);
})();
