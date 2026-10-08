// Crown City Smash: "the dice do not show up and nothing responds" regression test (desktop + resume + clips).
//   node resume-test.js            env: FILE=kot2.html  ONLY=abcd  SEEDS=3,1
//   a) STORY chapter c9 (the "Trial of Strength" curse forced) through the REAL story map and the REAL shelf frame
//      (games/index.html -> iframe), at 1908x934 and 1280x800, standalone and in the frame: the dice must be thrown
//      (G.dice, 3D tray, dice tiles), Reroll/Resolve not covered by anything, and a click on Resolve must act.
//      The game starts on the player's turn or after computer turns, whichever the seed gives (both are covered).
//   b) a boss chapter (c7, a clip) with the clip playing / skipped / never starting / stalling / garbage bytes / files missing:
//      no invisible overlay may stay on the page and the game must reach the dice.
//   c) resuming saved games: forged and old-shaped saves (no dice, step 'start', 'end', missing fields, unknown curse,
//      garbage), plus real snapshots of a story game: Continue must give a playable board (or drop the save).
//   d) a turn stuck in its 'start' step goes on to the roll by itself (watchdog).
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path'), fs = require('fs'), http = require('http');
const E = process.env, FILE = path.resolve(E.FILE || path.join(__dirname, 'kot2.html')), ONLY = E.ONLY || 'abcd';
const SEEDS = (E.SEEDS || '3,1').split(',').map(Number), GAMES = path.resolve(__dirname, '../../games');
let MEDIA_MODE = 'ok'; // ok | missing | hang | garbage
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.json': 'application/json', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
  const isMedia = /^\/crown-city-smash\/(media|models)\//.test(u) || /\.mp4$/.test(u);
  if (isMedia && MEDIA_MODE === 'missing') { r.statusCode = 404; return r.end() }
  if (isMedia && MEDIA_MODE === 'hang' && /\.mp4$/.test(u)) { r.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': 5000000 }); r.write(Buffer.alloc(100)); return }
  if (isMedia && MEDIA_MODE === 'garbage' && /\.mp4$/.test(u)) { r.writeHead(200, { 'Content-Type': 'video/mp4' }); return r.end(Buffer.from('not a video at all')) }
  let f = path.join(GAMES, u); if (u === '/crown-city-smash/index.html' || u === '/solo.html') f = FILE;
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end() }
  r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
let BASE = '', bad = 0; const fail = (t, m) => { bad++; console.log('FAIL', t, m) }, ok = (t, m) => console.log('ok  ', t, m || '');
const GAME_URL = () => BASE + '/crown-city-smash/index.html';
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'];
const PROG = JSON.stringify({ v: 1, ch: Object.fromEntries(Array.from({ length: 9 }, (_, i) => ['c' + (i + 1), { beaten: true, stars: 2, best: null, tries: 1, losses: 0, easy: false }])), unlocked: [], last: null });

// a page that talks to the game: standalone (fr === page) or inside the shelf's iframe (fr = the frame)
async function open(b, { w, h, mode, ls, init, touch }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: !!touch, isMobile: !!touch });
  await ctx.addInitScript(l => { try { if (!sessionStorage.__seeded) { sessionStorage.__seeded = 1; for (const k in l) localStorage.setItem(k, l[k]) } } catch (e) { } }, ls || {});
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.errs = errs;
  p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts\.g|404|WebGL|certificate/i.test(m.text())) errs.push('console ' + m.text()) });
  let fr = p;
  if (mode === 'shelf') {
    await p.goto(BASE + '/index.html'); await p.waitForTimeout(1500);
    await p.evaluate(() => openGame(GAMES.find(x => x.id === 'crown'), true));
    fr = await (await p.waitForSelector('#frame')).contentFrame();
    await p.waitForFunction(() => { const l = document.getElementById('loader'); return !l || l.hidden || getComputedStyle(l).display === 'none' || getComputedStyle(l).opacity === '0' || getComputedStyle(l).visibility === 'hidden' }, null, { timeout: 30000 }).catch(() => { });
  } else await p.goto(GAME_URL() + (E.QS || ''));
  await fr.waitForSelector('[data-start]'); await p.waitForTimeout(1200);
  return { ctx, p, fr };
}
const click = async (p, loc) => { const bb = await loc.boundingBox(); if (!bb) return false; await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); return true };
const STATE = () => ({ g: typeof G !== 'undefined' && !!G, seat: G && G.pl.findIndex(q => q.human), phase: G && G.phase, active: G && G.active, human: G && humanTurn(), dice: G ? G.dice.length : -1, tiles: document.querySelectorAll('#dice .die').length,
  tray: typeof V3 !== 'undefined' && V3.on ? V3.dice.length : -2, choice: !!UI.choice && UI.choice.title, intro: !!UI.intro, busy: !!UI.busy, pend: !!UI.pending, clip: !!document.querySelector('.ccclip'), win: !!(G && G.winner),
  acts: [...document.querySelectorAll('#pacts button')].filter(e => e.offsetParent).length });
// what is on top at the centre of the Reroll / Resolve buttons and the dice tiles (after scrolling them into view)
const COVER = () => { const out = []; for (const e of document.querySelectorAll('#dice .die,#pacts [data-act=reroll],#pacts [data-act=resolve]')) {
  if (!e.offsetParent) continue; e.scrollIntoView({ block: 'center', inline: 'center' }); const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { out.push((e.dataset.act || 'die') + ' off screen'); continue }
  const t = document.elementFromPoint(x, y); if (!(t && (t === e || e.contains(t) || t.contains(e)))) out.push((e.dataset.act || 'die') + ' covered by ' + (t ? t.tagName + '#' + t.id + '.' + String(t.className).slice(0, 30) : 'nothing')) } return out };
// one careless click on whatever blocks the way to the human's roll (choice, coach bubble, intro card, moment button)
async function unblock(p, fr) {
  const t = await fr.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !e.closest('[hidden],.hidden') && getComputedStyle(e).visibility !== 'hidden' };
    const e = [...document.querySelectorAll('#choice [data-opt=n]')].find(vis) || [...document.querySelectorAll('#choice [data-opt]')].find(vis) || (humanTurn() && G.phase === 'buy' ? [...document.querySelectorAll('#pacts [data-act=end]')].find(vis) : null) || [...document.querySelectorAll('.gxh-ok')].find(vis) || [...document.querySelectorAll('#moment button')].find(vis); if (e) { e.setAttribute('data-uk', '1'); return 'k' }
    if (UI.intro) return 'i'; return null });
  if (t === 'k') { const l = fr.locator('[data-uk="1"]').first(); await click(p, l); await fr.evaluate(() => document.querySelectorAll('[data-uk]').forEach(e => e.removeAttribute('data-uk'))); return true }
  if (t === 'i') { const l = fr.locator('button:visible', { hasText: "Let's smash" }).first(); if (await l.count()) return click(p, l); await fr.evaluate(() => { UI.intro = false; render(); schedule() }); return true }
  return false }
async function assertPlayable(p, fr, tag, ms = 60000) {
  const t0 = Date.now(); let s = null;
  while (Date.now() - t0 < ms) { s = await fr.evaluate(STATE); if (s.g && s.human && s.phase === 'roll' && !s.choice && !s.intro && s.dice >= 6 && s.tiles >= 6) break; if (s.g && s.win) return ok(tag, 'game ended'); if (s.human && s.phase === 'roll' && !s.choice && !s.intro) { await p.waitForTimeout(300); continue } /* my roll step: just wait for the dice, never tap */ if (!await unblock(p, fr)) await p.waitForTimeout(400); else await p.waitForTimeout(250) }
  if (!(s && s.human && s.phase === 'roll' && s.dice >= 6)) return fail(tag, 'never got dice on my roll step: ' + JSON.stringify(s));
  await p.waitForTimeout(500); if (s.tray !== -2 && s.tray !== s.dice) return fail(tag, '3D tray has ' + s.tray + ' dice, game has ' + s.dice);
  let cv = await fr.evaluate(COVER); for (let i = 0; i < 8 && cv.length; i++) { await p.waitForTimeout(400); cv = await fr.evaluate(COVER) }
  if (cv.length) { if (E.DEBUG) console.log('  .. bubble', JSON.stringify(await fr.evaluate(() => [...document.querySelectorAll('.gxh-bub')].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), b.innerText.slice(0, 60)] })))); try { fs.mkdirSync(path.join(__dirname, 'sweep-shots'), { recursive: true }); await p.screenshot({ path: path.join(__dirname, 'sweep-shots', 'resume-' + tag.replace(/\W+/g, '_') + '.png') }) } catch (e) { } return fail(tag, 'covered: ' + cv.join('; ')) }
  if (p.errs.length) return fail(tag, p.errs[0]);
  const before = await fr.evaluate(() => JSON.stringify([G.rolls, G.phase, G.dice.map(d => d.f + d.k)]));
  const btn = fr.locator('#pacts [data-act=resolve]').first(); await btn.scrollIntoViewIfNeeded(); if (!await click(p, btn)) return fail(tag, 'no Resolve button');
  await p.waitForTimeout(1200); const after = await fr.evaluate(() => JSON.stringify([G.rolls, G.phase, G.dice.map(d => d.f + d.k)]));
  if (before === after) return fail(tag, 'clicking Resolve did nothing ' + before);
  ok(tag, `seat ${s.seat}, ${s.dice} dice, ${s.tiles} tiles, tray ${s.tray}`) }

// open the story map and play chapter `ch` the way a player does; `curse` forces that curse card for the game
async function playChapter(p, fr, ch, { curse, seed } = {}) {
  const dbg = m => { if (E.DEBUG) console.log('  ..', m) }; dbg('playChapter ' + ch);
  await fr.evaluate(([c, sd]) => { window.__keep = Object.assign({}, CURSES); if (c) for (const k in CURSES) if (k !== c) delete CURSES[k]; UI.mon = 2; AIDELAY = 30; if (sd) setSeed(sd) }, [curse || null, seed || 0]);
  dbg('open map'); await click(p, fr.locator('[data-camp]:visible').first()); await p.waitForTimeout(900); dbg('map open');
  const n = +ch.slice(1) - 1, node = fr.locator('.gxc-node').nth(n); await node.scrollIntoViewIfNeeded(); await click(p, node); await p.waitForTimeout(600);
  for (let i = 0; i < 24; i++) {
    if (await fr.evaluate(() => typeof G !== 'undefined' && !!G && !!G.camp && !document.querySelector('.gxc:not([hidden])') && !document.querySelector('.ccclip'))) break;
    if (await fr.evaluate(() => !!document.querySelector('.ccclip.on'))) { await p.waitForTimeout(600); await p.mouse.click(300, 300); await p.waitForTimeout(400); continue } // tap to skip a playing clip
    dbg('step ' + i);
    const g = fr.locator('.gxc:not([hidden]) button:visible', { hasText: /^(Play|Start|Fight|Next|Meet|Let|Go|Begin)/ }).first();
    if (await g.count()) await click(p, g); else { const any = fr.locator('.gxc:not([hidden]) button.go:visible').first(); if (await any.count()) await click(p, any) }
    await p.waitForTimeout(700) }
  await fr.evaluate(() => { Object.assign(CURSES, window.__keep); setSeed(null) }); await p.waitForTimeout(800);
  return fr.evaluate(() => !!(typeof G !== 'undefined' && G && G.camp)) }

(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); BASE = 'http://127.0.0.1:' + srv.address().port;
  const b = await PW.chromium.launch({ args: ARGS }); const LS = { 'gns-campaign-crown': PROG, ccs_tour2: '1' };
  // ---------------- a) the owner's case: story, Trial of Strength curse, desktop sizes, standalone and in the shelf frame ----------------
  if (ONLY.includes('a')) for (const [W, H] of [[1908, 934], [1280, 800]]) for (const mode of ['alone', 'shelf']) for (const seed of (W === 1908 && mode === 'shelf' ? SEEDS : SEEDS.slice(0, 1))) {
    const tag = `a ${W}x${H} ${mode} seed${seed}`; const T0 = Date.now(); const { ctx, p, fr } = await open(b, { w: W, h: H, mode, ls: LS });
    if (!await playChapter(p, fr, 'c9', { curse: 'k_mighty', seed })) { fail(tag, 'story never reached the board'); await ctx.close(); continue }
    const cur = await fr.evaluate(() => G.curse); if (cur !== 'k_mighty') { fail(tag, 'curse was ' + cur); await ctx.close(); continue }
    await assertPlayable(p, fr, tag); if (E.DEBUG) console.log('  .. took', Math.round((Date.now() - T0) / 1000), 's'); await ctx.close() }
  // ---------------- b) boss chapter with a clip ----------------
  if (ONLY.includes('b')) for (const [mode, W, H, where] of [['ok', 1908, 934, 'shelf'], ['hang', 1908, 934, 'shelf'], ['garbage', 1280, 800, 'alone'], ['missing', 1280, 800, 'alone']]) {
    MEDIA_MODE = mode === 'skip' ? 'ok' : mode; const tag = `b clip ${mode} ${W}x${H} ${where}`;
    const { ctx, p, fr } = await open(b, { w: W, h: H, mode: where, ls: { 'gns-campaign-crown': PROG, ccs_tour2: '1' } });
    if (!await playChapter(p, fr, 'c7', { seed: 5 })) { fail(tag, 'story never reached the board ' + JSON.stringify(await fr.evaluate(() => ({ clip: !!document.querySelector('.ccclip') })))); await ctx.close(); continue }
    if (await fr.evaluate(() => !!document.querySelector('.ccclip'))) { fail(tag, 'clip overlay left on the page'); await ctx.close(); continue }
    await assertPlayable(p, fr, tag); await ctx.close() }
  MEDIA_MODE = 'ok';
  // ---------------- c) resuming saved games ----------------
  if (ONLY.includes('c')) {
    let BASE_SAVE = null; // one real saved game (story chapter c9, Trial of Strength), mutated per case
    const mk = async mut => { if (!BASE_SAVE) { const { ctx, p, fr } = await open(b, { w: 1280, h: 800, mode: 'alone', ls: LS }); await playChapter(p, fr, 'c9', { curse: 'k_mighty', seed: 3 });
        await fr.evaluate(() => { UI.intro = false; UI.coach = -1; render() }); await p.waitForTimeout(400); BASE_SAVE = await fr.evaluate(() => { save(); return localStorage.getItem('ccs_save2') }); await ctx.close() }
      const g = JSON.parse(BASE_SAVE); const r = mut(g); return typeof r === 'string' ? r : JSON.stringify(g) };
    const me = g => g.pl.findIndex(q => q.human);
    const cases = {
      'real save as is': g => { },
      'step start, no dice, my turn': g => { g.phase = 'start'; g.dice = []; g.active = me(g) },
      'roll with no dice, my turn': g => { g.phase = 'roll'; g.dice = []; g.active = me(g); g.rolls = 0 },
      'roll with no dice, computer turn': g => { g.phase = 'roll'; g.dice = []; g.active = g.pl.findIndex(q => !q.human) },
      'step end': g => { g.phase = 'end'; g.step = 5 },
      'old shape: no tf, xq, log, revealed': g => { delete g.tf; delete g.xq; delete g.log; delete g.revealed },
      'unknown curse': g => { g.curse = 'k_gone' },
      'wrong monster': g => { g.pl[0].m = 99 },
      'no players': g => { delete g.pl },
      'empty object': () => '{}', 'garbage text': () => 'not json{{', 'array': () => '[1,2]' };
    for (const [name, mut] of Object.entries(cases)) {
      const save = await mk(mut); const { ctx, p, fr } = await open(b, { w: 1280, h: 800, mode: 'alone', ls: { ccs_tour2: '1', ccs_save2: save } }); const tag = 'c ' + name;
      await fr.evaluate(() => { AIDELAY = 100 }); if (p.errs.length) { fail(tag, p.errs[0]); await ctx.close(); continue }
      if (await fr.evaluate(() => !!document.querySelector('[data-start=load]'))) { await click(p, fr.locator('[data-start=load]')); await p.waitForTimeout(800);
        if (name === 'real save as is' || name.startsWith('roll') || name.startsWith('step') || name.startsWith('old')) await assertPlayable(p, fr, tag); else { const s = await fr.evaluate(STATE); if (s.g && !(s.human && s.phase === 'roll')) await assertPlayable(p, fr, tag); else if (s.g) await assertPlayable(p, fr, tag); else ok(tag, 'save refused') } }
      else ok(tag, 'save discarded (no Continue button)');
      await ctx.close() } }
  // ---------------- d) watchdog ----------------
  if (ONLY.includes('d')) {
    const { ctx, p, fr } = await open(b, { w: 1280, h: 800, mode: 'alone', ls: LS }); await playChapter(p, fr, 'c9', { curse: 'k_mighty', seed: 3 });
    await fr.evaluate(() => { UI.intro = false; UI.coach = -1; UI.choice = null; UI.busy = false; UI.pending = false; G.phase = 'start'; G.dice = []; G.step = 1; G.active = G.pl.findIndex(q => q.human); render() });
    await p.waitForTimeout(7500); await assertPlayable(p, fr, 'd stuck start step goes on to the roll', 20000); await ctx.close() }
  await b.close(); srv.close(); console.log(bad ? 'RESUME TEST FAILED ' + bad : 'RESUME TEST PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('RESUME TEST CRASHED', e.stack); process.exit(1) });
