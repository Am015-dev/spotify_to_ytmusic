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

## Lane log (OD 315–325)
Model and status come from the session list. Cost is blank: the session list does not report it. Status for OD 315–319 is the outcome from `docs/COST_SESSIONS.csv`. For OD 320–325 it is the session state when this log was written.

| Lane | OD | Model | Purpose | Status |
|---|---|---|---|---|
| ios-r20b | 315 | Sonnet | Touch first minute: no frame > 50 ms (Athens mid-minute GC) | no fix (completed) |
| perf-r20c | 316 | Sonnet | Athens PC boot longest gap ≤ 1.17 s (pc-boot-lt) | no fix (completed) |
| test-r20d | 317 | Sonnet | Make flaky gates read the same solo and in the suite | no fix (completed) |
| ios-r20e | 318 | Opus | Frankfurt touch heap growth steady ≤ +25 MB / 30 s (Opus retry) | no fix (completed) |
| ios-r20f | 319 | Opus | REAL iPhone 17: freeze in the first 2 s after the city appears | no fix (completed) |
| telemetry-r20g | 320 | Sonnet | Automatic perf and crash reports from real phone sessions | working at log time |
| boot-r20h | 321 | Sonnet | iPhone boot 12 s → budget (throttled iPhone-like lab) | working at log time |
| bot-r20i | 322 | Sonnet | Automated bot playtester (laps, races, stuck and fall-through checks) | working at log time |
| golden-r20j | 323 | Sonnet | Golden-screenshot regression (portrait and landscape, both cities) | working at log time |
| review-r20k | 324 | Opus | Industry-benchmark feel review against LEGO 2K Drive and Forza Horizon | working at log time |
| chores-r20l | 325 | Haiku | Branch cleanup, ledger rows, fix-lane brief template (mechanical) | in progress (this lane) |
| drive-first-r22d1 | beta.145 | Sonnet | First PLAY drives, one text slot, phone HUD <=9 (gaps 4-5) | shipped beta.145 |
| terrain-flat-r22d2 | beta.145 | Sonnet | Slope cap beside roads, unstick 1.2/2.5 s (gap 1) | shipped beta.145 |
| review-17-18 | beta.145 | Opus | Reviews of drive-first and terrain | PASS |
| hud-cam-r22d3 | beta.146 | Sonnet | Camera clear + phone roam HUD-6 (gaps 6-7) | shipped beta.146 |
| core-loop-plan-r22d4 | — | Opus | Frankfurt core + one loop design plan, 8 lanes (gap 9) | done (docs) |
| rv3a-fix-r22d5 | beta.146 | Sonnet | RV3A_rows ReferenceError on player pages + no-pageerror GO | shipped beta.146 (GO weak, see review #20) |
| cl-L1-core-zone | — | Sonnet | Core loop L1: core zone behind ?cl=core | in review #21 |
| review-19-20 | beta.146 | Opus | Reviews of hud-cam and rv3a fix | PASS |
| tr9-chunk-r22d6 | — | Sonnet | Chunk TR9 slope cap at boot (fra 244 -> 14 ms steps) | in review #22 |
| cl-L2-smash | — | Sonnet | Core loop L2: smash props at any speed | working at log time |
| cl-L3-studs | — | Sonnet | Core loop L3: stud flow | working at log time |
| speed-boost-feel-r22e4 | beta.151 | Opus | Speed streaks, FOV, boost jets/flash (99sf) | shipped (#35 PASS after prewarm) |
| solid-cars r2+r3 (r22e1, r22e8) | beta.151 | Opus | Same cars on camera turn; stuck/overlap cars clear out of view | r2 FAIL #34, r3 PASS #40, shipped |
| coin-prewarm-r22e6 | beta.151 | Sonnet | Stud coin in prewarm (flag OFF) | shipped #36 |
| core-reveal-r22e7 | beta.151 | Opus | Core spawn view drawn under curtain (flag OFF) | shipped #37; core,studs flip dropped (non-link stall) |
| gk-tile-reveal-r22e9 | beta.151 | Sonnet | Outer-land ground tile prewarm: fra 6x late links 1 -> 0 | shipped #39 |
| glossy-cars-r22e5 | — | Opus | Studio env on car paint | FAIL #38 (phone washout), default OFF in beta.151 |
| glossy-cars-r22e10 | — | Opus | Glossy r2 (last lane on target) | pushed 68b2d6f, needs review |
| ath-dirt-stall-r22e11 | — | Sonnet | Street car stalls on Athens dirt | working at log time |
| reviews 34-40 | beta.151 | Opus | 7 reviews | done |
| ath-dirt-stall-r22e11 | beta.152 | Sonnet | quiet-dirt GO parks traffic (found Pedion bowl trap) | shipped #43 |
| reveal-stall-r22e12 | — | Opus | fra reveal GPU stall trace (docs/tools) | #42 finding; stall still open |
| groundtex-cache-r22e13 | beta.152 | Sonnet | groundTex cached per kind | shipped #45 (stall not fixed) |
| bughunt-x1000-r23a | beta.152 | Opus | tools/bughunt.js gate + strict report 11/100 | shipped #44 |
| traffic-in-view-r22e15 | beta.152 | Opus | no slide/teleport in view (npcPop fra 21 -> 2.7/h) | shipped #46 |
| ath-trap-r22e14 | — | Opus | Athens trap fixes behind flags (?t9e, ?bx) | #47 PASS flag-off; measuring in r2 |
| ath-trap-r2-r22e16 | beta.153 | Sonnet | fill-block colliders get roof height (no endless walls); t9e/bx stay OFF (not proven) | shipped #49; target parked |
| let-cars-climb-r22e17 | beta.153 (flag OFF) | Opus | climb window behind ?clb=1 | #48 PASS flag-off |
| climb-r2-r22e18 | — | Sonnet | clb A/B: not clean, stays OFF | docs only; target parked |
| reviews 41-49 | beta.152/153 | Opus | 9 reviews | done |
