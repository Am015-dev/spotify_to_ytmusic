# Emberclimb tutorial: rule coverage (W494)

## R7 (Nov 2026): every rule by doing, no "meet later" list
After the guided first fight, the coached climb's path holds every room type: floor 2 is a real choice (a fight or a ? event), then
treasure (relic), campfire (rest heals 30% or smith a card), shop (buy or remove), an elite with two foes (pick a target; it adds Dazed),
and the act boss, which splits into slimes when it falls. The Warrior deck gets a hit-all attack and a die card so both come up in play.
The map step no longer lists room types in one Next line; each room's rule is said the first time you enter it. The end card ticks off
what you did (no count, no list of rules for later). Hero-only rules (Shivs, Orbs, stances, Scry, Retain), two-hero rules, Frail and
multi-act climbs show once as a tip the first time they happen in a real game (src/tutor.js tips()).
Proof: `node tools/tut-end.js` fails if any core rule in `EC_TUT_CORE` (minus lose, preview, piles, event) was not met by doing, or if the
end card shows a count or a "later" list.

W494 replaced the two forced steps with a guided first fight plus the first map screen. Each step is one line of 12 words or fewer and
one highlighted tap (a card, End turn, the potion, a reward card, Continue, a map room, or Next on an info step). Order:
goal, intent, energy (3 a turn), draw (5 a turn), Vulnerable (Anvil Blow), Vulnerable doubles hits, Block (Plate Guard), End turn,
discard pile, Block resets, enemy patterns, Strength (Kindle, a Power), Exhaust (Roar), Weak, potion + Poison, Ethereal / Retain,
finish with Strikes, gold, card reward (1 of 3 or Skip), deck growth + upgrades, Continue, branching map, campfire (heal or upgrade),
shop (buy or remove), event, elite (relic), boss (relic), three acts, then tap a room: the real climb goes on with the coach.
Proof: `node tools/tut-walk.js` (390x844 + 375x667, real touch taps, checks every step id in `EC_TUT_RULES` in order and the word cap).
Shots: `playable-shots/w494/tut-1..tut-29.png`.

The older notes below describe the coach that still speaks during the rest of the climb.

# Emberclimb coached first climb: rule coverage

The tutorial is a real short climb (Warrior, seed 7, a branching 6-floor map: fight, then treasure or fight, fight or ?, campfire or shop,
elite or fight, boss; foes at 75% HP) with free choices. Only the first 2 steps are forced (read the intent; play Anvil Blow). After that the
tutor kit stops and Warden Ashgrove, the coach, speaks one dismissable line at the top of the screen the first time each rule matters, reacts
to good and poor plays, and never blocks input. At the end she walks through the real numbers (floors, HP, gold, deck, relics) and an end
card lists every rule that did not come up under "Things you will meet later". Text: `src/story.js` (EC_STORY.coach), logic `src/tutor.js`.

Proof: `node tools/tut-end.js` plays the coached climb at 390x763 and 1440x860 with random legal moves through the UI only and fails if more
than 2 steps were forced, if the end card is missing, or if any rule below was neither explained during play nor listed on the end card.

| Rule (coach key) | When the coach explains it | Story beat / line |
|---|---|---|
| [x] intent | forced step 1 | "The summit ember is fading. Climb, Garrick! This Gnawer shows its next move." |
| [x] vuln | forced step 2 (Anvil Blow), then on handover | "It is Vulnerable now: your next hit lands double." |
| [x] energy | first turn of free play | "You hold 3 energy a turn..." |
| [x] block | first turn an attack is coming and a Block card is in hand | "An attack is coming. Block cards soak damage..." |
| [x] endturn | first time no card is playable | "No playable cards left: End turn..." |
| [x] target | first fight with 2+ enemies | "tap the enemy you want to hit" |
| [x] weak | first Weak on anyone | "Weak: each hit deals 3 less." |
| [x] poison | first poison on an enemy | "1 HP per token at the end of the turn, through Block. It stays." |
| [x] strength | first Strength on Garrick | "Strength adds to every hit" |
| [x] power | first Power card in hand (Kindle is stacked in the draw pile) | "A Power card lasts the whole fight." |
| [x] exhaust | first exhaust card in hand (Intimidating Roar is stacked) | "Exhaust cards vanish for the rest of this fight." |
| [x] die | first die card in hand (Wild Swing is stacked) | "Die cards roll 1-6" |
| [x] junk | first Dazed in hand or used pile | "Junk cards like Dazed can never be played." |
| [x] piles | first reshuffle of the used pile | "Your draw pile ran dry..." |
| [x] potion | first fight while carrying a potion (Venom Vial given) | "free to use, one use" |
| [x] reward | first reward screen | "pick one card, or skip to keep it lean" |
| [x] gold | gold above 110 | "Spend it at shops." |
| [x] relic | first relic offered or gained | "a lasting bonus for the whole climb" |
| [x] map | first map screen | "glowing rooms are your next step" |
| [x] rest | first campfire | "rest to heal, or smith to upgrade one card" |
| [x] shop | first shop | "tap an item, then Buy; pay to remove a card" |
| [x] event | first ? room | "a choice with a price or a prize" |
| [x] elite | first elite fight | "tougher than a normal foe, better loot" |
| [x] boss | boss fight | "The boss repeats a pattern. On its Spikes turn, attacks hurt you: block instead." |
| [x] lose | HP under half | "If your HP hits 0, the climb ends." |
| [x] preview | first card lifted after the energy line (W420) | "Lift a card: each foe shows the exact damage it would take..." |
| [x] frail | first Frail on the hero (act 2 foes), else on the end card | "Frail: your Block cards give a quarter less" |
| [x] acts | end card ("Things you will meet later") | "three acts, each with its own foes and guardian, plus a final act" |
| [x] laststand | end card | "with two heroes in a boss fight, the first to fall stays at 1 HP" |
| [x] shiv, orbs, stance, scry, retain | end card (other heroes' keywords; the coached climb is Garrick) | one line each |

Reactions: clean kill, double damage on a Vulnerable foe, fully blocked a hit (good); took 8+ damage with no Block, hit by Spikes, ended a
turn with energy and playable cards left (poor). The finale is the real numbers, one line at a time, then the end card.

Depending on the player's path, rules such as shop/rest, elite/fight or event come up in play or land on the end card; the test asserts
each rule is in one of the two. Duo play and the Rogue / Automaton / Monk mechanics are taught by their Story chapters.
