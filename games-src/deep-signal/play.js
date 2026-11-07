// Plays Deep Signal like a player with real taps/clicks: the tutorial and N quick missions (Story stages: story-test.js) to a result. Phone 390x763 and PC 1440x860.
// Usage: node play.js <url to the page> [missions per run=3] [runs per size=2]     (screens land in shots/)
const { chromium } = require('playwright');
const url = process.argv[2], NM = +process.argv[3] || 3, RUNS = +process.argv[4] || 2;
(async () => {
  const b = await chromium.launch(); let fails = 0; const found = [];
  for (const [nm, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) for (let run = 0; run < RUNS; run++) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const tap = async sel => { const l = typeof sel === 'string' ? p.locator(sel).first() : sel; await l.scrollIntoViewIfNeeded().catch(() => { }); return touch ? l.tap({ timeout: 4000 }) : l.click({ timeout: 4000 }); };
    const vis = async sel => (await p.locator(sel).count()) && await p.locator(sel).first().isVisible().catch(() => false);
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'fast=1'); await p.waitForTimeout(500);
    const ptap = async sel => { const bx = await p.locator(sel).first().boundingBox().catch(() => null); if (!bx) return; const x = bx.x + Math.min(10, bx.width / 2), y = bx.y + Math.min(30, bx.height / 2); if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
    const tutRun = async () => { let reached = false; for (let i = 0; i < 300; i++) { await p.waitForTimeout(150); const st = await p.evaluate(() => { const c = GXT.active() && GXT.current(); return GXT.state && GXT.state().phase === 'end' ? 'end' : c ? c.id : 'off'; }); if (st === 'end') { reached = true; break; } if (st === 'off') break;
      if (await vis('.gxt-next')) { await ptap('.gxt-next'); continue; } if (st === 'task') await ptap('#pool .tcard'); if (st === 'lead') await ptap('#hand .cd[data-c="c9"]'); } return reached; };
    // one player decision by real taps; returns false when nothing to do
    const act = async () => {
      if (await vis('.gxh-bub button,.gxh-bubble button')) { await tap('.gxh-bub button,.gxh-bubble button').catch(() => { }); return true; }
      if (await vis('#zoom.on')) { await tap('#zoom.on #zrow .btn:last-child'); return true; }
      if (await vis('#pool .tcard.legal')) { const i = await p.evaluate(() => AIX.draftPick(G, G.draftTurn)); await tap(p.locator('#pool .tcard').nth(i)); return true; }
      if (await vis('#askp.on .btn')) { const yes = await p.evaluate(() => G.phase === 'ask' && askWho(G) === 0 ? AIX.answer(G, 0) : null); if (yes != null) await tap(yes ? '#askp .btn.pri' : '#askp .btn:not(.pri)'); else { const c = await p.evaluate(() => { const q = AIX.act(G, 0, 'normal'); return q && q.p; }); await tap(p.locator('#askp .btn').nth(Math.max(0, await p.evaluate(c => chooseTargets(G).indexOf(c), c)))); } return true; }
      if (await vis('#hand .cd.legal')) { const c = await p.evaluate(() => AIX.choosePlay(G, G.turn, 'normal')); let bx = await p.locator(`#hand .cd.legal[data-c="${c}"]`).boundingBox().catch(() => null); if (!bx) bx = await p.locator('#hand .cd.legal').first().boundingBox(); if (!bx) return false; if (touch) await p.touchscreen.tap(bx.x + 8, bx.y + 20); else await p.mouse.click(bx.x + 8, bx.y + 20); return true; }
      return false;
    };
    const playMission = async (tag) => { let last = '', same = 0; for (let i = 0; i < 900; i++) { const fp = await p.evaluate(() => G.moves + ':' + G.phase + ':' + UI.hold); if (fp === last) { if (++same === 120) console.log('DEBUG', await p.evaluate(() => { const e = document.querySelector('#hand .cd.legal'); if (!e) return 'no legal; ' + line(sideToAct(G)) + ' s=' + sideToAct(G) + ' zoom=' + $('#zoom').className; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + 8, r.top + 20); return 'top at legal: ' + t.className + ' / ' + (t.parentElement && t.parentElement.className); })); } else { same = 0; last = fp; } if (await p.evaluate(() => !!(G && G.result && UI.ended))) return p.evaluate(() => G.result); if (!(await act())) await p.waitForTimeout(80); } return null; };
    // 1) tutorial (real taps on what each step spotlights)
    await tap('[data-gxt-open]'); await p.waitForTimeout(400);
    const tdone = await tutRun();
    await p.waitForTimeout(600); await p.screenshot({ path: `shots/play-${nm}-tutend.png` }); if (!tdone) { fails++; found.push(nm + ': tutorial did not finish'); }
    console.log(nm, run, 'tutorial', tdone ? 'PASS' : 'FAIL');
    // leave the end card -> setup
    await p.waitForTimeout(800); for (const s of ['.gxt-endc button', '.gxt-end button', '.gxt-dlg button']) if (await vis(s)) { await ptap(s); break; }
    // 2) quick missions
    if (!(await vis('#setup.on'))) await p.evaluate(() => showSetup());
    for (let m = 0; m < NM; m++) {
      if (await vis('#setup.on')) { for (let k = 0; k < (run * 3 + m * 4) % 20; k++) await tap('#mPlus'); await tap('#startB'); }
      const r = await playMission(); const mn = await p.evaluate(() => G.mission.n);
      if (!r) { fails++; found.push(nm + ' mission ' + mn + ': no result'); await p.screenshot({ path: `shots/play-${nm}-stuck.png` }); console.log(nm, 'STUCK', await p.evaluate(() => render_game_to_text(G))); break; }
      console.log(nm, run, 'mission', mn, r.ok ? 'complete' : 'lost: ' + r.why);
      await p.waitForSelector('#res.on', { timeout: 8000 }).catch(() => { }); if (m === 0) await p.screenshot({ path: `shots/play-${nm}-result.png` });
      if (!(await vis('#res.on'))) { fails++; found.push(nm + ': no result screen'); break; }
      await tap('#resRow .btn:nth-child(2)');   // Change setup
    }
        console.log(nm, run, 'errors', errs.length, errs.slice(0, 3).join(' | ')); if (errs.length) { fails++; found.push(nm + ' errors: ' + errs[0]); }
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'PLAY FAIL ' + found.join('; ') : 'PLAY PASS'); process.exit(fails ? 1 : 0);
})();
