# Check speed and reading cost

How fast the checks run is in `PLAYBOOK.md` ("Iterate fast, check once"): `--quick` is minutes, `--deploy` is the quick sweep, `--full` only for engine/rules changes.
This file holds the numbers for reading cost.

## Tokens (13 Oct 2026; chars / 4)

Why: an analysis found about 98% of tokens were workers re-reading their own long contexts (average 270-480k, up to 650k),
because finding code meant reading whole UI files and search results full of built output.

Typical fix: make one button label bigger = one JS line (the label) + one CSS rule. Measured by `games-src/scripts/token-measure.py`.

| game | task | before: read the whole files | after: MODULES.md + find.sh + line ranges |
|---|---|--:|--:|
| Thornbound | Undo button label | 74,200 (joined ui.js + head.html) | 8,500 (map 4,500 + find 800 + ranges 3,200) |
| Doorkick Dungeon | Help button label | 35,200 (ui.js + head.html + tbl.css) | 7,900 (map 3,000 + find 800 + ranges 4,000) |
| Crown City Smash | Got it button label | 13,900 (ui.js + head.html + extra.css) | 7,500 (map 3,500 + find 900 + ranges 3,100) |

The "before" column is the optimistic case (worker opens exactly the right files). It leaves out the repo-wide search, which used to
return built output. Same searches, before the ignores versus now (`rg -n -F`, games-src + games):

| search | before | after |
|---|--:|--:|
| `Undo` | 730,000 | 21,500 |
| `helpb` | 95,400 | 960 |
| `Got it` | 41,400 | 24,500 |
| `.btn{` | 20,300 | 9,000 |

What changed: 26 generated files (about 25 MB: built game html, `x.js` with 850k-character lines and base64 media, the joined
`ui.js` files, kit demos) are no longer tracked and search skips them; `MODULES.md` gives the map (about 3-5k tokens per game);
`find.sh` answers "where is it" in under 1k tokens. The saving grows with the game: Thornbound's UI is 245 KB, so a map-first fix
reads about nine times fewer tokens. Combined with the 150k hand-off rule, a 450k session becomes three short ones.
