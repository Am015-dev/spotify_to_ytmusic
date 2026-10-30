// W263 STREET REAL-TIME: one full street stage (zeil) in the REAL loop (rAF, wall clock, real key events), phone 390x763 and PC 1440x860.
// Three players: idle (must lose), button masher (must not trivially win), skilled (gunner first, lines up in depth, jumps and sidesteps on telegraphs; must be able to win, 2 tries).
// Real time on purpose (owner, 29 Oct: "prove the tuned fight is still playable through real input"); it is the only street test that waits on the wall clock, ~3 min.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/street-rt-test.js      env: GAME_DIR=<dir>  ONLY=phone|pc  CAP=170 (s per run)
// KNOWN (W263): the skilled bot died in 2/2 tries on both screens, so its "can clear" line FAILS; it is a crude bot, not proof the fight is unwinnable.
// Phone note: the phone page is a touch device at 390x763 but the keys are pressed on a keyboard; the on-screen pad is not driven (it needs held touches).
const L = require('./lib.js'), { boot, open, ok, done, sleep } = L;
const CAP = +process.env.CAP || 170;
const st = p => p.evaluate(() => { const S = FOOT.S; return S ? { t: +S.time.toFixed(1), hp: S.P.hp, end: S.end ? { c: !!S.end.cleared } : null, hurts: S.hurts | 0, kills: S.kills | 0 } : null; });
const start = p => p.evaluate(() => { RET.tale = false; FOOT.ui = 1; FOOT.start('zeil'); });
const KEYS = { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', fire: 'KeyJ', jump: 'KeyK', melee: 'KeyL', dash: 'ShiftLeft', bomb: 'KeyG' };
async function player(p, kind) {
  const down = new Set(), set = async (k, on) => { if (on && !down.has(k)) { down.add(k); await p.keyboard.down(KEYS[k]); } else if (!on && down.has(k)) { down.delete(k); await p.keyboard.up(KEYS[k]); } };
  const w0 = Date.now(); let s = await st(p), n = 0;
  while (s && !s.end && (Date.now() - w0) / 1000 < CAP) {
    if (kind === 'masher') {   // random keys, 8 presses a second: what a player who just hammers every button does
      const ks = Object.keys(KEYS); for (const k of ks) await set(k, Math.random() < (k === 'fire' ? .7 : .35));
    } else if (kind === 'skilled') {
      const c = await p.evaluate(() => {
        const S = FOOT.S, P = S.P, live = S.E.filter(e => !e.dead && !e.boss && e.seen), I = {};
        const ga = live.find(e => e.id === 'gunner'), near = live.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0], tg = ga && !ga.hid ? ga : near;
        if (!tg) { const pk = S.pk.find(q => Math.abs(q.x - P.x) < 300); I.r = pk ? pk.x > P.x : 1; I.l = pk ? pk.x < P.x : 0; return I; }
        const dx = tg.x - P.x; P.facing = dx > 0 ? 1 : -1;
        I.r = dx > 190; I.l = dx < -190; if (Math.abs(dx) < 110) { I.l = dx > 0; I.r = dx < 0; }   // keep a gun's distance
        I.fire = 1;
        if (P.z != null) { const tz = tg.z != null ? tg.z : P.z; I.d = tz > P.z + .05; I.u = tz < P.z - .05; }
        // a foe that telegraphs a hit at Kai's depth: step out of its lane, or jump the lunge
        const th = live.find(e => e.z != null && Math.abs(e.z - P.z) < .2 && Math.abs(e.x - P.x) < 330 && (e.tele > 0 || /crouch|wind|lunge|charge|pop/.test(e.state || '')));
        if (th) { const up = th.z > .5; I.u = up ? 0 : 1; I.d = up ? 1 : 0; if (P.onGround && Math.abs(th.x - P.x) < 220 && /lunge|charge/.test(th.state || '')) I.jump = 1; }
        for (const b of S.eb) { const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .35 && !b.vy && Math.abs((b.z == null ? P.z : b.z) - P.z) < .2 && P.onGround) I.d = 1, I.u = 0; }
        return I;
      });
      for (const k of Object.keys(KEYS)) await set(k, !!c[k]);
    }
    await sleep(kind === 'masher' ? 120 : 45); s = await st(p); n++;
  }
  for (const k of [...down]) await set(k, false);
  return { ...s, wall: +((Date.now() - w0) / 1000).toFixed(1) };
}
async function run(b, name, W, H, touch) {
  const T = `${name} ${W}x${H} `;
  for (const kind of ['idle', 'masher', 'skilled']) {
    let r, tries = 0;
    do {
      const p = await open(b.br, b.base, W, H, '?nomusic=1', null, touch); await start(p); await p.waitForFunction(() => FOOT.S && FOOT.S.time > 0, null, { timeout: 15000 }).catch(() => { }); await sleep(300);
      const a = await st(p); await sleep(1500); const a2 = await st(p);
      if (tries === 0) ok(T + 'real loop is running (game clock follows the wall clock)', a2 && a && a2.t - a.t > .8 && a2.t - a.t < 2.4, JSON.stringify([a, a2]));
      r = await player(p, kind); tries++;
      ok(T + `${kind} try ${tries}: ${r.end ? (r.end.c ? 'CLEARED' : 'DIED') : 'cap'} at ${r.t} s game, ${r.wall} s wall, hearts left ${r.hp}, hurts ${r.hurts}, kills ${r.kills}, page errors ${p.errs.length}`, p.errs.length === 0, p.errs.join('|'));
      await p.context().close();
    } while (kind === 'skilled' && tries < 2 && !(r.end && r.end.c));
    if (kind === 'idle') ok(T + 'idle player loses', r.end && !r.end.c, JSON.stringify(r));
    if (kind === 'masher') ok(T + 'button masher does not clear the street', !(r.end && r.end.c), JSON.stringify(r));
    if (kind === 'skilled') ok(T + 'skilled player (depth, jump, gunner first) can clear the street', r.end && r.end.c, JSON.stringify(r));
  }
}
(async () => {
  const b = await boot(); const only = process.env.ONLY;
  await Promise.all([!only || only === 'pc' ? run(b, 'pc', 1440, 860, false) : null, !only || only === 'phone' ? run(b, 'phone', 390, 763, true) : null]);
  await b.close(); done('street-rt-test');
})();
