# Cauldron Fair: build plan

A push-your-luck potion-brewing game for the Game Night Shelf, faithful to the rules of a well-known 2018 potion-brewing
bag-building game (base box, 2 to 4 players). Original names, card text and art (a night fair of village brewers).
The official rulebook and fan transcriptions are a PRIVATE rules reference only (game-night-private/cauldron-fair-research);
they never enter this repo, the site or any artifact. Real names appear only in private research data.

## Rules (base game, see rules-notes.md for the full table and the Confirmed vs guessed list)
- 9 days. Everyone brews at the same time out of their own bag: draw a chip, place it that many spaces along the spiral.
- White chips (Fizzpods) total over 7 explodes the pot: choose points OR coins, no bonus die. The flask puts the last white back.
- Day order: fortune card, brew, then evaluation (bonus die, chip powers, rubies, points, shop for two different colours,
  rubies for droplet or flask). Rat tails give players behind a head start. Day 9: no shop, 5 coins and 2 rubies become points.
- Four sets of ingredient books (beginner, 2, 3, 4) or a random mix.

## Stages
1. Research + rules-notes.md + src/data.js (done first; every track space, card and book).
2. Engine + AI + tests (src/engine.js, ai.js; rules-test, gauntlet, cover, hidden-test).
3. Art kit + paint generator (kit.js, paint/), audio (audio/, real CC0 only, logged in games-src/audio/ASSETS.md).
4. UI (phone-first, board-first desktop), painted PixiJS table, online (netstrip, p2p tests).
5. Main session: cover, shelf entry, deploy. Expansions (the original first and second expansions) are a later phase, not started.
