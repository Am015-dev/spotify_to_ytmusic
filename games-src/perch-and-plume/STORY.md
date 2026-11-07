# Perch & Plume: story

All the lines live in two data files.
- `src/story.js` (`STORY`) holds the tutorial prologue, the guide's reactions, the Quick game intro and result lines, Story loss lines and bosses' last words.
- `campaign.json` (made by `gen-campaign.py`) holds the Story chapter intros and win outros, which the shared campaign kit shows.

Every name is original.

## Cast
| Who | Role | Voice |
|---|---|---|
| You | a young naturalist with an empty field notebook | - |
| Aunt Ottilie | your guide, a retired field-guide author | warm, brisk, one idea at a time |
| Pip | a young birder and your first rival, who wants to fill his notebook first | cheerful, a little jealous |
| Corvin Ashdown | act 1 boss, egg hoarder of the Larchwood | sly, possessive |
| Mags | retired postmistress, chases round goals | patient, "dear" |
| Tobias | photographer, slow big birds | calm |
| Delphine Reedly | act 2 boss, fish-engine collector | proud, quick |
| Lord Barnaby Quill | final boss, holder of the County Notebook nine years running | grand, then gracious in defeat |

## Arc (3 acts, one year)
- **Prologue: first evening in the Larchwood (the tutorial).** At dawn your notebook is empty and Pip swears he'll fill his first. Ottilie teaches one move per chapter:
  1. Dawn: feeding the waking finches (food, the feeder, the bird-power chain).
  2. A visitor: housing a bird (playing a bird and paying for it).
  3. Nesting time: eggs.
  4. Rumours at the reeds: drawing new birds.
  5. The evening count: goals, final scoring, and the race against Pip.

  The climax is the count: the totals count up and Ottilie reacts to a win or a loss.
- **Act 1, Spring in the Larchwood (c1-c3).** You learn the woods with Pip, then face Corvin's egg hoard.
- **Act 2, Summer on the Saltmarsh (c4-c7).** Mags and Tobias at the reed beds, a lean season, then Delphine's fish run.
- **Act 3, Autumn on the High Meadows (c8-c10).** Corvin again on the windy heath, the Rival Flock, then the County Notebook against Lord Quill.

Each chapter opens with an intro scene: a portrait and 2-3 lines saying who you face, what is at stake and the twist rule. A win plays its outro, which leads to the map and the next chapter. A loss shows that chapter's loss line from the speaker on the result screen. Bosses speak in their intro (before) and in their outro or the result line (after, win or loss).

Quick game: a one-line flavour toast at the start and a result line in the game's voice (win, loss or tie).
