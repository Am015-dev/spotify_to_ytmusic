# W277 phone street boss (branch nr/W277-phone-boss from nr/W276-phone-street). 30 Oct 2026. STATUS: boss framing FIXED; boss fight still NOT winnable by bots (phone AND PC).
Shots, results.json, logs (not committed): `/tmp/claude-0/-home-user-spotify-to-ytmusic/3a961b53-7011-52db-87ba-4f45fcd0a13b/scratchpad/w277/` (bphone-before, bphone-after, bphone-after2, bpc-after, after-phone = full stage tactician).
## 1. The frozen boss (W276 ?bossframe=1): root cause
State trace (boss ai wrapped, every tick from spawn): frame 1 ok (state 'in'), frame 2 throws `TypeError: Cannot set property G of #<Object> which has only a getter`.
foot.js:134 builds env with `get G()`; W276's streetboss.js `inset()` did `o=Object.create(env); o.G=...` and a getter-only inherited property cannot be assigned
in strict code, so the boss ai threw on every tick after spawn (the engine swallows it) = boss frozen at its spawn x, no wind-up.
## 2. Fix (one owner): figure half-width in street2.js heavyDef
- street2.js: `FW=58` (the drawn big heavy figure is +-55 px, W276) set as `e.fw` on the boss; `half(e)=e.fw||e.w/2` used by `walk()` and the charge wall test; a step back
  toward the road is always allowed. streetboss.js: the leap lands at Kai's x clamped by the same half-width; the broken `inset()`/`RET.bossframe` flag is DELETED.
- foot.js:311 (engine screen clamp of seen foes and bosses) uses `e.fw||e.w/2` too, so a camera move cannot push the figure out (seen in the first after run, 89%).
- Hitbox (e.w=54), hp, attacks, timings: unchanged. Non-boss foes: no fw, identical code path.
- Trace after: walk -> wind (0.8 s) -> charge -> stun/open -> walk -> sb_throwW -> throw -> open: the boss walks, winds up, charges, recovers.
## 3. Figure in view (BOSSVIS, figure +-55 px vs view, boss fight isolated with JUMP=152, TS 4, 8 seeds, real touch/keys)
| run | frames >= 95% in view | min | wind-up frames >= 95% |
|---|---|---|---|
| phone 390x763 before (W276 build), dodger / tactician | 49% / 60% | 0.75 | 66% / 74% |
| phone after (heavyDef fw only), dodger / tactician | 83% / 78% | 0.75 | 85% / 80% |
| phone after + engine clamp (final), dodger | **100%** | **1.00** | **100%** |
| PC 1440x860 after (fw only), dodger | 100% | 1.00 | 100% |
NOT run: landscape 844x390 (harness has PLAT=land now, no time), PC with the final build (the clamp change only narrows the range, PC was already 100%).
## 4. Clear rate (boss fight isolated: JUMP=152 sets the clock, Kai at the arena with full hearts; not a full-stage run)
- phone before: dodger 0/8 (boss hp left 241-283 of 288), tactician 0/8 (190-287). phone after: dodger 0/8 (232-265), tactician 0/8 (239-285). final: dodger 0/8 (236-278).
- PC after: dodger 0/8 (182-269). So the phone is NOT far below PC here: the boss fight beats both bots.
- Full stage, phone tactician, after: 0/8, died t=79-108 s on the street, never reached the boss.
## 5. Phone-specific cause, measured (no fix shipped, no flag added)
(a) reaction window: Kai-boss distance at each charge wind-up start: phone median 35-46 px (max 173), PC median 87 (max 524). Window = 0.8 s + (d-40)/560 s:
    phone about 0.80 s, PC about 0.89 s median (PC max 1.6 s). Real but small. Of 32 phone wind-ups only 9 were followed by a lost heart within 2.5 s.
(b) touch latency: not measured in ms. Code: buttons/stick act on pointerdown (foot.js:422-426) and set the same input state as keydown; read on the next fixed step.
(c) layout: the harness audit (>= 44 px, no overlap, on screen, labels fit) passed on every phone run.
(d) auto-fire: on by default on touch (foot.js:447), off on PC; both bots fire only facing the boss, whose front absorbs 70% (heavyDef onHit), so equal for bots.
**Measured cause of the deaths: street foes during the boss fight.** Hearts lost over the 8 final phone runs: rusher melee 36, heavy melee 10, gunner shots 7,
boss 4 (2 melee, 2 barrel). 53 of 57 were NOT the boss. The PC death shot shows the same: 3 gunners stacked at one spot shoot Kai while the boss walks.
So a wider camera / longer wind-up would not change the result; the lever is the foes that keep joining in the boss arena (street3.js waves after T.boss, cap 5).
## 6. Shots looked at
phone boss start (after): figure fully in view, but the GUARD tip line and OVERDRIVE label overlap the BIG HEAVY name bar; 3 foes stand inside the boss figure.
PC death: boss fully in view; 3 green gunners drawn on the same spot (stack, looks like one blob); Kai down by gunner fire. NOT taken: wind-up / charge shots,
landscape shots, a full-stage real-input run to the boss and the parry check (step 4): not done (time).
## Next step (one task, sonnet): count foes alive per second in the boss arena (street3.js) and cap adds at 1-2 while bossOn behind a flag, then re-run
phone + PC dodger/tactician 8 seeds with JUMP=152 and full stage; target >= 30% boss clears; streetsim RUNS=40 x3 gates.
## Gates (streetsim RUNS=40 x3 blocks, SEED0 4321/9001/17003, final build)
gfirst 83/80/83% (75+-8 ok), dodge 68/68/65% (65+-8 ok), idle 0/40 (ok), nearest 43/38/38% (block 1 over 40, W263 known 40.8), stand-still median 19.6 s (>= 17.8 ok).
Also FAIL in these blocks: threat peak 48-51% (gate 82-88) and "cover prevents >= 3 hits" (0.3). Baseline blocks were NOT re-run, so it is not shown whether those two
were already failing before W277 (the change only touches the big heavy boss and the screen clamp of seen foes, which is identical for foes without fw).
