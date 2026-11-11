# Thornbound campaign: The Heir of the Heath

## Premise
The old sovereign is dead and the Thornbound Throne stands empty. You are the young heir of the **Heathbound Clans**
(the Sea-Mother's line), guided by **Old Ysolde the Rune-Reader**. Over one year you cross the realm's three
regions (the Uplands, the Tablelands and the Sinks), win the Spire Court, the Gleaning Meadow and the Cairn Field,
and face each great house in turn: the **Gilded Court**, the **Lantern Rising** and the **Pale Choir**. The player
always plays the Clans (`faction: "clans"`, the same faction the guided game uses), so the story has one hero and
the rivals change.

## Rivals and bosses
The AI has no separate style setting. A rival's "style" is the faction it plays, which sets its deck, Tactics and
Favour. So `aiStyle` holds the faction id, and the same faction goes in `setup.seatFactions[1]` (the boss seat is seat 1).

| Chapter | Rival | Personality | aiLevel / aiStyle |
|---|---|---|---|
| c1–c2 | Tamsin of the Gate | Cheerful, careless gatekeeper of the Court | easy / nobility |
| c3 | Brother Fennick | Thrifty Choir trader who bids low | easy / gathering |
| **c4 boss** | **Seneschal Halvard Crane** | Stiff and careful; guards the Cairn Field | easy / nobility |
| c5 | Mother Quill | Slow, plays the Councils for late income | normal / gathering |
| c6 | Captain Rook Ashby | Bold ferry captain who races for the Meadow | normal / uprising |
| **c7 boss** | **Sable, the Masked Heir** | Theatrical bluffer with Deadly agents | normal / uprising |
| c8 | Warden-General Ida Marsh | Methodical; samples every hand before she commits | hard / nobility |
| c9 | Orlen the Moth Priest | Dreamy; recycles the Lost Pile and outlasts everyone | hard / gathering |
| **c10 boss** | **The Pale Stag-King** | Ancient, serene, hoards the Favour | hard / gathering |

## Difficulty curve
- **Act 1 "Spring on the Heath" (c1–c4):** 2 players, `length: "short"` (4 rounds), `easy`, hints on. Following
  CLARITY-PLAN item F, each chapter adds one system: c1 clashes (card strength by region), c2 the Herald,
  c3 bidding and the Great Road, and c4 (boss) Journey, Lore and the Site of Power. There are no twists. A newcomer
  can win c1 by simply putting the big cards where they count.
- **Act 2 "Summer of Knives" (c5–c7):** 3 players, `standard` (5 rounds), `normal`, hints off. c5 Councils/Govern,
  c6 the Favour (with a gentle twist), and c7 boss: Deadly and Elimination, with a gentle boss rule (seat order).
- **Act 3 "The Long Winter" (c8–c10):** `hard`. c8 is a short 1-on-1 game with no twist (the first chapter of the
  act). c9 has 4 players and a slower-thinking AI. c10 is the final boss: 4 players, `extended` (6 rounds), and the
  boss starts with the Favour.
- **Easier offer:** in acts 1–2 it drops the level to easy, removes any twist and caps the chapter at 2 stars. In act 3
  it drops to normal with no twist and a smaller table or game (c9: 3 players; c10: standard length).
- Score targets come from the playtest scores in CLARITY-PLAN (16–7 and 25–12–2 in 5 rounds) and the rules-notes
  estimate (15–30 per 5 rounds). Targets are 8–10 in short act-1 games, 15–16 in act 2, and 20 in the 6-round final.

## Twists (campaign only; normal rules untouched)
| id | where | Implementation hook |
|---|---|---|
| `boss-lore` | setup | In `ui1.js:newGame`, right after `TB.newGame(...)` returns: `G.pl[1].lore = param`. |
| `boss-first` | setup | Pass `order: [1, ...others]` to `TB.newGame`. The `o.order` option exists in `engine.js:TB.newGame` but `ui1.js:newGame` does not forward it yet, so add the pass-through. |
| `boss-favour` | setup | After `TB.newGame`: `G.fav = {h: 1, u: 3}`. This is the same state as a Gleaning Meadow claim, so the Favour tiebreak in `engine.js:ranking` works unchanged. |
| `sharp-mind` | ai | In `ui1.js:aiChoose` for the boss seat: `TB.AI.choose(G, seat, 'hard', {budget: TB.AI.budgetMs * param})`. The `opts.budget` option is in `ai.js:AI.choose` and `budgetMs` defaults to 200. |

## Metrics the integration must expose (`metrics(G)`, seat 0 = player)
- `won`: `G.over.winner === 0`.
- `score`: `G.pl[0].inf`.
- `margin`: `G.pl[0].inf` minus the best rival's Influence.
- `clashWins`: count of log entries `"... wins the Clash"` with `s === 0`.
- `heraldHits`: `G.infl[0]['Herald Reward']`, which counts +1 per hit.
- `kingdomCards`: non-null entries in `G.pl[0].ks`.
- `steals`: the player's Kingdom Card steals, counted from the log.
- `siteBought`: `5 - G.pl[0].site.length`.
- `governs`: the player's Govern actions, counted from the log, or cards of seat 0 in `G.council.*`.
- `favourUses`: the player's Favour activations, counted from the log.
- `favourHeld`: `G.fav.h === 0`.
- `eliminated`: the player's cards in `G.lost`, plus Resilient eliminations from the log.
- `handSize`: `G.pl[0].hs`.

Stars count only on a win. For `custom` goals, star 1 is "won AND test".

## Levers verified in code
- `engine.js:TB.newGame(o)` takes:
  - `players[]` (2–4; each seat has `faction`, `name` and `ai`)
  - `length` (`short`/`standard`/`extended` = 4/5/6 rounds, from `LEN`)
  - `seed`
  - `order`
- `ui1.js:newGame(mode, o)`: the real campaign option names `np`, `length`, `faction`, `seatFactions`, `levels` and
  `seed`. `mkSeats` assigns factions.
- `ai.js`: the levels `easy`, `normal` and `hard` (`LV` table, `AI.choose`), `AI.budgetMs`, and `opts.budget`.
- Factions (`data.js:FACTIONS`): `nobility`, `clans`, `uprising` and `gathering`, named the Gilded Court, Heathbound
  Clans, Lantern Rising and Pale Choir.
- The shelf id is `thornbound` (`games/index.html`). No GNS call exists in the game yet.
