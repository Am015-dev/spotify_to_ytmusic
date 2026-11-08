# Nebula Aces: rules checklist (W445)

Every numbered rule below is asserted once, headlessly, against the real engine by `logic-test.js`
(`node logic-test.js`; one line `FAIL R<n>: expected X, got Y` per failure). The test sets up the state, acts through
the engine's own entry points (`performMove`, `executeMove`, `weaponsFor`, `dealDamage` and so on), with the dice
scripted, and checks the exact result. The expected values come from the 1st-edition rulebook as written here, not
from the engine and not from the earlier builder tests (`rules-test.js`, `unit.js`, `sweep.js`, which are not evidence).
The numbered list below is generated from the test file (`node logic-test.js --md`), so the two cannot drift.

Scope: the core-set rules plus the expansion rules that belong to the rules reference (ion, large bases, turrets,
auxiliary arcs). Per-card text of the 57 expansion pilots and 57 upgrades is not asserted here; `unit.js` and
`cover.js` exercise those but are builder tests.

## Known gaps in the sources
The publisher's PDFs and the rules catalogue sites were blocked from this environment, and web search returned only
fan forums. These points rest on the older notes (`rules-notes.md`) and memory, and are marked here so the owner can
overrule them:
- Initiative tie (R4): the original rule is a random roll; this adaptation gives it to the second-named side with no
  die (owner decision W391). The test pins the adaptation, not the original.
- Both last ships destroyed together (see the Win section): sources disagree (older rule: initiative player wins; a later reference
  and the forums: draw). The test pins the adaptation (initiative player wins).
- A stressed ship that reveals a red maneuver: the adaptation lets the opponent pick any non-red maneuver ([R4] in
  `rules-notes.md`). Not independently confirmed.
- Pilot-trait damage card texts are from memory of the original deck; Flash Blindness ("cannot modify your attack dice")
  and the ion rule ("flies straight 1 and takes no action") were corrected in W445 on that basis.

## Rules

## Setup

1. Play area is 914 mm (3 ft) square; small bases 40 mm, large bases 80 mm; range bands are 100 mm.
2. A squadron costs the sum of its pilots' points plus the points of their upgrade cards (28 + 4 + 4 = 36).
3. The player with the LOWER squad total has initiative.
4. Tied squad totals: initiative is decided without dice (owner decision W391 replaces the original random roll; still exactly one side has it, the second-named).
5. Six asteroids are placed, each beyond range 2 of every table edge and beyond range 1 of every other asteroid.
6. Players take turns placing asteroids, the initiative player first.
7. Ships deploy one at a time in ascending pilot skill; on equal skill the initiative player deploys first.
8. Every ship is deployed completely within range 1 (100 mm) of its owner's table edge.
9. Starting state: no stress, focus, evade or lock tokens; shields = shield value; no damage cards.
10. Lancer: attack 3, agility 2, hull 3, shields 2; actions focus + target lock.
11. Talon: attack 2, agility 3, hull 3, shields 0; actions focus, barrel roll, evade.
12. Core pilots keep their pilot skill / points (8/28, 5/25, 4/23, 2/21 and 7/17, 6/16, 5/15, 4/14, 3/13, 1/12).
13. Lancer dial (speed 1-4): 1: bank L/straight/bank R green; 2: straight green, rest white; 3: all white; 4: straight white, K-turn red.
14. Talon dial (speed 1-5): 1: turns white; 2: turns white, banks/straight green; 3: turns+banks white, straight green, K-turn red; 4: straight white, K-turn red; 5: straight white.
15. The damage deck has 33 cards: 7 Hull-Rupture-type (counts 2) and 13 other kinds x 2; 4 kinds are Pilot cards (the rest Ship).

## Planning

16. Each ship needs exactly one dial setting taken from its own dial; the Activation phase starts only when every ship of both sides has one.
17. Dials are secret: the opponent's view hides a set dial.

## Activation

18. Ships activate in ASCENDING pilot skill; ties go to the initiative player's ship first.
19. Pilot-skill ties: with initiative on the other side the other side's ship activates first (and the Combat order flips too).
20. A ship moves, then performs ONE action, and only then does the next ship activate.
21. A ship may skip its action; the activation then ends and the next ship (higher pilot skill) is the one that moves.

## Maneuver

22. Straight n: the template is n x 40 mm long and the ship (40 mm base) ends with its rear edge at the template end, so its centre moves 40n + 40 mm (80, 120, 160) keeping its heading.
23. Bank (45 deg): a left bank turns the ship left (counter-clockwise) by 45 deg, a right bank right by 45 deg, ending forward and to that side.
24. Turn (90 deg): left turn ends facing 90 deg left of the start, right turn 90 deg right; turn 1 is tighter than turn 3.
25. Bank 1/2/3 and turn 1/2/3 use templates of increasing length (bank radius 80/130/180 mm; turn radius 35/62.5/90 mm) so a faster bank ends farther away.
26. K-turn (speed n): move as the straight of the same speed, then the ship ends facing the opposite direction.
27. The maneuver flown is the dial that was set: straight 2 from (300,300) facing up ends at (300,420).
28. Green maneuver: after it the ship removes 1 stress token (only one).
29. Red maneuver: after it the ship receives 1 stress token.
30. White maneuver: stress is neither added nor removed.
31. A stressed ship that reveals a red maneuver does not fly it: the opponent chooses a non-red maneuver from its dial.
32. A stressed ship cannot perform actions, not even free ones (Nightjar: after a green maneuver, still stressed -> no free focus offered).
33. A stressed ship skips the Perform Action step (it is never offered an action).
34. Overlap (bump): a ship whose maneuver would end on another ship is moved back along the template until it just touches; the bases do not overlap.
35. A ship that bumped is marked as touching the other ship, skips its action, and the bumped K-turn does not rotate it.
36. A bumped ship still receives stress for a red maneuver.
37. Ships that are touching cannot attack each other.
38. Leaving the play area (any part of the base past the edge) destroys the ship.
39. Edge test is exact: ending with the base edge 1 mm inside the table is fine, 2 mm outside destroys the ship.
40. A ship destroyed by an asteroid hit is removed at once (its damage cards go to the discard pile) and takes no further part in the round.
41. Asteroid: a ship whose template or final position overlaps an asteroid rolls ONE attack die: hit = 1 damage, crit = 1 critical damage (faceup), else nothing.
42. Overlapping several asteroids in one maneuver still costs only ONE attack die (1 damage, not 3).
43. A ship that overlapped an asteroid skips its Perform Action step.
44. A ship that ends its move on top of an asteroid cannot attack that round.

## Action

45. Focus action: the ship gains 1 focus token.
46. Evade action: the ship gains 1 evade token.
47. Target lock action: the ship locks a chosen enemy ship at range 1-3.
48. Target lock cannot be taken on a ship beyond range 3.
49. A ship holds only one target lock; locking another ship replaces the old one.
50. Barrel roll: the ship slides sideways by one template-width (80 mm centre-to-centre for a small base) keeping its heading; left and right both offered.
51. Barrel roll is not allowed if the ship would end overlapping another ship or off the table.
52. Boost (interceptor-class): move straight 1 or bank 1 (left/right) without changing the dial; Boost not offered on ships without it.
53. A ship may not perform the same action twice in one round, even as a free action (Nightjar's free focus uses up the focus action).
54. Actions available are only those on the ship's action bar (Lancer: focus + target lock; no evade, no barrel roll).

## Range

55. Range 1 = up to 100 mm base-edge to base-edge, range 2 = 100-200 mm, range 3 = 200-300 mm; beyond 300 mm no attack.
56. Band edges are exact: a gap of 99 mm is range 1, 101 mm is range 2, 199 mm range 2, 201 mm range 3, 299 mm range 3, 301 mm no attack.
57. Range is measured from the closest point of the attacker's base to the closest point of the defender's base that is inside the firing arc (here 85 mm, not the 150+ mm to its centre).
58. Firing arc: only a target (part of it) inside the front 90-degree arc can be attacked; a target directly behind or beside cannot.
59. Small-base arc edges (1st edition): the lines run from just inside the front corners, opening about 81 deg; a ship 60 mm to the side and 55 mm ahead of the front edge is inside, one 70 mm to the side is outside.
60. Large base (80 mm) ships can be attacked and attack; a turret weapon fires in all 360 degrees.
61. Auxiliary (rear) arc covers the rear 90 deg for the primary weapon.

## Dice

62. The attack die has 8 faces: 3 hit, 1 critical hit, 2 focus, 2 blank. The defence die: 3 evade, 2 focus, 3 blank.
63. Range 2: the attacker rolls dice equal to its primary weapon value (3) and the defender rolls dice equal to its agility (3), no bonus.
64. Range 1: the attacker rolls 1 extra attack die with its primary weapon.
65. Range 3: the defender rolls 1 extra defence die.
66. The range-1 attack bonus and range-3 defence bonus apply to primary weapons only (a torpedo at range 3 does not give the defender... only secondary: no range-1 die).
67. Attacking when the attacker has 0 attack value rolls no dice and cannot hit (the primary weapon is reduced by Weapon Glitch to a minimum of 0).
68. Focus token on offence: spends the token and turns every focus result into a hit.
69. Focus token on defence: spends the token and turns every focus result into an evade.
70. Evade token: spending it adds one evade result.
71. Target lock: the attacker may spend the lock to reroll any number of its attack dice (the chosen ones only); the lock is then removed.
72. A die can be rerolled only once per attack: after a reroll those dice are no longer in the reroll pool.
73. Evade results cancel hit results first, then critical hits (1 hit + 1 crit vs 1 evade -> the crit gets through).

## Damage

74. A critical hit also costs a shield first: with 1 shield, a lone crit removes the shield and deals no damage card.
75. A Hull Rupture card counts 2 damage only while faceup; dealt facedown it counts 1.

## Dice

76. The attack hits if at least one hit or crit remains after evades; with every result cancelled no damage is dealt.
77. Obstructed attack (line to the defender crosses an asteroid): the defender rolls 1 extra defence die.
78. Only one attack per ship per round (it cannot fire again after attacking).
79. A ship with nothing in arc and range (500 mm away) has no attack available.
80. A stressed ship can still attack and use focus tokens (stress only blocks red maneuvers and actions).

## Damage

81. Shields absorb damage first: each hit/crit removes a shield before any damage card is dealt.
82. Hits are resolved before crits: 1 shield, 1 hit + 1 crit -> the shield absorbs the hit and the crit is dealt faceup.
83. Without shields a hit is dealt as a facedown damage card, a critical hit as a faceup damage card.
84. A ship is destroyed when its damage cards equal its hull value; a faceup Hull Rupture card counts as 2 damage.
85. A ship with fewer damage cards than hull survives (2 facedown on hull 3).
86. Destroyed ships are removed and their damage cards go to the discard pile; locks on them are gone.
87. When the damage deck runs out, the discard pile is shuffled into a new deck.
88. Hull Rupture card: counts 2 damage and a faceup 1-damage ship dies with 2 more cards worth.
89. Flash Blindness: the next time the ship attacks it cannot modify its attack dice (no focus, no rerolls); the card is then flipped facedown.
90. Cockpit Fire: at the start of each Combat phase roll an attack die; a hit deals 1 damage (the faceup card itself counts 1, so hull 3 -> 1 left).
91. Shattered Canopy: from the round after it is dealt, the ship's pilot skill counts as 0.
92. Engine Stutter: all turn maneuvers count as red.
93. Sensor Blackout: the ship cannot perform any action on its action bar.
94. Sensor Blackout can be repaired by an action: roll an attack die, on a hit the card is flipped facedown.
95. Wounded Pilot: the ship ignores its pilot ability.
96. Secondary Blast: roll an attack die at once; on a hit suffer 1 damage; the card is flipped facedown.
97. Hull Breach: after the ship flies a red maneuver, roll an attack die; a hit deals 1 damage.
98. Munitions Jam: discard one secondary weapon upgrade at once; card flips facedown.
99. Buckled Frame: agility is reduced by 1 (minimum 0); repair by an action roll (hit).
100. Concussed Pilot: after a maneuver that makes the ship overlap another ship it suffers 1 damage.
101. Thruster Flare: receive 1 stress token at once; the card is flipped facedown.
102. Weapon Glitch: primary weapon value reduced by 1 (minimum 0).
103. A facedown damage card has no effect (only counts toward the hull).

## Combat

104. Ships attack in DESCENDING pilot skill (highest first).
105. Equal pilot skills fire simultaneously: a ship destroyed by an equal-skill attacker still gets to fire.
106. A destroyed ship of LOWER skill than the attacker does not fire (it is removed before its turn).
107. Unused focus and evade tokens are removed at the end of the round; stress and target locks stay.
108. Damage cards and shields stay between rounds (only tokens are cleared).
109. A new round starts after the end phase: round counter +1, dials cleared, per-round action memory reset.

## Win

110. The game ends when all ships of one side are destroyed; the other side wins.
111. If the last ships of both sides are destroyed simultaneously, the player with initiative wins (tie-break rule used by this adaptation).
112. The game continues while both sides still have a surviving ship.

## Ability

113. Kael Varro (hero pilot): when defending, may change 1 focus result to an evade (without a focus token).
114. Tomas Brink: other friendly ships at range 1 of him cannot be attacked if the attacker could attack him instead.
115. "Knifepoint": when attacking at range 1 roll 1 additional attack die.
116. "Hex": when defending, attackers cannot spend focus tokens or reroll attack dice.
117. "Nightjar": after flying a green maneuver may take a free focus action.
118. Plasma Torpedoes: attack value 4, range 2-3, needs a target lock, spends the lock and the card is discarded; may change 1 focus to a crit.
119. Plasma Torpedoes cannot be fired at range 1, nor without a target lock.
120. Mech "Tinker": after flying a green maneuver recover 1 shield up to the shield value.
121. Mech "Tinker" never raises shields above the maximum, and does nothing after a non-green maneuver.
122. Mech "Juke": action, +1 agility until the end of the round.
123. Iron Will: a faceup damage card with the Pilot trait is discarded without effect.
124. Deadshot Focus: action; when attacking this round change 1 focus to a crit and all other focus results to hits.

## Expansion

125. Ion token: an ionised small ship does not use its dial; it flies a white straight 1, loses the token, and takes no action.
126. A large ship needs 2 ion tokens to be ionised.
