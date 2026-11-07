# Emberclimb: independent review R2 (7 Nov 2026)

Played live (https://am015-dev.github.io/spotify_to_ytmusic/emberclimb/) with real input only:
- Phone 390x763, CDP touch: Ember Warrior solo, map -> fight -> reward -> shop -> event -> rest -> boss, fell on floor 10 (FALLEN screen).
- PC 1440x860, mouse: Ember Warrior solo, same route types, fell on floor 10 (FALLEN screen).
- PC, extra: tried to start a Venom Rogue solo run and got a two-hero run (see row 1).
No console errors. Art not judged (placeholders).

Anchor: 7 = a stranger would happily play it again.

| # | Row | Score | Why (screen, what a player would say) |
|---|-----|-------|------|
| 1 | First minute | 5 | Title: Garrick is preselected, and tapping another hero adds a second hero instead of switching ("Climb together"). Tapping Garrick again did not drop him in my run. Player: "I wanted to play the Rogue alone and got a two-hero game with 150 HP of enemies." Once in, map -> first fight is fast. |
| 2 | Clarity of the core decision | 6 | Fight: energy orb, End turn and enemy intent (sword + number) are clear on PC. On phone the card text is about 7 px ("Deal 6.", "Gain 5 Block.") and the hand runs off the bottom edge, so "what does this card do" needs a squint. Debuff intents show only a skull with no number or word. |
| 3 | Original's fun moment lands | 6 | Reward screen "Add one card to your deck" with 3 real choices, branching map with elites, campfire rest vs smith: the draft-and-climb loop is there. It falls short in the Wayside Market: items show only a name and price, and one tap buys at once. Player: "What does Pyre Heart do? Oops, I just spent 150 gold on it." |
| 4 | Computer opponent quality | 6 | Enemies use readable intent patterns and the elites hurt. Both my runs went from near-full HP to 0 at the floor-10 boss in a few turns with no warning on the map of what it does. Player: "The boss came out of nowhere." No relic or boss preview. |
| 5 | Pacing | 7 | One act is ~20 player turns and an estimated 15 minutes for a human; fights take 2-4 turns, rewards and rooms are one tap. Good session length for a phone. |
| 6 | Feedback and juice | 5 | Fight: damage/status text pops but overlaps the enemy name ("Vulnerable 2" printed over "Hex Acolyte"), no sound, no hit shake, no card fly-to-target. FALLEN screen only says "You reached floor 10. Deck 10 Relics 1 Gold 239". Player: "What killed me? Can I see my deck?" |
| 7 | Phone playability | 5 | Fight at 390x763: 5 cards fit but are cut off at the bottom and their text is tiny; the hero panel takes a big band while the cards get the smallest share. Map, reward, shop, event and rest screens are fine on phone. |
| 8 | PC playability | 6 | PC fight: everything sits in a narrow column in the middle of 1440 px, cards are small and clipped by the bottom edge, large empty areas left and right. Works fully with the mouse. |
| 9 | Rules faithfulness | 6 | Intents, block reset, Strength/Vulnerable/Weak/Poison, exhaust, X-cost, map room types, rest/smith, shop removal, boss relic choice: all there. Numbers follow the big-number video version (Deal 6, 48 HP enemies) rather than the small-number tabletop version as I know it, and Act 1 only. Fine for fun, flagged for faithfulness. |
| 10 | Stability | 8 | Three runs, no errors, no stuck states caused by the game. |

Average: 6.0. Lowest rows: 1, 6 and 7 (5 each).

## Top 5 changes (most fun first)

1. In the fight on phone, make the hand cards at least 25% taller with 11 px+ rule text, fully on screen (shrink the hero panel to one 44 px row with name + HP bar), and enlarge the lifted card on first tap.
2. In the Wayside Market, make the first tap show the item's full text (card face or relic/potion description) with a Buy button, and buy only on that second tap.
3. On the title, make a tap on a hero switch the selection (solo), and add a separate "+ Add a second hero" toggle for hot-seat.
4. Expand the FALLEN/victory screen: killer name and its last intent, floor reached, the final deck as a scrollable card list, relics, and a "Climb again with this hero" button.
5. Show a word or number on every intent (debuff: "Weak 1", buff: "+3 Str") and move status pop-ups above the enemy box so they never overlap its name, with a 150 ms hit shake on damage.
