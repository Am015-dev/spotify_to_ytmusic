# Nightrun animated sheets: wiring audit (W356, 7 Nov 2026)

## Finding first
HANDOFF-SPRITES.md (21 Oct) was written before the loader existed. On `origin/alex/brave-carson-rbpmlk` it is already built
(`ART.anim / aframe / aS / drawAnim`, `SPR.*`, `FOEART`, `ART.FM`, `ART.fxSheet`, ANIM bundled by `build.py _anim()`, media + `ready.json`
in place, `?sprites=0` = stills, `RET.sprites` default ON in parts/profile/ret.js:7). Nothing in section 1 needed writing again.
This task therefore audited what is really drawn and wired the one group that had no hook.

## Sheet -> object (strips on disk: 287; the 229 owner-approved ones are a subset of the same set)
| Group | Sheets | Drawn by | State |
|---|---|---|---|
| Bosses (10 x idle/attack/hit/defeat) | 40 | `SPR.boss`, `SPR.bossDefeat` (art.js) | wired before W356 |
| Player ships (9 x flame/death) | 18 | `SPR.ship`, `SPR.shipDeath` | wired before |
| Enemy ships (flame/volley/death, 24 kinds incl. the fleet types) | 76 | `SPR.foe`, `FOEART.sheet` (foeart.js), fleet.js types | wired before |
| On-foot actors kai + 10 enemies + warden | 87 incl. Kai extras | `ART.footDraw`, `ART.FM` pose -> act | wired before |
| Explosions (13 burst) | 13 | `ART.fxSheet` boom-* | wired before |
| Small FX (spark, hitconfirm, shield) | 3 | `ART.fxSheet`, `SPR.shield` | wired before |
| Weapon muzzle + impact (16 x 2) | 32 | `ART.fxSheet` w-<id>-muzzle / hit | wired before |
| Pickups coin, health, ammo | 3 | `SPR.pk`, foot pickup | wired before |
| Props (9) | 9 | streetlook.js, street2.js, art.js PROPS | wired before |
| **Weapon `beam` (laser, wave)** | 2 | **new: `FXW.beam` (fxwave.js), called from `FXW.bullet` and `Pure.shots`** | **wired in W356**, flag `RET.sprites`; `beam` added to `ART.LOOPA` so it loops |

## Not wired (reason)
- `wpn-orbit/beam`, `wpn-storm/beam`: green / orange. W215 rule in render/pure.js (WARM) keeps player shots in cool hues so they never look like enemy shots. Left on purpose.
- `wpn-arc/beam`, `wpn-well/beam`: arc and well fire no plain shot (no bullet with a weapon id), so there is no object to draw it on. Needs a design decision (chain lightning / gravity field drawing), not invented here.
- On-foot `jetpack, hound, flamer, ninja, medic` (19 sheets): `ART.FM` already maps their acts, but no such enemy is in the game; no stats or spawn rules added (HANDOFF-SPRITES section 3).
- Enemy ship kinds with no spawn today stay available through FOEART; nothing added.

## Flag state
`RET.sprites` stays ON (unchanged: it has been the default since the earlier wiring). Not flipped by this task.

## Tests (run on the build before / after the beam change, each alone)
- `sprites-test.js` (before the change, full): PASS for loader, fx, pickups, shield, flag-off, on-foot, Kai extras, enemy ships, props, foot stage.
  FAIL, all pre-existing on this base and not touched by the change: boss body match vs the old still for sek-adler and kronos (d3), ship nose/centre (d4), frame-time d5 for the bosses (p95 of the boss scene +20 ms, noisy in this container), `hoplite boss arrives`, `f8 fx drawn in a real run (calls 13, fx 0)`.
  These need the owner or the orchestrator to decide whether they are stale checks (the 22 Oct re-delivery changed cell sizes) or real.
- `qa/assetuse.js` stage 1 + street: 36 sheets drawn in one run, 0 errors.
- Beam check (stepped, 390x763): `wpn-laser/beam` and `wpn-wave/beam` drawn (24 / 46 calls), 0 page errors.
- `guard.py`: ok.
- `smoke.sh`: 1 FAIL of 11 run (fingerprint skipped as pre-existing): `labfull` "saves differ after the foot sandbox" (mnr_svauto*). It is flaky and not from this change: alone, base build pass / fail / fail, with the beam change fail / pass.
- Not done: the +10 % frame-time comparison, the 1440x860 pass, and a look at every group (no time left for it in this session; the groups other than the beam were not changed).
