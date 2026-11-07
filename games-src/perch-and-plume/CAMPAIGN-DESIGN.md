# Perch & Plume campaign: A Naturalist's Year

Data: `campaign.json` (made by `gen-campaign.py`; shelf id `perch-and-plume`; 10 chapters in 3 acts, a boss at the end of each act).
Wiring: `src/shelfkit.js` (`campInit`, `campStart`, `campIsWon`, `campMetrics`); twists live in `src/engine.js` `applySetupTwist` (setup only, the rules never change).

## Premise
You are a young naturalist with an empty field notebook. Your great-aunt **Ottilie**, a retired field-guide author, walks you
through one year in three regions. Each region has local birders who become your rivals, and each ends with a collector who
plays one strong strategy. The year ends at the County Notebook, held nine years running by **Lord Barnaby Quill**.

## Cast
| Who | Chapters | Personality | Level |
|---|---|---|---|
| Aunt Ottilie (guide) | all | Kind, teaches one idea per chapter | - |
| Pip, a young birder | c1, c2 | Cheerful, plays whatever he holds | easy |
| Corvin Ashdown (boss act 1) | c3, c8 | Sly egg hoarder | easy, hard |
| Mags, the retired postmistress | c4, c5, c10 | Patient, chases round goals | normal, hard |
| Tobias, the photographer | c5, c6, c9 (flavour) | Calm, slow big birds | normal |
| Delphine Reedly (boss act 2) | c7 | Food engine from turn one | normal |
| Lord Barnaby Quill (final boss) | c10 | Bonus-card hunter with a fat hand | hard |

## Difficulty curve (each stage = the real rules with one twist: a stronger AI, a handicap or a goal)
- **Act 1, Spring in the Larchwood** (easy AI, hint bulb and first-time bubbles on). c1: score 30 (winning not needed; a newcomer
  who just plays birds and lays eggs reaches it). c2: end with 3 birds in your forest (teaches the engine row). c3 boss: Corvin starts 4 points ahead (`boss-eggs`), plain win.
- **Act 2, Summer on the Saltmarsh** (normal AI, no bubbles). c4 plain win. c5 first 3-player game (Mags + Tobias). c6 handicap:
  you start with 2 fewer food (`lean-start`). c7 boss: Delphine starts with a feeder bird already in her forest (`boss-bird`) and you must win by 5.
- **Act 3, Autumn on the High Meadows** (hard AI). c8 plain win vs hard Corvin. c9 solo against the Rival Flock (automa, hard). c10 final:
  3 players, Lord Quill starts with 3 extra birds in hand (`boss-cards`).
- Calibration (node, 20-24 seeded 2-player games, seats swapped): easy vs normal averages 50 to 67; normal vs hard 63 to 65;
  the rules-test mix of all levels averages 56. Score stars (45, 55, 60, 65) follow these numbers; c1's 30-point goal sits well under easy's average.
- After 2 losses a chapter offers "a bit easier": one AI level down, no twist, at most 2 stars.

## Twists (setup only)
| id | Implementation (`applySetupTwist`, after every player kept their starting hand) |
|---|---|
| boss-eggs | the boss scores `param` extra points (`lead`; the Rival Flock gets `param` eggs) |
| boss-bird | a forest bird with a feeder power is placed in the boss's forest |
| boss-cards | the boss draws `param` extra birds |
| boss-food | the boss gains `param` food (one of each type in order) |
| lean-start | you lose up to `param` food (one of each type in order, only types you hold) |
