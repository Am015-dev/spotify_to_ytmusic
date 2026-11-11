# Sands of Qamar: clarity report (Oct 2026)

Preview: `games/sands-of-qamar-next/` (https://am015-dev.github.io/spotify_to_ytmusic/sands-of-qamar-next/).
The live game `games/sands-of-qamar/` is unchanged. No rules were changed; every change is in the presentation layer
(`src/story.js`, `src/ui.js`, `src/ui8.js`, `src/three3d.js` camera easing, `src/head.html` / `src/ph.css`, `src/body.html`).

## How it was tested
Three rounds of blind playtests on a 390x763 phone, each with two **new** testers who could see only the
screen (screenshots plus the list of tappable things); no repo access. Each round had a casual player (took the guide,
tapped the big button) and an impatient player (skipped every guide). Logs: `playtest/r1-*.md`, `r2-*.md`, `r3-*.md`.

| Round | Build | Casual | Impatient | Average fun |
|---|---|---|---|---|
| 1 (before) | the live build | 2/5, lost 188–248 | 2.5/5, lost 192–193 | **2.25** |
| 2 | causes, plan points, decision pop-ups | 2/5, won 283–206 | 2/5, lost 204–237 | **2.0** |
| 3 | + zoom, hints off after round 2, round-2 fixes | 2/5, lost 201–255 | 2.5/5, won 247–215 | **2.25** |

**Acceptance is not met on fun** (target ≥ 3.5). After 3 rounds the best version ships, as the brief says, with these notes.
**Understanding improved clearly:** in round 1 neither tester could say why their score dropped ("lost 10 points twice
with no popup", "Teal's score jumped and I couldn't follow how"). In rounds 2 and 3 all four testers explained the goal
and a round correctly, and each gave concrete reasons for their gains and losses (Advisor bonus swings, Shadows taking
Advisors, Wazira, Nakhla palms, goods sets, overpaying a bid). They quoted the new "Why?" panel as the source.

## What the testers hit before (round 1)
1. **Score changes with no cause.** "−10 during Teal's turn" (the +10-per-rival Advisor bonus moving), djinn
   passives scoring on the rival's turn, kills shown only in the Log. Both testers.
2. **Real bugs.**
   - The round banner said "Only 1 camels left for Onyx" when Teal had 1 camel (wrong player, wrong plural).
   - The suggested bid disappeared once the suggestion spent Mystics (Dalil).
3. **Suggestions you couldn't trust.** "Best plan +19" gave about +10 (the badge was the computer's internal rating,
   not points). A plan promised "buy 2 goods" and the Bazaar then said "every purchase loses points".
4. **Decisions hidden off-screen.** The best Shadow target, Skip and the djinn powers sat below a 763 px screen under a
   sticky button. The Powers chip sat at y=772. The result table was cut off after Palaces.
5. **No visible stakes or end.** No "last round" warning; the game ended "suddenly". The bid screen didn't show your
   coins or say why you bid twice with 2 players.
6. **Board unreadable on a phone in portrait** (also raised by the owner): 6 tiles across 390 px, labels about 5 px.
7. **Jargon.** Djinn summon buttons showed only a name and points; "🧺 4 · 1 · 0" had no labels.

## What changed
- **Cause → effect for every score change.** Every move records each player's change by source, and spells out
  Advisor-bonus swings ("Advisor bonus −10: Teal now has 5 Advisors, you have 4"). On the phone, your turn starts with
  "Since your last turn: You −10 · Teal +28 · Why?" and the biggest changes. During the rival's turn the strip narrates
  its point changes. The score-race chip opens "Why the points changed", newest first.
- **Bugs fixed, each with a test that failed first** (`clarity-test.js`, `strip-test.js`):
  - the camel banner names the right player and number;
  - the suggested bid is kept when it spends Mystics;
  - a strip-overlap bug introduced in round 2 (end warning drawn over "Best plan", so it couldn't be tapped)
    was caught by the round-3 casual tester and fixed.
- **Honest plan numbers.** Badges and Best plan show the points the plan scores now. Advisors and Sages match exactly,
  tested on 200+ plans. Shadows plans say "+N pts + 🗡 a kill". When Best plan isn't the biggest score now, a line says
  why. The Bazaar line in plans promises a buy only if it gains points.
- **One decision per pop-up.** The decision comes first, the suggested option is starred and on top, and djinn powers
  sit behind one button. Log lines are removed from the pop-up. A "▼ more below" cue (tap it to scroll) replaces the
  sticky button that covered options. Shadow targets list rivals' kept Advisors and Sages first. On an all-losing
  Bazaar, Skip comes first.
- **No empty confirm screens.** A Shrine you can't use, a compulsory palace or palm, and selling with no goods now
  resolve by themselves with a one-line note.
- **The goal and race always visible.** A "★ Most points wins · You 93 · Teal 87" chip, a last-round and
  "few moves left" warning (both end conditions), and a result card that leads with "You win/lose" and the Total row.
- **Zoomable phone board.** A 🔍 toggle in the top bar, pinch to zoom (to 3×), drag to pan. In portrait the board
  zooms onto your hand while you drop people, follows it, and zooms back out after the move. At 2× tile names
  ("Oasis B3") and people are readable.
- **Hints:** stars and the one-tap Best plan show in the guided game and rounds 1–2. After that, "Choose a plan" opens
  the list and the player decides. "Advise me" still works. Round-2 testers said they were "a passenger".
- **Plain words.** Djinn effects are on summon and power buttons. A toast says what a newly summoned djinn does. The
  Traders button lists the exact cards. Mystic costs read "🔮 Mystic card". The bid card shows your coins and explains
  the 2 markers.

## Retest results (round 3)
- Both testers explained the goal, a round, the camel claim and the end conditions, and why they won or lost
  ("Teal won on Tiles and Djinns; I won on Goods and Advisors").
- "What just happened" moments dropped from about 7 per tester to 3–5. Most were explained by the panel a moment
  later; the rest were small djinn passives.
- Unreachable options remain: long lists need a scroll that the test driver can't do; testers found the tap-to-scroll
  cue by accident.
- Fun stayed at 2–2.5. Both said the game plays itself when they follow the suggestions, and the rival's turns are
  only summarised, not shown.

## What's still weak (honest)
- **Fun is not at the bar.** The testers' main reason: few felt choices, because the advice is strong and plans are
  pre-chewed. The next step is a real guided first game that teaches one idea per step, then fewer suggestions. The
  layered version from `thornbound/CLARITY-PLAN.md` (F) was not built here.
- **The rival's turn is invisible as motion.** It is narrated in text afterwards; its path is not animated on the board
  step by step with a pause.
- **Long lists still scroll** on small phones (Shadow targets with 13+ options, the djinn list). Ranking puts the
  useful ones first, but it is still a list.
- **Late game is thin** (rules, unchanged): the last rounds on a near-empty board feel dead, and the "no legal move"
  ending is now warned about but still abrupt.
- **The suggested-move AI is the "normal" computer;** one tester saw it pick a lower-value djinn. Not tuned here.
- Not tested on a real iPhone: the pinch zoom was exercised only through emulated touch.

## Tests (final build)
See the table in the commit message of the delivery commit; summary:
`clarity-test.js` 5/5, `strip-test.js` 3 sizes ok, `gauntlet.js` (2p 40 games, 3p+exp 20, 5p all expansions 10)
0 errors / 0 stalls, `cover.js` 40 games 0 errors 0 invariant fails, `click.js` and `click-phone.js` 0 errors,
`lay-phone.js` at the 7 phone sizes, `lay.js` / `lay-d.js` at the 4 desktop sizes, `orient.js`, and
`net/p2p-ft.js` + `p2p-ft-phone.js`. Results are recorded below once the final run finishes.

Test changes: `lay-phone.js` now checks only the tiles in view while the board is zoomed (and waits for the camera to
settle). It taps the score-race chip instead of the removed Players chip. `lay.js` and `lay-d.js` no longer crash when
the dock re-renders between finding a button and clicking it.
