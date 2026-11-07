# deep-signal: rules check (7 Nov 2026)

Adapts: a cooperative mission-based trick-taking card game for 2-5 players (40 cards: 4 colours 1-9 plus 4 trump cards 1-4, 36 task cards, order tokens, one-shot signal tokens, a distress-signal help, 50 missions, special mission types, 2-player variant with an artificial third crew member).

## Sources checked
- Full extracted text of the publisher's English rulebook (hosted on a github.io rules-summary site; read pages 1-21: materials, trick rules, communication, mission preparation, tasks and tokens, distress signal, symbols, 5-player rule, 2-player rule, variants). Confidence high.
- The 50 mission list itself (logbook) was not read; the shelf missions are original anyway.

WRONG 2, MISSING 2, SIMPLIFIED 4

## Findings
| class | code | what the code does | correct rule |
|---|---|---|---|
| WRONG | engine.js:31, 35-37 (2-player deal; `cmd = 2` when a drone stack holds the top trump) | Deals the 40 cards randomly; the drone's 7 stacks can contain Sonar 4, in which case the drone is captain and leads, with seat 0 playing for it. | Rulebook (2 players): put the highest trump (4) aside first, build the 14 drone cards from the other 39 (7 face down, 7 face up on top), then shuffle the 4 into the remaining 26 and deal 13 each. So the captain is always a real player and the drone never holds Sonar 4. rules-notes.md lists the current behaviour as "confirmed", which is wrong. |
| WRONG | engine.js:139 (`playCard`, dummy branch) | The hidden card under a drone stack turns face up and joins the playable hand immediately when the top card is played, i.e. during the trick. | The card below is revealed only after the trick is complete. (No effect on legality of the current trick; affects displayed information.) |
| MISSING | not implemented (grep: no hand-over/transfer of a task) | 5-player extra rule absent. | Rulebook: with 5 players, in the missions marked with a gold frame (25 onward, and 27, 37), after task cards are distributed and before the first trick one crew member may hand one of their task cards to another, without penalty and without revealing anything. Needs a per-mission flag on the shelf's own missions; confidence high on the rule, low on which shelf missions would carry it. |
| MISSING | engine.js:33 | In 3-player games the long (14-card) hand is always seat 0 (round-robin deal of an already shuffled deck gives index 0 the extra card). | Rulebook: one random player gets the extra card; it stays unplayed after the last trick. Behaviour (leftover card unplayed, a task on it fails the mission) matches; only the fixed seat differs. Harmless in solo-vs-AI but a human in seat 1/2 never gets the long hand. |
| SIMPLIFIED | engine.js:129-136 (`doFlare`) | Distress signal passes one non-trump card per real crew member to the neighbour in one direction; the drone does not pass. | Rulebook says each crew member passes one card to a neighbour, all the same direction, trumps never passed, +1 to the attempt count, only before any signal. Matches (canFlare, line 81). The 2-player case is not described in the rulebook. Documented. |
| SIMPLIFIED | engine.js:147, 175-185 | Several order-token tasks done in the same trick are sorted into the most favourable order. | Rulebook: allowed only if the tokens are consecutive; the position test (numbers = exact place, arrows = relative, last token = final) already forces this, so the outcomes agree. Documented. |
| SIMPLIFIED | engine.js:118 (`decide`) | "Captain decides" gives all tasks to one non-captain crew member after yes/no answers. | Matches the rulebook (the captain may not choose themself). Documented. |
| SIMPLIFIED | missions.json / mission list | 50 original missions; token and special-rule mix is similar in kind. | Published logbook is not copied. Documented. |

## Confirmed matching the rulebook (high confidence)
Deck 36 colour + 4 trump; 36 task cards; deal 5p=8, 4p=10, 3p=14/13/13; holder of the top trump is captain, picks a task first, then clockwise; captain leads the first trick, winner leads next; must follow the led suit, including a trump lead (legalCards line 63-66); any card if void; trump wins, highest trump wins; non-led non-trump cannot win; mission lost at once if anyone wins another crew member's task card; task done when its owner wins the trick with its card; several tasks in one trick allowed; signals: one per crew member per mission, only between tricks and after task distribution, colour cards only, must be highest/only/lowest, token position never changes (line 76-79), signal card stays in hand; dead-zone shows the card without a position (line 123); disruption blocks signals for the first tricks (lines 17-20); distress signal before any signal, trumps never passed, same direction for all; captain's distribution: even split (max difference 1, lines 100-103), the captain may take tasks themself, tokens go out in order.

## Not verified
- Per-attempt handling of the distress token (stays active until the mission is won, +1 attempt each time) lives in the UI; not read.
- Whether the shelf's "late2/late3" numbering matches "communication resumes at trick N" exactly: engine.js:19 allows signals once `tricks.length >= N-1`, i.e. before trick N. Consistent with the rulebook example ("number = trick from which communication resumes"). Confidence med.
- The "Challenge for three" variant and the first-mission help text were not compared.
- Housekeeping: games-src/deep-signal/rules-notes.md (addendum 2) contains a URL that carries the original title in clear text. It breaks the confidentiality rule and should be reworded to a domain only.
