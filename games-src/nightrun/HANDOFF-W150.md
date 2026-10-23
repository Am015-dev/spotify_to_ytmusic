# HANDOFF W150: street stage "very easy and not strategic" (parts/street/streethard.js, flag RET.streethard, default on, ?streethard=0 = old)

Round 2 (23 Oct, 07:00-07:15 UTC). Stepped time, RUNS=8, seeds fixed (`qa/streethard-test.js`, `qa/street3-test.js`).

| | before (?streethard=0) | round 2 |
|---|---|---|
| time-to-kill, pistol, median (rusher / gunner / heavy) | 0.77 / 0.93 / 16.0 s | 2.87 / 5.45 / 5.35 s |
| nearest-first bot clears ('decent') | 7/8 | 3/8 |
| gunner-first bot clears | - | 6/8 |
| idle bot | dies ~17 s | dies ~21 s |
| threat peak (street3-test (b)) | 79% | 89% (PASS, at 136 s on a 153.6 s median clear) |

streethard-test: (a)(b)(c)(e)(f) PASS, (d) FAIL: gunner calls happen in every run (4-6), cover blocks only in 1 of 8 runs.
street3-test PASS twice, footlab-test PASS, guard ok.

Round 2 changes: rusher hp x1.8; a gunner calls 3 s after it is seen and every 10 s after, adding one rusher (while fewer than 4 foes are up), and stands
up in the open during its 1 s whistle; at most 1 gunner on the street at once; one more heart; gunner shots also stop on any crate/car/kiosk,
including the gunner's own crate when Kai hugs the other side of it (street2 marks that crate `pass`, which round 1 skipped by mistake).

Why (d) still fails: gunners take cover ahead of Kai and the bot's cover logic needs an intact cover prop left of the gunner; most runs have none on screen
(Kai's fire breaks crates, and covers are 1 per ~600 px). Tried: keeping all cover unbreakable for Kai's shots (cover blocks ~1 a run in 6/8 runs, but the
nearest-first bot then stalls behind cover and dies at ~90 s, 0-1/8 clears); gunners preferring a crate with another crate in front (no effect: pairs rarely on screen).
Next idea: give each gunner wave a cover piece on Kai's side (needs a caption: rule 8), or make crates that hold no drops unbreakable by Kai only while a gunner is up.

Warning: results swing with tiny changes on 8 seeds (peak 133 vs 136 s moved the nearest-first bot from 3/8 to 1/8 and the street3 peak from 89% to 81%).
Gate on 16+ seeds before trusting a 1-2 clear difference.
