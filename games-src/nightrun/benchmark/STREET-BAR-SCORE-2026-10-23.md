# Street bar score, 23 Oct 2026 (W166, review)

Build: alex/brave-carson-rbpmlk at beta.171, rebuilt locally (`parts/build.py`). Measured against `STREET-BAR.md` (17 rows).
How: `qa/streetsim.js` with an extra per-step probe (`window.__dbgObs`: hit-stop, shake, telegraphs, attackers at once, Kai knockback,
boss state timeline). 4 bots x 50 seeds, once with the live camera and once with `?cam2=1`: 400 runs, 45,900 s of game time stepped
in 23 s (x1700-x2300 real time). No real-time play. P rows from `qa/cam2-test.js` (stepped, 100 s, phone), footvis, spritecut, streetsong, soundlab (run once each) and the saved screenshots in
`benchmark/street/` (not retaken). Live = without cam2 (cam2 is off by default).

## Score table

| # | Rule (gate) | Measured (live / ?cam2=1) | Result | Where it lives |
|---|---|---|---|---|
| F1 | Hit-stop 2-4 frames light, 5-8 heavy/finisher | Landed bullet hits get **0 frames** (0 of ~6,600 hits in 50 dodge runs). Hit-stop exists only for: knife slash that connects 25 ms (1.5 f), Kai hurt 40 ms (2.4 f), boss kill / phase 60 ms (3.6 f). Foe kills: 0 (only foes wider than 60 units get 30 ms, and no street foe is: heavy 46, big heavy 54). | **FAIL** | `parts/street/foot.js` `dmgE` (no call), `ftKill` line 155, `hitstop` line 96 |
| F2 | 100% of landed hits flinch + spark; knockback scales | Flash 0.08 s + `hit` pose on 100% of hits; spark (`AH.ftHit` + burst) on 100% of bullet hits. Knockback: **none** for pistol / HMG / rifle (only shotgun pellets 60, lv5 220); never scales with the hit. Heavy front hits show the flinch but deal 30% (looks like a hit, does not count). | **FAIL** (knockback) | `foot.js` bullet loop ~line 302 (`b.kb`), `street2.js` `heavyDef.onHit` |
| F3 | 0 shakes on misses | Shotgun shakes the screen on **every shot**, hit or miss: 44 whiff shakes per dodge run (2,218 / 50). Pistol misses: 0. | **FAIL** | `foot.js` `fire()` line 179 `ftShake(2)` |
| F4 | Light hit throws Kai <= 64 units | Every hurt: `P.kx` 240 u/s for 0.35 s = **84 units**, same for a knife poke and a 2-heart charge. Probe (incl. bot input) median 0-43, max 142. | **FAIL** | `foot.js` `ftHurt` line 202, applied line 222 |
| E1 | Every attack telegraphed >= 0.4 s | Rusher crouch 0.60 s (1,093/1,093), heavy + big heavy wind-up 0.80 s (100%), gunner pop 0.50 s, gunner in the open 0.52 s. **Gunner "charge" mode (alive > 14 s) fires with no telegraph**: 25 of 45 shots under 0.4 s, min 0 s (nearest bot, live). 98.5% of attacks pass. With cam2 the charge mode is rarely reached (30 shots, all >= 3.3 s). | **FAIL** (one attack) | `street2.js` `FE.gunner`, `charge` branch (`e.cd<=0` -> `env.shoot`, no `tele`) |
| E2 | <= 2 active attackers at once | No attack-slot system; it happens by density. Steps with > 2 foes winding up or attacking: nearest 1.35%, dodge 0.14% (cam2: 0.16% / 0.01%). Max 4 at once. | **FAIL** (rare) | none: would live in `streethard.js` `ST.hook.step` |
| E3 | 0 unreadable hits | Melee: 0 of 829 hits from a foe on screen < 1.2 s (streetsim gate PASS, min 1.3 s). Bullets: the untelegraphed gunner charge shots above (E1) can hit; no other hidden invulnerability (spawn `grace` is not shown, gunner hidden behind cover reads as a crouch). | **FAIL** (gunner charge shots) | `street2.js` `FE.gunner`; `foot.js` `melee` (fairstreet) |
| E4 | >= 4 foe types, each with its own counter | **3**: rusher (jump the lunge), gunner (cover / duck / kill first), heavy (hit its back or bait the charge into a wall or barrel). The boss is a bigger heavy. | **FAIL** | `street2.js` `FE.rusher/gunner/heavy` |
| B1 | 2-3 phases, each adds an attack, named | **0 phases.** `heavyDef` has no `phases`; nothing changes at any hp. The bar says `WARDEN`, but the boss is the "big heavy" (bruiser sheet), not the Warden of `footen.js`. | **FAIL** | `street2.js` `FBS.bigheavy = heavyDef(120,96,54,3000,true)` |
| B2 | 3-5 attacks, each its own answer; dodge bot >= 70% | **1 attack**: wind-up 0.80 s -> charge at 560 u/s for up to 1.1 s, 2 hearts on contact. Charges dodged: dodge bot 4.6% (live) / 0% (cam2); nearest bot (it hops) 58% / 0%. Median 2 hearts lost to the boss per fight for every bot. | **FAIL** | `street2.js` `heavyDef` ai (`wind` / `charge`) |
| B3 | >= 1 s hittable window after each attack | Stun only if the charge hits the screen edge (1.0 s) or the boss is > 15 s old (2.0 s): stun after 13/38 (34%) charges (nearest, live), 42/87 (48%) dodge. Median stun 0.9-1.0 s. Otherwise it walks again with a 1.3 s cooldown (hittable from behind). 48-55% of all boss damage lands during stun. | **FAIL** | `street2.js` `heavyDef` charge end (`wall||tired`) |
| B4 | Fight 45-90 s (dodge bot), not a sponge | **Median 7.4 s** dodge (p10 6.9, p90 7.4); 6.4 s gfirst; 14.4 s nearest (cam2: 7.4 / 6.5 / 6.4 s). Boss hp 36 (120 x 0.3 "ext boss" scale). 2 attacks per fight. Too short by 6-12x, the opposite of a sponge. | **FAIL** | `street2.js` line 78 hp 120; `foot.js` `spawn` (`ext&&boss?.3`) |
| B5 | Bigger than foes; bar + name always on screen | Bar + name drawn every frame while the boss lives (`streetlook.js` HUD). Size: 90 units vs Kai 64 (1.41x), heavy 80 (only 1.13x). Name is wrong (WARDEN). | **PASS** (weak: barely bigger than a heavy, wrong name) | `streetlook.js` line 176; `streetfeel.js` `FEEL.H` |
| P1 | footvis + spritecut pass | footvis: all PASS (Kai + every foe solid, alpha 1.00, moving). spritecut: 0 actor cuts, but **6 props/stills cut** at a cell edge (prop-beacon, prop-steam, pk-slow, sc-door, sc-neon-sign, sc-vending) and 2 loops with body jumps (prop-steam frames 1,3). | **FAIL** (props only; actors pass) | `media/anim` sheets; `streetlook.js` props |
| P2 | streetsong + soundlab pass | streetsong: all PASS (street1 from the first sample, 0 switches / stings / ducks). soundlab: all PASS (on foot only shot, hit, pick-up by default). "On beat" itself is not measured by either. | **PASS** | `street3.js` (one song), `parts/audio/soundlab.js` |
| P3 | cam2-test: Kai in right 30% < 10% | Phone 390x763: live camera **98.9%** of running steps (mean 94% from the left); `?cam2=1` **0%** (mean 34%), all 8 cam2 lines PASS. PC 1440x860 runs timed out at 200 s in this container (not measured). | **FAIL** live / **PASS** cam2 | `streetlook.js` `SL.back`; `street3.js` line 35 (cam2) |
| P4 | Actors >= 1/8 screen height on 390x763; HUD never covers the fight | Saved phone shot `5-street-20s-phone.webp`: Kai ~120 px of 763 (1/6.4). HUD panel and score sit over the sky, controls below the road; the "Push the stick right" hint sits over the sky, not the road. | **PASS** | `streetlook.js` portrait layout + HUD |

**Tally: 3 of 17 rows pass live (B5, P2, P4); 4 of 17 with ?cam2=1 (+P3). All five boss rows but B5 fail.**

## The street boss as it is now (numbers, live build)

- **Who**: `bigheavy`, the bruiser sheet drawn 90 units tall (Kai 64, normal heavy 80). Bar at the bottom labelled WARDEN, red fill.
- **Arrives**: after the street is clear (~145 s gate), walks in from the right with 1.2 s grace; up to two hearts dropped as it walks in.
  While it stands, a rusher joins every 3.5 s (max 3 rushers).
- **Health**: 36 (Normal), `heavyDef` front plate: shots from the front deal 30% (+25% under streethard = 55%); back hits and hits during stun deal 100%.
- **Phases**: none.
- **Attacks**: one. Loop: walk at 70 u/s (x0.7 street3) until 140 units away for 1.3 s cooldown (median walk 1.3 s) -> **wind-up 0.80 s** (crouch pose,
  red flash) -> **charge 560 u/s, up to 1.1 s**, 2 hearts on contact, breaks every prop it touches, sets off barrels.
- **Openings**: stun 1.0 s if the charge ends at the screen edge, 2.0 s once the boss is 15 s old (`OPEN` label); otherwise none beyond its back.
  Half the damage it takes (48-55%) is dealt in stun.
- **Length**: 2 charges and 7.4 s median for the dodge bot (6.4-14.4 s across bots, live and cam2 alike). The fight ends before a player has read it.
- **Counter**: jump over the charge or dash through it; no bot uses the jump on purpose, so the dodge rate (0-58%) is the bots' weakness as much
  as the boss's, but nothing on screen says "jump" either.

Compared with the benchmark boss (2-3 named phases, 3-5 attacks with their own answers, 45-90 s, clear punish windows), the street boss
meets one of five rows (B5) and that one only half.

## Player-equivalent score: **13/100** (live), 15/100 with ?cam2=1

Anchor: the players' 10-12 and the last street review (REVIEW-STREET-2026-10-23.md, 14/100). Moves only on measured evidence.

| Category | Score | Evidence |
|---|---|---|
| Fun | 11 | Street fights are fine-grained (rusher 0.6 s crouch, gunner calls help), but the climax is a 7 s, one-attack fight that ends before it starts. Hits have no weight: 0 hit-stop frames on 6,600 landed shots. |
| Strategy | 12 | Kill order still pays (gunner-first clears 70% vs nearest 18%). The boss asks no question: 2 charges, done. |
| Fairness | 9 live / 15 cam2 | Live: Kai in the right 30% of the view 98.9% of the time, gunner shots 257 of 532 hearts for the casual bot. cam2: the casual bot clears 70% (was 18%), gunner hits drop 257 -> 60. Untelegraphed gunner charge shots remain. |
| Tension curve | 16 | Threat peak 82-89% of the run; then the boss deflates it (7 s). |
| Looks | 18 | Painted street, solid sprites (screenshots unchanged). Boss is barely bigger than a heavy and wears another boss's name. |
| Sound | 12 | One song; no hit sound weight check in this round. |
| Clarity | 12 | Telegraphs read (>= 0.5 s on 98.5% of attacks). No phase names, no "jump" cue for the charge, shotgun shakes on misses. |
| **Headline (player-equivalent)** | **13/100** live, **15/100** with ?cam2=1 | Down 1 from 14: this round measured the boss and hit feel for the first time, and both are far below the bar. |

## The 5 biggest gaps, as worker tasks (one deliverable each, ~30 min, flag off by default)

1. **W167 BOSS PHASES (Opus, design)**: rows B1 + B2. New part `parts/street/streetboss.js` (flag `?sboss=1`, appended with
   `PARTS_EXTRA.append`) wrapping `FBS.bigheavy.ai` from `street2.js` `heavyDef`. Three phases at 100/66/33% hp, each named on screen
   ("PHASE 2: GROUND POUND"), each adding one attack with its own answer and an existing pose: charge (jump), ground-pound shockwave along
   the road (jump), thrown barrel / debris arc (step back or cover), leaping slam on Kai's spot (dash). Rename the bar label from WARDEN
   (streetlook.js line 176 reads it; pass the name through `e.def.name`). Gate: streetsim `ONLY` + a new boss probe: 3 phase notes seen
   in 100% of fights that reach 33%, >= 3 distinct attacks per fight, every attack dodged >= 70% by a bot that jumps / dashes on its
   telegraph. Load `fun-game-design` first (rule 14). No new art.
2. **W168 BOSS OPENINGS + LENGTH (Sonnet, tuning to a gate)**: rows B3 + B4, after W167 (or on today's charge if W167 slips). In
   `streetboss.js`: after every attack the boss recovers >= 1.0 s (stun / pant pose, `OPEN` label), not only on a wall hit; set boss hp
   so the dodge bot's median fight is 45-90 s and the nearest bot's is <= 120 s. Also add boss columns to `qa/streetsim.js` (fight
   length, attacks per fight, dodged %, window after each attack). Gate: streetsim dodge median 45-90 s, >= 1 s window after 100% of
   attacks, clear rates still inside streetsim's own gates.
3. **W169 HIT FEEL (Sonnet)**: rows F1 + F2 + F3 + F4. In `streetfeel.js` (owner of feel, flag `?hitfeel=1`): wrap `IN.dmgE` / the bullet
   hit so every landed hit calls `hitstop` 2-4 frames (33-67 ms; heavy weapons and kills 5-8 frames, 83-133 ms), give every bullet a
   knockback scaled by its damage (not on bosses), drop the shotgun fire shake (`foot.js` `fire` line 179) so shakes come only from
   hits / kills / hurts, and cut Kai's hurt knockback to <= 64 units (`ftHurt` `P.kx` 240 -> <= 180 u/s for 0.35 s). Gate: the W166 probe
   (`__dbgObs` hit-stop / shake / knockback counters, script in this file's "How") shows 100% landed hits with 2-4 frames, 0 whiff shakes,
   Kai knockback <= 64; streetsim clear rates within +-5 points.
4. **W170 GUNNER TELEGRAPH + ATTACK SLOTS (Sonnet)**: rows E1 + E2 + E3. `street2.js` `FE.gunner` `charge` branch: 0.5 s `tele` (shoot pose +
   red flash) before every shot; `streethard.js` `ST.hook.step`: at most 2 foes in a wind-up or attack at once (others hold their
   `crouch` / `wind` / `pop` start until a slot frees). Gate: probe shows 100% of attacks with >= 0.4 s telegraph and 0 steps with > 2
   attackers over 50 runs x 3 bots; streetsim gates unchanged.
5. **W171 FOURTH FOE (Opus, design)**: row E4. One new foe in `street2.js` style (`wrap(...)`, existing sheet only: `FA.WHO` has `shield` and
   `sniper` already, ASSET-POLICY.md) whose answer no other foe asks for: a shield foe that blocks all front shots and must be jumped
   over / hit in the back, or a sniper with a 1.0 s laser line that must be broken by cover. Place it in 2 of the 12 waves (street3 plan).
   Gate: >= 4 types in streetsim's hearts-by-source; the new foe's time to kill differs from the others' by >= 30% between a bot that
   uses its counter and one that does not. Load `fun-game-design` first.

Not a task here: turning `?cam2=1` on by default (P3) is the orchestrator's call; this round shows it helps fairness (casual bot 18% -> 70%
clears) and also makes the street easy for the best bot (dodge 84% -> 100%, above streetsim's 60-80% gate).

## Appendix: the probe (reuse it as the gate for W168-W170)

Save as `dbg.js`, then `DBG=$PWD/dbg.js GATE=0 RT=0 node games-src/nightrun/qa/streetsim.js` and read `r.dbg` per run
(the W166 copy of streetsim also wrote every run's `{bot, seed, clear, tEnd, dbg}` to a JSON file after `suiteSecs`).
Hit-stop values print as the value after one 1/60 s step: 8 = slash 25 ms, 23 = hurt 40 ms, 43 = boss 60 ms.

```js
// W166 probe: per-step telemetry hooked via window.__dbgObs (streetsim calls it before each step)
(() => {
  let L = null, lastS = null;
  const ATT = { rusher: ['crouch', 'lunge'], heavy: ['wind', 'charge'], bigheavy: ['wind', 'charge'], gunner: ['pop'] };
  window.__dbgObs = (S) => {
    if (S !== lastS) { lastS = S; L = window.__dbgLog = { hs: [], shakes: [], hitsN: 0, hitsFlinch: 0, hitsSpark: 0, hitsKb: 0, att: [0, 0, 0, 0, 0, 0, 0], attMax: 0, tele: [], unread: [], kb: [], boss: null, sz: null, prev: {} }; }
    const P = S.P, t = S.time, pv = L.prev;
    // F1 hit-stop: a new S.hs above last step's
    if (S.hs > (pv.hs || 0) + 1e-4) L.hs.push([+(S.hs * 1000).toFixed(0), +t.toFixed(2)]);
    // F2: landed hits = enemy flash just set to .08
    const fxN = S.fx.length;
    for (const e of S.E) { const f = e.flash || 0; if (f > .079 && (e._pf || 0) < .079 && !e.dead) { L.hitsN++; e._hitT = t; e._hitVx = e.vx; e._fx0 = pv.fxN; } e._pf = f; }
    // F3 shake: new shake value; was it a hit/kill/hurt this or last step?
    if (S.shake > (pv.shake || 0) + .01) L.shakes.push([+S.shake.toFixed(1), S.hurts !== pv.hurts || S.kills !== pv.kills ? 'hurt/kill' : S.E.some(e => e._hitT >= t - 2 / 60) ? 'hit' : 'other', S.P.w]);
    // F4 player knockback: displacement over the hurt
    if (S.hurts > (pv.hurts || 0)) L.kb.push({ x0: P.x, t0: t, src: (S.hlog || [])[S.hurts - 1] });
    for (const k of L.kb) if (k.d == null && t - k.t0 > .6) k.d = +Math.abs(P.x - k.x0).toFixed(0);
    // E1/E2: telegraph lengths and simultaneous attackers
    let n = 0;
    for (const e of S.E) { if (e.dead) continue; const a = ATT[e.id]; if (!a) continue; const st = e.state;
      const tel = (e.tele || 0) > 0 || st === a[0];
      if (tel) { if (e._tS == null) e._tS = t; } 
      const act = a.includes(st) || (e.tele || 0) > 0; if (act) n++;
      if (e._ps !== st) { // attack start
        if ((e.id === 'rusher' && st === 'lunge') || (e.heavy && st === 'charge')) { const d = e._tS == null ? 0 : t - e._tS; L.tele.push([e.id, st, +d.toFixed(2)]); e._lastTele = d; }
        if (!tel && st !== 'lunge' && st !== 'charge') e._tS = null;
        e._ps = st; }
      if (!tel && !(e.id === 'rusher' && st === 'lunge') && !(e.heavy && st === 'charge')) e._tS = null;
    }
    // gunner shots: tele running before each new bullet (charge mode has none)
    for (const b of S.eb) if (!b._seen) { b._seen = 1; let g = null; for (const e of S.E) if (!e.dead && e.id === b.src && (!g || Math.abs(e.x - b.x) < Math.abs(g.x - b.x))) g = e;
      if (g && g.id === 'gunner') { const d = g._gT0 == null ? 0 : t - g._gT0; L.tele.push(['gunner', g.state === 'charge' ? 'charge-shot' : g.state === 'pop' ? 'pop-shot' : 'open-shot', +d.toFixed(2)]); } }
    for (const e of S.E) if (e.id === 'gunner') { if ((e.tele || 0) > 0 || e.state === 'pop') { if (e._gT0 == null) e._gT0 = t; } else if (!S.eb.some(b => b.src === 'gunner' && b.life > 0 && t - (b._t || 0) < .05)) e._gT0 = null; }
    L.att[Math.min(6, n)]++; L.attMax = Math.max(L.attMax, n);
    // boss timeline
    const B = S.boss;
    if (B && !L.boss) L.boss = { on: +t.toFixed(2), hp0: B.hp, h: B.h, w: B.w, seq: [], hits: 0, hurtsBy: 0, dodged: 0, charges: 0, dmgBy: {}, windows: [], end: null, cur: null, adds: 0 };
    if (B && L.boss) { const Bo = L.boss;
      if (B.state !== Bo.cur) { if (Bo.cur) Bo.seq.push([Bo.cur, +(t - Bo.curT).toFixed(2)]); 
        if (Bo.cur === 'charge') { Bo.charges++; if (S.hurts === Bo.h0) Bo.dodged++; }
        if (B.state === 'charge') Bo.h0 = S.hurts;
        Bo.cur = B.state; Bo.curT = t; }
      if (B.hp < (pv.bhp == null ? B.hp : pv.bhp) - 1e-6) { const k = B.state; Bo.dmgBy[k] = +((Bo.dmgBy[k] || 0) + (pv.bhp - B.hp)).toFixed(2); }
      if (S.hurts > (pv.hurts || 0) && /bigheavy/.test((S.hlog || [])[S.hurts - 1] || '')) Bo.hurtsBy++;
      if (B.dead && Bo.end == null) Bo.end = +t.toFixed(2);
      pv.bhp = B.hp; }
    if (!L.sz) { const k = S.E.find(e => e.id === 'rusher'); if (k) L.sz = { kai: P.h, rusher: k.h }; }
    pv.hs = S.hs; pv.shake = S.shake; pv.hurts = S.hurts; pv.kills = S.kills; pv.fxN = fxN;
  };
})();
```
