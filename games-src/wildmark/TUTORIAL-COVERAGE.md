# Wildmark tutorial coverage (coached first game)

Owner, 7 Nov: "The tutorial is not a game, it's tap tap." It is now a **coached first game**: a real 8-turn game against Bram (easy) with
free choices from turn 1. There are no forced steps; every legal move is allowed. The market is stacked on turns 1-4 (seed 11,
`tutFix`) so the key situations come up early. Ward Elder Rowan speaks the first time each rule matters, in one bubble at a time.
The bubble never blocks a tap (checked by elementFromPoint) and can be dismissed. After the player's own move Rowan gives up to 3
one-line verdicts ("Nice move: +4 from Bears"). At the end the result screen walks through the score rule by rule with the player's
real numbers. Rules that never came up are listed under "Things you will meet later".

Words: `campaign.json` → `prologue.coach[id]`. Rule ids: `COACH_RULES` in `src/tutor.js`.
Proof: `node tutorial-end.js` plays the coached game with random legal moves through the UI, at 390x763 and 1440x860. It asserts:
the result screen and walk-through appear, the tutorial is marked done, no tap was blocked, and every rule below was explained or listed.

| Rule (id) | When Rowan explains it | Story beat |
|---|---|---|
| goal: 8 turns, out-grow the rival, pick a pair (`goal`) | first pick | Bram wants the valley for timber |
| place a tile next to your valley (`place`) | first tile step | |
| habitats: 1 point per tile in the biggest joined group (`habitat`) | first time your habitat score grows | |
| turn split tiles (`rotate`) | first split tile you hold over a spot | |
| settle an animal on a tile that shows it, or return it (`settle`) | first animal step | |
| bear pairs (`bear`) | first time you hold a bear (stacked: turn 1) | |
| elk lines (`elk`) | first time you hold an elk | |
| salmon runs (`salmon`) | first time you hold a salmon | |
| lone hawks (`hawk`) | first time you hold a hawk | |
| fox neighbours (`fox`) | first time you hold a fox (stacked: turn 2) | |
| keystone gives an acorn (`keystone`) | when you earn one (stacked keystone on turn 1) | |
| spend an acorn: free pick or replace (`acornSpend`) | first pick with an acorn in hand | |
| three alike: optional sweep, once per turn (`sweep3`) | stacked on turn 3 | |
| four alike: the market wipes itself (`wipe4`) | stacked on turn 4 | |
| the rival's turn (`rival`) | Bram's first turn, played step by step | Bram takes, places, settles |
| habitat majority bonus (+2, tie +1) (`majority`) | from turn 4, again in the walk-through | out-grow Bram |
| final scoring (`final`), acorns are points (`acornsEnd`), tie-break (`tiebreak`) | the walk-through on the result screen | the thaw |

An animal the player never holds is the only rule that can end up in "Things you will meet later". In the proof runs that was one
animal per run (hawk on phone, salmon on PC).
Not in this tutorial: solo-mode market discard (help drawer, "Solo"); card sets B-D (help drawer, mixed cards).
