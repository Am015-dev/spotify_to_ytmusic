# Doorkick Dungeon: design fix list (D1, 8 Nov 2026)
Shots: `design-shots/doorkick-dungeon_{390,1440}_*.png`. Reached: title, tutorial steps 1-2 (hero card, "Play your race"). NOT reached:
Goal card (the "Race to level 10" panel appeared in the DOM but was not visible in the shot), a real first turn of a quick game, mid-game and
result: the Quick game button is a toggle needing a second step the script did not find. The worker must shoot those.

## Scores (1-10)
| Row | Score |
|---|---|
| Hierarchy / focus | 7 |
| Layout and spacing | 6 |
| Typography and readability | 6 |
| Colour and contrast | 7 |
| Art and aesthetic fit | 9 |
| Goal clarity | 5 (goal panel not visible in the first screen) |
| Interaction states and touch targets | 7 |
| Responsive | 7 |
Overall 6.8. Rows below 7: layout, type, goal clarity.

## Fixes, highest impact first
1. **Goal never shows on the first tutorial screen** (390 `2learn`: only the hero card and "Ready"). The panel "Race to level 10 / Be first to reach
   level 10. The final level can only come from killing a monster." exists but is hidden behind the card. Show it as the step-1 coach card, above the hero,
   16px, plus 3 bullets: "Kick doors to meet monsters." "Win a fight to level up." "Level 10 must come from a kill." Selector: tutorial step 1 in `munch/body.html`/tutor script.
2. **Player cards at the top are ~11px and dim** (`Morwen 3 str 0 gear`, `Grub`). Raise to 14px name / 14px stats, 56px high, opacity 1 (now ~.6).
3. **Hero card dominates: the hand, the actual decision, is cut off.** Hand fans at the bottom with 5 dark card backs overlapping at 45px each.
   Shrink the hero to 220px wide, make the hand cards 84x120 with 12px overlap and face-up art, so each card is identifiable. Files: `munch/ph.css`, `tbl.css`.
4. **Coach card text is 12-13px** ("Play your race. Tap your Elf..."). Make it 16px, max 2 sentences, and put an arrow on the exact card.
5. **The "Ready" button is brown on brown** (contrast ~2.5:1 when idle). Idle state: `#7a3b12` fill with cream `#fff3d6` 18px text; active state copper `#e07a20` glowing.
6. **Title**: bottom card holds 3 buttons at 46px; "Quick game ▾" and "New here?" look identical to each other. Make "New here? Learn in 5 minutes"
   the primary (orange) button and "Story" secondary; the owner asked the tutorial to be the entry.
7. **Title art is shared with Emberclimb** (same kick-door picture on both title screens). Give Doorkick its own crop (zoom on the hero and door, 1.3x)
   and let Emberclimb use a tower/ember picture, so the two products don't look like one game.
8. **Progress dots** (`2/24`) at the top are 6px and the "Skip tutorial" pill is 12px text. Dots 8px, pill 14px with 44px tap height, and skipping must confirm, not return to title.
9. **1440x900**: same phone column with tall empty margins: centre at 560px max, put the tutorial coach card in the left margin.
