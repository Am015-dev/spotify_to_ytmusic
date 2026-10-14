# HANDOFF int-5 (2026-10-14 ~09:35, stopped on Alex's order)

Role: trunk CI for `alex/od-int2`. Final build = **v90m-beta.61** (`out/v90m-beta.61`, head source unchanged since commit 1599523; later commits are handoff docs only).
Final gate: unit 4695 pass / 0 FAIL; SMOKE 16/17 (only `v90m/ath-boot` 33 s vs limit 30), errors 0.

## What shipped this shift (beta.41 to beta.61)
41 terr-1/life-2/cam-2 · 42 xform lazy chunk, LEGO sets, street furniture, gfx sun, trk-3 · 43 flat junctions, impostor trees · 44 portrait UI, ramp spawn · 45 Thiseio fountain · 46 roam camera ground clamp ·
47 bench sit · 48 CTB LEGO buildings · 49 Athens boot caches · 50 CTB counts · 51 mission markers snap to road · 52 stuck clusters/glancing hits · 53 portrait prompt, terr-4 reverted at the time ·
54 art-6 district themes + BV_life colliders (re-landed after a wrong revert) · 55 terr-4/5 hills · 56 desktop plate · 57 ctb/perf leak fix, barriers off streets · 59 trk-4 open tracks · 60 BUG button · 61 turbines in open ground, freed-array getY, foot near-clip.

## Standing non-passes
- `v90m/ath-boot` 30-47 s (swiftshader, load dependent; terr-5 measured 30-33 s default).
- `rv16/turbine-street` content PASS but 15-17 s (limit 10): rev-3 to trim.
- `rv15/rv-stuck-ath-start` 9-15 s (borderline). `rv14/rv-cam-refit` 8-13 s. `life1/ath-density` CPU line, load sensitive.
- Open bug: wh62vzaawojb3a76mp47 'windturbin' = turbine ANIMATION pivot (hub swings off the rotor pivot), rev-3 stopped before fixing it (docs/HANDOFF rev-3). qzoepg321p56r0qbh200 (open grass + too many buildings, Athens (1724,131)) is with simplify-1; its null[1] error is fixed in beta.61.
- Matrix --quick (beta.43): 23 failing / 14 root causes (roam-no-forward-progress = the spot gas test fails 12/12 on its own, not a state leak; phone HUD on t_v7612_1). Not re-run since.

## Lessons (do not repeat)
- Test ORDER leaks state: `ctb/perf` (before art-6's fix) broke later `life1/*` and `life2/kicker`; rv tests running before life1 can break `life1/smash,popup`. Before reverting a lane, re-run the GO ALONE and without other lanes' tests first. I reverted art-6 (ec37672, acc4dbc) wrongly and re-landed them in beta.54.
- Real reverts that were right: terr-4 5c32f82 (xf1/grass + terr2/junc-fra + own hills test red, passed alone on beta.52; re-landed green later), trk-4 b8b8ac3 (unit FAIL BX_OPEN undefined; re-landed 7/7).
- `trk4/bx-o-*` and other bx items are spawn-only in tChkGo: use `node tools/bx/tOpen.js <url>` (needs the built page; 7/7) for trk-4.

## Commands (unchanged)
```
git fetch -q origin alex/od-int2; git merge --no-edit FETCH_HEAD
node tools/unit/run.js | tail -1; sed -i "2s/^/  {v:'v90m-beta.N',date:'..',items:[{t:'FIXED',s:'..'}]},\n/" src/10_core2.js; tools/build.sh v90m-beta.N
rm -rf out/int2dev; mkdir -p out/int2dev; cp -r out/v90m-beta.N/* out/int2dev/; fuser -k 8812/tcp; (setsid nohup python3 -m http.server 8812 --directory out/int2dev >/dev/null 2>&1 </dev/null & disown)
TAG=a,b tools/tGo.sh http://localhost:8812/index.html out/int2dev/qa      # batch; SMOKE=1 smoke
CITY=fra QUIET=1 TAG=x node tools/tChkGo.js <url> <out>                  # one GO alone (no QUIET prints the PASS line text)
git add -f out/<ver> src/10_core2.js && commit && fetch+merge && push; verify git ls-tree origin/alex/od-int2 out/<ver>/index.html
```
Bug triage (coordinator's standing duty): ArtifactData list url=https://claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug collection=bugs; docs without `status` get assigned to a lane (rev-3, sink-1, shots-1, trk-5, simplify-1), status/owner/summary/assignedAt written back with if_version; 'fixed'+fixedIn only when a BUILD has the fix.
All int-5 send_later ticks are cancelled.
