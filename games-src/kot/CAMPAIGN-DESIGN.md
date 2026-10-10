# Campaign design: The Crown of Crown City

Data: `campaign.json` (game id `crown`, the shelf id in `games/index.html`; the source folder is `kot`). 10 chapters in 3 acts, 3 bosses, 6 twists.

## Premise
A portal has opened over Crown City and monsters keep climbing out of it. You are the newest arrival: the monster you pick on the title screen (`UI.mon`). Your guide is **Dot Inkwell**, night editor of the city paper. She narrates in the same front-page voice as the in-game chronicle (`story.js` headlines). You fight your way from the suburbs to Downtown, through the Harbor, and up the Crown Spire. At the end you learn who has been steering the monsters: **Cortexa**, the schemer who opened the portal. All monster and place names are the game's own: the nine monsters in `MONS`, plus Downtown, the Harbor, the Crown Spire, Brainjack and the Brass Beetle.

## Rivals and bosses
The game has three computer levels (`easy`, `normal`, `hard`) and no separate personality setting. So each `aiStyle` describes what that level's logic actually does:
- `mistakes`: easy, which is the normal logic with random errors.
- `rules`: normal, which is rule-based.
- `lookahead`: hard, which searches every keep and simulates the rerolls.

Each rival's personality comes from three things: its monster, the table setup, and its twist.

| Ch | Rival | Level / style | Personality |
|---|---|---|---|
| 1 | Shroomhulk | easy / mistakes | Sleepy brute, barely buys |
| 2 | Squidrik | easy / mistakes | Loves Downtown, yields at random |
| 3 | Boltbox | easy / mistakes | Hoards energy, then buys the first card it sees |
| **4 boss** | **Baron Magmaw** | easy / mistakes | Proud and greedy, starts rich (`boss-energy` 3) |
| 5 | Voltusk | normal / rules | Charges in and plays evolutions early |
| 6 | Squidrik (revenge) | normal / rules | Starts already in Downtown (`boss-in-city`) |
| **7 boss** | **Glacyx, the Harbor Frost** | normal / rules | Stubborn: never yields while it has 4+ hearts (`stubborn` 4) |
| 8 | Bramblebat | hard / lookahead | Saves its Brainjack for your best roll |
| 9 | Boltbox Mk II | hard / lookahead | Armoured: starts with Plated Hide (`boss-card` plated) |
| **10 boss** | **Cortexa, Mind of the Portal** | hard / lookahead | Cold schemer with 3 Brainjack tokens (`extra-brainjack` 2) |

## Difficulty curve
- **Act 1: Portal Night** (easy AI, hints on, Classic deck, 2–3 monsters). Each chapter teaches one idea:
  1. Rolling and keeping dice: a plain win against one sleepy rival.
  2. Holding Downtown: win after starting 2 turns there.
  3. Buying power cards: win after buying 2.
  4. Boss: the two ways to win (20 stars or knockout), against Magmaw with a small head start.
- **Act 2: The Harbor Wars** (normal AI, hints off, 4–5 monsters). It adds evolutions (`evo:true`) in ch 5 and the Harbor at 5 monsters (`bayOn = n>=5`) in ch 6, where the goal is a 20-star win, not a knockout. Ch 5 has no twist, so a newcomer to the act can win it.
- **Act 3: Spire of the Crown** (hard AI, Brainjack Taster `xp:'trial'`). It adds Brainjack (ch 8, no twist), Curses (ch 9) and the Crown Spire (ch 10). The final boss has a twist.
- `easier` (offered after 2 losses) drops one AI level (to `easy` in Act 2, `normal` in Act 3), removes the twist and usually removes one monster. Easier runs earn at most 2 stars.

## Twists menu (campaign only; the normal rules stay the same)
"Boss seat" = the seat whose `m` equals `setup.rival`. Apply the setup twists inside `engine.js:newGame`, after `pl` and `G` are built and before `exSetup`/`startTurn` (or in a wrapper that runs `startTurn` itself).

| id | where | Implementation |
|---|---|---|
| `boss-energy` | setup | `boss.en = param` |
| `boss-stars` | setup | `boss.vp = param` (spare; not used by a chapter yet) |
| `boss-card` | setup | After `refill()`, splice the first `G.deck` id with `base(id)===param` and push it to `boss.cards` (Keep card ids from `data.js:CARDS`, such as `plated`) |
| `boss-in-city` | setup | `G.city = boss.i` (no +1 star for entering) |
| `stubborn` | ai | `ai.js:aiYield(q,lost)`: `if(G.twist&&G.twist.id==='stubborn'&&q.i===G.bossSeat&&q.hp>=G.twist.param) return false` |
| `extra-brainjack` | setup | `boss.mb += param` (only with `xp` `trial`/`exp`) |

## Levers verified in code
- `engine.js:newGame(mode,n,mon)` reads these setup values:
  - `n`: monsters, 2–6.
  - `mon`: your monster.
  - `UI.xp`: `base`, `trial` or `exp`. Monsters 6–8 (Cortexa, Clampede, Bramblebat) need a mode other than `base`.
  - `UI.evo`: evolutions.
  - `UI.ex` (or `DEFEX`): expansions.
  - `UI.lvl`: the level, copied to each `p.lvl`.
  - In `solo` mode the human gets a random seat.
- `exp.js:EXPS` lists the `ex` keys: `cult`, `tower`, `bers`, `wick`, `cost` and `curse`. `exSetup` handles curses and costumes.
- `ui.js` title screen: computer skill `easy`/`normal`/`hard`, and Monsters 2–6.
- `ai.js` branches on `q.lvl` in `aiYield`, `aiBrainjack`, `aiMarkLvl` and `aiBuyStep`.
- Starting resources are set on each `pl` entry in `newGame` (`hp:10, vp:0, en:0, mb`).
- `UI.hints` gates the suggestion in `ui.js` (`suggestMask`).
- `setup.rival` is the one new key: the `MONS` index the campaign gives to a computer seat. It sits in `oth[0]` before `newGame` shuffles. If it equals your monster, take the next one in the pool.

## Metrics the game must expose (`metrics(G)`, h = human seat)
- `won`: `G.winner === 'P'+(h+1)`.
- `score`: `h.vp`.
- `margin`: `h.vp` minus the highest other `vp`.
- `rounds`: `G.turn`.
- `hearts`: `h.hp`.
- `kos`, `cards`, `city`: `h.stats.kos`, `h.stats.cards` and `h.stats.city`. `stats.city` counts turns started in the city (`engine.js:startTurn`).
- `cityWin` and `cardsWin`: `city` and `cards`, or 0 when not won. These gate the first star of chapters 2 and 3 on winning.
- Ch 6 has the goal `score` 20, which means a star win.
