# Vale of Banners (W350) - handoff

Branch `shelf/W350-vale-of-banners` (not deployed). Slug `vale-of-banners`, folder `games-src/vale-of-banners/`. Build: `python3 build.py`
(one self-contained html, ~350 KB). Added to `GAMES` + `SWEEPS` in `scripts/build-all.py` and to `scripts/modmap.py`.

## What plays
- Full rules: 5 seasons x 5 rounds, 2 dice each, take / build / sell / workers, workers bend dice (6<->1 wraps), back lane for silver,
  Keeps (free action), Mines, 26 Lore tiles, 8 Buildings (no duplicate per quarter), Pastures, Barges + banner track, region and colour
  scoring by season, white die places the round's goods, end scoring. Our own estate map. Details: `rules-notes.md` (confirmed vs guessed).
- Centrepiece: the chain turn. Moot Hall (and Keeps) open a free build at once; each chained tile flies in, a gold ribbon links it to the
  last one, "Chain xN" pops and the dock shows the chain banner.
- 2-4 players, 1-3 computer stewards (easy / normal / hard) and hot-seat friends.
- Title: Story (primary), Quick game, Continue, Tutorial, How to play. Menu: Rules, Tutorial, Restart, Title, Sound, Music (+Songs picker).
- Tutorial (gx-tutor): staged first turn (take, build next to land, end turn), offered on the title, replayable from Menu/Story map.
- Story (gx-campaign): 10 chapters / 3 acts, bosses Cass Ferrow (barges), Lord Haskel (keeps), Ivo Grath (silver); seasons grow 2 -> 5,
  AI easy -> hard, twists (boss silver/workers/first, closed back lane). `campaign.json`, `CAMPAIGN-DESIGN.md`.
- Help: rules drawer, hint bulb (suggested move + why), coach bubbles on Keep / Moot Hall / Barge questions.
- Every tile can be tapped to read it large with its full text and the action buttons ("Take (die 3, 1 worker)").
- Music: gx-music slots title/main/finale/victory/defeat, silent until `games/vale-of-banners/music/<slot>-a.mp3` exist (build lists them). Synth sfx, mute.

## AI (headless, `node gauntlet.js N A B [players]`)
G7 fix (Nov 2026): new level `gentle` (greedy + wide noise) is the Quick-game default and the post-tutorial rival. gentle vs gentle 48%,
easy vs gentle 73% (avg 101 vs 82), normal vs gentle 93%. The ★ Best badges and the bulb now follow the `hard` look-ahead move
(hard vs gentle 92%, hard vs normal 67%); a player following ★ Best should beat the default. Rival turns ~2.4 s (was ~7 s), tap = faster.

| match | games | win % | avg score |
|---|---|---|---|
| hard vs first-legal bot | 100 | 100% | 151 vs 25 (after the rulebook fixes; 159 vs 26 before) |
| normal vs first-legal bot | 100 | 100% | 126 vs 23 (135 vs 28 before) |
| easy vs first-legal bot | 100 | 100% | 105 vs 30 |
| hard vs normal | 24 (40 earlier) | 88% (85%) | 154 vs 133 |
| normal vs first, 4 players | 40 | 100% | 149 vs 39 |
Spending (after fixes): hard ends with 3.8 silver / 3.0 workers, normal 7.9 / 7.2 (both count as points at the end; normal still keeps a few workers).

## Tests (all pass)
- `node rules-test.js`: 28 checks (one per tricky rule) + 300 AI games over 2-4 players: 300/300 finished, 0 stuck, 0 invariant breaks.
- `node smoke.js` (real taps, phone 390x763 touch + PC 1440x860 mouse): title -> 3 turns -> forced end -> result: PASS both.
  `FULL=1 node smoke.js`: a whole 25-round game by taps to the result screen, twice per size: PASS, 0 errors.
- `node story-test.js`: Story chapter 1 played fully by taps (won, 3 stars, progress saved) and chapter 2 started/finished, both sizes, 0 errors.
- `node tut-test.js`: tutorial walked by real taps to the end screen, both sizes, 0 errors.
- `VIS_SLUGS="," python3 scripts/build-all.py --quick vale-of-banners`: PASS (6/6 ?scn= scenarios: vb-board, vb-chain, vb-result + kit menu).
- `scripts/ui-audit.spec.js` (phone + pc, local gx-serve): A0 B0 C0 D0 F0, E2 = locked/off-screen chapter nodes of the shared Story map on the
  duplicate "panel Menu" surface only (the same map passes on the "campaign" surface; it looks like the audit taps nodes clamped at the map's
  scroll edge). Shared files are read-only for me; left for the orchestrator.
- Picture slots: proved with 3 dummy webp files (bg-title, tile-keep, portrait-odo): all drawn at slot size, no failed request; dummies deleted.
- Offline: the page is one file and requests nothing else until media/music files exist (checked: 0 extra requests). offline.json is written by
  build-all at deploy; make sure the slug is in games/sw.js SLUGS at deploy so `offline-test.js vale-of-banners` can run.

## Found -> fixed (played it myself)
1. Phone: market overlapped the estate -> estate placed under the measured market.
2. Phone: dock too tall, buttons below the fold -> dice + money in one row, storage + goods in one row.
3. Phone: back lane stacked 4 tiles high -> its own horizontal row.
4. Coach bubble covered estate numbers and made 2 instruction lines -> no auto bubble on the plain turn (bulb + tutorial teach it).
5. Title had 4 "primary" buttons -> Story is the one primary.
6. PC text under 16 px (bar labels, Story map labels) -> floored to 16 px in our CSS.
7. Space numbers and tile glyphs low contrast -> numbers on cream discs, glyphs drawn by CSS.
8. Locked Story chapters did nothing on tap -> a toast says to win the previous chapter.
9. Normal AI ended with ~9 unused workers -> worker value capped (now ~6).
10. Tutorial piece was invisible behind the bubble on phone -> bubble sides set by the kit; verified by tap test.

## Reused, and from where (orchestrator addenda 1-4)
- Shell from the shelf, not rebuilt: shell.js, gx-kit (Menu/settings), gx-help, gx-tutor, gx-campaign, gx-music, gameaudio, gx-scenario,
  shell/gx-campaign/help/tutor css. Build layout, campaign wiring and result flow follow cauldron-fair; picture-slot loader (art.js),
  assets.json format and register-assets.py copied from redline-rally; smoke.js pattern from redline-rally.
- Not copied from carc/kot: their engines are a different game (tile-laying meeples / dice monsters) and our own engine, dice UI and hex
  estate were already written and tested (rules-test, real-tap play) before the addendum arrived; nothing of theirs was stronger here.
- Web: no open-source engine with a usable licence exists (rules-notes.md), so no THIRD-PARTY.md. Rules cross-checked against the published
  rulebook summary; 4 mismatches fixed (rules-notes.md). Layout pattern (market top / estate centre / your supply in the panel) matches the
  usual browser versions' flow; no art, text or code taken.
- Temporary art: 71 pictures from game-icons.net icons (CC BY 3.0, credits in ASSETS.md and Menu > About) on code-drawn tiles, in
  temp-art/; copy into games/vale-of-banners/media/ at deploy. Kenney blocked (403); no fan or print-and-play pictures used.

## Missing / next
- Art: all code-drawn placeholders (92 slots, Flow prompts ready: ASSETS.md, ASSET-CHECK 92/92/0). Music files not made (cues ready).
- Online P2P not built (not in this brief). No undo. Estate on phone is ~36 px hexes (tap OK, could be bigger if the dock collapses).
- Story score thresholds are estimates; the act-3 chapters vs hard AI are tough (hard averages ~155).

## W458: plain words + play it like a board game (branch shelf/W458-vale, not deployed)
- New `src/feel.js` (built in before ui.js): drag a die onto a stall and the tile pops onto your finger; glowing estate spaces show where
  your other die can build it, drop there = take + build in one gesture (drop anywhere else = take only, drop on the dice = cancel).
  Drag a stored tile or a die onto a glowing space to build, a die onto goods to sell. Workers are meeples (the red figure chip): drag one
  onto a die, left half -1, right half +1 (tap the die to undo); glows and the prompt follow the moved die. Taps still work everywhere.
- Snap = vibrate tick + sound; a full region flashes and its points fly to the score. Rival builds show on a peek card with its estate
  and the tile flying in; the turn banner rolls the dice. Phone: two-finger pinch / drag to pan the estate, "Fit" resets, the camera
  punches in on each of your placements. Region outlines (cream, gold when full) drawn as SVG over the estate; bigger numbers;
  hexes touch so outlines read; PC market is 3 columns with 84 px tiles.
- Copy: every instruction line rewritten short and plain (ui.js, story.js coach lines, rules drawer). Engine untouched.
- Tests: `node drag-play.js` = a whole game by drag at 390x844 and 1440x900 (checks every drop changed the game). Shots: playable-shots/v4-*.
- Not done: build-all --quick could not run here (games-src/node_modules/.bin/playwright missing); shared FEEL.md did not exist yet.
  build-all rewrote games-src/nightrun/MODULES-COMPACT.md as a side effect; left uncommitted (not mine to change).

## W505: gameplay gate (branch shelf/W505-vale-gameplay, not deployed)
- Rules re-checked against the full rulebook text + two rules pages. Fixed: goods crates stay on the stalls between seasons; tie-break is
  MORE empty estate spaces (rulebook translation error). logic-test 192/192. Still different: the original's colour-coded stall spaces
  (layout not found), see rules-notes.md.
- Phone market: `fitMarket()` (ui.js) shrinks the stalls or lays the six in one row until the market sits above the dock (375x667 had the
  back lane hidden under the dock). On short phones the six stalls go in one row with the crates in each stall's header. A portrait phone
  never flips to the landscape layout when the dock grows (`portraitPhone()`); the top bar can no longer widen the page (tutorial bulb);
  End turn scrolls into view in the dock body on 375x667. Drag play by touch passes at 390x844, 375x667 and PC (`node drag-play.js`).
- Tutorial rebuilt as a guided first game: 48 steps, one line of 12 words or fewer + one glowing tap each, every core rule in order, then a
  real game; the "Things you'll meet later" list is gone. `node tut-walk.js` (tut-end.js removed). TUTORIAL-COVERAGE.md lists the steps.
- Shots: playable-shots/gameplay/ (tut-1..49, first-turn, mid-game, result; `SHOTS=1 node tut-walk.js` / `SHOTS=1 node drag-play.js`).

## FIX4 (R21 rows 4 and 6): hints on by default, every star says why, star = coach
- Hints ON by default (`vob_hints` !== '0'); the top-bar button shows its "Hints on" label on phones too.
- Every star carries a reason line under the prompt (ui.js `starWhy/starLine`): "★ Take Keep: a free action when built, costs 1 worker.
  Fits a space now." The prompt names the same move as the star (hardMove), the tile card and the bulb give the same reason.
- Learn to play: no look-ahead star at all; `tutStarPaint` puts the one star on the coach's target (tut-walk checks every step).
- Fixed: the workers star pointed at a button the dock does not draw (doubles with one die used).
- `node tools/newbie-gauntlet.js 120 gentle`: a newcomer who reads the previews and ignores the star wins 80% vs Gentle, 13% vs Normal.
- `MODE=newbie|star W= H= node newbie-test.js`: whole default games by touchscreen.tap.
- Left: some taps land on the "Turn over" beat card or mid-animation (5-14 per game); bubble over the prompt on tutorial step 26;
  goal card while the rival moves; red worker badge unexplained; story-test.js taps a hidden market tab at phone size.
