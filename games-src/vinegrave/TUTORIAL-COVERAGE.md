# FIXED2 (R2 review): every rule is done by hand; 4 Next-only steps (goal + 3 score steps)

27 steps (src/ui4.js `guidedSteps`): goal (Next) · play a card (2 taps) · Plane: a Boat camp paid with 2 coins (2) · discover a ruin, Dread
cards pay the boots (2) · tap the idol, set it in a shrine (2) · beat the guardian that woke (2) · tap the boon, use it (2) · buy an item (2)
· buy an artifact (2) · magnifier climbs (2) · notebook climbs (2) · temple tile (practice jump to the top, 2) · Pass (round end text) ·
3 score steps (Next). `node guided-tut-test.js` also fails if more than 5 steps are Next-only. Skipping or finishing sets prefs.played,
so the big title button becomes Play (a real game).

# W490 (8 Nov 2026): the default tutorial is a GUIDED first game (owner: gameplay first)

Learn to play = a real 1-round game where every core rule is taught in order: one sentence of 12 words or fewer and one highlighted tap
per step (src/ui4.js `guidedSteps`). Tamsin only plays cards, then passes, so the taught sites stay free. Missing goods are topped up
just before the step that needs them. Then the score walk, then the end card starts a real game. `?tut=coach` = the older coached free play below.
Test: `node guided-tut-test.js` (390x844 and 375x667, touch, highlighted taps only): all 28 steps in order, every line 12 words or fewer, end card, 0 errors.

| # | step id | rule taught |
|---|---|---|
| 1 | goal | most points after the last round wins |
| 2 | g-turn | one action a turn, then the rival |
| 3-4 | g-play, g-play2 | play a card for its effect |
| 5 | g-travel | travel icons, each card pays one |
| 6-7 | g-dig, g-dig2 | dig at a camp with an explorer, take its goods |
| 8-9 | g-disc, g-disc2 | discover a ruin: 3 compasses plus travel |
| 10 | g-idol | idols: 3 points and a gift |
| 11 | g-guard | a guardian wakes; beat it or take Dread |
| 12-13 | g-beat, g-beat2 | overcome it: pay, 5 points and a boon |
| 14 | g-boon | boons: once, free |
| 15 | g-shrine | idol into a shrine: free bonus (idol slots) |
| 16-17 | g-item, g-item2 | buy an item with coins, under the deck |
| 18-19 | g-art, g-art2 | buy an artifact with compasses, works at once |
| 20-21 | g-res, g-res2 | research: the magnifier climbs, row bonus |
| 22 | g-note | the notebook follows, never passes |
| 23 | g-temple | temple tiles at the top |
| 24 | g-fear | Dread for an explorer beside a guardian at round end |
| 25 | g-round | round end: played cards under the deck, draw to 5 |
| 26 | g-pass | 5 rounds; pass to end your round |
| 27-29 | score1-3 | final scoring with your real numbers, tie-break, 5 rounds |

# Vinegrave tutorial coverage (W378, ADDENDUM 4: a coached first game)

The tutorial is the story's prologue and a REAL game: 1 round (W378c: short enough that any player, or a random tapper, reaches the final count) against the real computer (Tamsin, easy). There are only 2 forced steps
(tap Trail Notes, then Play it). After that the whole screen is free: every legal move is allowed, and the tutor draws nothing over the
board. Pell Ardent (guide, code-drawn "P" portrait) speaks just in time, in one non-blocking bubble with a × that also fades by itself:
- the first time a rule becomes a real option or happens (below);
- when you make a strong move ("Good move: ...") or a weaker one ("Tip: next time consider this: ..."), using the hard AI's reasoning, for
  the first 2 moves (and every real game rates each of your turns good / okay / weak in the Turn over card);
- after every rival move: a one-line lesson on what it did and why it matters.
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

Each run lists which rules were explained in play and which went to the end card. With 1 round, typical runs explain 9 to 15 of the 27 ids in play; round end, fleeing, deep ruins, temple, notebook and
exile are the usual end-card ones ("Things you'll meet later").
Leaving and resuming: Skip works at any time. Resuming part-way is not supported, because the shared tutor kit only offers Restart.
