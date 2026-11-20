# PLAY3 report: Twin Thrones

Branch `shelf/W551-twin-thrones-play`. Not deployed, no PR. Rules untouched (rules-test, cardtext, endline unchanged).

## The 5 biggest reasons a person would still say no
I watched the after video frame by frame and played 2 full games cold by touch at 375x667.
1. **Dead turns with no reason given.** Build and Wonder showed "too costly" most turns, and the only text was "You need 13 coins". Nothing said WHY a card costs 13 (which resource is missing, and at what price). The official app shows the missing resources and their trade price.
2. **The rival's turn was cut off or confusing.** Lines like "Rival takes Clay Depot to sell it for…" were truncated. With hints on, a coach line ("Poor move. Best was …") was shown under a "Rival's turn" tag. One line also read "thrown away from Your city".
3. **Cluttered screen in the first 30 seconds.** A permanent "Goal: …" line ate pyramid height, and gain chips ("+7 Sky Tomb") collided with it.
4. **No payoff for points.** Score pills changed silently. Age changes passed without a beat (the official app makes each new age an event).
5. **Pacing and feel between ages.** A new pyramid simply appeared, with no sense of a chapter or of who starts.

## What changed (src/ui.js, src/head.html)
- The lift now gives the cost reason, for example "Need 6 coins, you have 0." plus "Buy 2 stone at 3$ + 1 glass at 2$". The breakdown is shown only when it adds up to the engine's real price. Build and Wonder buttons read "need 6$" instead of "too costly".
- Rival lines are short and fit: "Rival sells X.", "Rival builds X.", "Rival tucks X under a wonder." The rating has its own "Your move" tag ("Great pick / Better was X") and never takes the rival's tag. "Rival throws away your X." replaces the "Your city" line.
- Points fly: a one-shot "+3 pts" over the score pill with a bump. Each new age gets a one-shot moment, "Age II · A new pyramid · you start".
- The goal line steps aside after 4 cards are taken (it stays in Menu and the goal card). The pyramid gets the space.
- After the cold play: the war-track marks read "−2$" / "−5$" (the losing side drops coins), and the wonder button reads "pick one" instead of "pick below".
- Calm rules hold: calm-audit 0 loops, max 1 helper. New text is 13-15 px, and tap sizes are unchanged.

## Gates (final build)
- `build-all --quick`: PASS (5/5 scenarios). `--full`: PASS twice (phone-check, rules-test included). Final code: --quick + --full x2 PASS again after the cold-play fixes. `games/lab.html` restored.
- cardtext 73 ok, endline PASS (59), calm-audit loops=0 maxHelpers<=1.
- Already failing on the live build, unchanged by this work:
  - touch-test and phone-fix-test hit a "bad pick" draft race in the test.
  - tutorial-e2e reports 40 steps, rules 28/28, but fails on media files missing from this checkout. The live build gives the identical result.

## Independent cold play (a fresh subagent, no history, touch only, tutorial + full game), verdict as-is
> Could you play it? Yes, I played it start to finish without getting stuck. The tutorial got me going; then "Tap a glowing card. Stuck? Tap Hints.", the star on the suggested card and the card popup (big Build / Sell / Wonder buttons with costs on them, one-line plain-English summary) carried me. No dead ends or softlocks.
> Fun: 3.5/5. The draft from an overlapping pyramid of cards is satisfying, and free "chain" builds, raising a wonder and the science-symbol race feel good. Mid-game was a bit samey (tap card, mostly take the starred move, watch rival); I rarely felt a real decision between turns.
> Would I play again? Probably yes, a couple more times, to try the shields win and see if the rival is beatable without science.
> Confused: 1. the shields track with 2$/5$ marks (fixed after: now "−2$/−5$"); 2. dense rows of tiny icons in both cities; 3. wonder tiles show prices but no names, "pick below" (fixed: "pick one"); 4. "Opens 1 for rival", "Pawn 2 steps", "Buy 1 papyrus at 3$ + 2$ fee" only half clear; 5. two-tap pickers for revive and tokens; 6. sudden science win.
> Would I pay $5? Not quite yet, maybe after more polish. It looks good, plays smoothly and feels like a real product, but the board is cramped on a phone, the shields/money track is unexplained, and I played mostly by following the star.
> Most exciting: at 5 of 6 science symbols a pair let me pick a token that counts as a science symbol; took it and won on the spot.
> Won by science in Age III (35 vs 28 points).

## Still open
- The city rows are dense with icons at phone size.
- Mid-game decisions feel thin when you follow the star.
- Wonder tiles show no names.

## Proof
- `play/after2-first-3min-375x667.webm` (a whole game, 2:08, new build)
- `play/proof/after-first-3min-375x667.webm`, `play/proof/before-first-3min-375x667.webm` (earlier)
