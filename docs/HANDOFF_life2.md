# HANDOFF life-2 (2026-10-14, od-int2 f9f1dcf)
Done: AIR TIME kicker (e18cd3c, GO life2/kicker); variety, 27 types in 2 BatchedMesh pools (4ef8bf0, GOs life2/fra-variety, life2/ath-variety). life1 7/7 PASS.

## Item 1: LDraw landmarks, waiting for Alex's yes/no (spec sent to the coordinator; mock-up docs/shots/life2/mock_landmarks.jpg)
- The OMR has no modern Ferris wheel or windmill. Sets used: 3681-1 Fabuland Amusement Park (Ferris wheel), 3668-1 Fabuland Merry-Go-Round (both by Philo), 7747-1 turbine (Mad_Marc). All CCAL 2.0.
- Code is already in code.js (`LIFE_ldLm`, `LIFE_ldM`): it builds the landmarks when `LD_MODELS.lxfw_base` exists, otherwise the stand-ins. The seats stay level (`lm.upd`). Fabuland materials are double-sided.
- The data `src/assets/lx/ld.js` (281 KB) is generated and NOT committed. On a yes: `git add src/assets/lx/ld.js`, then add a size/seat-level GO. Not wired yet: the 7747 turbine set piece (data lxwt_base/rotor is in ld.js; replace G.S.turbine).
- Regenerate: `tools/lx/ldsplit.py` (part groups, shared frame), then `ld2garage.py` with `LDSHIFT=<shift of the _x union>`; for Fabuland add `LD_ALL=1 LD_KEEP=1 LD_MAXT=8000`; then `ld2src.py --out src/assets/lx/ld.js`. The steps are in the session log. Inputs `ld/lx/*.ldr` and `ld/omr/*.mpd` are git-ignored/untracked; re-download with `curl -o ld/omr/<set>-1.mpd https://library.ldraw.org/library/omr/<set>-1.mpd`.
- On a no: delete src/assets/lx/ld.js; nothing else to change.

## Notes
- The hot page breaks if a module in LAZY (99c) references a later ORDER module at top level (xform-1's XF_GOS did, since reverted).
- The kicker launch uses the shared ramp code (`RO.rampV`): 2.4 s air, ~12 m high at 96 km/h.
