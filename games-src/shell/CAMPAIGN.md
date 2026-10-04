# Campaign kit: story chapters, bosses and gradual difficulty

`gx-campaign.js` + `gx-campaign.css` add an opt-in **Story** mode to any game on the shelf. They are new files:
nothing in `shell.js` or `gx-kit.js` changes, and a game that never calls `GXC` is unaffected. The kit works with
or without `shell.js` / `gx-kit.js` loaded (it uses `GNS.result` when present). Demo: `campaign-demo.html`.

Each game owns two data files next to its source: `campaign.json` (chapters, below) and `CAMPAIGN-DESIGN.md`
(story premise, bosses, difficulty curve). The game implements its twists in its own setup or scoring code; the
normal game's rules never change.

## 0. Include it
```python
SRC['gx-campaign.js'] = os.path.join(SP, 'shell', 'gx-campaign.js')   # after shell.js / gx-kit.js
css += rd(os.path.join(SP, 'shell', 'gx-campaign.css'))
CAMPAIGN = rd(os.path.join(D, '..', 'campaign.json'))                  # inline as: window.CAMPAIGN = {...};
```
The screens are a full-page overlay (`.gxc`, z-index 60) appended to `<body>`. Theme with `--gxc-*` variables.

## 1. The data format (`campaign.json`, JSON-safe)
```jsonc
{
  "game": "tidewake",                       // shelf id, same as GNS / games/index.html
  "title": "The Drowned Crown",             // campaign name shown on the map
  "version": 1,
  "cast": {                                  // everyone who speaks or appears; portrait = art file name or an emoji
    "guide":  { "name": "Old Marrow", "portrait": "camp-marrow.webp", "emoji": "🧓", "color": "#3b7a8c" },
    "queen":  { "name": "The Tide Queen", "portrait": "camp-queen.webp", "emoji": "👑", "color": "#2d4f9e" }
  },
  "acts": [ { "act": 1, "title": "Low Tide", "blurb": "Learn the shallows." }, ... ],   // 3 acts
  "twists": [                                // the small menu this game implements (campaign only)
    { "id": "extra-pearls", "where": "setup", "how": "boss seat starts with +N pearls (N = param)" } ],
  "chapters": [ {
    "id": "c1", "act": 1, "title": "First Light",
    "boss": false,                           // the last chapter of every act is a boss (true)
    "intro": [ { "who": "guide", "text": "The tide is low. Let's practise." } ],   // 2–4 short lines (≤ 110 chars)
    "outro": [ { "who": "guide", "text": "You read the water well." } ],            // 1–3 lines, shown after a win
    "opponent": { "name": "Pip", "portrait": "camp-pip.webp", "emoji": "🐚", "cast": "pip",
                  "personality": "Cheerful, grabs whatever is closest.",
                  "aiLevel": "easy", "aiStyle": "greedy",
                  "taunt": "Ha! The tide favours me today.",    // boss wins (bosses only)
                  "praise": "Well sailed. The crown is yours." }, // boss loses (bosses only)
    "setup":  { "players": 2, "seed": null, "variant": "basic" },   // the game's own new-game options
    "twist":  null,                          // or { "id": "extra-pearls", "param": 2, "text": "Boss rule: the Tide Queen starts with 2 extra pearls." }
    "goal":   { "type": "win", "value": null, "text": "Win the game." },
    "hints":  true,                          // act 1 = true; game shows its suggestions / coach
    "stars":  [ { "text": "Win", "test": { "k": "won" } },
                { "text": "Score 20 or more", "test": { "k": "score", "op": ">=", "v": 20 } },
                { "text": "Win by 5 or more", "test": { "k": "margin", "op": ">=", "v": 5 } } ],
    "easier": { "aiLevel": "easy", "twist": null, "setup": {}, "maxStars": 2, "text": "The computer plays gently and the boss rule is off." },
    "unlock": [ { "type": "portrait", "id": "pip", "text": "Pip's portrait" } ]  // cosmetic or progression only
  } ]
}
```
Rules:
- **9 or 10 chapters in 3 acts**; the last chapter of each act is a boss (`boss: true`). Chapter `n` opens when
  chapter `n-1` is beaten (`requires` may override with a list of ids).
- **Act 1 teaches**: `aiLevel` easy, `hints` true, each goal teaches one idea, chapter 1 is winnable by a
  newcomer. **Act 2** normal. **Act 3** hard, every boss has a twist. Each act's first chapter is winnable by a
  newcomer to that act (no twist, or a gentle one).
- `goal.type`: `win` · `score` (value = minimum points, still must win unless `"winNotNeeded": true`) ·
  `margin` · `before-round` (finish before round `value`) · `survive` (co-op: complete the mission) ·
  `mission` (co-op: a named scenario/mission/airport) · `custom` (the game decides, `text` explains it).
  The goal text is concrete: "Win with at least 20 points", "Finish before round 6".
- `stars`: exactly 3; the first is always the chapter's basic goal. `test` is data: `{k, op, v}` checked against
  the game's `metrics(G)` (`op` default `>=`, `v` default truthy), or any object the game's `starsEarned` reads.
  Common keys: `won`, `score`, `margin`, `rounds`, `turns`, `lives`, `left` (resources left), `noUndo`, `hintsUsed`.
- `twist` ids come from the `twists` menu. A twist only applies inside the campaign, and its `text` is the plain
  sentence shown on the boss card ("Boss rule: …").
- `unlock.type`: `portrait` · `cardback` · `title` · `act` · `table` (a table/board skin) · `chapter`. No
  gameplay power, nothing bought.
- Original names only. Never the original game's, publisher's or designer's name.
- Optional per-chapter `players` / `seats` for co-op games live in `setup`; for co-op games the "opponent" is
  the scenario threat (`aiLevel` = the game's difficulty band, `aiStyle` = the threat's flavour).

## 2. Wire it
```js
GXC.init({
  game: 'tidewake', data: window.CAMPAIGN,
  startChapter: def => newGame(def.setup, { ai: def.opponent.aiLevel, style: def.opponent.aiStyle, twist: def.twist, hints: def.hints }),
  isWon:  (G, def) => G.winner === 0,                // the chapter's goal is met (co-op: mission succeeded; custom goals: the checkpoint)
  metrics: G => ({ won: G.winner === 0, score: G.score[0], margin: G.score[0] - G.score[1], rounds: G.round }),
  starsEarned: null,                                 // optional (G, def) => 0..3; default: count the stars tests on metrics(G)
  portrait: (who, size) => null,                     // optional: return a Node/URL for a cast id or file name; default emoji
  onExit: () => showTitle(),                         // the map's Back button
  scores: G => G.score, seats: G => [{ name: 'You', me: true }, { name: 'Tide Queen', ai: 'hard' }]   // for GNS
});
GXC.open();                  // title "Story" button -> chapter map
// on game over in a campaign game (check GXC.active()):
GXC.finish(G);               // stores the result, calls GNS.result({mode:'campaign'}), shows result + boss line + outro
```
Stars only count when `isWon` is true; the first star is that goal, so `stars[0].test` is informational.
Games whose AI is stronger at a *lower* setting (a weaker co-pilot makes a co-op game harder) must write `easier.aiLevel`
out in full: the default "one level down" only fits competitive games.
`startChapter` receives the **effective** chapter (already made easier when the player accepted the offer):
`def.easy` is true and `def.maxStars` is set. `GXC.active()` returns the chapter being played, or null.

Other calls: `GXC.scene(lines, {title})` → Promise (any story scene) · `GXC.bossCard(def)` → Promise ·
`GXC.result({won, stars, def, lines, unlocks})` → Promise · `GXC.progress()` · `GXC.reset()` ·
`GXC.validate(data)` → list of problems (node-safe: `node -e "console.log(require('./gx-campaign.js').validate(require('../tidewake/campaign.json')))"`).

## 3. Flow
Map → tap an open chapter → story intro (Skip) → boss card for bosses or twist chapters (name, portrait,
personality, "Boss rule: …") → `startChapter` → the game → `GXC.finish(G)` → result screen (stars, boss taunt or
praise, unlocks) → outro (wins only, skippable) → map. After **2 losses** on one chapter the intro offers
"Make it a bit easier" (applies `easier`, or by default one AI level down and no twist; at most 2 stars).

## 4. Save
`localStorage['gns-campaign-<game>']` (try/catch): `{v:1, ch:{<id>:{beaten, stars, best, tries, losses, easy}},
unlocked:[ids], last}`. Stars keep the best ever. `GNS.result({..., mode:'campaign', level, extra:{chapter, stars}})`.
