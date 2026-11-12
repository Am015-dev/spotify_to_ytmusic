# Lantern Dive: tutorial coverage (G4 fix, 8 Nov 2026)

The tutorial is a GUIDED FIRST DIVE (`game/src/ui12.js`): 20 steps on a fixed deal (data.js `tutorial`), each one sentence of 12 words or fewer.
16 steps are done by touch: 6 real moves (take a job, skip the flare, signal Kelp 3, lead, follow, trump) and 10 "tap the spotlit thing" steps
(the jobs, your job, Dag, your Lanterns, your spent token, Sumi's token, Dag's card twice, Dag's done job, the finished jobs). Only 4 are Next-only
reading (lose, win1, void, trumpwin). The crewmates are scripted (`TUT_AI`).

Step order (`TUT_RULES` in ui12.js): goal - take - mine - theirs - lose - flare - notrump (Lanterns can never be signalled) - ping (highest/lowest/only) -
pingonce (one signal per dive, token spent) - readping - lead - follow1 - win1 - done1 - winlead - nowin - void - trump - trumpwin - won.

Proof: `game/tutor-test.js 390x844,375x667` walks it by touch taps; every TUT_RULES step reached in order, wrong taps never advance.
Not in the tutorial (special dives, each gets a one-time "New rule" step in play, RULE_STEPS in ui12.js): hand-over/vote/volunteer, murky water,
deep narcosis, the clock, predictions, the drone.

(Older notes below.)

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

## Story beat per step (W390 prologue; guide Brack, rival Dag, crewmate Sumi)
goal: bay nets tangled, one crew | cmd: "Captain's privilege" | take: Dag needs the nets cleared | mates: Dag grabs the first-trick job, "don't you dare win it" |
flare: flare locker, calm water | ping: radio silence | readping: Sumi signals | lead: first trick | win1: Dag stares | lost: "Net snags!" (payoff of the lesson: a broken job) |
ping2: second try, tell Dag the trick is his | lead2: lead low | win2: Dag cheers "Ha, thanks!" | done1: job done | last/lastx: Brack's logbook | follow: Dag leads Kelp |
win3: Sumi grins | trump: Lanterns | win4: "Show-off!" says Sumi | won: "Nets free! Logbook signed. You're a diver now." then the end card points at the carved stones (chapter 1).
