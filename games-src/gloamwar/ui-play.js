// Plays the human side through real touch taps only (dice, buttons, map, battle, cards) and reports any move the UI could not express.
// node ui-play.js [side=D] [turns=4] [url]   -> exit 1 if a move had no UI path or the page threw
const path = require('path'), { chromium } = (() => { try { return require(path.join(__dirname, '..', 'node_modules', 'playwright')); } catch (e) { return require('playwright'); } })();
const side = process.argv[2] || 'D', TURNS = +(process.argv[3] || 4), url = process.argv[4] || 'file://' + path.join(__dirname, 'gloamwar.html');
// proof mode: VIDEO=<dir> records a webm at 375x667, SECS=<n> stops after n seconds, SLOW=1 plays at human pace, SHOTS=<dir> saves screenshots of key moments
const VIDEO = process.env.VIDEO, SECS = +(process.env.SECS || 0), SLOW = !!process.env.SLOW, SHOTS = process.env.SHOTS, T0 = Date.now(); let shotN = 0; const shotDone = {};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +(process.env.W||375), height: +(process.env.H||667) }, hasTouch: true, isMobile: true, deviceScaleFactor: SHOTS ? 2 : 1, recordVideo: VIDEO ? { dir: VIDEO, size: { width: +(process.env.W||375), height: +(process.env.H||667) } } : undefined }); const p = await ctx.newPage();
  const shot = async (k) => { if (!SHOTS || shotDone[k]) return; shotDone[k] = 1; await p.waitForTimeout(500); await p.screenshot({ path: path.join(SHOTS, (++shotN) + '-' + k + '.png') }); };
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(SLOW ? url : url + (url.includes('?') ? '&' : '?') + 'fast=1'); await p.waitForTimeout(SLOW ? 2500 : 500); await shot('title');
  await p.tap(side === 'D' ? '#playD' : '#playG'); await p.waitForTimeout(SLOW ? 2500 : 600); await shot('goal'); if (await p.$('#goalGo')) { const gb = await (await p.$('#goalGo')).boundingBox(); if (SLOW) await p.waitForTimeout(1200); await p.touchscreen.tap(gb.x + gb.width / 2, gb.y + gb.height / 2); } await p.waitForTimeout(SLOW ? 1500 : 200); await shot('map');
  let gaps = [], taps = 0, moves = 0;
  const tapSel = async (sel) => { const e = await p.$(sel); if (!e) return false; await e.scrollIntoViewIfNeeded().catch(() => {}); const bb = await e.boundingBox(); if (!bb) return false; if (SLOW) await p.waitForTimeout(650); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); taps++; await p.waitForTimeout(SLOW ? 700 : 140); if (SLOW && /mydice/.test(sel)) await shot('die'); if (SLOW && /sheet/.test(sel) === false && /act\[data-key="card"\]/.test(sel)) await shot('cards'); return true; };
  const tapRegion = async (rid) => {   // tap the region polygon at a visible interior point (pan there first)
    const pt = await p.evaluate(rid => { MV.focus(rid, null, false); const r = REG[rid], bd = document.getElementById('board').getBoundingClientRect();
      const cand = [[r.x, r.y], [r.x, r.y + 40], [r.x - 30, r.y + 30], [r.x + 30, r.y + 30], [r.x, r.y - 30]].concat(r.poly.map(q => [(q[0] + r.x) / 2, (q[1] + r.y) / 2])).concat(r.poly.map(q => [q[0] * 0.25 + r.x * 0.75, q[1] * 0.25 + r.y * 0.75]));
      for (const c of cand) { const x = bd.left + c[0] * MV.k + MV.tx, y = bd.top + c[1] * MV.k + MV.ty; const el = document.elementFromPoint(x, y), t = el && el.closest && el.closest('[data-tap]'); if (t) { const v = t.getAttribute('data-tap').split(':'); if (v[1] === rid) return { x, y }; } }
      return { x: bd.left + r.x * MV.k + MV.tx, y: bd.top + r.y * MV.k + MV.ty }; }, rid);
    if (SLOW) await p.waitForTimeout(650); await p.touchscreen.tap(pt.x, pt.y); taps++; await p.waitForTimeout(SLOW ? 700 : 140);
  };
  const actKey = k => '#acts .act[data-key="' + k + '"]';
  for (let guard = 0; guard < 900; guard++) {
    const st = await p.evaluate(() => ({ win: !!G.win, turn: G.turn, me: sideToAct(G) === UI.side && !UI.hold, pend: G.pend && G.pend.h, stage: G.pend && G.pend.d && G.pend.d.stage }));
    if (st.win) { await p.waitForTimeout(1500); await shot('result'); }
    if (st.win || st.turn > TURNS || (SECS && Date.now() - T0 > SECS * 1000)) break;
    if (st.turn >= 5) await shot('midgame');
    if (st.pend === 'battle') await shot('battle');
    if (SLOW && st.pend === 'battle') await shot('battle');
    if (!st.me) { await p.waitForTimeout(120); continue; }
    const m = await p.evaluate(() => { const m = AI.move(G, 'normal'); return m; });
    const key0 = await p.evaluate(() => JSON.stringify([G.turn, G.phase, G.pend && G.pend.h, G.used, G.F, G.hand, G.pend && G.pend.d && G.pend.d.stage, G.pend && G.pend.d && (G.pend.d.n || G.pend.d.got || G.pend.d.i), Object.keys(G.A).length, G.log.length]));
    let done = false;
    try {
      if (st.pend === 'battle') {
        const label = { field: 'field', walls: 'walls', cont: 'Fight on', cease: 'Stop', stand: 'Stand', retreat: 'Retreat', extend: 'Press on', stop: 'End the siege', stay: 'Stay', adv: 'Advance' }[m.t];
        if (m.t === 'bcard') done = m.c ? await tapSel('#battle .bcard[data-c="' + m.c + '"]') : await p.evaluate(() => { const b = [...document.querySelectorAll('#bacts .btn')].find(x => /No card/.test(x.textContent)); if (b) { b.click(); return true; } return false; });
        else { const bt = await p.$$('#bacts .btn'); for (const x of bt) { const tx = await x.textContent(); if (tx.indexOf(label) >= 0) { const bb = await x.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); taps++; done = true; break; } } }
      } else if (m.t === 'cdone') done = await tapSel(actKey('cdone'));
      else if (m.t === 'declare' || m.t === 'place') { await tapRegion(m.to); done = true; }
      else if (m.t === 'road') done = await tapSel(actKey('road'));
      else if (m.t === 'guide') done = await tapSel(actKey('guide'));
      else if (m.t === 'hunt') done = await tapSel(actKey('hunt' + m.n));
      else if (m.t === 'pass') done = await tapSel(actKey('pass'));
      else if (m.t === 'lamp') { if (await tapSel(actKey('lamp'))) done = await tapSel(actKey('lamp-' + m.f)); }
      else if (m.t === 'die') {
        await tapSel('#mydice .die[data-i="' + m.i + '"]'); if (m.as) await tapSel(actKey('as-' + m.as));
        if (m.a === 'card') { if (await tapSel(actKey('card'))) done = await tapSel('#sheet [data-p="' + m.c + '"]'); }
        else if (m.a === 'dip' || m.a === 'draw') { if (await tapSel(actKey(m.a))) { const k2 = actKey(m.a === 'dip' ? 'dip-' + m.n : 'draw-' + m.d); if (await p.$(k2)) await tapSel(k2); done = true; } }
        else if (m.a === 'minion' || m.a === 'hero') done = await tapSel(actKey(m.a + '-' + m.c));
        else if (['attack', 'lattack', 'lmove', 'sortie'].includes(m.a)) { if (await tapSel(actKey(m.a))) { const choose = await p.evaluate(() => !!(UI.src && UI.src.kind === 'attackFrom')); if (choose) await tapRegion(m.from); done = true; } }
        else done = await tapSel(actKey(m.a));
      } else if (m.t === 'taint') done = await tapSel(actKey('taint'));
      else if (m.t === 'absorb') done = await tapSel(actKey('absorb-' + m.c));
      else if (m.t === 'discard') { await p.waitForTimeout(100); done = await tapSel('#sheet [data-d="' + m.c + '"]'); }
      else if (m.t === 'mv') { await tapRegion(m.from); await tapRegion(m.to); done = true; }
      else if (m.t === 'nz') { await tapRegion(m.from); await tapRegion(m.to); done = true; }
      else if (m.t === 'cm') { await tapRegion(await p.evaluate(c => G.C[c], m.c)); await tapRegion(m.to); done = true; }
      else if (['mvdone', 'cmdone', 'nzdone', 'recdone', 'cancel', 'eskip'].includes(m.t)) done = await tapSel(actKey(m.t));
      else if (m.t === 'atk') { await tapRegion(m.to); done = true; }
      else if (m.t === 'rec') { await tapRegion(m.rid); const k = await p.$(actKey('rec-' + m.k)); if (k) await tapSel(actKey('rec-' + m.k)); done = true; }
      else if (m.t === 'erec') { await tapRegion(m.rid); done = true; }
      else if (m.t === 'sep') { if (await tapSel(actKey('sep-' + m.cs.join()))) { await tapRegion(m.to); done = true; } }
      else if (m.t === 'ehit') { await tapRegion(m.r.replace('in:', '')); done = true; }
      else if (m.t === 'eatk') { const many = await p.evaluate(() => /attacking army/.test(document.getElementById('msg').textContent)); if (many) await tapRegion(m.from); await tapRegion(m.to); done = true; }
      else if (m.t === 'ewake' || m.t === 'epol') done = await tapSel(actKey(m.t + m.n));
      else if (m.t === 'ekill') done = await tapSel(actKey('ekill'));
      else if (m.t === 'esortie') done = await tapSel(actKey('esortie'));
    } catch (e) { done = false; }
    await p.waitForTimeout(150);
    const key1 = await p.evaluate(() => JSON.stringify([G.turn, G.phase, G.pend && G.pend.h, G.used, G.F, G.hand, G.pend && G.pend.d && G.pend.d.stage, G.pend && G.pend.d && (G.pend.d.n || G.pend.d.got || G.pend.d.i), Object.keys(G.A).length, G.log.length]));
    if (!done || key1 === key0) {
      const sameTurn = await p.evaluate(() => sideToAct(G) === UI.side && !UI.hold);
      if (sameTurn && key1 === key0) { const dbg = await p.evaluate(() => document.getElementById('msg').textContent + ' | acts: ' + [...document.querySelectorAll('#acts .act')].map(a => a.dataset.key).join(',') + ' | die ' + UI.die + ' sheet ' + UI.sheet); gaps.push(JSON.stringify(m) + ' @' + (st.pend || 'top') + ' :: ' + dbg); await p.evaluate(m => { closeSheet(); apply(m); }, m); }
    }
    moves++;
  }
  const end = await p.evaluate(() => ({ turn: G.turn, win: G.win, vp: [vpOf(G, 'D'), vpOf(G, 'G')], taint: G.F.taint }));
  console.log(`ui-play ${side}: ${moves} moves, ${taps} taps, ${gaps.length} without a UI path, page errors ${errs.length} | ${JSON.stringify(end)}`);
  gaps.slice(0, 12).forEach(g => console.log('  GAP', g)); errs.slice(0, 5).forEach(e => console.log('  ERR', e));
  await ctx.close(); await b.close(); process.exit(gaps.length || errs.length ? 1 : 0);
})();
