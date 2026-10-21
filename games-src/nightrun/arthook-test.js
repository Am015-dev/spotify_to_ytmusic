#!/usr/bin/env node
// Art hooks (W84): each hooked picture id draws when it is listed in media/ready.json and the code shape otherwise; no page errors.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/arthook-test.js          (prints pass/fail lines only)
// Two pages, same scenes: LISTED (ready.json gets every hooked id; the placeholder files in media/ decode) and UNLISTED (ready.json as shipped).
// A spy on ART.img logs every id the game asked for AND got; the scenes are rendered with __mnr.render.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const RULES = 'bounce bumper cash cover echo gate gold hulls hunter lane pads pocket portal tide well'.split(' ');
const FORGE = 'h-bassswell h-blackshell h-choirbomb h-clustershell h-edgearc h-firefield h-gravmines h-halocoil h-heatwave h-hivemind h-horizon h-huntermines h-iceneedle h-minelance h-prismdisc h-pulselance h-railric h-ringshell h-seedfan h-shardring h-snowburst h-squalldisc h-thunderhead h-voltrail k-burn k-decoy k-magnet k-phase k-ram'.split(' ');
const RX = 'bait feint hunt press retreat window'.split(' '), EV = 'ambush convoy rest rush duel'.split(' ');
const HOOK = ['ac-flanker', 'ac-fire-gap', 'fx-w34-ac-fire', 'fx-w34-ac-line', 'fx-w34-strike-col', 'fx-w34-gk-medlink', 'ui-dash-icon', 'ui-emp-icon', 'fx-w34-ui-ring-ready', 'fx-w34-ui-ring-empty',
  ...RX.map(s => 'rx-' + s), ...RULES.map(s => 'rule-' + s + '-icon'), ...FORGE.map(s => 'fg-' + s), ...EV.map(s => 'nv-ev-' + s)];
let fails = 0, perr = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const SCENES = () => {   // runs in the page: returns { scene: [ids the spy saw] }
  const m = window.__mnr, ART = m.ART, out = {}, seen = new Set();
  const img = ART.img; ART.img = id => { const r = img.call(ART, id); if (r) seen.add(id); return r; };
  const scene = (name, f) => { seen.clear(); try { f(); m.render(m.G.t, 1 / 60); m.render(m.G.t + .01, 1 / 60); } catch (e) { out[name + '!err'] = [e.message]; } out[name] = [...seen]; };
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(3); m.simOn(true); m.god = true;
  for (let i = 0; i < 200 && m.running; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); }
  const G = m.G, P = m.P; G.dead = false; P.hp = 99;
  scene('strike', () => { MM.col = { x: 400, t: .3, tl: 1.2, fire: 0, hit: 0, dmg: 0, w: 24 }; });
  scene('strike-fire', () => { MM.col = { x: 400, t: 0, tl: 1.2, fire: .2, hit: 1, dmg: 0, w: 24 }; });
  MM.col = null;
  scene('ac', () => { AC.tells = [{ k: 'rear', t: .5, x: 200, y: 200, n: 1 }, { k: 'dive', t: .5, x: 200, y: 200, n: 1 }, { k: 'sweep', t: .5, x: 200, y: 200, n: 1, gy: 270 }]; });
  AC.tells = [];
  scene('flanker', () => { const e = RX_.spawn('drone', { x: 500, y: 250 }); e.fk = 'diver'; e.r = 16; e.hull = 1; });
  scene('medlink', () => { const a = RX_.spawn('drone', { x: 600, y: 200 }), b = RX_.spawn('drone', { x: 650, y: 260 }); a.gk = 'med'; b.hp = Math.max(1, b.max * .4); b.flash = 0; });
  for (const e of G.en.slice()) { e.dead = true; e.hp = 0; }
  for (const st of ['bait', 'feint', 'hunt', 'press', 'retreat', 'window']) scene('rx-' + st, () => {
    const e = RX_.spawn('drone', { x: 600, y: 270 }); e.rx = e.rx || { st: 'hunt', c: 1, tl: 0, vw: -9 }; const r = e.rx; r.vw = -9; e.rxA = 0;
    if (st === 'window') { e.rxA = 1; r.vw = G.t; r.ts = 'hunt'; r.tt = G.t - 5; } else { r.st = st; r.ts = null; } });
  for (const e of G.en.slice()) { e.dead = true; e.hp = 0; }
  for (const id of ['well', 'bounce', 'echo', 'hulls', 'lane']) scene('rule-' + id, () => { HINT.reset(); HINT.clk = 0; G.banner.t = 0; HINT.show('NEW: test card · ' + id, { t: 3, ic: ART.img('rule-' + id + '-icon') ? 'rule-' + id + '-icon' : (['bounce', 'echo', 'hulls'].includes(id) ? 'rule-' + id : null) }); HINT.tick(.6); });
  HINT.reset();
  for (const k of ['ambush', 'convoy', 'rest', 'rush', 'duel']) scene('ev-' + k, () => { G.banner = { t: 1.4, m: 1.8, a: 'EVENT', b: 'test', warn: 0, ev: 'nv-ev-' + k }; });
  G.banner = { t: 0, m: 1, a: '', b: '', warn: 0 };
  scene('forge', () => { const cv = document.createElement('canvas'); cv.width = cv.height = 44; for (const id of ['h:halocoil', 'h:voltrail', 'k:ram', 'k:burn']) FG.icon(cv.getContext('2d'), id, 44); });
  out.dom = (() => { try { ART.uiDone = 0; ART.uiIcons(); } catch (e) { } const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('');
    ABIL.rings(); const d = document.getElementById('bDash'), e = document.getElementById('bEmp');
    return { icons: /url\(media\/ui-dash-icon\.webp\)/.test(css) && /url\(media\/ui-emp-icon\.webp\)/.test(css), ring: /\.rgR::after\{[^}]*fx-w34-ui-ring-ready/.test(css) && /\.rgE::after\{[^}]*fx-w34-ui-ring-empty/.test(css), cls: !!(d && e && (d.classList.contains('rgR') || d.classList.contains('rgE'))) }; })();
  out.shipN = ['drift', 'lancer', 'nova'].every(s => ART.shipN.includes(s));
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch();
  const run = async listed => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on('pageerror', e => { perr++; console.log('FAIL page error ' + e.message); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.route('**/media/ready.json', async r => { const a = await (await r.fetch()).json(); if (listed) for (const id of HOOK) if (!a.includes(id + '.webp')) a.push(id + '.webp'); r.fulfill({ contentType: 'application/json', body: JSON.stringify(a) }); });
    if (listed) await p.route(/media\/nv-ev-[a-z]+\.webp/, r => r.fulfill({ contentType: 'image/webp', body: require('fs').readFileSync(path.join(GAME, 'media/rx-bait.webp')) }));   // the five event banners are not painted yet: a stand-in picture
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`);
    await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
    if (listed) await p.waitForFunction(ids => ids.every(id => __mnr.ART.bm[id]), HOOK, { timeout: 30000 }).catch(() => { });
    const o = await p.evaluate(`(${SCENES.toString().replace(/RX_/g, 'RX')})()`); await ctx.close(); return o;
  };
  const L = await run(true), U = await run(false);
  const has = (o, s, id) => (o[s] || []).includes(id), none = (o, s) => !(o[s] || []).length;
  for (const k of Object.keys(L).concat(Object.keys(U))) if (k.endsWith('!err')) line(false, 'scene error ' + k + ' ' + (L[k] || U[k])[0]);
  const chk = (s, ids) => { for (const id of [].concat(ids)) { line(has(L, s, id), `${s}: ${id} draws when listed`); line(!has(U, s, id), `${s}: ${id} not drawn when unlisted (shape)`); } };
  chk('strike', 'fx-w34-strike-col'); chk('strike-fire', 'fx-w34-strike-col');
  chk('ac', ['fx-w34-ac-line', 'fx-w34-ac-fire', 'ac-fire-gap']); chk('flanker', 'ac-flanker'); chk('medlink', 'fx-w34-gk-medlink');
  for (const s of RX) chk('rx-' + s, 'rx-' + s);
  chk('rule-well', 'rule-well-icon'); chk('rule-lane', 'rule-lane-icon');
  for (const id of ['bounce', 'echo', 'hulls']) { line(has(U, 'rule-' + id, 'rule-' + id) === false, `rule-${id}: still is not asked for while unlisted`); line(has(L, 'rule-' + id, 'rule-' + id + '-icon'), `rule-${id}: icon draws when listed`); }
  for (const k of ['ambush', 'convoy', 'rest', 'rush', 'duel']) chk('ev-' + k, 'nv-ev-' + k);
  chk('forge', ['fg-h-halocoil', 'fg-h-voltrail', 'fg-k-ram', 'fg-k-burn']);
  line(L.dom.icons && L.dom.ring && L.dom.cls, 'DOM: dash/emp icons + ready/empty rings are injected and the ring class set when listed ' + JSON.stringify(L.dom));
  line(!U.dom.icons && !U.dom.ring, 'DOM: nothing injected when unlisted ' + JSON.stringify(U.dom));
  line(L.shipN && U.shipN, 'ART.shipN lists drift, lancer, nova');
  line(perr === 0, 'no page errors');
  srv.kill(); await br.close(); console.log(fails ? `FAILED ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
