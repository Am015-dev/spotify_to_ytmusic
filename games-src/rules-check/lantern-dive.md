# lantern-dive: rules check

Adapts: a cooperative trick-taking game for 2 to 5 players (40 cards: four colour suits 1-9 plus four trump cards 1-4), played as a campaign of 32 missions. Players draw small task cards ("jobs") whose total difficulty must match the mission, divide them, and may signal once per attempt with a token placed on a card in hand.

Sources checked
- Publisher English rulebook PDF (host: 1jour-1jeu.com, cdn.1j1ju.com), read in full via text extraction. Confidence in the rule text below: high.
- Rule summaries / reviews from web search (three-player extra card, distress signal). Confidence: med.
- games-src/lantern-dive/rules-notes.md and game/src/engine.js, data.js (read: dealing, assignment, distress, ping, play, trick winner, jobStatus kinds, mission table).
- The published card-by-card task table could not be fetched (not in any web source reachable). Spot checks against two printed examples passed.

Counts: WRONG 0, MISSING 2, SIMPLIFIED 11 (3 of them are consistency notes, not deviations)

## Matches the rulebook (checked, no action)
- 40 cards, 36 colour + 4 trump; all dealt; 3 players: one gets an extra card that is never played (13 tricks); 4 players 10 tricks, 5 players 8 tricks. engine.js:28, :182-195.
- Holder of trump 4 is the Commander, leads trick 1, picks first job. engine.js:194.
- Follow suit if able, trump wins, trump lead sets the suit, not forced to win, highest card of led suit wins. engine.js:540-572.
- Signalling: one colour card shown, token top = highest, middle = only, bottom = lowest, never trump, only between tricks, once per attempt, may not be moved. engine.js:481-512.
- Jobs: drawn until the sum for the crew size matches the mission difficulty exactly, skipping overshoots; job belongs to the taker; job done when met and cannot fail; one failed job loses the attempt; retry may keep or redraw jobs. engine.js:262-282.
- Fewer jobs than players: a player may pass but all jobs must be taken within the round; never allowed to pass when jobs >= players. engine.js:350-360.
- Commander-comparison jobs may not be taken by the Commander. engine.js:349.
- Distress: after jobs, before any signalling, everyone passes one non-trump card the same direction; stays lit; may pass again at each later attempt; mission counts one extra attempt. engine.js:449-473.
- Drone (2 players): trump 4 set aside, 7 face-down + 7 face-up on top, trump 4 shuffled back, 13 each, drone uses 3-player difficulty, Commander plays for it, face-down card turns only after a trick. engine.js:182-190, :610-614.
- Unknown waters (1-3 normal, 4-6 murky, 7-9 narcosis, redraw a trump pull); murky = no token on the card; narcosis = shared tokens (players minus 2). engine.js:300-306.
- Volunteer missions (one or two volunteers, yes/no only, asked once round the table, Commander last, two volunteers each take at least one job). engine.js:332-345, :436-440.
- Two sampled task cards checked against the rulebook-derived examples: "trick of only even cards" difficulty 2/5/6 and "win the Kelp 6" 1/1/1. data.js:62, :48.

## Findings
| Class | Code | What the code does | Correct rule |
|---|---|---|---|
| MISSING (low impact) | engine.js:196-209, newGame | The drone always sits in seat 3 (plays after both divers). | The Commander decides where the drone "sits" in the turn order. |
| MISSING (cosmetic) | UI | No reminder card is added to the hand after signalling. | After signalling, the player takes a reminder card into the hand until the shown card is played. Pure memory aid. |
| SIMPLIFIED | rules-notes.md #1; data.js MISSIONS 4,8,12,14,15,21,23,27 | Difficulty values of eight missions were guessed (4, 6, 6, 4, 5, 10, 11, 12). | Printed values exist in the logbook; unverified here. |
| SIMPLIFIED | engine.js:514-527 (startSignal) | Before trick 1 the signal round is taken in turn from the Commander (each pings or passes). | Players may signal in any order or freely between tricks; no turn order. |
| SIMPLIFIED | engine.js:355 (vote) | Mission 6 vote is a formal vote, ties go to the Commander. | The crew agrees silently which one player takes all jobs; no tie-break defined. |
| SIMPLIFIED | engine.js:262-282 (noCap filter) | Commander-comparison jobs are never drawn in missions where one player must take everything. | Rulebook only forbids the Commander taking them. Stricter than printed rules. |
| SIMPLIFIED | engine.js:482 and notes #12 | After a hand-over in missions 10/13, pings blocked once trick 1 is complete. | Same intent (all talking before the first trick). Fine, noted. |
| SIMPLIFIED | engine.js:231-261 (conflict, splitOK) | Impossible job combinations are removed at draw time automatically. | Players detect them and swap only the most recently uncovered card, and only when no single player could take both. Code is somewhat stricter (also removes pairs one player could hold when the round needs every seat filled). |
| SIMPLIFIED | engine.js:540 (playable, drone) | Drone follow-suit uses only its face-up cards. | The rulebook says the drone can only play face-up cards; consistent. Listed because the follow-suit wording itself is not explicit. |
| SIMPLIFIED | engine.js:449-456 (2 players) | Distress pass with 2 divers is a swap between them. | Rulebook does not say how the drone takes part; unverified. |
| SIMPLIFIED | engine.js:506-512 | A lone card of a suit may only be shown as "only". | Rulebook: one of the three conditions must hold; a lone card meets all three. Accepted community ruling is "middle". Med confidence. |
| SIMPLIFIED | Descent mode, boss curses (engine.js:561) | Our own campaign mode with changed trick-winner rules. | Not in the published game. Labelled as an addition in the notes. |

## Not verified
- All 96 task cards: wording, thresholds and the three difficulty numbers each. The sources used by the team are two community tables; I could only spot check two cards. Confidence: low for the rest.
- Mission difficulties other than 1 and 5 (rulebook confirms mission 1 = 1 and mission 5 = 5).
- Mission 32 fixed job list and the "keep going" challenge (difficulty 18, +1 each success).
- Whether the distress flare may be lit later than the first attempt of a mission (rulebook says "at the start of each mission"; code allows lighting at any attempt start). Med.
- Narcosis token count with 2 real players plus the drone (code: 1).
- Whether "more of one colour than another" compares cards won (code) or cards in hand; the rulebook text I extracted is garbled here. Low.
