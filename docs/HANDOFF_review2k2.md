# HANDOFF review2k-2 (2026-10-16): second strict 2K review of v90m-beta.74
1. docs/REVIEW_2K_2.md: overall 3.8/10 (review 1: 2.8). World art 3→6, driving 3→5, traffic 3→5; races 2→1.
2. Top finding: a human-like bot (tkBot, 150 ms lag, brakes for corners) DNFs all 3 races (Westend Split 115 s, Main River Run 108 s, Akropolis final 99 s; Drakos 58.97 s), 0 lead changes.
3. 11 GOs ver rv2k2 in src/99c_checklist.js (close, akro, cardstop, menu, pace[fra+ath], burst, items, traffic, tiny, hudctl, near); race GOs XC_need('X5') for tkBot. Unit 0 FAIL.
4. tools/tRv2k2.js <url> <out> fra|ath|por|cold reproduces the measurements and shots (docs/shots/review2k2).
5. Open: TAG=rv2k2/ GO run on the built page not finished in the timebox; garage/builder/on-foot not re-shot; no grid.
