# Kaiten Kitchen: cast and story (all wording lives in `game/src/story.js` for the tutorial and Quick game, and in `campaign.json` for Story mode)

## Cast (original names)
| Who | Role | Voice |
|---|---|---|
| Auntie Suzu | Owner of the Turning Plate, the guide of the tutorial and Story | warm, dry, proud of her belt |
| Mina | You, the new diner | silent hero |
| Odile | Dessert chef, the tutorial rival and boss of act 2; bets a custard that you cannot beat her | confident, sweet-toothed |
| Pip | Cheerful first opponent of act 1 | hungry, loud |
| Kofi | Roll-race fan, boss of act 1 | quick, competitive |
| Taro | Three-year champion of the Golden Plate, boss of act 3 | silent, exact |

## Prologue (the tutorial, "The Staff Lunch")
Four chapters in one real one-round game against Odile (fixed deal, real rules, real scoring):
1. The first plate: Suzu welcomes Mina; Odile has bet a custard. Pick, reveal together, hands swap. Payoff: "A pair! Prawns are happy."
2. Sets and sauce: Fire Paste and nigiri (3 becomes 9), Twin Sticks. Payoff: "Nine points from one plate!"
3. The big three: Fish Slice set of three, roll race, bun ladder, custard cup. Payoff: "A full set. 10 points!"
4. The count: every counter is counted aloud (sets, roll race, nigiri, rival, custard); Suzu's closing line: "Odile owes you a custard."

## Story mode (3 acts, 10 chapters, in `campaign.json`)
- Act 1, The Lunch Belt (c1-c4): Pip teaches plates, Kofi's roll race, boss Kofi (twist: roll fever).
- Act 2, The Dinner Rush (c5-c7): Odile and dessert, a table for three, boss Odile (twist: custard head start).
- Act 3, The Midnight Belt (c8-c10): the night shift, a full belt of five, boss Taro for the Golden Plate (twist: champion's head start).
Every chapter has an intro scene (portrait and 3 lines: who, what is at stake, the twist rule) and an outro; bosses talk before and after
(`taunt` and `praise`). Chapter loss: the chapter map offers a retry with the opponent's `taunt` (no separate loss script exists, noted in PLAYABLE.md).

## Quick game
One-line opening in Suzu's voice ("The belt hums, the plates roll. Pick one, pass the rest.") and a result card in the game's voice
(win / lose / tie lines, scores listed) in `story.js` (`quickIntro`, `quickResult`).
