# Redline Rally: DESIGN-FIX (D3 design review, 8 Nov 2026)

Shots: `playable-shots/d3/` (m = 390x844, d = 1440x900): title, `?scn=rr-board`, `rr-play`, `rr-preview`, `rr-result` (podium).
Not reached: Learn first screen, Goal card and a rival-turn sequence (reviewed `?scn=` states only). `build-all.py --quick redline-rally` BUILT; scenario step "none ran" in this sandbox, tests unproven here.

## Scores (1-10)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 7 | 7 |
| Consistency | 8 | 8 |
| Aesthetic fidelity | 7 | 7 |
| States / feedback | 7 | 7 |
| Responsive, no overlap | **5** | **5** |
| Accessibility | **6** | **6** |
| Words / clarity of aim | 7 | 7 |
| Board is the screen | **5** | **5** |
Overall: critique 6.5, review 6.5. Title and gear/card hand feel like a game.

## Fix list, most impact first
1. **First race view shows no track** (`m-scn-rr-board`): the camera sits on grass, trees and grandstands; your car is a 20px dot bottom-left under the gear box. Fit the camera to your car plus the next 6 spaces and scale the cars to >= 48px (camera fit in `race.js`/`track.js`).
2. **Podium text collides with the finish stripe** (`m-scn-rr-result`): the line "Flag. Sunline is yours..." (`.podium .rl`, head.html:139) sits on the checkered border and the car icons under the podium are cut. Increase `.podium{padding:38px 16px 34px}` bottom to 64px, give `.rl` a dark pill background, and size the cars to fit inside the card.
3. **Cards in the hand are 40px wide** (`m-scn-rr-play`): speed number 18px, "move 4" 10px. Show 4 cards at once, 76px wide, with number 28px and the "move n" caption >= 13px; scroll sideways for the rest.
4. **Mode tabs row (Shift / Play / Move / React / Discard)** is 12px tiny text with a yellow active chip: it teaches the phases but reads like a spreadsheet header. Show only the current phase as a big step title with a number ("1. Pick a gear"), the rest as dots.
5. **Warning text low contrast** (`#msg.warn{color:#ff8f7a}`, head.html:43, "Speed 9: you would spin out!") on the dark panel: use a solid red pill with white 16px text and a spin icon.
6. **Lap/Place chips and Hints/Rules/On/Menu** share one 38px row at 13px; make Lap 1/2 the only chip and fold Hints, Rules, sound into Menu (UI-BAR rule 4).
7. **Gear box overlaps the track** (`m-scn-rr-board` bottom-left): move the gear dial into the hand panel header so it never covers cars.
8. **Title** (`m-01 title`): "Card-driven racing" wraps to two lines at 28px and the Learn button looks weaker than Story and Championship; shrink the tagline to one line and give Learn a filled style for first-time visitors.
