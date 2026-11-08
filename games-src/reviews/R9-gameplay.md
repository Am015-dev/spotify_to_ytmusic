# R9 gameplay re-review (strict), 8 Nov 2026

Reviewer R9. Scored by `GAMEPLAY-RUBRIC.md`; no game code changed. Each game was built from its branch and served next to its `games/<slug>/media`, then played by Playwright touch at 390x844 and 375x667. Rules notes kept outside the repo.

(In progress: doorkick-dungeon and rampart-and-vine sections follow.)

---

## redline-rally (branch shelf/W496-redline-gameplay @ a23193b4): 4.0 FAIL (stopper)

How I played: I built with `games-src/redline-rally/build.py` and served the page next to `games/redline-rally/media`. Everything was by real touch (Playwright, hasTouch, isMobile, `touchscreen.tap`, deviceScaleFactor 1). I did the tutorial to its end card at 390x844 and at 375x667 (39 steps, 40 taps, 108 s each, 0 errors). Then I played three full default races (Sunline, 2 laps, 4 rivals, Easy, Hints on by default) to the result screen:
- 390x844 as a plain new player: gear up on straights, gear 2 near a corner sign, the biggest cards, Boost on when I had 5+ heat and no corner close. **5th**, 172 s, 22 decisions, 83 taps, 6 question taps (all discard).
- 375x667, same new player. **5th**, 168 s, 21 decisions, 81 taps, 7 question taps (all discard).
- 390x844 tapping Suggest every round, as the goal card says ("Stuck? Tap Suggest"). **1st**, 143 s, 17 decisions, 36 taps, 0 question taps.

All three races had 0 page errors, 0 console errors, 0 stuck states and 0 dead taps. Go to your next decision took 7.4-8.0 s on average (max 9.8 s). I also ran the fixer's level sim myself (`sim-levels.js`, 150 races).

Rules check: I checked the published rulebook and two rule summaries (notes kept locally only).
- **Boost.** The published rule: in the React step, after the cards are revealed and the car has moved, you may boost once per turn. You pay 1 heat, then flip cards until a speed card shows. The build changes this. Boost is now a toggle you set while planning, before anything is revealed. After the reveal the game decides for you: it applies the boost, or cancels it on its own ("Boost skipped: it could spin you."). You are never asked. You lose the information the rule gives you: where the cars ahead ended up, what a Stress flip gave, and adrenaline. The game also takes the choice away when it auto-cancels. On its own I would call this a smaller change.
- **Discard.** The published rule: every round, after moving, you may discard any unwanted cards from your hand, but not Heat or Stress. The build only offers this step when you hold 3 or more slow cards (Brake or 1), and at most once every three rounds (`askDiscard`, ui.js:288). In every other round the step is skipped silently, and there is no other way to discard. A Swap button exists in the code (`#swapB`) but it is never drawn. So in most rounds you cannot throw away a 1 or 2 to dig for 4s. That is a real strategic choice in the published game, and it is gone.

Together this breaks a core turn step. The tutorial still teaches both rules the published way. Step 32 says "After moving you may discard: tap a 3 you do not want" (a 3 can never be discarded in a race). Steps 37-38 say "Tap Go: your cards show first, then you may boost" and show Boost / No boost buttons after the reveal, but races have no such question. The Boost toggle you really use is never taught. I treat this as a broken rule, so it is a stopper.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 4 | The discard step is gone in most rounds: it is only offered with 3+ slow cards, at most every third round. Boost is set before the reveal, and the game cancels it for you. The rest still matches: the round order, adrenaline, slipstream, corners, spin-out, cooldown, stress, two-gear shift. |
| 2 | Tutorial teaches | 5 | 39 short one-tap steps cover the 20 rules in order and end on "a real race against four rivals". But it teaches discarding a 3 and a post-reveal boost question, and neither happens in a real race. It never shows the Boost toggle, Brake or Burst. |
| 3 | First 10 seconds | 7 | Clear title (Play 320x54, "New here? Learn in 5 minutes"). The goal card now explains Brake, Burst and Suggest, though it is five lines of text. |
| 4 | Turn clarity | 6 | Good preview line ("Speed 2: road clear, corner in 7, slipstream likely. Press Go!") and a standings line. But the Boost toggle has no words beyond a hover title. The discard question pops up in some rounds and not others with no reason given. The auto boost-skip flashes for 450 ms. |
| 5 | Phone play | 6 | Fixed: the board is 308 of 667 px at 375 (46%), Menu fits with Hints on, and no text is under 14 px. Still wrong: the Boost button is 52x40 at 390. Pops sit on cars and signs ("Clean: 4 in a 4" over your "You" label, "+11 spaces" over a "5" corner sign). The "Good: ..." bubble covers the minimap. The dashboard still overlays the bottom of the board. |
| 6 | AI and pacing | 6 | The ladder is fixed (sim: Easy 4.63, Normal 2.68, Hard 2.51). Pacing is good: races take 143-172 s and the wait is about 8 s per decision. But a plain new player still finished 5th and 5th by touch. Only tapping Suggest every round won, and that means the game plays itself. |
| 7 | Feel | 6 | Cars slide, start lights, a podium, and far fewer prompts. But the labels pile up on the board ("safe", "slipstream +2?", "Clean: 4 in a 4", the "Good" bubble all at once), and with Suggest a race is 36 taps of Suggest then Go. |
| 8 | Bugs | 8 | 2 tutorials and 3 races: 0 errors, 0 stuck states, 0 dead taps. One false claim: "0-3 question taps per race". A plain player got 6 and 7 discard prompts. The Swap code is dead. |
| | **Total** | **4.0** | Capped by the stopper (raw average 6.0). |
| | **Verdict** | **FAIL** | Stopper: a broken discard rule, and a boost rule that differs from the tutorial. Rows 1, 2, 4, 5, 6 and 7 are under 7. |

### Earlier findings (R3)
- **Row 6, a new player can't win on default Easy: NOT FIXED.** A plain new player finished 5th at 390 and 5th at 375. Only Suggest every round won (1st). The fixer's sim says a plain newcomer averages 3.11, but my touch player spun 2 times and ran out of engine heat by round 5-7. Shots: games-src/reviews/R9-shots/rr-390-result-5th-plain.jpg, games-src/reviews/R9-shots/rr-375-result-5th-plain.jpg, games-src/reviews/R9-shots/rr-390-result-1st-suggest.jpg
- **Row 6, level ladder broken (Hard easier than Normal): FIXED.** My run of sim-levels (150 mixed races) gives average places of Easy 4.63, Normal 2.68 and Hard 2.51. Suggest beats a field of 4 Easy cars 78% of the time.
- **Row 4/6, Suggest hidden and planning with Hard: FIXED.** Hints are on by default and Suggest shows in the action row. `suggestPlan` plans your own hand at the 'pro' level. Shot: games-src/reviews/R9-shots/rr-375-first-turn-board46.jpg
- **Row 7, 31-36 question taps per race: FIXED in number, but by removing rules.** I got 6, 7 and 0 question taps. They came down by turning boost into a pre-set toggle, skipping discard in most rounds, and auto-answering slipstream. The fixer's "0-3" claim is false for a plain player (6 and 7). Shot: games-src/reviews/R9-shots/rr-375-discard-ask-pop-on-sign.jpg
- **Row 5, 375 board strip covered by the dashboard: PARTLY FIXED.** The board is 308 px (46%), up from about 260. The speedo, gear and corner-sign dashboard still sits over its bottom 60 px. Shot: games-src/reviews/R9-shots/rr-375-r7-engine0-bubble-minimap.jpg
- **Row 5, Menu cut off with Hints on: FIXED.** Menu is 51x44 and fully on screen at 375 with Hints on. Same shot.
- **Row 5, "+6 spaces" pop over the minimap: PARTLY FIXED.** Pops no longer land on the minimap. But "+11 spaces" now covers a "5" corner sign, and the "Good: 3 spaces for 0 heat" coach bubble sits on the minimap. Shots: games-src/reviews/R9-shots/rr-375-discard-ask-pop-on-sign.jpg, games-src/reviews/R9-shots/rr-375-r7-engine0-bubble-minimap.jpg
- **Row 7, props drawn over the dashboard: FIXED as far as I saw.** The triangle prop now sits on the grass, clear of the dashboard. Shot: games-src/reviews/R9-shots/rr-tut-375-boost-question.jpg
- **Row 1/4, Brake and Burst untaught: PARTLY FIXED.** The goal card says "Brake = speed 0, safe in corners. Burst = speed 5". The tutorial still never uses them. Shot: games-src/reviews/R9-shots/rr-goal-card-390.jpg
- **Row 2, tutorial end says "two rivals": FIXED.** It now says "Now a real race against four rivals." Shot: games-src/reviews/R9-shots/rr-tut-end-390.jpg
- **Row 8, "You lead by -5": FIXED.** The end status reads "Chequered flag!" and no negative lead showed in any race.

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 1 (stopper) | Played 2 races as a plain player who played big cards, so 1s and 2s built up | I could discard only when I held 3+ Brake/1 cards, and at most every third round. In other rounds the step was skipped and no button let me discard. In the published game you may discard any non-heat card every round. | games-src/reviews/R9-shots/rr-375-discard-ask-pop-on-sign.jpg |
| 1 | Turned the Boost toggle on while planning, then pressed Go | Boost is fixed before the reveal. After the reveal the game applies or cancels it without asking ("Boost skipped: it could spin you."). The published boost is chosen in the React step, after seeing the move. | games-src/reviews/R9-shots/rr-375-first-turn-board46.jpg |
| 2 | Tutorial steps 32 and 37-38 | It teaches "tap a 3 you do not want" and a Boost / No boost question after the reveal. Neither exists in a real race. The real Boost toggle is never shown (it is hidden in tutorial mode). | games-src/reviews/R9-shots/rr-tut-390-discard-a-3.jpg, games-src/reviews/R9-shots/rr-tut-390-go7-then-boost.jpg, games-src/reviews/R9-shots/rr-tut-375-boost-question.jpg |
| 6 | Two default Easy races as a plain new player, one with Suggest every round | Plain: 5th and 5th, with 2 spins and 12 heat burned each time, and engine heat at 0 by round 5-7. Suggest: 1st with 0 spins. A new player wins only by letting the game choose every move. | games-src/reviews/R9-shots/rr-390-result-5th-plain.jpg, games-src/reviews/R9-shots/rr-390-result-1st-suggest.jpg |
| 5 | Measured action-row targets at 390x844 | The Boost button is 52x40 px, under 44. All other targets are 44 px or more. Smallest text is 14 px. | games-src/reviews/R9-shots/rr-390-plan-pops-overlap.jpg |
| 5/7 | Round 5 at 390x844 | "Clean: 4 in a 4" covers your "You" label and car. "slipstream +2?" and "safe" sit on rival cars, and the "Good: 2 spaces, 0 heat burned." bubble sits on the minimap, all at once. | games-src/reviews/R9-shots/rr-390-plan-pops-overlap.jpg |
| 4 | Watched the discard question across a race | It showed up about every third round (6-7 times), with a 5 s auto "Keep all" countdown. Nothing says why it appears in some rounds and not others. | games-src/reviews/R9-shots/rr-375-discard-ask-pop-on-sign.jpg |
| 8 | Counted question taps against the fixer's "0-3 per race" | 6 (390) and 7 (375) for a plain player, 0 with Suggest. The claim only holds for Suggest play. | games-src/reviews/R9-shots/rr-375-result-5th-plain.jpg |
| 3 (good) | Opened the game and tapped Play | Title buttons are 44-58 px tall. The goal card covers laps, gear = cards, corners and heat, Brake and Burst, and Suggest. | games-src/reviews/R9-shots/rr-title-375.jpg, games-src/reviews/R9-shots/rr-goal-card-390.jpg |
