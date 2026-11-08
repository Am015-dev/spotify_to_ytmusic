# Cauldron Fair: design fix list (D1, 8 Nov 2026)
Shots: `design-shots/cauldron-fair_{390,1440}_*.png` (title, 2learn, 3goal, 4firstturn, 6result). Not reached by the script: a true mid-game
turn (the run went straight to the first boom). The worker should re-shoot mid-game and rival turn after fixes.

## Scores (impeccable critique / design-review, 1-10)
| Row | Score |
|---|---|
| Hierarchy / focus | 6 |
| Layout and spacing | 6 |
| Typography and readability | 6 |
| Colour and contrast | 8 |
| Art and aesthetic fit | 9 |
| Goal clarity | 6 |
| Interaction states and touch targets | 7 |
| Responsive (390 vs 1440) | 7 |
Overall 6.9. Rows below 7: hierarchy, layout, type, goal clarity.

## Fixes, highest impact first
1. **Two coach cards stacked on the first screen** (390x844, shot `390_2learn`: "Fortune card" card + "The goal" card). They hide the board and the
   first decision. Show ONE coach card at a time: queue the Fortune card until "The goal" is dismissed. Selector: `#pc` tip stack and
   `.tip`/`tipok` render in `cauldron-fair.html` (grep `tipok`). Change: `max 1 visible`, second card waits for Got it.
2. **Goal card is not a goal.** Text is `Brew two practice days against Wynne. Most victory points wins. Play any move you like.`
   Change to one plain sentence plus 3 bullets, 16px, bold first line:
   "Score the most ★ in 2 days." / "Pull chips from your bag into the pot." / "Stop before it explodes: 7 white chips boom." / "Spend coins on better chips."
   Put the card at the bottom with 16px padding, button 48px high, and the "Leave tutorial" link at 14px with a 44px tap area.
3. **Board numbers are too small and too dense on phone** (the spiral track at 390: step numbers ~11px, bonus badges ~9px, overlapping).
   Raise track step labels to >=14px and bonus badges to >=12px, or hide bonus badges until the step is within 3 of your marker.
   Enlarge the player's own marker to 36px with a 3px gold ring. File: board render in `cauldron-fair.html` (grep `.spiral` / `.step`).
4. **Learn button text has a dark green highlight behind each line** (title shot, `.tbtn.gxt-menu.gxt-fir`): looks like selected text. Remove the
   inline background on the two spans, make the whole button the green fill (`#1f5a3a`) with cream text (`#fff7e0`), title 18px/700, subline 14px.
5. **"Take 3 rubies" option sits alone and half off-grid** (`#acts`/options grid, 4 columns of 2 then 1 orphan). Make the choice grid 2 columns,
   all five options 56px high, "best" tag 12px with 4.5:1 contrast, orphan spans both columns.
6. **Top bar chips are crowded** (`Day 1/2`, stars, rubies, bulb, Scores, Rules, Menu = 7 targets at 390). Merge Scores and Rules into Menu,
   keep Day, ★, ruby, bulb. Free space lets chips grow to 44px targets with 8px gaps.
7. **Rival chip floats over the board art** (Wynne, top centre at 390). Dock it in the top bar row, 40px high, not over the track.
8. **Result (boom) screen**: bottom 40% is empty planks and the continue button reads "Choose above first" in grey at ~3:1. Move the action
   button directly under the choice cards, label "Take ★ +1" / "Take 9 coins" on the cards themselves, enabled state copper `#c4602a` on cream text.
9. **At 1440x900** the guided layout is a phone column with big empty margins: centre the board at max 520px wide with a 24px gutter and
   place the coach card beside the board, not over it.
