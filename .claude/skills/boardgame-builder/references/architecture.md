# Architecture

A working reference implementation is `assets/example-shardfall.html` (a huge area-control epic 2E mechanics, ~1,000 lines). Copy its patterns; read the relevant parts rather than the whole file.

## Contents
1. File layout
2. State and helpers
3. Turn flow and async actions
4. Human interaction layer
5. Computer players
6. Required test hooks
7. Game families

## 1. File layout
- **Current standard (see `references/layout-shell.md` and `assets/briefs/BRIEF-games.md`):**
  - sources in a folder, with `build.py` inlining the shell, Three.js, PerfHUD, the audio and net modules, and the game scripts;
  - the build writes `<slug>.html` and `x.js`.
  - The old head.html + body.html approach below still describes the inner structure.
- `/home/claude/<slug>/head.html`: `<head>` with fonts, CSS tokens and all styles (start from `assets/parchment-head.html` or restyle it).
- `/home/claude/<slug>/body.html`: markup + one `<script>`.
- Build: `cat head.html body.html > /mnt/user-data/outputs/<slug>.html`.
- Syntax check after every edit: extract the script and run `node --check`.
- Edit with small Python/sed replacements that `assert old in s`, so a failed match is loud.

Page layout: header (title, Tour, Rules, New game) · main board (SVG, viewBox fixed, e.g. 1000×660) · status tracks under it · side panel with: coach (tour), prompt (what to do now + action buttons), dice, hand, faction/political panel, legend, chronicle log. A modal layer for choices, roll overlays, rules and the start screen.

## 2. State and helpers
- One plain-JSON object `G` (no class instances, no functions) so localStorage save/load works: board contents, controls, tracks, decks/hands/discards, dice, phase, active side, log, winner.
- A separate `UI` object for transient interface state (`pick`, `choice`, `sel`, `roll`, `busy`, `focus`), never saved.
- Data tables are constants: regions/spaces with coordinates, adjacency edges string, factions, pieces, dice faces, card definitions.
- Cards: `{side, deck, name, text, can(), targets(), play(target, done), combat:{...}, ai(), aiT(targets)}`. A `play` that needs further input returns `true` and calls `done()` itself.
- Keep "rules" helpers small and pure: `owner(space)`, `canMove`, `canAttack`, `vp(side)`, `threat(space)`.

## 3. Turn flow and async actions
- Phases as functions: `startTurn → (draw) → (special phase) → roll → actions → endTurn`.
- Every action takes a `done` callback. Anything that shows a modal or roll overlay is async; the callback continues the chain. Call `finishDie()` / `endAction()` at the end; it checks victory, switches the active side, and calls `refresh()` (render + save + schedule).
- `schedule()` fires the computer's next step with `setTimeout(aiStep, ANIM?AIDELAY:0)` only when no modal, roll, pick or busy flag is open. This avoids deep recursion and lets the human see each move.
- Set `UI.busy=true` before starting an async multi-step action (battle, hunt) and clear it in `finishDie()`.
- Check victory after every action and after special phases; set `G.winner` and `G.winText`.
- Multi-round battles: per round, each side may play a combat card → roll with modifiers → apply hits → attacker chooses continue → defender chooses retreat → loop. Human sides get modals even on the computer's turn.

## 4. Human interaction layer
- Select a die → menu of actions (disabled with a reason when not allowed) → map picks (glowing regions) → confirm counts in a modal. Every step has Cancel, except forced ones.
- Prompt panel always states whose turn it is and what to do next in one sentence.
- Clicking a region with no pick active shows an inspect panel (what's there, who controls it, threats).
- Roll overlays show real dice faces, needed number, rerolls in a different style, and the outcome sentence.
- Guided tour: 5–8 steps that highlight a panel each; show once per browser (localStorage flag) and from the Tour button.

## 5. Computer players
- One `aiUse<Side>(face, done)` per side, returning true if it acted. Order dice by usefulness.
- Score candidate actions and pick the best (attack when strength ratio beats a threshold, which depends on fortifications; capture empty enemy objectives; reinforce threatened own objectives; move toward the nearest enemy objective by BFS distance).
- Keep garrisons: never empty your own victory objectives (keep 2–4 units depending on value).
- Decision helpers for every human modal: combat card choice, continue/stop, retreat, damage absorption, hidden-movement declaration.
- The computer player *is* the balance: a weak AI on one side skews every number. Improve AI habits to match how a sensible human plays before touching rules.

## 6. Required test hooks (the scripts depend on these)
- Globals `var ANIM=1, AIDELAY=650;` — tests set both to 0. `showRoll` must call `done()` immediately when `ANIM` is 0.
- `newGame(mode)` with modes `'F'`/`'S'` (human plays that side; use your own side letters and update the start screen), `'hot'`, `'ai'`.
- Start screen buttons with `data-start="<mode>"`.
- Globals readable via `window.eval`: `G.winner`, `G.winText`, `G.turn`, `G.phase`, `G.active`, `G.dice`, `G.log` (array of `{s,t}` newest first), and `UI.choice/roll/pick/busy`.
- Modal buttons use `data-opt` (cancel is `data-opt="x"`), roll Continue uses `data-roll`, pickable map regions are `g.reg.pickable`, action buttons are `#prompt [data-act]`, dice are `.die` buttons, card play buttons `[data-card]`.
- Tour flag in localStorage so tests can skip it.
- Log lines with stable prefixes for metrics (e.g. "Battle at", "captures", " plays “"). Adjust the regexes in `scripts/gauntlet.js` to match.

## 7. Game families
- **Dice-chuckers (a monster dice game, Dice Throne):** the dice ARE the game. Reroll phases with keep/lock toggles, big animated dice, clear symbol faces, a central contested zone, card market to buy from. Computer players need a keep-policy per goal (points vs attack vs heal vs energy) and a risk rule for staying in the contested zone. Balance per seat position (first-player advantage) across 2–6 players.
- **Map / area control (a huge area-control epic, Risk-likes):** SVG map with adjacency, stacking limits, fortifications, threat indicators; AI needs BFS distance maps and garrison logic.
- **Hidden information:** keep hidden data out of what the opponent AI "knows" unless the rules make it public; show the human only their side's hand in human-vs-computer.
- **Deck-builders:** market row, shuffle/discard piles, clear card-cost UI; AI buys by a simple priority list per phase of the game.
- **Worker placement:** occupied-slot visuals, round-end upkeep; AI scores slots by marginal value.
- **Simultaneous decisions** (maneuver dials, co-op planning, interrupt windows): collect one choice per seat, show who is still deciding, and keep the choices secret until revealed. In hot-seat, use a pass-the-device screen. Online, the host collects the choices.
- **Co-op deduction (the wire-cutting co-op, hidden-hand co-ops, trick-taking co-ops):**
  - Every computer teammate must reason only from what that seat may know: its own hand plus public information (revealed tiles, tokens, announcements). Build a per-seat `knowledge(seat)` view and give the AI only that, never `G`.
  - Let a constraint solver or sampler over possible hidden hands drive the AI's guesses. Show the human a "what we know" helper.
  - The balance target is a win rate per mission or difficulty.
- **Co-ops:** "computer player" becomes automated teammates plus the game's own adversary system; balance target is a win rate (e.g. 30–50% at normal difficulty) rather than a split.
