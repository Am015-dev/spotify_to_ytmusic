# Hollowbough: story (cast and arc)

All tutorial and Quick-game narrative text lives in ONE data file: `game/src/story.js` (const `HBS`). Story-mode scenes (chapter intro/outro, bosses) live in `campaign.json` (unchanged: they already have a portrait, 2-3 lines of intro and a win outro per chapter). Edit those two files only.

## Cast (original, code-drawn emoji discs until painted portraits exist for the tutorial)
- Hazel Quickpaw (rabbit, guide): warm, quick, practical. Voice: short punchy lines, a promise, then a cheer after your action.
- Bramble (hedgehog, rival): cheerful, scatterbrained, grabs whatever is shiny. Wants the Elderheart Oak's stewardship for her own city.
- Fern (mouse, careful rival), Quill, Thistle (regent boss), Old Grimbeard (solo rival): see campaign.json.

## Stakes
The Elderheart Oak, the great tree at the heart of the valley, needs a steward before winter. Whoever builds the finest city (most points when everyone has passed) is chosen. Bramble wants it too.

## Tutorial = the prologue (one real short game, seed 4242, scripted rival) in 4 chapters
1. First Turn: the thaw, the places, the pantry, rival races you to a place, second worker. Payoff: "Chapter 1 done: you can gather!"
2. Building: plans in your hand, raise the Allotment, your city, Prepare for Spring (workers home, +1 worker). Payoff: "Chapter 2 done!"
3. Tricks of the Trade: shared places, buying from the meadow, a free lodger, a flag (event), the forest. Payoff: "Chapter 3 done!"
4. Winter's End: pass, count your points, count Bramble's, the Oak decides. Climax: score card, result card, "You are Steward".
Each step: a story reason + the action in the bubble (Hazel speaks), then a reaction chip from Hazel after the action.

## Story mode arc (campaign.json, 10 chapters, 3 acts)
Act 1 Thaw (found your city, learn the woods) / Act 2 Midsummer (sharper neighbours, fewer clearings, a proud regent) / Act 3 First Frost (hard rivals and Thistle's gate before the winter). Each chapter: intro scene (Hazel + rival), twist rule, outro (win variant; loss retries the chapter). Bosses talk before and after.

## Quick game
One-line flavour intro on start ("Hazel: A fresh thaw. Build the finest city before winter.") and a result line on the result card in Hazel's voice (win/lose variants).
