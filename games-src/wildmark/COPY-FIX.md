# Wildmark copy fixes
Game: Wildmark. Date: 2026-11-08.

## Goal card

Status: ok. The Goal card (score.js, goalShow) states the aim in ONE sentence: "Have more points than {rival} after {turns} turns." (solo: "Score as many points as you can in {turns} turns."). No change needed. The tutorial goal bubble (campaign.json coach.goal) was wordy and is fixed below.

Note: tutorial/coach, story and chapter words live in games-src/wildmark/campaign.json (outside src/). Rows use exact substrings of the source line.

| file:line | old line | new line |
|---|---|---|
| games-src/wildmark/src/help.js:8 | Each column is a tile and the token under it. Tap one to take both. | Each column is a tile and its animal. Tap to take both. |
| games-src/wildmark/src/help.js:9 | Tap a glowing spot next to your valley. Matching edges grow habitats. | Tap a glowing spot by your valley. Matching edges join land. |
| games-src/wildmark/src/help.js:10 | Put the token on a glowing tile that shows it, or return it. | Put the animal on a glowing tile showing it, or return it. |
| games-src/wildmark/src/help.js:11 | Spend an acorn to take any tile with any token, or to replace tokens. | Spend an acorn to pick freely or swap market animals. |
| games-src/wildmark/src/help.js:14 | Take one column: its tile and its token. Three matching tokens may be swept once per turn. | Take one column. Sweep three alike once per turn. |
| games-src/wildmark/src/help.js:15 | Each terrain scores its largest connected group. Edges must match to connect. Turn split tiles. | Each land type scores its biggest joined group. Edges must match. |
| games-src/wildmark/src/help.js:16 | Bears in pairs, elk in lines, salmon in chains, hawks alone, foxes next to many kinds. | Bears pair, elk line up, salmon run, hawks stay alone, foxes mix. |
| games-src/wildmark/src/help.js:17 | An animal on a gold-rimmed keystone earns an acorn. Each left at the end is 1 point. | A gold-rimmed keystone earns an acorn. Each acorn is 1 point. |
| games-src/wildmark/src/help.js:26 | Worth an acorn: it fits your patterns. | Worth an acorn: it fits your animal cards. |
| games-src/wildmark/src/help.js:26 | Best fit for your patterns and habitats. | Best fit for your cards and land. |
| games-src/wildmark/src/help.js:27 | Joins matching edges and leaves good animal spots. | Matches edges and keeps good spots open. |
| games-src/wildmark/src/help.js:28 | No spot helps: returning keeps your patterns clean. | No spot helps, so return it. |
| games-src/wildmark/src/ui.js:321 | Step 1 of 3: pick a tile + animal pair from the market | Step 1 of 3: take one column from the market |
| games-src/wildmark/src/ui.js:327 | Each column is one choice: the tile on top and the animal under it come together. | Each column is one choice: a tile with its animal. |
| games-src/wildmark/src/ui.js:327 | Tiles must touch your valley. Matching edges join terrain: 1 point per joined tile. | Tiles must touch your valley. Matching edges join land. |
| games-src/wildmark/src/ui.js:327 | Animals score by their card (the chips on top). A tile shows which animals it accepts. | Animals score by their card. Each tile shows which animals it takes. |
| games-src/wildmark/src/ui.js:372 | Solo: a terrain area of 7 or more tiles earns 2 extra points. | Solo: a land area of 7+ tiles earns 2 bonus points. |
| games-src/wildmark/src/ui.js:468 | Variant cards with house point tables.  | Variant cards with our own point tables.  |
| games-src/wildmark/src/ui.js:194 | One terrain: no need to turn it. | This tile has one terrain, so no turning. |
| games-src/wildmark/src/ui.js:491 | Three tokens swept away. | Three animals swapped for new ones. |
| games-src/wildmark/src/ui.js:311 | Acorns: 1 point each at the end, or spend one for a free pick or new animals | Acorn: 1 point at the end, or a free pick |
| games-src/wildmark/src/ui.js:380 | Spend an acorn to take any tile with any token, or to replace any tokens in the market. | Spend an acorn to pick freely or swap market animals. |
| games-src/wildmark/src/ui.js:381 | Four matching tokens are replaced at once. | Four alike are swapped out automatically. |
| games-src/wildmark/src/ui.js:381 | With three matching tokens you may replace those three once per turn, for free. | Three alike? Swap them for free, once per turn. |
| games-src/wildmark/src/ui.js:382 | Each terrain scores 1 point per tile in your largest connected habitat of it (edges must match). | Each terrain scores 1 point per tile in your biggest joined area. |
| games-src/wildmark/src/ui.js:382 | The largest habitat of each terrain earns a bonus: 2 players 2 (tie 1), 3-4 players 3 for first and 1 for second. | Biggest area per terrain: +2 (2 players), +3 or +1 (3-4). |
| games-src/wildmark/src/ui.js:383 | After each turn the tile and the animal furthest from the stacks (rightmost) leave the game; the rest slide left toward the stacks and new ones fill in at the right. | Each turn the rightmost tile and animal leave; others slide left. |
| games-src/wildmark/src/ui.js:385 | The animals on each tile and the starting tiles are our own balanced set. | Tile animals and starting tiles are our own balanced set. |
| games-src/wildmark/src/ui.js:385 | Elk lines are counted longest first (rarely a point less than the best split). | Elk lines count longest first, which rarely costs a point. |
| games-src/wildmark/src/ui.js:385 | Variant cards (B, C, D) use our own house tables and are off unless you switch them on. | Variant cards B, C, D use our own tables, off by default. |
| games-src/wildmark/src/ui.js:388 | . Each half counts for its own terrain; edges must match to join a habitat. | . Each half counts for its own terrain; edges must match. |
| games-src/wildmark/src/ui.js:417 |  in every column. |  on every count. |
| games-src/wildmark/src/score.js:32 | Salmon run broken (a salmon touches 3) | Salmon run broken: one touches 3 others |
| games-src/wildmark/src/score.js:34 | Fox sees a new kind of animal | Fox has a new kind of neighbour |
| games-src/wildmark/src/score.js:177 | Each turn: take a tile with its animal, add the tile, place the animal. Tap Scores any time to see why. | Each turn: take a column, place the tile, then the animal. |
| games-src/wildmark/src/score.js:174 | score by their card: bears in pairs, elk in lines, salmon in runs, lone hawks, foxes next to different animals. | score by their card. Tap Scores to see how. |
| games-src/wildmark/src/score.js:121 | : nothing scored more. | : no other move scored more. |
| games-src/wildmark/src/data.js:13 | Chains of salmon, each touching at most 2 salmon. | Runs of salmon, each touching at most 2 others. |
| games-src/wildmark/src/data.js:14 | Hawks touching no other hawk. | Each hawk with no hawk next to it scores. |
| games-src/wildmark/src/tutor.js:64 | Four Hawk tokens: the market is wiped. | Four Hawks: the market is cleared. |
| games-src/wildmark/src/tutor.js:78 | Biggest joined habitat per terrain:  | Biggest joined area per terrain:  |
| games-src/wildmark/src/campaign.js:35 | Tutorial: a coached game with Rowan | Learn to play with Rowan |
| games-src/wildmark/campaign.json:1014 | Bram wants this valley for timber. Out-score him in 6 turns and it stays wild. Each column shows \"up to +N\": the points it adds now. Pick one. | Beat Bram in 6 turns to keep the valley wild. |
| games-src/wildmark/campaign.json:1015 | Tiles must touch your valley. The +N on a glowing spot is what it scores. Tap one to see why, then Place. | Place the tile on a glowing spot; +N is its score. |
| games-src/wildmark/campaign.json:1016 | Matching edges join land. Each terrain scores 1 point per tile in your biggest joined group. | Matching edges join land: 1 point per tile in your biggest group. |
| games-src/wildmark/campaign.json:1017 | This tile has two lands. Tap Turn until the edges match your valley, then Place. | Tap Turn until the edges match your valley, then Place. |
| games-src/wildmark/campaign.json:1018 | Animals only live on a tile that shows them. The badge on each tile is its points. No good spot? Return it, no penalty. | Animals need a tile showing them. No spot? Return it, free. |
| games-src/wildmark/campaign.json:1019 | Bears score in pairs: groups of exactly 2 touching bears. A third bear spoils the pair. | Bears score in pairs. A third touching bear spoils the pair. |
| games-src/wildmark/campaign.json:1020 | Elk score in straight lines. The longer the line, the more points. | Elk score in straight lines. Longer lines score more. |
| games-src/wildmark/campaign.json:1021 | Salmon score in runs: a chain where each salmon touches at most 2 others. | Salmon score in runs. Each may touch at most 2 others. |
| games-src/wildmark/campaign.json:1022 | Hawks like to be alone: each hawk touching no other hawk scores. | Each hawk with no hawk next to it scores. |
| games-src/wildmark/campaign.json:1024 | A gold-rimmed keystone! Settling an animal there earns an acorn: 1 point at the end, or a favour now. | Keystone! An animal here earns an acorn: 1 point, or spend it. |
| games-src/wildmark/campaign.json:1025 | You have an acorn. Tap \"Use acorn\": a free pick takes any tile with any animal, or replace the animals on offer. | Tap \"Use acorn\" to pick freely or swap animals. |
| games-src/wildmark/campaign.json:1026 | Three alike in the market. You may sweep them for fresh animals, once per turn, for free. | Three alike! Swap them for new animals, free, once per turn. |
| games-src/wildmark/campaign.json:1027 | Four alike: the market clears them by itself and deals new animals. | Four alike: the market swaps them for new animals itself. |
| games-src/wildmark/campaign.json:1028 | Bram's turn. Watch the caption: he takes, places and settles just like you. | Bram's turn. He takes, places and settles just like you. |
| games-src/wildmark/campaign.json:1029 | Bigger habitat than Bram in a terrain? That terrain pays you a bonus: +2 (a tie gives both +1). | Biggest area in a terrain beats Bram: +2 bonus (tie: +1 each). |
| games-src/wildmark/campaign.json:1030 | The thaw. Here is how your score adds up, rule by rule. | The thaw has come. Here is how your score adds up. |
| games-src/wildmark/campaign.json:1032 | A tie goes to whoever has more acorns left; still tied, you share the win. | Ties go to whoever has more acorns; still tied, share the win. |
| games-src/wildmark/campaign.json:1034 | That one scored nothing yet. Next time look for a spot that fits its card. | No points yet. Next time, find a spot that fits its card. |
| games-src/wildmark/campaign.json:1011 | Rowan: That was a real game. The strip under your valley rated every move. Now the seasons are 20 turns long. | Rowan: That was a real game. Real seasons last 20 turns. |
| games-src/wildmark/campaign.json:121 | The Thawing Valley lost its wild things in the long frost. Let's start small. | The valley lost its wild things in the frost. Start small. |
| games-src/wildmark/campaign.json:125 | Grow your own valley alone this time. Pairs of bears, lines of elk. Aim for 50 points. | Grow your valley alone. Make bear pairs and elk lines: 50 points. |
| games-src/wildmark/campaign.json:210 | Pip takes what is closest. You start with 2 acorns: spend one when the pair you need is split up. | Pip takes what is closest. You have 2 acorns for split pairs. |
| games-src/wildmark/campaign.json:237 | Head start: you begin with 2 acorns (spend one to take any tile with any token). | Head start: you begin with 2 acorns (spend one for any pick). |
| games-src/wildmark/campaign.json:558 | Quill never wastes a turn and keeps spare acorns. Beat her surveyed perfection. | Quill never wastes a turn and keeps spare acorns. Beat her. |
| games-src/wildmark/campaign.json:649 | Up in the Cascades the summer is short. Only 16 turns before the snow returns. | Summer is short up here. Only 16 turns before the snow. |
| games-src/wildmark/campaign.json:736 | These forests are older than your grandmother's grandmother. Prove you deserve them. | These forests are very old. Prove you deserve them. |
| games-src/wildmark/campaign.json:740 | No sweeping the market here: the old growth keeps what it is given. New animal cards here. | No sweeping the market here. New animal cards too. |
| games-src/wildmark/campaign.json:920 | The Warden is strong, rich in acorns, and nobody may sweep the market. New animal cards here. | The Warden has many acorns. No sweeping. New animal cards too. |

Lines fixed: 70
