# Short Fuse: design fix list (D4, 8 Nov 2026)

Shots: `short-fuse/playable-shots/feel/d4/` (390x844 and 1440x900: title, Learn first screen, first turn, Goal/Rules, mid-game, end state).
Limits: first turn and mid-game come from `?scn=sf-board`. About 119 automated taps on the glowing wires produced no visible change, so the mid-game and end-state shots look the same as the first turn. I could not tell whether that is a stuck state or the scenario; the worker should check by hand. No result screen was reached. The impeccable launcher is missing from the repo, so I read the project docs directly.
Built with `build-all.py --quick short-fuse`. Build OK.

## Scores (0-10, my read of the shots)
| impeccable critique | | design-review | |
|---|---|---|---|
| Hierarchy | 6 | Visual hierarchy | 6 |
| Aim clarity | 8 | Consistency | 7 |
| Readability | 6 | Aesthetic fidelity | 7 |
| Motion / feedback | 6 (unverified) | Responsive | 6 |
| Polish | 6 | Accessibility | 6 |
| Pop-up discipline | 6 | Typography | 6 |
| **Mean** | **6.3** | **Mean** | **6.3** |
Rows below 7 block a visual deploy (CLAUDE.md).

## Fixes, by impact
1. **Every one of your wires glows at once.** In the first-turn shot at 390 all 12 blue tiles carry the same gold glow (`.tile.mine.known.b.glow.g-opt`). A glow that is always on says nothing. Change: glow only the wires that are legal for the current step (step 1: opponent wires; step 2: your numbers that match), dim the rest to 45% opacity.
2. **Coach bubble is cut off at the right edge** (390): "Brix - Show a wire" text is clipped ("everyone shows / one of yours and a tok"). It is the `.gxh-bub` / `coach.js` bubble; clamp `left` to `viewport - width - 8` and let `max-width: calc(100vw - 16px)` apply (`shell/gx-help.css:4`). It also hides the Plum stand while the player is told to look at it.
3. **Title "Play" looks disabled.** The main button (`Play`, dark orange with muted text) is darker than the white "Story" and "Learn to play" buttons. Make it the brightest element: solid `#ffb020` fill, dark text, 56px high. The 2/3/4/5 crew and Easy/Normal/Hard chips are about 36px; raise to 44px.
4. **Rules leads with mechanics, Goal is third.** In the How to play dialog (`short-fuse/cards-page.js` or `hlp.js`) the order is "How a turn works", "The goal", "How a round goes". Put "The goal" first and cut it to: "Cut all 24 wires together before the fuse runs out." plus the 3 bullets already on the Goal card. Delete the sentence "This is not in the printed rules" (it points at an original game); say "Safety rule: ..." instead. Lines run 20+ words; split to 12 words or fewer.
5. **Small type on the play screen at 390.** "Job 1 Setup Your pick" (11px), crew chips "You 0 / Teal 0 / Plum 0" (11px), fuse count "0/24" (10px), stand name pills "Teal 6" (11px). Raise all to 14px; the status line "Show a wire: tap one of yours." (14px) is the right size, so use it as the reference.
6. **Opponent stands are identical navy blocks** (`.tile` back faces with one orange stripe). The player cannot tell cut wires from live ones at a glance. Show a cut wire as a gap with a small tick, and a revealed number on the face, so progress toward "24 wires cut" is visible. Add the cut count next to the fuse bar ("Cut 6 of 24").
7. **Goal card is the strongest screen in the set** (one sentence, 3 bullets, a "Go" button, stays until tapped). Keep it. Make "Go" 44px high with the label "Start"; "Go" alone is vague.
8. **Verify no stuck state.** Hand-test a full game by touch at 390x844 with the first-turn tap sequence (tap a rival wire, tap one of your numbers); if nothing happens after the second tap, that is the bug to fix before any polish.
