# Cauldron Fair: first-time player review

Played as a newcomer, mainly at 390x763 (iPhone), plus 375x553, 844x390 landscape and 1366x768 desktop.
Games played: the guided game (all 9 days, finished 38-38 and lost on the tie-break), a full 3-maker game vs Odo and Tamsin (Tamsin won 44, me 32, Odo 32), and hot-seat for 3 days.
Screenshots are in `/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/review-cf/` (shortened to `cf/` below).
The "newcomer" drawing was done by a script (a bot that stops at about 22% risk), so some explosions were not deliberate; the layout and rules findings are real.

No rules mistakes found in the engine against the rules drawer (bonus die, tie-break, explosion choice, droplet, day-9 conversion all behaved as written). Items 6 and 15 are rules-text/wording contradictions, not engine errors.

## Problems, worst first

1. **Explosion odds and "what I score now" are hidden behind the Draw/Stop buttons.**
   The odds box ("Next chip explodes it: 67%") is the single most important number in a push-your-luck game. On a 390x763 phone it is half covered once the Flask row appears, and on 375x553 it is completely out of view; only the Flask, Draw and Stop buttons show, and the dock body scrolls with no cue.
   Shots: `cf/17-risk67.png` (67% shown cut off, coins/points line hidden), `cf/09-g-after-tips.png`, `cf/55-s553-draw.png` (no odds, no coins, no prompt).
   Fix: make the action buttons part of the flow instead of a sticky overlay, or put a one-line summary ("Risk 67% - space 11 = 11 coins, 2 VP") above the buttons that is never scrolled away. Reserve dock height for it, and shrink the board a little on short phones.

2. **Guide tips cover the board and the Draw button, and the first 5 tips appear back to back.**
   At 375x553 a tip takes about 40% of the screen and hides the cauldron and Draw. Every new tip has to be dismissed before you can draw again. The tips are also long for a bottom sheet.
   Shots: `cf/54-s553-tip.png`, `cf/04-guided-1.png`, `cf/07-draw1.png`, `cf/08-draw1b.png`.
   Fix: show tips as a one-line banner above the buttons (with a "more" tap), never overlapping Draw/Stop; space tips out (one per day at first) and auto-dismiss on the next Draw.

3. **Several tips arrive late or hidden behind the day report.**
   The "Shop" tip is drawn under the shop modal, so you see it only after you have shopped, then it pops up on day 2 ("Tip 6 of 12: The shop" while I was on day 2's first draw). The "Boom!" tip appears under the report after the explosion. "Rubies" and "Report" tips have the same problem.
   Shots: `cf/22-day2-start.png`, `cf/23-rubies-chosen.png`, `cf/24-day2.png`, `cf/g1-rs24.png`.
   Fix: show these tips inside the modal at the top (or queue them to show before the modal opens), and drop a tip if its moment has passed.

4. **Fortune choices (Pedlar's Pick, Fork in the Road, Swap Stall, Spilled Brew) are clipped in the dock.**
   Pedlar's Pick has 5 options and only 3 fit; "Take 3 rubies" and the last chip are below the fold with no scroll hint. These choices come before the first draw, so a new player hits them on day 1.
   Shots: `cf/31-fortune-pedlar.png`, `cf/vs3-acts47.png` (Peek and Pick), `cf/vs3-acts10.png`.
   Fix: show choices as a compact chip grid (2 columns, chip icon + name) or open them as a modal, with the board dimmed.

5. **The "white limit" is taught as 7 but the screen says 9 on day 1.**
   Tip 3 and the rules say "over 7 explodes", but the first guided day shows "white total 1 of 9" and "(0 of 9)". The cause is the Thick Skin fortune (+2), which is collapsed at the bottom of the dock and cut off. A newcomer thinks the display is a bug.
   Shots: `cf/08-draw1b.png`, `cf/05-guided-2.png`.
   Fix: when a fortune changes the limit, say it in the tip and in the odds box ("limit 9 today (Thick Skin)"), and tint the bar-chip. Avoid giving a limit-changing fortune on day 1 of the guided game.

6. **Rules drawer is a wall of text and mixes in-game numbers.**
   "How to play" is about 900 words. The key loop is in the middle and the order "bonus die / chip powers / rubies / points / shopping" is hard to hold. A few lines are cryptic: "the farther one wins; exactly equal spaces all roll" for the bonus die, "chips ... lands ... as many spaces after the last chip", "17 coins at 5 to 1" in the day-9 report.
   Shot: `cf/06-rules.png`, `cf/g1-rs203.png`.
   Fix: open the drawer on a 5-line "Turn in one minute" card with a tiny diagram; keep the full text below under collapsible headings. Write "5 coins = 1 point" in the day-9 report.

7. **The spiral is gorgeous but a newcomer cannot read it without help.**
   Large cream/pink numbers are the coin value of a space; the tiny brown superscripts (about 8 px) are the victory points; the little pink diamond is a ruby; "15 VP 35" is the spoon. None of that is shown in the first screens (only tip text says "the panel shows what that is worth"). The "next space" is identified only by the gold ring after a draw, and the spiral direction is not obvious on day 1 (1 sits near the middle, 2, 3, 4 wind outward).
   Shots: `cf/05-guided-2.png`, `cf/13-draw5.png`, `cf/16-draw8.png`.
   Fix: add a small legend strip under the board on the first game (coin number / VP / ruby / spoon), make the VP superscripts at least 11 px, and draw a faint arrow or numbered path from space 1 outward. Mark the next space to land on before the first chip (the gold ring exists only after the first draw).

8. **The shop resets its scroll after every click.**
   After picking a chip low in the list the stall list jumps back to the top (scrollTop 700 -> 0, measured). Picking two chips from different stalls means scrolling down twice. Prices (4 / 8 / 14) are bare numbers under a chip with no coin icon, and "Opens day 2/3" stalls look like disabled buttons.
   Shots: `cf/19-shop-a.png`, `cf/20-shop-b.png`, `cf/21-cart.png`.
   Fix: keep scrollTop across re-renders, add a small coin icon to each price, and keep the cart bar sticky (it already is) with a short "pick 1-2 different colours" hint.

9. **Last-day "Spilled Brew" and "Swap Stall" choices are meaningless or confusing.**
   On day 9 the report asks me to take a 2-chip from a neighbour's spilled brew, but there is no day 10, so the chip can never be drawn; the +VP column shows +0 for everyone on that screen, then jumps (+7, +8) after the choice. On day 1 "Rat Bounty" offers "score 1 point per rat tail you trail by (you trail by 0)".
   Shots: `cf/60-spilled.png`, `cf/vs3-rs70.png`.
   Fix: auto-skip a chip reward on day 9 (or turn it into 1 VP), and exclude fortunes that cannot matter (Rat Bounty on day 1) from the draw on that day.

10. **Setup nudges new players past the guided game.**
    The big green button is "Start the fair" (3 makers, Beginner set); "Guided first game" is a small tile below it, next to "Hot-seat". Table size defaults to 3 while the guided game is 2. The "Configure" panel has two "Done" buttons and a floating one that overlaps the Tamsin card.
    Shots: `cf/02-setup.png`, `cf/03-config.png`.
    Fix: on first launch make "Guided first game" the green primary button and move "Start the fair" down; collapse the second "Done".

11. **Header icons have no text on phones.** Scores / Log / Cards / Rules / Menu are five identical-looking outline icons at 390 and 375 wide (labels appear on desktop). "Cards" vs "Rules" vs "Log" are easy to confuse.
    Shots: `cf/24-day2.png`, `cf/90-s553-refd.png` vs `cf/74-D-draw2.png`.
    Fix: label the icons (tiny caption below) or show a tooltip on first game.

12. **Day report + shop + rubies is one tall modal that changes size three times.**
    It is clear and well written (table, plain-English log, stalls, rubies), but it re-renders as shop -> rubies -> "On to day N", changing height and position each step. "Decide first" is a disabled green button that looks tappable, and "droplet step" is jargon until you learn the droplet is your start marker. The end screen leaks the winner in the dock behind the final report ("Odo wins the fair ...") before you tap "See the final scores".
    Shots: `cf/18-after-stop.png`, `cf/22-day2-start.png`, `cf/23-rubies-chosen.png`, `cf/g1-rs203.png`.
    Fix: fixed-height modal with the three steps as tabs/steps; rename to "Spend 2 rubies: start 1 space further on"; hide the dock text while the final modal is open.

13. **Hot-seat repeats the same report for each player.**
    Pass screens are clear ("Pass the device to Odo", `cf/80-hot-1.png`) and keep bags hidden. But after each day each player sees the whole report + shop in turn, with the "You" row relabelled each time, so a 3-player table sees the same table 3 times and each purchase is announced in the log before the next player shops.
    Shot: `cf/sheet-hot.png`.
    Fix: show the report once on the shared screen, then pass the device only for the private shop/ruby choice; hide others' purchases until all have decided.

14. **Landscape (844x390) works but is tight.** The board is about 340 px tall and the tip fills the whole right panel (the Draw button is under it); the risk box and buttons are fine once tips are gone.
    Shots: `cf/72-L-g.png`, `cf/74-L-draw2.png`.
    Fix: nothing urgent; apply fix 2.

15. **Small wording items.**
    "(0 of 9)" next to the percentage is unexplained (chips that would explode / chips in bag); "Flask: put the last white chip back" looks like a primary action (I tapped it by accident in the first test and lost my only white chip); the flask button is the same size as Draw. Computer-maker status says "ready" for Odo before anyone has drawn on day 1 (`cf/31-fortune-pedlar.png`).
    Fix: explain "(0 of 9 chips would explode)", style the flask as a small secondary link.

## Computer players
They looked sensible: Odo (easy) stops early at 7-10 coins and buys cheap 1-chips, Tamsin (hard) pushes to 17-22 and, when she exploded on day 3 and 9, took points or shopped sensibly. Nothing odd. The AI draws while you think, and its status line ("stopped - 7") is a good tell.

## Cauldron track, shop, report: could I follow them?
- Track: after the first draw yes (gold ring = scoring space, chip lands on the space before it), before that no (item 7).
- Shop: yes after reading "How it works" once; prices unlabeled (item 8).
- Day report: yes, the plain-English log is the best part (items 3, 12 aside).
- Why I exploded / won: yes; the "Your cauldron exploded: take 3 victory points or go shopping with 14 coins" panel and the final table with D1-D9 columns are clear. A one-line "you exploded because white total 9 > 7" in the report would help.

## The 5 things that most need fixing
1. Keep the explosion risk and the current space's value always visible above Draw/Stop (item 1).
2. Make tips non-blocking and show them at the right moment (items 2, 3).
3. Fix fortune/choice lists so every option is visible without scrolling (item 4).
4. Make the white limit consistent when a fortune changes it (item 5).
5. Teach the spiral: legend, bigger VP numbers, path arrow (item 7), and keep shop scroll position (item 8).

## The 3 best things
1. The look and feel: the painted cauldron, chips, characters and confetti are charming, and desktop (`cf/74-D-draw2.png`) lays everything out perfectly.
2. The risk box with a colored bar and plain percentage ("Next chip explodes it: 67%") is an excellent push-your-luck tool, and the "Boom!" choice (points or shop) is very clear.
3. The day report's plain-English log, the rubies/droplet step and the final D1-D9 score table make every outcome explainable; the hot-seat pass screen is clean.
