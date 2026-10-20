# Lantern Dive: newcomer review

Frozen build `freeze/lantern-dive.html`, played with Playwright and real touch taps.

- **Viewports:** iPhone 390x763 (main), 375x553, 844x390 landscape, and 1366x768 desktop.
- **Games played:** the guided dive, vs-computer dives at 3 and 4 players (dives 2, 3, 5, 6, 7), a hot-seat game (dive 6, 4 people), and a flare-passing check.
- **Screenshots:** `/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/review-ld/` (called `SS/` below).
- **How I played:** I tapped like a newcomer and used the Hint button. I did not plan hands. Some losses are therefore my naive play. Each item below says whether the game or I caused it.

## Rules check

I found no clear rules mistake. These all matched the rules drawer and the notes:

- Trick counts were 13 / 10 / 8 for 3 / 4 / 5 divers.
- The Commander cannot take "More than Commander" (`SS/land-03.png`).
- The dive ends the moment every job is done (guided dive, after trick 4).
- A failed job ends the attempt at once.
- Following suit and Lantern trumping behaved correctly.

The doubtful points are about explanation, not rules: items 1 and 2.

## Problems, worst first

1. **A lost dive never says why.**
   - Screenshots: `SS/g1-result1.png`, `SS/v4a-result1.png`, `SS/s375-result1.png`, `SS/hot-result1.png`.
   - What happened: the result card gives one sentence ("A job cannot be done any more: Never lead a trick with Coral or Kelp."). It does not say which trick, which card or which diver caused it.
   - In `s375-result1` all three jobs show a cross, though only one is named as the cause. In `v4a-result1` the "Fewer than Commander" job also shows a cross. I could not tell whether those jobs were really dead or just not reached.
   - A newcomer cannot learn from a loss.
   - Fix:
     - Add a "What happened" line, e.g. "Trick 9: Nerea won with Kelp 4, so she had to lead her last card, a Kelp."
     - Offer a button that replays or highlights that trick.
     - Show jobs that were not individually broken as grey ("not reached"), not as a red cross.

2. **The guided dive can be lost on trick 2 by a computer teammate.**
   - Screenshots: `SS/g1-17.png`, `SS/g1-result1.png`.
   - What happened: I was Commander (the only Lantern 4 holder) with the job "None of first four". Nerea won trick 1 and led Lantern 1, Bram followed with Lantern 3, and my only Lantern was L4, so I was forced to win and failed my job.
   - The computer teammates know my job and know I hold L4, so the lead was avoidable.
   - Losing the tutorial dive after two cards is the worst first impression in the game.
   - Fix:
     - In the guided dive, pick a deal and jobs that cannot be lost by forcing.
     - Make the AI avoid forcing a known job-holder (public job plus Commander) into a loss when it has another card.
     - Only offer "Try again" with an explanation after the guided dive.

3. **The screen does not warn you when every legal card loses.**
   - Screenshots: `SS/g1-17.png`, `SS/v3a-23.png`.
   - What happened: the "risk: breaks ..." text appears only after pressing Hint. The normal prompt just says "Your turn: play a card."
   - When you are forced to win (Lantern led, or you are last and every card wins) the game says nothing until the dive fails.
   - Fix: when all playable cards break one of your jobs, say so in the prompt line: "Every card you can play wins this trick and breaks 'None of first four'."

4. **Small phone (375x553) is broken in the job and play screens.**
   - Screenshots: `SS/s375-01.png`, `SS/s375-12.png`, `SS/s375-33.png`, `SS/s375-45.png`.
   - What happened:
     - The job cards on the table are clipped. "Worth 3" is cut in half and the job title row is hidden behind the cards.
     - The felt shrinks to about 220 px.
     - The "Last trick" and "Won N" buttons sit on top of my own played card.
     - The title text "Jobs on the table" and the trick label overlap the slots.
     - The result card covers the top bar.
   - Fix: make the felt a minimum height. Move "Last trick" and "Won" into the dock or header on short screens. Let the job pool scroll or shrink the cards. Use a smaller opponent job chip when height is below 600.

5. **Landscape (844x390): played cards are overlapped.**
   - Screenshot: `SS/land-20.png`.
   - What happened: the top slot collides with the "Trick 2 of 10" title, and the right-hand card (a Lantern) is half covered by the "Last trick" and "Won 0" buttons. Everything else in landscape is clean.
   - Fix: reserve the bottom-right corner of the felt, or put those two buttons in the dock.

6. **Detail pop-ups are clipped at the bottom of the screen and do not scroll.**
   - Screenshots: `SS/pop-1-jobchip.png`, `SS/pop-3-last.png`, `SS/pop-scrolled.png`.
   - What happened:
     - Tapping a job chip shows the title, the rule and "Taken by". "Worth", "State: Open" and the explanation line are cut off at the screen edge.
     - "Last trick" shows only the top of four cards. The "You won it with Kelp 9" line is off screen.
     - The sheet is 137 px high and has no scroll.
   - Fix: let the sheet grow up to about 60% of the screen height and scroll inside. Or use a centred modal.

7. **Unexplained symbols and jargon.**
   - Screenshots: `SS/g2-sig3.png`, `SS/e390-play0.png`, `SS/e390-cfg-a.png`, `SS/e390-drawer-jobd.png`.
   - What I could not understand:
     - The green circle next to every name (it is the signal token).
     - The red crossed circle (the token is used up).
     - The little ▲ / ▽ on shown cards.
     - "Worth 2 ●●". The dots are difficulty points and nothing says the team needs a total. For example, dive 5 needs 5 and there is no "need 5" display.
     - The dive list labels "narc", "murky" and "clock". The drawer says "Signalling: normal."
     - "Extra attempt" for the flare.
     - On phones the four top-bar buttons are icon-only: a sheet of paper (Jobs), a book (Log), a question mark (Rules) and a menu.
   - Fix:
     - Add a first-time legend, or tap-to-explain on the token.
     - Add short labels under the icons.
     - Write "Needs 5 points: 2 + 3" in the job header.
     - Spell out "narcosis", "murky water" and "timed" in the list.

8. **The signal screen contradicts itself and is hard to read.**
   - Screenshots: `SS/g2-sig1.png`, `SS/g2-sig3.png`.
   - What happened:
     - The text says "The green-ringed cards can be shown", but the rings are gold.
     - Each ring spills onto the neighbouring overlapped card.
     - After I showed Coral 3 as lowest, the token sits at the seam of cards 3 and 4. It is unclear which card was shown.
   - Fix: use green rings, inset them and keep them on one card. Lift the shown card out of the fan and write "lowest" on the token.

9. **Cards in a 13-card hand are very hard to tap on a phone.**
   - Screenshots: `SS/g1-12.png`, `SS/g1-01.png`.
   - What happened:
     - Each overlapped card shows only about 24 css px.
     - A tap in the middle of a card landed on the neighbour. Playwright reported "intercepts pointer events". Only a tap on the left edge worked.
     - The suit icon is half hidden, so you identify the suit by colour alone.
   - Fix: use two rows, or a horizontally scrolling hand of full-width cards. Or magnify the card under the finger, as many card apps do.

10. **The table layout jumps between steps.**
    - Screenshots: `SS/v3a-01.png` against `SS/v3a-23.png`, and `SS/g1-06.png` against `SS/g1-08.png`.
    - What happened: when job chips appear under the opponents, the felt and the "You" row move down by about 95 px. The dock height also changes between phases. Buttons and cards move under the finger.
    - Fix: reserve the chip row height from the start, or put the chips in a fixed strip.

11. **Text clipped inside the opponent panels at 390 wide (3 opponents).**
    - Screenshots: `SS/v4a-10.png`, `SS/hot-result1.png`, `SS/pop-1-jobchip.png`.
    - What happened: "cards 9 tric..." and "Fewer than Commande..." are cut off. At the end of a dive, "cards 0 tricks N" is also cut off.
    - Fix: allow two lines, or abbreviate to "9 cards, 2 tricks".

12. **Grammar and wording bugs.**
    - "You leads the trick" (`SS/g1-12.png`, `SS/v3a-23.png`).
    - "You holds Lantern 4 and is the Commander" (`SS/e390-drawer-logd.png`).
    - "You (you) most likely wins this trick" (Hint, `s375.out` and `desk.out`).
    - The hot-seat hint ends "finishes: Win exactly two Kelp cards.. finishes: ..." with a double period (`hot.out` #327).
    - The vote buttons say "You (me)" and "Diver 1 (me)".
    - Fix: use "You lead" and "You hold", and make the hint use "you" correctly. Remove the double period.

13. **Flare passing is confusing.**
    - Screenshots: `SS/flare-1.png`, `SS/flare-3.png`, `SS/flare-4.png`.
    - What happened:
      - After the pass, the card I received is not marked. My hand just changed.
      - The row of diver status chips is cut off behind the "Pass Coral 4" button.
      - "Pass left" and "Pass right" are both primary green.
      - Only the Commander is asked about the flare, and the screen never says that others are waiting on that choice.
    - Fix: highlight the received card for one trick. Move the status chips above the button. Make "No flare" a clear equal option.

14. **The hot-seat vote screen hides its own explanation.**
    - Screenshot: `SS/hot-03.png`.
    - What happened: "No talk about cards. A tie goes to the Commander's vote." is cut off behind the vote buttons. The "(me)" labels are awkward.
    - Fix: put the explanation above the buttons, or open it as a sheet.

15. **Hot-seat means a lot of hand-overs.**
    - Evidence: `hot.out` (a 10-trick dive had one "Pass the device on" overlay per play, so about 40 per dive), and `SS/hot-01.png`.
    - What happened: the hand-over screen itself is good and hides the hand. But the "A Lantern!" and "Follow the colour" tips pop up again for each new diver.
    - Fix: skip the hand-over when the same person plays twice in a row, and show each tip only once per device.

16. **Setup and menu rough edges.**
    - Screenshots: `SS/02-setup.png`, `SS/e390-cfg-a.png`, `SS/e390-drawer-setd.png`, `SS/01-title.png`.
    - What happened:
      - The summary card says "4 divers" while the "Guided first dive" button says "You and two divers".
      - The summary card is a four-line wall of text.
      - The Configure screen has two "Done" buttons.
      - The Menu shows "Show speed" and "Test speed" (they look like developer tools) and "Graphics (now low)".
      - The title tagline is left-aligned under a centred title.
    - Fix: tidy these. Hide the speed tools. Make the guided button state the team size it will actually use.

17. **The guided dive is very short and ends without a lesson.**
    - Screenshot: `SS/g2-result1.png`.
    - What happened: it was one job worth 1 and ended after trick 4. The win screen says only "Dive complete!" and "Next dive".
    - The last job in a dive is forced on whoever is last, with only a "Take" button and no reason ("you must take the last job").
    - Fix: add a short debrief ("You won because you avoided the first four tricks"). Say why a job is forced.

18. **Card art looks soft on the phone.**
    - Screenshots: `SS/v4a-10.png`, `SS/s375-33.png`.
    - What happened: the hand and trick cards are blurry at 2x because Auto graphics picked "low".
    - Fix: use the sharper art on a 2x phone, or explain the setting.

19. **Desktop (1366x768) has a lot of dead space.**
    - Screenshot: `SS/desk-02.png`.
    - What happened: the felt is mostly empty, and job text is about 11 px.
    - Fix: scale job cards and chips up on wide screens.

## The 5 things that most need fixing

1. Explain every loss: which trick, which card and which diver, and do not show ✗ on jobs that were not individually broken (items 1 and 3).
2. Make the guided dive winnable. Stop the AI forcing a job-holder into a loss, and warn when every legal card breaks a job (items 2 and 3).
3. Fix small and short screens: 375x553 and the landscape corner overlap, including the clipped job cards, felt, "Last trick" and "Won" buttons, and pop-ups (items 4, 5 and 6).
4. Make the hand tappable and the signal clear, with 13 cards, correct ring colour and a clear token (items 8 and 9).
5. Add a legend for tokens, "Worth" dots, jargon and icon-only buttons, and fix layout jumps and clipped text (items 7, 10 and 11).

## The 3 best things

1. **Coaching and the Hint button.**
   - The just-in-time tips explain the Commander, the flare, signals, follow-suit and Lanterns. They appear only when relevant.
   - Hint gives a reason ("Nerea most likely wins this trick", "risk: breaks ...").
   - Tapping a job chip explains it in plain words with "Taken by".
2. **The computer teammates' signals made sense, and you can see them.**
   - Nerea and Sumi each showed a 9 for Bram's "No 9s" job (`SS/pop-scrolled.png`).
   - Nerea showed the Sunstar 6 for Sumi's job (`SS/desk-sig3.png`).
   - Their shown cards appear as mini-cards with ▲ / ▽ under each name.
3. **Landscape and hot-seat polish.**
   - 844x390 is a clean two-pane layout (table left, dock right) with full, un-overlapped hand cards (`SS/land-03.png`).
   - The hot-seat hand-over screen reliably hides cards (`SS/hot-01.png`).
   - Flare passing, voting and hot-seat all completed without errors. No console errors in any run.
