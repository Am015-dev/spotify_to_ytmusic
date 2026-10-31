#!/usr/bin/env node
// COPY TEST (W295): every string a player can reach is English UI text (German only in the proper-noun allowlist), has no dev
// leftovers (TODO, XXX, scn=, lorem, test), fits its box at 390x763, and the boss warning is >= 16 px. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/copy-test.js   (uses the built games/mainhattan-nightrun/index.html; SHOTS=dir saves shots)
const L = require('./lib.js'), { boot, open, ok, done, sleep } = L, fs = require('fs');
const SHOTS = process.env.SHOTS;
// proper nouns of the Frankfurt 2099 setting (German by design): district, place and boss names. Spelled the same everywhere.
const PROPER = ['Frankfurt am Main', 'Mainhattan', 'Bankenviertel', 'Mainufer', 'Ostend', 'Messe', 'Taunusanlage', 'Eiserner Steg', 'EZB-Sperrzone', 'Hammering Man', 'Plaka', 'Athina', 'Zeil', 'Zentral-ICE', 'Messe-Wächter', 'Tresor-Wart', 'Brücken-Wächter', 'Kronos', 'Main', 'Oda', 'Wren', 'Lumen'];
const GERMAN = /\b(warnung|schicht|sektor|frei|kurierflug|und|nicht|der|die|das|mit|für|zum|zur|eine?|dein|deine|ist|wird|auf|dem|den|bitte|spiel|starte|weiter|zurück|taste|schiff|leben|punkte|sieg|ende|los|achtung|gefahr|angriff|neustart|weiterspielen|einstellungen|beenden)\b/i;
const DEV = /\b(todo|xxx|fixme|lorem|ipsum|placeholder|debug|tbd|dummy)\b|scn=|\bsim=1\b|\btest\b|\bchecklist\b|owner test|undefined|NaN\b|\[object/i;
const walk = () => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while (n = w.nextNode()) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!t || t.length < 2) continue; const e = n.parentElement; if (!e || ['SCRIPT', 'STYLE'].includes(e.tagName)) continue; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue; let h = false, q = e; while (q) { if (q.hidden || getComputedStyle(q).display === 'none') { h = true; break; } q = q.parentElement; } if (h) continue;
  const clipX = e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'visible' && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll'; const off = r.right > innerWidth + 1 || r.left < -1; out.push({ k: 'dom', t, id: (e.id || e.className || e.tagName) + '', fs: parseFloat(cs.fontSize), x: Math.round(r.left), y: Math.round(r.top), over: clipX || off }); } return out; };
const hook = () => { window.__cv = []; const c = CanvasRenderingContext2D.prototype; for (const f of ['fillText', 'strokeText']) { const o = c[f]; c[f] = function (t, x, y) { try { const m = /(\d+(?:\.\d+)?)px/.exec(this.font), tr = this.getTransform(), wd = this.measureText(String(t)).width * Math.abs(tr.a); window.__cv.push({ k: 'cv', t: String(t), fs: m ? +m[1] * Math.abs(tr.a) : 0, x: Math.round(x * tr.a + tr.e), y: Math.round(y * tr.d + tr.f), w: Math.round(wd), cw: this.canvas.width, over: this.textAlign === 'center' ? (x * tr.a + tr.e - wd / 2 < -1 || x * tr.a + tr.e + wd / 2 > this.canvas.width + 1) : this.textAlign === 'right' ? x * tr.a + tr.e - wd < -1 : x * tr.a + tr.e + wd > this.canvas.width + 1 }); } catch (e) { } return o.apply(this, arguments); }; } };
const stripNouns = t => { let s = t; for (const n of PROPER) s = s.replace(new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' '); return s; };
(async () => {
  const b = await boot();
  for (const [W, H, touch] of [[390, 763, true], [1440, 860, false]]) {
    const T = `${W}x${H} `, p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch); await p.evaluate(hook);
    const seen = new Map(); const snap = async name => { await sleep(150); const d = (await p.evaluate(walk)).concat(await p.evaluate(() => { const a = window.__cv; window.__cv = []; return a; })); for (const r of d) { r.scr = name; seen.set(r.t + '|' + name, r); } if (SHOTS) await p.screenshot({ path: `${SHOTS}/copy-${name}-${W}.png` }); };
    const step = n => p.evaluate(n => { for (let i = 0; i < n; i++) __mnr.step(1 / 60); }, n);
    const click = async s => { const bb = await p.locator(s).boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(200); };
    await snap('title'); await click('#focSet'); await snap('settings');
    for (const sub of ['tdAssist', 'tdMore']) { await p.evaluate(id => { const e = document.getElementById(id); if (e) e.scrollIntoView({ block: 'center' }); }, sub); await sleep(150); if (await p.locator('#' + sub).isVisible()) { await click('#' + sub); await snap('settings-' + sub.slice(2).toLowerCase()); if (await p.locator('#tdBack').isVisible()) await click('#tdBack'); await sleep(200); } }
    if (await p.evaluate(() => !document.getElementById('setm').hidden)) await click('#setBack'); await sleep(300);
    await click('#focFlight'); await sleep(700); await step(60); await snap('flight-early'); await step(240); await snap('flight');
    await p.evaluate(() => { const m = __mnr; m.G.dbar = m.ST.lead + 3; for (let i = 0; i < 1500 && !m.G.boss; i++) { m.P.inv = 9; m.step(1 / 60); } }); await step(10); await snap('boss-warning-carrier');
    await p.evaluate(() => { const m = __mnr; for (let i = 0; i < 4000 && !(m.G.banner && /^WARNING$/.test(m.G.banner.a) && m.G.boss && m.G.banner.t > 0); i++) { m.P.inv = 9; m.step(1 / 60); } }); await snap('boss-warning');
    await p.evaluate(() => { const m = __mnr; m.G.boss = null; m.G.en = []; m.ST.bossDown({ nm: 'ZENTRAL-ICE' }, 1000); }); await sleep(100); for (let i = 0; i < 20; i++) { if (await p.evaluate(() => { const e = document.getElementById('stres'); return !!e && !e.hidden; })) break; if (await p.evaluate(() => { const e = document.getElementById('shGo'); return !!e && !e.hidden && e.offsetParent; })) { await click('#shGo'); } await step(60); } await snap('result');
    await p.evaluate(() => { __mnr.step(1 / 60); }); const ft = await p.evaluate(() => !document.getElementById('focTitle').hidden); if (ft) await click('#focTitle'); await sleep(200);
    await click('#focFlight'); await sleep(700); await step(30); await p.evaluate(() => { const m = __mnr; m.P.inv = 0; m.P.sh = 0; m.P.hp = 0; m.hurt(99); }); await step(120); await sleep(300); await snap('game-over');
    if (await p.evaluate(() => !document.getElementById('menuBtn').closest('[hidden]'))) await click('#menuBtn').catch(() => { }); await sleep(300);
    await click('#focFlight').catch(() => { }); await sleep(600); await step(30); if (touch) await click('#bPause'); else await p.keyboard.press('p'); await sleep(250); await snap('pause'); await click('#quitBtn'); await sleep(250);
    await click('#focFoot'); await sleep(800); await snap('story-card'); await step(30); await sleep(200);
    if (await p.evaluate(() => { const e = document.getElementById('taleSkip'); return !!e && e.offsetParent; })) { await click('#taleSkip'); await sleep(700); }
    for (let i = 0; i < 8; i++) { await step(60); if (i === 2) await snap('foot-hint'); } await snap('foot-hint-late');
    const rows = [...seen.values()];
    // 1 English: no German words outside the proper nouns
    const ger = rows.filter(r => { const s = stripNouns(r.t); return GERMAN.test(s) || /[äöüß]/i.test(s); });
    ok(T + 'every string is English UI text (German only as proper nouns)', ger.length === 0, ger.slice(0, 6).map(r => `${r.scr}:"${r.t.slice(0, 40)}"`).join(' | '));
    // 2 no dev leftovers
    const dev = rows.filter(r => DEV.test(r.t) && !/^(NEW TWIST|REMIX)$/.test(r.t));
    ok(T + 'no dev leftovers (TODO, XXX, scn=, lorem, test, placeholder) reach a player', dev.length === 0, dev.slice(0, 6).map(r => `${r.scr}:"${r.t.slice(0, 40)}"`).join(' | '));
    // 3 fits its box: DOM boxes not clipped / off-screen, canvas text inside the canvas
    const ov = rows.filter(r => r.over); ok(T + 'no string is cut or runs off its box', ov.length === 0, ov.slice(0, 6).map(r => `${r.scr}:"${r.t.slice(0, 40)}"`).join(' | '));
    // 4 boss warning is readable (>= 16 px on screen)
    const bw = rows.filter(r => r.k === 'cv' && /^WARNING\b/.test(r.t)); ok(T + 'boss warning drawn in English', bw.length > 0 && bw.every(r => /^WARNING · /.test(r.t) && !/WARNUNG/.test(r.t)), bw.map(r => r.t).join('|') || 'not seen');
    ok(T + 'boss warning >= 16 px', bw.length > 0 && bw.every(r => r.fs >= 16), bw.map(r => r.fs.toFixed(1)).join(','));
    // 5 the owner test list is not reachable from title / settings
    ok(T + 'no test checklist button for players', (await p.evaluate(() => document.querySelectorAll('.ckB').length)) === 0);
    ok(T + 'no page errors', p.errs.length === 0, p.errs.join('|'));
    if (process.env.DUMP) fs.writeFileSync(`${process.env.DUMP}/copy-${W}.json`, JSON.stringify(rows));
    await p.context().close();
  }
  await b.close(); done('copy-test');
})().catch(e => { console.log('FAIL copy-test crashed :: ' + e.message); process.exit(1); });
