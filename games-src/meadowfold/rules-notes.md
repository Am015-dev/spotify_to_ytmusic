# Meadowfold rules notes (own words)

Adaptation of a 2024 landscapes-and-animals tile-token game. Rules and components match the original one for one; only names, wording and art are ours.
Sources (research kept out of the repo): the publisher's official English rulebook PDF (read in full, diagrams included), a structured card
transcription from a licensed digital edition (Apache-2.0 bot project), cross-checked against an independent open implementation whose tests
reproduce the rulebook's 116-point scoring example.

## Components (all in data.js; counts asserted by rules-test.js)
- 120 landscape tokens in a pouch: 23 water (blue), 23 mountain (grey), 21 trunk (brown), 19 leaves (green), 19 field (yellow), 15 building (red).
- Central board: 5 pockets of 3 tokens (solo side: 3 pockets).
- 32 animal cards: a habitat pattern of 2-4 hexes with one home hex, and a track of 2-5 animal cubes over rising point values.
- 10 spirit cards (advanced variant, in the base box): a habitat pattern + an end-game bonus; one spirit cube.
- Valley boards, double-sided: side A 23 hexes (columns 5,4,5,4,5), side B 25 hexes (columns 4,3,4,3,4,3,4). Short columns sit half a hex lower.
- Animal cubes: 75 in the box; the supply never runs out in play, so the game does not count them.

## Setup
Pouch holds all 120 tokens; fill every pocket with 3 random tokens. Shuffle the 32 animal cards, 5 face up (solo 3), rest a draw pile.
Everyone uses the same board side. Spirit variant: deal 2 spirits each; on your first turn keep 1 (with its cube), the other goes to the box.

## Turn (any order, optional actions can sit between token placements)
- Mandatory: take all tokens of one pocket and place them all on your board.
- Optional, once: take one face-up animal card and load its cubes. Never more than 4 unfinished cards (an unsettled spirit counts).
- Optional, any number: settle an animal. If the card's habitat is on your board (any rotation, no mirror image), put the card's
  lowest cube on the home hex. One cube per hex; a token may belong to several habitats. A finished card leaves the limit.
- End: refill the emptied pocket from the pouch; refill the card row to 5 (solo 3).

## Stacking
Any token on an empty hex. Mountain: grey on grey, up to 3. Tree: leaves on 0, 1 or 2 trunks (trunk on one trunk max); nothing on leaves.
Building: red on exactly one grey, trunk or red; nothing on it. Water and fields never stack and take nothing on top. Nothing goes on a hex with a cube.
Habitat hexes must match exactly: tree and mountain heights exact, a building is red on one token (height 2).

## End
Triggered when the pouch is empty at a refill, or when a player ends a turn with 2 or fewer empty hexes. Finish the round so all had equal turns.
Winner: most points; tie: most animal cubes on the board; still tied: shared win.

## Scoring
Trees 1/3/7 by height (bare trunks 0). Mountains 1/3/7, only when touching another mountain. Fields 5 per group of 2+.
Buildings 5 when at least 3 different top colours touch it. Side A river: tokens on the longest shortest-path through connected water:
2=2, 3=5, 4=8, 5=11, 6=15, +4 per extra. Side B islands: 5 per land area (empty hexes count as land) separated by water, at least 1.
Animal card: the highest uncovered value (not a sum). Spirit (if settled): its bonus.
Spirit bonuses: fields 2 per group of 1-2, 10 per group of 3+ | 5 per field group (singles too) | +4 per tree of height 2-3 | trees 3/3/1 by height |
+4 per group of buildings | +6 per group of 2+ buildings | +4 per mountain of height 2-3 (isolated too) | mountains 3/3/1 by height |
+7 per water group of 2+ | +2 per water token.

## Solo
3 pockets, 3 face-up cards. After each turn the other two pockets go to the box and all three refill. If you took no card you may swap one
face-up card for the top of the pile. Suns: 40/70/90/110/130/140/150/160 points = 1-8 suns; +1 sun on side A; +2 with no spirit, +1 with a
group-type spirit (fields, buildings, water groups), +0 with a count-type spirit.

## Simplified on purpose
Nothing in the rules. Digital conveniences only: Undo inside your own turn (no hidden information is revealed before the turn ends),
a hint button, and a tutorial that starts from a scripted pocket and card (the tokens are swapped with the pouch so counts stay exact).

## Former [unverified] items (fixer F1, 20 Nov 2026)
Settled (each has a rules-test assert):
- Mirror images: the rulebook allows turning a habitat. A check of all 42 habitats shows each one equals its own mirror image
  turned some way, so allowing or banning mirrors never changes a game. Engine: rotation only (same result).
- Empty animal pile: the row refills "while cards remain"; with none left it stays short. No other rule applies.
- Tie-break: the rulebook counts animal cubes on the board. The spirit cube is not an animal cube and does not count.
- First player: the rulebook leaves it to the table (a flavour line). Seat 1 starts; the round always finishes, so turns stay equal.
## Fixer F2 (20 Nov 2026): checked against the official rulebook text
Settled (rules-test asserts each):
- Solo suns: 40/70/90/110/130/140/150/160 = 1-8 suns; side A +1, side B +0; no spirit +2; with a spirit the card's icon gives
  +1 ("groups of landscapes": both field spirits, both building spirits, water groups) or +0 ("number of landscapes": trees,
  mountains, every water token). The rulebook example (130 points, side A, field-groups spirit = 7 suns) is a test.
- Solo setup: 3 central spaces, 3 face-up cards, the other 6 tokens go to the box, all spaces refill, a swap when no card was taken.
- 32 animal cards, 10 spirit cards, 4 spirit cubes, 75 animal cubes (the rulebook's component list). The 32 card tracks hold 96
  spaces; no gauntlet game used more than 75 cubes, so the supply never runs short in practice (asserted).
- Side B water: 5 per island, an island is land split off by water, at least 1 (already so).
Still unknowable from the rule text (needs the printed pieces):
- Side B column shape (we use 4,3,4,3,4,3,4 = 25 hexes) and the exact hex count of each side; the rule text gives no numbers.
- Which spirit card carries which sun icon (we map by what the card counts, as above).
- Each card's habitat and track as printed (a structured transcription, not compared with the printed art), so the
  track-length mix (9 cards of 2, 16 of 3, 5 of 4, 2 of 5) is unverified too.
- What happens if the 75 animal cubes run out (the rulebook is silent; it does not happen in play).
