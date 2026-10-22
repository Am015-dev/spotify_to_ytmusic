# Nightrun consolidation plan (freeze + consolidate, 21 Oct 2026)

Owner: "the source code is like a labyrinth nobody can debug". This plan changes NO code: layers, dead and competing code,
~25 modules, refactor order. Gate for every step: `bash games-src/nightrun/smoke.sh` green AND
`fingerprint-test.js` unchanged (or changed only where the step says so and the owner said yes).

Numbers: `python3 games-src/nightrun/layer-scan.py <cov.json>` (cov.json = `COVER=<file> FRAMES=3600 node fingerprint-test.js`) + a read-only knob audit.

## 1. Headline

- 103 part files concatenated in `parts/build.py` order. 60 parts carry a flag: 70 flags default ON, 2 default OFF
  (`build2` choices.js, `fleetArr` fleet.js), `comfort*` code-only.
- 72 parts patch a global another part owns: 322 wrap/patch targets (lower bound; the scan only counts saved-and-replaced globals).
  Most wrapped: `drawPickups` x13 (an "extra layer" hook), `DMG.hit` x9, `drawEnemy` x8, `DIR.spawnOne` x5,
  `PW.give`/`PW.draw`/`SH.volley`/`drawPlayer`/`gaDraw` x5, `spawnBoss` x4 (athens, fair, armour, density), `ABIL.draw`/`ABIL.gain` x4.
- 25 function names defined twice (10 parts: c, saga x7, saves x4, feedback x3, hub, title, fs, stats, foot, footen); most are IIFE-local
  name reuse, c.js `loop/render/start` and hub/title `draw` are real overrides.
- Coverage of a 9-minute seeded drive (7 fly scenarios x 60 s + street 120 s, 1280x720): **1360 of 2967 named functions (45%, 397 KB) never ran.**
  UI screens are not driven, so UI parts read as dead; gameplay parts are the real candidates.

## 2. Layer inventory (flag | part | what it overrides/wraps | decision)

**DEL-OFF** = permanently ON: delete the `?x=0` path + the flag-off half of its test. **KEEP** = player/platform setting. **OWNER** = default OFF, owner decides.

| flag | part (= same name) | overrides / wraps | decision |
|---|---|---|---|
| sprites,title,type,assist,juice,pwa,fever (+11 code-only) | ret | DP.*, RET.* hooks; 81 RET reads | split (step 5); assist, pwa KEEP; rest DEL-OFF |
| flavor | = | PW.draw, RET.resultRow, drawPickups | DEL-OFF |
| foot, footstage, streetlook | foot*, streetlook | footen `walk`, foot `build` re-defined | DEL-OFF |
| leak | = | DIR.miniDown, DIR.spawnOne, DMG.pass, HUDX.strip, drawEnemy | DEL-OFF |
| zoo | = | DIR.spawnOne, drawEnemy, drawPickups | DEL-OFF |
| vary, vary2 | formations, stagescripts | DIR.barLine/energy/pickTheme/spawnOne, LEAK.gndOK, ST.label | DEL-OFF |
| remix, variants | = | FM.make/piece, VARY.idx/plan; VAR.* | DEL-OFF |
| scale, scale2, mustmove, strike2, scale3 | scale, fair, hard | SC.hpK (twice), spawnBoss, SH.steer, SH.volley, DMG.hit/pass | DEL-OFF, then merge (4.2) |
| pw2, pw3, powers | powerups, powlevels, arsenal | PW.give/draw/glyph/hud/chips/pick, SH.absorb/volley | DEL-OFF, merge powers |
| flow, musicpack | = | SH.pit/tick, NRF.pit; AU.sting, DP.boss/endless/have/pick/pool | DEL-OFF |
| story, tale | storydata, tale, saga | saga re-defines adv/close/openLog/drawLog/paint (tale) | DEL-OFF, merge tale into saga |
| stats, feedback | = | RET.stats/dailyShow/feedback | DEL-OFF |
| labassets, labfull | = | LAB.register, LA_.tabs, +16 | DEL-OFF |
| hint, hintdiet | uikit | - | DEL-OFF |
| react, boss2, reward | react, armour, reward | DMG.hit x2, DMG.pass, spawnBoss, bossBeat, drawPlayer | DEL-OFF |
| build2! | choices | DMG.hit, S3.cap, SH.close, WP.gain | OWNER (off since it landed: delete) |
| bossmoves, bossvis | = | drawBoss, drawHUD, drawHUDP | DEL-OFF |
| abil, abup, counter, timing, classes | abilities + = | ABIL.draw/gain/emp/refill/dashIn, CTR.dash, SH.cellOn/dmk | DEL-OFF |
| forge, forgeui | forge, inventory, forgeui | CHO.apply/offer, WP.hit/mod/drawWorld, INV.draw, gaDraw | DEL-OFF |
| vis, grit, gritBoss, density | visible, grit, density | VIS.life, ABIL.rings, DMG.hit, spawnBoss, RET.asWinMs | DEL-OFF, then merge (4.2) |
| bossfit | bossplay | BMV.beat/tel, bossBeat | DEL-OFF |
| rules, anticamp, holdline, pacing, bite | = | CTR.*, MM.win, LEAK.leak/es, DIR.spawnOne, ST.setLevel x2 | DEL-OFF, then merge |
| flankers | = | drawEnemy, drawPickups | DEL-OFF (WHERE: ON) |
| foeart | = | ART sheet pick | DEL-OFF |
| fleet, fleetArr! | fleet | DIR.spawnOne (outermost), ZOO.block, DMG.hit/pass | fleet DEL-OFF; fleetArr OWNER |
| endramp | = | DIR.pool/tierv/barLine/pickTheme, RU.idx, swaps DF | DEL-OFF |
| legend (ON since 8fbed30) | = | mutates DIFFS.legend, SC.hard, TUNE.dm, BMV.init, CTR.tick | DEL-OFF + bake LEG.DF into DIFFS |
| deck, roster, songspread | fun | DIR.barLine, drawPickups | DEL-OFF |
| lessons | = | startStory, openGarage, WP.show | DEL-OFF |
| cp, fs, read | cp, fs, readable | RET.assistRun/payClear/resultRow, drawHUD; FXV.bullets, FXW.* | cp, read DEL-OFF; fs KEEP |
| econfit | = | RET.wk/tk x1.05 | DEL-OFF, fold the factor into the prices |
| comfort* | comfort | PW.hud, drawEnemy | KEEP (eye-strain setting) |
| saves, stamp, polish, hub | = | RET.SV/save; ART.hue/pic/put, READ.pc +7; RET.titleDraw, gaDraw | DEL-OFF |
| (no flag) | athens*, ai, meta, shapes, g, wpx, lab, tut, h, upgrades, up2, strategy | spawnBoss, drawBG*, draw*, SH.*, PW.*, WP.* | inline (step 3) |

### 2b. Layers added since 21 Oct (22 Oct 2026 scan; all default ON unless noted; none has a Nightrun test-free path)

| flag | part | what it does | default | decision |
|---|---|---|---|---|
| explain | explain | every visual explained: captions, EXP.TXT | ON | DEL-OFF (explain-test needs `&nocaps=0` to see captions: rework first) |
| exp10 | explain | review-10 captions (wrapped, off the HUD, pause list) | ON | DEL-OFF with explain |
| nolist | explain | the pause-screen text list is hidden (list code is now dead) | ON | DEL-OFF + delete the list block |
| legible | legible | bullets/pickups/foes readable: halo, core line, dim; wraps drawEnemy, READ.dim/bullets, SPR.foe, PW.pickup | ON | DEL-OFF (many refs in art, bg, draw, foeart, readable) |
| calm | calm | one banner chip per rule, boss tags, no ready-chip over a boss | ON | **removed (batch 1)** |
| nocaps | nocaps | no stage captions while playing | ON | KEEP for now: explain-test and others open `&nocaps=0` as a mode |
| waves | waves | stages 1-6 play named waves | ON | **removed (batch 1)** |
| bandclear | bandclear | nothing rests under the portrait score strip | ON | **removed (batch 1)** |
| zonehint | zonehint | one caption for the purple dashed zone circles | ON | **removed (batch 1)** |
| school, schoolfull | school, schoolfull | Flight School drills; full 3-round version | ON | KEEP: lessons-test and school-test run `&schoolfull=0` as their fast mode |
| diet | diet | caps on objects per frame, no wide rings | ON | **removed (batch 1)** (diet-test still compares against `?diet=0`: needs a fixed budget instead) |
| menufix | menufix (+ret, stats, map) | hangar 5 tabs + MORE, no decoration glyphs | ON | **removed (batch 2)** |
| first30 | bossvis (+b, draw, bossmoves, bossplay, density, saga) | first 30 s of stage 1, boss visuals (24 refs) | ON | DEL-OFF later (24 refs, 3 tests) |
| footq | footq (+art, footart, footstage) | on-foot canvas scale/quality | ON | **removed (batch 2)** |
| bulletart | bulletart (+readable) | painted bullets | ON | **removed (batch 2)** |
| layout, layoutStrip! | layout | portrait layout; `strip=1` is default OFF | ON / OFF | layout DEL-OFF later; layoutStrip OWNER |
| tidy | tidy (+streetlook) | Settings page tidy, street hook | ON | **removed (batch 2)** |
| mix | mix | audio mix graph, compressor, voice caps | ON | **removed (batch 2)** |
| calmsfx | mix | no PERFECT sting | ON | DEL-OFF later |
| hudband | formations | portrait HUD band keeps formations clear | ON | DEL-OFF later |
| garagefix, easy2, pwrclear | hub, legend, abup | small fixes | ON | DEL-OFF later |
| stay | - | NOT merged (no flag, no part in the tree) | - | nothing to do |

Also removed in batch 3 (older layers): roster (fun/dir), strike2 and scale2 (fair, hard), boss2 (armour), stamp.
**Test-mode flags that must be reworked before they can go:** deck, mustmove, songspread, vary, vary2, variants, remix (fleet-, fun-, zoo-, sprites-, ret-dpool-test open them as `=0` to get the old deterministic spawns), schoolfull, nocaps, react, reward.

**Baselines (22 Oct 2026, 09:45 UTC, before DEL-OFF):** `fingerprints.json` re-baselined (3 identical runs, 8/8). `node qa/simhunt.js` (285 runs, 76 issue kinds, 0 page errors, 2 severe kinds): **simhunt is NOT run-to-run deterministic** (real-time wobble: two baseline runs gave 69 and 67 unexplained-death runs, hudband 3 and 3; per-run kill counts differ in 259 of 285 runs). Gate used: same 2 severe kinds, 0 page errors, no new kind, counts inside the 61-69 / 3-4 band.

62 default-ON flags have a test using `?x=0` ("flag off = as before"); those halves retire with DEL-OFF, the fingerprint replaces them.

## 3. Competing implementations (who wins which knob)

| knob | writers, build order | winner today | problem |
|---|---|---|---|
| DIFFS / DF | b (table), legend (Object.assign into DIFFS.legend), endramp (temp DF copy, endless only), c applySet | endramp in endless, legend's patch in story | the table is mutated at load; endramp's ramp target reads the patched value |
| enemy hull | b en(): hpD x ST.eh x UPS.hp x AI.hpK x SC.hpK; grit wraps SC.hpK; fair wraps SC.hpK again; scale SC.hard; novelty x1.5-x4; ai leader x3.5 | **pacing** caps hp to N hits at spawn | grit/novelty/ai boosts are silently cut by the pacing cap |
| boss hp | fair x(1+.3f)x.7, hard x S3.bK (Hard+), armour x B2X.HK; each resets b.floor | armour (last spawnBoss wrapper) | three multipliers + three floor resets |
| spawn gate | DIR.spawnOne wrapped by pacing, zoo, leak, stagescripts, fleet | fleet (outermost) | two crowd caps (pacing, zoo CAP) both defer waves |
| bullet speed | b bsM = DF.bs x DIR.bsK x UPS.bs x STILL.bk; ai clamps to BCAP | product | 4 multipliers, no owner |
| heal / drops | b healK; bite x.7 (Normal st>=6); legend heal 0; endramp ramps DF.heal; zoo + anticamp own drop tables | product | heal is cut in 3 places, 2 tables bypass DF.heal |
| hull mercy | visible (Normal hull 5 from st 10), grit mercy, legend cap +1, bossplay absorb | each its own | 4 rules for one idea |

## 4. Proposed module map (25 modules, every part in exactly one)

| folder/module | parts |
|---|---|
| core/engine | a, b, h, c (loop, render, start; test API moves out) |
| core/flags | ret (flag table half) |
| core/director | dir, remix, pacing |
| audio/music | songs, flow, lagfix, musicpack |
| art/sprites | art, arthooks, foeart, shapes |
| art/backdrop | bg, draw, athens2 |
| art/effects | fx, fxwave, readable, polish, comfort |
| fly/enemies | zoo, variants, react, ai, flankers, visible |
| fly/formations | formations, stagescripts, fun, rules, novelty |
| fly/difficulty | scale, fair, hard, grit, density, bite, endramp, legend, anticamp, holdline, leak |
| fly/boss | armour, bossmoves, bossvis, bossplay |
| fly/fleet | fleet |
| fly/weapons | g, wpx, forge, choices |
| fly/powerups | power, powerups, powlevels, arsenal |
| fly/abilities | abilities, abup, counter, timing, classes |
| foot/engine | footen, foot |
| foot/stage | footstage, streetlook, footart |
| ui/hud | hud, uikit |
| ui/home | hub, title, map, fs |
| ui/garage | inventory, forgeui, meta |
| meta/economy | garage, shop, upgrades, up2, perks2, strategy, paths, econfit |
| meta/story | story, storydata, tale, saga, athens, cp |
| meta/retention | ret (retention half), stats, feedback, saves, stamp |
| meta/tutorial | tut, lessons |
| tests-support/lab | lab, labassets, labfull (+ the `window.__mnr` test API from c.js, + sw/head.html stay in parts/) |

## 5. Dead code candidates

Gameplay parts with unrun functions (never ran / named): ret 85/134 (DP.boss, DY.pay, HEAT.bind), formations 74/121 (fmHover, fmSeg), rules 50/87,
bossmoves 32/55 (BMV.clear/cost/goal/guard/rayBlock), g 38/74 (DEMO, PW.blast), strategy 22/44, forge 27/41, wpx 27/34, athens 7/8 + athens2 5/7
(district not driven), bg 13/16 (portrait `buildBGP/drawBGP`; the drive is landscape). UI-only, need a crawl: labfull 55/55, labassets 37/39,
lessons 87/94, tut 64/67, forgeui 16/17, inventory 11/12, map 12/15, saga 41/50. Delete a function only if unrun in the drive AND a UI crawl
(portrait + landscape). choices.js (`build2`) and `fleetArr` are dead in the shipped game.

## 6. Refactor order (smallest risk first; each step = one commit = one rollback point)

| # | step | gate | estimate | rollback |
|---|---|---|---|---|
| 0 | FREEZE: in-flight workers land; re-baseline `fingerprints.json` once, owner OK | smoke green | 15 min | - |
| 1 | DEL-OFF batch per module (about 8 batches of 5-10 flags): remove `RET.x=!/[?&]x=0/`, the `if(!RET.x)` early-outs and the flag-off halves of its tests; WHERE/MODULES regenerate | fingerprint IDENTICAL (on-path untouched) | 8 x 30 min | revert the batch commit |
| 2 | OWNER calls: delete choices (build2) and fleetArr, or ship them; legend: bake LEG.DF into DIFFS | identical for delete; approved change for ship | 30 min | revert |
| 3 | INLINE WRAPPERS into owners, one target per commit, order kept: drawPickups (13) -> a hook list `DRAW.extra[]`; DMG.hit (9) -> `DMG.mods[]` in build order; drawEnemy (8); DIR.spawnOne (5); spawnBoss (4); PW.give/draw/glyph; SH.volley; ABIL.* | identical | 10 x 30 min | revert that target |
| 4 | MERGE same-topic layers: one DIFFICULTY table + `resolve(stage,wave)` (b DIFFS, legend, endramp, bite heal, ai aq); one `hullK()` (grit, fair, scale, novelty, ai leader; pacing cap the only clamp); one `BOSS.hp()` (fair, hard, armour); one spawn gate (pacing + zoo caps); one MERCY table (visible, grit, legend, bossplay) | identical first (pure move); a cleanup that removes the hidden pacing cap cancellation = explicit fingerprint change, owner approves with a bot table | 6 x 45 min | revert |
| 5 | SPLIT the two grab-bags: ret.js (flag table / retention features), g.js (power-up levels / buttons / test checklist), c.js test API -> tests-support | identical | 3 x 30 min | revert |
| 6 | MOVE FILES into the folders of section 4; build.py reads one ordered module list | built html byte-identical except `__STAMP__` (stronger than the fingerprint) | 45 min | revert the move commit |
| 7 | DEAD CODE: delete functions unrun in drive + UI crawl, one module per commit | identical | 6 x 20 min | revert |

About 20 worker-hours.

## 7. Safety harness

- `fingerprint-test.js` (new): 8 scenarios: fly stage 2/6/10/14 Normal, a boss (arcade district 1, forced), endless wave 10, Legend stage 10,
  street run sections 1-3 (`zeil`, fixed-rule bot, hp floor 4 so it reaches section 3). Every 60 frames: time, ship x/y/hp, score, spawns,
  every enemy (type, x, y, hp), enemy bullets (count + position sum), boss hp, RNG draws -> one sha1 per scenario. Plus a draw fingerprint
  (drawImage count per sprite key and per log2 destination size bucket on one frame every 600) with no pixels read.
- Stable: 3 runs (2 in one process, 1 separate) gave identical fingerprints for all 8; `Q='&grit=0'` changes them (it sees a change). 45 s.
- Fixed nondeterminism: Math.random (seeded, draws counted), performance.now/Date (virtual clock, 1/60 s per frame), rAF (fired only by
  the drive), localStorage (fresh context), build stamp (pinned), image decode (awaited), service worker (blocked). None known to remain.
- Re-baseline (`UPDATE=1`) only at step 0 and on owner-approved behaviour changes.

## 8. Tests: smoke vs full

Smoke (`smoke.sh`): fingerprint, hud-cover, ui-align (core screens) at 390x763 / 375x553 / 844x390, hub (390x763), story, sprites, labfull.
FULL (nightly): the other ~95 `*-test.js` (bot balance suites, per-part feature tests) + `scripts/*.spec.js`, full ui-align and hub sizes.
