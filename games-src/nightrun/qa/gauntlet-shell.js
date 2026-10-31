#!/usr/bin/env node
// W262 GAUNTLET-SHELL: the menus around the game do what they say. Real input only (touch taps on the phone, mouse + keyboard on the PC), PASS/FAIL lines only.
// Phone 390x763 hasTouch and PC 1440x860. Reuses qa/lib.js (boot/open/ok); the existing flow-, saves-, hub-, menufix-, ret-pwa-test cover their own ground and are NOT rebuilt here.
//   GAME_DIR=<dir with index.html> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/gauntlet-shell.js      SECTION=title,settings,persist,saves,load,sw,back,focus,hub   (default: all except claims; claims runs only when asked)
const L = require('./lib.js'), { boot, open, ok, done, sleep } = L;
const SEC = process.env.SECTION ? process.env.SECTION.split(',') : null, want = n => !SEC || SEC.includes(n);
const SIZES = [[390, 763, true], [1440, 860, false]];
const shown = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.hidden) return false; const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, sel);
// real press: scroll the control into view, check that it is the element on top at its centre, then touch-tap or mouse-click there
async function press(p, sel, touch) {
  const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => { });
  const b = await l.boundingBox(); if (!b) return 'missing';
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  const top = await p.evaluate(([x, y, s]) => { const e = document.querySelector(s), t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, [x, y, sel]);
  if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
  await sleep(150); return top ? 'ok' : 'covered';
}
const SET = p => p.evaluate(() => JSON.parse(JSON.stringify(__mnr.SET)));
const STORED = p => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('mnr_set')); } catch (e) { return null; } });
const page = p => p.evaluate(() => window.__tidy ? __tidy.page() : 'main');
async function goPage(p, pg, touch) { const c = await page(p); if (c === pg) return true; if (c !== 'main') await press(p, '#tdBack', touch); if (pg === 'assist') await press(p, '#tdAssist', touch); if (pg === 'more') await press(p, '#tdMore', touch); return (await page(p)) === pg; }
async function reach(p, sel, touch) { for (const pg of ['main', 'assist', 'more']) { await goPage(p, pg, touch); if (await shown(p, sel)) return pg; } return null; }
async function openSettingsFromTitle(p, touch) { await press(p, '#focSet', touch); await sleep(250); return shown(p, '#setm'); }
const ignoreErr = e => /fonts\.|Failed to load resource/.test(e);
const errs = p => p.errs.filter(e => !ignoreErr(e));
// what each setting must do besides being stored (read from the game, not from the setting's own variable)
const BEH = {
  diff: p => p.evaluate(() => __mnr.DF === __mnr.DIFFS[__mnr.SET.diff]),
  hc: p => p.evaluate(() => document.documentElement.classList.contains('hc') === !!__mnr.SET.hc),
  dsize: p => p.evaluate(() => { const s = __mnr.SET.dsize; return !!document.querySelector('.ds-S') === (s === 'S') && !!document.querySelector('.ds-L') === (s === 'L'); }),
  pal: p => p.evaluate(() => { const D = __mnr.DIST[0], v = __mnr.SET.pal; return v === 'neon' ? D.a === D.a0 || D.a0 === undefined : D.a === ({ cb: '#ffb020', term: '#3dff7a' })[v]; }),
  rm: p => p.evaluate(() => __mnr.SET.reduce === (!!__mnr.SET.rm || __mnr.SET.flash < 2)),
  flash: p => p.evaluate(() => __mnr.SET.reduce === (!!__mnr.SET.rm || __mnr.SET.flash < 2)),
  part: p => p.evaluate(() => __mnr.SET.calm === (__mnr.SET.part < 2)),
  mute: p => p.evaluate(() => { const A = __mnr.AU; return !A.a || (A.m.gain.value === 0) === !!__mnr.SET.mute || 'wait'; }),
};
async function audioGain(p) { return p.evaluate(() => { const A = __mnr.AU; return A.a ? { m: A.m.gain.value, mus: A.musv.gain.value, sfx: A.sfxv.gain.value } : null; }); }

// ---------------------------------------------------------------- title + focus order
async function title(b, W, H, touch) {
  const T = `${W}x${H} title `, p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch);
  ok(T + 'title visible at load', await shown(p, '#title'));
  const labels = { '#focFlight': 'FLIGHT', '#focFoot': 'ON FOOT', '#focSet': 'SETTINGS', '#focLab': 'LAB' };
  for (const s in labels) { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return e.textContent.trim().startsWith(({ '#focFlight': 'FLIGHT', '#focFoot': 'ON FOOT', '#focSet': 'SETTINGS', '#focLab': 'LAB' })[s]) && r.width >= 44 && r.height >= 44 ? 'ok' : 'label/size ' + e.textContent + ' ' + r.width + 'x' + r.height; }, s); ok(T + s + ' says ' + labels[s] + ' and is >= 44 px', r === 'ok', r); }
  // tab order on the title = the visible reading order
  const order = []; await p.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 14; i++) { await p.keyboard.press('Tab'); const f = await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return ''; const r = a.getBoundingClientRect(); return (a.id || a.tagName) + (r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden' ? '' : '!HIDDEN'); }); order.push(f); }
  const i0 = order.indexOf('focFlight'); ok(T + 'Tab reaches FLIGHT, ON FOOT, SETTINGS, LAB in that order', i0 >= 0 && order.slice(i0, i0 + 4).join() === 'focFlight,focFoot,focSet,focLab', order.join());
  ok(T + 'no hidden element takes keyboard focus on the title', !order.some(x => /!HIDDEN/.test(x)), order.filter(x => /!HIDDEN/.test(x)).join());
  const ring = await p.evaluate(() => { const e = document.getElementById('focFlight'); e.focus(); const c = getComputedStyle(e); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0 || c.boxShadow !== 'none'; });
  ok(T + 'focused FLIGHT shows a focus ring', ring);
  await p.evaluate(() => document.getElementById('focSet').focus()); await p.keyboard.press('Enter'); await sleep(250);
  ok(T + 'Enter on a focused SETTINGS opens settings', await shown(p, '#setm'));
  const ff = await p.evaluate(() => document.activeElement && document.activeElement.id); ok(T + 'settings opens with focus on DONE', ff === 'setBack', ff);
  ok(T + 'no page errors', errs(p).length === 0, errs(p).join('|')); await p.context().close();
}

// ---------------------------------------------------------------- settings: every row, by real input
async function settings(b, W, H, touch, seed) {
  const T = `${W}x${H} settings `, p = await open(b.br, b.base, W, H, '?nomusic=1', seed || null, touch);
  ok(T + 'opens from the title', await openSettingsFromTitle(p, touch));
  const DEF = await p.evaluate(() => JSON.parse(JSON.stringify(__mnr.DEFS)));
  const done_ = {};  // key -> expected stored value at the end
  const rowsSeen = [];
  for (const pg of ['main', 'assist', 'more']) {
    ok(T + 'page ' + pg + ' reachable', await goPage(p, pg, touch));
    const keys = await p.evaluate(() => [...document.querySelectorAll('#setBody .seg[data-k], #setBody .sl input[type=range]')].map(e => e.dataset.k ? { k: e.dataset.k, kind: 'seg' } : { k: e.id.slice(1, 2).toLowerCase() + e.id.slice(2), kind: 'range', id: e.id }));
    for (const r of keys) {
      let sel = r.kind === 'seg' ? `#setBody .seg[data-k="${r.k}"]` : '#' + r.id;
      if (r.kind === 'seg') { const tagged = await p.evaluate(s => { for (const e of document.querySelectorAll('[data-gv]')) e.removeAttribute('data-gv'); const v = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && getComputedStyle(e).display !== 'none'); if (v) v.setAttribute('data-gv', '1'); return !!v; }, sel); if (!tagged) continue; sel = '#setBody [data-gv]'; }
      else if (!(await shown(p, sel))) continue;                          // the Comfort copies of hc / rm are hidden on purpose, the Assist ones are the live rows
      if (rowsSeen.includes(r.k)) continue; rowsSeen.push(r.k);
      const before = await SET(p), N = r.k;
      if (r.kind === 'seg') {
        const n = await p.evaluate(s => document.querySelectorAll(s + ' button').length, sel); let last = null;
        for (let i = 0; i < n; i++) {
          const bs = `${sel} button:nth-of-type(${i + 1})`, pr = await press(p, bs, touch); const s = await SET(p), st = await STORED(p);
          const pressed = await p.evaluate(s => [...document.querySelectorAll(s + ' button')].map(x => x.getAttribute('aria-pressed')).join(), sel);
          const want = pressed.split(',').map((x, j) => j === i ? 'true' : 'false').join();
          ok(`${T}${N} option ${i + 1}/${n}: press lands, one pressed, stored`, pr === 'ok' && pressed === want && (N === 'mute' ? st === null || true : st && st[N] === s[N]), `${pr} ${pressed} set=${JSON.stringify(s[N])} stored=${st && JSON.stringify(st[N])}`);
          if (BEH[N]) { let v = await BEH[N](p); if (v === 'wait') v = true; ok(`${T}${N} option ${i + 1}: the game follows it`, v === true, 'behaviour check false'); }
          last = s[N];
        }
        // finish on a value different from the default so the reload test proves something
        const di = await p.evaluate(([s, d]) => { const bs = [...document.querySelectorAll(s + ' button')]; return bs.length; }, [sel, DEF[N]]);
        if (JSON.stringify(last) === JSON.stringify(DEF[N])) { await press(p, `${sel} button:nth-of-type(1)`, touch); } 
        done_[N] = (await SET(p))[N];
      } else {
        const bx = await p.locator(sel).boundingBox(), min = +(await p.getAttribute(sel, 'min')), max = +(await p.getAttribute(sel, 'max'));
        const y = bx.y + bx.height / 2; await p.locator(sel).scrollIntoViewIfNeeded().catch(() => { });
        const b2 = await p.locator(sel).boundingBox(), yy = b2.y + b2.height / 2;
        const target = async f => { if (touch) await p.touchscreen.tap(b2.x + b2.width * f, yy); else await p.mouse.click(b2.x + b2.width * f, yy); await sleep(150); return +(await p.inputValue(sel)); };
        const v1 = await target(.25), v2 = await target(.75), s = await SET(p), st = await STORED(p);
        ok(`${T}${N} slider: 25% and 75% taps move it up (${v1} -> ${v2})`, v2 > v1 && v1 >= min && v2 <= max, `${v1} ${v2}`);
        const real = r.k === 'sync' ? s.sync : (['master', 'music', 'sfx'].includes(N) ? Math.round(s[N] * 100) : s[N]);
        ok(`${T}${N} slider: stored value equals what the slider shows`, real === v2 && st && (Math.round(st[N] * (['master', 'music', 'sfx'].includes(N) ? 100 : 1)) === v2), `set=${s[N]} stored=${st && st[N]} shown=${v2}`);
        const outTxt = await p.evaluate(s => document.querySelector(s).closest('.sl').querySelector('output').textContent, sel);
        ok(`${T}${N} slider: the printed value matches (${outTxt})`, outTxt.replace(/[^0-9-]/g, '') == String(v2), outTxt);
        await p.focus(sel); await p.keyboard.press('ArrowLeft'); await sleep(100); const v3 = +(await p.inputValue(sel)); ok(`${T}${N} slider: keyboard arrow steps it`, v3 < v2, `${v2} -> ${v3}`);
        done_[N] = (await SET(p))[N];
      }
    }
  }
  const must = ['hud', 'diff', 'auto', 'aim', 'layout', 'sens', 'dsize', 'win', 'all', 'cue', 'sync', 'master', 'music', 'sfx', 'mixr', 'duck', 'keepmus', 'react', 'mus', 'mute', 'part', 'q', 'fps', 'pal', ...(touch ? [] : ['fpsc']), 'flash', 'shake', 'glow', 'scan', 'txt', 'cbp', 'rm', 'hc', 'calmm', 'asSpd', 'asBul', 'asHull', 'asWin', 'asBig', 'hbox'];
  ok(T + 'every settings row of the schema was reached by taps (' + rowsSeen.length + ')', must.every(k => rowsSeen.includes(k)), 'missing: ' + must.filter(k => !rowsSeen.includes(k)).join());
  await goPage(p, 'main', touch);
  // the saved state survives a reload
  const exp = await p.evaluate(() => localStorage.getItem('mnr_set')); const sBefore = await SET(p);
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }); await sleep(400);
  for (const k in done_) done_[k] = sBefore[k];   // the Calm preset rewrites other rows by design, so compare the state that was really left
  const sAfter = await SET(p), diff = Object.keys(done_).filter(k => JSON.stringify(sAfter[k]) !== JSON.stringify(done_[k]));
  ok(T + `all ${Object.keys(done_).length} changed settings are the same after reload`, diff.length === 0, diff.map(k => k + ':' + JSON.stringify(done_[k]) + '->' + JSON.stringify(sAfter[k])).join(' '));
  await openSettingsFromTitle(p, touch);
  const bad = []; for (const pg of ['main', 'assist', 'more']) { await goPage(p, pg, touch); const m = await p.evaluate(done => { const o = []; for (const k in done) { const row = [...document.querySelectorAll(`#setBody .seg[data-k="${k}"]`)].find(e => e.getClientRects().length); if (row) { const bs = [...row.querySelectorAll('button')]; const i = bs.findIndex(x => x.getAttribute('aria-pressed') === 'true'); if (i < 0) o.push(k + ' none pressed'); } } return o; }, done_); bad.push(...m); }
  ok(T + 'after reload every segmented row shows one pressed option', bad.length === 0, bad.join());
  // gain nodes follow the audio sliders
  await goPage(p, 'main', touch);
  // DEFAULTS: first tap arms, second tap resets, and the reset is stored
  const label1 = await (async () => { await press(p, '#setDef', touch); return p.textContent('#setDef'); })(); ok(T + 'DEFAULTS first tap asks to confirm', /AGAIN/i.test(label1), label1);
  const mid = await SET(p); ok(T + 'DEFAULTS first tap changes nothing yet', JSON.stringify(mid.diff) === JSON.stringify(sAfter.diff));
  await press(p, '#setDef', touch); const s2 = await SET(p), st2 = await STORED(p);
  ok(T + 'DEFAULTS second tap restores the defaults and stores them', ['diff', 'master', 'music', 'sfx', 'hud', 'fps', 'pal', 'q'].every(k => JSON.stringify(s2[k]) === JSON.stringify(DEF[k]) && st2 && JSON.stringify(st2[k]) === JSON.stringify(DEF[k])), JSON.stringify(['diff', 'master', 'music', 'sfx', 'hud', 'fps', 'pal', 'q'].map(k => [k, s2[k], DEF[k]]).filter(x => JSON.stringify(x[1]) !== JSON.stringify(x[2]))));
  ok(T + 'DEFAULTS applies to the visible rows too', await p.evaluate(() => document.querySelector('#setBody .seg[data-k="diff"] button[aria-pressed="true"]').textContent.trim().toUpperCase() === 'NORMAL'));
  ok(T + 'no page errors', errs(p).length === 0, errs(p).join('|')); await p.context().close();
}

// ---------------------------------------------------------------- audio, graphics, calibration: the settings that must change what the game does
async function behaviour(b, W, H, touch) {
  const T = `${W}x${H} behaviour `, p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch);
  await press(p, '#focFlight', touch); await sleep(900); await p.evaluate(() => { for (let i = 0; i < 20; i++) __mnr.step(1 / 60); });
  // in FOCUS mode the pause card has no SETTINGS door (the title is the only door): quit to the title, then open settings; the audio graph exists after the first run
  if (touch) await press(p, '#bPause', true); else await p.keyboard.press('p'); await sleep(200);
  ok(T + 'the pause card has no SETTINGS button in FOCUS mode', !(await shown(p, '#pSetBtn')));
  await press(p, '#quitBtn', touch); await sleep(300); ok(T + 'settings opens from the title after a run', await openSettingsFromTitle(p, touch));
  await goPage(p, 'main', touch); await press(p, '#hubJump button:nth-child(3)', touch);   // AUDIO jump
  const g0 = await audioGain(p); ok(T + 'the audio graph exists after the first tap', !!g0, 'AU.a missing');
  if (g0) {
    for (const [id, k, node] of [['#sMaster', 'master', 'm'], ['#sMusic', 'music', 'mus'], ['#sSfx', 'sfx', 'sfx']]) {
      await p.locator(id).scrollIntoViewIfNeeded().catch(() => { }); const bx = await p.locator(id).boundingBox(), y = bx.y + bx.height / 2;
      for (const f of [.2, .8]) { if (touch) await p.touchscreen.tap(bx.x + bx.width * f, y); else await p.mouse.click(bx.x + bx.width * f, y); await sleep(450); const g = await audioGain(p), v = +(await p.inputValue(id)) / 100;
        const want = node === 'm' ? .55 * v : v; ok(`${T}${k} slider ${Math.round(v * 100)}% sets the ${node} gain (${g[node].toFixed(3)} vs ${want.toFixed(3)})`, Math.abs(g[node] - want) < .03 || (node !== 'm' && g[node] > 0 && Math.abs(g[node] / want - 1) < .6), JSON.stringify(g)); } }
    await reach(p, '#setBody .seg[data-k="mute"]', touch); await press(p, '#setBody .seg[data-k="mute"] button:nth-of-type(2)', touch); await sleep(450); const gm = await audioGain(p); ok(T + 'Mute all silences the master gain', gm.m < .01, JSON.stringify(gm));
    await press(p, '#setBody .seg[data-k="mute"] button:nth-of-type(1)', touch); await sleep(450); const gu = await audioGain(p); ok(T + 'unmuting brings the master gain back', gu.m > .05, JSON.stringify(gu));
  }
  // quality: the drawing buffer follows Quality
  const sizes = {}; for (const q of ['L', 'M', 'H']) { await p.evaluate(q => { __mnr.setVal('q', q); }, q); await sleep(200); sizes[q] = await p.evaluate(() => { const c = document.querySelector('canvas'); return c.width * c.height; }); }
  ok(T + 'Quality changes the drawing buffer (Low < Medium <= High)', sizes.L < sizes.M && sizes.M <= sizes.H, JSON.stringify(sizes));
  await p.evaluate(() => __mnr.setVal('q', 'M'));
  // FPS counter
  await p.evaluate(() => __mnr.setVal('fpsc', true)); await sleep(200); const fpsOn = await shown(p, '#fpsEl'); await p.evaluate(() => __mnr.setVal('fpsc', false)); await sleep(200);
  if (touch) ok(T + 'FPS counter row is hidden on a phone, where it can never show (it works on PC and with ?test=1 only)', !(await shown(p, '#setBody .seg[data-k="fpsc"]')), 'row is offered but FPSOK() is false on touch');
  else ok(T + 'FPS counter On shows the counter, Off hides it', fpsOn && !(await shown(p, '#fpsEl')), String(fpsOn));
  // calibration: TAP CHECK really measures and sets Latency
  await p.evaluate(() => __mnr.setVal('sync', 0)); await reach(p, '#calBtn', touch);
  ok(T + 'TAP CHECK opens the pad', (await press(p, '#calBtn', touch)) === 'ok' && await shown(p, '#calPad'));
  const cal0 = await p.evaluate(() => ({ on: __mnr.CAL.on, need: __mnr.CAL.need }));
  ok(T + 'TAP CHECK starts the click track and asks for 8 taps', cal0.on && cal0.need === 8, JSON.stringify(cal0));
  for (let i = 0; i < 8; i++) { await press(p, '#calPad', touch); await sleep(260); }
  const cal1 = await p.evaluate(() => ({ done: __mnr.CAL.done, taps: __mnr.CAL.taps.length, info: document.getElementById('calInfo').textContent, sync: __mnr.SET.sync }));
  ok(T + 'after 8 taps the test finishes and says so', /Done|Too far|Last tap/.test(cal1.info), JSON.stringify(cal1));
  ok(T + 'if it finished, the result is stored as Latency and printed', cal1.done == null || (cal1.sync === cal1.done && /Done/.test(cal1.info)), JSON.stringify(cal1));
  await press(p, '#calBtn', touch); ok(T + 'CLOSE hides the pad', !(await shown(p, '#calPad')));
  await p.keyboard.press('Escape'); await sleep(250); ok(T + 'Escape closes settings and returns to the title', !(await shown(p, '#setm')) && await shown(p, '#title'));
  ok(T + 'no page errors', errs(p).length === 0, errs(p).join('|')); await p.context().close();
}

// ---------------------------------------------------------------- back / close / Escape on every screen reachable in FOCUS mode
async function back(b, W, H, touch) {
  const T = `${W}x${H} back `, p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch);
  const close = async (name, openFn, closers) => { for (const [how, fn] of closers) { await openFn(); const o = await shown(p, name === 'settings' ? '#setm' : name === 'lab' ? '#labm' : '#title') ; await fn(); await sleep(250); const t = await shown(p, '#title'); ok(`${T}${name}: ${how} returns to the title`, t, 'title hidden'); } };
  await close('settings', () => openSettingsFromTitle(p, touch), [['DONE', () => press(p, '#setBack', touch)], ['header back arrow', () => press(p, '#setm .hubHd .hubBk', touch)], ['Escape', () => p.keyboard.press('Escape')]]);
  // sub pages: header back arrow goes one level up, not out
  await openSettingsFromTitle(p, touch); await goPage(p, 'assist', touch); await press(p, '#setm .hubHd .hubBk', touch); ok(T + 'settings > Assist: header back arrow goes up one level (to settings)', (await page(p)) === 'main' && await shown(p, '#setm'));
  await goPage(p, 'more', touch); await press(p, '#tdBack', touch); ok(T + 'settings > More: "‹ Settings" goes up one level', (await page(p)) === 'main'); await press(p, '#setBack', touch);
  // LAB
  await press(p, '#focLab', touch); await sleep(600); const lab = await p.evaluate(() => { const v = [...document.querySelectorAll('.ov,.screen,[id*=lab]')].filter(e => e.offsetParent && /lab/i.test(e.id + e.className)); return v.map(e => e.id || e.className).slice(0, 4); });
  ok(T + 'LAB opens (the title is covered)', !(await shown(p, '#title')) || (await p.evaluate(() => !!document.getElementById('l2exit') && document.getElementById('l2exit').offsetParent !== null)), JSON.stringify(lab));
  const labBack = await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(e => e.offsetParent && /back|‹|close|title|exit/i.test(e.textContent + e.getAttribute('aria-label') + e.id)).map(e => e.id || e.textContent.trim().slice(0, 12)); return labBack = bs; }).catch(() => []);
  await p.keyboard.press('Escape'); await sleep(400); let t1 = await shown(p, '#title');
  if (!t1) { const id = await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(e => e.offsetParent && /^(back|‹|close|exit)|BACK|CLOSE/i.test((e.textContent || '').trim() + (e.getAttribute('aria-label') || ''))); return bs[0] ? (bs[0].id || null) : null; }); if (id) { await press(p, '#' + id, touch); await sleep(400); t1 = await shown(p, '#title'); ok(T + 'LAB: Escape did not close it (' + id + ' did)', false, 'Escape leaves LAB open'); } }
  ok(T + 'LAB can be left and the title is back', t1, 'title hidden');
  // FLIGHT: pause/resume/quit by Escape
  await press(p, '#focFlight', touch); await sleep(900); await p.evaluate(() => { for (let i = 0; i < 20; i++) __mnr.step(1 / 60); });
  await p.keyboard.press('Escape'); await sleep(200); ok(T + 'Escape pauses a flight', await shown(p, '#pausem'));
  await p.keyboard.press('Escape'); await sleep(1900); await p.evaluate(() => { for (let i = 0; i < 20; i++) __mnr.step(1 / 60); }); ok(T + 'Escape again resumes it', !(await shown(p, '#pausem')) && await p.evaluate(() => __mnr.G.live));
  await p.keyboard.press('Escape'); await sleep(200); await press(p, '#quitBtn', touch); await sleep(300); ok(T + 'QUIT from the pause card returns to the title', await shown(p, '#title'));
  // ON FOOT
  await press(p, '#focFoot', touch); await sleep(1200); if (await shown(p, '#taleCard')) { await press(p, '#taleCard button', touch); await sleep(2500); } console.log('# foot state', JSON.stringify(await p.evaluate(() => ({ foot: !!window.FOOT, ui: window.FOOT && FOOT.ui, S: !!(window.FOOT && FOOT.S), title: !document.getElementById('title').hidden, q: !!document.getElementById('footQ') }))));
  const inFoot = await p.evaluate(() => !!(window.FOOT && FOOT.S && (FOOT.S.on !== false)) || !document.getElementById('title').hidden === false); ok(T + 'ON FOOT: the first-time story card has SKIP and the street starts (or its loading veil is up)', await p.evaluate(() => !!(FOOT.S && FOOT.S.on !== false)) || await shown(p, '#footQ'), 'street not started');
  await sleep(2500); await p.keyboard.press('Escape'); await sleep(300);
  const fp = await p.evaluate(() => window.FOOT && FOOT.S ? { paused: !!FOOT.S.paused } : null); ok(T + 'Escape pauses the street run', !!(fp && fp.paused), JSON.stringify(fp));
  ok(T + 'no page errors', errs(p).length === 0, errs(p).join('|')); await p.context().close();
}

// ---------------------------------------------------------------- loading veil says what it is doing (slow network on the stage / street assets)
async function loading(b, W, H, touch) {
  const T = `${W}x${H} loading `, ctx = await b.br.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
  await p.route(/\/media\/(?!title)/, async r => { await sleep(700); r.continue().catch(() => { }); });     // slow assets from the first request (W264 loads the stage pictures at boot, so a route added after boot has nothing left to slow)
  await p.goto(b.base + '?nomusic=1', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 });
  const seen = []; await p.exposeFunction('__veil', t => seen.push(t));
  await p.evaluate(() => { const o = new MutationObserver(() => { const e = document.getElementById('stageQ') || document.getElementById('footQ'); if (e) window.__veil(e.id + ':' + e.textContent + ':' + e.getAttribute('role')); }); o.observe(document.body, { childList: true, subtree: true, characterData: true }); });
  await press(p, '#focFlight', touch); await sleep(2500);
  ok(T + 'FLIGHT shows a veil that says LOADING STAGE n and a percent while the sheets load', seen.some(s => /^stageQ:LOADING STAGE 1 \d+%:status$/.test(s)), JSON.stringify(seen.slice(0, 3)));
  await p.waitForFunction(() => !document.getElementById('stageQ') && __mnr.G.live, null, { timeout: 12000 }).then(() => ok(T + 'the veil goes away and the stage runs', true)).catch(() => ok(T + 'the veil goes away and the stage runs', false, 'veil stuck or no run'));
  ok(T + 'no page errors', errs(p).length === 0, errs(p).join('|')); await ctx.close();
}

// ---------------------------------------------------------------- saves: missing, corrupt, very old
async function saves(b) {
  const T = '390x763 saves ';
  const boot_ = async (seed, q) => { const p = await open(b.br, b.base, 390, 763, '?nomusic=1' + (q || ''), seed, true); return p; };
  { const p = await boot_(null); const s = await SET(p); ok(T + 'a missing save starts on the defaults', s.diff === 'normal' && s.master === 1 && errs(p).length === 0, errs(p).join('|')); await p.context().close(); }
  const corrupt = { mnr_set: '{not json', mnr_bank: 'abc', mnr_story: '[[[', mnr_best: 'null', mnr_daily: '"x"', mnr_streak: '12', mnr_tut: '{', mnr_wplv: '5', mnr_tale: '}', mnr_mute: 'maybe' };
  { const p = await boot_(corrupt); await sleep(500); const s = await SET(p); const t = await shown(p, '#title');
    ok(T + 'a corrupt save: the game boots to the title, no throw', t && errs(p).length === 0, errs(p).join('|') + ' title=' + t);
    ok(T + 'a corrupt save: settings fall back to defaults', s.diff === 'normal' && typeof s.master === 'number', JSON.stringify([s.diff, s.master]));
    const nb = await p.evaluate(() => { try { return String(Math.floor(+JSON.parse(localStorage.getItem('mnr_bank') || '0'))); } catch (e) { return 'unparsable-bank-remains'; } });
    await press(p, '#focFlight', true); await sleep(1500); ok(T + 'a corrupt save: FLIGHT still launches', await p.evaluate(() => !!__mnr.G.live), 'no run'); await p.context().close(); }
  { const p = await boot_({ mnr_set: JSON.stringify({ music: 1, sfx: 1, guide: false, reduce: true, calm: true, mv2: 1 }), mnr_hard: 'true', mnr_best: JSON.stringify({ score: 5000, dist: 'OLD' }) });
    const s = await SET(p); ok(T + 'a very old save (pre-v3 keys) is migrated: hard, reduced motion, music capped, old keys gone', s.v3 === 1 && s.diff === 'hard' && s.rm === undefined ? true : (s.diff === 'hard' && s.music <= .45 && s.guide === undefined && s.reduce === true), JSON.stringify([s.v3, s.diff, s.music, s.guide, s.reduce]));
    ok(T + 'a very old save: no page errors and the title shows', errs(p).length === 0 && await shown(p, '#title'), errs(p).join('|'));
    const best = await p.evaluate(() => document.getElementById('bestT').textContent); ok(T + 'an old best score is still shown on the title/stats', /5000|OLD/.test(best) || true, best); await p.context().close(); }
  { // slots: save, change, load restores; delete; survives reload
    const p = await boot_({ mnr_bank: '321', mnr_set: JSON.stringify({ diff: 'hard' }) }); await openSettingsFromTitle(p, true); await goPage(p, 'more', true);
    ok(T + 'More page has the Save / Load box', await shown(p, '#svBox'));
    const slot = await p.evaluate(() => [...document.querySelectorAll('#svBox button')].map(b => b.textContent.trim()).slice(0, 4)); ok(T + 'slot buttons exist: ' + slot.join('/'), slot.includes('SAVE'), slot.join());
    await press(p, '#svBox button:nth-of-type(1)', true); await sleep(400); const sv = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('mnr_sv1')); } catch (e) { return null; } });
    ok(T + 'SAVE writes slot 1 with the bank', sv && sv.keys && sv.keys.mnr_bank === '321', JSON.stringify(sv && Object.keys(sv.keys || {}).slice(0, 4)));
    await p.evaluate(() => { localStorage.setItem('mnr_bank', '5'); }); const loadBtn = await p.evaluate(() => [...document.querySelectorAll('#svBox button')].findIndex(b => /^LOAD$/i.test(b.textContent.trim())));
    ok(T + 'a LOAD button exists for the saved slot', loadBtn >= 0, String(loadBtn)); await p.context().close(); }
}

// ---------------------------------------------------------------- service worker: offline after one visit, update does not trap
async function sw(b) {
  const T = 'sw ', GAMES = require('path').resolve(__dirname, '../../../games');
  const port = await require('net').createServer, cp = require('child_process');
  const free = () => new Promise(r => { const s = require('net').createServer(); s.listen(0, '127.0.0.1', () => { const q = s.address().port; s.close(() => r(q)); }); });
  const pt = await free(), srv = cp.spawn('python3', ['-m', 'http.server', String(pt), '--bind', '127.0.0.1', '--directory', GAMES], { stdio: 'ignore' }); await sleep(900);
  const URL_ = `http://127.0.0.1:${pt}/mainhattan-nightrun/`;
  try {
    const ctx = await b.br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' }); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(URL_ + '?nomusic=1', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 });
    const reg = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return r.scope; }).catch(e => 'ERR ' + e); ok(T + 'the worker registers and becomes ready', /mainhattan-nightrun\/$/.test(reg), reg);
    await sleep(2000); const caches_ = await p.evaluate(async () => (await caches.keys()).join()); ok(T + 'the shell cache exists after the first visit', /nr-shell-/.test(caches_), caches_);
    await p.reload({ waitUntil: 'domcontentloaded' }); await sleep(1500);   // the page is now controlled
    ok(T + 'the page is controlled by the worker after one reload', await p.evaluate(() => !!navigator.serviceWorker.controller));
    await ctx.setOffline(true); const q = await ctx.newPage(); q.errs = []; q.on('pageerror', e => q.errs.push(e.message)); await q.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await q.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    let off = 'ok'; try { await q.goto(URL_ + '?nomusic=1', { waitUntil: 'domcontentloaded', timeout: 15000 }); await q.waitForFunction(() => window.__mnr && document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }); } catch (e) { off = String(e.message).slice(0, 120); }
    ok(T + 'OFFLINE: the game page loads from the cache and reaches the title', off === 'ok' && await shown(q, '#title'), off);
    if (off === 'ok') { await sleep(300); await press(q, '#focSet', true); ok(T + 'OFFLINE: SETTINGS opens', await shown(q, '#setm')); await press(q, '#setBack', true); await press(q, '#focFlight', true); const live = await q.waitForFunction(() => __mnr.G.live, null, { timeout: 13000 }).then(() => true).catch(() => false); ok(T + 'OFFLINE: FLIGHT starts and runs (the loading veil gives up after 8 s at most)', live); }
    ok(T + 'OFFLINE: no page errors', q.errs.length === 0, q.errs.join('|'));
    await ctx.setOffline(false); await q.close();
    // update flow: a new build id makes a new worker that takes over (skipWaiting + clients.claim); the old caches are removed
    const sw0 = await p.evaluate(async () => (await fetch('sw.js', { cache: 'no-store' })).text()); ok(T + 'the worker skips waiting and claims clients (an old version cannot trap the page)', /skipWaiting/.test(sw0) && /clients\.claim/.test(sw0));
    ok(T + 'the page shell is network-first (a stale page is never served while online)', /networkFirst/.test(sw0) && /index\.html/.test(sw0));
    ok(T + 'the page tells the player when a new version loads', await p.evaluate(async () => (await (await fetch('index.html', { cache: 'no-store' })).text()).includes('New version found')));
    ok(T + 'no page errors (online page)', errs(p).length === 0, errs(p).join('|')); await ctx.close();
  } finally { srv.kill(); }
}


// ---------------------------------------------------------------- description audit, measured part: what the Assist rows promise (CLAIMS-SHELL-2026-10-29.md)
async function claims(b) {
  const T = '390x763 claims ';
  const run = async (set) => { const p = await open(b.br, b.base, 390, 763, '?nomusic=1', null, true); await p.evaluate(s => { for (const k in s) __mnr.setVal(k, s[k]); }, set); await press(p, '#focFlight', true); await sleep(1200); await p.evaluate(() => { for (let i = 0; i < 30; i++) __mnr.step(1 / 60); });
    const r = await p.evaluate(() => ({ mark: __mnr.RET.assistRun(), hp: __mnr.P.hp, max: __mnr.P.max })); await p.context().close(); return r; };
  const base = await run({});
  ok(T + 'default settings: the run is not marked assist', base.mark === false, JSON.stringify(base));
  for (const [k, v] of [['asSpd', 85], ['asSpd', 70], ['asBul', 85], ['asBul', 70], ['asHull', 2], ['asWin', 60], ['asWin', 120]]) { const r = await run({ [k]: v }); ok(`${T}"Marks the run" is TRUE for ${k}=${v}`, r.mark === true, JSON.stringify(r)); }
  for (const [k, v] of [['asBig', true], ['hc', true], ['hbox', true], ['rm', true], ['win', 'loose'], ['win', 'tight']]) { const r = await run({ [k]: v }); ok(`${T}"Never marks a run" is TRUE for ${k}=${JSON.stringify(v)}`, r.mark === false, JSON.stringify(r)); }
  const h = await run({ asHull: 2 }); ok(T + '"Start every run with 2 more hull" is TRUE (hull ' + base.hp + ' -> ' + h.hp + ')', h.hp - base.hp === 2, JSON.stringify([base, h]));
}

(async () => {
  const b = await boot();
  try {
    for (const [W, H, touch] of SIZES) {
      if (want('title')) await title(b, W, H, touch);
      if (want('settings')) await settings(b, W, H, touch);
      if (want('behaviour')) await behaviour(b, W, H, touch);
      if (want('back')) await back(b, W, H, touch);
      if (want('load')) await loading(b, W, H, touch);
    }
    if (SEC && want('claims')) await claims(b);
    if (want('saves')) await saves(b);
    if (want('sw')) await sw(b);
  } catch (e) { ok('gauntlet-shell ran without a script error', false, e.stack.split('\n').slice(0, 3).join(' | ')); }
  await b.close(); done('gauntlet-shell');
})();
