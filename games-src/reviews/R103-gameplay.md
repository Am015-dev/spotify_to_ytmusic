# R103 strict gameplay review: stitchwise

- Commit reviewed: `origin/shelf/W573-stitchwise-strict` @ **9d9b68c44d77bad03cb990cd74b13b5e0ed8da83** (20 Nov 2026, 18:10-18:55 UTC)
- Verdict: **FAIL**, average **7.0**. One row under 7: row 5 (Phone and PC) = 6, because the 910x512 scaled-laptop size fails. No stopper.
- Cold play: playable on both phone and PC, fun 3.5/5, would play again.

## Gates (one run each, foreground, alone)
- `--quick`: PASS, 11/11 scenarios ok (69 s).
- `--full`: PASS. Phone-check 63 s. rules-test: Normal beats Easy 63% over 200 games, about 40 moves per game. lab WARN 3/8 (the LAB rows list differs from the scenario list; not a play issue). `games/lab.html` was reverted and not committed.
- Repo tests on the built page: tut-walk at 375x667 and at 375x553 PASS (12 rule steps, 0 failures). pc-mouse at 1366x768 PASS and at 1920x1080 PASS. **pc-mouse at 910x512 FAIL, 6 failures** (see row 5).
- calm-audit: loops=0, maxHelpers=0. Its guided path tapped "Rules", not "Learn to play", so it did not cover the tutorial. My own sampler covers that path (below).

## Rules vs the original (engine and player-facing text)
The engine matches the original turn by turn. Checked in `src/engine.js`:
- Only the 3 patches after the marker can be bought, and the marker moves to the bought patch's spot.
- The player further back on the track moves; on a tie, the token on top.
- Advance goes to the space just past the rival, +1 button per space moved.
- Income spaces pay on passing, for both Advance and buying. Every leather space passed is taken and placed at once.
- The first full 7x7 square gets +7. Score = buttons + bonus - 2 per empty square. Tie on score goes to whoever reached the end first.
- Data (`src/data.js`): 33 patches, track of 53, income on 5, 11, ..., 53, 5 start buttons.

Mismatches and nits:
1. `src/ui2.js:120` says "Cream track square = leather". Leather spaces are drawn **brown**, and both `src/ui3.js:54` ("Five brown spaces") and the PC legend show brown. This is a wrong player-facing text.
2. `RULES-CHECKLIST.md:7` still lists leather on 20, 26, 32, 44, 50. The engine uses the current printing, 26, 32, 38, 44, 50 (`src/data.js:2`, `rules-notes.md` F1). This is a stale doc, not a game bug.
3. `src/ui3.js:50` ("At the end: buttons minus 2 per empty square") and `src/ui1.js:258` (goal card first bullet) leave the +7 out of the score line. The bonus is explained in the next line or bullet, so this is a nit.
4. Two patch entries are still UNCONFIRMED against a printed set: the cost-1/time-5 patch (`Kite Patch`, `src/data.js`) and the cost-2/time-2 T. The game says so in `src/ui3.js:57`.
5. Start player: seat 1 starts in Story and the tutorial, and the start player is random in a Quick game (disclosed in `src/ui3.js:57`). Acceptable.

## First-timer play by touch (375x667 and 375x553)
- Tutorial: 10 short steps, one line and one highlighted target each, at both sizes. A real game follows.
- Games: a scripted newcomer that only follows the hints played 4 full games on **Easy**: 2 at 375x667, 2 at 375x553. A 5th didn't start because the bot didn't tap "See the result" first; that is a bot issue, not a game bug. It taps the hand/Best patch or else the first affordable patch, then "Use good spot", then Sew, and Advances only when nothing can be bought. It won **3 of 4**: 23-4, 15-15 (won on the tie-break), 16-26 (lost), 18-11.
  - An earlier policy that Advanced at random half the time lost 0 of 5 with 28-44 empty squares. Buying patches is the lesson, and the game teaches it.
  - A game took about 60 s with fast settings (about 50 turns). Each rival move takes about 2 s and can be tapped to skip.
- Each turn shows cost, time, income and "x N paydays = value" on every card. Advance says what it gains ("Advance +2 buttons, lands past Poppy"). When nothing is affordable, the prompt says "Nothing to buy. Cash in". The rival's move is captioned and its quilt is shown during its move.
- Clutter, sampled every second over about 180 samples: **max helpers 1**, **0 infinite animations**, 0 text under 11 px, 0 tap targets under 44 px, no page scroll.
  - Only clip flagged: the `upnext` strip (the third patch card is cut at the right edge on phone, and you scroll it sideways).
  - A PAYDAY card and a "+N buttons" float can sit over the top of the quilt together for a moment (`shots: g0-t6`).

## PC by mouse
- 1366x768 and 1920x1080: good use of the width. Side panels hold the stats, the track and the rival's quilt; the quilt is centred; offer cards are large in the right panel. Drag, Rotate, Flip and Sew all work by mouse, and a full game reaches the result. No text under 12 px.
  - Cold tester: at 1366 the last column of the track in the left panel is clipped at the panel edge (also visible in my 1366 screenshot).
- **910x512: FAIL.**
  - (a) The result screen's "Play again" and "Title" buttons are cut off at the bottom of the window. You have to scroll, or you can't reach them.
  - (b) The rival quilt panel (`.oppq`) is missing.
  - (c) The quilt is small (about 20 px cells) while the right panel has a large empty area.
  - (d) Offer card text is cramped: "+0income" runs together, and the "Tap" hand overlaps the third card's corner.

## Cold play (independent subagent, no history; quoted as-is)
> - Could you play it? Yes, to the end on both phone and PC. I never got fully stuck, but I wasted taps in a few places (listed below).
> - Fun: 3.5 out of 5.
> - Play again? Yes. The patch-buying and timing choices are interesting and the quilts look lovely. "Best +N" labels plus Hints on make it easy, but I wondered if they make it too easy.
>
> What confused me:
> - Title screen on the phone: I had to guess that the first big button, "Learn to play", was the tutorial. On the phone I first tapped the wrong area and had to retry.
> - The tutorial's final "Sew it on" step (phone) looked like it ignored my tap (nothing happened). It worked on a later tap.
> - Phone, game screen: the "Advance +N buttons" button and the patch cards sit in a cramped bottom tray. The patch list scrolls sideways, and the right-hand card is cut off ("16" and a red arrow at the edge). I only found a third patch by looking for the arrow.
> - Placing a patch is a 2-step flow: tap the patch, then "Use good spot"/"Sew it on" (I tapped twice every turn to confirm). It was not obvious that a second tap was needed.
> - Phone, free 1x1 leather patch: a banner said to tap any empty square. When my tap landed on a spot that was already covered, nothing happened and the only feedback was no change.
> - PC: dragging the patch on the quilt works, but the "Good spot?" tooltip and the dashed spot hint are easy to ignore.
> - Phone: while the computer opponent moves, the board is hidden or shrinks, which is slightly jarring. The payday popup covers the quilt top for several seconds.
>
> Phone vs PC:
> - Phone (375x667): everything is reachable, but the patch tray is small and cramped. The patch cards need a sideways swipe, and the "Advance" button text is tiny. No dead taps beyond the ones noted above.
> - PC (1366x768): clean layout and everything readable. Patch cards on the right panel are large. The left sidebar timeline (the "track") is cut off at the right edge (the last column is clipped).
>
> Results: Phone, tutorial first, then vs Poppy: lost 6-16 (17 empty). PC, Easy, Hints on: won 35-15. Tutorial 23-15.

Video: `games-src/reviews/R103-first-3-min-375x667.webm`. These are the cold tester's first 180 s at 375x667 by touch, starting on the title screen, then the tutorial, then the game (re-encoded at 10 fps).

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | The engine matches every core rule. One wrong text (leather "cream" vs brown), a stale checklist, 2 patch entries unconfirmed but disclosed. |
| 2 | Tutorial teaches | 7 | 10 steps, one line and one tap each, every core rule in order, then a real game. Open from last round: the end still says "Keep tapping Advance" (`src/ui4.js:216`). Cold tester hit a Sew tap that seemed ignored. |
| 3 | First 10 seconds | 7 | Learn is the first highlighted button. Goal card: one sentence and 3 bullets. The cold tester still had to guess Learn was the tutorial. |
| 4 | Turn clarity | 7 | Every card shows cost, time, income and payday value. Advance states its gain. The rival move is captioned. The "Hints off" top button reads like a state, not an action. The 2-tap placement wasn't obvious to the tester. |
| 5 | Phone and PC | **6** | Phone passes: 0 text under 11 px, 0 taps under 44 px, no scroll, board-first. PC 1366 and 1920 are good. **910x512 fails** (result buttons cut off, no rival quilt, cramped cards). Track clipped at 1366. Phone third card cut at the edge. |
| 6 | AI and pacing | 7 | The rival is quick and sensible. A hint-follower wins 3/4 on Easy, and the cold tester 1 of 2: about right, slightly easy. Games are a sensible length. "Use good spot" still places for you every turn (open item). |
| 7 | Feel | 7 | Payday moments, score floats, confetti on a win, sewn-looking art. Popups over the quilt top get busy for a moment. |
| 8 | Bugs | 7 | 0 page errors, 0 stuck states, the gates pass. The cold tester saw two taps that seemed to do nothing (tutorial Sew, leather on a covered square). The code shows a "That square is taken" line (`src/ui2.js:67`), but the tester didn't notice it. |

**Average 7.0, FAIL** (row 5 < 7).

## Repro for the row under 7
- Row 5, 910x512: `URL=http://127.0.0.1:PORT/stitchwise/ node games-src/stitchwise/pc-mouse.js 910x512 --shots DIR` gives 6 failures. By hand:
  1. Open the page in a 910x512 window, choose Quick game, then Normal computer, then Start.
  2. Note there is no rival quilt panel, the quilt is small, and the right panel is mostly empty.
  3. Play to the end. On the result screen, "Play again" and "Title" sit below the window edge (shot `pc-result-910x512`).

## Fix list (priority order)
1. **910x512 (short PC windows):** fit the result card to the height so its buttons are always visible. Show the rival quilt or a toggle for it. Grow the quilt into the empty right-panel space. Let card text wrap cleanly ("+0 income").
2. **1366x768:** stop the track's last column clipping in the left panel.
3. **Text:** `src/ui2.js:120` says "Cream track square = leather". Make it brown, to match the art and `src/ui3.js:54`. Update `RULES-CHECKLIST.md:7` to 26, 32, 38, 44, 50.
4. **Phone tray:** make the 3 offers fit without the third card cut off at 375 wide (3 narrower cards, or a clear "1 more" cue). Make the Advance label bigger.
5. **Taps that seem dead:** on a covered square during leather placement, flash the tapped cell and put the "taken" line next to the quilt. Check why the tutorial's last "Sew it on" seemed to ignore the first tap.
6. **Too easy:** make "Use good spot" a hint (show the outline and let the player tap it) instead of a one-tap auto-place on every turn. Or limit it to Easy, or to the first few turns.
7. **Tutorial end:** finish with one Advance-to-end tap, not repeated "Keep tapping Advance".
8. Rename "Hints off" to an action ("Turn hints on") or a clear on/off switch. Don't let a PAYDAY card and a "+N" float stack over the quilt top.
