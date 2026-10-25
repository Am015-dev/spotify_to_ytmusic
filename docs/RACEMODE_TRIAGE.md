# Race mode triage (racemode-r25a, 2026-10-25)
Every race of the race menu, started through the real menu buttons (tab, city, track, START) on the BUILT page, phone profile (iPhone UA, 852x393 touch), driven by the human-like bot (0.15 s steering lag, arrow keys) on a stepped clock. Tool: `tools/tRaceMode.js`; GO `race/racemode-all` (`src/99crm_racemode_go.js`).
Before = same build with `?stkcam=0` (old race camera = beta.162 behaviour); after = this build. Columns: picked (the race that started is the one picked), finished (race types: player finished, not DNF; time trial: a lap; Zone/Arena/Derby/Crash Jct: ran 60 s), stuck (2 s standstill with gas), walls (speed halved from > 14 m/s; ✅ < 10), rivals (no rival left < 60 % of the player's distance at the finish), fly/sink (airborne > 4 s, or off its road plane), camera (cam/steady judge: <= 4 distance / FOV reversals per 10 s, zoom-out <= 2 m/s, FOV <= 8°/s), errors (page errors).
Shots: `docs/shots/racemode/`.

## Frankfurt
| race | | picked | finished | stuck | walls | rivals | fly/sink | camera | errors |
|---|---|---|---|---|---|---|---|---|---|
| Race · Grand Prix | before | ✅ | ✅ P4 136.1 s | ✅ | ✅ 1 | ✅ 7/7 | ✅ | ❌ d rev 27, FOV rev 3, out 1.8 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ P6 134.4 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ✅ d rev 1, FOV rev 1, out 0.6 m/s, 4°/s | ✅ |
| Race · Westhafen | before | ✅ | ✅ P3 82.9 s | ✅ | ✅ 0 | ✅ 5/7 | ✅ | ❌ d rev 9, FOV rev 2, out 1.2 m/s, 96°/s | ✅ |
|  | after | ✅ | ✅ P5 81.9 s | ✅ | ✅ 0 | ✅ 6/7 | ✅ | ✅ d rev 1, FOV rev 3, out 0.3 m/s, 3°/s | ✅ |
| Race · Fraport | before | ✅ | ✅ P2 110 s | ✅ | ✅ 0 | ✅ 5/7 | ✅ | ❌ d rev 3, FOV rev 3, out 1.0 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P3 112 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ✅ d rev 1, FOV rev 1, out 0.4 m/s, 5°/s | ✅ |
| Race · Skyline | before | ✅ | ✅ P3 79.2 s | ✅ | ✅ 0 | ✅ 7/7 | ❌ fly | ❌ d rev 3, FOV rev 2, out 0.6 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P2 81.1 s | ✅ | ✅ 0 | ✅ 3/7 | ❌ fly | ✅ d rev 0, FOV rev 1, out 0.1 m/s, 1°/s | ✅ |
| Race · Nordschleife | before | ✅ | ✅ P4 70.6 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ❌ d rev 19, FOV rev 2, out 1.5 m/s, 61°/s | ✅ |
|  | after | ✅ | ✅ P7 74.2 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ✅ d rev 1, FOV rev 1, out 0.2 m/s, 2°/s | ✅ |
| Race · Twister | before | ✅ | ✅ P2 105.8 s | ✅ | ✅ 8 | ✅ 2/7 | ✅ | ❌ d rev 10, FOV rev 2, out 3.5 m/s, 62°/s | ✅ |
|  | after | ✅ | ✅ P1 101.2 s | ✅ | ✅ 0 | ✅ 2/7 | ✅ | ✅ d rev 1, FOV rev 2, out 0.3 m/s, 3°/s | ✅ |
| Race · Riverbank Rally | before | ✅ | ✅ P8 81.6 s | ✅ | ❌ 16 | ✅ 7/7 | ✅ | ❌ d rev 50, FOV rev 2, out 1.7 m/s, 53°/s | ✅ |
|  | after | ✅ | ✅ P8 81.1 s | ✅ | ❌ 16 | ✅ 7/7 | ✅ | ❌ d rev 2, FOV rev 2, out 2.1 m/s, 25°/s | ✅ |
| Cup · round 1 | before | ✅ | ✅ P5 159.5 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ❌ d rev 26, FOV rev 4, out 1.5 m/s, 98°/s | ✅ |
|  | after | ✅ | ✅ P1 159 s | ✅ | ✅ 0 | ✅ 5/7 | ✅ | ❌ d rev 1, FOV rev 1, out 0.9 m/s, 9°/s | ✅ |
| Time trial · Grand Prix | before | ✅ | ✅ 125.2 s | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 24, FOV rev 4, out 1.9 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ 126.1 s | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 1, FOV rev 3, out 2.6 m/s, 32°/s | ✅ |
| Zone · Grand Prix | before | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ❌ d rev 18, FOV rev 3, out 1.0 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 1, FOV rev 3, out 1.7 m/s, 18°/s | ✅ |
| Arena · Grand Prix | before | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ❌ d rev 14, FOV rev 3, out 1.1 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ✅ d rev 1, FOV rev 2, out 0.3 m/s, 8°/s | ✅ |
| Derby · Grand Prix | before | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 13, FOV rev 3, out 1.8 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ❌ d rev 1, FOV rev 1, out 1.8 m/s, 20°/s | ✅ |
| Crash Jct · Grand Prix | before | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ✅ d rev 0, FOV rev 1, out 0.3 m/s, 4°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ❌ d rev 1, FOV rev 1, out 1.4 m/s, 15°/s | ✅ |
| Daily | before | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 11, FOV rev 3, out 3.0 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ❌ d rev 1, FOV rev 2, out 0.7 m/s, 9°/s | ✅ |
| World · ROSSI | before | ✅ | ✅ P2 157.5 s | ✅ | ✅ 8 | ✅ 1/1 | ✅ | ❌ d rev 12, FOV rev 3, out 1.7 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ P1 148.9 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 0, FOV rev 1, out 0.1 m/s, 3°/s | ✅ |
| World · WEBER | before | ✅ | ✅ P1 91.4 s | ✅ | ✅ 0 | ✅ 0/1 | ✅ | ❌ d rev 5, FOV rev 3, out 0.9 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ P1 91.3 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 1, out 0.3 m/s, 3°/s | ✅ |
| World · MOREAU | before | ✅ | ✅ P1 96.1 s | ✅ | ✅ 0 | ✅ 1/1 | ❌ fly | ❌ d rev 2, FOV rev 2, out 0.5 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P1 92.7 s | ✅ | ✅ 0 | ✅ 0/1 | ❌ fly | ✅ d rev 0, FOV rev 1, out 0.1 m/s, 2°/s | ✅ |
| World · OKAFOR | before | ✅ | ✅ P1 69.4 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 1, FOV rev 3, out 0.7 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P1 69.8 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 2, out 0.5 m/s, 4°/s | ✅ |
| World · FERREIRA | before | ✅ | ✅ P2 91.7 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 23, FOV rev 3, out 1.4 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ P1 90.2 s | ✅ | ✅ 0 | ✅ 0/1 | ✅ | ✅ d rev 1, FOV rev 1, out 0.3 m/s, 3°/s | ✅ |
| World · ÇELIK | before | ✅ | ✅ P2 172.1 s | ✅ | ❌ 10 | ✅ 1/1 | ✅ | ❌ d rev 30, FOV rev 3, out 2.5 m/s, 97°/s | ✅ |
|  | after | ✅ | ✅ P2 162.1 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 2, out 0.5 m/s, 4°/s | ✅ |
| World · BRANDT | before | ✅ | ✅ P2 73.9 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 24, FOV rev 3, out 1.9 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P2 70.1 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 1, out 0.5 m/s, 8°/s | ✅ |
| World · NAKAMURA | before | ✅ | ✅ P2 94.1 s | ✅ | ✅ 0 | ✅ 1/1 | ❌ fly | ❌ d rev 19, FOV rev 2, out 1.5 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P2 91.8 s | ✅ | ✅ 0 | ✅ 1/1 | ❌ fly | ✅ d rev 0, FOV rev 1, out 0.1 m/s, 2°/s | ✅ |
| World · KAISER (boss) | before | ✅ | ✅ P6 121.6 s | ✅ | ✅ 3 | ✅ 5/5 | ✅ | ❌ d rev 23, FOV rev 3, out 2.0 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P3 120.3 s | ✅ | ✅ 2 | ✅ 4/5 | ✅ | ✅ d rev 1, FOV rev 2, out 0.5 m/s, 4°/s | ✅ |

## Athens
| race | | picked | finished | stuck | walls | rivals | fly/sink | camera | errors |
|---|---|---|---|---|---|---|---|---|---|
| Race · Akropolis | before | ✅ | ✅ P4 119.8 s | ✅ | ✅ 8 | ✅ 7/7 | ✅ | ❌ d rev 2, FOV rev 3, out 1.2 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P2 117.3 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ✅ d rev 1, FOV rev 1, out 0.3 m/s, 3°/s | ✅ |
| Race · Syntagma | before | ✅ | ✅ P5 101.6 s | ✅ | ✅ 4 | ✅ 7/7 | ✅ | ❌ d rev 16, FOV rev 4, out 2.0 m/s, 126°/s | ✅ |
|  | after | ✅ | ✅ P4 100.7 s | ✅ | ✅ 8 | ✅ 7/7 | ✅ | ❌ d rev 1, FOV rev 1, out 2.6 m/s, 26°/s | ✅ |
| Race · Kifisias | before | ✅ | ✅ P2 133.8 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ❌ d rev 2, FOV rev 2, out 1.2 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P8 144.6 s | ✅ | ✅ 8 | ✅ 7/7 | ✅ | ✅ d rev 2, FOV rev 3, out 0.5 m/s, 4°/s | ✅ |
| Race · Kallimarmaro | before | ✅ | ✅ P2 127.2 s | ✅ | ✅ 0 | ✅ 5/7 | ✅ | ❌ d rev 1, FOV rev 4, out 1.1 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P3 130.3 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ✅ d rev 1, FOV rev 1, out 0.6 m/s, 7°/s | ✅ |
| Race · Coast Rally | before | ✅ | ✅ P8 81.1 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ❌ d rev 58, FOV rev 3, out 1.7 m/s, 58°/s | ✅ |
|  | after | ✅ | ✅ P8 87.1 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ❌ d rev 2, FOV rev 2, out 3.7 m/s, 38°/s | ✅ |
| Cup · round 1 | before | ✅ | ✅ P6 142.2 s | ✅ | ✅ 0 | ✅ 7/7 | ✅ | ❌ d rev 27, FOV rev 3, out 1.5 m/s, 93°/s | ✅ |
|  | after | ✅ | ✅ P3 141.6 s | ✅ | ❌ 16 | ✅ 7/7 | ✅ | ❌ d rev 1, FOV rev 2, out 3.1 m/s, 32°/s | ✅ |
| Time trial · Akropolis | before | ✅ | ✅ 110.9 s | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 3, FOV rev 4, out 1.8 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ 111.7 s | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 1, FOV rev 1, out 2.3 m/s, 25°/s | ✅ |
| Zone · Akropolis | before | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 13, FOV rev 3, out 1.4 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 1 | ✅ — | ✅ | ❌ d rev 1, FOV rev 2, out 1.3 m/s, 16°/s | ✅ |
| Arena · Akropolis | before | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 2, FOV rev 4, out 2.8 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ✅ d rev 1, FOV rev 2, out 0.3 m/s, 3°/s | ✅ |
| Derby · Akropolis | before | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ❌ d rev 2, FOV rev 4, out 1.0 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 1, FOV rev 2, out 1.5 m/s, 14°/s | ✅ |
| Crash Jct · Akropolis | before | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 3, FOV rev 4, out 1.8 m/s, 52°/s | ✅ |
|  | after | ✅ | ❌ | ✅ | ✅ 0 | ✅ — | ✅ | ✅ d rev 0, FOV rev 1, out 0.1 m/s, 2°/s | ✅ |
| Daily | before | ✅ | ✅ | ✅ | ✅ 8 | ✅ — | ✅ | ❌ d rev 22, FOV rev 3, out 3.3 m/s, 93°/s | ✅ |
|  | after | ✅ | ✅ | ✅ | ✅ 0 | ✅ — | ✅ | ✅ d rev 1, FOV rev 2, out 0.5 m/s, 5°/s | ✅ |
| World · PAPPAS | before | ✅ | ✅ P2 135.7 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 22, FOV rev 3, out 1.3 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P2 131.4 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 2, out 0.2 m/s, 2°/s | ✅ |
| World · LAMBROU | before | ✅ | ✅ P1 114.7 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 26, FOV rev 2, out 1.5 m/s, 143°/s | ✅ |
|  | after | ✅ | ✅ P1 110.7 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 2, out 0.2 m/s, 2°/s | ✅ |
| World · KOSTA | before | ✅ | ✅ P2 143.5 s | ✅ | ✅ 5 | ✅ 1/1 | ✅ | ❌ d rev 23, FOV rev 3, out 1.8 m/s, 93°/s | ✅ |
|  | after | ✅ | ✅ P1 137.6 s | ✅ | ✅ 1 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 2, out 0.6 m/s, 4°/s | ✅ |
| World · VLACHOS | before | ✅ | ✅ P1 114.3 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 4, FOV rev 2, out 1.7 m/s, 144°/s | ✅ |
|  | after | ✅ | ✅ P2 109.7 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 1, out 0.2 m/s, 2°/s | ✅ |
| World · ANTONIOU | before | ✅ | ✅ P1 149.6 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 28, FOV rev 2, out 1.6 m/s, 93°/s | ✅ |
|  | after | ✅ | ✅ P2 147 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 2, out 0.3 m/s, 3°/s | ✅ |
| World · GALANI | before | ✅ | ✅ P1 157.6 s | ✅ | ✅ 0 | ✅ 1/1 | ✅ | ❌ d rev 22, FOV rev 3, out 1.6 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P1 155.8 s | ✅ | ✅ 1 | ✅ 1/1 | ✅ | ✅ d rev 1, FOV rev 1, out 0.5 m/s, 4°/s | ✅ |
| World · DRAKOS (boss) | before | ✅ | ✅ P2 119.1 s | ✅ | ✅ 1 | ✅ 4/5 | ✅ | ❌ d rev 25, FOV rev 3, out 1.9 m/s, 92°/s | ✅ |
|  | after | ✅ | ✅ P2 115.3 s | ✅ | ✅ 0 | ✅ 4/5 | ✅ | ✅ d rev 1, FOV rev 2, out 0.3 m/s, 3°/s | ✅ |

Totals (all columns ✅): before 1/42, after 25/42.
