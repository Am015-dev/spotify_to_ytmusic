#!/usr/bin/env node
// MENUFIX (parts/menufix.js + stats.js + map.js + ret.js, flag RET.menufix, ?menufix=0 = old): HANGAR = 5 tabs + MORE sheet with every label fitting, the achievement toast never over a
// control (elementFromPoint), no decoration glyphs in menus. Chromium through a CDP session on both phone sizes; prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/menufix-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[375, 553], [390, 763]], GLYPH = /[◆◇♦✦✸⌛∞]/;
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '') => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_bank', '900'); } } catch (e) { } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + ' ' + e.message));
    const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&school=0${q}`); await p.waitForFunction(() => window.__mnr && window.RET && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }); await sleep(300);
    return p;
  };
  const tap = async (p, sel) => { const l = p.locator(sel).first(); const b = await l.boundingBox(); if (!b) throw new Error('not on screen: ' + sel); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(350); };
  const shown = `(e=>{for(let x=e;x&&x!==document.body;x=x.parentElement){if(x.hidden)return false;const c=getComputedStyle(x);if(c.display==='none'||c.visibility==='hidden')return false;}const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})`;
  for (const [w, h] of SIZES) {
    const tag = ` ${w}x${h}`;
    let p = await open(w, h);
    await tap(p, '#hub_hangar');
    const t = await p.evaluate(`(()=>{const S=${shown};const bs=[...document.querySelectorAll('#garage .tabs button')].filter(S);return bs.map(b=>{const r=b.getBoundingClientRect();return{t:b.textContent.trim(),fit:b.scrollWidth<=b.clientWidth+1,in:r.left>=0&&r.right<=innerWidth,h:r.height,lines:b.getClientRects().length};});})()`);
    ok('HANGAR: 5 tabs + MORE' + tag, t.map(x => x.t).join() === 'SHIP,WEAPONS,FORGE,PILOT,UPGRADES,MORE', JSON.stringify(t.map(x => x.t)));
    ok('HANGAR: every tab label fits, on screen, >= 44 px tall' + tag, t.every(x => x.fit && x.in && x.h >= 43.5 && x.lines === 1), JSON.stringify(t));
    const lay = await p.evaluate(`(()=>{const tb=document.querySelector('#garage .tabs').getBoundingClientRect(),c=document.getElementById('gaCards').getBoundingClientRect(),g=document.getElementById('garage').getBoundingClientRect();return{gap:c.top-tb.bottom,tbBottom:tb.bottom,H:innerHeight,wide:document.documentElement.scrollWidth>innerWidth};})()`);
    ok('HANGAR: list starts right under the tabs, no sideways scroll' + tag, lay.gap >= -1 && lay.gap < 110 && !lay.wide, JSON.stringify(lay));
    await tap(p, '#mfMore');
    const sh = await p.evaluate(`(()=>{const S=${shown},s=document.getElementById('mfSheet');return{open:S(s),items:[...s.querySelectorAll('button')].map(b=>b.textContent.trim()),fit:[...s.querySelectorAll('button')].every(b=>b.scrollWidth<=b.clientWidth+1&&b.getBoundingClientRect().right<=innerWidth&&b.getBoundingClientRect().bottom<=innerHeight)};})()`);
    ok('MORE sheet lists ABILITY CREW LOOKS LOAD SHOP PICK WEAPONS and fits' + tag, sh.open && sh.items.join() === 'ABILITY,CREW,LOOKS,LOAD,SHOP,PICK WEAPONS,CLOSE' && sh.fit, JSON.stringify(sh));
    for (const [id, want] of [['mfI_mkt', 'mkt'], ['mfI_abil', 'abil'], ['mfI_crew', 'crew'], ['mfI_looks', 'looks'], ['mfI_load', 'load']]) {
      await tap(p, '#mfMore'); await tap(p, '#' + id);
      const r = await p.evaluate(`({tab:(document.querySelector('#garage .tabs button.on[data-t]')||{dataset:{}}).dataset.t,sheet:${shown}(document.getElementById('mfSheet')),on:document.getElementById('mfMore').classList.contains('on')})`);
      ok(`MORE > ${want} opens that tab, sheet closes, MORE shows as current` + tag, r.tab === want && !r.sheet && r.on, JSON.stringify(r));
    }
    await tap(p, '#mfMore'); await tap(p, '#mfI_pick');
    ok('MORE > PICK WEAPONS opens the weapon picker' + tag, await p.evaluate(`${shown}(document.getElementById('wpm'))`));
    await p.context().close();
    // ---- toast never over a control: forge, upgrades, shop, weapons, hangar sheet, home ----
    p = await open(w, h);
    const probe = async (label) => {
      await p.evaluate(() => { const a = RET.st.A.find(x => x.id === 'neon5000'); RET.st.toast(a); });
      let bad = null, seen = false;
      for (let i = 0; i < 14; i++) { await sleep(150); const r = await p.evaluate(`(()=>{const e=document.getElementById('achToast');if(!e||!e.classList.contains('show'))return null;const b=e.getBoundingClientRect(),hit=[];for(let i=0;i<=8;i++)for(let j=0;j<=3;j++){const t=document.elementFromPoint(Math.min(innerWidth-1,b.left+b.width*i/8),Math.min(innerHeight-1,b.top+b.height*j/3));const c=t&&t!==e&&t.closest('button,a[href],input,select,textarea,label,[role=button],.go,.card,.tabs,.seg');if(c)hit.push((c.id||c.className||c.tagName).toString().slice(0,24));}return{hit,cls:e.className,top:Math.round(b.top)};})()`); if (r) { seen = true; if (r.hit.length) bad = r; } }
      ok(`toast never covers a control: ${label} (${seen ? 'shown' : 'waited for a clear slot'})` + tag, !bad && (label !== 'HOME' || seen), JSON.stringify(bad));
      await p.evaluate(() => { const e = document.getElementById('achToast'); RET.st.toastQ && 0; }); await sleep(2600);
      return seen;
    };
    await probe('HOME');
    await tap(p, '#hub_hangar');
    for (const tab of ['forge', 'tune', 'weapons', 'ships']) { await p.evaluate(t => document.querySelector('#garage .tabs [data-t=' + t + ']').click(), tab); await sleep(250); await probe('HANGAR ' + tab); }
    await p.context().close();
    // ---- glyphs ----
    p = await open(w, h);
    const g = await p.evaluate(() => { const o = []; for (const a of RET.st.A) if (/[◆◇♦✦✸⌛∞]/.test(a.g)) o.push(a.id); return o; });
    ok('achievement badges carry no text diamonds or odd glyphs' + tag, !g.length, g.join());
    const txt = [];
    for (const tile of ['#hub_missions', '#hub_training', '#hub_profile', '#hub_hangar']) {
      await p.evaluate(() => { if (__hub.cur()) __hub.shut(); const gg = document.getElementById('garage'); if (!gg.hidden) document.getElementById('gaBack').click(); }); await sleep(200);
      await tap(p, tile); txt.push(...await p.evaluate(`[...document.querySelectorAll('button,.retChip,.hubStat,#hubStat,.ttl,small')].filter(${shown}).map(e=>e.textContent).filter(t=>/[◆◇♦✦✸⌛∞]/.test(t))`));
    }
    ok('menus (home sections, hangar) show no text diamonds' + tag, !txt.length, txt.slice(0, 3).join('|'));
    const chip = await p.evaluate(() => (RET.chips || []).map(c => c.textContent).filter(t => /[◆◇♦]/.test(t)));
    ok('home chips show no text diamonds' + tag, !chip.length, chip.join('|'));
    await p.context().close();
  }
  // ---- ?menufix=0 = the old hangar ----
  {
    const p = await open(390, 763, '&menufix=0'); await tap(p, '#hub_hangar');
    const o = await p.evaluate(() => ({ more: !!document.getElementById('mfMore'), mfx: document.documentElement.classList.contains('mfx'), sec: document.querySelectorAll('#garage .tabs button.hubSec').length, glyph: RET.st.A.filter(a => /[◆◇♦✦✸⌛∞]/.test(a.g)).length }));
    ok('?menufix=0: old hangar (no MORE button, tabs as before, old glyphs)', !o.more && !o.mfx && o.sec >= 5 && o.glyph > 0, JSON.stringify(o));
    await p.context().close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `\n${bad} FAILED of ${res.length}` : `\nall ${res.length} passed`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
