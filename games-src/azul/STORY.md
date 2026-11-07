# Sunglaze story (W388)

Where the words live: tutorial lines in `game/src/tutor.js` block `TUT_TEXT` (one table, keyed by step id); Story chapters (intro and outro scenes, cast, twists) in `campaign.json`; Quick-game flavour in the story intro card (`game/src/ui.js` start text).

## Cast (existing, reused)
- **Mother Ochre**, the guide: warm, practical, old atelier mistress. Speaks in the tutorial, every chapter intro and outro.
- **Tamsin Reed**, the rival: a cheerful fellow apprentice who grabs the biggest pile and slips. She is the tutorial's opponent and Story chapter 1's rival.
- Act 1 rivals Bram Kettle, Saffra Vell (boss). Act 2 Cobb, Iris Prismwright, Master Garnet Hale (boss). Act 3 Nell Frost, the Lumen Twins, Vesper Ash, Lady Umbra of the Black Kiln (final boss). Full lines are in `campaign.json`.

## Arc (3 acts)
1. **Wet Clay**: an apprentice learns kilns, racks and the mosaic. Tamsin and Bram are friendly; Saffra holds the Sun token and tests waste.
2. **The Guild Kilns**: columns, prism tiles, a master's head start. The guild decides who may tile the palace.
3. **The Sun Palace**: the king's wall goes to the best glazier alive; the Black Kiln wants it too.

## Tutorial = prologue ("The commission")
Part A, a real round 1: Mother Ochre welcomes you, you and Tamsin compete for the Sun King's commission (most stars wins). Each step gives a story reason, then the action, then the next beat reacts ("Good hands!", "Tamsin grabs a kiln", "Neighbours pay"). Ends on "Well fired".
Part B, the final hour: you lead 21 to 12; the climax is the count-up (chains, floor, bonuses) and "The king's seal".
Chapter beats: A opens "Welcome, apprentice" and pays off at "Well fired"; B opens "The final hour" and pays off at "The king's seal". Both end cards are in Mother Ochre's voice.
After Part B in the Story prologue the button leads straight to chapter 1, "The First Kiln".

## Not done (honest)
- Story chapter outros have ONE variant (win); loss variants and boss pre/post taunts beyond `taunt` / `praise` in `campaign.json` were not written in this pass.
- Quick game has the shared story-intro card and the result card; no new one-line flavour was added.
