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
  if (s.q === 'loot') { G.q = { who: 0, kind: 'pick', why: 'loot', opts: tr.slice(1, 4), cont: { k: 'loot', o: 0 }, text: `Loot one card from ${P(1).nm}'s body.` }; }
  if (s.q === 'pick') { G.q = { who: 0, kind: 'pick', why: 'x', opts: ['hand', 'lvl', tr[5]], cont: {}, text: 'Bad Stuff: choose what you lose.' }; }
  render();
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
      await p.evaluate(sd => { ANIM = 0; setSeed(11 + sd.n); newGame('solo', 4); UI.speed = 4; UI.hints = true; try { if (aiTimer) { clearTimeout(aiTimer); aiTimer = null } } catch (e) { } const g = document.getElementById('dkgoal'); if (g) g.remove(); const m = document.getElementById('modal'); if (m) m.hidden = true; try { GX.close && GX.close() } catch (e) { } }, s); await sleep(150);
      if (process.env.TRACE) console.log(W + 'x' + H, JSON.stringify(s));
      p.__tag = `n${s.n} enh${s.enh} r${s.rival} roll${s.roll} q${s.q}`;
      let err = null; try { await p.evaluate(`(${STAGE})(${JSON.stringify(s)})`) } catch (e) { err = e.message.split('\n')[0] }
      // check twice: as soon as it settles, and after the entry animations / a late re-fit
      let bad = []; for (const ms of [400, 900]) { await sleep(ms); bad = await p.evaluate(`(${CHECK})()`); if (bad.length) break; }
      runs++; const tag = `${W}x${H} n${s.n} enh${s.enh} ${s.rival ? 'rival' : 'you'} roll${s.roll} q:${s.q || '-'} long${s.longN} chips${s.chips}`;
      if (err || bad.length) { fails++; lines.push('FAIL ' + tag + ': ' + (err || bad.join(' | '))); if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/ff-${W}x${H}-${fails}.png` }); }
    }
    if (errs.length) { fails++; lines.push(`FAIL ${W}x${H} page errors: ${[...new Set(errs)].slice(0, 3).join(' | ')}`); }
    await ctx.close();
  }));
  await browser.close();
  for (const l of lines.slice(0, 40)) console.log(l);
  console.log(`[fightfit] ${fails ? 'FAIL' : 'PASS'}: ${runs - fails}/${runs} fight shapes inside the table at ${SIZES.map(s => s.join('x')).join(', ')}`);
  process.exit(fails ? 1 : 0);
})();
