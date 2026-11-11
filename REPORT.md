# M2 — Frankfurt Chapter 2 "Die Hafenbande"

## What changed
`m2.js` (one self-contained module, embedded by `pM21.py` with one anchor, see `ANCHORS.md`). It registers into the Chapter-1 system in m1.js
(scenes, radio, goons, item boxes, stages, phase checkpoints, NEXT bar, results card) and adds 3 stage types (`boats`, `stacks`, `m2boss`).

Chapter 2 unlocks when the Rossi duel is won (M1 step 4). The NEXT bar then leads through:

| # | Mission | Where (real landmarks) | Phases (escalating) |
|---|---|---|---|
| 4 | **Marked Man: Hafen** (Jana Weber) | Osthafen quay → Hanauer Landstraße → Ostbahnhof → EZB → Zoo → Friedberger Landstraße → Nordend → Polizeipräsidium (Adickesallee) | Quay ambush while 3 evidence crates load (every 2nd ram breaks one) · Hanauer run with 3 hunters · EZB blockade: Haak's blocker truck (9 HP, BOOST-ram) · Detour north: Zoo ambush with a shield car, more chasers, a goon truck blocks the road · Gate closing: 20 s to park inside the HQ |
| 5 | **River Rampage** (Hilde) | Mainkai, Eiserner Steg, the Main under Alte Brücke / Ignatz-Bubis / Flößerbrücke, Weseler Werft | Drive into the Main (the car becomes a boat) · 3 smuggler boats (4 rams each, one drops crates) · 4 bridge gates with mines on the water · Haak's tug (8 rams) · back up the quay, then a quay brawl |
| 6 | **Crane Crash** (Jana Weber) | Osthafen cranes / container yard | 4 container stacks (90+ km/h, 2 hits each) · crane ambush: containers dropped in your path while goons ram · wrecking ball bowled through the hideout gate · hideout: 2 waves + Haak's forklift truck · Haak on land (6 HP, flees and drops mines), then escaping by speedboat (5 rams) |
| 7 | **Harbour Duel: Weber vs Moreau** | Osthafen → Zeil → Hauptwache → Alte Oper → Messe → Hbf → Sachsenhausen → Alte Brücke → EZB | 3-car race with items on: Weber's shield absorbs your first hit, Moreau boosts more often · Hafenbande crashes the race (3 hunters) · final sprint: Moreau drops mines |

Each mission has a start scene (and Kaiser/Haak/Moreau beats), radio lines when a phase changes, phase checkpoints, and an end scene that routes NEXT on.
**Reward** (duel win): the `WEBER` flag, which unlocks **Mainschiff** (`v_weber`), plus the **RAM PLOUGH**: a yellow blade on the car. 4 reinforced Schattenwerk walls
appear on shortcut streets once chapter 2 starts. Without the plough they block you. With it, a hit at 60+ km/h smashes the wall (300 studs, saved in `m2w`).
**Save:** on completion the m1 save state gets `M2_done=1` (plus `plough=1`). Chapter 3 should key off `M2_done`.

## Patch order
`./reapply.sh pM21.py` → REAPPLY_OK.

## Tests
`node tM2.js [U M W C] [shots]` uses m1bot.js with fast.js and roamSim. The wall check uses real keyboard input.
Final full run: **24 pass, 1 fail**. The one failure was Crane Crash at 232.9 s, below the 240 s minimum. Its crane ambush was then lengthened (80 → 100 s), and two crane-only reruns passed: 255.9 s and 252.7 s.
- U (3/3): no chapter-2 content before the Rossi win; the win unlocks the Marked Man mark and NEXT, plus 4 locked walls.
- M (12/12 in the full run, counting the crane fix): bot game times Marked 249.9 s · River 268.3 s · Crane 253–256 s · Duel 305.5 s. Every mission has ≥3 phases (5/5/5/3) and real takedowns.
  After the duel: `M2_done=1` and `plough=1` saved (also in localStorage), WEBER flag set, `v_weber` Mainschiff unlocked (`teamLocked` false).
- W (3/3, real keys ArrowUp+Shift): a wall bounces you without the plough, smashes with it, and the plough mesh is mounted.
- C (4/4): HP 0 mid-mission, then RETRY PHASE restores the stage (duel: both rival positions too), and the retried mission completes.
- `node smoke.js .` on the final build: **SMOKE PASS** (289 s, zero console errors). Smoke history with pM21 applied: 2 passes, 2 crashes.
  Both crashes were "Execution context was destroyed" while screenshotting after the Athens B drive. That drive follows a random GPS route, and the sheet once showed the Athens district-loading card, so a district-travel reload is the likely cause.
  M2 code returns early outside Frankfurt. One smoke run on the unpatched base passed, which does not rule this out either way. Flagging it as a smoke-script race, not proven.
Screenshots: `shots/m2_*.jpg` (selected), `smoke/sheet.png`.

## Known gaps
- The district plate still reads "Chapter 1 · Neu in Mainhattan". It comes from the old flag-based `chapter()`, which m2 does not change.
- Mission durations are measured with the 50 m/s teleport bot. Humans drive slower, so their times will be longer, but timers (T) were set generously.
  Marked Man is the closest to the 4-minute minimum (bot: about 240–255 s).
- Boats use the existing auto-boat morph. The bot teleports, so climbing out of the river was checked once by hand in a probe (it works), not in tM2.
- The doc's chapter finale (Mainhattan Cup circuit race) is not included. This chapter ends with the in-world 3-car duel plus the reward.
