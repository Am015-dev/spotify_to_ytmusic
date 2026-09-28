# Rules notes: King of Tokyo (built as "Crown City Smash")

Sources: official rulebook PDF (2016 edition, 8 pages) and the official-style FAQ PDF. BGG itself was blocked by the network proxy, but the rulebook cover gives 2–6 players, 30 min, age 8+.

## Components
- 6 black dice with faces 1, 2, 3, Energy, Smash (claw), Heart. Green dice (extra dice) come from cards.
- Monster boards: Life 10 (max 10 unless a card raises it), VP 0.
- Board: Tokyo City; Tokyo Bay is also used with 5–6 players. "In Tokyo" means either one.
- Power card deck. 3 cards face up. Energy cube pool.

## Turn
1. Roll: up to 3 rolls (the first roll plus 2 rerolls). Set any dice aside, and you can reroll dice you set aside earlier.
2. Resolve all dice:
   - 1/2/3: three of a kind scores that number in VP; each extra matching die scores +1.
   - Energy: +1 energy cube each.
   - Heart: heal 1 each, only when outside Tokyo, and never above max Life.
   - Smash: in Tokyo, you hit everyone outside. Outside, you hit everyone in Tokyo (City and Bay). Monsters in Tokyo don't hit each other.
   - A monster in Tokyo that loses Life to Smash dice may Yield. It still takes the damage. Yielding is only possible after Smash damage from dice, never card damage.
3. Enter Tokyo: if City is empty you must enter it. With 5–6 players, if City is occupied and Bay is empty you must enter Bay. A smasher takes the place of a monster that yielded. Entering gives +1 VP.
4. Buy: buy any of the 3 face-up cards (cost in energy). Replace each one right away. Pay 2 energy to sweep all 3 and deal 3 new ones. Repeat as long as you can pay.
5. End of turn: end-of-turn card effects.
- Start of turn in Tokyo: +2 VP.
- 0 Life: eliminated (keep cards and energy are discarded).
- With 4 or fewer monsters left, the Bay monster leaves at once (moving to City if City is empty).
- Win: reach 20 VP (you must survive your turn), or be the last monster standing. If everyone dies at once, everyone loses.

## Cards implemented (57 cards; names and text rewritten)
All base-game cards except the cuts listed below, with the FAQ rulings: Fire Breathing hits neighbours even in the same place (a lone opponent takes only 1); Wings is declared at the start of each other monster's turn; Frenzy skips end-of-turn effects; Jets lets you yield and take no Smash damage; Poison Quills and Spiked Tail need at least 1 claw; Omnivore scores once per turn; Rapid Healing can be used at any time (the computer, and a human about to die, use it automatically to survive).

## Cut, or guessed
- Cut (they need a token or peek UI and add little): Mimic, Monster Batteries, Opportunist, Parasitic Tentacles, Poison Spit, Shrink Ray, Psychic Probe, Healing Ray, Made in a Lab, Metamorph.
- Guess: Burrowing's +1 damage applies while you are in Tokyo.
- Guess: Acid Attack deals +1 Smash every turn, even with no claws. This is the card text; the FAQ disagrees.
- Guess: Drop from High Altitude gives +2 VP plus the normal +1 for entering. If both Tokyo spaces are full, you choose who leaves.
- Guess: a monster in the Bay moves up to City when City empties at its Enter step.
- First player: seat 1, with seats shuffled at setup, instead of a claw roll-off.

# v2: King of Tokyo: Mindbug expansion

Sources: the BGG, IELLO, review and wiki pages were all blocked by the network proxy. What follows was confirmed through search-result excerpts: the product listing, a BRDGMZ rules summary, BGA news, and the TechRaptor, Card Gamer and Big Boss Battle reviews.

## Confirmed
- Each player starts with 1 Mindbug token, placed face up in front of them. At the end of an opponent's roll, you may declare a Mindbug and resolve their dice as if they were your own. They then continue their turn.
- New card type, Consumable: bought, then discarded later to trigger its effect. It uses the Mindbug keywords Hunter, Sneaky/Stealthy, Venomous/Poisonous, Tough and Frenzy/Fury.
- There are 24 new power cards and 3 new monsters (plus a fourth listed monster), each with an Evolution set.
- Evolutions follow the Power Up! rule: resolve 3+ hearts to draw an evolution card for your monster (you draw even while in Tokyo).
- Two modes: Mindbug Trial shuffles the 24 new cards into the base deck; Mindbug Experience uses only the 24 new cards.

## Guessed or original (the card texts could not be read)
- All 24 new card effects are original designs built on the confirmed features. The keywords are translated to dice-game terms: Hunter = hit more monsters, Sneaky = ignore defences, Venomous = finish off badly hurt monsters, Frenzy = double claw damage, Tough = block a hit.
- Evolution cards: 6 original evolutions for each of the 9 monsters. Instant ones are played on your turn; permanent ones stay in play.
- The three new monsters (Cortexa, Clampede, Bramblebat) are original hybrid monsters filling the role of the expansion's Mindbug-universe monsters.
- Mindbug timing: once the roller finishes rolling, other monsters are offered the Mindbug in clockwise order, and only one can Mindbug per turn. The Mindbugger takes any spot a yielding monster leaves. The roller then still does its own Enter City step and buy step.
- Cut: the 3 Wickedness tiles, which need the Wickedness Gauge from another expansion.

# v5: more expansions (selectable at setup)

Sources: search-result excerpts only; every official rulebook PDF was blocked by the network proxy.

- **Cultists (Cthulhu pack)**, confirmed: after resolving, four identical faces gain a cultist. Discard one at any time for 1 heart, 1 energy or 1 extra reroll. Guess: cultists also save you automatically when you would be knocked out.
- **Tokyo Tower (King Kong pack)**, confirmed: a monster in Tokyo that rolls four 1s claims a level. The bottom level gives +1 heart at the start of your turn; the middle gives +1 heart and +1 energy; the bonuses stack. Owning all three wins. Guesses: you claim the lowest level you don't own, taking it from its owner if needed; the win is checked at the end of your turn.
- **Berserk (Cybertooth pack)**, confirmed: resolving four claws puts you in Berserk mode. While berserk you roll the berserk die (it has an Ouch face that costs you 1 heart), and healing ends Berserk. Guess: the exact faces (2 claws, 2 energy, Ouch, claw, claw, energy).
- **Wickedness gauge (Dark Edition)**, confirmed: three 1s give 2 wickedness and three 2s give 1. Reaching 3, 6 or 10 lets you pick a tile at that level (4, 4 and 2 tiles). The tile names and effects are original designs.
- **Costumes (Halloween)**, confirmed: deal 2 costumes to each player; each keeps 1 and the rest are shuffled into the deck. Rolling 3+ claws lets you buy the costumes of monsters you damaged by paying their cost. The 12 costume effects are original designs.
- **Curses (Anubis pack)**, confirmed: one curse is in play at a time, and the Die of Fate is rolled and resolved first (Eye = new curse, Water = nothing, Snake = bad, Ankh = good). The 10 curses are original designs; the Golden Scarab is cut.

# Computer skill
- Easy: the Normal logic with random mistakes. Normal: rule-based. Hard: tries every keep and simulates the rerolls to pick the best one; it also yields more carefully and uses Mindbug more carefully.
- Head to head over 120 games: Hard won 59% against Normal (2 of each, seats alternating). In separate 4-player games, Easy won 15% against Normal (2 of each).
