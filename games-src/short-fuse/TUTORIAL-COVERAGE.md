# Tutorial coverage: "Prologue: The Training Rig" (Foreman Brix teaches, Vesper Quill is the rival)

One complete, real, short job (3 players: you = the foreman, Teal, Plum; 15 wires; fuse of 3 steps; one gear card), played from setup to the
Defused result, against the real computer crew. Fixed layout, scripted crew moves (`tutMove` in game/tutor.js), nothing is saved, no result is recorded.
Every step makes the player do the real action (spotlight on the exact element, advances only when the action is done) or watch exactly one thing.
All the words are in `game/story.js` (`STORY.tut`). Chapters are labelled in the bubble title; the shell restarts the staged job from step 1 if you leave
(the staged job cannot be saved), so "leave and resume" restarts the prologue: honest note, see "Not covered".

Chapters: **1 Your first turn** (goal..hit) · **2 Scoring** (crew1..crew2) · **3 Special cases** (probe..solo) · **4 Defused** (win).

| Rule | Step id | Story beat (Brix unless noted) | By |
|---|---|---|---|
| [x] Goal: cut every wire, together, before the fuse runs out | `goal` | "Quill taped a ticking rig to the shop door. Cut all 15 wires together before the fuse dies." | seeing |
| [x] Your stand is face up to you, sorted low to high | `mine` | "Rookie, these wires are yours. Only you see the numbers, lowest on the left." | seeing |
| [x] The crew's wires are hidden; they never see yours | `crew` | "Teal and Plum hold the rest. You see their backs, they never see yours. Trust them." | seeing |
| [x] The fuse: a miss burns a step, none left = boom; red = boom | `fuse` | "Three steps stand between us and Quill. A wrong cut burns one. A red wire ends it." | seeing |
| [x] Opening info token on one of your own wires | `token` | "First, the crew shows one wire each. Tap your 3 and a token tells everyone its number." | doing |
| [x] Tokens are clues for everyone | `tokens2` | "Teal and Plum showed theirs. Tokens are clues the whole crew shares." | seeing |
| [x] One action per turn, foreman first, then clockwise | `point`, `hit`, `crew1` | "One cut per turn, then it passes clockwise." | doing |
| [x] Dual cut part 1: point at a crewmate's wire | `point` | "Teal's token says 2. Tap that wire to point at it." | doing |
| [x] Dual cut part 2: name a number YOU hold | `name` | "Say a number you hold. Tap one of your 2s..." | doing |
| [x] A hit cuts both wires | `hit` | "Both 2s cut! Rewind just unlocked." | doing |
| [x] Equipment unlocks when two of its number are cut | `hit` (unlock), `gear` (use) | "Rewind just unlocked" / "Tap it to turn the fuse back one step." | seeing + doing |
| [x] Computer teammates play the same rules, in turn | `crew1` | "Watch: Teal used your token to cut your 3. Plum held the last 3s and cut them alone." | seeing |
| [x] A miss: the fuse burns, a token shows the true number, your wire stays hidden | `wrong1`, `wrong2`, `wrongres` | Quill: "Tick, tick. The fuse burned a step, and a token shows the true number." | doing |
| [x] Using sort order and tokens as clues (crew uses the token the miss revealed) | `crew2` | "Teal used that token to cut a 1, and Plum cut the last one." | seeing |
| [x] Validation check mark when all four of a number are cut | `crew2` | "A green check marks a finished number." | seeing |
| [x] Solo cut: you hold every wire left of a number | `solo` (and Plum does one in `crew1`) | "You hold every 2 left, so cut them alone." | doing |
| [x] Personal tool: the Twin Probe, once per job | `probe` | "Your trick: once per job, point at two wires and say one number." | seeing (explained, spotlighted, not fired) |
| [x] Yellow wires: a yellow matches only a yellow; you must hold one to say "yellow" | `yellow1`, `yellow2` | "Quill loves yellow: a yellow only matches a yellow." | doing |
| [x] Red wires: never point at one | `red` | Quill: "Never point at red or it blows." | seeing |
| [x] A hand of only reds is revealed for you | `red`, `solo`, `win` | "If red is all you hold, it reveals itself." | seeing (it happens in the last turn) |
| [x] The end: every wire cut = defused (the final scoring screen: wires cut, turns, misses) | `win` | "Every wire cut. The rig is silent, and Quill's brass key falls off the door. You are on the crew." | seeing |
| [x] Turn captions, banner and score pop (how to read a turn) | all crew steps | the same captions Quick and Story use ("Teal points at one of your wires and says 3", "+2 a match") | seeing |

## Not covered by doing (honest list)
- Job-specific twist rules (timers, oxygen, constraint cards, hidden-info jobs 38/56/64, character powers other than the Twin Probe, the 12 equipment cards other than Rewind):
  each job states its twist on its brief card and the lightbulb explains it. Story mode introduces one new rule per chapter with a Brix/Quill scene.
- Ties and tie-breaks do not exist (co-op). "Empty market" and "can't place" do not exist in this game.
- A hand with no legal cut (the engine's stuck rule) is not staged: the staged job always has a legal cut. See rules-check/short-fuse.md.
- Resuming the prologue mid-way: leaving restarts it from step 1 (the shell cannot save a staged job); each chapter is short (about a minute).
