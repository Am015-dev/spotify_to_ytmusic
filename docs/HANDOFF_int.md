# HANDOFF int-4 → int-5 (2026-10-14 ~03:00, after beta.40)

Role: trunk CI for `alex/od-int2`. Coordinator = session_017iH3DB4VyxwKSdMwsco4Ut. Lanes push straight to `alex/od-int2` and send
`PUSHED <sha> ...` to the integrator's session id (tell every lane yours in one line at start). Never run deploy.sh, never ask Alex.

## Cadence and gates (Alex: "every 3 minutes")
- A BUILD whenever od-int2 has new green commits; do not batch lanes. Message the coordinator ONLY for BUILD / HANDOFF (no acks, no corrections).
- Blocking gate = `node tools/unit/run.js` (2 s, 0 FAIL) + the changed lanes' TAGs (<60 s). Smoke / `node tools/matrix/run.js --quick` (~3.5 min) in the
  background on the previous build; red = revert that commit in the next build.
- Player-visible change only → BUILD line. Hidden/flag-off/tooling-only pushes: unit check, no build.
- BUILD line: `BUILD alex/od-int2 <sha> out/v90m-beta.N: <changes>. unit N OK, FULL a/b (or TAGs), errors 0. FAIL: ...`. Push `out/<ver>` FIRST and verify
  `git ls-tree origin/alex/od-int2 out/<ver>/index.html` before sending. Deploy must copy `out/<ver>/xc/` and `out/<ver>/models/`.
- Red = revert the offending commit (`git revert`), tell the lane the exact failing test + the commands to re-check. Never ship red.

## Commands
```
git fetch -q origin alex/od-int2; git merge --no-edit FETCH_HEAD     # then: git status --short | grep -E "^(UU|AA|DU|UD)"
sed -i "2s/^/  {v:'v90m-beta.N',date:'14 Oct 2026',items:[{t:'NEW',s:'...'}]},\n/" src/10_core2.js    # OD_CHANGELOG entry, newest first
node tools/unit/run.js | tail -1 ; tools/build.sh v90m-beta.N
rm -rf out/int2dev; mkdir -p out/int2dev; cp -r out/v90m-beta.N/* out/int2dev/; fuser -k 8812/tcp; (setsid nohup python3 -m http.server 8812 --directory out/int2dev >/dev/null 2>&1 </dev/null & disown)
tools/tGo.sh http://localhost:8812/index.html out/int2dev        # FULL ~130 s; TAG=a,b (id prefix/ver); SMOKE=1
CITY=fra QUIET=1 TAG=v90k/park-sit node tools/tChkGo.js <url> out/int2dev/x    # single GO, alone
git add -f out/<ver> src/10_core2.js && git commit && fetch+merge && git push -u origin alex/od-int2
```
Never `pkill -f` your own server (kill by `fuser -k 8812/tcp`). `tools/ci.sh` refuses a dirty tree, so build by hand as above.
`docs/MODULES.md` is generated/untracked: `git rm --cached docs/MODULES.md` if a merge re-adds it. 99c_checklist.js conflicts: keep both sides' lines.
node_modules/ is untracked (`npm i three@0.164.1 --no-save` for the unit logic groups).

## State
- Live candidate: beta.40 (art-3 8d9dd4c on beta.39: cam-2 544ec504/a12bc78, foot-2 2119aaf/81d2493/49bccbe, LIFE, LEGO trees/props, tracks shown+races, BUG button).
- xform-1 (98xf auto transform) is OUT: reverted (5102911 bf0ec2d 4cb7366 ff1c552). To re-land it must pass in tChkGo: xf1 grass/water/land/kerb <10 s each and
  life1/people (it regressed with xform in). Lint already accepts `GO['xf1/'+id]` loops. Coordinator: "rides the next build once it is 4/4 with life1/people PASS".
- Standing non-passes: `v90m/ath-boot` 30-34 s (limit 30; cache fit 25/25 OK), 13+ `bx-*` spawn-only items, open rev-1 `rv14/rv-p-card`, `rv-p-hud`, `rv-p-garage`
  (rev-1 owns), `rv14/rv-cam-refit` 12 s (content PASS; coordinator allows <= 25 s). `life1/ath-density` CPU line is load-sensitive (swiftshader).
- `v90k/park-sit` "can't get out" ONLY when run after rv14 tests in one session (passes alone 3.6 s): state leak from rv14 GOs, rev-1 should reset state.
- matrix --quick (2332 cases): 122 failing before foot-2's roamFree fix (155→16 per foot-2); builder-specific groups are clean.
- Lanes (session ids): gfx-1 01HxGL7M… (GFX off, paused), terr-1 016nYa3n…, hot-1 018dg8Wz…, art-3→art-4 015i3ryh…, test-1 01U93Ump…, trk-2 01Q3etX1… (stopped),
  cam-2 01EYkuBA…, foot-2 01Wk3tCU…, life-1 01H1FaLE…, asset-1 01N7Hk2t…, xform-1 013BAHoB…, qa-1 01QLzLs9…, rev-1, split-1 (cannot message; read the git log).
- Page 3.09 MB (cap 3.6 MB, unit size-headroom FAILs within 3%); feature code goes in lazy chunks (`models/*.js`, `xc/*.js`).
