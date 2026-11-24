# INT22 critic gate, 24 Nov 2026, ~18:25 UTC
Rows R1 Readability / R2 Game-not-spreadsheet / R3 Layout / R4 Finish / R5 First-minute. Gate: every row >= 7 on phone AND pc. Unsure = 6.
Sheets: games-src/thornbound/proof/int22-*-sheet.jpg, games-src/carc/proof/int22-*-sheet.jpg (flags beside them).

| game | phone R1-R5 | pc R1-R5 | verdict |
|---|---|---|---|
| thornbound (live was 4/6/6/3/5, 4/6/5/4/5) | 6/6/5/5/6 | 5/6/5/5/6 | HELD |
| rampart-and-vine (live was 6/8/7/4/6, 5/7/5/4/6) | 6/7/7/5/6 | 5/6/4/5/6 | HELD |

## R15 top-3 defects
thornbound
1. phone menu empty parchment: FIXED (menu, tb-art cells now show controls).
2. tb-over zeros: FIXED (tb-over shows 31/26/22).
3. labels/hand cards ~7px: phone FIXED (tiny=0, was 9). pc NOT fixed: tb-zoom ribbon 13.5px "HEIR", 13px "2 votes", 14px "SALT CROWN" (kit-owned); header title 15px.
New/remaining: "Lessons" pill overlaps the title text ("THORNBOUND THRONE" cut off on pc, over the subtitle on phone; cells menu, tb-board, story-scene). Same overlap on the clean base (not caused here).
rampart-and-vine
1. blank option pills on start: FIXED (start, ui-start labelled).
2. empty bubble with x (rv-art): FIXED.
3. pc tiles ~5% of table: NOT fixed (rv-board, rv-art, rv-buttons: 2-3 tiles in a huge tan field, no zoom-to-fit). pc also has 138 tiny (<16px) flags (14px labels on start/menu).

## Tests
- Lessons (turbo, real seconds): thornbound phone 28.1, pc 42.3; rampart phone 48.0, pc 48.2. All PASS (rampart ran with PW_CHROME=/opt/pw-browsers/chromium; its test is not on turbo.js).
- ?scn= sweep (build-all --quick, 179 s): thornbound 12/15, rampart 13/14. Thornbound menu fails on pc on live too and the Lessons overlap fails on a clean-base build (not caused); rampart story-scene passed alone on live and staged (flaky under load).
- Contact sheets (--strict): thornbound phone tiny 0, pc tiny 9; rampart phone tiny 0, pc tiny 138; clipped/offscreen 9 each ("Round 1 of 4 begins." / hidden help text offscreen).
- Fix: thornbound ui2.js drawSelName: a W754 comment swallowed its guard; restored (cheapag $0.094).
- Merge: W756 merged; W754 squashed (contact-sheet.js and HANDOFF.md kept ours); W753 rampart files were already inside W754, nothing more to merge.
