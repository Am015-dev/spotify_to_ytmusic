# Tutorial coverage: "Prologue: The Training Rig", a COACHED FIRST GAME (Brix teaches, Quill is the rival)

One real, short job (3 players: you = the foreman, Teal, Plum; 15 wires; fuse of 3; Rewind) played from setup to the scoring card against the real computer crew.
Every legal move is allowed from turn 1; there are no forced taps. Brix (and Quill) speak just-in-time, one non-blocking bubble at a time (dismiss with "Got it", or it fades);
a rule that never came up in your game is listed on the end card under "Things you'll meet later". The end card walks through the scoring with your real numbers.
Words: `game/story.js` (`STORY.coach`, `STORY.later`). Proof: `game/coach-test.js` plays the game through the UI at 390x763 and 1440x860.

| Rule | Id | Taught when | Story beat |
|---|---|---|---|
| [x] Goal: cut every wire together before the fuse runs out | `goal` | game start | "Quill taped a ticking rig to the shop door..." |
| [x] Your stand: face up to you, sorted low to high | `mine` | game start | "the wires at the bottom are yours" |
| [x] Crew wires hidden both ways | `crew` | game start | "You see their backs, they never see yours" |
| [x] The fuse: a miss burns a step, red = boom | `fuse` | game start | "Three steps stand between us and Quill" |
| [x] Opening info token on one of your wires | `token` | when you must show a wire | "Everyone shows one wire" |
| [x] Tokens are clues for everyone | `tokens2` | when play begins | "Tokens are clues the whole crew shares" |
| [x] Dual cut: point at a crew wire, name a number you hold; one action per turn, clockwise | `point` | your first turn | "Tap a crewmate's wire... then one of your own numbers" |
| [x] A hit cuts both wires (+ good-move line) | `hit` | after your first hit | "Both wires are cut" |
| [x] A miss: fuse burns, token shows the true number (+ poor-move line) | `miss` | after your first miss | Quill: "Tick, tick" |
| [x] Solo cut: you hold every wire left of a number | `solo` | after your first solo | "No guessing, no risk" |
| [x] The computer crew can solo cut | `crew1` | when a rival solo cuts | "Plum held every one left" |
| [x] The crew plays by the same rules (tokens, sort order) | `crew2` | when a rival hits | "Your crew plays by the same rules" |
| [x] Validation check mark when all four of a number are cut | `check` | when it happens | "the green check goes up" |
| [x] Equipment unlocks after two of its number are cut, works once | `gear` | when Rewind unlocks | "Rewind is ready" |
| [x] Personal tool: the Twin Probe, once per job | `probe` | your second turn | "Your trick, once per job" |
| [x] Yellow wires match only yellow; you must hold one to say it | `yellow` | your turn, while you hold the yellow | "Quill loves yellow" |
| [x] Red wires: never point at one; a hand of only reds reveals itself | `red` | your turn, while you hold the red | Quill: "Never red" |
| [x] The end and the scoring (guesses that hit, solo cuts, misses, fuse left, wires cut) | end card | when the bomb is defused or explodes | "The rig is silent" / "Everybody breathes. Again." |

## Not covered by doing (honest list)
- Job-specific twists (timers, oxygen, constraint cards, hidden-info jobs, character powers other than the Twin Probe, the other 11 equipment cards): each job's brief card states its twist; Story mode adds one per chapter.
- No ties or tie-breaks exist (co-op). "Empty market" and "can't place" do not exist in this game.
- Stuck hand (no legal cut) is not staged; see the help drawer.
- Because the game is free play, the order bubbles appear in follows your play; the unseen ones are on the end card.
