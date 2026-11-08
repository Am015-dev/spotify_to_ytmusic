# Deep Signal rules checklist

Rules of the published co-operative trick-taking game this edition adapts, in the same words as the assertions in `logic-test.js`. Numbers match `R<n>` in the test output. The file is generated: `node logic-test.js --md > RULES-CHECKLIST.md`.

Sources: the game's published rulebook and online rules summaries (rules-notes.md cross-check), checked 8 Nov 2026. The 50 missions are original, so mission special rules are checked against the text on their mission cards.

Not applicable (co-operative game): scoring, final scoring, ties. A mission is simply won or lost; trick winners are always unique because every card is unique. Rules marked [assumed] are simplifications noted in rules-notes.md ("Guessed / simplified").

## A. Setup and deal

1. The deck has 40 cards: four colours (Coral, Kelp, Tide, Amber) ranked 1-9 (36 cards) plus four Sonar trumps ranked 1-4.
2. 5 players: all 40 cards are dealt, 8 each.
3. 4 players: all 40 cards are dealt, 10 each.
4. 3 players: all 40 cards are dealt, 14/13/13 (one player holds one extra card).
5. Every card exists exactly once after dealing, for 2, 3, 4 and 5 players (no duplicates, none missing).
6. 2 players: each player gets 13 cards; the drone gets the other 14 as 7 stacks of 2.
7. 2 players: the drone shows only the top card of each stack (7 cards in its hand); playing a top card turns the hidden card of that stack face up.
8. 2 players: the captain's player plays the drone's cards, and if the drone holds Sonar 4 the drone is captain, leads, and seat 0 plays for it.
9. The holder of Sonar 4 is the captain (3, 4 and 5 players).
10. The captain leads the first trick and may lead any card in hand (no card is forced).

## B. Task cards and drafting

11. Task cards are drawn from the 36 colour cards only (never a Sonar), all different, as many as the mission says (mission 45: 8).
12. The mission's order tokens lie on its task cards (mission 31: tokens 1, 2 and Ω among 6 tasks).
13. Drafting starts with the captain and goes clockwise, one task per turn (mission 27, 6 tasks, 4 players).
14. Only the player whose turn it is to draft may take a task.
15. When the last task is taken the first trick begins, led by the captain.

## C. Playing a trick

16. Follow suit: a player who holds the led colour must play that colour.
17. A player with no card of the led colour may play any card (including a Sonar).
18. If a Sonar is led, every player holding a Sonar must follow with a Sonar.
19. If a Sonar is led and a player has no Sonar, any card may be played.
20. Play goes clockwise: after seat 2 leads, seat 3 plays next.
21. The highest card of the led colour wins when no Sonar was played.
22. A card of another colour never wins unless it is a Sonar (Kelp 9 off-suit loses to Coral 5).
23. Any Sonar beats every colour card (Sonar 1 beats Coral 8).
24. Among Sonars, the higher Sonar wins (Sonar 4 beats Sonar 2).
25. The trick winner leads the next trick (turn passes to the winner).
26. A trick is only resolved after every player has played one card.

## D. Tasks and winning/losing

27. A task is completed when its owner wins the trick containing the task card (Coral 4, owner seat 3 wins T1).
28. If a task card is won by someone other than its owner, the mission fails at once.
29. Several tasks inside one trick are all completed when that trick is won by their owner.
30. The mission is won immediately when the last task is completed, even with cards still in hands.
31. 3 players: the one card left unplayed at the end can never be won, so a task on it fails the mission.
32. After the mission is over no further move is accepted (win or loss).
33. A finished game has a plain win/loss outcome (co-operative: no scores, no ties); a full game always reaches it.
34. 2 players: a full game with the drone ends with a result and consistent cards.

## E. Order tokens

35. Numbered token 1 then 2: tasks completed in that order win the mission.
36. Numbered token completed too early (token 2 done first) loses the mission at once.
37. Numbered tokens count every task: an untokened task done first makes token 1 impossible.
38. Numbered token 2 is satisfied by being the second task done overall (after one untokened task).
39. Arrow tokens: > before >> is correct.
40. Arrow tokens: >> completed before > loses the mission.
41. Arrow tokens only order the arrow tasks: untokened tasks may be done anywhere in between (U, >, >>).
42. Ω: finishing the Ω task while another task is still open loses the mission.
43. Ω: finishing Ω last wins the mission.
44. Same trick: tokens 2 and 1 completed in one trick are fine (any order inside the trick).
45. Same trick: Ω together with the other tasks in the same trick is fine.
46. Same trick: arrow tasks > and >> completed in one trick (any order) are fine.
47. Same trick: token 3 and an untokened task completed together after token 1 are fine (the trick is ordered in the most favourable way).
48. Same trick: token 2 and an untokened task completed together as the first tasks are fine (untokened counts first, token 2 second).
49. Token 1 completed in the same trick as an untokened task counts as first (most favourable order).

## F. Signals (crew communication)

50. A signal is allowed before the first trick (after the tasks are taken).
51. A signal is allowed between tricks (nothing on the table).
52. A signal is not allowed while a trick is in progress.
53. Each player may signal only once per mission.
54. Every player has their own signal (two different players can both signal).
55. Sonar cards can never be signalled.
56. Signalling the highest card of a colour in hand reports position "top".
57. Signalling the lowest card of a colour in hand reports position "bot" (lowest).
58. Signalling the only card of a colour in hand reports position "only".
59. A card that is neither highest, lowest nor only in its colour cannot be signalled (Coral 5 among 1,5,9).
60. The signalled card stays in hand and can still be played normally.
61. When the signalled card is played, the signal marker is removed.
62. Signalling does not use up a turn (the player to move stays the same).
63. 2 players: the drone can never signal.
64. No signals are allowed after the mission is over.
65. Silent-running missions (nocomm) forbid every signal.
66. Dead-zone missions show the signalled card but hide whether it is highest, only or lowest ("?").
67. Jammed-relay "late2": no signal in trick 1, signals allowed from trick 2.
68. Jammed-relay "late3": no signal in tricks 1-2, signals allowed from trick 3.

## G. Distress signal (flare)

69. A flare may be sent before the first trick and before any signal: everyone passes one non-Sonar card.
70. A flare is not allowed once any crew member has signalled.
71. Only one flare per mission.
72. A flare is not allowed after the first trick has been played.
73. A flare is not allowed during the draft (tasks must be assigned first).
74. Every crew member must pass a card: a flare with a missing pick is refused and nothing moves.
75. A Sonar card can never be passed in a flare.
76. All cards are passed the same way: left (next seat) or right (previous seat).
77. Hand sizes are unchanged after a flare.
78. The captain does not change after a flare (Sonar 4 cannot be passed).
79. Using the flare is recorded (it costs the "No flare" star).
80. A flare does not change who owns which task.
81. 2 players: the drone does not take part in a flare (only the two humans pass).

## H. Special mission rules
_These missions are original to this game (same kinds of rules as the published set, not copies), so the rule being checked is the text on the mission card._

82. "Wins no tricks" (mission 26): the captain picks one other crew member, who is given no task; the others share all tasks.
83. "Wins no tricks": if the chosen diver wins any trick the mission fails at once.
84. "Wins no tricks": finishing all tasks early does not end the mission; the diver must stay trickless to the end.
85. "Wins no tricks": the mission is won when all tasks are done and the cards run out with the diver trickless.
86. "Exactly one trick" (mission 20): the chosen diver winning a second trick fails the mission.
87. "Exactly one trick": the mission is won when the diver ends with exactly one trick.
88. "Exactly one trick": a diver who ends with no trick fails the mission.
89. "Captain decides" (mission 17): the captain gives all tasks to one other crew member.
90. "Captain decides": the captain cannot choose themselves (3 choices of 4 players).
91. "Captain distributes" (mission 28, 6 tasks, 4 players): tasks are split as evenly as possible (2,2,1,1).
92. "Captain distributes" (mission 28, 6 tasks, 5 players): split 2,1,1,1,1.
93. "Captain distributes" (mission 22, 4 tasks, 3 players): split 2,1,1.
94. "Sonar 1 must win a trick" (mission 9): playing Sonar 1 and losing the trick fails the mission.
95. "Sonar 1 must win a trick": winning a trick with Sonar 1 completes the goal and the mission is won.
96. "Sonar 1 must win a trick": with all tasks done but Sonar 1 not yet winning, the mission goes on.
97. "Every sonar must win a trick" (mission 13): a Sonar beaten by a higher Sonar fails the mission.
98. "Every sonar must win a trick": the mission is won only after all four Sonars have each won a trick.

## I. Not applicable or not in this edition
_Printed rules that have no counterpart here. Listed so nothing is silently skipped; no assertion is possible._

## I. Not applicable or not in this edition

- Scoring / final scoring / ties: none in a co-operative game (see above).
- Optional real-time timer, shared-signal-token mission modes and the larger task deck of the published set: not part of this edition.
- Attempts counter: replaced by the "No flare" star (see section G).
- 3-player extra card [assumed]: which seat gets 14 cards is not specified by the engine tests; the leftover card is never played (section D, 3-player leftover rule).
