# Sunglaze: rules notes (adapted from the original game, 2017)

Built from `../rules.md` and `../data.json` (sources S1–S12 listed there). The page uses our own names:

| Generic term | Sunglaze |
|---|---|
| Factory display | Kiln (round coaster) |
| Centre of the table | Courtyard |
| Starting-player marker | Sun token |
| Pattern lines | Drying racks |
| Wall | Mosaic |
| Floor line | Breakage |
| Box lid | Shard box |
| Bag | Clay sack |
| Blue, yellow, red, black, white | Cobalt, Saffron, Garnet, Obsidian, Frost |
| Joker tiles (promo) | Prism tiles |
| Gray wall variant | Unmarked mosaic |

## Components
- 100 tiles, 20 of each of 5 colours.
- Factories: 2N+1, so 5, 7 or 9. Each is filled with 4 tiles.
- 4 two-sided boards. Each has 5 pattern lines (capacity 1 to 5), a 5×5 wall and a 7-space floor.
- The wall layout on the coloured side is `wall[r][c] = colours[(c − r) mod 5]`.
- Floor penalties: −1, −1, −2, −2, −2, −3, −3.
- Bonuses: +2 per complete row, +7 per complete column, +10 per colour with all 5 tiles on the wall.
- Joker promo: 2 players remove 1 tile per colour and add 5 jokers; 3–4 players remove 2 per colour and add 10 jokers.

## Turn and round
1. **Factory offer.** Take all tiles of one colour from one factory, and the rest of that factory goes to the centre. Or take all tiles of one colour from the centre.
   - The first player to take from the centre takes the marker and puts it on their floor first.
   - All the tiles go on one pattern line, filled right to left: one colour per line, and never a colour that its wall row already has. The overflow goes to the floor, and from a full floor to the lid.
   - A player may put tiles on the floor on purpose. Passing is not allowed.
   - The phase ends when all factories and the centre are empty.
2. **Wall-tiling.** Go top to bottom. Each full line moves one tile to the wall and the rest to the lid. The tile scores 1 if it touches nothing; otherwise the horizontal run (if 2 or more) plus the vertical run (if 2 or more).
   - Then apply the floor penalty, with a minimum score of 0.
   - Floor tiles go to the lid. The marker holder starts the next round.
3. **Refill.** Fill the factories from the bag. When the bag is empty, pour the lid into it. When both are empty, the remaining factories stay short.
4. **End.** The game ends after the wall-tiling of the round in which any player completes a horizontal row. Then add the bonuses.
   - The winner has the most points. Ties go to the most complete rows; if still tied, the win is shared.

## Variants in the build
- **Gray wall (official variant).** The player chooses any empty space in the row, but no colour may repeat in a row or a column. A full line with no legal space sends all its tiles to the floor (overflow to the lid).
  - This is interactive: humans pick the space in the dock or on the board.
- **Joker tiles (official promo).** Uses the counts above.
  - Take all jokers from one place, optionally with all tiles of one other colour there.
  - A line holds one colour plus jokers. From a full line with a joker, a joker goes to the wall.
  - An all-joker line may use any empty space in its row.
  - A joker blocks its colour in that row, counts for rows and columns, and never counts for the +10 colour bonus.

## Left out
- **The original 2020 expansion (two-sided boards).** Reviews confirm the idea: sides C and D have mostly gray walls with 5 pre-coloured spaces; C has ×2 spaces; D raises the bonuses to 3/10/12; there is a new floor line.
  - The exact positions of the coloured spaces are not in any source I could reach. The publisher PDF and the review sites were blocked by the proxy on 2026-09-29.
  - Which side uses the reported −1, 0, −1, −2, −1, −2, −3 floor is also unconfirmed. So it is left out rather than guessed.
- **The original special-factories promo.** The factory powers are undocumented in reachable sources.
- **Solo play.** The known solo mode is fan-made, not official.

## Assumptions
1. **Floor spaces 6 and 7 score −3**, not −2 (source S7 has a typo). This gives the printed −14 maximum and matches S2, S3 and S4.
2. **The marker and a full floor.** If a player takes the marker while their floor already holds 7 tiles, the last floor tile goes to the lid and the marker takes that space. The player still becomes start player, and the penalty is unchanged (−14).
3. **Wall-tiling order.** The rules have everyone tile at once. The build resolves players in turn order from the start player; boards don't interact, so the result is the same.
4. **Order of the tiles taken.** When not all taken tiles fit on the chosen line, the colour tiles fill the line first and the jokers overflow first. The floor penalty is the same either way.
5. **Jokers on the gray wall.** A joker from a line with a colour counts as that colour for the no-repeat rules. A joker from an all-joker line counts as no colour.
6. **Nobody takes from the centre.** If no one takes from the centre in a round (every factory was single-colour), the marker stays and the same player starts again.
7. **No tiles anywhere.** If no tile at all can be dealt at the start of a round, the game ends. This is only possible in theory, with 4 players and almost every tile locked on boards; it never happened in testing.
8. **Rack choice on the gray wall.** The pattern-line restriction applies per row only. A player may fill a line with a colour whose only free columns are blocked; the tiles then drop at tiling, as the variant rule says.
9. **Start player of round 1** is random.
