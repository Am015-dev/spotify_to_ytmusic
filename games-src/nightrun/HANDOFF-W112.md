# HANDOFF W112 (consolidation plan + safety harness), 21 Oct 2026

Done: CONSOLIDATION-PLAN.md, fingerprint-test.js + fingerprints.json (baseline = merge of 58d3b76, 8/8 stable x2), layer-scan.py, smoke.sh.
The fingerprint already caught the Legend-ON merge: legend10 + endless10 state and every draw hash changed between fa406ea and 58d3b76.

Left (next brief, needs edits to EXISTING tests, which this task was not allowed to make):
1. smoke.sh is 578 s, not <= 300 s: hub-test (209 s at one size) and sprites-test (170 s, ONLY=hoplite) need a SMOKE=1 fast mode.
   The rest: fingerprint 46, hud-cover 25, ui-align x3 26 each, story 31, labfull 19.
2. labfull-test FAILs on the current build: "repro URL did not replay the spawn" (also before this task; not investigated).
3. Full ui-align at 844x390 FAILs story-map (1) and garage-looks (10) (pre-existing; smoke uses core screens only).
4. Dead-code list is from a gameplay drive only; run one UI crawl with V8 coverage (portrait + landscape) before step 7.
