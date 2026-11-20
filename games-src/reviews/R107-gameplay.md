# R107 strict gameplay review: wildmark

Branch reviewed: `origin/shelf/W574-wildmark-strict` at **6f7b52d4e576cd27dcaceafd0d01ecd314f9ec58** (source folder `games-src/wildmark`).
Reviewer: R107 (20 Nov 2026, ~19:45 UTC). No game code was edited.

## Verdict: FAIL, average 7.3 (rows 4 and 5 under 7). No stopper.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 8 |
| 4 | Turn clarity (incl. clutter) | 6 |
| 5 | Phone and PC play | 6 |
| 6 | AI and pacing | 8 |
| 7 | Feel | 7 |
| 8 | Bugs | 8 |

Cold play (as-is): playable on phone and PC, **fun 3/5**, would play again **"probably yes"**, lost both games (75-85 phone, 72-79 PC) and the tutorial (32-36). This is not a clear "playable and fun" verdict, so it does not meet the PASS bar.

## Gates (one run each, foreground, alone)
- `VIS_SLUGS="," build-all.py --quick --out /tmp/x wildmark`: **PASS** (11/11 scenarios).
- `VIS_SLUGS="," build-all.py --full --out /tmp/x wildmark`: **PASS** (phone-check ok; lab WARN 3/8, which is a LAB-row list mismatch and not a game fault; rules-test win rate hard 50% / easy 17%, 8 games). `games/lab.html` was restored, not committed.
- `calm-audit.js` (20 s, play + bulb, guided): loops=0, maxHelpers=1. Its selectors miss this game's step banner, preview pop and verdict chip, so my count below is higher.
- `newplayer-bench.js 60` (greedy newcomer bot vs rival): novice 58%, easy 64%, normal 55% newcomer wins.

## Rules vs the original (engine + every player-facing text)
- **Engine: 0 mismatches.** Checked: setup and supply (43/43/63/83), the 4 pairs, the four-alike auto sweep (repeats), the optional three-alike sweep (once per turn), both acorn powers, adjacency and rotation, settle or return, keystone acorn, refill, 20 turns, solo removal, every A table, all B-D tables, habitats, majority incl. ties, solo +2 at 7+, acorns, tie-break.
- **Text: 7 mismatches, all minor:**
  1. `games-src/wildmark/campaign.json:1014`: the prologue goal says "Out-score him in 6 turns", but the tutorial is 7 turns (`src/tutor.js:5`). The string looks unused.
  2. `games-src/wildmark/src/ui.js:540`: the Scores table labels every land bonus "(biggest)". With 3-4 players, a +1 for second place or for a 3-way tie for first is mislabelled.
  3. `games-src/wildmark/src/ui.js:567`: the elk A list ends "4+: 13". A line of 5 scores 13+2 (lines split), so it should read "4: 13".
  4. `games-src/wildmark/campaign.json:740` and `:920`: "No sweeping the market here" / "nobody may sweep the market". Only the optional three-alike sweep is banned; four alike still sweeps.
  5. `games-src/wildmark/src/score.js:182`: the 2-player Goal card says "+2 if yours is the biggest" and leaves out the tie case (1 each).
  6. `games-src/wildmark/src/ui.js:627`: the result line reads "Bram beat you most on animal cards 42 vs 56 (you first)". "(you first)" is unclear wording, not a rule error.
  7. Tie result (seen live, 375x667): 88-88 shows "You win!" plus "You beat Bram most on habitat bonuses". It never says the tie was broken on acorns.
- A code comment at `src/campaign.js:2-3` names a twist "rival-head" that doesn't exist (not player-facing).

## Helper and loop counts
- Infinite animations: **0** in play, during the tutorial, and 15 s after the bulb. The bulb bubble ("Best fit for your patterns and habitats") stays up after 15 s.
- Most helpers on screen at once: **2** (needs 1). Two cases:
  - During placement: the step banner "3/3 Tap a ringed tile for the Elk" and the preview pop "+1 Here: river grows to 2" show together. At 375x553 the pop covers the market; at 910x512 it covers the valley (shots p553-g0-place, pc910-g0-place).
  - After a weak move: the verdict chip "No points · Poor move: Elk column was +4" and the line "Bram takes the Peak tile + Elk" show together (375x667, rv-3after0).

## First-timer play (touch)
- **Tutorial**, at 375x667 and at 375x553: 41 steps, one highlight each, no dead taps. The coach box covers 14% (667) / 16% (553) of the board, and at 553 it sits over the top tiles of the valley (turns 4 and 6).
  - **Following every highlighted tap ends in a loss: "Bram wins! 36-32."** The newcomer's first finished game is a defeat they could not avoid.
  - Missing space in the tutorial result: "RowanHere is how your score adds up".
- **Games, default level** ("Play against 1 computer ranger", the gentle rival). Each game lasted 20 turns with 0 errors, 0 stuck states and 0 extra taps.

| Size | My choices | Result |
|------|-----------|--------|
| 375x667 | follow the hint | won 87-74 |
| 375x667 | my own: biggest "up to +N" column | won on tie-break, 88-88 |
| 375x553 | my own | lost 91-95 |

- The "up to +N" chips on each column preview the choice well. The 3-tap turn (column, spot, ringed tile) is quick.
- The rival's summary "Bram: Peak + Elk (ringed). +4 -> 14 · you 9. Tap to go on" plus an inset of his valley is readable. "(ringed)" is jargon.
- The result appears **about 4.9 s** after the last move, in every game. It feels like a hang.
- **Hint vs Hints-on is still unclear on the phone.** The bar shows a bulb labelled "Hint" next to a toggle labelled only "On".
- **Newcomer win rate:** about 50-60% on the default level (my games 2 of 3, bench 58-64%). OK.

## PC (mouse)
| Size | Result | Layout |
|------|--------|--------|
| 1366x768 | lost 74-90 | Good 3-panel layout: rival valley + season log left, market right, valley centre. Text 14 px or more. The result panel scrolls; the fox row is cut at the bottom. |
| 1920x1080 | won 92-90 | Uses the width. The result scrolls (1101 px of content for 1080). |
| 910x512 | won 86-82 | **Falls back to the phone layout, stretched.** The market takes about 1/3 of the height and the valley gets a strip about 180 px tall with tiny hexes. The pick stage shows **no "up to +N" previews** (the phone layout does). Banner and pop cover the valley while you place. Acorn / Help me and Place tile / Back sit flush on the bottom edge and are flagged as clipped from turn 3. |

At every PC size: 0 dead clicks, 0 page errors, no page scroll, smallest text 14 px.

## Phone audit
- 375x667: smallest text 14 px, no tap target under 44 px, nothing clipped.
- **375x553:** market tiles are 42x46 and market tokens 36x48, so both are under 44 px wide. The result screen scrolls (688/667 at 375x667). Nothing else is clipped or overlapping.

## Rows under 7: repro steps
- **Row 4 (6):**
  1. 375x553, Play, turn 3: tap a column, then tap a spot. The banner "3/3 Tap a ringed tile..." and the pop "+1 Here: ... grows" are on screen together, and the pop covers the market.
  2. 375x667: take the first column on turn 1 when it scores 0. The verdict chip and the rival line show together.
  3. The bulb "Hint" vs the toggle "On" is not explained.
- **Row 5 (6):**
  1. Mouse at 910x512, Play, turn 3 or later: the market has no "up to" chips, the valley is tiny, the banner and pop sit on the valley, and the bottom buttons touch the edge.
  2. 375x553: the market tokens are 36 px wide.
  3. At 1366x768 the result panel needs scrolling to reach the fox row.

## Prioritized fix list
1. **One helper at a time.** While the preview pop is shown, hide the step banner (or merge the two). Show the verdict chip only after the rival line has gone. Add the banner, pop and verdict selectors to `calm-audit.js` so they are counted.
2. **910x512 (short landscape PC).** Use the PC 3-panel layout, or a 2-column layout with the market at the side. Show the "up to +N" chips there. Keep the board area at 50% of the height or more. Inset the bottom buttons from the edge.
3. **The tutorial must end in a win**, or at least not in a loss: stack the last turns so the scripted line wins. Fix "RowanHere".
4. **Show the result sooner** (about 1.5 s, not 4.9 s). Make the PC result fit without scrolling: show the breakdown table in a tab or a collapsed panel.
5. **375x553 market targets:** make tokens and tiles at least 44 px wide (the token can be the full column width).
6. **Tie result:** say "Tied on points: you win on acorns (4 vs 2)". Replace "(you first)" with plain words.
7. **Labels:** rename the toggle "Hints on/off" on the phone as well, and give the bulb a one-line caption the first time it is used.
9. **Cold-tester confusions:** explain a falling total ("Bram took the biggest-forest bonus: -2"). Label or remove the "▼N" box. Reword the tutorial step "ringed bear tile". Give instant feedback on a confirming tap; ignore re-taps during the animation, but show that they were received.
8. **Text fixes:** items 1-5 of the text list above (campaign.json:1014, ui.js:540, ui.js:567, campaign.json:740/920, score.js:182).

## Cold play (independent subagent, no history)
The first attempt was refused by a safety check: it tried to keep one browser open between steps through a persistent driver process. It stopped and played nothing. The retry used ordinary one-shot scripts. It played by taps and clicks, choosing from what the screen showed: the biggest "up to +N" column and the biggest "+N" spot, with no turning and no acorns. Its report, quoted as-is:

> - Could I play it? Phone: yes. Tutorial and a full 20-turn game, all by touch taps. PC: yes, a full 20-turn game by mouse clicks.
> - Fun: 3/5. The tutorial is clear and short. Placing a tile and then an animal is satisfying, and the "up to +N" and "+N" labels tell you the payoff before you choose. In play, though, the rival always seemed to keep pace or pull ahead.
> - Would I play again: probably yes. The picks are quick and easy to learn. But I could not tell what I should do differently, so I would only keep going if the rival felt beatable.
> - Results: Tutorial: lost 32 to 36. The scripted turns end in a loss, which is a flat way to finish onboarding. Phone full game: me 75, rival 85. The rival is named Bram. PC full game: me 72, rival 79.
>
> What confused me:
> - The tutorial text says "Tap the ringed bear tile", but the thing to tap is the ghost preview of my own new tile. Tapping the existing bear tile (160,393) or the "Place tile" button did nothing.
> - A confirming tap gives no visible change for about 1.5 s, and re-tapping in that gap did nothing. It feels dead.
> - Score dips with no explanation: on the phone I went from 36 to 29 on one turn, and 28 to 27 on another, right after my placement. The rival's turn banner says "+4 → 18 · you 16" but not why mine dropped. I assume the land-majority bonus changed hands.
> - The small "▼3" or "▼4" box at the bottom-left of the board is never explained. It appears from turn 1 on both phone and PC.
> - The goal card is a wall of text, though it does have a Start button.
> - The rival's turn is understandable only at a glance. The banner reads "Meadow/Marsh + Hawk (ringed). +4 → 18 · you 16. Tap to go on", and the small valley inset shows the placement. The inset overlaps my board in the tutorial and hides tiles. On PC the season log lists what Bram placed, but without points.
> - The final panel has a "Title" button whose purpose is unclear. When I took screenshots, the score-breakdown table was still empty on both phone and PC (the tutorial result did show it).
>
> Dead taps/clicks or covered things:
> - In the tutorial, the "Place tile" button and the existing ringed tile did nothing (see above).
> - The "+2 Elk line" popup covers the top animal counters. The rival inset covers part of the board.
> - On the phone the board gets tiny late in the game: hexes are about 40 px and the "+1" badges about 20 px, so aiming a tap is fiddly.
> - The "Back" and "Help me" buttons crowd the bottom-right, next to the Place and rotate buttons.
> - PC layout is fine: the season log, market and board are all visible and uncovered.

Reviewer notes on the cold report:
- In my own 6 games the breakdown table was filled about 5 s after the end. The "empty table" is most likely a screenshot taken before the result had drawn. Not counted as a bug, but it is one more sign that the result should appear sooner (fix 4).
- New items it found, added to the fix list as fix 9:
  - The total drops when a land bonus changes hands, and nothing explains the drop.
  - The "▼N" box on the board is never explained.
  - The tutorial step "Tap the ringed bear tile" should say "Tap your new tile (ringed)".
  - A confirming tap shows nothing for about 1.5 s; it needs instant feedback.
- The second-tap-during-animation leftover is confirmed.

Video: `games-src/reviews/R107-first-3-min-375x667.webm` (2.8 MB).
Screenshots (local only, not committed): `/tmp/r107/shots/`.
