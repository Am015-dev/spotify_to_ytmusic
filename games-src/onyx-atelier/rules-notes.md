# Onyx Atelier: rules notes

An adaptation of the top-ranked two-player duel version of the gem-merchant engine game. Rules and components are the original's,
one for one. Names, wording and art are ours. Every component with its count and effect: `COMPONENTS.md`. Tests: `rules-test.js`.

## Names
Privilege = Favour (scroll). Royal card = Patron. Reserve = Keep. Jewel tiers: Ring (I), Brooch (II), Tiara (III).
Powers: extra turn = Encore, take a token of the card's colour = Polish, take a privilege = Favour, steal = Pinch, wild bonus = Matching jewel.
Gems: Diamond (white), Sapphire (blue), Emerald (green), Ruby (red), Onyx (black), plus Pearl and Gold.

## Setup
- 25 tokens (4 of each gem, 2 pearls, 3 gold) go in the bag, then onto the board in the spiral from the centre.
- Pyramid: 3 Tiaras, 4 Brooches, 5 Rings face up. 4 Patrons on show. 3 Favours in the supply.
- The first player is random; the other player starts with 1 Favour.

## A turn
1. Optional, in this order: spend any number of Favours (each takes 1 gem or pearl from the board, never gold); then refill the board
   (only if the bag is not empty; the rival gains a Favour). No Favours after a refill.
2. Mandatory, one of:
   - Take 1, 2 or 3 gems/pearls in one straight line (row, column or diagonal), touching, no gaps, no gold. 3 of one colour, or 2 pearls,
     gives the rival a Favour.
   - Take 1 gold and keep 1 jewel: from the pyramid or blind from the top of a deck. At most 3 kept jewels.
   - Buy 1 jewel from the pyramid or your kept jewels: cost minus your bonuses of each colour; gold pays for any missing gem or pearl.
     Paid tokens go back into the bag. The pyramid slot refills from its deck (empty if the deck is empty).
   - If none of these is possible you must refill first.
3. Powers of a bought jewel resolve now: Matching jewel joins one of your coloured jewels (needs one to buy it; counts as that colour for
   bonus and points); Polish takes one gem of that colour from the board if any; Favour gains a Favour; Pinch takes one gem or pearl (not gold)
   from the rival if any; Encore gives another turn after this one.
4. At 3 crowns choose a Patron, at 6 crowns a second; its power resolves at once.
5. Return tokens down to 10. Then check victory.

Gaining a Favour: from the supply; if the supply is empty, from the other player; if you hold all 3, nothing happens.

## Victory (end of your turn)
20 points (jewels + patrons), or 10 crowns, or 10 points on jewels of one colour.

## Simplified on purpose
None of the rules. Interface only:
- Buying pays automatically with your own gems first and gold only for what is missing (the original lets you spend gold even when you
  hold the gem; that is never better, so the choice is not offered).
- Keeping from the jewel close-up uses the first gold on the board; tap a specific gold coin first to choose which one.

## Confirmed vs unverified
- Confirmed against the official English rulebook: all rules above, counts of tokens, privileges, royal thresholds, victory.
- All 67 jewels (tier, bonus, count, cost incl. pearls, points, crowns, power) and the 4 royal cards: two independent open-source
  implementations agree on every card and on the 30/24/13 split. Not checked against a physical deck.
- [unverified] The spiral's first step from the centre (up vs down): the rulebook only says "follow the printed spiral"; we start upward
  and go clockwise. Since tokens are drawn at random, this does not change play.
- [unverified] No rule covers "bag empty and no action possible"; we let the player pass (never seen in 300+ test games).
