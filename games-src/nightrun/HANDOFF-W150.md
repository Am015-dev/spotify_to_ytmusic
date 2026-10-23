# HANDOFF W150: street stage "very easy and not strategic" (parts/street/streethard.js, flag RET.streethard, default on, ?streethard=0 = old)

Measured with stepped time, RUNS=8 (`qa/streethard-test.js`, `qa/street3-test.js`).

| | before (?streethard=0) | after |
|---|---|---|
| time-to-kill, pistol, median (rusher / gunner / heavy) | 0.77 / 0.93 / 16.0 s | 1.93 / 4.07 / 7.7 s |
| decent bot clears (street2-test bot + ducks level shots) | 7/8 | 4/8 |
| street3-test bot clears | 7/8 | 7/8 |
| idle bot | dies at ~17 s | dies at ~19 s |
| threat peak (street3-test (b)) | 79% | 85% (PASS) |

Decisions created:
1. Kill order: a gunner left alive shows "CALLING HELP" and 1 s later pulls a rusher from a later wave (every 10 s). 1-2 calls a run.
   Not proven yet: the gunner-first bot clears no more than the nearest-first bot (3/8 vs 4/8), because the gunner hides behind cover most of the time.
2. Cover or push: gunner bullets stop on cover props (height 56 at least) and chip them (2 hp). Bots rarely stand behind cover between them and a gunner
   (0-0.8 blocks a run), so this is not measured well yet.
Readable attacks: rusher crouch 0.6 s (was 0.4), gunner shots fly level at chest height so ducking dodges them (they used to hit the crouch line).
Heavy front plate takes 55% (was 30%).

Left (streethard-test fails narrowly): (a) rusher ttk 1.93 < 2.0 -> HPK.rusher 1.7; (d) cover blocks 0 on some seeds; (f) kill order has no measured value.
Next: make the gunner pop out more often when unhurt (so gunner-first pays), and a bot that picks cover between itself and the gunner.
Sensitive: small changes to peakT moved gunner ttk 4 -> 15 s (more gunners alive at once). Tune with SH='{"SH":{...},"T":{...}}' on the test.
