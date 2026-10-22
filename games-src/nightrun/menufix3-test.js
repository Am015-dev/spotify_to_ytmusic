#!/usr/bin/env node
// PURPOSE: menufix3 gates for review 9 fixes 8, 11 and 14 (E12 first death, E14 currency, E17/E19 menu leftovers)
// FLAG: menufix (RET.menufix, default ON; the three fixes are part of it: parts/ret.js retShow, hub.js HOME + nnum, tidy.js DATA row)
// TEST: menufix3-test.js
// Headless Chromium, 390x763 and 375x553, touch. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/menufix3-test.js     env: GAME_DIR=...
// Gate 1 (E12): a new player who dies on the first run sees RETRY as the first visible button of the death screen; the GARAGE shortcut is hidden while nothing is affordable.
// Gate 2 (E14): the hangar and HOME show one Neon glyph in one colour and one number format (thousands dot, no raw "2400" / "2.400" mix).
// Gate 3 (E17/E19): HOME has one info strip, no build stamp; the PLAY subtitle is one line; every DATA-page jump button fits the screen.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const SIZES = [[390, 763], [375, 553]];
const shown = `(e=>{if(!e)return false;for(let x=e;x&&x!==document.body;x=x.parentElement){if(x.hidden)return false;const c=getComputedStyle(x);if(c.display==='none'||c.visibility==='hidden')return false;}const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})`;
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  // neon: the saved Neon bank for a fresh profile (0 = a true first session) or a filled one
  const open = async (w, h, neon) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(neon => { try { if (!sessionStorage.getItem('__ini')) { sessionStorage.setItem('__ini', '1'); localStorage.setItem('mnr_tut', '1'); if (neon) localStorage.setItem('mnr_bank', String(neon)); } } catch (e) { } }, neon);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + ' ' + e.message));
    const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&school=0`); await p.waitForFunction(() => window.__mnr && window.RET && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }); await sleep(300);
    return p;
  };
  const tap = async (p, sel) => { const l = p.locator(sel).first(); const b = await l.boundingBox(); if (!b) throw new Error('not on screen: ' + sel); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(350); };
  for (const [w, h] of SIZES) {
    const tag = ` ${w}x${h}`;
    // ---- Gate 1 (E12): first-session death ----
    {
      const p = await open(w, h, 0);
      await p.evaluate(() => { const m = window.__mnr; m.startStory(1); m.G.score = 1200; m.ST.fail(); });
      await sleep(900);
      const r = await p.evaluate(`(()=>{const S=${shown};const over=document.getElementById('over');const vis=[...over.querySelectorAll('button')].filter(b=>S(b));return{first:vis[0]?vis[0].textContent.trim():'',list:vis.map(b=>b.textContent.trim()),garageShown:S(document.getElementById('gaBtn2'))};})()`);
      ok('E12 first death: first visible button is RETRY' + tag, r.first === 'RETRY', JSON.stringify(r));
      ok('E12 first death: GARAGE shortcut hidden while nothing is affordable' + tag, !r.garageShown, JSON.stringify(r));
      await p.context().close();
    }
    // ---- Gate 2 (E14): one glyph, one colour, one number format ----
    {
      const p = await open(w, h, 2400);
      await tap(p, '#hub_hangar');
      const t = await p.evaluate(`(()=>{const S=${shown};const g=document.getElementById('garage');const txt=g.innerText;const hub=document.getElementById('title').innerText;const cols=new Set([...document.querySelectorAll('.nI')].filter(S).map(e=>getComputedStyle(e).color));return{glyphs:(txt.match(/[◆◇♦⬢⬡✦]/g)||[]).length,raw:(txt.match(/\\b\\d{4,}\\b/g)||[]),hubRaw:(hub.match(/\\b\\d{4,}\\b/g)||[]),cols:[...cols],bank:document.getElementById('gaBankN')?document.getElementById('gaBankN').textContent:''};})()`);
      ok('E14 hangar: no text diamond or hex glyph (Neon is the one icon)' + tag, t.glyphs === 0, JSON.stringify(t));
      ok('E14 hangar: no raw 4+ digit number (one format, thousands dot)' + tag, t.raw.length === 0 && t.bank === '2.400', JSON.stringify(t));
      ok('E14 Neon icon: one colour everywhere on hangar' + tag, t.cols.length <= 1, JSON.stringify(t.cols));
      await tap(p, '#gaBack');
      await p.context().close();
    }
    // ---- Gate 3 (E17/E19): HOME one info strip, PLAY on one line, DATA page fits ----
    {
      const p = await open(w, h, 900);
      const home = await p.evaluate(`(()=>{const S=${shown};const strips=[...document.querySelectorAll('#hubStat,#hubHint')].filter(e=>S(e)&&!(e.parentElement&&e.parentElement.id==='hubStat'));const pb=document.querySelector('#playBtn small');const rr=pb?pb.getClientRects().length:0;const ph=pb?pb.getBoundingClientRect().height:0;const fs=pb?parseFloat(getComputedStyle(pb).fontSize):0;const stamp=/build\\s+[0-9a-f]{5,}/i.test(document.getElementById('title').innerText);return{strips:strips.map(e=>e.id),playLines:rr,playOneLine:ph<=fs*1.6,stamp};})()`);
      ok('E19 HOME: one info strip (the status line; "Next:" is inside it)' + tag, home.strips.length === 1 && home.strips[0] === 'hubStat', JSON.stringify(home));
      ok('E19 HOME: build stamp not on the first screen (it is on PROFILE)' + tag, !home.stamp, JSON.stringify(home));
      ok('E19 PLAY subtitle is one line' + tag, home.playLines === 1 && home.playOneLine, JSON.stringify(home));
      await p.evaluate(() => document.getElementById('setBtn').click()); await sleep(350);
      const d = await p.evaluate(`(()=>{const S=${shown};const bs=[...document.querySelectorAll('#hubJump button')].filter(S);return{list:bs.map(b=>b.textContent.trim()),out:bs.filter(b=>{const r=b.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1||b.scrollWidth>b.clientWidth+1;}).map(b=>b.textContent.trim()),wide:document.documentElement.scrollWidth>innerWidth+1};})()`);
      ok('E17 DATA page: every jump button (incl. DATA) fits on screen' + tag, d.list.includes('DATA') && d.out.length === 0 && !d.wide, JSON.stringify(d));
      await p.context().close();
    }
  }
  ok('no page errors' + '', errs.length === 0, errs.slice(0, 4).join(' | '));
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length;
  console.log(bad ? `RESULT ${bad} FAILED of ${res.length}` : `RESULT ALL PASS (${res.length})`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL harness :: ' + e.message); process.exit(1); });
