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

## Round 4 (W426, 8 Nov 01:20 UTC): phone clarity and camera follow
Owner on a phone: "lot of sloppiness with overlapping text ... very difficult to see maybe with camera following when we aim to place".
Method: `game/v4-shots.js` plays 10 turns at 390x763 and 375x553 through taps and lists every pair of overlapping text boxes and any text under 14px, every step.
- **Overlaps found (before, 6 turns):** 14 overlap pairs: follower-spot labels on each other ("field" x "field"), score pops on the turn strip, point tags under the
  turn strip; tags shrank with the zoom to 6-13 px (they lived inside the scaled board); follower labels pulsed to 35% opacity; the score sheet took 2 rows; rival
  names cut to one letter in the top bar. **After (10 turns, both sizes): 0 overlaps, no text under 14 px.**
- **Fixes:** tags stay 14 px on screen at any zoom, solid backing; on phones at most 3 tags (the best by points; the chosen spot's always), lower-ranked tags that
  would collide with another tag, the strip, a pop, a coach bubble or Recentre are dropped. Follower labels try below / above / right / left of their spot and the
  lowest-priority label is dropped if none is free; labels no longer pulse. Pops never sit on the strip and fade in place on phones. Score sheet = one row
  (Road / Town / Priory / Field + a rating chip); tap it for the rating line (closes after 5 s). Seat names hidden under 420 px (the strip names whose turn it is).
- **Camera follow:** picking up / turning the tile frames the legal spots near the last tile (plus the best-scoring spot), below the strip, cells >= 62 px on phones.
  Touch: the first tap on a glow centres and zooms that spot (solid large tile preview, its tag, the line "Grows your town ... Tap again to place.") and a
  "Place here" button replaces the tile name; a second tap or the button places. Mouse keeps one-click placing (hover previews). After the follower step the camera
  eases out to the area; the rival's placement pans to where it happens, your next turn frames back. Drag / pinch still work (they stop auto-follow until Recentre);
  a plain tap no longer freezes a camera move halfway. "Recentre" button always on the board (moves to the top while a coach bubble is open).
- Tests: playable-test and coach-test confirm a tapped spot with "Place here" (touch bots).
- Shots: `playable-shots/v4-{before,after}-{390x763,375x553}-{1-pick,2-aim,3-tapspot,4-follower,5-rival}.webp`.
