# SLICE: stages 1-3 hand-authored (S1, 22 Oct 2026). Flag `RET.slice` (ON, Normal story stages 1-3 only; `?slice=0` = waves.js tables)

Players: "a swarm, no logic, boring", "enemies fly past and don't die, gambling", "no beat, no tension" (12-15/100).
Code: `parts/waves/slice.js` (rides on waves.js: same chip, same foe movement, other spawners stay muted). Test: `qa/slice-test.js`.

## Rules for every stage
- One script per stage, written in bars of the song (bar = 4 beats). Every foe enters ON a beat (group = one foe per beat).
- Arc: intro (popcorn only) -> build (add the shooter) -> peak (shooter + charger + popcorn) -> breather (empty, 2-3 bars)
  -> the stage's DECISION -> mini-climax (tank). Max 6 threats alive at once, by construction of the script.
- Three roles, one look each, fixed hull (no random elites on these stages):
  POPCORN drone, 2 hull (1-2 shots), weaves, life 7 s. SHOOTER turret, 14 hull, parks, shows its aim then fires a 3-shot fan, life 12 s.
  CHARGER, 2 hull, aims a red line on your height, dashes, comes back. TANK gunship, 30 hull, slow, must be focused, life 18 s.
- No fly-throughs: a foe enters, acts, and when its life is up it LEAVES SLOWLY (drifts right at 60 px/s, still shootable).
- Kill = hit flash (exists) + a short white pop ring. Chip text (top band, existing) only at the decision; no other boxes.

## The decision per stage
| Stage | Bars | Decision | Risk | Reward |
|---|---|---|---|---|
| 1 FIRST RUN (survive) | 22-26 | BOUNTY: a gold courier sits in the top corner for 6 s while a shooter covers the middle | fly up through the shooter's fan | hull repair + 1000 |
| 2 PATROL (kill) | 20-25 | POWER IN THE ARC: a power-up spawns right in front of a parked shooter and drifts slowly | grab it now (inside the fan) or wait (it drifts out, but the shooter's escort arrives) | a music power |
| 3 ZEIL (score) | 14-18, 26-31 | LEADER: a gold leader shooter with 5 popcorn escorts. Kill it and the escort scatters (their points leave with them) | farm the escort while the leader fires | escort points vs a calm field |

## Script (bar: what enters; P popcorn, S shooter, C charger, T tank)
- Stage 1: 1 PPP, 3 PPP (weave), 5 PPPP, 8 S+PP, 11 CC+PP, 14 SS+PPP (peak), 17 CC, 19-21 rest, 22 BOUNTY + S, 26 T+PPP, 29 CC+PP, 32 PPP.
- Stage 2: 1 PPPP, 4 PPPP, 7 S+PPP, 10 CCC, 13 S+CC+PP (peak), 17-19 rest, 20 POWER + S + PP, 24 T+PP, 28 CC+PPP, 31 S+PPPP;
  then bars 7-31 repeat until the kill goal (72% of the script) or the song ends.
- Stage 3: 1 PPPPP, 4 S+PPP, 7 CCC+PP, 10 SS+PPPP (peak), 13 rest, 14 LEADER + 5 P, 19-21 rest, 22 T+PPP, 26 LEADER + 5 P, 30 CC+PPP.

## Measured (qa/slice-test.js, stepped sim, 8 runs/stage, human + parked bot; before = `?slice=0`)
| | foes/run | killed or >= 4 s | max on screen | off-beat spawns | human clear | parked clear |
|---|---|---|---|---|---|---|
| before | 86-90 | 86% (82% st 1) | 11 | 1679/2107 | 24/24 | 0/24 |
| after | 37 / 53 / 44 | 100% | 6 | 0/1072 | 24/24 (gate 60-90%: FAIL) | 0/24 |
Hull hits per stage (human bot) 0-3; the stage-3 hits before were counter.js red seekers (no foe in sight), now muted here.
Fire rate, bullet speed x1.6, wider fans and 2x hull on shooters did not move the human bot (hits 0-4): it dodges telegraphed aimed fire.
Fingerprint: `?slice=0` 8/8 identical; slice on: only fly2 changes. Simhunt: 0 page errors, no finding on stages 1-3 (2 before).
