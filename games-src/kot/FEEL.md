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
