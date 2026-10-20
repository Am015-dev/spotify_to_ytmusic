# Cost ledger: what the tokens bought (Alex, 2026-10-20)

Source: every `OD <n>` session from 14 Oct 09:00 to 20 Oct 06:19 (320 sessions, OD 3 → OD 319). Per-session rows: `docs/COST_SESSIONS.csv`.
"Fix landed" means a commit that changed game code (`src/`, not the changelog) reached trunk under that lane's name, and the lane did not report its target as missed. This is an estimate, not a count of verified bugs. 46 older sessions report no cost, so the totals are a floor.

## Totals
| | Sessions | Cost (USD) |
|---|---|---|
| All | 320 | 604 |
| Fixers | 256 | 448 |
| Reviews, releases, coordinators | 64 | 157 |
| Coordinator alone (this session, 766k context) | 1 | 43 |

## Fixers: what the spend produced
| Outcome | Sessions | Cost | Share of fixer spend |
|---|---|---|---|
| Fix landed | 118 | 222 | 50 % |
| Partial (landed, target missed) | 12 | 29 | 6 % |
| No fix (diagnosis only, missed, or abandoned) | 126 | 197 | 44 % |

| Model | Fixer sessions | Cost | Fixes landed | Cost per landed fix |
|---|---|---|---|---|
| Opus | 107 | 287 | 62 | 4.63 |
| Sonnet | 136 | 157 | 56 | 2.80 |
| Haiku | 13 | 3 | 0 | n/a |

## Where it went, by problem
| Problem | Sessions | Cost | Landed |
|---|---|---|---|
| Phone/touch memory (heap) | 39 | 53 | 20 |
| PC/phone boot and load gaps | 29 | 57 | 19 |
| Crashes (rAF errors, freed buffers) | 27 | 56 | 10 |
| Shader links / first frames | 17 | 31 | 10 |
| Flaky tests / gate tooling | 21 | 20 | 9 |

## Bottlenecks (why so much spend still left a 2-second freeze on iPhone 17)
1. **The lab does not behave like an iPhone.** Every gate runs desktop Chromium with `?lowmem=1`. It has never slowed the processor down or counted shader links the way Safari does them, so "first frames OK" was green while the real phone froze. 48 sessions ($87) went to first frames, boot and links without measuring the device that matters. There is still no iPhone telemetry: the live site sends nothing and the Beta perf db is empty.
2. **The same target was retried again and again.** The Athens phone heap ≤ 450 MB took 6+ lanes. Frankfurt heap growth and Athens boot gaps took 3–5 each. Each retry re-measured from scratch and often ended "no owner found".
3. **Flaky gates made lanes chase noise.** perf/tstream-near, the pc-post-ready-link count in multi-tag runs, the terrain "?" gap scored as 9 and order effects in ios-mem / start-life. They produced false reds that lanes spent whole sessions proving were not bugs.
4. **Opus as the default retry.** Opus did 107 fixer sessions at $4.63 per landed fix, against $2.80 for Sonnet. Haiku landed nothing in 13 tries.
5. **The coordinator ran on a huge context.** It reached 766k tokens and 164M cached reads, against the 100k rule. Every routing step re-read that context.

## Fixes (in force now)
1. **iPhone truth first.** Lane ios-r20f (OD 319) builds an iPhone-like gate: 6x CPU throttle, plus counts of shader links and uploads per frame. Its assert is perf/ios-reveal: 0 links and no long frames in the first 3 s after reveal. No build is called "smooth on phones" without it. Real iPhone reports from the Beta page outrank every lab number.
2. **Two tries per target.** After two lanes miss the same target, no third retry. One design lane (Opus) writes a plan first, or the target is dropped.
3. **Fix the gates before trusting them.** Lane test-r20d (OD 317) makes the flaky checks read the same solo and in the suite.
4. **Sonnet by default.** Opus only for a design lane or after two Sonnet misses on a reproduced bug. No Haiku on fixes.
5. **Coordinator stays small.** Hand off to a fresh coordinator at 200k context.
6. **This ledger is updated at every deploy.** Each row is a lane, its cost and its outcome.
