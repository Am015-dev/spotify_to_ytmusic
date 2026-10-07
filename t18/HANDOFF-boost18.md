# Worker 18 (boost-2K on v87s) handoff

Branch `alex/od-boost18` = `alex/od-race15` (live v87s src; worktree build is LIVE_MATCH) + boost16 incl. 3aa9a7d. Draft PR #60 is for tracking only.
`src/ORDER`: 98k_boost2k.js goes after 98z_race_items.js. The diff vs v87s is 98k + ORDER + the 71 hook line.

## Drift rule (ctlPlayer wrapper in 98k)
- Roam: drift ONLY on an explicit GAS+BRAKE+steer (TOUCH.gas / seam / keys Up+Down), speed > B2K_DMIN 12 m/s. Plain BRAKE+steer brakes.
- Races, touch (auto-gas, GAS hidden): BRAKE+steer > B2K_RDMIN 16.7 m/s (60 km/h) drifts; once drifting it holds down to 12 m/s.
  PC races keep Up+Down+steer (chose this: the brake-drift is for phones).
- Worker 16's handoff says "W14_ST.hbCity" exists in v87s. It does not: base hb only comes from X/Ctrl/DRIFT button.
- Likely Athens-stuck cause: tPlay brakes+steers with auto-gas, so the old rule (gas||auto) turned that into drifts.

## Tests (first build, fra, real touch): all OK
- brake twitch: 92 → 51 km/h, 0 drift samples, 0 drifts. Two-finger drift 1.0 s, slip 25°/41°. Seam drift 1.7 s, bar 46.
- Burst 1, Brickbash after 1.83 s, 53 → 182 km/h. Hop 2.4 m. No HUD overlap, no errors.
- Race NOGAS (GAS hidden): BRAKE+▶ at 124 km/h → drift 1.82 s, +20.8 boost; Brickbash in the race OK.
- tRace grand phone, new vs live: 0 walls both, 1/8 both, 5/5 items, 4 transforms, dirt shortcut, no errors, tyre p50 0.004 vs 0.003.

## Running
- `qa18/ab18.sh qa18/ab 4 "ath fra" "1 2 3"`: SERIAL seeded tPlay, base18 vs b2k18, about 3 min per run. Summary prints at the end of its output.
- `qa18/shots.sh` waits for ab18, then: s_fra, s_ath, s_water, s_race, s_perf (ms/frame + tyre gap), s_side (t4/nbside low side view).
- Builds: `base18_dbg.html` from the worktree at scratchpad/base (race15). `b2k18_dbg.html` = `tools/build.sh b2k18 --local` + cp local_dbg.html.

## Next
Numbers + LOOK at the shots → REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v → on PASS: rebuild on CURRENT live, OD_CHANGELOG entry
(top of src/10_core.js), out/<next ver> (v87t if free) → DEPLOY to the coordinator.
