#!/usr/bin/env node
// HUB (parts/menus/hub.js, flag RET.hub): every feature within 2 taps of HOME, <= 6 main actions per screen (the labelled MORE row aside),
// (runs with ?school=0 = the old TRAINING sheet; the school list has its own school-test.js; and ?focus=0: the live title is FOCUS mode, the full hub it tests sits behind that flag, focus-test covers the live title)
// one header everywhere (back arrow, title, Neon), nothing overlapping, no page errors, ?hub=0 = the old title + MENU sheet. Headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/hub-test.js     env: GAME_DIR=...
//   SMOKE=1: fast gate: every screen and every feature is still checked, but at 390x763 only (the nightly run keeps all 4 sizes and 375x553 features)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SMOKE = !!process.env.SMOKE, SIZES = SMOKE ? [[390, 763]] : [[390, 763], [375, 553], [763, 390], [1366, 768]];
// [feature, home tile, door selector on the 2nd screen, check after the 2nd tap]
const VIS = s => { const e = document.querySelector(s); if (!e) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } return true; };
const F = [
  ['stage map', '#hub_missions', '[data-door="#storyBtn"]', 'VIS("#stsel")'],
  ['street run', '#hub_missions', '[data-door="#footBtn"]', 'true'],   // locked until stage 3: the door is there and answers
  ['endless', '#hub_missions', '[data-door="#startBtn"]', '__mnr.running'],
  ['daily', '#hub_missions', '[data-door="#dailyBtn"]', '__mnr.running&&__mnr.G.daily'],
  ['weekly', '#hub_missions', '[data-door="#wkBtn"]', '__mnr.running&&__mnr.G.weekly>0'],
  ['difficulty', '#hub_missions', '[data-door="#diffBtn"]', '!/NORMAL/.test(document.getElementById("diffBtn").textContent)'],
  ['hangar: ship', '#hub_hangar', '#garage .tabs [data-t=ships]', 'VIS("#garage")&&__hubTab()==="ships"'],
  ['hangar: weapons', '#hub_hangar', '#garage .tabs [data-t=weapons]', '__hubTab()==="weapons"'],
  ['hangar: forge', '#hub_hangar', '#mfMore|#h3M_forge', '__hubTab()==="forge"'],
  ['hangar: pilot class', '#hub_hangar', '#garage .tabs [data-t=pilot]', '__hubTab()==="pilot"'],
  ['hangar: upgrades', '#hub_hangar', '#garage .tabs [data-t=tune]', '__hubTab()==="tune"'],
  ['hangar: ability', '#hub_hangar', '#mfMore|#h3M_abil', '__hubTab()==="abil"'],
  ['hangar: crew', '#hub_hangar', '#mfMore|#h3M_crew', '__hubTab()==="crew"'],
  ['hangar: looks', '#hub_hangar', '#mfMore|#h3M_looks', '__hubTab()==="looks"'],
  ['hangar: load', '#hub_hangar', '#mfMore|#h3M_load', '__hubTab()==="load"'],
  ['hangar: shop', '#hub_hangar', '#mfMore|#h3M_mkt', '__hubTab()==="mkt"'],
  ['weapon pick', '#hub_hangar', '#mfMore|#h3M_pick', 'VIS("#wpm")'],
  ['flight school', '#hub_training', '[data-door="#tutBtn"]', 'document.getElementById("title").hidden'],
  ['lessons', '#hub_training', '[data-door="#lsBtn"]', 'VIS("#lsC")'],
  ['practice', '#hub_training', '.hubAct:nth-child(3)', 'VIS("#stsel")'],
  ['lab', '#hub_training', '[data-door="#labBtn"]', 'document.getElementById("title").hidden'],
  ['stats', '#hub_profile', '[data-door="#statsBtn"]', 'VIS("#stSheet")'],
  ['story log', '#hub_profile', '.hubAct:nth-child(2)', 'VIS("#sgLog")||VIS("#taleLog")'],
  ['settings', '#hub_profile', '.hubAct:nth-child(3)', 'VIS("#setm")'],
  ['saves / export', '#hub_profile', '.hubAct:nth-child(4)', 'VIS("#setm")&&VIS("#svBox")&&VIS("#sioBox")&&(window.__tidy?__tidy.page()==="more":Math.abs(document.getElementById("hubSG_da").getBoundingClientRect().top-document.getElementById("setBody").getBoundingClientRect().top)<40)'],
  ['full screen', '#hub_profile', '[data-door="#fsBtn"]', 'true'],
  ['update check', '#hub_profile', '.hubMore button:nth-child(2)', 'VIS("#setm")&&VIS("#stampBtn")'],
  ['build stamp', '#hub_profile', null, '/build /.test(document.getElementById("hubStamp").textContent)'],
  ['controls legend', '#hub_training', null, 'VIS("#hub_trainingScr .keys")'],
  ['music mix (settings > audio)', '#hub_profile', '.hubAct:nth-child(3)', 'VIS(\'#setBody .seg[data-k="mus"]\')'],
];
/* the screen audit: main actions (MORE row, back arrow, cards, settings options aside), header, overlap */
const AUD = (root) => {
  const R = [...document.querySelectorAll(root)].find(e => !e.hidden) || document.querySelector(root); if (!R) return { missing: 1 };
  const shown = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const acts = [...R.querySelectorAll('button')].filter(b => shown(b) && b.classList.contains('go') && !b.closest('.tabs,.hubMore,.card,.seg,#setBody,.hubHd,.top,.bot,.sfoot,#svBox,#sioBox,#stampRow') && !b.classList.contains('hubSec') && !b.classList.contains('hubBk'));
  const tabs = [...R.querySelectorAll('.tabs button')].filter(b => shown(b) && !b.classList.contains('hubSec'));
  const hd = R.querySelector('.hubHd') || R.querySelector('.top'), bk = hd && hd.querySelector('.hubBk'), n = hd && hd.querySelector('.hubN,.neon'), t = hd && hd.querySelector('.ttl');
  const hr = hd && hd.getBoundingClientRect(), br = bk && bk.getBoundingClientRect();
  const boxes = acts.concat(tabs).map(b => [b.id || b.textContent.trim().slice(0, 12), b.getBoundingClientRect()]), ov = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i][1], b = boxes[j][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ov.push(boxes[i][0] + '/' + boxes[j][0]); }
  return { n: acts.length + tabs.length, names: acts.concat(tabs).map(b => b.textContent.trim().slice(0, 14)), hd: !!(hd && bk && n && t && shown(bk) && br.width >= 43.5 && br.height >= 43.5 && hr.top < 80 && br.left < hr.left + 60 && /◆|\d/.test(n.textContent + n.innerHTML)), title: t && t.textContent, ov, wide: document.documentElement.scrollWidth > innerWidth + 1 };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', init = null) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 800 });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + ' ' + e.message));
    await p.addInitScript(() => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', '1'); } } catch (e) { } });
    if (init) await p.addInitScript(init);
    await p.goto(`http://127.0.0.1:${port}/index.html${(q ? q + '&' : '?') + 'school=0&focus=0'}`); await p.waitForFunction(() => window.__mnr && window.RET && document.documentElement.classList.contains('rdy'), null, { timeout: 9000 }); await sleep(300);
    await p.evaluate(`window.VIS=${VIS.toString()};window.__hubTab=()=>{const b=document.querySelector('#garage .tabs button.on[data-t]');return b&&b.dataset.t;}`); return p; };
  let taps = 0;
  const tap = async (p, sel) => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => { }); const b = await l.boundingBox(); if (!b) throw new Error('not on screen: ' + sel); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); taps++; await sleep(SMOKE ? 250 : 350); };
  for (const [w, h] of SIZES) {
    const tag = ` ${w}x${h}`;
    // ---- HOME ----
    let p = await open(w, h);
    const home = await p.evaluate(() => { const ids = ['playBtn', 'hubStat', 'hub_missions', 'hub_hangar', 'hub_training', 'hub_profile'], r = {}; for (const i of ids) { const e = document.getElementById(i); r[i] = e && VIS('#' + i) ? e.getBoundingClientRect().toJSON() : null; }
      const btn = [...document.querySelectorAll('#title button')].filter(b => !b.closest('#hubStory')).filter(b => { for (let x = b; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } const q = b.getBoundingClientRect(); return q.width > 0 && q.bottom > 0 && q.top < innerHeight; });
      return { r, n: btn.length, names: btn.map(b => b.id), H: innerHeight, W: innerWidth, hub: document.documentElement.classList.contains('hub') }; });
    const R = home.r, all = Object.values(R).every(Boolean);
    ok('HOME: PLAY + status strip + exactly 4 sections (+ the Story slot), nothing else to tap' + tag, home.hub && all && home.n === 5, JSON.stringify(home.names));
    const big = R.playBtn && R.hub_missions && R.playBtn.height >= R.hub_missions.height && R.playBtn.width > R.hub_missions.width * 1.4;
    ok('HOME: PLAY is the dominant button' + tag, big, JSON.stringify([R.playBtn, R.hub_missions]));
    const rs = Object.entries(R).filter(x => x[1]), ovl = [];
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i][1], b = rs[j][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ovl.push(rs[i][0] + '/' + rs[j][0]); }
    ok('HOME: nothing overlaps, all on screen' + tag, !ovl.length && rs.every(x => x[1].bottom <= home.H + 1 && x[1].right <= home.W + 1 && x[1].left >= -1), JSON.stringify(ovl));
    // ---- each screen: <= 6 main actions, header, overlap ----
    for (const [tile, root] of [['#hub_missions', '#hub_missionsScr'], ['#hub_training', '#hub_trainingScr'], ['#hub_profile', '#hub_profileScr'], ['#hub_hangar', '#garage']]) {
      await p.evaluate(() => { if (__hub.cur()) __hub.shut(); const g = document.getElementById('garage'); if (!g.hidden) document.getElementById('gaBack').click(); });
      await tap(p, tile); const a = await p.evaluate(AUD, root);
      ok(`${root}: <= 6 main actions (${a.n}), MORE row for the rest` + tag, a.n >= 3 && a.n <= 6, JSON.stringify(a.names));
      ok(`${root}: header = back arrow + title + Neon` + tag, a.hd, JSON.stringify(a));
      ok(`${root}: no overlap, no sideways scroll` + tag, !a.ov.length && !a.wide, JSON.stringify(a.ov));
    }
    await p.context().close();
    if (w > 400 && w !== 763) continue;
    // ---- the other screens a section opens share the header ----
    for (const [name, tile, door, root] of [['settings', '#hub_profile', '.hubAct:nth-child(3)', '#setm'], ['stage map', '#hub_missions', '[data-door="#storyBtn"]', '#stsel'], ['story log', '#hub_profile', '.hubAct:nth-child(2)', '#sgLog,#taleLog'], ['stats', '#hub_profile', '[data-door="#statsBtn"]', '#stSheet'], ['weapon pick', '#hub_hangar', '#mfMore|#h3M_pick', '#wpm']]) {
      p = await open(w, h); await tap(p, tile); for (const d of door.split('|')) await tap(p, tile === '#hub_hangar' ? d : tile + 'Scr ' + d); await sleep(300);
      if (root === '#stSheet') await p.evaluate(() => { const s = document.getElementById('stSheet'); s.scrollTop = 0; });
      const a = await p.evaluate(AUD, root);
      ok(`${name}: same header (back arrow, title, Neon)` + tag, a.hd, JSON.stringify(a));
      await p.context().close();
    }
  }
  // ---- every feature within 2 taps (phone) ----
  for (const [w, h] of SMOKE ? [[390, 763]] : [[390, 763], [375, 553]]) {
    for (const [name, tile, door, check] of F) {
      if (SMOKE && /^hangar: (weapons|pilot class|upgrades|ability|crew|looks|load)$/.test(name)) continue;   // same tab code as ship / forge / shop: those three run
      const p = await open(w, h); taps = 0; let r = false, why = '';
      try { await tap(p, tile); if (door) for (const d of door.split('|')) await tap(p, tile === '#hub_hangar' ? d : tile + 'Scr ' + d); await sleep(400); r = await p.evaluate(check); } catch (e) { why = e.message.slice(0, 120); }
      ok(`${taps} taps: ${name} ${w}x${h}`, r && taps <= (/\|/.test(door || '') ? 3 : 2), why || String(r));
      await p.context().close();
    }
  }
  // ---- back arrow returns to the section, hint + dots ----
  {
    const p = await open(390, 763); await tap(p, '#hub_profile'); await tap(p, '#hub_profileScr .hubAct:nth-child(3)'); await tap(p, '#setm .hubHd .hubBk');
    ok('settings back arrow returns to PROFILE', await p.evaluate(() => VIS('#hub_profileScr') && !VIS('#setm')));
    await tap(p, '#hub_profileBack'); ok('section back arrow returns to HOME', await p.evaluate(() => VIS('#hub_profile') && !VIS('#hub_profileScr')));
    const g = await p.evaluate(() => [...document.querySelectorAll('#setBody .hubSG')].map(e => e.textContent));
    ok('settings: 5 groups Gameplay, Display/Comfort, Audio, Controls, Data + Comfort slot', g.join('|') === 'GAMEPLAY|DISPLAY / COMFORT|AUDIO|CONTROLS|DATA' && await p.evaluate(() => !!document.getElementById('hubComfort') && typeof RET.hubComfort === 'function' && typeof RET.hubStory === 'function'), g.join('|'));
    const grp = await p.evaluate(() => { const o = id => +getComputedStyle(document.querySelector(id)).order, G = k => +getComputedStyle(document.getElementById('hubSG_' + k)).order; return { mus: o('#setBody .seg[data-k="mus"]') > G('au') && o('#setBody .seg[data-k="mus"]') < G('ct'), rm: o('#setBody .seg[data-k="rm"]') > G('dc') && o('#setBody .seg[data-k="rm"]') < G('au'), lay: o('#setBody .seg[data-k="layout"]') > G('ct') && o('#setBody .seg[data-k="layout"]') < G('da'), diff: o('#setBody .seg[data-k="diff"]') < G('dc') }; });
    ok('settings: Music Mix in Audio, reduced motion in Display/Comfort, touch layout in Controls, difficulty in Gameplay', Object.values(grp).every(Boolean), JSON.stringify(grp));
    await p.context().close();
  }
  {
    const p = await open(390, 763, '', () => { try { if (!sessionStorage.getItem('__b')) { sessionStorage.setItem('__b', '1'); localStorage.setItem('mnr_bank', '500'); } } catch (e) { } });
    const d = await p.evaluate(() => ({ hint: document.getElementById('hubHint').textContent, dots: [...document.querySelectorAll('#hubGrid .hubDot')].map(e => !e.hidden) }));
    ok('rich player: hint says buy in HANGAR, red dot only on HANGAR', /HANGAR/.test(d.hint) && d.dots.join() === 'false,true,false,false', JSON.stringify(d));
    await p.context().close();
    const q = await open(390, 763, '', () => { try { localStorage.removeItem('mnr_tut'); } catch (e) { } });
    const e = await q.evaluate(() => ({ hint: document.getElementById('hubHint').textContent, dots: [...document.querySelectorAll('#hubGrid .hubDot')].map(e => !e.hidden) }));
    ok('new player: hint points to TRAINING, red dot on TRAINING', /TRAINING/.test(e.hint) && e.dots[2], JSON.stringify(e));
    await q.context().close();
  }
  // ---- PLAY continues the next stage in 1 tap ----
  {
    const p = await open(390, 763, '', () => { try { if (!sessionStorage.getItem('__st')) { sessionStorage.setItem('__st', '1'); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 2 } })); } } catch (e) { } });
    taps = 0; await tap(p, '#playBtn'); await sleep(500);
    ok('PLAY: 1 tap into the next story stage (3)', await p.evaluate(() => __mnr.ST && __mnr.ST.on && __mnr.ST.n === 3));
    await p.context().close();
  }
  // ---- ?hub=0 = the old title and MENU sheet ----
  {
    const p = await open(390, 763, '?hub=0');
    const o = await p.evaluate(() => ({ hub: document.documentElement.classList.contains('hub'), grid: !!document.getElementById('hubGrid'), more: VIS('#moreBtn'), start: VIS('#startBtn'), ga: VIS('#gaBtn'), gaB: document.getElementById('gaBack').textContent, sec: !!document.getElementById('hub_missionsScr') }));
    ok('?hub=0: no hub, old title buttons visible, old garage BACK', !o.hub && !o.grid && o.more && o.start && o.ga && o.gaB === 'BACK' && !o.sec, JSON.stringify(o));
    await tap(p, '#moreBtn');
    const ids = await p.evaluate(() => [...document.querySelectorAll('#mnMore button')].filter(b => b.id !== 'pwaBtn').map(b => b.id === 'sgBtn' ? 'taleBtn' : b.id || b.className.split(' ').pop()).join(','));
    ok('?hub=0: MENU sheet as before', ids === 'storyBtn,wkBtn,wpBtn,labBtn,tutBtn,lsBtn,setBtn,diffBtn,fsBtn,footBtn,statsBtn,taleBtn,mnBack', ids);
    await p.context().close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `\n${bad} FAILED of ${res.length}` : `\nall ${res.length} passed`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
