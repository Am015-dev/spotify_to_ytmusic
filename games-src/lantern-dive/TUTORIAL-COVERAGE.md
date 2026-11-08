# Lantern Dive: tutorial coverage (W409, 8 Nov 2026)

The tutorial is now a COACHED FIRST DIVE (`game/src/ui12.js`): ONE forced tap (take a job, spotlight from shell/gx-tutor.js), then the kit is stopped and
the dive is a real free game on the stacked deal (data.js `tutorial`) against the normal computer divers. Brack (one bubble at a time, never blocks a tap,
x dismisses, "Skip tutorial" always visible) explains each rule the first time it matters: jobs, flare, signals and reading a ping, lead/Captain, follow suit,
void and trumps, who wins a trick, Last, and reacts when a job is done (good) or broken (poor). The end card walks the real result (jobs done/broken with
the reason, tricks won) and lists "Things you'll meet later": every rule that did not come up in that dive plus the special dives (hand-over/vote, murky
water, narcosis, clock, predictions, drone). A lost dive offers "Dive again" on the same deal.
Proof: `game/playable-tutorial-end.js [sizes] [seed]` plays random legal moves by touch taps through the UI at 390x763 and 1440x860 to the end card and asserts
<= 2 forced taps, one bubble at a time, every rule explained in play or listed on the end card: PASS (seeds 5, 7, 11, 21).
(The chapters/steps list below is the OLD 21-step tutorial, kept for the rule wording.)

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
