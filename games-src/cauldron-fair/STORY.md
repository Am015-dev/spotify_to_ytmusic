# Cauldron Fair: story

All wording lives in `src/story-data.js` (tutorial bubbles, Quick game lines, lost-chapter outros) and `campaign.json` (Story chapters: intro and win outro per chapter).

## Cast
- **Granny Hask**: runs the Bramblemere stall, the guide in the tutorial and every Story chapter. Warm, dry.
- **Wynne**: a kind rival who brews beside you; the tutorial opponent and Story chapter 1.
- **Odo**: loud stall keeper, bluffs, buys cheap. **Tamsin**: feather seer. **Mirabel**: fire brewer who loves a big risk. **Madame Vesper**: holds the Golden Ladle.

## Arc (3 acts, from `campaign.json`)
1. **The Gates Open** (chapters 1-3): the night before the fair, then the first days. Learn to stop before the boil and to shop. Rival: Wynne, then Odo.
2. **Market Days** (4-6): new ingredient books, Tamsin's feathers, a three-pot table.
3. **The Golden Ladle** (7-10): Mirabel's fire, the heats, then Madame Vesper in the final.

## Tutorial = the prologue "The Night Before"
Four chapters inside one guided two-day game against Wynne. Granny Hask gives the reason, you do the action, she reacts in the next bubble.
1. Night before: the goal, the fortune card, drawing, the spiral, white chips, the flask, pushing your luck.
2. Counting up: the day count, the bonus die, a boom (coins or points).
3. The stalls: the market, the five colours, buying, the droplet, refilling the flask.
4. Last day: blue fortune cards, the rat stone, the secret last-day draw, the end count, who wins.
Ending line: "Tomorrow it is for real." leads into Story chapter 1.

## Quick game and results
One flavour line on day 1 (a toast), a result line in the game's voice (`quickWin`, `quickLose`, `quickTie`).
A lost Story chapter plays its own outro (`outroLose`), a won one plays the chapter's win outro.
