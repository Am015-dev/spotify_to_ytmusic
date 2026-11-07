# Lantern Dive: tutorial coverage (W390, 7 Nov 2026)

The tutorial (`game/src/ui12.js`, shell/gx-tutor.js) is one real, short dive against the real divers' rules: 21 steps, two attempts
(attempt 1 is lost on purpose, attempt 2 is won in three tricks), ending in the "You know the rules" card and then a real game
or the Story. Leave and resume: a reload mid-way offers Restart / Exit; Skip tutorial works at any step.
Proved by `game/playable-tutorial-end.js` (fresh storage, touch tap on the centre of each spotlit element, `elementFromPoint` there
must not be a kit overlay, every step id below must be shown, end card reached) at 390x763 and 1440x860: PASS, 21/21.
The older `game/tutor-test.js` adds wrong-tap, rotation, leave/return and skip checks.

Chapters (the step list shows 21 dots; these are the natural breaks): 1 Your first turn (goal..lead), 2 Scoring a trick and a
broken job (win1, lost), 3 Second try: pings, last trick, following (ping2..win3), 4 Trumps and the end (trump..won).

## Rules checklist (step that teaches each: by doing = D, by seeing = S)
- [x] The crew wins or loses together; every job done = dive won ................ goal (S), won (S)
- [x] A job is a task for ONE diver, met by the tricks that diver wins ........... goal (S), take (D), mates (S)
- [x] Commander = holder of Lantern 4, leads trick 1, picks a job first ......... cmd (S), take (D), lead (D)
- [x] Jobs are taken one per turn, clockwise ..................................... take (D), mates (S)
- [x] A job is done when met and cannot fail (green tick) ......................... done1 (S), won (S)
- [x] One broken job loses the attempt for everybody; dive again ................. lost (S), onNext retry
- [x] Distress flare (optional card pass, costs an extra logbook attempt) ........ flare (D: decline it)
- [x] No talking; one ping per dive: highest / lowest / only colour card, between tricks ... ping (D), readping (S), ping2 (D)
- [x] The leader plays any card; the winner leads the next trick ................. lead (D), win2 (S), win3 (S)
- [x] Everyone follows the led colour if they can ................................. follow (D)
- [x] Highest card of the led colour wins; other colours never win ................ win1, win2, win3 (S)
- [x] You are never forced to win ................................................. lead2 (D)
- [x] No card of the led colour: play anything; a Lantern (trump) beats every colour; higher Lantern beats lower ... trump (D), win4 (S)
- [x] The dive ends the moment every job is done; cards left in hand do not matter ... won (S)
- [x] "Last" button: look at the previous trick again, close it ......................... last (D), lastx (D)
- [x] Each turn is narrated (W390): the caption bar says who plays what, who wins the trick and why, which job is done or broken ... every play/win step (S)
- [ ] NOT TAUGHT in the tutorial (honest gaps; they live in the Rules drawer, the lightbulb and the Job practice mode):
  - Dives where one diver takes every job, vote / volunteer / hand-over (dives 6, 10, 13-16, 26)
  - Murky water, deep narcosis, unknown waters (special signalling)
  - The clock (real-time dives 14-16, 26)
  - Predict-your-tricks jobs (open and secret)
  - Two divers and the drone (double row of 14 cards)
  - The logbook / Log drawer
  - Limit dives (dive 8, 12, 20, 21, 23, 27) and Descent boss curses (our own mode)
  Reason: each needs its own staged deal and 3-6 extra steps; time-boxed (110 min). A second tutorial run through the special dives is the next task.
