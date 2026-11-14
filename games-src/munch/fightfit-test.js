// Fight-fit stress test: forces every fight shape at phone sizes and checks that every fight element lies inside the table.
//   node fightfit-test.js [sizes=375x553,360x640,375x667]   (needs doorkick.html: python3 build.py)
// Shapes: 1-4 monsters x enhancers x your fight / rival fight x roll box x dock question (caught / loot / pick) x long names x kill chips.
const PW = (() => { try { return require('playwright') } catch (e) { return require('/opt/node-tools/node_modules/playwright') } })();
const fs = require('fs'); const html = fs.readFileSync(__dirname + '/doorkick.html'); const localRoute = require('./local-route.js');
const SIZES = (process.argv[2] || '375x553,360x640,375x667').split(',').map(s => s.split('x').map(Number));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SHAPES = [];
for (const n of [1, 2, 3, 4]) for (const enh of [0, 1]) for (const rival of [0, 1]) for (const roll of [0, 1]) for (const q of ['', 'rescue', 'loot', 'pick']) for (const longN of [0, 1]) {
  if (q === 'rescue' && (rival || !roll)) continue;          // only you get caught, and only after a roll
  if (q === 'loot' && !rival) continue;                       // you loot a dead rival's body
  if (longN && (enh + roll) % 2) continue;                    // keep the run short: long names on half the shapes
  SHAPES.push({ n, enh, rival, roll, q, longN, chips: (n + enh) % 2 });
}
// a dock question with the fight buttons is also covered by the shapes with q='' (your own act stage shows Fight!/Run/Help)
const STAGE = s => {
  const ids = Object.keys(G.C).map(Number), mons = ids.filter(i => cd(i).t === 'monster'), enhs = ids.filter(i => cd(i).t === 'enh'), tr = ids.filter(i => cd(i).d === 'tr');
  const who = s.rival ? 1 : 0; G.active = who; G.q = null; G.lastRoll = null;
  if (s.longN) { P(1).nm = 'Bartholomew the Unbelievably Long-Winded'; for (const m of mons.slice(0, 4)) cd(m).n = 'The Extraordinarily Enormous Plutonium Dragon'; }
  startCombat(who, mons[0], 'kick'); const cb = G.cb;
  for (let k = 1; k < s.n; k++) cb.mons.push({ id: mons[k], enh: [] });
  if (s.enh) cb.mons.forEach((m, j) => { m.enh.push(enhs[j % enhs.length]); if (j === 0) m.enh.push(enhs[(j + 1) % enhs.length]); });
  if (s.chips) { cb.killed.push({ def: cd(mons[5]), kill: true }); cb.os.push({ id: tr[0], side: 'p' }); }
  if (s.roll) { cb.runs = cb.runs || []; G.lastRoll = { who, v: 3, mod: 1, ok: false, id: 900 + (window.__k = (window.__k || 0) + 1), what: 'run' }; }
  if (s.q === 'rescue') { cb.stage = 'run'; cb.runs = cb.mons.map(m => ({ w: 0, m: m.id, r: 3, ok: false, done: true, auto: false, pen: false })); G.q = { who: 0, kind: 'rescue', run: 0 }; }
  if (s.q === 'loot') { G.loot = { v: 1, pool: tr.slice(1, 4), ord: [0], i: 1 }; G.q = { who: 0, kind: 'pick', why: 'loot', opts: tr.slice(1, 4), cont: { k: 'loot', o: 0 }, text: `Loot one card from ${P(1).nm}'s body.` }; }
  if (s.q === 'pick') { G.q = { who: 0, kind: 'pick', why: 'x', opts: ['hand', 'lvl', tr[5]], cont: {}, text: 'Bad Stuff: choose what you lose.' }; }
  render();
  // a toast and a note arrive mid-fight (an item that cannot be worn): neither may cover the readout
  if (s.chips) { UI.toast = { t: 'Not worn: no free slot.', until: Date.now() + 9000 }; render(); }
  else { const a0 = ANIM; ANIM = 1; try { bfNote(document.querySelector('.mine .bfhero') || document.querySelector('.mine'), 'Not worn: no free slot', 'bad') } finally { ANIM = a0 } }
};
const CHECK = () => {
  const vis = e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const ar = document.querySelector('.arena'), tb = document.querySelector('.table'); if (!ar || !tb) return ['no arena'];
  const t = tb.getBoundingClientRect(), bad = [];
  for (const e of ar.querySelectorAll('*')) {   // the arena box itself is an invisible frame; everything drawn in it must fit
    if (!vis(e) || e.closest('.die3sp,.vsx,svg,.die3') || e.matches('.hit')) continue;      // spinning-die sprite, the crossed swords and invisible tap zones are not drawn boxes
    if (e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect();
    if (r.top < t.top - 1 || r.bottom > t.bottom + 1 || r.left < t.left - 1 || r.right > t.right + 1) { bad.push(`${(e.className && e.className.toString ? e.className.toString() : e.tagName).split(' ')[0] || e.tagName} ${Math.round(r.top)}..${Math.round(r.bottom)} x${Math.round(r.left)}..${Math.round(r.right)} table ${Math.round(t.top)}..${Math.round(t.bottom)} x${Math.round(t.left)}..${Math.round(t.right)}`); if (bad.length > 2) break; }
  }
  // readable: every visible text in the fight is >= 11 px on screen (zoom and the final scale counted), no two texts overlap,
  // and no number box (b.num / b.n) or name label is narrower than its own text (a collapsed box paints its digits over the next label)
  const sc = (() => { const m = /scale\(([\d.]+)\)/.exec(ar.style.transform || ''); return m ? +m[1] : 1 })();
  const zoomOf = e => { let z = 1; for (let x = e; x && x !== document.documentElement; x = x.parentElement) z *= parseFloat(getComputedStyle(x).zoom) || 1; return z };
  const clipR = (e, r) => { let { left, right, top, bottom } = r; for (let x = e; x && x !== ar.parentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.overflowX !== 'visible' || s.overflowY !== 'visible') { const q = x.getBoundingClientRect(); left = Math.max(left, q.left); right = Math.min(right, q.right); top = Math.max(top, q.top); bottom = Math.min(bottom, q.bottom) } } return { left, right, top, bottom } };
  const texts = [];
  for (const e of ar.querySelectorAll('*')) {
    if (!vis(e) || e.closest('.die3sp,.vsx,svg,.die3,[hidden],.sr,.hit')) continue;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    let anc = false; for (let x = e.parentElement; x && x !== ar; x = x.parentElement) if (!vis(x) && getComputedStyle(x).display === 'none') anc = true; if (anc) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize) * zoomOf(e) * sc, nm = (e.className && e.className.toString ? e.className.toString().split(' ')[0] : '') || e.tagName.toLowerCase();
    const label = `${nm}"${e.textContent.trim().slice(0, 14)}"`;
    if (fs < 10.95) bad.push(`text ${fs.toFixed(1)}px ${label}`);
    if (e.matches('b.num,b.n,.yn,.sl1 i') && e.scrollWidth > e.clientWidth + 1) bad.push(`narrow ${label} box ${e.clientWidth} < text ${e.scrollWidth}`);
    for (const n of e.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) { const c = clipR(e, r); if (c.right - c.left > 1 && c.bottom - c.top > 1) texts.push({ e, label, c }) } }
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) { const a = texts[i], b = texts[j]; if (a.e === b.e) continue;
    const ox = Math.min(a.c.right, b.c.right) - Math.max(a.c.left, b.c.left), oy = Math.min(a.c.bottom, b.c.bottom) - Math.max(a.c.top, b.c.top);
    if (ox > 1.5 && oy > 2) { bad.push(`overlap ${a.label} / ${b.label}`); i = texts.length; break } }
  // a toast never sits on the score readout or the pill
  for (const toast of document.querySelectorAll('#prompt .toast,.bfbub.note')) if (vis(toast)) { const tr = toast.getBoundingClientRect(); for (const e of ar.querySelectorAll('.sline,.vs .score')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (Math.min(tr.right, r.right) - Math.max(tr.left, r.left) > 1 && Math.min(tr.bottom, r.bottom) - Math.max(tr.top, r.top) > 1) { bad.push('toast covers ' + e.className.split(' ')[0]); break } } }
  // the dock question fits its dock: no hidden overflow, and its buttons end inside the screen
  const pr = document.getElementById('prompt'); if (pr && vis(pr)) { if (pr.scrollHeight > pr.clientHeight + 1) bad.push(`dock overflows ${pr.scrollHeight - pr.clientHeight}px`);
    for (const b of pr.querySelectorAll('.btn')) { if (!vis(b)) continue; const r = b.getBoundingClientRect(); if (r.bottom > innerHeight - 1) { bad.push(`dock button off screen "${b.textContent.trim().slice(0, 16)}"`); break } } }
  return bad;
};
(async () => {
  const browser = await PW.chromium.launch(); let fails = 0, runs = 0; const lines = [];
  await Promise.all(SIZES.map(async ([W, H]) => {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await localRoute(ctx, html);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message + ' @' + ((e.stack || '').split('\n')[1] || '').trim().slice(0, 60) + ' [' + (p.__tag || '') + ']')); p.on('crash', () => console.log('CRASH at', W + 'x' + H, ''));
    await p.goto('https://gns.test/?phone=1'); await sleep(900); await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('dkd_offer', '1') } catch (e) { } }); await p.reload(); await sleep(1200);
    await p.addStyleTag({ content: '#dkgoal{display:none!important}' });
    await p.evaluate(() => { window.schedule = function () { }; });   // the computer must not play on from a staged fight
    for (const s of SHAPES) {
      if (process.env.ONLY && !new RegExp(process.env.ONLY).test(`${W}x${H} n${s.n} enh${s.enh} ${s.rival ? 'rival' : 'you'} roll${s.roll} q:${s.q || '-'} long${s.longN} chips${s.chips}`)) continue;
      await p.evaluate(sd => { ANIM = 0; setSeed(11 + sd.n); newGame('solo', 4); UI.speed = 4; UI.hints = true; try { if (aiTimer) { clearTimeout(aiTimer); aiTimer = null } } catch (e) { } const g = document.getElementById('dkgoal'); if (g) g.remove(); const m = document.getElementById('modal'); if (m) m.hidden = true; try { GX.close && GX.close() } catch (e) { } }, s); await sleep(150);
      if (process.env.TRACE) console.log(W + 'x' + H, JSON.stringify(s));
      p.__tag = `n${s.n} enh${s.enh} r${s.rival} roll${s.roll} q${s.q}`;
      let err = null; try { await p.evaluate(`(${STAGE})(${JSON.stringify(s)})`) } catch (e) { err = e.message.split('\n')[0] }
      // check twice: as soon as it settles, and after the entry animations / a late re-fit
      let bad = []; for (const ms of [400, 900]) { await sleep(ms); bad = await p.evaluate(`(${CHECK})()`); if (bad.length) break; }
      if (process.env.DOCK) console.log(await p.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return `${e.id || e.className.toString().split(' ').slice(0, 2).join('.')} ${Math.round(r.top)}..${Math.round(r.bottom)} h${Math.round(r.height)} sh${e.scrollHeight} pad${cs.paddingTop}/${cs.paddingBottom} mt${cs.marginTop} mb${cs.marginBottom} ov${cs.overflowY} maxh${cs.maxHeight}` }; const pr = document.getElementById('prompt'); const o = []; for (let x = pr; x && x !== document.body; x = x.parentElement) o.push(R(x)); return o.join('\n') + ' gap ' + getComputedStyle(pr).rowGap + ' jc ' + getComputedStyle(pr).justifyContent + '\n kids: ' + [...pr.children].map(e => R(e) + ' d=' + getComputedStyle(e).display + ' pos=' + getComputedStyle(e).position + ' ord=' + getComputedStyle(e).order + ' ot=' + e.offsetTop + ' top=' + getComputedStyle(e).top + ' tf=' + getComputedStyle(e).transform + (e === pr.lastElementChild ? ' BEFORE ' + getComputedStyle(pr, '::before').display + ' ' + getComputedStyle(pr, '::before').height + ' ord ' + getComputedStyle(pr, '::before').order + ' AFTER ' + getComputedStyle(pr, '::after').display + ' ' + getComputedStyle(pr, '::after').height : '')).join('\n   ') + '\n gx-board ' + R(document.querySelector('.gx-board')) + '\n mine ' + R(document.querySelector('.mine')) }));
      if (process.env.DOCK2) console.log(await p.evaluate(() => { const a = document.querySelector('#prompt .acts.main'); const o = ['inline: ' + a.getAttribute('style')]; for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules } catch (e) { continue } const walk = rl => { for (const r of rl) { if (r.cssRules && !r.selectorText) { try { if (!r.media || matchMedia(r.media.mediaText).matches) walk(r.cssRules) } catch (e) { } continue } if (r.selectorText && r.style && r.style.top) { try { if (a.matches(r.selectorText)) o.push(r.selectorText.slice(0, 200) + ' => top:' + r.style.top) } catch (e) { } } } }; walk(rs) } return o.join('\n') }));
      if (process.env.DEBUG2) console.log(await p.evaluate(() => { const ar = document.querySelector('.arena'), tb = document.querySelector('.table'); TB.fitting = 1; ar.classList.remove('tight', 'tight2', 'cmp', 'cmp2', 'squash'); ar.style.removeProperty('--cw'); ar.style.removeProperty('transform'); const t = tb.getBoundingClientRect(); const o = []; for (const e of ar.querySelectorAll('*')) { if (e.closest('.die3sp,.vsx,svg,.die3')) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || !e.getClientRects().length) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.top < t.top - .5 || r.bottom > t.bottom + .5 || r.left < t.left - .5 || r.right > t.right + .5) o.push(e.className.toString().split(' ')[0] + ' ' + Math.round(r.top) + '..' + Math.round(r.bottom) + ' x' + Math.round(r.left) + '..' + Math.round(r.right)) } const c = ar.querySelector('.row.mons .card'); const res = 'OUT at normal: ' + o.slice(0, 6).join(' | ') + ' card ' + (c && c.offsetWidth); TB.fitting = 0; tbFit(); return res }));
      if (process.env.DEBUG) console.log(await p.evaluate(() => { const ar = document.querySelector('.arena'), t = document.querySelector('.table').getBoundingClientRect(); const R = e => { const r = e.getBoundingClientRect(); return `${Math.round(r.top)}..${Math.round(r.bottom)} x${Math.round(r.left)}..${Math.round(r.right)}` }; return `table ${R(document.querySelector('.table'))} arena ${ar.className} cw=${ar.style.getPropertyValue('--cw')} tf=${ar.style.transform} | ` + [...ar.querySelectorAll(':scope>*,.row.mons .card')].map(e => (e.className.toString().split(' ').slice(0, 2).join('.')) + ' ' + R(e) + (getComputedStyle(e).display === 'none' ? ' (none)' : '')).join(' | ') }));
      runs++; const tag = `${W}x${H} n${s.n} enh${s.enh} ${s.rival ? 'rival' : 'you'} roll${s.roll} q:${s.q || '-'} long${s.longN} chips${s.chips}`;
      if (err || bad.length) { fails++; lines.push('FAIL ' + tag + ': ' + (err || bad.join(' | '))); if (process.env.SHOT && fails <= +(process.env.NSHOT || 99)) await p.screenshot({ path: `${process.env.SHOT}/ff-${W}x${H}-${fails}.png` }); }
    }
    if (errs.length) { fails++; lines.push(`FAIL ${W}x${H} page errors: ${[...new Set(errs)].slice(0, 3).join(' | ')}`); }
    await ctx.close();
  }));
  await browser.close();
  for (const l of lines.slice(0, +(process.env.NL || 40))) console.log(l);
  console.log(`[fightfit] ${fails ? 'FAIL' : 'PASS'}: ${runs - fails}/${runs} fight shapes inside the table, text >= 11 px, no overlaps, at ${SIZES.map(s => s.join('x')).join(', ')}`);
  process.exit(fails ? 1 : 0);
})();
