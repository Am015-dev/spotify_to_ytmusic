# Twin Thrones: cold play and benchmark (PLAY2, 20 Nov 2026)

Live build, 375x667 touch phone, no tutorial, Quick game on Easy. Video: `proof/before-first-3min-375x667.webm`.

## First 3 minutes, moment by moment
- 0:00 Menu is clear. "Quick game" is the obvious button. OK.
- 0:05 "How to win" card: three short lines. OK, but "6 different science symbols" means nothing yet.
- 0:10 Wonder draft. The rival picked first before I saw the screen. Cost chips on the wonder cards are cut off (the third cost is hidden), so I can't compare wonders. I pick on the picture and the points.
- 0:40 The pyramid appears. LOST: the cards are about 55x70 px. The biggest thing on each card is its NAME ("Rock Face", "Reed Press"). What a card GIVES is a tiny "+1" icon under the coin badge. The shield on red cards is covered by the price. I can't tell what anything does without tapping each card.
- 0:45 Face-down cards are blue with a gold round medallion that reads like a coin. The covered face-up row is almost black: I can't see what is coming.
- 0:50 Tap a card: the lift with Build / Sell / Wonder is good, 2 taps per turn. But it only tells me "Makes 1 stone". It never says what that does to the race, or that taking it opens new cards for the rival (the core tension of this game).
- 1:00 Rival turn: one line ("Rival takes Glass Kiln to build it.") and the card flies. Readable, about 1 s.
- 1:10 The wonders under my city show "8", "10", "8", "8" in red bubbles. LOST: no idea what the numbers are (they are the coin price).
- 1:30 Why does Clay Depot cost 3 and Rock Face nothing? My city shows card thumbnails only, nothing says what I make. I can't plan purchases.
- 2:00 Rival chains extra-turn wonders and takes three wonders in Age I. Points go 10 vs 1. It happened in a blur: no moment, the pawn moved a few pixels.
- 2:30 Military: the pawn moves one cell, tiny. No "war!" moment. Science: no "pair" moment I could notice.
- 3:00 End of Age I. I had no idea whether I was doing well or why.

Dead or boring stretches: tapping cards one by one only to read them (most of every turn); waiting while the rival chains extra turns.

## Three full games (bot + hand, Easy/Normal) - where the fun should be and isn't
- The fun of the original: (1) the pyramid tug of war, every card you take opens cards for the rival; (2) the war pawn racing toward a city; (3) collecting science pairs for tokens and a sudden science win; (4) chains that make later cards free; (5) wonders as big payoffs and extra turns.
- In our build (1) is invisible, (2) and (3) have no payoff, (4) is hidden in the zoom text, (5) is a sound only. The rules are right (rules-test, endline-test pass); the game is not shown.

## Benchmark: the official app of the original game, on a phone
The official app (landscape, but the same pieces) shows:
- Cards: the effect strip across the top of every card (resource icons, shields, points, science symbol) is the first thing you read; the price sits apart; names are small. Covered face-up cards are readable.
- Your city: resource production totals per player always on screen, plus the trade price for each resource.
- Choosing: tap a card, it lifts, and Build shows the full price (with trade cost), Discard shows coins, Wonder slides your wonders in. You see what you get before you commit.
- Military and science: the pawn slides with a clash sound and a flash; pairs light up and the token row opens. Wonders get a full-card flourish.
- Rival turn: one card lifts, flies to their city, about a second.

## The 5 biggest gaps (why it is unplayable / not fun)
1. Cards are unreadable at a glance: name is the biggest thing, the effect is a tiny icon covered by the price badge. You must tap every card just to read it.
2. Your economy is invisible: no "what my city makes", wonder prices are bare numbers, so costs feel random and you can't plan.
3. The pyramid's core tension is hidden: covered cards are black blobs and nothing shows which cards your take opens for the rival.
4. Choices have no visible consequence: before committing you see "Makes 1 stone", not "Pawn 1 step", "Science 2 of 6", "+3 points", "Opens 2 for rival".
5. No payoff: military, science pairs and wonders resolve silently (a pawn nudge, a sound). Nothing to cheer or fear.
