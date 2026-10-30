# REVIEW_2K_37: tb1 (tiled city build step 1, 9195d09 + 57979be), 2026-10-30

**Verdict: tb1 PASS to stay in trunk behind `?tb1` (default OFF). `?tb1` may NOT ship default ON yet (FAIL for rule 11): far tiles do not stream in a real PLAY boot, and the key GO does not compare against flag OFF.**

Built page `out/rev37` (tools/build.sh, BUILD_OK 3 517 355 B), served locally; phone profile (iPhone UA, 852x393 touch, 6x CPU) for every run.

## 1. Diff read (root cause and risk)
- Shape is right: `src/98tb_tiles.js` only changes *when* the unchanged builders run (TB_put / TB_later wrap the same `bt.add` thunks; ground cells farther than R0 go into a generator, `TB.gnd`). R0 = hubTiles touching an 800 m disc around the spawn; rest queued with ranks 1-6 and flushed per tile on `B2_pump`, 4 s after control.
- What the player touches early. None of these reads the deferred meshes:
  - **Collisions:** `groundY`/`groundYs` is analytic, and `GND_fars` only refines it where a cell exists (`src/53_terrain_roads.js:442`). An unbuilt cell falls back to the analytic height, so there is no fall-through. Kerbs are visual only (no kerb collider in src).
  - **Buildings:** building colliders (HUB.bld) are not deferred; the 7433 building rows match ON vs OFF.
  - **Traffic and peds:** `HT_gnd` → `groundY` is analytic, so a car outside R0 can sit a few cm off the later mesh until its tile builds. That's not visible at > 800 m.
  - **Mission marks, minimap, garage:** these are shell data, untouched by tb1.
- Risks found:
  - (a) `TB_gen` sorts the queue by the car position **once**, when it starts. A fast-travel or garage warp in the first seconds does not re-order it.
  - (b) **The queue is third in `B2.q`, behind 2 boot generators** (outer land and Autobahn, `src/98bt_boot2.js:11`, which runs one generator at a time). See §3.
  - (c) The GO `perf/tb-geo` "keys equal" checks only drawn vs recorded *inside one run*; it never compares with the flag OFF hash. In the gate run: ON `9d6f9fec/288` and OFF `790269a7/288` are **different**, yet both print ✅.
- **The 2 differing keys** (tools/perf/tbkeys.js on this build): they are ONE tile key, `#16961`, with 36624 vertices OFF and 36588 ON, i.e. one 36-vertex kerb piece fewer. Piece diff (`?tbdbg=1`):
  - the kerb run at **z 229, x -2126..-2009** has 21 pieces OFF and 20 ON (re-spaced, one shorter);
  - a second run at **x 1209, z -1504..-1480** moves by 1 m with the same count.

  Both are > 1.6 km from the spawn. The kerb trim depends on what is already built (order-dependent), so "same data, only timing" is not fully true. The handoff's location (x -2880 z 1112) is not where I measured it. Visual impact: nil at that distance.

## 2. Gates (built page, phone profile, THROTTLE=6)
| run | result |
|---|---|
| unit | 5231 pass, **1 FAIL page/size-headroom** (3 516 252 B, known trunk red, lane size-r30k), 13 known |
| `TAG=tb-geo,why,life1,xf1,terrain` ?tb1=1 | **77/79**: why/solid-bld fra+ath FAIL on **SLOW only** (167 s / 132 s > 100 s; functional ✅ PASS) |
| same, flag OFF | 76/79: the same 2 SLOW + why/quiet-start (OFF only) |
| tb-geo ON | `R0 cells 50/50, all at +30 s, cells 660/660, queued 641 pieces, 0 in R0, keys equal (9d6f9fec/288) ✅` (but see 1c) |
| tb-geo OFF | `flag off, keys 790269a7/288 ✅` |

The solid-bld SLOW fails happen with the flag ON and OFF, so tb1 does not cause them. I did not re-run perf/ios-reveal: the worker reports 13 links / 1 stall, the same as OFF, and by design TB starts at control + 4 s.

## 3. Gauntlet, flag ON (`docs/shots/gauntlet/rev37-tb1on`, `rev37-tb1on-b`, `rev37-mis-on/off`)
- **boot/toControl:** 57.2 / 57.3 / 56.4 s ON vs 76.5 s OFF on this build (rev36-full 78.4 s). That meets the tb1 bar of ≤ 58 s (the final bar of 36 s is still FAIL, as planned). ath/boot is 109-114 s (untouched by tb1).
- **Harness red (trunk, not tb1):** `tools/gauntlet.js` calls `CRB_side`, which the revert 4d432e4 removed. `run/fra` and `run/ath` crash after the drive rows, with the flag ON or OFF, so every trunk gauntlet is cut short until it is guarded. I ran the remaining rows with a local `typeof` guard (not committed).
- New FAIL rows vs rev36-full:
  - **boost/fra, boost/ath and race/rollBoth:** these are smash/roll code that the revert removed. Athens fails too, and tb1 is Frankfurt-only, so they are **not tb1**.
  - **mission/reach** ("no card in 90 s"): it ran after the hit/drift/wall rows. Alone it **passes** ON (8 s game) and OFF (16 s game), so it is not reproducible and not tb1.
- **drive/onStreet** went from FAIL 63 % to PASS 94 %. perf/frame (lab GL) is INFO only.
- **Long frames, and the queue draining in the first 30 s:** in a real PLAY boot (scratch shot script, 6x boot then 1x real time) **the queue never ran**. At control + 4 s TB started (`TB.go=1`), but `TB.g` sat at index 2 of `B2.q` with 3 generators queued. At control + 40 s wall it still had **180/660 ground cells and 641 pieces pending**. The GO's "drains in ~12 game-s" comes from `TB_drain()` run alone, not behind the boot queue. So I measured no long frames from TB, because nothing of TB ran. The design bar "R1 complete by +15 s" is unproven on a real boot.

## 4. Shots (docs/shots/rev37, SEEN.md)
- **START:** ON and OFF are the same frame (only the random peds differ). No holes and no missing kerbs.
- **+10 s and +30 s ON:** I drove 100 m and saw complete streets, ground and kerbs.
- **The far ring is not visible from this spawn** (buildings close the view), so the shots cannot show the gap beyond 800 m; the numbers in §3 do.

## Items for the next round (max 3)
1. **Make the far tiles actually stream on a real boot.** Run `TB_gen` ahead of, or interleaved with, the B2 boot generators: `B2_slice(gen, true)` or a share of each slice. Then add a GO row from a **PLAY boot** (not `TB_drain`) that reports the game-seconds from control to `TB.fin`, with bar ≤ 15 s at 6x on the phone profile, and 0 frames > 50 ms from TB in reveal + 3 s.
2. **Make `perf/tb-geo` compare against flag OFF.** Bake the OFF hash, or run both in the GO, and fail on a mismatch. Then either fix the order-dependent kerb trim (the run at z 229 x -2126..-2009 and the 1 m shift at x 1209 z -1500) or exclude those pieces with a stated reason. Fix the handoff location too.
3. **Re-sort the queue by the car's current position** at each tile group, so a warp or fast-travel goes first. Also guard `CRB_side` in tools/gauntlet.js (a trunk tool red that cuts every gauntlet short); 1 line, any lane.
