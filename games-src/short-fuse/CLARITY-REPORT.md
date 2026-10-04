# Short Fuse: clarity report (Oct 2026)

Goal: a first-time player on a phone should understand Short Fuse and enjoy it. I ran three rounds of blind playtests,
two testers per round. Each round had a casual player (skims, taps the big button, picks the guided game) and an
impatient player (skips the tutorial). Testers were fresh agents with no access to the repo. They played at 390x763
through `scripts/drive-serve.js` and saw only the screen. Their logs are in `playtest/` (`r1-*` = live build before
changes, `r2-*` and `r3-*` = preview). The screenshots they cite were not committed because of size. Five before/after
pictures are in `playtest/shots/`.

Preview: `games/short-fuse-next/index.html`. The live file `games/short-fuse/index.html` is unchanged.

## Before (round 1, live build): fun 3 / 3

Both testers won job 1. Both called it "smooth but it plays itself". What they hit:

1. **Computer turns were invisible.** Between two of your turns the wire count jumped (0→4, 10→14) behind a tip. Only
   one line of text stayed on screen, and the game could end on a crewmate move nobody saw.
2. **Opening token without your wires.** You were asked to "tag one of your wires", but on a phone your own wires were
   hidden behind a long list of buttons that ran off the bottom.
3. **The ★ player with 12 wires was never explained.** With 3 crew the foreman holds two racks. The top-bar numbers
   ("3", "0/24") had no labels.
4. **Tips at every step.** Ten blocking coach cards (3 in the first turn alone). One tip explained a crewmate's hit as
   if it were yours. "Turn off tips" asked for confirmation.
5. **Mode buttons gave no feedback.** Tapping "Me + computers" changed nothing visible.
6. **Real bug: job 1 Twin Probe.** The rules give every crew card a Twin Probe, and the computers used it. The human was
   never offered it. Whenever the best move used it, the Suggested move silently vanished (audit P1-3/P1-4).
7. **The rack letters run F…A on crewmates' racks.** Racks face their owner. The info token appears upside down.
8. **Odds on every value button.** "100% ★" did the thinking for the player.

## What I changed (game rules untouched)

All changes are in `game/ui.js`, `game/phone.js`, `game/texts.js`, `game/head.html` and `game/body.html`. Nothing in
the engine, the AI or the shared modules changed.

- **The feed on the table (cause → effect).** A small overlay at the top of the board. Its first line is always the goal
  and the race: "Goal: cut all 24 wires · 10 cut · fuse: 3 misses left". Below it is one line per turn since your last
  move, in the actor's colour, for example "Teal → Plum's wire: "4". HIT: both 4s cut.", "MISS: not 5. Fuse −1.",
  "All four 3s are done ✓" and "New gear ready: … (anyone may use it)". Hits are green and misses red. The newest line
  slides in. The overlay is click-through and hides while a rack is zoomed. Computer pace went from 0.9 s to 1.25 s per
  move so each line can be read.
- **Opening token.** A row of big wire tiles (number + letter), with "These are your wires. Tap one…".
- **Briefing names the crew.** For example "You (Amber) 6 wires · ★ Teal 12 wires on 2 racks · Plum 6 wires. The ★
  foreman goes first. Goal: cut every wire before the fuse (3 misses) runs out."
- **Guided game: 5 tips instead of 10**, one idea each: goal, your wires, a dual cut, a hit/miss, a solo cut. The
  "Say the number", "Snip" and "What we know" tips are gone. No separate briefing screen. The hit/miss tips now fire
  only on your own move. "Turn off tips" works at once. Tips you dismissed stay dismissed in later training jobs.
- **Start screen.** "Me + computers" lights up. A green line confirms the choice ("You + 2 computer crewmates · Job 1 ·
  then press Start job 1") and the Start button scrolls into view.
- **Job 1 Twin Probe fixed.** The Twin Probe is offered in job 1 (as the rules say) and explained wherever it appears.
  The suggestion is never dropped. The Gear drawer and briefing no longer say "no personal tools".
- **Hints are a resource.** Odds and the Suggested move appear on request: unlimited in the guided game, 3 per job
  otherwise ("Suggest (2 left)", "Hint: what could it be?"). A used hint shows the odds and a "★ Suggested because: …"
  line.
- **Fewer needless screens.** No "You played: places an opening token" confirm card. A crewmate's move is never filed as
  "You played" (bug, tested). A miss shows one card, not two.
- **Plain words.** "Cut slot 4" became "Cut wire D". "Miss: none of those is 4" became "Miss: wrong number (not 4)".
  "Still left" became "remaining uncut". The rack header reads "sorted low→high from A". The mismatched "Tap one of
  your wires, then Snip" became "Pick the number you say". Gear chips are labelled "Crew gear (anyone)". The action row
  wraps instead of pushing buttons off-screen.

New test: `game/clarity-test.js` (jsdom, real page, desktop and phone layouts), with five checks:
- job 1 offers the Twin Probe whenever it is legal;
- a hint or suggestion is reachable on every human turn;
- every crewmate turn since your last move appears in the feed;
- the goal line is on screen;
- no crewmate move is filed as "You played".

The first version failed (80 failures) on the live code and passes now (10 games, 142 human turns).

## Retest results

| Round | Casual | Impatient | Notes |
|---|---|---|---|
| 1 (live) | 3 | 3 | could not tell what computers did; wires hidden at the opening token; Suggest plays itself |
| 2 | 3 | 3 | both now followed every crewmate move from the feed and could explain each miss; left: feed lines cut off with "…", a stale "You played" card, Suggest still unlimited |
| 3 | 3 | 3 | both explained the goal and a turn, and who caused each lost fuse step; impatient lost job 3 on a 50/50 red call and found that tense |

**Acceptance: not fully met.**

Met: all four round-2/3 testers explained the goal and a round in their own words, and said why they won or lost.
The round-3 testers named who caused every lost fuse step.

Not met:
- **Fun.** It stayed at 3/5, short of the 3.5 target. Every tester's main complaint was the same: jobs 1–2 are easy
  and the computer crew does half the work. Since the guided game keeps unlimited hints, the casual tester never felt
  the hint budget.
- **Unreachable options.** Some remain: wires on a second stand off the right edge of your strip, and in round 3 a
  gear chip off-screen.

## Still weak (honest notes)

- **Easy start.** Jobs 1–2 of the real campaign are tutorials (blue wires 1–6/1–8). Tension starts at job 3+ with
  red wires. Making early jobs harder would change the game, so I didn't.
- **Second-stand racks overlap in the 3D zoom** (audit P1-7). With 3 crew the foreman's two stands overlap and are hard
  to tell apart. Wires at the edges hide under the pan arrows. This needs the flat 2D phone rack the audit proposed:
  an M-sized change inside the kit.
- **Crewmates' racks read F…A.** That is how the rack faces its owner. The header now says it is sorted from A, but a
  flat 2D rack would solve it properly.
- **Your own strip scrolls sideways when you hold two stands** (12+ wires), so stand 2 is off the right edge.
- **The 3D overview is too small to read on a phone.** Players found the crew-name chips that zoom to a rack only by
  accident.
- **Red markers on the track are too small to notice.** The job-3 loss tip pointed at them.
- **"What we know" listed impossible values.** One tester saw "could be 6, 7, 8" after all 7s and 8s were cut. Not yet
  reproduced or fixed. It needs a rules check of the solver's display (probably red/yellow sort positions shown as
  numbers).
- **Later-job jargon is unexplained** in briefings ("Handsets and Equal Tag are swapped out").

## Tests (full run at the end)

See the table in the commit/PR. Node tests: `rules-test.js` 100/100 passed and `clarity-test.js` PASS.
