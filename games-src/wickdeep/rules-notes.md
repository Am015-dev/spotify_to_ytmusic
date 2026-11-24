# Wickdeep: rules notes

Wickdeep is a cooperative tactical dungeon-crawl campaign for 1 to 4 heroes (the player controls all of them; default 2).
The rules follow the compact starter edition of the top-ranked co-op card-driven dungeon crawler, written here from the
builder's own knowledge of the genre's rules. Every hero, card, monster, item, map and story beat is our own design
(see COMPONENTS.md for how the structure maps). Engine: `src/engine.js`. Checked by `rules-test.js` (439 checks).

## Setup
- Pick a scenario on the campaign map. Each hero brings exactly its hand size in ability cards.
- Scenario level = ceil(average hero level / 2), plus the difficulty setting (Easier -1, Harder +1). Solo play uses the
  2-hero monster set at +1 level.
- Level sets: monster stats, trap damage (2 + L), coin value (2,2,3,3,4,4,5,6 gold), win bonus XP (4 + 2L).
- The start room is revealed. Monsters are placed per party size (columns for 2, 3 and 4 heroes: none, normal or elite).
- Each hero gets 2 secret goals and keeps 1 (3 completed goals = 1 perk).

## Round
1. **Card choice.** Each hero picks 2 cards from hand, or declares a long rest. A hero who cannot play 2 cards and cannot
   rest (fewer than 2 played cards) is exhausted.
2. **Monster cards.** Each monster type on the board reveals the top card of its 8-card ability deck.
3. **Initiative.** Everyone acts from the lowest initiative. A hero uses the lower of its two cards (ties: the other card);
   a long rest is 99. On a tie a hero goes before a monster.
4. **Hero turn.** Play the top half of one card and the bottom half of the other, in either order. Any top may be played as
   Attack 2 and any bottom as Move 2 instead. Summons act just before their owner.
   - Played cards go to the played (discard) pile; a half with the LOST mark sends its card to the lost pile;
     persistent halves stay active until their charges run out (then lost); summon cards stay until the summon dies.
   - Infusions make an element strong at the end of the turn. Coins under you are picked up at the end of your turn.
5. **Monster turn.** Each monster of the type acts (elites first, then by number) following its card:
   - Focus: the enemy it can attack with the least movement; ties go to the closest, then the lowest initiative.
     Invisible figures cannot be focused.
   - Move: to the hex that lets it attack its focus (and as many extra targets as the card allows) with the least movement;
     ranged monsters avoid standing next to their target. With no attack possible, it gets as close as it can.
     Monsters avoid traps and brine unless no other path exists; they never open doors.
   - Then the card's attack, heal, shield, retaliate, infusion and specials (bosses).
6. **End of round.** Elements wane (strong -> fading -> gone). Round shields and retaliates end. Decks that drew a reshuffle
   card (monster decks; modifier decks that drew x2 or MISS) are reshuffled. Heroes with 2+ played cards may short rest.

## Resting and exhaustion
- **Short rest** (end of round): lose a random played card, return the rest to hand. You see the card first and may take
  1 damage to swap it for another random card, once.
- **Long rest** (initiative 99): choose a played card to lose, return the rest, heal 2, refresh spent items.
- **Exhaustion**: at 0 HP, or when you cannot play 2 cards or rest. You may lose 1 hand card or 2 played cards to ignore
  one source of damage.

## Attacks
- Attack value + bonuses (+1 against a poisoned target), then a modifier card: +0 (6), +1 (5), -1 (5), +2, -2, x2, MISS.
  x2 doubles, MISS deals nothing and applies no effects. Rolling perk cards add to the next card.
- Advantage (Strong, some effects) draws two and keeps the better; disadvantage (Muddle; a ranged attack against an adjacent
  target) keeps the worse; both cancel.
- Shield reduces damage (pierce ignores shield). Retaliate damages an attacker within its range after the attack.
- Conditions: Poison, Wound, Stuck (immobilize), Disarm, Stun, Muddle, Hidden (invisible), Strong (strengthen), Curse, Bless.
  Timed ones end at the end of the figure's next turn. Healing cures poison (no HP) and wound.
- Line of sight: blocked by walls and closed doors, not by figures or obstacles. Push and pull move the target 1 hex per point.

## Map
- Doors open when a hero steps in, revealing the next room and its monsters (they act this round in initiative order).
- Obstacles block movement; traps deal trap damage once; brine deals half trap damage on each entry; rubble costs 2 moves.
- Jump ignores figures, obstacles and terrain except where you land. Flying monsters ignore terrain.

## Campaign
- 25 scenarios in four acts, branching unlocks, 4 bosses. Losing keeps XP and gold; you can retry.
- XP: card XP marks + win bonus. Levels at 45, 95, 150, 210, 275, 345, 420, 500 XP.
- Each level: choose a new card of your level or lower (it joins your pool; your hand stays at hand size) and a perk.
- Gold buys items (head, body, legs, two hand slots or one two-hand item, small items = level / 2 rounded up).
  Items are "spent" (back after a long rest) or used once per scenario.

## Simplified on purpose (interface shortcuts, not rule cuts)
- You are asked to block with cards only when a hit would knock you out; trap and retaliate damage cannot be blocked.
- Armor items are used on your own turn and shield you for the rest of that round (not as a reaction to a hit).
- The optional short rest is only offered when your hand is down to 3 cards or fewer (or you must rest); the long rest is always available.
- Push and pull pick the best hex automatically (furthest from / closest to the attacker).
- An element bonus is always used when the element is available.
- Line of sight is traced centre to centre (with a tiny nudge each way) instead of corner to corner.
- Monster stat tables come from a per-type formula (our own design) rather than printed tables.
- Advantage with rolling cards: each draw is a full rolling chain; the better chain counts.

## [unverified]
- The starter edition's exact counts of monster types, items, perks per class and secret goals; we use 16 types + 4 bosses,
  30 items, 7-10 perk slots per hero and 10 goals. Flagged to the orchestrator.
- Exact level-up card rule (we let a hero pick any unpicked card of its level or lower, one per level).
