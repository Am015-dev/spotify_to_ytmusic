# HANDOFF prewarm-r21f
- Prewarm default: ?prewarm=1/0 force on/off; no flag = ON only when the session perf doc has a db (Beta page; PREW_decide in src/98bp_warmall.js), touch/lowmem path only; live site (no db) stays OFF.
- Hard cap: the draw is batched (4 programs + 1-px read each), aborts after 1800 ms real wall (?prewcap=N); doc.prew = {ran,abortedAtMs,programs,ms,of,p0,p1}.
- A/B: localStorage od_prew_arm alternates per device (first run ON, try/catch; no storage = always ON); doc.prewArm = on|off|forced-on|forced-off.
- GO changes: new perf/prewarm-default (state asserts on the decision/alternation/doc fields); perf/ios-reveal still boots forced ?prewarm=1 (lab iframe has no db) and now also asserts prew.ran and abort <= 3.5 s; no existing check weakened.
- Next: read doc.prewArm/prew/lf/pRev on the perf db after Alex's phone sessions; if arm ON shows no freeze at ~1-2 s, make it unconditional.
