// Tap-an-enemy test (owner blocker, 8 Nov): play a card that needs a target, then tap the enemy, by REAL touch on phone (390x844,
// page.touchscreen.tap at the enemy's centre) and by mouse on PC (1440x860). Also plays one whole fight by touch to a win.
// Run: node tools/tap-enemy.js [url]   (default: local build served from this folder; pass the live URL to check the live site)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), MT = { '.html': 'text/html', '.webp': 'image/webp', '.mp4': 'video/mp4', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let p = path.join(ROOT, u); if (u === '/' || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = u === '/' || u === '/emberclimb.html' ? path.join(ROOT, 'emberclimb.html') : path.join(ROOT, '..', '..', 'games', 'emberclimb', u); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MT[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = process.argv[2] || ('http://127.0.0.1:' + srv.address().port + '/emberclimb.html');
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    const tapAt = async el => { const b = await el.boundingBox(); if (!b) return false; const x = b.x + b.width / 2, y = b.y + b.height / 2; if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); return true; };
    const blocker = el => el.evaluate(n => { const r = n.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && !n.contains(t) ? (t.className || t.tagName) + '' : ''; });
    // a real Quick game from the title, through the Goal card (the way the owner plays)
    await pg.goto(base + (base.includes('?') ? '&' : '?') + 'noguide=1'); await sleep(1800);
    await pg.evaluate(() => { try { localStorage.clear(); } catch (e) { } document.querySelectorAll('[data-gxt-skip]').forEach(b => b.click()); });
    await pg.evaluate(() => { EC.E.clear && EC.E.clear(); EC.E.newGame({ heroes: ['w'], seed: 4242 }); UI.mode = 'game'; UI.render(); if (UI.goalCard) UI.goalCard(); }); await sleep(600);
    const go = await pg.$('#goal-go'); if (go) { await tapAt(go); await sleep(400); }
    for (let k = 0; k < 4; k++) { const x = await pg.$('.gxh-card .gxh-x, .gxh-close, [data-help-close], .gxh-skip'); if (!x) break; await tapAt(x); await sleep(300); }   // first-turn help card
    const node = await pg.$('.node.glow'); if (node) { await tapAt(node); await sleep(1500); }
    let fights = 0, won = false, firstHit = null;
    for (let step = 0; step < 400 && !won; step++) {
      const s = await pg.evaluate(() => { const g = EC.E.G(); return g ? { scr: g.scr, ph: g.b && g.b.ph, busy: !!UI.busy, en: g.b ? g.b.en.map(e => e.hp) : [] } : {}; });
      if (s.scr === 'reward' || s.scr === 'map' && fights) { won = true; break; }
      if (s.scr === 'over') break;
      if (s.scr !== 'battle' || s.ph !== 'p' || s.busy) { await sleep(250); continue; }
      fights = 1;
      const help = await pg.$('.gxh-card, .gxh-pop, .gxh-dlg'); if (help && await help.isVisible()) { const x = await pg.$('.gxh-card button, .gxh-pop button, .gxh-dlg button'); if (x) { await tapAt(x); await sleep(300); continue; } }
      const cards = await pg.$$('.hand .card.ok'); let played = false;
      for (const c of cards) {
        const tgt = await c.evaluate(n => { const g = EC.E.G(); if (!g || !g.b || g.b.cur < 0) return null; const h = g.hs[g.b.cur], i = +n.getAttribute('data-c'); return h.hand[i] ? !!EC.E.eff(h.hand[i]).tgt : null; }).catch(() => null); if (tgt === null) break;
        await tapAt(c); await sleep(350);
        if (tgt) {
          const en = (await pg.$$('.en.glow'))[0]; if (!en) { if (firstHit == null) { firstHit = 'no glowing enemy after lifting a target card'; } continue; }
          const blk = await blocker(en), hp0 = await pg.evaluate(() => EC.E.G().b.en.map(e => e.hp + e.blk).join(','));
          await tapAt(en); const dbg = []; for (let w = 0; w < 6; w++) { await sleep(300); dbg.push(await pg.evaluate(() => { const g = EC.E.G(); return (g.b ? g.b.ph + ':' + UI.sel + ':' + (UI.busy ? 'B' : '-') + ':' + g.b.en.map(e => e.hp + e.blk).join('/') : g.scr); })); } if (process.env.DBG) console.log(name, hp0, dbg.join(' '));
          const hp1 = await pg.evaluate(() => { const g = EC.E.G(); return g.b ? g.b.en.map(e => e.hp + e.blk).join(',') : 'done'; });
          if (firstHit == null) firstHit = hp1 !== hp0 ? '' : 'tap on enemy did nothing' + (blk ? ' (covered by ' + blk + ')' : '');
        } else { const sel = await pg.$('.hand .card.sel'); if (sel) { await tapAt(sel); await sleep(500); } }
        played = true; break;
      }
      if (!played) { const e = await pg.$('#end'); if (e) { await tapAt(e); await sleep(1500); } }
    }
    if (firstHit) { bad++; console.log('FAIL', name, firstHit); } else if (firstHit === '') console.log('PASS', name, 'tap enemy by ' + (touch ? 'touch' : 'mouse'));
    else { bad++; console.log('FAIL', name, 'never tried a target card'); }
    if (!won) { bad++; console.log('FAIL', name, 'fight not won by ' + (touch ? 'touch' : 'mouse')); } else console.log('PASS', name, 'fight won by ' + (touch ? 'touch' : 'mouse'));
    if (errs.length) { bad++; console.log('FAIL', name, 'page errors', errs.slice(0, 2).join(' | ')); }
    await pg.screenshot({ path: '/tmp/claude-0/tap-' + name + '.png' }); await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'TAP-ENEMY FAIL' : 'TAP-ENEMY PASS'); process.exit(bad ? 1 : 0);
})();
