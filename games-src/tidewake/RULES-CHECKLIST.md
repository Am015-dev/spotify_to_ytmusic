# Tidewake rules checklist

One numbered entry per rule of the original rulebook and its expansion, in our own words and names (current = wake tile, leviathan = monster, Rift Gate, Rogue Wave, Maelstrom, Deck Cannon). Every entry marked TEST has exactly one assertion in `logic-test.js` with the same number (`node logic-test.js`). Written from the rulebook text recorded in `rules-notes.md` and a web search; items the sources disagree on are listed at the end.

Source tags: base = base game, exp-gate / exp-wave / exp-mael / exp-cannon = the expansion pieces, variant = official variants.


## A. Components and set-up

1. **[base]** The wake deck has 56 wake tiles, all different cards; with no expansion nothing else is in it. — TEST R1
2. **[base]** Every wake tile joins its 8 edge points (2 per side) in 4 pairs; the 35 distinct tiles are exactly the 35 ways to pair 8 points up to turning, and the 56 tiles are those 35 plus 21 repeats. — TEST R2
3. **[base]** A tile can be turned to any of 4 positions (quarter-turns): every exit moves 2 ports clockwise per turn, and an exit port lies on the side port>>1 (0 N,1 E,2 S,3 W). — TEST R3
4. **[base]** There are 10 leviathan tiles in the base game, all different. — TEST R4
5. **[base]** Each player is dealt 3 tiles face down (2 to 8 players). — TEST R5
6. **[base]** Leviathans at the start: 6 with 2-4 players, 5 with 5-6, 4 with 7-8. — TEST R6
7. **[base]** Start leviathans are put on the rolled square (gold die = column, blue die = row, each 1-6); a square already taken means roll again. — TEST R7
8. **[base]** A newly placed leviathan is turned to a random facing. — TEST R8
9. **[base]** The first player starts and play goes clockwise (seat order from the first player, to the left). — TEST R9
10. **[base]** Every ship is put on a start mark on the outer edge, in turn order, and ALL ships are placed before any tile is played. — TEST R10
11. **[base]** Two ships cannot start on the same start mark, and a start is never offered in front of a leviathan. — TEST R11

## B. Turn structure

12. **[base]** A turn is, in order: roll both dice (leviathans may move), place a tile in front of your ship, move your ship, draw back to 3. — TEST R12
13. **[base]** Monsters move only when the two dice total 6, 7 or 8. — TEST R13
14. **[base]** You place a tile on the open square in front of your ship (the square it faces), turned any way; the tile then stays there. — TEST R14
15. **[base]** After placing, your ship moves along the wake line it entered, tile after tile, to the open end. — TEST R15
16. **[base]** If the new tile extends another ship's wake, that ship also moves along it to its open end. — TEST R16
17. **[base]** A ship follows a chain of already placed tiles through to the end. — TEST R17
18. **[base]** Ships do not collide while passing: two ships may use the same tile (different lines) without harm. — TEST R18
19. **[base]** At the end of your turn you draw from the top of the draw pile back up to 3 tiles. — TEST R19
20. **[base]** When the draw pile is empty nothing is drawn; a player without tiles has no tile to play and passes. — TEST R20
21. **[base]** An eliminated player takes no more turns; play passes to the next ship still afloat. — TEST R21

## C. Placement prohibitions and elimination by placement

22. **[base]** You may not place a tile that sends your own wake to the board edge, unless every legal tile does. — TEST R22
23. **[base]** A ship whose open wake end reaches the board edge is eliminated (forced case). — TEST R23
24. **[base]** You may not place a tile that makes your wake loop forever (unless forced). — TEST R24
25. **[base]** You may not place a tile that joins your wake to a leviathan tile (unless forced); if forced, you are eliminated. — TEST R25
26. **[base]** You may not place a tile that puts two ships on the same wake travelling the same way (unless forced). — TEST R26
27. **[base]** If two ships are forced onto the same wake going the same way, they are both eliminated. — TEST R27
28. **[base]** Head-on: two ships whose wakes are joined end to end each run back along the other wake and are eliminated at the start edge. — TEST R28
29. **[base]** The tile you place can eliminate OTHER players too; the last ship afloat wins at once. — TEST R29
30. **[base]** If the last ships all go down on the same placement, they all win (shared win). — TEST R30
31. **[base]** Elimination bonus: when your tile eliminates opponents, you may swap tiles of your hand for the same number from their hands; the rest go to the bottom of the pile; you still draw to 3. — TEST R31
32. **[base]** Eliminated players' tiles go to the bottom of the draw pile (no bonus when a leviathan or the sea did it). — TEST R32

## D. Leviathans (base game)

33. **[base]** Leviathans move in ascending order of the number in the tile corner; on a tie the one with the gold arrow goes first. — TEST R33
34. **[base]** Each leviathan rolls ONE die, in that order: its own arrow for that number is followed. — TEST R34
35. **[base]** A move arrow moves the leviathan one square in that direction, turned by the tile's facing; the rotation arrow turns it one quarter in its own direction. (all 5 faces x 4 facings) — TEST R35
36. **[base]** A 6 means that leviathan stays put and a new leviathan is placed (rolled square). — TEST R36
37. **[base]** A leviathan pushed off the board is removed from play (never returns). — TEST R37
38. **[base]** A leviathan moving onto a wake tile removes it (to the bottom of the draw pile), takes the square and eliminates ships on it. — TEST R38
39. **[base]** A leviathan moving onto another leviathan destroys the stationary one (removed from play). — TEST R39
40. **[base]** A leviathan that moves in front of the ACTIVE player's ship eliminates that ship (it blocks the tile). — TEST R40
41. **[base]** A ship NOT on turn is not hurt when a leviathan lands in front of it; it is eliminated when its own turn starts. — TEST R41
42. **[base]** If a leviathan blocks your start square you may move your ship to another start mark on the same edge with no tile and no leviathan. — TEST R42
43. **[base]** Minimum of 3 leviathans: if movement leaves fewer, the next player rolls to place up to 3 and does NOT roll for movement that turn. — TEST R43
44. **[base]** The minimum of 3 counts leviathan tiles only (a Rogue Wave or Maelstrom does not count). — TEST R44
45. **[base]** A leviathan placed (rolled square) on a wake tile removes the tile and eliminates ships on it. — TEST R45
46. **[base]** When no leviathan tile is left to place, nothing happens (no crash, nothing placed). — TEST R46
47. **[base]** Variant "No Leviathan": no leviathans are placed and the dice never move anything. — TEST R47

## E. Ending the game (base)

48. **[base]** The last ship afloat wins. — TEST R48
49. **[base]** If every ship is lost at once (same event), all of those ships share the win. — TEST R49
50. **[base]** There is no scoring: the game only ends by elimination (play continues with 2+ ships afloat). — TEST R50

## F. Expansion: Rift Gate

51. **[exp-gate]** The Rift Gate (1 tile) is shuffled into the wake deck. — TEST R51
52. **[exp-gate]** You may play the Rift Gate instead of a wake tile; it goes on the open square in front of your ship and does not replace any tile. — TEST R52
53. **[exp-gate]** Ships on the gate square are carried off: each rolls two dice for a square (gold column, blue row); on a square with no tile you place a tile and then choose which wake and direction to ride. — TEST R53
54. **[exp-gate]** If the target square already has a tile, you choose which of its wakes and which direction to ride. — TEST R54
55. **[exp-gate]** With several ships on the gate square they are moved one at a time in play order, the active player last. — TEST R55
56. **[exp-gate]** A ship whose wake runs into the gate square is carried through the gate instead of being lost. — TEST R56
57. **[exp-gate]** Rescue: when a ship is about to be eliminated its owner may play the Rift Gate, even on another player's turn; the owner then holds only 2 tiles until their own turn ends. — TEST R57
58. **[exp-gate]** Leviathans that move into the gate are carried to a rolled square; the gate stays on the board all game. — TEST R58

## G. Expansion: Rogue Wave

59. **[exp-wave]** The Rogue Wave tile is shuffled into the leviathan deck (11 tiles in all). — TEST R59
60. **[exp-wave]** When drawn it is placed like a leviathan (rolled square), turned to a random facing, and it is not a leviathan for the minimum of 3. — TEST R60
61. **[exp-wave]** The wave's "row" is the line of squares to its left and right (across its direction of travel) plus its own square. — TEST R61
62. **[exp-wave]** Strength: 2 when placed, 3 in rounds 2 and 3, 4 from the fourth round on (until it leaves). — TEST R62
63. **[exp-wave]** A ship in the row must roll at least the wave strength on one die or capsizes (eliminated); at strength 2, 3, 4. — TEST R63
64. **[exp-wave]** A ship moved into or through the row by a tile placement must roll at once. — TEST R64
65. **[exp-wave]** The wave moves one square once per round, before the placer's next turn (not in the round it was placed); the active player in the new row rolls. — TEST R65
66. **[exp-wave]** The wave passes over tiles without destroying them. — TEST R66
67. **[exp-wave]** When the wave moves off the edge it leaves the game (not back into the leviathan deck). — TEST R67

## H. Expansion: Maelstrom

68. **[exp-mael]** The Maelstrom tile is shuffled into the leviathan deck (11 tiles) and placed like a leviathan when drawn. — TEST R68
69. **[exp-mael]** It moves only on turns when the leviathans do NOT move (the dice total is not 6, 7 or 8): one die, one square. — TEST R69
70. **[exp-mael]** Die faces 1-4 move it one square in four different directions; 5 and 6 mean no move. — TEST R70
71. **[exp-mael]** Everything in the square it enters is removed: the wake tile (out of the game, not recycled), ships on it, and leviathans. — TEST R71
72. **[exp-mael]** A Maelstrom that leaves the board is removed from the game. — TEST R72
73. **[exp-mael]** A leviathan that moves into the Maelstrom's square is removed too. — TEST R73

## I. Expansion: Deck Cannon

74. **[exp-cannon]** 5 Deck Cannons are shuffled into the wake deck. — TEST R74
75. **[exp-cannon]** When you draw a Deck Cannon you may keep it, or show it and discard it (out of the game) and draw a replacement. — TEST R75
76. **[exp-cannon]** You may hold at most 2 Deck Cannons; a further one drawn is discarded and replaced. — TEST R76
77. **[exp-cannon]** Instead of a wake tile you may fire a cannon at a leviathan next to your wake: it is destroyed, goes to the BOTTOM of the leviathan deck, the cannon leaves the game, and you still draw. — TEST R77
78. **[exp-cannon]** Any time a ship is about to be eliminated by a leviathan (even on another player's turn) its owner may fire a cannon to destroy it; the ship is saved. — TEST R78
79. **[exp-cannon]** A leviathan destroyed by a cannon counts against the minimum of 3 (the next turn tops it up without a movement roll). — TEST R79

## J. Variants

80. **[variant]** Solo: set up as a 2-player game (6 leviathans); you win by getting through all 10 leviathans, you lose if your ship goes down. — TEST R80
81. **[variant]** Easy solo: tiles destroyed by leviathans are discarded (not recycled) and you win by sailing through all the tiles. — TEST R81
82. **[variant]** Teams: 4, 6 or 8 players in two teams; you may place a tile in front of your own or a teammate's ship (never an opponent's). — TEST R82
83. **[variant]** Teams: the last team with a ship afloat wins (all its members). — TEST R83
84. **[variant]** Two players use the ordinary rules (same set-up as 3-4 players). — TEST R84

## K. Table-only rules (cannot be checked headless; kept for the record)

85. **[base]** The oldest player goes first (the app lets the host or the dice choose the first seat instead). — TABLE-ONLY, no test
86. **[base]** Tiles in hand are kept hidden from the other players (the app shows each player only their own hand). — TABLE-ONLY, no test
87. **[base]** Teams: teammates may not show each other their tiles (a table courtesy; the app hides hands). — TABLE-ONLY, no test
88. **[exp-wave]** The blue Rogue Wave marker tile sits on the board edge to show where the wave is heading (the app draws the wave directly). — TABLE-ONLY, no test

## L. Turn timing (found in the W498 playthrough)

89. **[base]** A ship blocked by a leviathan at the start of its turn rolls first: if the leviathans move it away, the ship survives and plays. — TEST R89

## Rules the sources do not settle (our decisions; not scored as failures)

- Board size: sources say 6x6, 7x7 or 8x8; the dice only reach 1-6. We keep 6x6 (planner decision, see `game/RULES-AUDIT.md` 2). Consequence: "last available square" and "play every tile" endings are not reachable in practice.
- Which leviathan has which arrows and corner numbers, and the exact 21 repeated wake tiles: not published in the text found; our own layouts (`src/data.js`).
- What happens when two ships are forced onto one wake in one direction: sources only forbid placing it; we eliminate both.
- Easy solo: the sources give no start count or turn goal; the engine starts with 4 leviathans and adds a 24-turn win because a 6x6 board cannot hold all 56 tiles.
- Leviathan beside a waiting ship: the rulebook text gives an exception for a second ship on the same side of the same tile facing the same way; the engine kills only the active ship whose front square is entered (see `game/RULES-AUDIT.md` 6). Not testable from the sources, so not scored.
- Maelstrom arrows (which die face goes where) and Rogue Wave tile arrows: our own layout.
