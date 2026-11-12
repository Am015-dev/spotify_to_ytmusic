// R21 newcomer bench: a real new player, no AI move at all. Reads only what the screen shows (foe intents, own Block, HP):
// blocks when a hit is coming and a Block card is in hand, else attacks the weakest foe, plays other cards when it can,
// drinks a potion only when low, picks rooms / rewards / events at random, rests when hurt. Default Quick game (1 act, opening gift).
// Run: node bench-newcomer.js [runs=300] [hero=w]   DIED=1 prints where runs ended.
if (process.env.KE) global.EC_KE = JSON.parse(process.env.KE);
const EC = require('./core.js'), E = EC.E, D = EC.D; const N = +process.argv[2] || 300, HERO = process.argv[3] || 'w';
const BB = {}; let fullDeaths = 0, f1 = 0, boss = 0, beat = 0, stuck = 0; const died = {};
function hasOp(c, k) { return E.eff(c).ops.some(o => o[0] === k || (o[0] === 'roll' && JSON.stringify(o).indexOf('"' + k + '"') >= 0)); }
function pick(G, r) {
  const vm = E.validMoves(); const R = a => a[Math.floor(r() * a.length)];
  if (G.scr === 'battle') {
    const h = G.hs[G.b.cur]; let inc = 0; G.b.en.forEach((e, i) => { if (!e.dead && e.intent && e.intent.atk) inc += E.previewHit(i, G.b.cur) * (e.intent.hits || 1); });
    const plays = vm.filter(m => m.t === 'play'); const card = m => h.hand[m.c];
    if (h.hp < h.mhp * 0.4) { const p = vm.filter(m => m.t === 'pot'); if (p.length) return p[0]; }
    const def = plays.filter(m => hasOp(card(m), 'blk')); if (inc > h.blk && def.length) return def[0];
    const atk = plays.filter(m => m.e != null || hasOp(card(m), 'dmg') || hasOp(card(m), 'all'));
    if (atk.length) { let lo = 1e9, best = null; atk.forEach(m => { const e = m.e != null ? G.b.en[m.e] : null; const v = e ? e.hp + e.blk : 999; if (v < lo) { lo = v; best = m; } }); return best; }
    const other = plays.filter(m => !hasOp(card(m), 'blk')); if (other.length) return other[0];
    if (def.length && r() < 0.5) return def[0];
    return vm.find(m => m.t === 'end') || vm[0];
  }
  if (G.scr === 'reward') { const t = vm.find(m => m.t === 'takepot' || m.t === 'relic'); if (t) return t; const pk = vm.filter(m => m.t === 'pick'); if (pk.length && r() < 0.6) return R(pk); const sk = vm.find(m => m.t === 'skip'); return sk || vm.find(m => m.t === 'leave'); }
  if (G.scr === 'rest') { const h = G.hs[0]; const he = vm.find(m => m.t === 'heal'); if (h.hp < h.mhp * 0.7 && he) return he; const up = vm.filter(m => m.t === 'upg'); return up.length ? R(up) : he; }
  if (G.scr === 'shop') return vm.find(m => m.t === 'leave');
  return R(vm);
}
for (let i = 0; i < N; i++) {
  E.newGame({ heroes: [HERO], acts: 1, bless: 1, gentle: process.env.GENTLE ? 1 : 0, seed: 5000 + i }); const G = E.G(); let rs = 31 + i * 7, n = 0, reached = false, lastB = null, lastKind = '?', fullAtStart = false;
  const r = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
  while (G.scr !== 'over' && !(G.won) && n++ < 8000) {
    if (G.b && G.b.ph === 'e') { E.settle(); continue; }
    if (G.b && G.b.kind === 'b' && G.scr === 'battle') reached = true;
    if (G.b && G.b !== lastB) { lastB = G.b; lastKind = G.b.kind; fullAtStart = G.hs.every(h => h.hp >= h.mhp); }
    const m = pick(G, r); if (!m || !E.performMove(m)) { const m2 = E.validMoves()[0]; if (!m2 || !E.performMove(m2)) { stuck++; break; } }
    if (G.b && G.b.ph === 'e') E.settle();
  }
  if (reached || G.won) { const bk = G.boss; BB[bk] = BB[bk] || [0, 0, 0]; BB[bk][0]++; if (G.won) BB[bk][1]++; else if (G.b) BB[bk][2] += G.b.en.reduce((a, e) => a + (e.dead ? 0 : e.hp), 0); }
  if (G.scr === 'over' && !G.won) { const k = (G.b ? G.b.kind : lastKind) + G.floor; if (lastKind === 'm' && G.floor <= 8 && fullAtStart) fullDeaths++; died[k] = (died[k] || 0) + 1; }
  if (G.floor >= 2 || G.won) f1++; if (reached || G.won) boss++; if (G.won) beat++;
}
const pc = x => (100 * x / N).toFixed(0) + '%';
console.log(`newcomer bench (${process.env.GENTLE ? 'Gentle' : 'Tabletop'}, ${HERO}, ${N} runs, Quick 1 act): survived floor 1 ${pc(f1)} | reached boss ${pc(boss)} | beat boss ${pc(beat)}${stuck ? ' | stuck ' + stuck : ''} | regular-foe deaths from full HP, floors 1-8: ${fullDeaths}`); if (process.env.DIED) console.log('boss [reached, beaten, foe HP left on loss]:', JSON.stringify(BB)); if (process.env.DIED) console.log('ended (room kind + floor):', JSON.stringify(died));
