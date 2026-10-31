# Nightrun orchestrator handoff

Written 20 Oct 2026 on `alex/brave-carson-rbpmlk` at `1046ffe`. Read this, then `CLAUDE.md`. Items marked **(not in repo)** come from the brief that asked for this file and could not be checked against any file here.

## 1. State

- Mainhattan Nightrun (`games-src/nightrun/`), built by `parts/build.py` into `games/mainhattan-nightrun/index.html` + `sw.js`. Run-and-gun on the song beat: 40 story stages in 5 districts (8 each) + 5 challenge stages, painted route map, LAB test menu.
- Latest strict review: **45.9 / 100** (`REVIEW-STRICT-4-2026-10-20.md`). Earlier: 43.7 (review 3), 39.0 (18 Oct). Industry audit on `d84a923`: **21 PASS / 8 FAIL / 3 SKIP, 3 hard FAILs: S13, S15, S23** (`INDUSTRY-STANDARDS.md`).
- Owner complaints (review 4, section 3):
  - a. enemies die before seen: FIXED (0/210 killed unseen; shortest median life 1.53 s).
  - b. predictable enemies and bosses: PARTLY (stage Jaccard 0.62 -> 0.32; boss gates OFF).
  - c. DASH and EMP useless: PARTLY (97% of dashes are reflexes; EMP 0 per minute on the default build).
  - d. dash goes the wrong way in portrait: FIXED.
  - e. repetitive: PARTLY (repeat 82%, gate 75; 30 min with no new mechanic, gate 15).
  - f. weapons screen overlap: FIXED.
  - g. easy on Normal: **NOT FIXED and inverted**: no-oracle first-try clear 20%; with the oracle 83-92%.
  - h. bosses / creativity: PARTLY (boss mechanics exist, default OFF).

## 2. Feature flags

Default ON unless marked OFF. Off switch is `?<flag>=0` in the URL, except where marked. Defined in `parts/*.js` as `if(RET.x===undefined)RET.x=!/[?&]x=0/.test(location.search)`.
Test column = test file and its status in `TEST-LEDGER.md`: P PASS, F FAIL, Fl FLAKY, NR NOT-RUN, - not in ledger.

| Flag | File | What it does | Test (ledger) |
|---|---|---|---|
| rules | rules.js | new mechanic every 3 stages, returns with a twist | rules-test - |
| remix | remix.js | each run plays a different seeded cut of the stage script | remix-test - |
| variants | variants.js | one enemy, many looks (size, reversed) | variants-test - |
| forge | forge.js, inventory.js | weapon forge: combine, sockets, presets | forge-test F |
| density | density.js, dir.js | budget of enemy bullets on screen per stage | density-test - |
| react | react.js | enemies react to the ship, not fixed paths | react-test P |
| vis | visible.js | enemies live long enough to be seen and fought | visible-test - |
| grit | grit.js | slower EMP meter, tougher varied enemies | grit-test - |
| anticamp | anticamp.js | parked ship gets graded, readable pressure | anticamp-test - |
| strike2 | fair.js:67 | must-move strike follow-up (see file header) | none |
| mustmove | fair.js:62 | a ship that stays still gets a column strike | mustmove-test P |
| abil | abilities.js | DASH charges and EMP as abilities | abil-test P |
| counter | counter.js | threats that make DASH and EMP the answer | counter-test Fl |
| timing | timing.js | DASH/EMP need beat and window (default ON in code) | timing-test F |
| reward | reward.js | graze chain multiplier: risk pays | reward-test F |
| bossplay | bossplay.js | boss encounter mechanics. **ON** (bosses/bossplay.js:20 ships it on); `?bossplay=0` turns off | bossplay-test P |
| build2 | choices.js | build pressure and real choices. **OFF**; `?build2=1` turns on | choices-test P |
| deck | fun.js | replaces the fixed WEAVE / FENCE / DROP metronome | none |
| hintdiet | uikit.js:62 | a hint shows at most N times per ask | none |
| roster | fun.js -> dir.js | per-district enemy roster | variants-test (mentions) |
| vary | formations.js, stagescripts.js | formation library + stage scripts (VARIETY A) | vary-test NR |
| vary2 | formations.js:253 | second layer of vary; needs vary ON | none |
| songspread | fun.js, story.js | spreads song picks across stages | none |
| flankers | - | **not a flag.** Flanker kinds exist in formations.js | - |
| tale | tale.js | story cast, beats, STORY LOG | tale-test P |
| stats | stats.js | counters, 30 achievements, completion % | stats-test P |
| cp | cp.js | checkpoints with grace on long stages | ret-cp-test P |
| fs | fs.js | phone full screen (first tap) | fs-test P |
| feedback | feedback.js | FUN / SAME AGAIN / BORING tap at run end | feedback-test P |
| flavor | flavor.js | run-and-gun flavour for the shooter | ret-flavor-test P |
| foot | foot.js | on-foot street stage | foot-test P |
| footstage | footstage.js (+ hooks in foot.js) | the finished on-foot stage `zeil`: 7 sections + Warden relay gate, 5 new foot enemies (jetpack, hound, flamer, ninja, medic), checkpoints per section, progress bar, mercy; `?footstage=0` = the street1 mock exactly | footstage-test P |
| boss2 | armour.js | boss damage cap, HP phases, last stand | boss2-test P |
| bossmoves | bossmoves.js | boss movesets (VARIETY B) | bossmoves-test P |
| bossvis | bossvis.js | bosses look different per phase | bossvis-test P |
| scale / scale2 / scale3 | scale.js, fair.js, hard.js | power-aware enemy hull, rounds 1-3 | scale-test P, scale2-test P, scale3-test F |
| pw2 | powerups.js | six music-tied powers + drum burst | ret-pw2-test F |
| pw3 | powlevels.js | power-up levels + 5 new shooter powers | ret-pw3-test F |
| powers | arsenal.js | 12 more power-ups (defensive, offensive, utility, risky), context picker, max 2 timed + 1 stored charge | powers-test - |
| read | readable.js | bullets and threats readable at a glance | readable-test F |
| zoo | zoo.js | time to kill + 8 enemy kinds | zoo-test NR |
| fleet | fleet.js | enemy ships in the fly stages: interceptor 6+, bomber 10+, carrier 16+, cruiser 22+ (single -> pair -> mixed) | fleet-test P |
| leak | leak.js | ground enemies, calmer pacing, escape penalty | ret-leak-test F |
| fever | ret.js | FEVER meter: score x1.5 while on | ret-fever-test F |
| title / type | title.js (`?title=0`, `?type=0`) | title diet; 14 px text, 44 px touch targets | ret-title-test P |
| hint | uikit.js (`?hint=0`) | painted hint bubble | hint-test P |
| labassets | labassets.js (`?labassets=0`) | LAB ASSETS tab | labassets-test P |
| assist / juice / pwa | ret.js (`?assist=0` etc.) | Assist mode; juice caps; service worker | ret-assist P, ret-juice P, ret-pwa P |
| arcade, daily, dpool, grade, heat, layers, oneMore, saveio, sting, trans, walls | ret.js, a.js, b.js, story.js | **no query switch**: set `RET.x=false` in code. Arcade length, daily run, district song pools, grade stars, Heat ladder, music layers, ONE MORE RUN, save backup, stingers, transitions, walls (BALANCE.md "Walls") | ret-arcade P, ret-daily F, ret-dpool F, ret-clear -, ret-heat F, ret-music P, ret-test P, ret-saveio P, ret-trans P, ret-walls F |

Key rule: a feature shipped OFF is not measured. Review 4 found `bossplay` and `build2` OFF with no gate passed (since then `bossplay` shipped ON, bosses/bossplay.js:20; W267 corrected the table).

## 3. Tests

- Run one at a time, never in parallel: `NODE_PATH=$(npm root -g) node games-src/nightrun/<name>-test.js`. Ledger rule: one test at a time, 10-minute cap, a failing test reruns once.
- `TEST-LEDGER.md` was generated at `f696692` (older than HEAD). Its table reads 41 PASS / 17 FAIL / 2 FLAKY / 6 NOT-RUN, but its totals line says 20 / 4 / 40. Trust the table and re-run.
- FAIL: afk-test (bot died at 43.5 s), forge-test, fun-test (obsolete expectations), hud-cover-test (missing `/tmp/nr.html`, environment), readable-test, ret-daily-test, ret-dpool-test, ret-fever-test, ret-flow-test, ret-heat-test, ret-leak-test, ret-pw2-test, ret-pw3-test, ret-walls-test, reward-test, scale3-test, timing-test (42% vs <= 40%).
- FLAKY: audio-test (obsolete: rewrite against the current beat grid), counter-test.
- NOT-RUN: ui-align, ui-weapons, vary, wcard, weapon, zoo.
- Not in the ledger at all: anticamp, density, grit, remix, rules, variants, visible. Run them before relying on them.
- No FAIL was bisected by flag (ledger caveat), so the cause of each FAIL is unknown.
- Industry gate: `NODE_PATH=$(npm root -g) node games-src/nightrun/industry-audit.js --gate` (about 5 min, exit 1 on any hard FAIL). `--quick` (about 1 min) is for development only.
- **Gate set before any push** (`build-all.py` has no Nightrun entry, checked: 0 references, so Nightrun is built by its own script):
  1. `python3 games-src/nightrun/parts/build.py`: rebuilds the game and `sw.js`, and runs `stamp-copyright.py` itself.
  2. `python3 games-src/scripts/guard.py` must pass.
  3. The test for each flag the change touches, one at a time, plus `hud-cover-test` and `mount-test` for any HUD change.
  4. `industry-audit.js --gate` for any balance or shared change.
  5. `phone-check.js` covers published games; Nightrun coverage is **not verified**. Check the phone size by hand with the `?scn=` scenarios.

## 4. Worker playbook

- Brief: `games-src/BRIEF-TEMPLATE.md` (about 60 lines: owner quote, tier, task, rules, read-less, reporting). For parallel work on this game, copy `games-src/nightrun/BRIEF-FOOT.md`: it holds the shared API contract, one part file per worker, one `build.py` line each.
- Model tier: always set it. Top tier for design and feel; mid tier for tuning, bugs, research; small tier for mechanical chores. Review 4 assigns these to tasks 1-5 in section 5.
- Concurrency: **owner approved 5 workers for Nightrun on 18 Oct** (`BRIEF-FOOT.md`). `CLAUDE.md` (14 Oct) says at most 3. The brief for this handoff asks for 5 workers plus 1 reviewer **(not in repo)**. Confirm the number with the owner before going above 3.
- Costs **(not in repo; from the brief)**: top-tier worker about $5, mid-tier about $1.8, small-tier about $0.4, reviewer about $2-3, orchestrator about $54.
- Reporting: a worker's last action is `create_trigger` with `persistent_session_id` = orchestrator session, `run_once_at` = now + 1 min, prompt `[DONE <id>] <5-line report>` (`BRIEF-TEMPLATE.md`, `BRIEF-FOOT.md`).
- Merge, build, push: `git fetch origin alex/brave-carson-rbpmlk && git merge origin/alex/brave-carson-rbpmlk`; build.py; guard.py; `git add <explicit paths>`; `git diff --cached --stat`; commit; `git push -u origin alex/brave-carson-rbpmlk`. Never force-push. On a conflict in `build.py` or a built file, keep both sides and rebuild.
- What went wrong:
  - Tests ran in parallel and loaded the box (ledger: one at a time).
  - Workers went idle asking "which do you want?": 6 of 15 never reported (`BRIEF-TEMPLATE.md`).
  - Features shipped OFF and were never measured (`build2`; `bossplay` has since shipped ON).
  - Concurrent edits to `build.py` and built files (`BRIEF-FOOT.md`).
  - Same feature rebuilt 3-4 times, and per-tick deploys **(not in repo)**.

## 5. Open tasks, priority order

1. **Grade the strike** (top tier, design and feel): no-oracle bot >= 55% on Normal. Complaint g; hard FAIL S23 (review 4 task 2).
2. **Anti-camp**: `anticamp.js` exists, default ON, not in the ledger. Gate: camper <= dodger - 25 points (review 4 task 3). Run anticamp-test and reward-test (F) first.
3. **Boss gates**: `bossplay` (now ON in the code, W267 doc fix; the 2x gate was never met) was to stay OFF until ignoring a boss costs >= 2x. Measured 1.0-1.6x (review 4 task 4). `bossplay-test` passes but is not the gate.
4. **Audit and test fixes**: audit S24 contacts, S31 time lock, reward-test NaN score (review 4 task 5). Without them the gates lie.
5. **Hour-3 repetition**: S13 0.82 (gate < 0.75); S15 30.2 min (gate <= 15). `remix` and `rules` are ON; re-measure on a fresh audit.
6. **Timing**: review 4 task 1 (flip `RET.timing` ON) is already done in code. `timing-test` still FAILs.
7. **Test triage**: 17 FAIL rows; rewrite fun-test and audio-test; re-run the ledger on HEAD.
8. **Forge balance**: forge hybrids out of balance (review 4); forge-test FAIL.
9. **Owner list items not found in the repo** (**not in repo**): W12 phone bugs, W31 test triage, W32 human-bot retune, W34 asset list, W35 flankers, S16 new things after minute 150. Ask the owner what each ID means. Assets: `ASSETS-NEEDED.md`, `assets-manifest.json`.

## 6. Hard rules (`CLAUDE.md`)

- Never write an original game's, publisher's or designer's name in the repo or on the site.
- No model names, Co-Authored-By, Claude-Session or other AI attribution in files, commits or PRs.
- Don't edit Mainhattan Overdrive. Nightrun belongs to the orchestrator. The game on hold stays on hold.
- Never force-push. `git add` explicit paths only. Fetch and merge before every push.
- `stamp-copyright.py` runs inside build.py; run it by hand on any other deployed copy.
- A blocked command: stop and tell the owner. Never wait for an answer.
- No screenshots for anyone to look at. Pixel baselines are a machine gate only.
