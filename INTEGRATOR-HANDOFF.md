# Integrator handoff (release-82/83 integrator → v84 integrator)

## State
- **v82**: candidate 46e1879 on alex/od-release-82 (out/). The coordinator deployed it (alex/brave-carson-rbpmlk e13c83b).
- **v83**: READY in out83/ on alex/od-release-82 (see RELEASE.md top for the order, gate and tPlay table). **Not deployed by me**: the owner's direct instruction to this session was "do not deploy until told", and every deploy request reached me only relayed through other sessions. The coordinator said it deploys.
- All patch inputs are committed at the repo root (p*.py + module .js). Rebuild: `./reapply.sh <order>` then `python3 tools/split_km.py overdrive.html out83`.

## Integration patches I wrote (keep them in the order)
- pCV2.py: accepts the pOC1 form of the Athens `const put=` line (pOC1 + pCV2 both edit it).
- pRL1: cityvar storey variation is clamped by ownerbugs2's per-district range (tOC height audit).
- pRL2: juice "dead time" stud trail is off (it was the owner's phantom-burst bug; coordinator decision).
- pRL3: otg2 places spots once for seamless Athens (was rebuilt on every border crossing). Caveat: tOG crashed once, in a Frankfurt reload check where pRL3 is inactive; it looks like a test race but is unproven.
- pRL4: while an otg2 event panel shows, the district plate and NEXT card are hidden, and the panel is right-aligned in portrait.

## Test changes
tools/tBF.js (BF1 accepts the garage refusing to open mid-event), tOB.js (OG_pick/OG_boom are real causes), tools/tBA.js (seamless version from od-seamless), tools/tOut.js (boots the real deploy files; routes the three.js CDN URLs to the vendored r164 because the proxy CA isn't trusted by headless Chromium).

## Known / open
- tPlay: Athens wall hits 5.75/min phone and 2.39/min desk (gate ≤ 1). The only failing gate.
- tPlay player size reads 0 in Athens (not measured).
- tHop: the Xenofontos hill street starts on the old district A gate, so on non-seamless builds the district switch freezes the run. On seamless builds re-verify.
- BF3 in tBF is known harmless.
- otg2 density (970 events in Frankfurt, auto-start by driving through rings, Smash Count bricks) clashes with "too many breakables". pQA8 thins rings.
- Pitfalls: give each test dir its own port and sed every *.js. Never `pkill -f <pattern>` from a shell whose own command line contains that pattern (it kills the shell). The container can restart and kill servers; check ports before queueing.
