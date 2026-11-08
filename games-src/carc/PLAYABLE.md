# Rampart & Vine: playable pass (W403, 7 Nov 2026)

Method: screenshots at 390x763 and 1440x860 of title, tutorial, first turn, rival turn, scoring and result, looked at as a newcomer
(impeccable critique), then fixes, then the same screens again. Tests: `game/tutor-test.js` (tutorial to the end, both sizes) and
`game/playable-test.js` (Quick game and Story chapter 1 played to the result by tapping only visible, uncovered UI).

## The 10 worst problems (before) and what changed
| # | Problem (before) | Fix (after) |
|---|---|---|
| 1 | The only turn signal was a small dark pill ("Place your tile", "Cobalt plays a tile"): no clear "whose turn", easy to miss | Turn strip under the top bar: a coloured banner "Your turn" / "<Rival>'s turn" and ONE instruction line (at most 6 words, the UI-BAR rule 5 limit with the banner: "Place your tile: tap a glow.", 14 px, solid backing) |
| 2 | The rival's turn was a few silent moves with the same pill; nothing said what it drew, where it put it or what it claimed | Every rival step has a caption, queued so each is read in turn (draws a tile, places the tile, claims the road, scoring), about 1 s a step; the tile it holds is named at the bottom; tap the board to speed up |
| 3 | Score pops were a bare "+4" with no reason, and the header named the wrong player | Pop says what scored ("+4 town"), the strip says "You +4: finished town, 2 tiles" under a "Scoring" banner; end scoring says "unfinished road, 3 tiles", "field with 2 finished towns" |
| 4 | The first-turn coach bubble repeated the instruction and sat on top of a glowing square | Place/river/mason bubbles removed (the strip says it); only follower bubbles remain |
| 5 | Score chips and names at 12-13 px, names hidden for the rival on phones | Chips 14 px; banner names the rival in full |
| 6 | The tile in your hand was an unlabelled drawing | Label next to it: "Your tile" / "Hob's tile" + the tile's plain name, 14 px |
| 7 | Follower spots were identical circles | Each spot carries a label: road, town, priory, field (13 px, solid backing) |
| 8 | "70" next to a picture meant nothing | "70 left" |
| 9 | Result card showed bare numbers | Names and scores, plus a line in the game's voice (win, loss, tie) |
| 10 | Tutorial was a list of "tap here" tips, tutorial button third on the title | Story prologue: Old Tamsin portrait on every bubble, chapters, Hob as rival, story reasons and payoffs, coverage list; a first-time player sees the tutorial button first (Play stays the one big button) |

Also: Help opens with "How a turn works" (5 short lines) and a "House rules" card stating the simplified items from the rules check.

## Gate results (22:35 UTC)
- `build-all --quick rampart-and-vine`: PASS (scenarios 11/11, including ui-bar rules and axe contrast).
- `tutor-test.js` 390x763 and 1440x860: 19 steps, wrong taps, spotlight not covered, rotate/leave/skip/story runs: 0 problems.
- `playable-test.js both`: Quick game and Story chapter 1 played to the result by taps only: PASS, 0 console errors.
- ui-audit (phone / phone-s / pc) before: A2/0/24 B14/20/12 C10 E3/0/1 F1 (D0). After: A0/0/1 B5/8/4 C9/10/10 D0 E0/0/1 F0. A and F are fixed, B and E are halved or gone. NOT zero: the remaining B (busy background behind painted-art labels, kit campaign map header buttons), C (the painted menu row art is drawn stretched; the scenario rv-art requires the painted rows) and E (one kit button) are in the painted skin and the shared campaign kit, left as they are.
- sweep QUICK (4 full games with the help kit, rotation, result card): SWEEP CLEAN; geo_test and graph_test (77) pass.
- After shots (phone, webp): `playable-shots/` title, first turn, rival turn, result.
- rules fixed 0/0 (rules check found nothing WRONG; the one MISSING item is an expansion we do not have).

## Remaining (honest)
- The tutorial game cannot teach River, Taverns, Merchants, ties, banners and the can't-place rule (see TUTORIAL-COVERAGE.md).
- Story outros play only after a win (shared kit); no loss variants.
- The first commit on this branch (c6dc4f71) carries model attribution trailers that CLAUDE.md forbids (added by mistake from the harness template); it was pushed
  before I noticed and force-push is forbidden: squash at merge, or the owner may rewrite that commit. Later commits are clean.

## Round 2 (23:00 UTC): coached first game and audit zero
- The 19-step forced-tap tutorial is replaced by a coached first game (`game/src/coach.js`, text in `story.js`): free play from turn 1, no forced taps, one non-blocking
  bubble at a time (Tamsin teaches, Hob comments), a score walk with the player's real numbers and a "Things you will meet later" card. `window.GXCOACH = {running, explained, done, later}`.
  Rule-by-rule table and honest limits (ties, majority and unplaceable tiles only when they happen): `TUTORIAL-COVERAGE.md`. Proof: `game/coach-test.js` (random legal moves through the UI, both sizes).
- ui-audit A-F is 0 on phone, phone-s and pc (was A0/0/1 B5/8/4 C9/10/10 E0/0/1): solid backings behind text, painted menu rows drawn with `cover` instead of stretched,
  tutorial/campaign header buttons solid, the music panel made compact so nothing sits below the fold, contrast overlays on the big buttons.
- `build-all --quick`, coach-test (390x763 and 1440x860), playable-test (Quick and Story by taps): PASS.

## Round 3 (Addendum 5, 8 Nov 00:00 UTC): the player sees how they score
All numbers come from the engine's own `probe()` and `featPoints()` (`game/src/preview.js`), so the preview is exactly what scoring will do.
- **Before placing a tile:** every glowing square carries a tag when it matters: `+4` (finishes your feature, green), `Hob +6` (would hand the rival points, red), `grows` (extends your feature) or `feeds`.
  Press and hold a square (or hover on a computer) for the full line in the turn strip ("Finishes your road: +4 for you.", "Grows your town to 3 tiles: +8 when finished.") and the feature's tiles light up.
- **Before placing a follower:** each spot says what it is worth: "road +4 now", "town +6 if closed", "priory: 9 when ringed", "field: 3 per town at end".
- **Points pop with the reason:** unchanged (pop "+4 town", strip "You +4: finished town, 2 tiles").
- **Always-visible score sheet** under the top bar: Roads, Towns, Priories, Fields, one number per player (you first, colour-underlined), live.
- **Move rating:** after every turn of yours one line in the sheet: "Good: the best score available." / "Okay: finishing the road was better." / "Poor: ...", from the computer's own best plan versus what you played (placement + follower).
- **Coached game:** same previews and sheet; Tamsin adds `preview` (what the tags mean) and `rate_good/okay/poor` the first time each applies.
- Shots (phone): `playable-shots/preview-hold.webp`, `fig-spot-points.webp`, `score-sheet-rating.webp`.
