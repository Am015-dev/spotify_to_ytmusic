# Campaign mode: shared framework + a story campaign for every game

The owner says: "All games are boring: no story mode with bosses and gradual difficulty." Build that.

Read first: `games-src/BRIEF-2d-games.md` (hard rules and Cost rules), `games-src/thornbound/CLARITY-PLAN.md`
(how players get confused), `games-src/shell/GX-KIT.md` and `games-src/shell/gx-kit.js` (the existing shared kit),
and for each game its `rules-notes.md` and `game/src/ai.js` (or equivalent), so you know which difficulty levers
exist.

## Part 1: the shared campaign system (new files only)
Create `games-src/shell/gx-campaign.js` + `gx-campaign.css`, and add a short `CAMPAIGN.md` next to them. Do NOT
change any existing shared file's behaviour.

The system provides:
- **A chapter map screen**: a painted path of 8–10 chapter nodes. Locked, open and beaten states, 1–3 stars each,
  and a boss node at the end of each act. It works at 390x763 and 375x553 with no scrolling sideways.
- **Story scenes**: 2–4 short lines with a character portrait slot. Shown before and after each chapter, and
  always skippable.
- **A chapter definition format**, as data (JSON-safe):
  - `{id, act, title, intro[], outro[], opponent:{name, portrait, personality, aiLevel, aiStyle}, setup:{...game
    options}, twist:{id, text}, goal:{type, value, text}, stars:[{text, test}], unlock}`
  - The game supplies callbacks: `startChapter(def)`, `isWon(G)`, `starsEarned(G, def)`.
- **A boss intro card**: name, portrait, one line of personality, and the twist explained in plain words
  ("Boss rule: the Tide Queen starts with 2 extra pearls"). Plus a short taunt or praise line when a boss wins or
  loses.
- **Progress saved locally** (`gns-campaign-<game>`, inside try/catch): chapter results, stars, unlocks.
  `GNS.result()` is called with `mode: 'campaign'`.
- **Gradual difficulty**:
  - Act 1 teaches: easy AI, a goal that teaches one idea, hints on.
  - Act 2 is normal.
  - Act 3 is hard, with boss twists.
  - After 2 losses on a chapter, offer "make it a bit easier" (with fewer stars).
- **Unlocks**: a new boss portrait, a card back, a title, or the next act. Purely cosmetic or progression; no
  pay-to-win.

## Part 2: a campaign design for every game (data files)
For each game below, write `games-src/<folder>/campaign.json` (chapters in the format above) and
`games-src/<folder>/CAMPAIGN-DESIGN.md` (one page: the story premise in the game's own world and names, the
rival bosses with personalities, and the difficulty curve).

Games:
- thornbound
- hollowbough
- tidewake
- ft (Sands of Qamar)
- kot (Crown City Smash)
- munch (Doorkick Dungeon)
- xw (Nebula Aces)
- rc (Shipwreck Isle; co-op: bosses become scenario threats)
- carc (Rampart and Vine)
- azul (Sunglaze)
- kaiten (Kaiten Kitchen)
- short-fuse (co-op: the missions already ramp; give them a story arc and boss missions)
- lantern-dive (co-op missions: same)
- cauldron-fair
- final-approach (co-op: airports are the chapters; boss = the hardest airport of each act)

Rules for the designs:
- Use only levers the game already has or can add without breaking the rules engine: AI level and style,
  setup options, player count, starting resources, scenario or mission choice, and a twist from a small menu
  the game can implement in its setup or scoring code.
- The normal game's rules stay unchanged. Twists only apply inside the campaign and are always explained on the
  boss card.
- Each act's first chapter must be winnable by a newcomer. Make each goal concrete ("Win with at least 20
  points", "Finish before round 6").
- Original names only. Never write an original game's, publisher's or designer's name anywhere.

## Part 3: a demo
`games-src/shell/campaign-demo.html` shows the map, a story scene, a boss card and the result screen with sample
data at 390x763. Take screenshots and look at them yourself.

## Deliver
Do NOT edit any game's existing source files or anything in `games/`; other sessions are editing them right now.
Only create the new files listed above. Commit, then
`git fetch origin alex/brave-carson-rbpmlk && git merge origin/alex/brave-carson-rbpmlk` and push to
`alex/brave-carson-rbpmlk` (only your new files). Also push your branch. No model identifiers. Cost: work
directly, no polling. End with a 10-line summary.

## Part 4 (later, per game, done by other sessions): integration
For each game, after its clarity session has finished, a session will:
- add a "Story" button on the title;
- wire `gx-campaign.js` to `campaign.json`;
- implement the twists in setup and scoring;
- play the first 3 chapters itself, then run 1 blind tester;
- publish the result to the game's preview link.
