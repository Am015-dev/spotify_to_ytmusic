# LIFE: streets that move and react (life-1, 2026-10-14)

Alex: "Lively worlds are still very boring and repetitive." The v88n LV pass added life *near the player* (crowds ahead, pigeons, flags,
blimp, boats) and art-2 filled empty grass (LF). Both are mostly static or appear only in front of the car. In LEGO 2K Drive
(docs/research/LIVELY_2K.md: L1 wind turbines in Big Butte key art, L4 smashables everywhere, L5 "rarely drive more than a few seconds
before finding something interesting", L8 ambient drop-in activities) the street itself is busy: things turn, people do things, and
everything you hit bursts into bricks.

## What LIFE adds (src/98lx_life.js, flag `LIFE.on`, `?life=0` = off)
Placed from the street graph, every 16 m on both sides of every non-motorway street, owned by 40 m cells (hash per cell, the same every
session). Each cell cycles a fixed role pattern `SMGSMSMGSM`: 4 smashable groups, 4 moving set pieces, 2 people groups per 10 slots.
Built lazily around the player (≤ 3 ms of new cells per fill), drawn from fixed instanced pools within 230 m.

| kind | types (one draw call each, only while used) | motion |
|---|---|---|
| set pieces (move) | windmill, wind turbine, fountain, banner, rotating 3-sided billboard, crane, balloon cart, carousel | rotors, bobbing water, swinging cloth/jib, spin |
| landmark | Frankfurt: 23 m Ferris wheel on the Main bank · Athens: 17 m carousel in Pedion tou Areos | turns |
| people groups | café table, street band, market stall, kids' football, joggers, dog walker, fans waving at you, road works | per type (chat, play, run, hammer, wave) |
| smashables | cone, crate, barrel, fruit stand, planter, bin (3 per group, mixed) | burst into bricks + studs (debris, studBurst, HUB.smashed, combo) |
| pop-up bubbles | SMASH 20 / DRIFT HERE / AIR TIME, one per 100 m square, in the lane | drive through → RO.pop challenge (existing HUD) |

Reactions: people within 7 m of a moving car jump aside (a direct hit sends them flying, harmless, 2K style); within 45 m they cheer
(arms up, hop) while you are airborne or drifting; fans wave when you pass. Pigeons scatter (LV, unchanged).
Minifigs are 1.80 m like every humanoid (rv-human). Set pieces and the landmark are solid (soft push, like AD dress items).

## Placement rules (coordinator 2026-10-14)
- Nothing in a driving lane: every item keeps the carriageway + 1 m clear (`LIFE_free`, LV_onRoad margin ≥ 1 m); the audit counts items in lanes (must be 0).
  Only the pop-up bubbles float over the lane, on purpose (you drive through them).
- Smashables 10-40 per 100 m window: every kerb spot that fits is a candidate; each is kept with p = min(1, LIFE_SMT / candidates in the
  5×5 cells around) (LIFE_SMT Frankfurt 18, Athens 15 groups of 2), so dense grids are thinned and sparse streets keep all. Smashables go first,
  then set pieces and people (moving : groups ≈ 5 : 3) in the room left; Frankfurt slots every 12 m, Athens 8 m.

## Reused, not reinvented
- Street graph and road mask: `LV_eGrid`, `LV_onRoad` (98l_lively), building colliders `roamHit`, heights `groundY` (terr-1: the ground surface, no bridge decks).
- Smash pipeline: `debris` + `studBurst` + `HUB.smashed` + `comboAdd` + `AU.sfx('brick')`, exactly as AD dress / city props; pop-ups start the existing `RO.pop` challenge (POPS HUD, timer, reward).
- Materials and pools: `LV_mat`, `colorize`, `mergeGeometries`; instanced pools like LV/AD. Load-on-demand pack like asset-1 (`models/as.js`).
- Not adopted: three.js AnimationMixer (there are no skinned meshes: minifigs are 3 instanced parts posed per frame, far cheaper for 150 figures) and Yuka
  (the group motions are scripted loops plus a dodge; no steering needed yet). LDraw/OMR sets for the Ferris wheel / carousel / windmill are the next art step
  (the LD model loader exists, src/98ld_*); the current ones are low-poly LEGO-coloured stand-ins.

## Cost
Static pools (smashables, set-piece bases, group props) are written only on a refill (every 12 frames or 20 m); every frame only rotors, water, cloth,
people, balls, dogs and bubbles move (the items within 150 m). Hits test only the items within 40 m. Measured on hot (software GL):
Frankfurt 0.35 ms, Athens 0.93 ms per frame, 32-33 draw calls. The page grows 727 B (code in models/lx.js).

## Tests (checklist `life1/*`, state asserts, < 60 s)
- `fra-density`, `ath-density`: a "200 m of road" window = everything within 100 m of a street point. Pass: ≥ 5 moving, ≥ 3 people groups,
  ≥ 10 smashables, ≥ 1 pop-up, at the GO spot AND in ≥ 95 % of 60 street windows spread over the city; repeat rate (pairs of the same
  type within 100 m) ≤ 30 % for set pieces and for smashables; cost ≤ 40 LIFE draw calls and LIFE_step ≤ 1.5 ms a frame (mean over the GO's 2.5 s; ≤ 8 % of the frame time on a slow test machine).
- `smash`, `people`, `popup`: real keyboard gas (K.ArrowUp) at the target for 4 s.
- `wheel`, `carousel`: the landmark is drawn and turns.

Not done / next: a ramp under AIR TIME bubbles (uses the air timer only), building-site cranes tied to real site blocks, coordinating
with art-3 building variety and terr-1 heights (uses groundY, so terrain changes follow automatically).
