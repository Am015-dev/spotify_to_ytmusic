# Kaiten Kitchen: game-feel round (W463, 8 Nov 2026)

Brief: games-src/BRIEF-GAMEFEEL.md. Rules engine untouched (logic-test.js 81/81).

## What changed
- **Goal card** (ui10.js `goalCard`): "Have the most points after three rounds." plus 3 short bullets with the dish art.
  It is the first screen of Learn to play (Suzu's first line waits for it), it opens the first game of a visit, and
  tapping the round label in the top bar shows it again. It stays until you tap Got it, tap outside, or press Esc/Enter.
- **No fast pop-ups**: `toast` (ui1.js) stays 4 s + 1 s per 10 words (was 2.2 s), and a tap closes it. Coach bubbles
  (ui11.js) use the same floor. One at a time: a new one replaces the old.
- **Play mode is clean**: help bubbles are off by default (`GXH.init defaultOn: false`, ui10.js). The lightbulb still
  gives a hint on demand, and Menu > Help turns the bubbles back on. Learn to play keeps Suzu's bubbles.
- **Vibrate tick**: a soft one when you lift a dish to drag it, a firmer one when it snaps onto your tray (ui3 `grabNow`,
  ui8 `dragStart`). Skipped with reduced motion.
- **Bigger score numbers** on the seats (20px, on the owner's star art when the skin is loaded).
- Tests: sweep.js, play-ui.js and tutorial-end.js close the Goal card by touch. tutorial-end.js checks that Learn to
  play opens on it.

## Self-scored critique of the final shots (playable-shots/feel/)
| Item | impeccable | design-review |
|---|---|---|
| Hierarchy: board first, one instruction line | 8 | 8 |
| Goal is clear | 9 | 9 |
| Type size and contrast (>= 14px, dark on cream) | 8 | 8 |
| Touch: tap or drag the dish, the tray glows, snap + tick | 8 | 8 |
| Motion: covers lift one by one, hands slide, points fly | 7 | 7 |
| Copy: short table talk | 8 | 8 |
| Layout at 390x844 and 1440x900 | 8 | 7 |

Weak spots (still >= 7): on PC the right dock is mostly empty. The result card's art covers your own seat
for a moment at 390x844. The round-end "+N roll race" pops briefly cross the plates.
