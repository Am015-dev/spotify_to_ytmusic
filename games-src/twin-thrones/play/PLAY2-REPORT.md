# PLAY2 report: Twin Thrones, why a real person could not play it

Branch `shelf/W551-twin-thrones-play`. Not deployed. Cold-play notes and benchmark: `COLD-PLAY.md`.

## The 5 gaps (cold play on the live build at 375x667, compared with the official app of the original game)
1. Cards were unreadable at a glance. The name was the biggest thing on a 55 px card, and the price badge covered the effect. You had to tap every card just to read it.
2. Your economy was invisible. Nothing showed what your city makes, and wonder prices were bare numbers ("8", "10"), so costs felt random.
3. The pyramid's core tension was hidden. Covered cards were black blobs, and nothing showed which cards your take opens for the rival.
4. Choices had no visible consequence. Before committing you saw "Makes 1 stone", never pawn steps, science progress or points.
5. There was no payoff. War, science pairs and wonders resolved silently, with a pawn nudge and a sound.

## What changed (src/ui.js, src/head.html only; rules untouched)
- Pyramid card faces now lead with the effect: a band in the card's colour shows +1 wood, shields, points or the science symbol. The price is a separate pill below it. Names show only on big cards and in the lift.
- Covered face-up cards stay readable (only the art is dimmed), so you can plan ahead.
- Each city has a "makes" bar (wood 2, clay 1, +1? for cards that make one resource of your choice). Wonder prices read "10$".
- The lift adds outcome chips computed on a copy of the game: "Pawn 2 steps to rival", "Science 3 of 6", "Pair: pick a token", "+3 points", "Extra turn", "Opens 2 for rival", "Wins the game!". The cards a take would open get a dashed outline and an "opens" tag.
- Each move gets one big moment that plays once (1.5 s, then removed). Priority: wonder raised, then science pair, then war push "⚔ +N" with a pawn bump. Reduced-motion is respected.
- Wonder draft cards show their full cost (it used to be clipped).
- Chained rival moves slowed from 250 to 550 ms per line, and narration from 450 to 650 ms, so each one can be read.
- Still a maximum of 1 helper and 0 infinite animations. Every new animation runs once.

## Gates (final build)
- `build-all --quick`: PASS (5/5 scenarios). `--full`: run twice, PASS both times (phone-check included). `games/lab.html` not committed.
- `rules-test 300`: PASS. `cardtext-test`: 73 cards ok. `endline-test`: PASS, 59 end screens. `tutorial-e2e` 390x844: PASS (40 steps, rules 28/28, 0 errors).

## Independent cold play (a subagent with no repo access and no knowledge of the changes), verdict as-is
> 1. Full turn without reading? Mostly yes. The top banner says "Tap a glowing card", glowing cards are obvious, and tapping one gives a three-button popup (Build / Sell / Wonder) that greys out "too costly" options. That was enough for me. Caveat: the very first screen is a "pick a wonder" draft that looks like the normal board. It took a guess to see that tapping a card picks it. Caveat: what "Wonder" really does (tuck a card under it, pay a price) only became clear when I tapped the wonder icon by accident.
> 2. First minute: 3 lost moments, 0 dead taps. Overall: about 7 lost moments and 1 dead tap. The dead tap was the wonder bar at the bottom, which only opens an info popup. "What just happened?" moments: 3. Between my turns the card count dropped by 2 or 4 and the rival gained 5-9 points with no animation I could follow. I also sold a red card by accident because I never read what I was selling.
> 3. Exciting moment: Age III showed "Pawn 4 steps from victory" in green. I then raced to build red shield cards, with the pawn creeping to "You win" while a rival warning said "Rival has 4 of 6 symbols". I built the last red card for an instant war win while behind on points (41 vs 53).
> 4. Goal: Build cards in a pyramid to score more points than the rival, or push the pawn to their city with shields, or collect 6 different science symbols.
> 5. Fun 4/5. Quick and tense, and the free-card glow gives a good "something is free" pull. The win came suddenly, and I didn't feel I'd earned it until the screen said so. I would play again.
> 6. a. Rival's turns happen offscreen and fast. I could not see what it took, only the score jump. b. Coins feel punishing: I was at 0 coins most turns and sold cards just to afford anything. c. Icons, especially the small symbols and "+1" resource tags, mean nothing without reading, and the Wonder cost rule is hidden until you tap into it.

Point 6a was addressed afterwards by slowing chained rival moves (see above). The blind test was not rerun after that change.

## Proof
- `play/proof/before-first-3min-375x667.webm` (live build)
- `play/proof/after-first-3min-375x667.webm` (new build, recorded before the rival-pace tweak)

## Still open
- The wonder draft doesn't say "tap to pick" clearly enough.
- How wonders work (you tuck a card under one) is only taught by tapping.
- A low-coins economy pushes new players into selling.
- Only the owner's own play on a phone can judge fun.
