# Doorkick Dungeon: playable pass (W389)

Bar: a first-time player on a phone (390x763) knows what to do within a minute, and can finish the tutorial, a Quick game and Story stage 1.
This is an old game with painted art, 3D heroes and music: all of it is kept; the pass is about turn flow, readability and the tutorial.

## First-minute critique: the 10 worst problems, and what was done

| # | Problem (390x763, newcomer's eyes) | Fix | State |
|---|---|---|---|
| 1 | Quick game: the Start button was far below the fold, behind three option groups (heroes, skill, expansions). A newcomer had to scroll to find it. | Start is now the first thing under "Quick game" ("Start: you vs the computer"); options follow. | fixed |
| 2 | Title: "Story mode: 10 chapters, 3 bosses" wrapped onto the button's border; the three "who plays" buttons had cramped, clipped labels. | One short label plus a 14px caption line; segmented buttons 14px, 48px high. | fixed |
| 3 | A rival's turn was a bare "Tansy's turn…" with nothing explaining what happened. | Every step of a rival's turn gets a caption ("Grub puts on Everything Halberd.") held about 1 s per step (tap it to skip the wait); the computer waits for each caption. | fixed |
| 4 | No clear announcement of whose turn it is (only a tiny status line in the top bar). | A big banner "Your turn" / "<Rival>'s turn" over the table at each turn change. | fixed |
| 5 | Level changes were silent: a number in a badge changed. | A score pop ("You +1 level" / "Grub -1 level") with the plain reason from the log. | fixed |
| 6 | The fanned hand clipped every card name but the top one, so the player could not tell what they held. | "My cards (n)" pill above the hand opens a big two-column list of the whole hand; tap a card to read and play it. | fixed |
| 7 | Charity: "drag extras to discard" with no visible target on a phone, and the bot (and a newcomer) got stuck. | Plain 2-step instruction (tap a card, then the rival or the discard pile) and an always-visible button "Give away N extra cards for me". | fixed |
| 8 | Tutorial stopped at a paused "You know the rules" card, never reached a scoring or a result screen, and had no chapters. | Four chapters (pill under the progress bar) and a real ending: a time skip to level 9, a kick, a fight, level 10 by a monster kill, the real result screen, then the end card. | fixed (see TUTORIAL-COVERAGE.md for what is still not taught) |
| 9 | The Rules drawer opened with a wall of text. | It opens with "How a turn works" in 5 short lines, then the full rules. | fixed |
| 10 | Rival chips on a phone cut off the gear and card counts at the screen edge ("0 g"), with 11px labels. | Chips show name, level badge and strength (13px); gear and cards are in the Rivals drawer. | fixed |

Also found on the way: the turn caption stayed on top of the result screen (fixed: hidden when the game is won).

## Gates (390x763 unless noted)
- `node tutor-end.js 390x763,1440x860`: the guided game is played from fresh storage by tapping each spotlit element's centre; elementFromPoint at each centre is not covered; 26 of 26 steps shown; ends with a real win and the result screen.
- `node play-ui.js quick|story`: a Quick game and Story stage 1 played to the result screen using only visible, uncovered UI taps.
- Not done / honest notes: see the bottom of this file.
