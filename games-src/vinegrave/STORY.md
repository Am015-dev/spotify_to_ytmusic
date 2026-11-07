# Vinegrave story (W378)

All names are this game's own. The text lives in two data files: `src/data.js` (`V.STORY`: the tutorial prologue and the Quick-game lines)
and `campaign.json` (cast, acts, chapter intros, outros, and opponent praise/taunt lines for wins and losses).

## Cast
- **Pell Ardent** (guide, compass): an old island hand who maps the ruins and teaches you. Warm and dry. Speaks in every tutorial bubble
  (code-drawn "P" portrait until art exists).
- **Tamsin Reed** (first rival, backpack): just as new as you. She wants the temple map for her museum, so she grabs whatever is closest.
- **Captain Ines Quell** (act 1 boss, anchor): runs the coves and charges a toll on every ruin.
- **Dr Okoro Bell** (scholar): thinks research wins expeditions, and often it does.
- **Mira Holt** (map-maker): fast and everywhere. Three camps at once.
- **The Sallow Twins** (act 2 boss, snake): hunt guardians for sport.
- **The Old Warden** (stone): the temple's keeper. He tests who may climb.
- **Dr Aurel Vane** (final boss, top hat): wants the temple's heart for himself.

## Arc (3 acts)
1. **The Mangrove Coast**: landfall (the prologue tutorial), first footprints, under the roots, then the Captain's toll cove (boss).
   Stakes: the way inland.
2. **The Deep Green**: crowded jungle, a scholar's wager, three camps, storm season, then the Sallow Twins (boss).
   Stakes: the guardians, who decide who reaches the highlands.
3. **The Temple Highlands**: race the rains, the Old Warden's test, then Vane's Gambit (final boss).
   Stakes: the temple itself.

## Prologue (tutorial) beats
Ch 1 Landfall: the boat is gone and Tamsin is ashore; Trail Notes point inland.
Ch 2 The ruin / The guardian: 3 compasses find a hidden ruin, the idol, the Glass Moth wakes and is tamed.
Ch 3 Supplies: the Moth's boon lights the research track; shopping while Tamsin is out of explorers; pass.
Ch 4 Last light / The count: the last round's dig, then the final count with Pell's win or lose line.

## Story mode
Every chapter has an intro scene (2 lines from Pell or the rival) and a win outro that leads to the next chapter. Each opponent now also has
a praise line (shown when you win) and a taunt (shown when you lose) on the result screen. Bosses already had both.

## Quick game
A one-line flavour intro when the game starts (`V.STORY.quick.intro`, picked by seed) and a result line in the game's voice (`win` / `lose`).
