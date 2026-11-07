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
| 6 | The fanned hand clipped every card name but the top one (names at 7px), so the player could not tell what they held. | On a phone the hand is now a strip of readable chips (3 visible, scroll for more): name 13px on a type-coloured band, art, big bonus or level badge. A "My cards (n)" pill opens the whole hand as a big list. | fixed |
| 7 | Charity: "drag extras to discard" with no visible target on a phone, and the bot (and a newcomer) got stuck. | Plain 2-step instruction (tap a card, then the rival or the discard pile) and an always-visible button "Give away N extra cards for me". | fixed |
| 8 | Tutorial stopped at a paused "You know the rules" card, never reached a scoring or a result screen, and had no chapters. | Four chapters (pill under the progress bar) and a real ending: a time skip to level 9, a kick, a fight, level 10 by a monster kill, the real result screen, then the end card. | fixed (see TUTORIAL-COVERAGE.md for what is still not taught) |
| 9 | The Rules drawer opened with a wall of text. | It opens with "How a turn works" in 5 short lines, then the full rules. | fixed |
| 10 | Rival chips on a phone cut off the gear and card counts at the screen edge ("0 g"), with 11px labels. | Chips show name, level badge and strength (13px); gear and cards are in the Rivals drawer. | fixed |

Also found on the way: the turn caption stayed on top of the result screen (fixed: hidden when the game is won).

## Also fixed on the way
- The turn caption stayed on top of the result screen (hidden when the game is won).
- Story map header on phones: the title "The Golden Boot" collapsed to one letter per line and the act banners overflowed (override in skin.css; the shared kit is untouched).
- Stretched pictures (table, hand tray, card backs, rival chips, dock): fit by cover instead of 100% 100%.
- Menu text over parchment and pile labels now meet 4.5:1.
- Rules sheet gap: items in play can be given to a rival outside fights (new `giveitem` act, 3 rules-test cases). Still not built: trading with something in return (gifts only), the optional "listen at the door" and shared-victory rules.

## Gates (390x763 unless noted)
- `node tutor-end.js 390x763,1440x860`: PASS both sizes. The guided game is played from fresh storage by tapping each spotlit element's centre; elementFromPoint at each centre is not covered by the kit; 26 of 26 steps shown; ends with a real win (level 10 by a monster kill), the result screen and the end card.
- `node play-ui.js quick` and `node play-ui.js story`: a Quick game and Story stage 1 played to the result screen with only visible, uncovered UI taps (speed 4 set as the player's own setting). Both PASS (see the report line for the last run).
- `node rules-test.js`: 49 passed, 0 failed (3 new). The harness needed a matchMedia stub and pretendToBeVisual to run in this environment.
- `build-all.py --quick doorkick-dungeon`: PASS (16 scenarios, phone). Full build: see report.
- ui-audit (rules A-F, staged build, no deploy): phone-s A0 B0 C0 D0 E0 F0. phone A0 B1 C0 D0 E3 F0: B1 is the "Test speed" menu button contrast; E3 are the dock buttons Auto/Kick!/Sell reported dead in the audit's tap order, but each one works when tapped alone (66 to 222 DOM mutations, checked by hand), so this looks like the audit's stale tap positions after the first tap changes the state; not fixed. pc A57 B15 C16: the 16px minimum on a 1366-wide screen is not met by the old card fan, the shared campaign map labels (13px) or the shared tutorial bubble (13.5px); a PC pass (cover fits, 16px help text, chip names) was added at the end but only measured by the final audit if listed in the report.

## Not done (honest)
- The tutorial chapters are labelled but not separately resumable (the shared kit restarts from step 1); many rules are not taught (TUTORIAL-COVERAGE.md).
- Rival turns are paced one step per ~1 s with captions, but there is no per-step move animation of cards flying between hands (the existing door and fight animations remain).
- PC (1366x768) audit counts above; phone is the target.
- Commit 1 on this branch carries the session's attribution lines by mistake (the brief and CLAUDE.md say none). It was pushed before I noticed, and rewriting it would need a force-push, so it is left for the owner to decide.
