# Game feel pass: Crown City Smash (W467, 8 Nov 2026)

Changed (layout, words, motion only; engine untouched, logic-test 146/146, rules-test 8/8):
- Goal card: one sentence how you win + 3 short scoring bullets; the phone text cutter no longer chops it ("Or be the last…").
- Learn to play, first screen: "How you win" card, one sentence + 3 bullets, stays 14 s (x to close).
- Portrait board fills the screen: the empty 130 px band at 390x844 is gone; a thin race line under the board (Goal 20 ★ · You 3 ★ · 👑 leader).
- Score strip numbers 13 → 14 px (icons smaller so they fit); result table on phones: 4 columns at 15 px, names in ink.
- No fast pop-ups: story beats stay at least 4 s + 1 s per 10 words, coach tips at least 8 s.
- 2D fallback board text 12.5 → 14 px.
- New check: `playable/feel.js <url> <w> <h> <dir>` (title, Learn, Goal, first turn, rival turn, mid-game, result by UI taps; flags text under 14 px, overlaps, broken images).

Not done: desktop dock text (13 px tips, low-contrast "Voltusk (you)"), ui-audit B 32 / C 1 / D 3 / F 1 (shared help-kit tooltip), visual baselines need owner approval.
Shots: playable-shots/feel/ (mid-game shots are from the previous build of this pass).

## Feel gate (feel-audit.js --secs 120, after merging the base): FAIL
(a) 15 · (b) 16 · (c) 13 · (d) 41 · (e) 1 (baseline in qa/feel/SUMMARY.md: 13 / 5 / 7 / 28 / n/a; this run drove further, 150 turns vs 30).
Next steps, in order:
1. The board flashes ("Squidrik +3★", "Fast forward ⏩", BF.flash in board.js) show in Play with Hints off and last under 1 s. Hide them when Hints is off, or move them into the race line.
2. The audit finds neither Learn nor Play. Learn is the ppCoach game, not GXT, so GXT.running() is false. "▶ Play now" does not match the audit's play regex. Add data-a hooks the audit knows, and expose a GXT-like running() for the coach.
3. Coach lines over 12 words: rewrite COACH_TIPS in tut-story.js and the ui.js tips; the aim sentence is 15 words, so split it.
4. 13px text in the monster/card drawers (div.small.muted, .st2, small).
5. (e) The ★20 and ⚡0 numbers overlap on the result chip.
