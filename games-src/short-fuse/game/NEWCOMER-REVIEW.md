# Short Fuse: first-time-player review

Frozen build `bb/review/shortfuse.html`. Played as a newcomer through Playwright (screenshots plus dock text).
- Job 1 (guided) twice, both defused (13 turns each).
- Job 9 defused (27 turns).
- Job 10 (timed) lost on the fuse in 14 turns, then partly replayed.
- 1366x768 throughout; 390x844 for the start screen, the first turns and the dock toggle.
- No page errors. A few screenshots caught the 3D canvas blank for a moment (software GL), which is probably a test artifact.

## What works well
- Coach cards teach in the right order: stand, opening token, dual cut, hit, "What we know", solo cut.
- The three-chip dual cut stepper (1 Point, 2 Say a value, 3 Snip), plus "Suggested move" with a reason ("Certain: ..." or "Best odds: 55%") and a "Set it up for me" button.
- Plain result banners (SNIP!, BUZZ!, DEFUSED!), and a BOOM card with a "Why it failed" explanation and stats.
- Job card ("Right now: Order 7 → 9 → 1, next in the order: 7"), Gear unlock text ("LOCKED: CUT TWO 7S"), the Log and the Rules ("How a round goes") are all clear.
- Mission board: locked jobs can still be picked, as promised. Next-job and play-again buttons are there at the end.

## Issues
1. **Job 1 coach: "Hide the guide" sits next to "Got it" (blocker for learning).** I mis-hit it on the first card. The coach never came back, so I skipped the whole teaching sequence with no way to see it again. The same thing happens on every card.
   - Fix: make "Hide the guide" a small text link away from "Got it", and ask "Turn off tips? You can turn them back on in Menu".
   - Fix: when the guide is hidden mid-lesson, offer "Resume lesson" in the dock.
   - **Status: Fixed: "Turn off tips" is a small link under the card with an inline confirm ("You can turn them back on in Menu"); a "Resume lesson" button appears in the dock while the lesson is off.**
2. **The jargon is never defined where it first appears (major).** The opening step says "info token", "Tag", "foreman" (the star), "stand" and "Twin Probe". "The fuse is lit." appears in the log as if it were an event.
   - Fix: one line under the opening step ("a token in front of a wire tells everyone its number") and a tooltip on the star ("Foreman starts and has two stands"). Drop or rename "The fuse is lit".
   - **Status: Fixed: info token, tag, foreman (star tooltip), stand and fuse are defined in the coach cards and in the opening question; Glossary in the Rules drawer; "The fuse is lit" now reads "Round 1 begins: the foreman takes the first turn".**
3. **Job 1 says "no equipment" but Twin Probe is offered (major).** The mission card says "Training. Blue wires 1 to 6 only, no equipment". The dock shows a Twin Probe button every turn, and Gear lists three Twin Probes marked "TOOL READY". I could not tell whether I was supposed to use it. Nothing explains that it is a personal tool, or what "point at 2 wires" means.
   - Fix: hide personal tools in job 1, or have the coach introduce it ("Your tool: use once per job").
   - **Status: Fixed: job 1 offers no gear or personal tools (dock, suggestions, Gear drawer says there is none).**
4. **The coach lags behind the game (major).** "Your stand" and "The opening token" appeared after I had already placed the token and after Plum had solo-cut 4×3. The cards explain things that have already happened. The "solo cut" card says "Look for the solo button", but that button was below the fold (see 5).
   - Fix: queue the cards so the lesson is shown before the matching prompt, and keep the dock from advancing until the card is dismissed.
   - **Status: Fixed: computers wait while a coach card is pending, cards are queued (hello, stand, opening token, dual cut...), the opening card is auto-skipped once the opening is over, and the solo card comes after the dual-cut cards with Solo cut at the top of the dock.**
5. **The dock is taller than the screen on turns (major).** At 1366x768 the coach, the last-result banner and the Dual cut box push "Other actions" (Solo cut) and "Suggested move" off the bottom. There is no visible scroll cue. At times a big empty gap sits above the Dual cut box while the banner animates.
   - Fix: put the suggestion and solo button first, shrink the banner after about 2 seconds, and auto-scroll to the actions.
   - **Status: Fixed: Suggested move sits above the actions, Solo cut is first, the banner shrinks after about 3 s, the dock scrolls to the top each turn, the Snip button is sticky.**
6. **The computers' turns go by too fast to follow (major).** After my Snip, a few seconds later it was my turn again and the banner showed only the last computer move. I could not tell what my own Snip did without opening the Log. The log has no "you" highlight.
   - Fix: pause on my result (a "Continue" or a 2-second hold), and show "Amber (you) pointed at Teal's E and said 3: HIT" in the banner.
   - **Status: Fixed: your own result stays on screen ("You (Amber) just played: BUZZ! Amber points at ...") until you press Continue (guided) or your next turn; computers wait for it (guided: until Continue; otherwise 2.8 s) and their moves show as a small "Then:" line.**
7. **Tag-slot labels are cryptic (major).** After a miss I had to choose "Tag slot 9 / Tag slot 10", with no wire letters or stand shown. Wire letters on stands are tiny, and in job 9 "wire G" is missing from the Tag list with no mention that it is a red wire. The two-stand list is 24 buttons long ("Tag your 3 (your wire A (stand 2))").
   - Fix: label "Tag your wire C (3), stand 2", group the buttons by stand, and say "your red wire G can't be tagged".
   - **Status: Fixed: opening and tag choices read "Tag your wire C (3), stand 2", grouped by stand; red wires that cannot be tagged are named.**
8. **Jobs other than job 1 start with no briefing (major).** Job 9 opens straight onto "Place your opening info token". The order cards (7 → 9 → 1), the red wire in my hand, the three gear cards and the "2 yellow / 1 red" chip are only explained in the Job and Gear drawers. The coach is off. Nothing says to look there.
   - Fix: show a one-screen "Job briefing" card with a Continue button when a job starts (its rule in one sentence plus "New this job: ...").
   - **Status: Fixed: every job opens with a Job briefing card (story, the job rule, "New this job" chips, wires, fuse, gear) and a Continue button.**
9. **Setup screen defaults are inconsistent (minor).** Job 1 defaults to Normal computers with suggestions on. Jobs 9 and 10 default to Easy with suggestions off. The toggle reads '"What we know" suggestions off', so I could not tell if it shows state or action. In the in-game Menu it is called "Suggested move", a third name for the same thing (Know / What we know / Suggested move).
   - Fix: one name, an On/Off switch, and the same defaults.
   - **Status: Fixed: one name ("Suggested move") with an On/Off switch in setup and Menu; same defaults for every job (suggestions on, Normal); the guided game no longer overwrites the saved setup.**
10. **"Start job N" is below the fold on the setup screen for jobs 9 and 10 at 1366x768 (minor).** It needs scrolling, and the Guided-first-game button and the "Start job 1" button look like two different things.
    - Fix: make "Start" a sticky footer, or merge the two entry paths.
   - **Status: Fixed: the Start button is a sticky footer on the setup screen.**
11. **"What we know" is empty in the middle of a game (minor).** The "Most likely" column was blank, and the panel shows only "cut: N" rows in late game. The header says "checked against 80 possible deals", which is meaningless to a newcomer.
    - Fix: show a one-line legend, show rows for uncut wires in play, and drop the "80 deals" wording.
   - **Status: Fixed: a legend explains the columns, "80 deals" wording removed, cut wires collapsed into one line, "no favourite yet" instead of a blank.**
12. **Computers (Easy) burn the fuse (minor).** They caused 2 of 3 misses in job 10, and the job ended in BOOM at turn 14. The BOOM reason advice ("keep Rewind for the last step") mentions gear that was not explained.
    - Fix: make Easy more careful, and explain Rewind on the loss card.
   - **Status: Partly fixed (UI side): the loss card now explains Rewind / Twin Probe. Making Easy computers more careful needs a change in src/ai.js, which this pass was not allowed to touch.**
13. **Timed job 10: the claim UI is confusing (minor).** The header says "Your turn, Amber" while the body says "Amber decides..." and "Claim the next turn". The clock ran during the opening tokens (15:00 down to 14:16 at the first screenshot). The rules ("never two in a row") are hard to read. Nothing warns when time is low.
    - Fix: title it "Who goes next? Claim it!", start the clock after the openers, and add a low-time cue.
   - **Status: Fixed: title "Who goes next? Claim it!", plain-words claim rule, the clock only runs after the opening tokens (verified), a "Hurry: under 30 seconds!" pill.**
14. **Table readability (minor).** Wire numbers on the opponent stands are unreadable from the angled camera. Cut wires drop into the stand, so uncut ones float and are hard to tell apart. The track and cards on the mat are tiny (e.g. the red-wire marker on the track). A "Gear" mat of three cards has no legend.
    - Fix: add hover or tap labels, a zoom, and brighter "still live" highlighting.
   - **Status: Fixed: hover/tap shows a label chip ("Teal's wire C (cut)"), a Zoom button cycles the camera over each crewmate stand, the Gear drawer has a legend; the phone board uses the tall layout. (Brighter "still live" wire styling is inside the kit and was not changed.)**
15. **Rules and Log wording (minor).** "Amber reveals 1 red wire and is done" appeared with no explanation (the rule is only in Rules). The log says "validation token 3 goes on the track" without saying why it matters.
    - Fix: add "(a player holding only reds reveals them)" and "(value 3 is finished)" as short hints.
   - **Status: Fixed: log and banner add "(a player who holds only red wires shows them and is finished)" and "(every wire of value N is cut, so N is finished)".**
16. **Mobile 390x844 (major).** The Menu button in the top bar is clipped at the right edge, and the bar's icons have no labels. The table is a small strip above a bottom sheet that covers about 60% of the screen. Numbers are unreadable and the glowing wires cannot be tapped, so a player has to use the dock buttons. The sheet's toggle (an unlabelled up-down arrow) expands it to nearly full screen, which hides the table completely. "Set it up for me" and Solo cut sit below the fold again, and the result banner is scrolled out of view.
    - Fix: make the bar fit (7 icons at 44px, or an overflow menu), add labels or tooltips, add a "peek" sheet height with a sticky action bar, and show the banner above the sheet.
   - **Status: Fixed: bar fits at 390 px with 7 labelled buttons, board uses the tall layout, dock toggle is labelled Expand / Show table / Show panel, decision buttons are first and compact, the Snip button is sticky.**
17. **Opening phase when a computer is foreman (minor).** The dock title read "Plum (computer)" with "Plum is thinking... Plum is answering a question" while the welcome card sat above it. It looked stalled.
    - Fix: "Plum is choosing an opening token", with a short delay.

   - **Status: Fixed: the dock reads "Plum is choosing an opening info token" (and similar for other questions).**

## Counts
Blocker 1, major 8 (items 2-8 and 16), minor 8.
