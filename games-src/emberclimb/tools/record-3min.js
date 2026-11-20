// F2 proof: the first 3 minutes of a brand-new player at 375x667, by real touch taps only (fresh storage).
// Title -> Learn to play (every guide step) -> end card "Pick your hero" -> pick the Rogue -> Start climb -> the opening gift ->
// the branching map -> fights, rewards, rooms until 180 s. Writes proof/f2-375x667-3min.webm and prints what happened.
// Run: NODE_PATH=../node_modules node tools/record-3min.js
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { serve, sleep } = require('./tap-lib');
const OUT = path.join(__dirname, '..', 'proof'), VID = path.join(OUT, '.vid');
(async () => {
  fs.mkdirSync(VID, { recursive: true });
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const vp = { width: 375, height: 667 };
  const ctx = await br.newContext({ viewport: vp, hasTouch: true, isMobile: true, recordVideo: { dir: VID, size: vp } }); const pg = await ctx.newPage(), errs = [], log = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => localStorage.clear()); await pg.goto(base); await pg.waitForSelector('#title');
  const t0 = Date.now(), el = () => ((Date.now() - t0) / 1000).toFixed(0) + 's';
  const tapXY = async (x, y) => { await pg.touchscreen.tap(x, y); await sleep(450); };
  const centre = async sel => pg.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: Math.min(r.top + r.height / 2, innerHeight - 4) } : null; }, sel);
  const tapSel = async sel => { const c = await centre(sel); if (c) { await tapXY(c.x, c.y); return true; } return false; };
  const note = m => { if (log[log.length - 1] !== m) { log.push(m); console.log(el(), m); } };
  await sleep(1200); await tapSel('.gxt-menu'); await sleep(900); note('Learn to play');
  let lastScr = '';
  while (Date.now() - t0 < 180000) {
    await sleep(350);
    const s = await pg.evaluate(() => {
      const c = window.GXT && GXT.active() ? GXT.current() : null, g = window.EC && EC.E.G();
      return { tut: c ? { id: c.id, next: !c.wait, shown: !!document.querySelector('.gxt-bub') } : null, end: !!document.querySelector('[data-gxt-end="pick"]'), pick: !!document.querySelector('#title.pick'),
        mode: UI.mode, scr: g && g.scr, ph: g && g.b && g.b.ph, sel: UI.sel, busy: !!UI.busy, ov: !!document.querySelector('.ov .grid .card, .ov.scry'), hp: g && g.hs && g.hs[0] ? g.hs[0].hp + '/' + g.hs[0].mhp : '', floor: g && g.floor };
    });
    if (s.tut) {
      if (!s.tut.shown) continue; note('guide: ' + s.tut.id);
      await sleep(900);
      if (s.tut.next) { await tapSel('.gxt-next'); continue; }
      const c = await pg.evaluate(() => { const st = GXT.current(); const t = st && st.target && st.target(); if (!t || !t.getBoundingClientRect) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.min(r.top + r.height / 2, innerHeight - 4) }; });
      if (c) await tapXY(c.x, c.y); continue;
    }
    if (s.end) { await sleep(1500); note('guide end card: Pick your hero'); await tapSel('[data-gxt-end="pick"]'); continue; }
    if (s.mode === 'title' && s.pick) { await sleep(1000); note('hero pick: Sable the Venom Rogue'); await tapSel('[data-hero="s"]'); await sleep(1200); await tapSel('#play'); continue; }
    if (await centre('.ec-goalc .btn')) { await sleep(2500); note('goal card: Climb'); await tapSel('.ec-goalc .btn'); continue; }
    if (s.mode !== 'game' || s.busy) continue;
    if (s.scr !== lastScr) { lastScr = s.scr; note('screen: ' + s.scr + ' (floor ' + s.floor + ', HP ' + s.hp + ')'); }
    if (s.ov) { if (!(await tapSel('.ov .grid .card'))) await tapSel('#scry-done'); await sleep(300); await tapSel('.ov .btn'); continue; }
    if (s.scr === 'battle') {
      if (s.ph !== 'p') continue;
      if (s.sel >= 0) { if (await tapSel('.en.glow')) continue; }
      // a newcomer: one Block card when a hit is coming and there is no Block yet, then attack
      const pickC = await pg.evaluate(() => { const g = EC.E.G(), h = g.hs[g.b.cur]; let inc = 0; g.b.en.forEach((e, i) => { if (!e.dead && e.intent && e.intent.atk) inc += EC.E.previewHit(i, g.b.cur) * (e.intent.hits || 1); });
        const ok = [...document.querySelectorAll('.hand .card.ok')]; if (!ok.length) return -1; const blk = ok.find(x => /Block/.test(x.textContent)), atk = ok.find(x => /Deal|damage/i.test(x.textContent));
        const c = (inc > h.blk && h.blk === 0 && blk) ? blk : (atk || ok[0]); return +c.getAttribute('data-c'); });
      if (pickC < 0) { const st = await pg.evaluate(() => { const g = EC.E.G(), h = g.hs[0]; return 'turn ' + g.b.turn + ' hero ' + h.hp + 'hp ' + h.blk + 'blk en ' + h.en + ' | ' + g.b.en.map(e => e.id + ' ' + e.hp + '/' + e.mhp + (e.dead ? ' dead' : '') + ' next ' + JSON.stringify(e.intent)).join(', '); }); if (process.env.TURNS) console.log(el(), st); await sleep(500); await tapSel('#end'); continue; }
      await tapSel('.hand .card[data-c="' + pickC + '"]'); await sleep(500);
      if (await tapSel('.en.glow')) continue;
      await tapSel('.hand .card.sel'); continue;
    }
    if (s.scr === 'reward') { await sleep(900); if (await tapSel('.reward .item:not(.taken)')) continue; if (await tapSel('.picks .card.w4rw')) continue; await tapSel('#leave'); continue; }
    if (s.scr === 'map') { await sleep(900); const ok = await pg.evaluate(() => { const ns = [...document.querySelectorAll('#map .node.glow')]; const e = ns[Math.floor(ns.length / 2)]; if (!e) return null; e.setAttribute('data-rec', '1'); return e.className; }); if (ok) { note('map: tap ' + ok); await tapSel('[data-rec="1"]'); } continue; }
    if (s.scr === 'event') { await sleep(1200); if (await tapSel('#ev-leave')) continue; await tapSel('#app .btn.alt'); continue; }
    if (s.scr === 'rest') { await sleep(900); const b = await pg.evaluate(() => { const x = [...document.querySelectorAll('#app button')].find(b => /Rest|Heal/i.test(b.textContent)); if (x) x.setAttribute('data-rec2', '1'); return !!x; }); if (b) await tapSel('[data-rec2="1"]'); else await tapSel('#app .btn'); continue; }
    if (s.scr === 'shop') { await sleep(1500); const b = await pg.evaluate(() => { const x = [...document.querySelectorAll('#app button')].find(b => /^Leave$/.test(b.textContent.trim())); if (x) x.setAttribute('data-rec3', '1'); return !!x; }); if (b) await tapSel('[data-rec3="1"]'); continue; }
    if (s.scr === 'over') { note('climb over'); await sleep(4000); break; }
  }
  const v = pg.video(); await ctx.close(); const src = await v.path(); const dst = path.join(OUT, 'f2-375x667-3min.webm'); fs.copyFileSync(src, dst); fs.rmSync(VID, { recursive: true, force: true });
  console.log('video', dst, (fs.statSync(dst).size / 1e6).toFixed(1) + ' MB', 'page errors', errs.length, errs.slice(0, 3).join(' | '));
  await br.close(); srv.close();
})();
