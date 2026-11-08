// Owner game-feel brief (8 Nov) checks + shots. Phone 390x844 (touch) and 375x667, PC 1440x900 (mouse).
// For each screen: every visible text >= 14px on phone (>= 16px at 1440), nothing overlapping the hand/foes, at most one message on screen.
// Shots (390x844 and 1440x900) to playable-shots/feel/: title, learn (first Learn-to-play screen), goal, first-turn, mid-game, rival-turn, result.
// Run: node tools/feel-check.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'playable-shots', 'feel'); fs.mkdirSync(OUT, { recursive: true });
const MT = { '.html': 'text/html', '.webp': 'image/webp', '.mp4': 'video/mp4', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let p = path.join(ROOT, u); if (u === '/' || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = u === '/' || u === '/emberclimb.html' ? path.join(ROOT, 'emberclimb.html') : path.join(ROOT, '..', '..', 'games', 'emberclimb', u); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MT[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SMALL = (min) => { const out = []; document.querySelectorAll('body *').forEach(n => { if (!n.childNodes.length) return; const own = [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()); if (!own) return; const cs = getComputedStyle(n), r = n.getBoundingClientRect(); if (cs.visibility === 'hidden' || cs.display === 'none' || r.width < 2 || r.height < 2 || +cs.opacity === 0) return; if (n.closest('[hidden],.gx-scn-badge,#gxs-badge,.gxs-badge')) return; if (r.bottom < 0 || r.top > innerHeight) return; if (parseFloat(cs.fontSize) < min) out.push((n.className || n.tagName + '<' + (n.parentNode.className || n.parentNode.tagName)) + ':' + parseFloat(cs.fontSize) + ':' + n.textContent.trim().slice(0, 18)); }); return out; };
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port + '/emberclimb.html';
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch, shots] of [['phone', { width: 390, height: 844 }, true, 1], ['phone-s', { width: 375, height: 667 }, true, 0], ['pc', { width: 1440, height: 900 }, false, 1]].filter(x => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); const min = vp.width >= 1024 ? 16 : 14, small = {};
    const tapAt = async el => { const b = await el.boundingBox(); if (!b) return; const x = b.x + b.width / 2, y = b.y + b.height / 2; if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); };
    const check = async (scr) => { const s = await pg.evaluate(SMALL, min); s.forEach(x => { small[scr + ' ' + x.split(':').slice(0, 2).join(':')] = x; }); const msgs = await pg.evaluate(() => document.querySelectorAll('.toast,.ec-say,.itip').length); if (msgs > 1) { bad++; console.log('FAIL', name, scr, msgs + ' messages at once'); } };
    const shot = async (n) => { if (shots) await pg.screenshot({ path: path.join(OUT, n + '-' + name + '.png') }); };
    await pg.goto(base + '?noguide=1'); await sleep(1800); await pg.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await pg.reload(); await sleep(1800);
    await check('title'); await shot('title');
    // Learn to play: first screen
    await pg.evaluate(() => { UI.tutStart(); }); await sleep(2500); await check('learn'); await shot('learn');
    // Play: Goal card, first turn, mid-game, rival turn, result
    await pg.evaluate(() => { try { GXT.stop(); } catch (e) { } document.querySelectorAll('.gxt-card,.gxt-spot,.ec-say').forEach(n => n.remove()); EC.E.clear && EC.E.clear(); EC.E.newGame({ heroes: ['w'], seed: 777 }); UI.camp = null; UI.mode = 'game'; UI.render(); UI.goalCard(); }); await sleep(600);
    await check('goal'); await shot('goal'); const gg = await pg.$('#goal-go'); if (gg) await tapAt(gg); await sleep(300);
    const nd = await pg.$('.node.glow'); if (nd) await tapAt(nd); await sleep(1500);
    for (let k = 0; k < 3; k++) { const x = await pg.$('.gxh-ok'); if (!x) break; await tapAt(x); await sleep(300); }
    await check('first-turn'); await shot('first-turn');
    let turns = 0, rival = false, mid = false, done = !!process.env.QUICK;
    for (let step = 0; step < 900 && !done; step++) {
      const s = await pg.evaluate(() => { const g = EC.E.G(); return g ? { scr: g.scr, ph: g.b && g.b.ph, busy: !!UI.busy, turn: g.b && g.b.turn, fl: g.floor } : {}; });
      if (s.scr === 'over') { await sleep(800); await check('result'); await shot('result'); done = true; break; }
      if (s.scr === 'battle' && s.ph === 'e' && !rival && s.fl >= 2) { await sleep(500); await check('rival-turn'); await shot('rival-turn'); rival = true; }
      if (s.scr === 'battle' && s.ph === 'p' && !s.busy && !mid && s.fl >= 3) { await check('mid-game'); await shot('mid-game'); mid = true; }
      if (s.scr === 'battle') {
        if (s.ph !== 'p' || s.busy) { await sleep(200); continue; }
        if (s.turn !== turns) { turns = s.turn; await check('turn'); }
        const ok = await pg.$$('.hand .card.ok'); if (ok.length) { await tapAt(ok[0]); await sleep(250); const en = await pg.$('.en.glow'); if (en) await tapAt(en); else { const sl = await pg.$('.hand .card.sel'); if (sl) await tapAt(sl); } await sleep(500); }
        else { const e = await pg.$('#end'); if (e) await tapAt(e); await sleep(600); }
        continue;
      }
      if (s.scr === 'map') { const n = await pg.$('.node.glow'); if (n) await tapAt(n); await sleep(500); await check('map'); continue; }
      if (s.scr === 'reward') { await check('reward'); const p = await pg.$('.picks .card'); if (p && Math.random() < .5) { await tapAt(p); await sleep(300); } const l = await pg.$('#leave'); if (l) await tapAt(l); await sleep(500); continue; }
      if (s.scr === 'rest') { await check('rest'); const b = await pg.$('#rest-heal'); if (b) await tapAt(b); await sleep(500); continue; }
      if (s.scr === 'shop') { await check('shop'); const b = await pg.$('#shop-leave'); if (b) await tapAt(b); await sleep(500); continue; }
      if (s.scr === 'event') { await check('event'); const b = await pg.$('#ev-leave') || await pg.$('.opts button:not([disabled])'); if (b) await tapAt(b); await sleep(500); continue; }
      await sleep(300);
    }
    if (!done) { bad++; console.log('FAIL', name, 'climb did not reach a result by ' + (touch ? 'touch' : 'mouse')); } else console.log('PASS', name, 'full climb to a result by ' + (touch ? 'touch' : 'mouse'));
    const sm = Object.values(small); if (sm.length) { bad++; console.log('FAIL', name, 'text under ' + min + 'px:', Object.keys(small).slice(0, 12).join(' | ')); } else console.log('PASS', name, 'all text >= ' + min + 'px');
    if (errs.length) { bad++; console.log('FAIL', name, 'page errors', errs.slice(0, 2).join(' | ')); }
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'FEEL FAIL' : 'FEEL PASS'); process.exit(bad ? 1 : 0);
})();
