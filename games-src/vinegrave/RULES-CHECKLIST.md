# Vinegrave rules checklist (W438)

Every rule of the published rulebook this game adapts (name deliberately not written), numbered. Each id has exactly one headless assertion
in `logic-test.js` against the real engine (`node logic-test.js`; failure line = rule id, expected, got). `node logic-test.js --md` prints this list.
Sources: knowledge of the rulebook plus a public rulebook summary page (8 Nov 2026); facts only, nothing copied.

Numbers that are the game's own on purpose (not rules; see rules-notes.md): every card, site, guardian and idol value, the research row costs,
bonuses and points, empty shrine slot values (1,1,1,2), compass costs to discover (3 / 6), temple arrival points (10/8/6/4). Tests for these
check that the engine applies its own table exactly, not that it equals the printed number.

Known open (not fixed, reason): A13/A14/A15 box has 6 level-II sites, 16 idols, 40 items; the game has 8 / 12 / 35 (content and art slots in
assets.json, needs new cards/pictures). H4 exile from the play area: needs a UI change (the exile picker reads the discard pile, W427 owns UI).
K3 the rival stack is 8 tiles, not 10 (our own rival design, changing it needs a solo balance sign-off). Also simplified on purpose, no test:
guardian boons that are travel values, free-action (lightning) cards, bonus tiles in the temple, blocking tiles, the other board side.
FIXED2 r2: research assistants are now built (section L: offer of 3, hire on rows 2/5 with the magnifier, gold upgrade with the notebook,
once a round free, max 2; names, abilities, rows and the limit are our own).

## A. Setup

- **A1** Each explorer starts with a 6-card deck: 2 Dread (fear), 2 funding (+1 coin), 2 exploration (+1 compass).
- **A2** Each explorer draws an opening hand of 5 cards (1 card stays in the deck).
- **A3** Starting resources by turn order (4 players): 2 coins | 1 coin 1 compass | 2 coins 1 compass | 1 coin 2 compasses; nothing else.
- **A4** Each player has 2 explorers, both off the board at the start.
- **A5** Magnifier and notebook both start at the bottom of the research track.
- **A6** Five camp sites are open for digging at the start; no hidden ruin is discovered yet.
- **A7** Dread supply: 19 Dread cards in the game; each starting deck uses 2, the rest wait in the supply.
- **A8** Card row has 6 slots; round 1 shows 5 items and 1 artifact.
- **A9** Game starts at round 1 with seat 0 as starting player.
- **A10** Component count: 19 Dread cards.
- **A11** Component count: 15 guardians.
- **A12** Component count: 10 level-I site tiles.
- **A13** Component count: 6 level-II site tiles.
- **A14** Component count: 16 idols.
- **A15** Component count: 40 item cards.
- **A16** Component count: 35 artifact cards.

## B. Rounds and turns

- **B1** A turn is exactly one main action (play an item card), then play passes to the next explorer.
- **B2** Passing is a main action; a passed player is skipped for the rest of the round (3 players: 0 passes, 1 acts, 2 acts, then 1 again).
- **B3** If everyone else has passed, the last player takes turns one after another.
- **B4** The round ends when all players have passed: next round starts, explorers return to the board owners.
- **B5** Free actions (a guardian boon) do not end the turn.
- **B6** The starting marker passes one seat each round: round 2 starts with seat 1.
- **B7** The game lasts 5 rounds: after round 5 everyone passes, the game is over and no round 6 starts.
- **B8** At the start of a round each player draws up to 5 cards.
- **B9** Unplayed hand cards may be kept for the next round.
- **B10** A played card goes to the play area and stays there until the end of the round.
- **B11** End of round: the play area is shuffled and put on the BOTTOM of the deck (no separate discard pile, no reshuffle of the whole deck).
- **B12** Items bought this round sit above the shuffled play area in the deck (deck order: old deck, bought items, then the played cards).
- **B13** Card row each round end: the item and the artifact beside the moon staff are exiled and the row refills: items 5,4,3,2,1 and artifacts 1,2,3,4,5 in rounds 1-5.
- **B14** The two cards beside the moon staff leave the game for good (not back in the row or the decks).
- **B15** Passed flags are cleared when the new round starts.

## C. Dig at a site

- **C1** Dig: pay the travel icon by discarding a card from hand to the play area, move an explorer to the site, take its loot.
- **C2** A Boot cost can be paid by any travel icon.
- **C3** A Plane pays any icon (Jeep, Boat or Boot).
- **C4** A Jeep cannot pay a Boat and a Boat cannot pay a Jeep.
- **C5** Two coins always hire a Plane (pays any icon); one coin does not.
- **C6** A two-icon cost is paid by two separate cards; one card cannot pay both.
- **C7** A Dread card can pay one Boot of travel.
- **C8** A site already holding an explorer cannot be dug again.
- **C9** You cannot dig or discover when both explorers are already on sites.
- **C10** Digging puts the explorer on the site and uses one of the two explorers; it is a main action (turn passes).
- **C11** You cannot dig a site when you cannot pay its travel.
- **C12** A Boat site needs a Boat or Plane (or 2 coins): Boot cards cannot dig it.

## D. Discover a new site

- **D1** Discover: pay the compass cost of the level, take an idol and its gift at once, and the new tile loot at once (all five resources checked).
- **D2** Discovering a level-II site costs more compasses than level I.
- **D3** Discover also pays the travel cost (cards go to the play area).
- **D4** The site tile placed is the top tile of the level stack, face up.
- **D5** The top guardian is placed on the new site and the explorer stands there.
- **D6** Cannot discover without enough compasses.
- **D7** Cannot discover with no free explorer.
- **D8** A discovered site is later dug for travel only (no compasses), and cannot be discovered again.
- **D9** A level-II site takes its tile from the level-II stack.
- **D10** A hidden site cannot be dug before it is discovered.

## E. Guardians and Dread

- **E1** End of round: an explorer still standing on a guardian site brings home a Dread card from the supply (even if it did not wake that guardian).
- **E2** You can only overcome a guardian on a site where your own explorer stands.
- **E3** Overcoming pays the guardian cost, removes it from the site, and keeps it beside your board (5 points).
- **E4** An overcome guardian means no Dread at round end.
- **E5** A guardian boon can be used once per game, as a free action.
- **E6** An overcome guardian is worth 5 points whether or not its boon was used.
- **E7** Overcoming is a main action (turn passes) and the explorer stays on the site until the round ends.
- **E8** Cannot overcome a guardian you cannot pay for.
- **E9** When the Dread supply is empty, the explorer takes a fear tile (-2 points) instead of a Dread card.

## F. Idols and shrine slots

- **F1** Each idol is worth 3 points at the end.
- **F2** Setting an idol in a slot is a free action (the turn does not end) and gives the chosen effect at once (3 coins).
- **F3** Each idol offers a choice of five slot effects.
- **F4** Empty slots score their printed value at the end; an idol set in a slot fills the leftmost empty slot and keeps its own 3 points.
- **F5** Free actions are unlimited: two idols can be set in the same turn.
- **F6** Only 4 slots: a fifth idol cannot be set.

## G. Buy a card

- **G1** Buy an item: pay its coins, it goes face down to the BOTTOM of your deck (not hand/discard), the row refills with an item.
- **G2** Cannot buy an item without enough coins.
- **G3** Buy an artifact: pay compasses, it goes to the play area and its effect fires at once with no tablet paid.
- **G4** Buying an artifact is a main action (turn passes).
- **G5** An artifact played from hand costs 1 tablet.
- **G6** When a card stack is empty, that slot is not refilled (no card of the other type slides in).
- **G7** Bought artifact effects that need a choice pause for the answer, then the turn ends.

## H. Play a card

- **H1** Playing a starting coin card gives its effect as a FREE action: +1 coin, still your turn.
- **H1b** Playing a starting compass card is free too; you can play both and still take a main action.
- **H1c** Playing an item card for its effect uses the main action.
- **H2** Dread cards have no effect and cannot be played.
- **H3** Exile removes a card from the game for good (hand card exiled, then the rest of the effect).
- **H4** Exile can also take a card from your PLAY area (including the card just played).
- **H5** Draw effects draw from the top of the deck.
- **H6** A free research step card moves the notebook up one row (never past the magnifier).

## I. Research track and temple

- **I1** Research: pay the row cost, move the magnifier up one row, take the row bonus.
- **I2** The notebook may never rise above the magnifier (equal is fine).
- **I3** Each arrival (magnifier or notebook) takes the row bonus.
- **I4** First-arrival reward: only the first magnifier to a row takes the extra reward; every arrival takes the row bonus.
- **I5** Magnifier in the temple (top row) scores by order of arrival: first 10, second 8 (points).
- **I6** The notebook can never enter the temple row.
- **I7** Magnifier already in the temple: research buys a temple tile instead. A 6-point stack needs two of the three costs, the 11-point stack needs all three.
- **I8** Buying a temple tile removes it from its stack, scores its points and uses the main action.
- **I9** An empty temple stack cannot be bought from.
- **I10** Research is a main action (turn passes) and the magnifier cannot move past the temple.
- **I11** Research cannot be done without paying the row cost.

## J. Scoring and end of game

- **J1** Research points come from final token rows (notebook row 3 + magnifier row 4).
- **J2** Temple tiles score the points shown on each tile.
- **J3** Overcome guardians score 5 each.
- **J4** Cards in the deck score their printed points (items and artifacts, all zones).
- **J5** Dread cards score -1 each; fear tiles -2 each.
- **J6** Leftover resources are worth nothing.
- **J7** Total = research + temple + idols + empty slots + guardians + cards - fear (worked example).
- **J8** The player with the most points wins at the end of round 5.
- **J9** Tie on points: the player who reached the temple first wins.
- **J10** Tie on points and nobody reached the temple: the higher research score wins.
- **J11** Any remaining tie stands (shared win).
- **J12** Round 5 ends with explorers returning and Dread for guardian sites, then straight to scoring (no row change).

## K. Solo variant

- **K1** Solo: you play second and start with 1 coin and 1 compass.
- **K2** Solo: the rival is the starting player every round, so it takes a tile before your first action.
- **K3** Solo: the rival action stack has 10 tiles per round.
- **K4** Solo: the rival keeps playing its tiles after you pass, until all are used.
- **K5** Solo: the rival overcoming a guardian scores 5 points.
- **K6** Solo: the rival discovering a site takes an idol worth 3 points.

## L. Research assistants

- **L1** Setup: 12 assistants, silver side up, in 3 stacks of 4; nobody has one.
- **L2** Notebook onto a silver-symbol row: choose the top assistant of a stack; it joins silver side up; then the turn ends.
- **L3** The magnifier on that row recruits nobody (assistants come from the notebook).
- **L4** Notebook onto a gold-symbol row: flip one assistant to gold, and it is refreshed even if used this round.
- **L5** Using an assistant turns it sideways (once a round); a free-action assistant does not end the turn.
- **L6** All assistants are refreshed at the end of the round.
- **L7** The gold side has the stronger effect.
- **L8** Two assistant squares: with 2 assistants a recruit can only upgrade.
- **L9** The discount assistant (no free-action icon) is your main action: buy an item or artifact 1 cheaper (2 when gold).
- **L10** The choice assistant gives a coin or a Plane; the Plane pays a travel icon this turn.
- **L11** The travel assistant needs a Boot of travel (paid like a dig) to make an arrowhead.
- **L12** A free notebook step (a boon) onto a silver-symbol row also recruits.

## M. Free items, travel boons, temple, blocking, exile

- **M1** A lightning (free-action) item is played without using your main action.
- **M2** A travel boon pays a travel cost like a card, once; then it is used.
- **M3** Temple stacks: one 11, two 6 and three 2 point stacks, each with as many tiles as players.
- **M4** A 2-point temple tile pays one of the three costs.
- **M5** Magnifier reaching the Lost Temple: choose one bonus tile from a stack of as many tiles as players.
- **M6** Blocking tiles: 2 players block all 5 camp second spaces, 3 players block 3, 4 players none.
- **M7** With 4 players two explorers can dig at the same camp (its second space).
- **M8** Exile can take a card from your play area.

TOTAL 132
