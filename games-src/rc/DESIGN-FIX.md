# Shipwreck Isle: design fix list (D4, 8 Nov 2026)

Shots: `rc/playable-shots/feel/d4/` (390x844 and 1440x900: title, Learn first screen, first turn, Rules/Goal, mid-game, end state).
Limits: the Learn run reached the "Give a job" step; no rival turn or result was reached. The impeccable launcher is missing from the repo, so I read the project docs directly.
Built with `build-all.py --quick shipwreck-isle` after `npm i --no-save three@0.158.0` in games-src (node_modules was missing). Build OK; the scenario gate printed "none ran".

## Scores (0-10, my read of the shots)
| impeccable critique | | design-review | |
|---|---|---|---|
| Hierarchy | 6 | Visual hierarchy | 6 |
| Aim clarity | 5 | Consistency | 7 |
| Readability | 6 | Aesthetic fidelity | 8 |
| Motion / feedback | 6 (unverified) | Responsive | 6 |
| Polish | 7 | Accessibility | 5 |
| Pop-up discipline | 6 | Typography | 6 |
| **Mean** | **6.0** | **Mean** | **6.3** |
Rows below 7 block a visual deploy (CLAUDE.md).

## Fixes, by impact
1. **Aim is never said at the start.** The Learn first bubble ("Cook: Morale moves our determination each morning...") explains a stat, not the goal. Change the first coach step (`rc/tutor.js`, first entry in the tutorial data) to: "Stay alive until rescue comes on day 12." plus 3 bullets: "Send castaways to work." / "Eat 1 food each night." / "Build a shelter." Move it above "Morale". Show the same line in the top-bar strip as "Rescue: day 12" (replace "Day 1 of 12" at `.top` stats).
2. **Rules dialog opens on "How a turn works"; Goal is missing from the first screen.** In `rc/cards-page.js` / the rules html, put a "Goal" block first (one sentence, 3 bullets). The Tips On/Off row sits at the top in near-invisible grey on cream (contrast well under 4.5:1); darken the "Tips" and "Show tips again" labels or move the row to the bottom.
3. **"Skip tutorial" pill (`#coachskip`, `.coachskip`, `rc/tutor.js:69`) floats over the map and collides with the coach bubble** at 390. Dock it into the bubble footer next to "Got it", at least 44px high.
4. **Dead space below the board at 390.** About 270px of blank beige holds only Continue. Raise the dock: board to 62% of height, dock to a compact 120px, and show the job tray (Carpenter, Cook, Friday) in the same dock from the first turn so the player sees who they can send.
5. **Job-tray labels collide at 1440.** "Carpenter" and "Carpenter" overlap ("CarpenterCarpenter"). Use a 2-line label ("Carpenter" over "x2" badge), a 13px minimum, and equal 72px slots.
6. **Fog hexes all read "Unknown".** Every dark hex has an "Unknown" tag (`.hexlabel`, purple, 11px). Replace with a single "?" glyph in a 24px coin, and keep the glowing ring only on tappable places. Today the glow rings are fine (see the first-turn shot) but the word "Unknown" repeated four times adds noise.
7. **Top stats strip is 11-12px** ("Food 1 (eat 2)", "Wood 0", "Life 13", "No shelter"). Raise to 14px with icons first, and drop "(eat 2)" into a tooltip. Five icon-only buttons at top right have no captions; add `aria-label` and a Rules caption.
8. **Coach card on the first-turn shot ("Give a job" + "Got it") is good** (stays until tapped, one at a time, plain words). Keep it and copy its structure for the Goal step in item 1.
