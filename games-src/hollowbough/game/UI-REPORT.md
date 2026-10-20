# Hollowbough UI report
See the final hand-off message for numbers. Layout: board-first shell (shared shell.css/js for drawers) + own phone mode (`html.ph`, `ph-p`/`ph-l`, forced by `?phone=1|0`).
Files: src/ui1..ui7.js (helpers, board, dock, pop-ups, flow, start/drawers/events, sound), head.html, body.html, build.py -> hollowbough.html, lay.js, lay-phone.js, click.js.
Hooks: ANIM, AIDELAY, G, UI.*, newGame(mode,opts) (modes vs|solo|hot|ai|guided), UI.seed, UI.noRec, viewSeat(), hotSeat(), humans(), data-owner/data-up on hand cards, data-start on start buttons.
