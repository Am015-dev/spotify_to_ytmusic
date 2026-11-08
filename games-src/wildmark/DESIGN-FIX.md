# Wildmark: design fix list (D6, 8 Nov 2026)

Shots: `design-shots/wildmark-{1title,2learn,3goal,4firstturn,4firstturn-b,5mid,6result}-{390,1440}.png`
(390x844, 1440x900). Built with `build-all.py --quick wildmark`. Scenarios: `?scn=wm-board`, `?scn=wm-result`.
Not tested: a full game by touch. `3goal` is the How to play sheet; the Goal card itself is `4firstturn-b-390` (appears after Play).
The result scenario is a synthetic all-zero finish, so some "0 / no pairs yet" content is the scenario, but the layout problems are real.

## Scores (0-10)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 8 | 8 |
| Aim is clear (Learn first screen + Goal card) | 8 | 8 |
| Board and pieces are the screen (phone) | 8 | 8 |
| Art and polish | 9 | 9 |
| Readability (size, contrast, overlap) | 6 | 5 |
| Motion and messages (reading time) | 7 | 7 |
| Responsive (390 and 1440) | 7 | 7 |
| **Result screen** | **5** | **5** |
| **Overall** | **7.3** | **7.1** |
Gate NOT met: readability (6/5) and result screen (5).

## Fix list, most impact first
1. **Result table is low-contrast and a spreadsheet.** `6result-390/1440`: row hints ("pairs 1, 2, 3, 4 = 4, 11, 19, 27", "no pairs yet", "largest area 1 + bonus 1 (biggest)")
   are ~13px dark-brown-on-dark-green (measured 1.2:1 for the muted text in the cells; visually ~2:1). Rows: Bear, Elk, Salmon, Hawk, Fox, Peak, Forest, Meadow, Marsh, ... 10+ rows.
   Selectors: result sheet `#rs .rbox table`, hint text `td small` / `.sub` / `td.src` (skin.css ~335). Change: set hint colour to `#d9e6d3` (>= 7:1), size 14px;
   show only the winner line + three totals (You / Bram / Sorrel) first and put the per-animal rows in a "Why these points?" expander.
2. **PC result sheet is clipped at the top.** `6result-1440`: heading "A shared win" touches y=35 and the table runs under the fold; the rbox is vertically centred with `max-height:calc(100dvh - 32px)` and
   the background board shows through at 55% (busy). Selectors: `.rbox`, `#rs`. Change: `align-items:flex-start; padding-top:5vh` on `#rs`, background `rgba(10,18,14,.96)`, sticky Play again row at the bottom.
3. **Two bulb buttons in the top bar at 390.** `2learn-390`: `#bulbbtn` (help) and `#hintsB` (Hints toggle) look identical, side by side. Change: give `#bulbbtn` a "?" glyph (data-help) and keep the bulb only for `#hintsB`; at 390 show the label "Hints" under it (the brief says hints off by default, so make the on state obvious: amber fill, already done).
4. **"Your turn" banner sits on the tiles in the Learn first screen.** `2learn-390`: translucent grey "Your turn" text overlaps the water tile and the fish icon. Selector: the turn banner in `ui.js` line ~84-98 (`banner('Your turn')`). Change: place it above the valley (top: bar-h + 8px), solid background, and hold >= 4s + 1s per 10 words, or skip it in tutorial mode (`UI.mode !== 'tutorial'` is already guarded for one case; apply to the Learn path started via `.gxt-first`).
5. **PC layout: dead space under the market.** `5mid-1440`: market 2x2 at top right, a small "Season log" card, then 500px of empty column. Change: make the market tiles 1.3x at >= 1000px, move "Season log" to a collapsed chip, and give the right column `justify-content:space-between` with the instruction bar anchored bottom.
6. **Market tile art is small on phone.** `4firstturn-b-390`: the tile hex is ~48px with 3 tokens inside. Raise to 64px by dropping the "up to +N" pill when Hints are off (the pill is a hint).
7. **Goal card bullet 1** (`4firstturn-b-390`) is 23 words: "Animals score by their card: bears in pairs, elk in lines, salmon in runs, lone hawks, foxes next to different animals." Cut to "Animals score by their card (see Scores)." and keep Land and Acorns bullets as is.
8. **Floating "What should I do?" pill** on the Learn screen sits above the market and covers nothing but is the third help control on screen; remove it when `#bulbbtn` exists.

## What works
Title is the best of the three: art, one big Play button, "New here? Learn in 5 minutes" above it. Goal card is a clear sentence and three bullets. The board is the screen on phone and PC, legal moves glow, and the market shows what each pick is worth.
