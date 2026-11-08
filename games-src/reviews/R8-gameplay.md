# R8 strict gameplay re-review (8 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its branch with its own build.py and served next to its
games/<slug> media folder. It was played by touch only (Playwright, hasTouch, isMobile, `touchscreen.tap` after checking the element
under the finger) at 390x844 and 375x667. Earlier findings come from review/R1-gameplay (short-fuse) and review/R3-gameplay
(cauldron-fair, shipwreck-isle). Rules were checked against the published rulebooks; notes are kept locally only. Screenshots are in
games-src/reviews/R8-shots/.

| Game | Before | R8 total | Verdict | Rows below 7 |
|---|---|---|---|---|
| short-fuse | 6.8, 7.3 | 7.4 | FAIL | Phone play 6, AI and pacing 6 |
| cauldron-fair | 7.0, 7.1 | 7.4 | FAIL | Turn clarity 6, Phone play 6 |
| shipwreck-isle | 6.4, 6.4 | 6.5 | FAIL | Tutorial, Turn clarity, Phone play, AI and pacing, Feel (all 6) |

No stopper in any game: 0 page errors, 0 stuck states and 0 dead taps in every full game.

## short-fuse (branch shelf/W488-short-fuse-sprites @ 62d3e776)
I played "Learn to play" by touch to the end four times, twice at 390x844 and twice at 375x667. Each run had 22 steps: 12 were do-it taps and 10 were Next-only. Each run took 45 s and ended defused, then offered "Play job 1". I played 12 real jobs from the title by touch with default settings (3 crew, Normal), six at each size. These covered jobs 1 to 4, mostly chained with "Next job", and I won 8 and lost 4. Job 1 was won 5 of 5. Job 1 took 25 to 31 s and 6 to 8 player taps. Jobs 2 to 4 took 33 to 59 s and 10 to 17 taps. From my last cut to my next turn I waited 4 to 7 s, about 5 s on average with two computer players. I saw 0 page errors, 0 console errors, 0 stuck states and 0 dead taps: every tap centre hit its own element. The two-stand foreman hand comes up by default in a 3-player job, and I inspected it at both sizes in jobs 1 and 4.

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Dual cut, solo cut, yellow, red, reveal reds, info tokens, validation, equipment unlocks and the dial set by player count all match the rulebook. The setup splits stands correctly (the foreman has two at 3 players). One house rule is added: no cut in four rounds explodes the bomb. It is disclosed in Rules. |
| 2 | Tutorial teaches | 8 | 22 one-line steps of 12 words or fewer. The Twin Probe is now practised, ending in a real miss with a token. Tapping red is a do-step, but the tap changes nothing, and the reveal of reds happens automatically on the last line. 10 of the 22 steps are still Next-only. There is no "learn later" list, and it hands over to job 1. |
| 3 | First 10 seconds | 8 | One-line pitch, a big Play button, and a goal card with 3 bullets plus an icon legend (star = foreman, case = Twin Probe), then the board. |
| 4 | Turn clarity | 7 | The status bar shows "Your turn / 1 action / or play gear" and a next-tap hint. The two stands are framed and labelled "Stand 1 / Stand 2", and a stand that wraps shows a return arrow. Tapping a name plate explains it. Still not explained on the board: the scissors badges on your wires, and the tiny locked gear cards in the top left with no names. At 375 the "Stand 1" label sits on top of the first wire's number. |
| 5 | Phone play | 6 | From job 4 on, crew wires are 25x33 px at 375 and your own wires 30x40. At 390 they are 41x53 and 32x42. Header icons are 40x44 and name plates are 26 px tall. All text is 14 px or more, there is no sideways scrolling, and the board comes first. A cut wire no longer leaves its stand. |
| 6 | AI and pacing | 6 | Computer turns are sensible (they use tokens, solo cuts, the probe and gear) and quick, about 2.5 s each. Job 1 is still only 25 to 31 s and 6 to 8 taps. A move checklist on the result card does not make it longer. In jobs 2 to 4 my screen-reading player won 3 of 7. |
| 7 | Feel | 7 | SNIP stamp, buzz and shake on a miss, a +2 badge, validation checks filling in, and an art-led result card. Each action gets clear feedback. |
| 8 | Bugs | 9 | 12 jobs and 4 tutorial runs with 0 errors, 0 stuck states and 0 dead taps. Every job reached its result card. |
| | **Total** | **7.4** | |
| | **Verdict** | **FAIL** | Rows 5 and 6 are below 7: wire targets far under 44 px from job 4, and job 1 is still a 25 to 30 s, 6 to 8 tap game. |

### Earlier findings (R1)
- Foreman's 12-wire hand drawn as two plain rows (row 4): FIXED. Each stand is a framed rack with a "Stand 1 / Stand 2" label and a gap between them. A stand that wraps (job 4, 13 wires) shows a yellow return arrow. The name-plate tip says each stand is sorted on its own. A small side effect: at 375 the label overlaps the first wire's number. Shots: games-src/reviews/R8-shots/fuse-meas-375-j4.jpg, games-src/reviews/R8-shots/fuse-probe-live-375.jpg
- Star and case icons on name plates unexplained (row 4): FIXED. The goal card has a legend, and tapping a plate shows "Foreman: takes the first turn / Twin Probe: a once-per-job tool". Shot: games-src/reviews/R8-shots/fuse-plate-tip-375.jpg
- Twin Probe Next-only in the tutorial (row 2): FIXED. Steps 11 to 14 are taps: the probe, two of Plum's wires, then saying 2. The miss burns a step and places a token. Shot: games-src/reviews/R8-shots/fuse-tut-390-probe.jpg
- Red wire Next-only in the tutorial (row 2): PARTLY FIXED. Step 20 asks you to tap your own red, but the tap does nothing in the game. The real rule (a hand of only reds reveals itself) is only told on the last step, and the game does it for you. Shot: games-src/reviews/R8-shots/fuse-tut-390-red.jpg
- At 375 a cut wire flies over the next stand (row 5): FIXED. Over 3 jobs at 375, a per-frame monitor found no cut tile more than 8 px outside its stand. Only the intended 8 to 11 px lift on a selected or aimed tile showed up.
- A job is thin, 26 to 33 s and 9 taps (row 6): NOT FIXED. Job 1 took 25.8, 25.5, 27.2, 29.4 and 31.6 s, with 6 to 8 game taps. Only a move checklist was added to the result card. Shot: games-src/reviews/R8-shots/fuse-play-m-j1-result.jpg

### New findings
- **Row 5.** What I did: started job 4 (51 wires) by touch at 375x667 and measured every wire. What happened: crew wires are 25x33 px and my own 30x40 px, both well under 44. The info tokens on crew wires are about 12 px circles and hard to read. At 390 my own wires are still 32x42. Shots: games-src/reviews/R8-shots/fuse-meas-375-j4.jpg, games-src/reviews/R8-shots/fuse-meas-390-j4.jpg
- **Row 5.** What I did: measured header and plate targets in play. What happened: the Job, Gear, Rules, hint and Menu icons are 40x44. The tappable name plates are 26 px tall. Shot: games-src/reviews/R8-shots/fuse-plate-tip-375.jpg
- **Row 4.** What I did: read the board in jobs 2 and 4 as a new player. What happened: green scissors badges appear on my wires and are never named on the board, the goal card or the hint line. The gear cards in the top left are thumbnails with a lock and a number and no name ("Rewi..." is cut off in the tutorial). Shots: games-src/reviews/R8-shots/fuse-meas-375-j4.jpg, games-src/reviews/R8-shots/fuse-tut-375-solo.jpg
- **Row 6.** What I did: played jobs 2 to 4 with a player who reads only tokens and sort order. What happened: I won 3 of 7, and every loss came from 3 misses on a 3-step fuse. The computer players also missed some of those. Job 2 at 375 was lost twice in a row with 26 of 34 and 28 of 51 wires cut. Jobs 1 to 2 are a steep step up. Shots: games-src/reviews/R8-shots/fuse-play-s-j2-result.jpg, games-src/reviews/R8-shots/fuse-play-j4s-j1-result.jpg
- **Row 5.** What I did: walked the tutorial at 375x667. What happened: the bottom row of the hand runs off the bottom edge, so the wire bottoms are clipped. During the probe step the bubble covers Plum's name plate. Shot: games-src/reviews/R8-shots/fuse-tut-375-wrong1.jpg
- **Row 2.** What I did: counted tutorial steps. What happened: 10 of 22 steps are Next-only (goal, mine, crew, fuse, tokens2, hit, crew1, wrongres, crew2, win). Each is one line, but almost half the tutorial is reading. Shot: games-src/reviews/R8-shots/fuse-tut-390-mine.jpg

### Rules coverage
- 70 wires: 48 blue 1 to 12, red x.5, yellow x.1, and decimals only sort: covered (rules drawer and the "Red at / Yellow at" strip).
- Stands sorted low to high, hidden from crew, stands per player count (foreman has 2 at 3 players): covered (tutorial and rules).
- Opening info token, one per player, blue only: covered (tutorial step 5, done by tapping).
- One action per turn, clockwise, foreman first: covered (tutorial step 10, star legend).
- Dual cut: name a value you hold, point at a crew wire, a hit cuts both: covered (tutorial, by doing).
- Miss: fuse advances one step and a token shows the true value: covered (tutorial, by doing with the probe).
- Red pointed at means explosion; never name red: covered (stated in tutorial and rules; not practised as a risk).
- Yellow matches only yellow and you must hold one: covered (tutorial, by doing).
- Solo cut when you hold all that remain: covered (tutorial, by doing).
- Reveal reds when only reds are left: covered in rules; in the tutorial it is told and done automatically, not practised.
- Validation token when all four are cut: covered (tutorial step 16).
- Dial starts at player count, and the Nth miss explodes: covered (rules; fuse steps shown).
- Equipment unlocks after 2 cuts of its value and works once: covered (tutorial Rewind, by doing). The other 11 cards are explained only in Gear.
- Twin Probe personal item, once per job: covered (tutorial, by doing).
- Win when every wire is cut or revealed: covered.
- House rule: no cut in four rounds explodes the bomb: not in the printed rules, disclosed in Rules.

---

## cauldron-fair (branch shelf/W503-cauldron-gameplay @ dc9c06e6)
I played the guided tutorial by touch to its end card twice, once at 390x844 and once at 375x667. Each run was 26 steps, 27 taps and about 46 s with no waiting, and both had 0 errors and 0 stuck steps. I then played 4 full 9-day games by touch from the title screen on the default table (2 players, easy rival), all to the result screen. At 390x844 I won 33-30 (108 taps) and won 48-31 (126 taps). At 375x667 I lost 28-43 (93 taps) and lost 26-35 (113 taps). The policy was a naive new player who stops at whites 5 or more and buys one chip. Across all 6 runs there were 0 page errors, 0 console errors and 0 stuck states. No visible control was ever blocked under the finger. The only blocked taps were on a shop chip scrolled out of view at 375. The longest gap with nothing to tap was 11.9 s once. Typical gaps were 2 to 6 s. The rules screen, shop, ruby stall, fortune choices and fortune chip were measured with getBoundingClientRect and computed font size.

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | The turn, explosion over 7, flask, rat tails, bonus die, explode = points or shop, rubies, 9 days and the last-day conversion all match. Shop prices match the beginner books. The rules screen leaves out the extra white before day 6 and "empty bag means stop". |
| 2 | Tutorial teaches | 7 | 26 steps, 5 Next-only, one short line each. Red, yellow, blue and purple are now taught by doing. Green and black are taught only by reading one Next card ("Stalls say what chips do"). Counting rat tails is never shown. An unnamed "Hask" appears at step 18. |
| 3 | First 10 seconds | 8 | The title offers "New here? Learn in 5 minutes". The game opens on a 3-line goal card, then the board, and a YOUR TURN line says "Tap the bag". |
| 4 | Turn clarity | 6 | Good: the YOUR TURN line shows the white count, Stop shows its payout, and stall subtitles are plain words. Still bad: the ruby stall is only icons ("x2 -2", "+1", a flask) and tapping it gives no words. The yellow prompt is headed "Kind cut". The YOUR TURN banner hides the fortune card title on choice screens. |
| 5 | Phone play | 6 | No text under 14px and every control is 44px or more, except the "Day N/9" button (71x21). The fortune chip is now 44px. Overlaps remain: the YOUR TURN banner sits over the top of the fortune choice buttons, the shop hint line is clipped under the bottom bar, and the coach avatar covers the first letter of every tutorial title. At 375 the shop needs a scroll with no cue, and 2 stalls are hidden. |
| 6 | AI and pacing | 8 | A naive player won 2 of 4 on default and the scores were close (26 to 48). The rival is brisk: 2 to 6 s gaps, one 11.9 s. A game is about 95 to 125 taps. |
| 7 | Feel | 7 | Chips fly out of the bag onto the spiral, the scoring ring moves, the day report has bars, and the result screen has an illustration. The shop and ruby stall still feel like forms. |
| 8 | Bugs | 9 | 6 runs to the result with 0 errors, 0 stuck states and 0 dead taps on visible controls. |
| | **Total** | **7.4** | |
| | **Verdict** | **FAIL** | Turn clarity (6) and Phone play (6) are below 7. The ruby stall still has no words, and banners and hint lines overlap controls. |

### Earlier findings (R3)
- 16 of 33 tutorial steps were Next-only. Red, yellow and purple were not taught: FIXED. Now 26 steps with 5 Next-only (goal, bonus die, stalls, blue fortune, end). Red (step 18), yellow (20-21) and purple (23) are done by tapping. Green and black are still read-only. Shot: games-src/reviews/R8-shots/cauldron-tut-stalls-375.jpg
- Step 28 Wren Feather contradiction ("Place none" tagged best) and a big chip over the header: FIXED. The peek step asks you to place the purple and shows no "best" tag. No chip covers the header. Shot: games-src/reviews/R8-shots/cauldron-tut-peek-title-letter-390.jpg
- The last step said "Tap Next." with only a Finish button: FIXED. The end card reads "Now a real game / You know every rule" with one "Play a real game" button. Shot: games-src/reviews/R8-shots/cauldron-tut-end-card-390.jpg
- Cryptic stall subtitles ("Marrow booster", "Kind cut"): PARTLY FIXED. The stalls now say "No power, cheapest", "In last 2: a ruby", "Peek, then pick one", "+1 after an orange", "After a white: undo it", "Points at the count" and "Most moths: droplet", at both sizes. The yellow choice panel is still titled "Kind cut". Shot: games-src/reviews/R8-shots/cauldron-tut-yellow-kindcut-390.jpg
- Ruby-spend screen with no words: NOT FIXED. It moved into the shop as a stall showing "x2 -2", a droplet "+1" and a flask icon, with no visible words. Tapping the droplet leaves the hint line on the previous chip. The words exist only as aria-labels. Shot: games-src/reviews/R8-shots/cauldron-ruby-stall-nowords-375.jpg
- At 375, 4-chip price badges were clipped under the next awning: FIXED. Badges such as "19", "16" and "18" are fully visible. Shot: games-src/reviews/R8-shots/cauldron-shop-black-hidden-375.jpg
- Hint line on the Cinder Moth chip: FIXED at 375, where the hint is its own bar. At 390 the hint text now runs under the bottom bar ("The rest go back into the bag" is clipped). Shot: games-src/reviews/R8-shots/cauldron-tut-ruby-nohint-clipped-390.jpg
- Tutorial flask bubble dimmed over the fortune strip: FIXED. At step 6 at both sizes the bubble sits above the strip.
- Fortune chip 34px tall: FIXED. It now measures 44px tall (163 to 202px wide) at both sizes.

### New findings
- **Row 4/5.** What I did: in a real game a fortune card asked for a choice (Swap Stall, Rat Bribe, Clear the Pods). What happened: the YOUR TURN banner covers the "Today's fortune card: ..." title and the top edge of the first row of choice buttons, at 390 and at 375. The button centres still take taps. Shot: games-src/reviews/R8-shots/cauldron-fortune-banner-overlap-390.jpg and games-src/reviews/R8-shots/cauldron-fortune-banner-hides-title-375.jpg
- **Row 5.** What I did: opened the shop at 375x667. What happened: the stall area scrolls (scrollHeight 528 vs 403) with no cue. Cinder Moth is fully hidden, and once the ruby stall appears Dusk Sigh is hidden too. A tap at the hidden chip's position lands on the Start day button. Shot: games-src/reviews/R8-shots/cauldron-shop-black-hidden-375.jpg
- **Row 5.** What I did: read every tutorial bubble. What happened: the coach avatar covers the first letter of every title ("he goal", "ed chip", "eek and pick"). Shot: games-src/reviews/R8-shots/cauldron-tut-peek-title-letter-390.jpg
- **Row 2.** What I did: tutorial step 18. What happened: "Hask added chips" names a character the player has never met. The rival is Wynne and the player is "You". Shot: games-src/reviews/R8-shots/cauldron-tut-red-unnamed-coach-390.jpg
- **Row 5.** What I did: measured the header. What happened: the "Day N/9" control is a button only 71x21px. Shot: games-src/reviews/R8-shots/cauldron-brew-midgame-390.jpg
- **Row 6.** What I did: played 4 default games with a cautious new-player policy. What happened: 2 wins and 2 losses (33-30, 48-31, 28-43, 26-35), so a new player can win. Shot: games-src/reviews/R8-shots/cauldron-result-win-390.jpg and games-src/reviews/R8-shots/cauldron-result-loss-375.jpg

### Rules coverage
- Goal, most points after 9 days: covered (rules screen, tutorial).
- Fortune card each day, purple now and blue all day: covered (both).
- Rat tails give trailing players a head start from day 2: covered on the rules screen. In the tutorial it is only named, and tail counting is never shown.
- Everyone brews at once, draw blind, chip moves by its number: covered (both).
- White total over 7 explodes, last chip stays, must stop: covered (both).
- Flask returns the last white once per day, refill for 2 rubies: covered (both).
- Stop any time, score the space after the last chip: covered (both).
- Bonus die for the furthest safe pot, ties, faces: covered (both).
- Green, purple and black act after the brew: rules screen covered. In the tutorial purple is done by tapping, green and black are read-only.
- Blue, red and yellow act when drawn: covered, all done in the tutorial.
- Ruby on the scoring space: covered (both).
- Exploded pot takes points or shop, not both: covered (both).
- Buy 1 or 2 chips of different colours, leftover coins lost: covered (both).
- Yellow opens day 2, purple day 3: covered (both).
- 2 rubies move the droplet or refill the flask: covered (both, but no words in the real shop).
- Extra white chip before day 6: covered in the tutorial only, missing from the rules screen.
- Bag empty means stop: missing.
- Last day: secret draw/stop, no shop, 5 coins or 2 rubies = 1 point: covered (both).
- Tie-break, furthest pot on the last day: covered (both).
- Spoon space 15 points and 35 coins: covered on the rules screen.

---

## shipwreck-isle (branch shelf/W468-shipwreck-lean @ 382cc624)
I played the guided tutorial by touch to the end twice: at 390x844 (57 steps) and at 375x667 (56 steps, with the camp pop-up). Then I played 6 full default games by touch, from the title to the result screen (Marooned, 2 players, Easy island). Four games followed the game's own ✨ advice every day and on every choice: three at 390x844 and one at 375x667. They gave 3 rescues and 1 loss (day 12, pile 10/15). Two games used my own plan without ✨, one at 375x667 and one at 390x844. Both were lost on day 7: my plan put wood on the pile first and never built a shelter. Across 2 tutorials and 6 games I saw 0 page errors, 0 console errors, 0 failed requests, 0 stuck states and 0 dead DOM taps. Board taps go through the 3D canvas (the glow elements sit under it), and every board tap I made did respond.

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | The phases, the pile (one stage per round), fire plus pile on days 10-12, two-pawn sure success, threats, hunt and weather all match. Still 0 mystery cards in a measured game (8 adventure log lines). Adding wood to the pile sits in the pawn pop-up although it uses no pawn. |
| 2 | Tutorial teaches | 6 | Covers the rules in order, one line per step. But it is 57 steps plus 34 extra Continue taps (90 taps). The "real roll" is a small dice chip from the Cook's build, not the explore. The adventure card shows art and a title but no effect, and at 375 it never appeared. |
| 3 | First 10 seconds | 7 | Title plus "New here?" give the goal in one line. The play screen shows Day 1/12 and Pile 3/15, and the bar says "tap a glowing place". |
| 4 | Turn clarity | 6 | The pace warning helps. Action rows still use unexplained marks: "+3", "🎲", "✔", "⭐". The day summary shows bare icon deltas (-1🥫, ☂+1). Adding to the pile does not place the pawn, and nothing says why. |
| 5 | Phone play | 6 | No text under 14px and buttons are 44px or more. But at 375 the board strip is about 300px, the top tiles sit under the supplies bar and a "-3🍖" chip covers the Camp label. The camp pop-up is 194px tall and shows about 2 of 7 actions without scrolling. The Camp tile is cut at the right edge at 390. |
| 6 | AI and pacing | 6 | Following ✨: 3 of 4 rescued, games of 66-77 taps. One ✨ game left the pile at 3/15 from day 1 to day 6 while the red pace line asked for faster building, then lost at 10/15. With my own plan (pile first) I lost twice by day 7, and nothing warned me about sleeping outside for days. |
| 7 | Feel | 6 | The Continue chains are fixed (2-7 per day). But a day is now ✨, Start day, Continue: the player makes almost no real decisions. The roll and the cards are small and fast. |
| 8 | Bugs | 8 | 8 full runs to the end with 0 errors, 0 stuck states and 0 dead taps. Start day does nothing while an explore has 1 of 2 pawns, but the bar says why. |
| | **Total** | **6.5** | |
| | **Verdict** | **FAIL** | Rows 2, 4, 5, 6 and 7 are below 7. |

### Earlier findings (R3)
- Long Continue chains (5-17 per day, 141-155 per game): FIXED. I measured 32, 36, 38 and 36 non-decision taps in the ✨ games, at most 7 in a day, and 18-24 in my own games. The day summary is one card. Shot: games-src/reviews/R8-shots/ship-gA-daysum-d8.jpg
- Following ✨ lost: PARTLY FIXED. ✨ won 3 of 4, but one ✨ game lost at day 12 with the pile at 10/15. Shot: games-src/reviews/R8-shots/ship-gA2-result.jpg
- No "pile is behind" warning: FIXED. A red line shows from day 4 ("No fire yet") and from day 5 ("Pile 3/15, day 6: build faster"). But ✨ ignores it. Shot: games-src/reviews/R8-shots/ship-gA2-plan-d6.jpg
- Tutorial dice and adventure were info-only: PARTLY FIXED. There is a roll step, but the dice shown belong to "Cook: Build Pot/Bricks", not the explore. The adventure card has no effect text, and at 375 it never showed. Shots: games-src/reviews/R8-shots/ship-tut390-roll.jpg, games-src/reviews/R8-shots/ship-tut390-advc.jpg, games-src/reviews/R8-shots/ship-tut375-roll.jpg
- Threat line referred to a card no longer on screen: FIXED. The event card stays up for the event, ? token and threat steps. Shot: games-src/reviews/R8-shots/ship-tut390-threat.jpg
- 375 board strip about 330px: NOT FIXED. It is now about 300px, with the top tiles under the supplies bar. Shot: games-src/reviews/R8-shots/ship-gA3-plan-d6.jpg
- 375 pawn portraits cut at the top: FIXED. The pawn row shows whole. Shot: games-src/reviews/R8-shots/ship-gA3-plan-d6.jpg
- "+1" chip on a tile: NOT FIXED. A "-3🍖" chip covers the Camp label at 375 and "-1🍖" does at 390. Shots: games-src/reviews/R8-shots/ship-gA3-plan-d6.jpg, games-src/reviews/R8-shots/ship-gA2-plan-d6.jpg
- Result screen "What went wrong" hidden: FIXED. It is visible above the buttons at 390 and at 375. Shot: games-src/reviews/R8-shots/ship-gB-result.jpg
- "Try it on Easier" shown on Easy: FIXED. It is not shown on any Easy result. Shot: games-src/reviews/R8-shots/ship-gA2-result.jpg
- Tutorial camp pop-up bottom row cut at 375: PARTLY FIXED. Arrange camp and Rest are visible in their step, but the pop-up still shows about 2 rows and the next row is cut. Shot: games-src/reviews/R8-shots/ship-tut375-c3.jpg
- "Lose half the roof 0" unclear: not seen in my games, so not verified.
- No explanation of losing until the result: PARTLY FIXED. The pace line warns about the pile, but nothing warns while castaways sleep outside or starve. Shot: games-src/reviews/R8-shots/ship-gB-daysum-d3.jpg
- Mystery cards never drawn: NOT FIXED. In the game I counted, the log had 0 mystery cards and 8 adventure lines.

### New findings
- **Row 6.** What I did: I followed ✨ on every day and every choice at 390x844. What happened: ✨ never added to the pile from day 1 to day 6 (3/15) while the red line said "build faster". I lost on day 12 at 10/15. The game's advice contradicts its own warning. Shot: games-src/reviews/R8-shots/ship-gA2-plan-d6.jpg
- **Row 7.** What I did: I counted taps in the ✨ games. What happened: 34-39 decision taps per game, about 3 a day (✨, Start day, one answer). The whole game took 69-117 s by touch. A day can be played with no thought at all, and the ✨ button sits next to Start day. Shot: games-src/reviews/R8-shots/ship-first10-390.jpg
- **Row 4.** What I did: as a new player I tapped Carpenter, then camp, then "Add wood to the signal pile +3" on day 1. What happened: the wood went on the pile, the pawn stayed unplaced, and only 1 wood was left, so the Shelter (2 wood) was no longer possible. No line said so. The row's "+3" is not explained. Shots: games-src/reviews/R8-shots/ship-recon-camp.jpg, games-src/reviews/R8-shots/ship-gB-daysum-d3.jpg
- **Row 6.** What I did: I played my own plan to the end without ✨, twice. What happened: both lost on day 7 with 24-27 wounds, 8-12 of them from "sleeping in the open". The day summary said "Pile 9/15: on track for the rescue" while I had no shelter and 0 food. Shots: games-src/reviews/R8-shots/ship-gB-daysum-d3.jpg, games-src/reviews/R8-shots/ship-gB-result.jpg
- **Row 5.** What I did: I opened the camp at 375x667. What happened: the action pop-up is 194px tall, shows about 2 of 7 rows and must be scrolled. Shot: games-src/reviews/R8-shots/ship-measure-pop-375.jpg
- **Row 2.** What I did: I timed and counted the tutorial. What happened: 57 steps (22 Next-only, 35 do-it) plus 34 Continue taps between steps. That is 90 taps, against a promise of "5 minutes, one tap at a time". Shot: games-src/reviews/R8-shots/ship-tut390-advc.jpg
- **Row 4.** What I did: I read the day summary. What happened: the changes show as bare icons (-1🍖 -1🥫 -1🪵 ☂+1) with no words. Shot: games-src/reviews/R8-shots/ship-gA-daysum-d8.jpg

### Rules coverage
- Goal: fire plus a 15-wood pile, rescue on days 10-12: covered (tutorial, title, pace line).
- Pile is built one stage per round: covered in the engine. It is not taught, and its "+N" is not explained.
- Six phases (event, morale, production, action, weather, night): covered.
- Event card effect, then it becomes a threat; threat action: covered.
- Adventure token and adventure card: covered (card effect not shown in the tutorial).
- Mystery cards: in the engine, never seen in play: missing in practice.
- Morale and determination: covered (one line).
- Production: covered.
- Pawns: 2 per castaway, Friday, Dog, 2 pawns give a sure success, 1 pawn rolls: covered.
- Action dice (success, wound, adventure): covered by one line plus a chip.
- Build (shelter, roof, palisade, weapon, inventions with terrain needs): shelter and invention covered. Roof covered as a weather line. Palisade is not taught.
- Gather, explore, hunt (weapon against strength), arrange camp, rest: covered.
- Weather (rain from day 4, snow and animal from day 7, roof): rain and roof covered. Snow and the animal die are not taught.
- Night (eat or take 2 wounds, sleeping outside, camp move): covered except camp move.
- Wounds and death (any death loses): covered.
- Character skills: not taught.

---

