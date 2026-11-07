# Vinegrave tutorial coverage (W378, ADDENDUM 4: a coached first game)

The tutorial is the story's prologue and a REAL game: 2 rounds against the real computer (Tamsin, easy). There are only 2 forced steps
(tap Trail Notes, then Play it). After that the whole screen is free: every legal move is allowed, and the tutor draws nothing over the
board. Pell Ardent (guide, code-drawn "P" portrait) speaks just in time, in one non-blocking bubble with a × that also fades by itself:
- the first time a rule becomes a real option or happens (below);
- when you make a strong move ("Good move: ...") or a weaker one ("Tip: next time consider this: ..."), using the hard AI's reasoning, for
  the first 4 moves;
- when the rival does something worth learning (its first move, its first pass).
The stacked start (`tutSetup` in src/ui4.js: fixed hand, 1 tablet + 1 jewel, Tin Lamp first in the market, the Glass Moth as the first
guardian) makes the key cases likely; it does not decide your moves.
After the last round, 3 steps walk through the final scoring with your real numbers. The end card then lists every rule that did not
come up ("Things you'll meet later") and starts a real game.
All lines: `V.STORY.coach` in src/data.js (ids below). `tut-test.js` plays the coached game at 390x763 and 1440x860 by choosing legal
moves through the UI (any glowing thing, in rotation), and asserts that every id below was explained in play or listed on the end card.

| Rule (id) | When Pell explains it |
|---|---|
| Setup: 5 cards, 2 explorers, two Dread cards at -1 (setup) | forced step 1 |
| One action a turn (oneaction) | forced step 1 |
| Play a card for its effect (play) | forced step 2 |
| The rival plays by the same rules (rival) | Tamsin's first move |
| Travel: each card pays one icon (travel) | the first time a site can be reached |
| Dig at a camp; one explorer per site a round (dig) | the first time a camp glows |
| Discover a hidden ruin with 3 compasses (discover) | the first time a ruin can be explored |
| Deep ruins cost 6 compasses (deep) | the first time a deep ruin can be explored, else end card |
| 2 coins buy a Plane, a Plane pays any icon (plane) | the first time a site needs coins, else end card |
| Idols: 3 points (idol) | the first idol you find |
| A guardian wakes; overcome it or flee with Dread (guardian) | the first guardian, yours or Tamsin's |
| Free action: idol into a shrine, one a turn (shrine) | the first time you can set an idol |
| Empty shrine slots score 1/1/1/2 (slots) | same moment as shrine |
| Overcome a guardian: 5 points + boon (overcome) | the first time you can pay a guardian |
| Boon: once, free (boon) | the first time you hold a boon |
| Research: the magnifier climbs (research) | the first time research is affordable |
| The notebook follows, never passes (notebook) | the first time the notebook can climb, else end card |
| Temple tiles (temple) | the first time you can buy one, else end card |
| Buy an item with coins, it goes under your deck (buyitem) | the first time you can afford an item |
| Buy an artifact with compasses, it works at once (buyart) | the first time you can afford an artifact |
| Exile a card (exile) | the first exile question, else end card |
| Pass; the round ends when all have passed (pass) | Tamsin's first pass |
| Round end: explorers home, draw to 5, the market shifts (roundend) | the first new round |
| Fleeing a guardian costs a Dread card (fear) | the first time someone flees, else end card |
| Final scoring categories (score) | score walk-through step 1, with real numbers |
| Tie-break (tiebreak) | score walk-through step 3 |
| 5 rounds in a real game (rounds) | score walk-through step 3 and the end card |

Each run lists which rules were explained in play and which went to the end card. Typical runs explain 17 to 22 of the 27 ids in play;
deep, plane, temple and exile are the usual end-card ones.
Leaving and resuming: Skip works at any time. Resuming part-way is not supported, because the shared tutor kit only offers Restart.
