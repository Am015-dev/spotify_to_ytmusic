# FIXED1 wickdeep report

Branch shelf/W566-new-dungeon. Not deployed.

## Gates
- build-all --quick: PASS (8/8 scenarios). --full once: PASS (phone-check, lab WARN is the known scenario-list note, rules-test 439/0).
- tap-play (real touch): 0 dead taps at 375x667 (also 375x553), no errors. Tester race and overlay-change metric fixed in tap-play.js.
- After the last CSS-only commit (PC play cards) re-ran rules-test (439 ok) and tap-play (0 dead); --full not re-run.
- games/lab.html and scenarios.json restored, not committed.

## What changed
1. Readability: card initiative badge 13px, card names 12-13px, tags/levels 11-12px, order-bar numbers 13px, HP and monster number on map >=11px phone / 12px PC, HP/Played/Lost chips 12px high contrast. One-line legend on the board in round 1 ("Card corner number = initiative, low goes first. Green bar = HP"), tap to hide, remembered.
2. No empty prompts (busy now says "Watch the action..."); stricter tap-play.
3. PC (>=800px, mouse): map centre, dock as a right-hand card grid (up to 4 columns at short heights, 3 rows), hero tabs and stats on top, no scrolling at 910x512, 1366x768, 1920x1080; zoom limit 64; target pulse animation removed.
4. Tutorial: one-idea lessons with a "Got it" button, shown once at first need: two cards, initiative, top/bottom, lost vs played, luck (modifier) card, elements, conditions, resting. Coach line is the only helper (legend hidden in tutorial); 0 infinite animations.
5. Phone sizes: legend placed over the board bottom so the hand is not pushed off at 375x553.

## Cold check (independent subagent), as given
"Partly. I got through card picking, initiative and the first moves, but never reached a monster. The room starts empty and foes are behind the door. My tap-bot kept hitting hero info popups, so the 3-round fight is not covered. Could I play unaided: mostly yes. Fun: 3/5. Play again: tentatively yes. Dead taps/confusion: tutorial: moving first with the Toll card leaves the second card only offering Hit, and No foe in reach appears; escaped only via the small default Move 2 button. Tutorial asks me to hit with no enemy on the map. Tapping a hero opens an info card that covers the prompt. A Rest prompt in round 1 was odd. Hard to read: initiative ? icons then 22/32 in a tiny top-left bar; card badges small; on phone the hand runs off the right edge. PC 1366x768: no page scroll; during the action phase the cards are clipped, bottom default Hit/Move buttons cut off." 
Fixed after it: PC play cards now grow to show the default buttons. NOT fixed (open): tutorial coach says to hit before any foe exists; hero-tap info card covers prompt; round-1 Rest prompt; phone hand still scrolls sideways.

## Proof
games-src/wickdeep/proof/shots-f1/ (title, brief, play at 375x553, 375x667, 910x512, 1366x768, 1920x1080).
