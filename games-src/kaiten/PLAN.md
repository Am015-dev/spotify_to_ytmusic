# Kaiten Kitchen — build plan

A conveyor-belt sushi card-drafting game for the Game Night Shelf, faithful to the rules of a well-known
2013 sushi drafting card game. Original names, card text and art ("conveyor-belt diner" look).
Card scans supplied by the user are a PRIVATE rules reference only (game-night-private/sushi-research);
they never enter this repo, the site or any artifact.

## Rules (base game)
- 2–5 players, 3 rounds. Hand size: 2p 10, 3p 9, 4p 8, 5p 7.
- Each turn everyone secretly picks 1 card from their hand, all reveal at once, then hands pass left.
  Round ends when hands are empty; score; discard all but desserts; deal again (round 2 passes right? NO —
  always pass left in the base game).
- Deck 108 cards:
  - 14 tempura (pair = 5, unpaired 0), 14 sashimi (set of 3 = 10, else 0),
  - 14 dumplings (1/2/3/4/5+ = 1/3/6/10/15),
  - maki rolls: 12 × 2 icons, 8 × 3 icons, 6 × 1 icon. Most icons 6, second most 3. Ties for most split 6
    (rounded down) and no second place is given; ties for second split 3 (rounded down). Players with 0
    icons never score maki.
  - nigiri: 10 salmon (2), 5 squid (3), 5 egg (1).
  - 6 wasabi: the next nigiri you play goes onto it and is tripled; a wasabi with no nigiri scores 0.
  - 4 chopsticks: on a later turn you may pick 2 cards from the hand you are holding, then put the chopsticks
    back into that hand (they pass on).
  - 10 puddings: kept until the end of the game. Most puddings +6, fewest −6 (ties split, rounded down).
    In a 2-player game nobody loses points for fewest. If everyone has the same number, nobody scores.
- Winner: most points; tie broken by most puddings.

## Stages (one owner per file set)
1. Engine + AI + tests — game/src/data.js, engine.js, ai.js; game/rules-test.js, gauntlet.js, cover.js,
   hidden-test.js. Global `KK`: newGame/moves/apply/stripView/score/AI.
2. Art kit + audio — kit/ (KKKit: cards, plates, conveyor belt, diner counter, chefs/players), audio in
   games-src/audio/kaiten/ (real CC0 only, logged in games-src/audio/ASSETS.md).
3. UI (phone-first, board-first desktop) + online (netstrip, p2p tests) — after 1 and 2.
4. Cover, shelf entry, deploy — main session.
