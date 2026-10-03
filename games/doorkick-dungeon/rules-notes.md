# Doorkick Dungeon: rules notes

A browser version of the rules of *Munchkin* (Steve Jackson Games, 2001; BGG 1927). It uses the current 168-card base deck and rules sheet v1.71. Every name, card text and picture is original, for copyright reasons. The numbers and effects follow the real cards.

## Sources
- **Card data:** `cards-base.json` has every base card, with its source. It was built from a hand-corrected transcription of the scanned card sheets plus the official card list. All monster and item numbers were cross-checked against an independent dataset of the Russian printing.
- **Rules:** `rules.md` is rules sheet v1.71 plus about 150 official FAQ rulings.
- **Card inventory:** `inventory.md` covers the base game and each numbered expansion.
- **Blocked sites:** the publisher's sites, the fan wiki and BGG were blocked by the network proxy, so everything came from GitHub-hosted copies.
- **Tags:** **[R]** is the rules sheet, **[F]** the FAQ, **[C]** a card's own text, **[H]** my interpretation where the physical game relies on table talk.

## The deck in this game
- **168 cards:** 94 door and 74 treasure, 147 different cards.
- **Checked against the data:** `cards.js` gives each card a `ref` to its real card in `cards-base.json`.
  - A script compares every copy count, monster level, treasure count, levels gained, "won't pursue" level, run-away modifier and Undead tag with the data.
  - It does the same for every item's bonus, gold, slot, hands and Big flag, and every one-shot's bonus and gold.
  - **Result: 0 differences.**
- **Card types:**
  - 37 monsters
  - 6 monster boosts
  - 19 curses
  - 3 races and 4 classes, 3 copies each
  - Mixed Heritage ×2 and Double Major ×2 (the two-race and two-class cards)
  - 2 Uninvited Guests (wandering monsters)
  - Loophole (the rule-bending card), Heavenly Favor, Mind If I Borrow That?, Smoke and Mirrors and Gone Fishing
  - 9 go-up-a-level cards, Porter (the hireling), Treasure Pile!, Level Heist
  - 38 items and 24 one-shots
- **Race and class names:** the races and classes keep their generic fantasy names (Elf, Dwarf, Halfling, Warrior, Wizard, Thief, Cleric). Every other card has an original name.

## Rules implemented [R]
- **Setup:** each hero starts at level 1 as a Human with no class, and is dealt 4 door and 4 treasure cards. Everyone may play races, classes and items before the first turn. The high roller starts.
- **Turn:**
  1. **Get ready:** play cards, equip, sell.
  2. **Kick open the door:**
     - a monster means a fight;
     - a curse hits you at once;
     - anything else goes to your hand.
  3. **If you didn't fight:** look for trouble with a monster from your hand, or loot the room with a face-down door card.
  4. **Tidy up**, then **charity**: extras above 5 cards (6 for a Dwarf) go to the lowest level, or are discarded if you are the lowest.
- **Combat:**
  - Your strength is level + worn items + one-shots + abilities; a helper adds theirs. Ties go to the monster unless a Warrior is fighting.
  - Several monsters are fought together.
  - Rewards only arrive when the fight ends. Removing the last monster ends the fight at once (the July 2018 ruling).
  - One helper, who is bribed with a promised number of treasures. The helper takes the promised cards first [H1]. The helper gains no level, except an Elf, who gains one per monster killed (never the winning level [H5]).
- **Running away:** roll a d6 for each monster; 5+ gets away.
  - Elf +1, Halfling −1 (base printing), item and monster modifiers apply.
  - Wizard flight gives +1 per discarded card, up to 3.
  - A monster that "won't pursue" level X or below lets such heroes walk away. Bad Stuff applies monster by monster.
  - Removing one monster and fleeing the rest gives no reward.
- **Death:** you keep your level, races, classes, the two-race/two-class cards and curses. The other players loot one card each, highest level first (ties roll). You come back at the next player's turn and draw 4 + 4 cards at the start of your own.
- **Items:**
  - 1 headgear, 1 armor, 1 footgear, and two hands of weapons.
  - One Big item (any number for a Dwarf; one extra with a Porter).
  - Race, class and sex restrictions apply. Items you can't use are carried with no bonus.
  - You can't change what you wear in a fight.
- **Selling:** on your own turn, outside a fight, sell items worth 1,000 gold or more in one go for one level per 1,000. No change is given.
  - A Halfling doubles one item's price once a turn.
  - You can't sell to reach level 10.
- **Winning:** level 10, but only from killing a monster. Heavenly Favor (the divine-intervention card) is the one card that may also give it to Clerics. Go-up-a-level cards and selling stop at 9.
- **The two-race and two-class cards with one card:** you get the perks and none of the drawbacks. For example, a single-race Halfling with Mixed Heritage has no −1 to run away, and monsters get no bonus against that race.

## Every card effect is implemented
Monsters' special texts are all live. Some examples:
- **Grave Gnawers:** you fight with your level only; Berserk doesn't help.
- **Timeshare Pitchman:** bonuses only.
- **Pinch Mites** and **Hovering Sniffer:** you can't escape them. The Sniffer can be bribed with an item worth 200 or more, and Garlic Gargle kills it.
- **Shieldmaiden:** a woman just gets 1 treasure.
- **Litigation Lizards:** they skip a Thief, who may swap 2 treasures.
- **Pharaoh** and **Grave Twins:** fleeing costs 2 levels above level 3. **Rattlebones:** 1 level.
- **Snappy Hound:** throw a pole to get away.
- **Sleepy Boulderman:** walk past it, unless you're a Halfling.
- **Bat-Cape Poser:** a Cleric shoos him off.
- **Furious Rooster:** +1 level if beaten with fire.
- **Barfabunny:** +1 level if beaten with no help or bonuses.
- **Ficus:** an Elf gets an extra treasure.
- **Slobber Fiend:** discard an item first.
- **Tentaclopolis:** chases Elves of any level.
- **Plus-One:** an identical date with the same boosts, −1 to run away.

The Bad Stuff includes:
- the Horde's roll;
- losing classes (or 3 levels) and losing all Big items;
- dropping to the lowest level at the table;
- 1,000 gold of items;
- others taking items or cards (Skygrif, Pixie, Forum Troll, Litigation Lizards);
- the Turbo Slugs roll;
- the Nameless Dread sparing Wizards.

All 19 curses work:
- the class and race swaps from the discard pile;
- the gender swap (−5 in the next fight);
- Hen Hat Hex (−1 to die rolls until the headgear goes);
- Tax Collector;
- Grabby Neighbours;
- Spiteful Mirror (no weapon bonuses next fight);
- losing the best item, and the rest.

Treasures:
- Mirror Twin doubles your strength; a second one triples it.
- Sticky Paste forces another roll after an escape.
- Pop-Up Wall, Vanishing Tonic, Weighted Die and Snack on a Stick are ways to get away.
- Wishing Lantern works on your own turn, even after being caught.
- Parrotify Potion removes a monster; you keep its treasure but get no level.
- Not-My-Problem Potion hands the fight to someone else; you may still loot afterwards.
- Ring of Undoing cancels a curse.
- Rummaging Rod lets you take any discarded card.
- Treasure Pile! draws 3 more treasures when you get it, and Heavenly Favor fires however it is drawn.

## Interpretations [H]
- **[H1]** The helper takes the promised number of treasures first, from the top of the draw. At the table you would agree who picks.
- **[H2] Out-of-turn plays:**
  - Anyone may play curses, go-up-a-level cards, Level Heist and the Porter:
    - during any fight;
    - in a short window at the start of each turn, before the door is kicked;
    - on their own turn.
  - The table rule is "any time". A browser game needs fixed moments.
- **[H3] The "reasonable time" rule:** when the fighter says Fight, every other player in turn order gets one chance to play something. Any play hands the choice back to the fighter.
- **[H4] Automatic choices:**
  - *Timeshare Pitchman*: "lose 1,000 gold of items" loses the least useful items automatically.
  - *Tax Collector*: the other players' payments are chosen automatically.
  - Several monsters are run from in the order they appeared.
  - Everything else the rules leave to a player is asked of a human: which item to lose, what to loot, whether to use Ring of Undoing, Sticky Paste or an escape card, whether to throw a pole to the Snappy Hound, and so on.
- **[H5]** An Elf's helper level can't be the winning level. The rules sheet is silent and the FAQ has no ruling, so this is a house-rule choice.
- **[H6]** Only the fighter's own escape rolls and theft rolls use the Weighted Die and Hen Hat Hex's −1.
- **[H7]** A cap of 600 turns ends a stuck game on the highest level. It has never triggered in tests.

## Not included
- Trading items between players (you can still give away cards through charity, looting and Mind If I Borrow That?).
- The optional "Listen at the door" and shared-victory rules.
- Online play. It needs private hands per player, so it's left for a later version. Friends on one device use a pass-the-device screen that hides hands.

## Expansions
The inventory (`inventory.md`) has the full card data for Munchkin 3, 4, 5 and 8, probably full data for 7, and 109 of 112 cards for 2. It has card counts only for 6, 6.5, 9 and 10. This version plays the base game. The expansions' own mechanics (steeds, dungeons and portals, rangers and bards, and so on) are the next step.

## Tests (headless)
- **Rule scenarios:** `rules-test.js` has 42 small positions, each checking one rule above. All pass.
- **Forced coverage:** `force.js` put every one of the 147 cards into a hand for 3 games of 40 turns each: 0 errors and 0 rule-check failures. Card names were checked in the log as a sign of use; four rarely come up in computer play (Loophole, Mind If I Borrow That?, Smoke and Mirrors, Sudden Gust), and the scenario tests cover them directly.
- **Computer games:**
  - `gauntlet.js` and `cover.js` played computer games with 0 errors and 0 rule-check failures after the fixes.
  - Games last about 45–75 turns with 4 heroes (11–19 rounds each).
- **Random clicker:** `click.js` played every human flow in both "me vs computer" and "friends on one device": 0 rejected moves.
