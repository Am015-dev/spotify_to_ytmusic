# Escape bot report (bot/escape, escape-r21h, after review fix)

Pits: groundY on a 60 m grid per city; depth = rise over the easiest of 24 headings within 60 m; wall = steepest local slope. Car dropped at the 8 deepest basin floors + 4 steepest wall cells, gas held, must be on a road or open ground within 6 s sim time, and the landing point must be clear of buildings (roamHit) and cars (7 m).

| city | cell x,z | depth m | wall slope | freed by | t s | landing clear | ends at |
|---|---|---|---|---|---|---|---|
| fra | 2100,400 | 9.6 | 0.07 | reset | 4 | True | 2160,390 (road) |
| fra | -420,640 | 8.7 | 1.04 | reset | 4 | True | -360,653 (road) |
| fra | 1140,160 | 6.8 | 0.23 | reset | 4 | True | 1200,160 (road) |
| fra | 180,-1160 | 6.6 | 0.76 | reset | 4 | True | 240,-1154 (road) |
| fra | -780,1480 | 5.7 | 0.59 | reset | 4 | True | -816,1550 (road) |
| fra | 300,1780 | 5.5 | 0.14 | reset | 4 | True | 240,1784 (road) |
| fra | -7320,6160 | 5.3 | 0.31 | reset | 4 | True | -3238,553 (road) |
| fra | -540,-1160 | 5.2 | 1.25 | reset | 4 | True | -541,-1080 (road) |
| fra | -180,880 | 5 | 0.69 | reset | 4 | True | -157,960 (road) |
| fra | 2220,880 | 3.4 | 0.18 | reset | 4 | True | 2160,895 (road) |
| fra | -2100,1600 | 3.4 | 0.16 | reset | 4 | True | -2160,1595 (road) |
| fra | 780,1720 | 3.3 | 0.34 | reset | 4 | True | 720,1731 (road) |
| ath | 2690,-920 | 15.7 | 1.23 | reset | 4 | True | 2724,-932 (road) |
| ath | 50,-2060 | 14.8 | 0.86 | reset | 4 | True | 93,-2032 (road) |
| ath | 2450,-1280 | 13.2 | 1.44 | reset | 4 | True | 2417,-1247 (road) |
| ath | -2530,1300 | 9.7 | 0.13 | reset | 4 | True | -2573,1334 (road) |
| ath | -1990,820 | 8.9 | 0.12 | reset | 4 | True | -1934,802 (road) |
| ath | -4690,2800 | 8.2 | 0.77 | reset | 4 | True | -4710,2755 (road) |
| ath | -5530,3280 | 7.9 | 0.2 | reset | 4 | True | -5480,3312 (road) |
| ath | 770,-2300 | 7.5 | 0.26 | reset | 4 | True | 810,-2291 (road) |
| ath | 2570,-500 | 4.8 | 1.59 | reset | 4 | True | 2520,-490 (road) |
| ath | 2690,-1340 | 3.4 | 1.22 | reset | 4 | True | 2686,-1303 (road) |
| ath | 2810,-1640 | 6.6 | 1.11 | reset | 4 | True | 2806,-1670 (road) |
| ath | 1970,-1700 | 3.9 | 1.06 | reset | 4 | True | 1961,-1735 (road) |

## Must NOT reset (free driving)

Reviewer spots fra 2100,400 and ath -2530,1300 / -1990,820, plus up to 2 dips per city found by the bot where the car can run >= 27 m in 1.5 s at 20 m/s. Modes: from rest, at 20 m/s, circling. A lift counts as FALSE when, in the 2 s before it, net travel >= 20 m or a full second above 8 m/s (the assist's own 10 m/s is excluded). Result: fra 9/9, ath 12/12, no false reset.

Note: at the reviewer's three spots this harness cannot hold 97 km/h (the car is slowed to a stop within 1-3 s by the surrounding hill, or is pinned from rest); the only free-running dip found was fra 1140,160 (20 -> 4 m/s over 6 s, no lift).
