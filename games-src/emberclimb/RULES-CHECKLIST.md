# Emberclimb rules checklist (W434)

Source: the printed rulebook of the tabletop game this adapts (cooperative roguelike deckbuilder, 1-4 heroes, three acts plus an optional
fourth), from a rule summary read on 8 Nov 2026 plus the notes in `rules-notes.md`. Pure-number tabletop values are multiplied by
`D.SCALE = 3` (damage, Weak, Wrath, Shiv, Rest, Block cap); counts, caps on tokens and energy are not scaled. One gold unit in the printed
rules = 25 gold here (card removal 3 units = 75 gold, already the shelf value).
Each rule has one assertion in `logic-test.js` (`node logic-test.js`, id = number). "Optional" rules are marked; "NB" = not built, with the reason.
Rules whose exact text I could not confirm (the solo-start die effect, the opening blessing options, Act IV key details) are left out rather than guessed.

## Turn and resources
1. Start of a hero's turn: Energy resets to 3 (unspent Energy is not carried), Block resets to 0, draw 5.
2. There is no hand size limit.
3. If the draw pile is empty when drawing, shuffle the discard pile into a new draw pile.
4. End of turn: the hand is discarded, except Retain cards which stay.
5. Ethereal cards still in hand at end of turn are Exhausted.
6. Exhaust removes a card until the end of combat (it is back in the deck for the next fight).
7. Energy maximum is 6 (Miracles may go above only to pay for a card).
8. Block maximum for a hero is 20 x SCALE = 60.
9. Enemy Block is removed at the start of that enemy's turn (it protects through the heroes' turn only).
10. Block stops attack damage point for point, but not "lose X HP" effects.
11. Strength: +1 damage per hit per point; maximum 8 for heroes.

## Debuffs and damage
12. Vulnerable doubles each hit (after Strength); maximum 3 tokens; one token lost per whole attack.
13. Weak: each hit deals SCALE (3) less, minimum 0; maximum 3 tokens; one token lost per whole attack (multi-hit / all-enemy attacks spend one).
14. A Weak attacker hitting a Vulnerable target: neither effect applies; attacker loses 1 Weak and target loses 1 Vulnerable.
15. Vulnerable on a hero is spent once per whole enemy attack action (all hits doubled), and a Weak enemy hits for SCALE less per hit.
16. An all-enemies attack removes Vulnerable from every enemy it hit, but only one Weak from the attacker.
17. Poison: at the end of the heroes' turn each poisoned enemy loses 1 HP per token; it ignores Block; tokens do not decrease.
18. Poison cannot exceed 30 tokens across all enemies (extra is ignored).
19. Poison can kill an enemy, and killing the last enemy ends the fight in a win.

## Class mechanics
20. Shiv: a separate 1-damage (SCALE 3) attack, affected by Strength, Weak and Vulnerable; a hero holds at most 5; none at combat start.
21. Miracle: spend one for 1 Energy; maximum 5 held.
22. Scry X: look at the top X cards of the draw pile, discard any, put the rest back in the same order; never more than the draw pile holds and never reshuffles.
23. Orbs (Automaton): 3 slots; Channel into a full row evokes the first orb, then adds the new one; orbs vanish at the end of combat.
24. Lightning orb passive at turn end hits an enemy; Frost orb passive at turn end gives Block; Dark grows each turn end; Focus raises every orb number.
25. Stance (Monk): every combat starts Neutral; no stance carries between fights.
26. Wrath: +SCALE damage per hit dealt; damage taken is not raised.
27. Ending a turn in Wrath costs SCALE HP, and Block can prevent it (it is damage, not HP loss).
28. Leaving Calm gives 2 Energy; entering the stance you are already in does nothing.
29. Retain: a Retained card stays in hand at end of turn (see 4).

## Enemies and combat
30. One shared die is rolled once per round before the heroes act; die-based enemy actions follow the result (1-2 / 3-4 / 5-6).
31. Each enemy sits in a hero's row and attacks that hero; an area action hits every hero.
32. Enemies act after all heroes, in order from the first enemy to the last (bosses last).
33. An Encounter room has one enemy per hero (one Encounter card drawn per player). NB: the shelf's encounter groups hold 1-3 enemies whatever the party size; changing it re-balances all nine story chapters.
34. A boss fight uses the act's boss; acts 2 and 3 use a different boss from the one beaten.
35. Enemy HP scales with the number of heroes (printed HP board); 2 heroes = x1.6 here (approximation, board not available).
36. Hero starting HP differs per class (80 / 70 / 75 / 72 here) and each starts with the class starter deck and relic.

## Death and victory
37. If any hero reaches 0 HP the whole party loses at once.
38. Last Stand (OPTIONAL): in a boss fight survivors continue after a death and the party cannot advance to the next act. NB: optional rule, not built.
39. Victory: defeat the final boss; the player may stop after any act (engine move `stop`; the UI has no button for it yet, W420).

## Map rooms
40. Rest site: each hero chooses Rest (heal 3 x SCALE = 9 HP) or Smith (upgrade one card); one action per hero.
41. Treasure: each hero gains one relic.
42. Elite: the winners get a relic, and every hero gets a card reward with one rare.
43. Merchant: 3 relics and 3 potions on sale, 3 class cards per hero, plus 3 colourless cards; the top-left relic and potion are one gold unit (25) cheaper.
44. Merchant card prices: common 2, uncommon 3, rare 6 gold units (50 / 75 / 150), no random extra.
45. Card removal costs 3 gold units (75) and each hero may remove one card per Merchant visit.
46. Event: every hero resolves the chosen option (a curse or a card reward goes to each hero). Limit: options that ask the player to pick a card (upgrade / remove) still apply to the first hero only.
47. Heroes share one gold pool, so one can pay for another.

## Rewards
48. Card reward: reveal 3 from the hero's card rewards deck (commons + uncommons), take 1 or skip; unpicked cards go back and the deck is reshuffled.
49. Boss reward: 3 rare cards; boss relics: heroes + 1 revealed (3 solo), each hero may take one.
50. Each hero may carry at most 3 potions (so 6 for two heroes).
51. Potion reward: one potion is drawn, take it or skip.
52. Upgrading a card makes it strictly better.

## Acts and campaign
53. Acts 2 and 3 start with a full heal, a new map and a new boss.
54. Three acts are available in one run (`acts` up to 3).
55. Story campaign: each chapter's setup (heroes, floors, boss, starting relic, enemy HP %) is applied exactly by `newGame`.
56. Story campaign: the chapter map has exactly `floors` floors before a boss, and that boss is the chapter boss.
57. Story campaign: "make it easier" lowers enemy HP to at most 80% (camp.js rule applied to the chapter options).
58. Ascension levels 1-13 (lose max HP, potion limit 2, starting curse, small post-boss heal, dearer removal, start damaged...). OPTIONAL. NB: not built.
59. Act IV (Ruby / Sapphire / Emerald keys, extra elite and final boss). OPTIONAL. NB: not built.
60. Transform (remove a non-curse card, gain the top card of the rewards deck). NB: not built, no event or room offers it.

## Run structure (W494, from the video game the tabletop game comes from)
61. Opening blessing: before floor 1 the party takes one free gift (8 max HP, 100 gold, a rare card, or a relic for 10 HP), then picks a floor-1 room.
62. The rare-card blessing adds one rare class card to the deck.
63. Event rooms draw from 12 events (the opening blessing is never drawn in a ? room).
64. Events can sell potions; potions never exceed the potion slots.
65. An event upgrade asks which card and upgrades exactly that one.
66. Quick play is a full run by default: 3 acts, each ending with its boss, starting with the blessing.
