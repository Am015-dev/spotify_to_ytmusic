# HANDOFF chkgo-h (2026-10-17): tChkGo never PASSes a GO that throws
1. Bug: a GO whose eval threw (e.g. ReferenceError on a missing LAZY export) was stored as "EVAL ..." text, which matched no BAD pattern, so the item reported PASS.
2. Fix: tools/chkgo_verdict.js judges one GO (throw, eval error, still "…", no pass line, BAD text, page error, navigation → FAIL). tools/tChkGo.js uses it; the error text is one line.
3. Unit: tools/unit/logic_chkgo.js feeds a throwing GO (ReferenceError, async throw), a GO with no pass line, a running one, and a pass line → FAIL/FAIL/FAIL/PASS. Unit 0 FAIL.
4. Built page (out/slow1chk), TAG=slow1,life1: 9/9 PASS with the new and the old runner (same results). life1/ath-density 59/60 did not reproduce here.
5. Pre-existing: `run.js --selftest` misses 8 seeds on the untouched baseline too (not touched here).
