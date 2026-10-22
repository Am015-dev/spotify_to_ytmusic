# HANDOFF bughunt-phone-r22e24
1. tools/bughunt.js: phone profile is the default (iPhone UA + dpr 3 + 852x393 touch, no CPU throttle); `--desktop` = desktop UA dpr 1 (extra run). Profile is printed in the header and final line.
2. nearAny skips dead cars; a stop counts as NPC only when the RO.v writer stack names NC_*/W10_*/HT_*, otherwise it falls to world/invisible.
3. GATE COMMAND (≈256 s): `tools/build.sh bughunt && node tools/bughunt.js --gate --hours 2 --build out/bughunt` → exit 1 if a detector is worse than docs/shots/bughunt/baseline_phone.json (baseline_desktop.json via --desktop). nan/bounds/jsErr/deadButton must stay 0; others allow 10 hits or 3x baseline (same seeds gave 1 vs 9 launches run to run).
4. Baseline = trunk build at 1d94841 (live beta.154), 14-24 sim-min per city. Refresh: `--save-baseline docs/shots/bughunt/baseline_phone.json`.
5. Left: absolute limits still fail on the live build (yJump fra, launch both, popup/npcPop ath on phone) — these are real findings for a lane; the phone run does not reproduce desktop's `invisible` (0 vs 1 fra, 2 ath).
