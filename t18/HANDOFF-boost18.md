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

## Update 17:25
- Serial A/B (MIN 4, seeds 1-3, live v87s vs b2k18): ath walls 0.57 vs 0.65, stuck 5.9 vs 3.9 (seed 1 9.8%: stuck twice at (1516,-101), last drift 30 s earlier; 9 full bursts sent it on another route).
  fra walls 0.16 vs 0.32, stuck 4.2 vs 5.5.
- tPlay brake tail: it holds BRAKE 18 frames and GAS comes back → GAS+BRAKE+steer drift. Fix (b2k18b): roam drift needs BRAKE pressed while GAS is
  ALREADY held (B2K.bG latch). Athens A/B on b2k18b: qa18/ab2 (running). tPlayDbg now logs stuck positions (stPos).
- perf: tyre gap 0.03 m (x4). s_water stuck en route → scen_water now reverses when stuck; rerun queued (qa18/s_water2).
- Review shots: t18/shots/. Live moved to v87t (64e3bec): rebase at DEPLOY time.

## Update 17:50: reviewer FAIL (3a7478f) and fixes
FAIL items: (1) turbines too big, they hid the car; (2) stale base; (3) pending: side view, water hop, ath A/B on the latch build, 90° turn + hard-brake strips; minor: one combined bar.
- (1) Done: small LEGO thrusters (2x2 round brick r .2, stud, silver rim, trans-orange flame cone that flickers), at hw*.5, low (hh*.3), behind the rear axle (hl*.9).
- Minor: done. One 10 px bar: cyan = meter, pink after it = the boost the drift will add. BRICKBASH! label to the left of the bar.
- (2) Done: v87t src re-derived by line diff of live index.html against the v87s modules (only 10, 92, 94, 98t changed) → LIVE_MATCH cdb4266. Committed.
- (3a) Done: t18/shots/side_*.png (gap 0.03 m).
- Running `qa18/run2.sh` (serial): t18/strips.js (turn / brake / driftTurn: slip, camLag, 4 shots each) → s_fra2 re-shoot →
  ath A/B qa18/ab2 (base18 vs b2k18c) → water hop s_water2.
- Lesson: `pgrep -f X` inside a waiter whose own command line contains X waits forever, and pkill -f kills your own shell. Use one serial script.

## Update 18:40
- Root bug found: in roam pl.mesh (the root group) never rotates; mesh.children[0] carries the heading (yaw = h+π, rear = local +z).
  B2K_frame() now gives thrusters + trail that child. Before this, thrusters sat on one side and the trail used world axes.
- Thrusters: light bluish grey, just behind the bumper (hl+.24, hh*.4, ±hw*.45). Look OK in qa18/s_fra5 (crop_boost.png).
- Ath A/B #2 (b2k18c vs live, serial): walls 0.81 vs 1.77, stuck 7.0 vs 5.5. Serial is NOT reproducible either (live seed 2 gave 3.5 then 9.6).
  ALL stuck episodes in both builds are at Eleni's Garage (2037,-1644): qa18/stk3/phone_ath_stuck1.jpg shows the car parked at
  "Eleni's Garage → 2 m", road clear. tPlay counts the dwell at the objective as stuck. That is a tPlay/objective artifact, not walls.
- Strips: t18/shots/strip_{turn,brake,driftTurn}.jpg (from b2k18c).
- run4: race shot (b2k18d) + water hop from Athens (fra route failed twice: the car never reached the river).
