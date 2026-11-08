# Design review: Twin Thrones Play screen (W429, 8 Nov 2026)
Skills: impeccable (critique), design-review, boardgame-builder (board-first-play + owner verdicts), fun-game-design.
Shots: `playable-shots/feel/` phone (390x844) and pc (1440x900): 1-title, 2-learn, 3-goal, 4-first-turn, 5-mid-game, 6-rival-turn, 7-result.
These are worker scores from the shots, not a player's fun score (fun-game-design: only the owner's score counts).

| Impeccable critique | Score | Note |
|---|---|---|
| Hierarchy | 8 | one instruction line > pyramid > player lines; glowing cards are the obvious target |
| Clarity of the next action | 8 | "Tap or drag a glowing card." + Free / coin price on each takeable card |
| Feedback and motion | 7 | card lifts, flies to the city, "+N card" pops at the score, rival steps readable (4 s + 1 s per 10 words, tap skips) |
| Readability | 7 | text >= 14 px, AA contrast (ui-audit B0); Age I/II cards are ~60 px wide because six must fit |
| Consistency | 7 | one badge language (red shield, blue points, green science, coin price) |
| Restraint (clean Play) | 8 | no ratings, star, previews or bubbles unless Hints; bottom panel only for a real choice |
| Craft | 7 | one art family (KayKit renders), plates under all text, PC layout centred |

| Design-review checklist | Score | Note |
|---|---|---|
| Visual hierarchy | 8 | see above |
| Consistency | 7 | shared tokens per role; legacy CSS layers still underneath (v4 block overrides) |
| Aesthetic fidelity | 8 | free-art ART-DIRECTION: one low-poly hex family everywhere |
| States and interactions | 7 | takeable / covered / free / too costly / selected / rival pick / drag-hover states |
| Responsive | 7 | 390x844, 375x667 (no overlap, no scroll), 1440x900 centred board |
| Accessibility | 7 | ui-audit A-F 0 at phone, phone-s, pc; Enter opens a card, Esc closes pop-ups, aria labels on picture buttons |
| Typography | 7 | system UI, 14 px phone / 16 px desktop floor, names soft-hyphenated, never clipped |
| Mobile-first | 8 | portrait phone first, one-handed, drag or tap |

Must fix: none open. Should fix: science symbol and resource icons are pictures without words on the small card (words on the big card).
Could improve: wider Age I/II cards via a zoomed bottom row; wonder art is the weakest set (pack has no statues/ships).
