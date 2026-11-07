# Story: Crown City Smash

A night in Crown City: a portal cracks open over the skyline and giant monsters climb out to fight for the crown. The newspaper
**The Crown City Clarion** covers it. Whoever holds 20 stars is crowned king; the front page is the prize.

## Cast (original; art in `games/crown-city-smash/camp-*.webp`, cut-outs `cut-*.webp`)
| Who | Role |
|---|---|
| **Dot Inkwell** (reporter, Clarion) | Guide: tutorial, chapter intros, outros. Warm, quick, always chasing a headline |
| **Voltusk** | You, the newcomer from the portal |
| **Squidrik** | Tutorial rival and Chapter 2 opponent: storm-drain king who wants Downtown |
| **Shroomhulk** | Chapter 1 opponent: slow, sleepy spore brute |
| Boltbox, Baron Magmaw, Glacyx, Bramblebat, Cortexa | later chapters and bosses (see `campaign.json`) |

## Arc in 3 acts (10 chapters, `campaign.json`)
1. **Portal Night**: you crawl out, learn to roll, smash, shop and hold Downtown. (Ch 1-4, boss Baron Magmaw)
2. **The Harbor Wars**: bigger brawls, evolutions, a second city space on the water. (Ch 5-7, boss Glacyx)
3. **Spire of the Crown**: stolen rolls, curses and the schemer who opened the portal, Cortexa. (Ch 8-10)

## The tutorial is the prologue (W386; now a coached free-play game, see TUTORIAL-COVERAGE.md)
Four short chapters, one real game against Squidrik and Shroomhulk, ending at 20 stars and the result screen. Dot gives the story reason, the
player does the action, Dot reacts. Chapter 1 *First turn* · 2 *Downtown* · 3 *Outside* · 4 *The crown*. Each opens with a beat card and closes with a payoff beat.
Rival: Squidrik wants the front page. Climax: the winning roll, the result screen, and "KING OF CROWN CITY!"

## Where the words live (one file per layer, edit there)
- Tutorial: `tut-story.js` (all step lines, reactions, chapter beats). Shown by `playable.js` (`ppBeat`) and `tutor.js`.
- Story chapters: `campaign.json` (intro scene before, outro after a win, boss lines).
- Quick game: the "Dawn over Crown City" article and the Clarion result page (`story.js`, `ui.js`) speak in the Clarion's voice.

## Not done
- Chapter outros for a loss: the shared story kit plays the outro only after a win and returns to the map after a loss; a loss variant needs a kit change (shared files are read-only here).
