# Rules notes: King of Tokyo (built as "Crown City Smash")

Sources: the official 2016 rulebook (`rulebook.txt`), the FAQ PDF, and the Board Game Arena implementation (thoun/kingoftokyo, cloned in `bga/`; extracted to `bga-cards.json`). BGA is the reference for every card's cost, type and exact behaviour. Names and card text in the game are original rewordings.

Marks: **[H]** means a house interpretation, where the card text or BGA left a choice.

## Turn
1. **Roll.** Up to 3 rolls (the first roll plus 2 rerolls). Keep dice and reroll the others; dice kept earlier can be rerolled.
2. **Resolve**, in this order:
   - Other monsters' meddling after your last roll: Ice Lock, Pom-Poms, Mind Peek, Witch Hat, Puppet Master and Numbing Stare.
   - Then the **Mindbug** window.
   - Then the Die of Fate (Anubis) and Muddled Senses.
   - Then the dice:
     - Numbers: a set of three scores its value, and each extra matching die adds 1. Sneaky triggers here, and so does the Tower claim.
     - Energy.
     - Hearts: heal yourself, remove a poison or shrink token, or use Mending Beam on others. Resolving three hearts also gives an evolution pick.
     - Ouch faces.
     - Claws.
3. **Yield.** Monsters in the city that lost hearts to your claws may yield. You can only make them yield if you are outside the city.
4. **Enter.** If Downtown is empty you must enter it (+1 star). With 5–6 monsters, if Downtown is taken and the Harbor is empty, you must enter the Harbor. **A monster already in the Harbor stays there at its own Enter step and never moves up on its own.** It moves to Downtown only when the Harbor closes, at 4 or fewer monsters, if Downtown is then empty. This matches the rulebook's 5-player example.
5. **Buy.** Buy face-up cards, or pay 2 energy to sweep them. Bargain Hunter owners may buy each newly revealed card first.
6. **End of turn.** Frenzy keyword cards are offered first, then Shed Skin. End-of-turn cards, poison damage, the Frenzy drawback, and the Ghost / Vampire / Beauty effects for every monster follow. Then the 20-star check (you must survive your turn). Last, any **extra turns** are taken, then play passes to the left.
- Start of turn in the city: +2 stars (+1 Street Eater, +1 Lord of the Rot).
- Extra turns are queued and taken one at a time:
  - Rampage Rush (Frenzy card).
  - FRENZY keyword cards.
  - Time Hiccup (Freeze Time). Each repeat has one more die fewer: the extra turn after a Hiccup turn with −k dice has −(k+1).
  - Rampant Growth.
  - Workers' Revolt Ankh (without the Die of Fate).
  - A Frenzy card bought through Bargain Hunter on someone else's turn gives its buyer a turn right after the current one. Play then continues from the original player, as in BGA.
- There are no extra turns during a borrowed Mindbug turn.

## Mindbug (BGA `AskMindbug` / `EndMindbug`)
- Every monster starts with 1 token. After another monster's last roll (and the meddling cards), the other monsters are asked in seat order. The first to spend a token (or Slippery Mindbug) becomes the active monster.
- The Mindbugger resolves the Die of Fate and the dice as its own. It then does **its own Enter and Buy steps**, with no end-of-turn step.
- Then the Mindbugged monster **rolls again from scratch** (a fresh Roll step) and plays the rest of its turn. It gets no second start-of-turn bonus.
- [H] The 20-star check also runs at the end of the borrowed turn.
- Keywords, from the BGA help text:
  - **HUNTER**, before rolling: pick any monster. It is the only target of your claws this turn, even in the same place as you.
  - **SNEAKY**, before rolling: every other monster loses as many stars as your number dice score.
  - **POISON**, when claws make you lose hearts: the attacker loses as many hearts as you lost.
  - **TOUGH**, when claws would make you lose hearts: you lose none.
  - **FRENZY**, at the end of your turn: take another turn right away, with the card's drawback at the end of it.
  - A consumable is used once and then discarded. Explosive Crystals stays active until the end of the turn, and Wobbly Scope may be handed to the hunted monster.
- The game offers these at the right moment through a pop-up. The computer uses them automatically.
- [H] A Hunter card whose claws never land is also settled at the end of the turn. Wobbly Scope then goes to the hunted monster.
- Card lists: Trial mixes the 24 Mindbug cards into the base deck, and Experience uses only them.
  - 3 Keep: Free Will, Evasive Mindbug, No Brain.
  - 4 Discard: Mindbug!, Dysfunctional Mindbug, Treasure, Miraculous Mindbug.
  - 17 Consumables (401–417): Overequipped Trapper, Legendary Hunter, Unreliable Targeting, Sneaky Alloy, Offensive Protocol, Arcane Scepter, Energy Armor, Strange Design, Ancestral Defense, Toxic Petals, Explosive Crystals, Electro-Whip, Bold Maneuver, Unfair Gift, Maximum Effort, Deadly Shell (POISON or TOUGH, no other text), Spatial Hunter.

## Base cards: 66 cards, all present
Rules fixes in this version:
- Alpha Monster: +1 star when you roll a claw, even with no target.
- Poison Quills: 2-2-2 adds 2 claws, with no claw needed.
- Burrowing: +1 claw in the city, even with no claws rolled.
- Wings: pay 2 energy when you would lose hearts; you lose none for the rest of that turn.
- Regeneration: +1 on every heal, not only heart dice.
- Eater of the Dead triggers on any drop to 0, before It Has a Child, Nine Lives or Unstoppable Hydra save the monster.
- Freeze Time chains.
- Background Dweller: pick which 3 to reroll, one at a time, as often as you like. The computer rerolls a lone 3 up to 3 times.
- Frenzy: the extra turn comes after the end of this turn.
- Death From Above: +2 stars and Downtown, plus the usual +1 for entering from outside. Every other monster in the city leaves, the Harbor included. From the Harbor you move up, and moving up gives no +1.

The 10 cards added:
- **Healing Ray**: heart dice may heal others. The healed monster pays 2 energy per heart, or what it has (BGA). Works from the city.
- **Made in a Lab**: once per buy step [H], peek at the top card and buy it or leave it.
- **Metamorph**: at the end of your turn, sell Keep cards for their printed cost.
- **Mimic**: copies a chosen Keep card. At the start of your turn you may pay 1 energy to switch.
  - [H] It copies the ongoing effect only, not one-off "when bought" effects (Even Bigger's heal, Smoke Cloud's counters, Battery Monster's energy).
- **Battery Monster** (2016 cost 3): 6 energy on the card, 2 taken at each turn start, discarded when empty.
- **Opportunist**: may buy each newly revealed card before the active player.
- **Parasitic Tentacles**: buy Keep cards from other monsters, paying them your cost.
- **Poison Spit / Shrink Ray**: tokens go to each monster your claws make lose hearts. [H] BGA says "Smash"; we require at least 1 heart lost.
  - Poison: −1 heart per token at the end of that monster's turn.
  - Shrink: −1 die per token.
  - A heart die (usable outside the city) can remove one token.
- **Psychic Probe**: after each other monster's last roll, reroll one of its dice. Discard the card on a heart.

## Power Up! evolutions (8 per monster)
Mapping of our monsters to the real ones:

| Our monster | Real monster |
|---|---|
| Glacyx | Space Penguin |
| Squidrik | Alienoid |
| Voltusk | Cyber Kitty |
| Shroomhulk | The King |
| Magmaw | Giga Zaur |
| Boltbox | Meka Dragon |
| Cortexa | MasterMindbug |
| Clampede | Sharky Crab-dog |
| Bramblebat | Gigasnail Hydra |

Permanent and temporary types follow `material.inc.php`.

- **Draw rule (BGA):** each monster starts with 1 of 2 cards drawn. Whenever it resolves 3 or more hearts, even in the city, it looks at the top 2 and keeps 1. The other goes to its evolution discard, which is reshuffled when the deck runs out.
  - [H] The user brief said "draw an evolution"; we followed BGA's pick-1-of-2.
- The hand is hidden from other players in the UI. The online state still carries it.
- How cards are played:
  - Permanent and "play on your turn" cards are played with a button.
  - Reactive cards are offered by a pop-up at their moment: Nine Lives, Unstoppable Hydra, Detachable Tail, Simian Scamper, Monkey Rush, Jungle Frenzy, Mind Control, Neutralizing Look and Helpful Mindbug.
  - Before-roll cards (Cat Nip, Tune-Up) are offered at the start of your turn.
  - Keyword evolutions (Sharky, Hydra) are used like consumables.
- [H] Superior Brain stays in play once played, as in BGA.
- [H] Thinking Face and Hungry Face are played before resolving and discarded at the end of that turn. In BGA they stay on the table.
- [H] Blizzard affects the other monsters only.
- [H] Icy Reflection copies permanent evolutions only (BGA).
- [H] Freeze Ray: the Penguin's owner names the void face at the start of the holder's turn. The card comes back at the end of that turn.

## Halloween costumes (12, BGA costs)
Astronaut 4, Ghost 4, Vampire 3, Witch 4, Devil 3, Pirate 4, Princess 5, Zombie 4, Cheerleader 3, Robot 4, Statue of Liberty 4, Clown 3.
- Deal 2, keep 1, and shuffle the rest into the deck.
- With 3+ claws, you may buy the costume of a monster you wounded.
- Witch: rerolls one of the attacker's dice after its last roll, if it would wound you (BGA timing).
- Robot: when you lose hearts, pay energy for them instead.
- Zombie: stays at 0 hearts while you keep the costume.
- Clown: once your dice show all six faces, you may set any die to any face.
- [H] Stare of the Sphinx does not switch costumes off.

## Anubis: 24 curses, Golden Scarab, Die of Fate
- One curse is in play, and the Golden Scarab starts with the last player (BGA).
- The Die of Fate (4 faces) is rolled with the dice and resolved first, by the resolving monster (the Mindbugger when there is one):
  - Eye: new curse.
  - River: nothing.
  - Snake / Ankh: the card's effect.
- "Only the Scarab holder can …" curses block every gain for the others.
- [H] Swallowed by Sand, Ankh (1 extra roll): you go back to rolling for one reroll, then resolve without a second Die of Fate or Mindbug window.

## Dark Edition wickedness (side A tiles)
- The gauge gains (3 − n) × ⌊count/3⌋ for 1s and 2s, capped at 10 (BGA `resolveNumberDice`).
- Passing 3, 6 or 10 takes one tile of that level.
- Level 3: Devious, Eternal, Skulking, Tireless.
- Level 6: Cyberbrain, Evil Lair, Full Regeneration (max 12), Widespread Panic (one use).
- Level 10: Antimatter Beam (doubles your total claws), Skybeam.

## Other expansions
- **Cultists:** one per face resolved 4+ times. Spend one for a heart, an energy or a reroll. They are used automatically to survive a knockout (allowed in BGA).
- **Tokyo Tower:** you must already be in the city when you resolve the four 1s. You claim the lowest level you do not own, taking it from its owner. Level 3 wins at once. Levels 1 and 2 give their bonuses at the start of your turn.
- **Berserk:** unchanged. The berserk die faces are double claw, double energy, ouch, claw, claw and energy (BGA).

## Automatic choices [H]
- Some heart losses happen in the middle of another effect. Examples: start and end-of-turn losses (curses, poison), chain reactions (Poison, Arc Shielding), and Funny Looking / Three Times as Strong / Offensive Protocol.
  - In those cases the reactions (Wings, Robot, Undead Mummy) are picked by the computer's rule, even for a human.
- Claw damage and discard or evolution cards that make monsters lose hearts always ask humans.
- Rapid Healing, Ancestral Defense and cultists are used automatically to avoid a knockout. So are Nine Lives, Unstoppable Hydra and It Has a Child.
- Interdimensional Portal (energy or hearts) is asked at the next calm point after you leave the city.

# Computer skill
- Easy: the Normal logic with random mistakes. Normal: rule-based. Hard: tries every keep and simulates the rerolls to pick the best one; it also yields more carefully and uses Mindbug more carefully.
- Head to head over 120 games: Hard won 59% against Normal (2 of each, seats alternating). In separate 4-player games, Easy won 15% against Normal (2 of each).

## v6: online multiplayer and Hard tuning

- **Online play** (claude.ai only). It uses the artifact `room` + `user` capabilities. The host's page runs the game engine and broadcasts compressed game state; guests send their clicks as actions, and the host checks each action belongs to that player's seat before applying it. Invite codes join a named room (`ccs-<code>`). Empty seats are filled by the computer.
- If a player disconnects, the computer takes over their seat; if they rejoin with the same account, they get it back. **The host must keep the page open.** Guests need Contributor or Editor access to the artifact (Viewers can watch but not act).
- Not available in the GitHub Pages build (no room service there): single-player, pass-and-play and computer-only games still work.
- **Hard skill:** a two-stage dice lookahead replaced the one-step keep search, but in testing it wasn't measurably stronger: about 55–59% wins against Normal, the same as the old Hard. A probabilistic stay/yield model also lost to the old rule (52% vs 58%), so the old rule stays (`HYOLD=true`, yield margin `HYB=1.5`, the best of 0.8 / 1.5 / 2.2).

## v7: host migration and phone layout

- **Host migration:**
  - Each state packet now carries the full game, including the deck order. A packet sent when no choice or resolution is in progress is marked *safe*, and every guest keeps the last safe one.
  - If the host leaves the room, or no packet arrives for 15 s, the seated player with the lowest seat number becomes host. They restore the last safe state, so a roll in progress may be replayed, and start an *epoch* one higher. Guests follow the higher epoch.
  - A returning old host sees the higher epoch and steps down. A returning player whose seat went to the computer gets it back automatically.
  - Trade-off: a guest with browser dev tools could read the deck order.
- **Phones (≤700 px):**
  - The header is one scrollable row, the 3D stage is taller, and the camera widens in portrait.
  - A docked bottom bar shows the step, the dice (tap to keep), the "if you resolve now" preview and the main buttons. Pop-ups open as bottom sheets.

## v8: card fidelity pass
- The engine was split into `data.js` (all card data), `engine.js` (rules) and `ai.js` (computer players). `build.py` inlines them.
- The Hard computer now skips the special dice (Die of Fate, berserk die) in its reroll search. With more than 6 normal dice it uses the lighter one-step search, and with more than 7 the Normal rule. Otherwise a single decision took several seconds.
- Test tools in `scripts/`:
  - `gauntlet.js`: PRE, SEED and COVOUT options, and it checks invariants on every tick.
  - `rulestest.js`: directed rule scenarios.
  - `coverage.js`: every card, evolution, costume, tile and curse forced into play.
  - `uiclick4.js`: random human clicks through the UI, counting clicks that change nothing ("rejected").
