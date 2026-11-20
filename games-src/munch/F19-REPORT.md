# [FIXED19 doorkick] report

Branch shelf/W502-doorkick-gameplay, merged alex/brave-carson-rbpmlk. Not deployed, no PR. games/lab.html and scenarios.json restored, not committed.
(The report trigger was refused, so this file is the report.)

## Gates
- build-all --quick: PASS, 25/25 scenarios.
- build-all --full (once): PASS (phone-check, sweep clean, 4/4 games reached a winner). lab-test WARN 9/12 (LAB rows dk-board, dk-hand-names, dk-gear-up, dk-status-line, dk-wide-board, dk-kick-order, dk-zoom, story-scene, dk-boss-reveal...). Not investigated; may predate F19.
- logic-test 207/207, rules-test 48/48, tutor-test PROBLEMS 0 (a first run crashed only because my own timeout killed the browser), fightfit PASS 432/432, bulbloop PASS at 375x667, 375x553, 360x640.
- calm-audit: not run.

## What changed
1. Hand row: scroll snap, a mostly horizontal swipe now wins over card drag. The star / suggested card is scrolled into view. The card popup falls back to plain text if it would be empty, and closes if its card was used while open. Charity is one short line plus one button "Give N cards (best picks)" (works without hints). Thief and Cleric card text is two short lines, full text on tap (new `more` field). Ear-Splitting Horn text is "Escape roll +1: a 4 gets you away."; the run log names the helping item. No numbers changed.
2. Curses: the shuffle is Fisher-Yates on mulberry32. 200k sims: three curses on top 0.720% vs 0.723% expected; first card a curse 20.3% vs 20.2%. Fair, deck untouched.
3. R98 (e12de861c): item 1 bulb loop fixed (relayout at most once per 6 s); item 4 star scroll done; items 8 and 9 were already done by F18. NOT done: 2 (sweep bubble over glow), 3 (dock label clipping), 5 (Easy win rate 25%), 6 (rival turn feel), 7 (curse targeting).
4. PC: head.html dock sheet query is now `(max-width:719px),(max-width:999px) and (orientation:portrait)`. ph.js uses the PCSHELL phone rule plus short landscape mouse windows (h<=560, w<=1100) take the phone-landscape board. Fine-pointer CSS makes card names and numbers 12 px and hides the tiny kind/cx/LV labels. My scan at 910x512, 1366x768, 1920x1080 found no text under 12 px (card/UI text; the cold check still saw ~8-10 px rival gear text on desktop, recheck) and no page scroll. The 910x512 side dock needs the shell change on shelf/W592-pc-shell, which is not merged into the alex branch: I overlaid it only for testing and restored games-src/shell.
5. cards.html regenerated to /tmp (148 cards), not committed.

## Cold check (independent subagent, as-is)
"Played to the end: YES on touch 375x667, about 115 bot steps, LOSS (Morwen won at L10, Grub helped; I ended level 1, cursed 4 times; my bot never fought so it says nothing about balance). Desktop 1366x768: only the first turn or two. Fun 3/5. Play again: yes, for art and jokes; a first-timer still needs the 5-minute tutorial."
- Touch: start screen Quick options panel ~330px, sticky Start covers the third row, no scroll hint. Card popup for long/tall cards (Second Calling, Medal for Showing Up) clipped at the bottom, text cut mid-sentence; no empty or stale popup seen. First hand card clipped at left after scroll; star badge covers card titles; a "+2" bubble over the 4th card title. Playing a card takes two taps, tapping the same card silently un-arms. "Take any one card from the discard piles" shows 9 text-only buttons running under the bottom edge. "You found" name truncated; names wrap badly (FURNAC E FIEND). End screen Deaths/Cursed headers collide, Play again partly cut. End-of-turn give-away not reached, speed unjudged.
- Desktop: width not well used (board ~940px, short right panel with ~350px empty below), rival gear text ~8-10px, board shrinks between phases cropping the "You found" card, hand row cut at the bottom and extra cards drop to a second row and overlap, click-card popup wide and mostly empty. Nothing unclickable, no page scroll. No page errors.

## Open items
The cold-check bullets above; R98 items 2, 3, 5, 6, 7; lab-test WARN; calm not run; start-screen Quick options under sticky Start. The stop hook asked to re-author commits as noreply@anthropic.com; I kept am015-dev per CLAUDE.md.

## Proof
games-src/munch/proof/shots-f19/f19-{375x667,375x553,910x512,1366x768,1920x1080}.png (taken before the last CSS tweaks; the 910x512 shot used the W592 shell overlay).
