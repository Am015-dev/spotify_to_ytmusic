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

## Feel gate (feel-audit.js --secs 120): (a)-(e) all 0
- Learn to play is a coached real game, not tutor steps: ui11 makes GXT.running()/state() report it, so the audit finds it
  (finished by touch, 0 skips).
- (c) every line is 12 words or fewer: coach lines, dish tips, chef bios. The PC round label no longer repeats the goal (the Goal card says it).
- (d) phone text is at least 14px (skin.css floor, card labels included).
- (a) coach bubbles wait while a drawer, the score sheet or the reveal is up, and only speak when it is your move.
  A dismissed bubble disappears at once.

## Reviewer R5 fixes (8 Nov)
- No more 404s: GXSK.init no longer asks for story-map / ui-star-on/off / ui-act-banner-c (this game has none).
- Owner portraits (media/camp-*.webp) now show in a Quick game: on the setup cards, in the table summary and in the Goal card (Suzu).
  asset-usage went from 25/71 to 31/71, and all 6 camp files load.
- Desktop reveal: the stage covers the whole board (no empty strip) with cards up to 210px. The score caption sits above the card,
  wraps and is never cut off, so the card art and name stay clear. The remaining hand is drawn on the canvas layer and comes back after the pass.
- Phone: the two hand rows have an 18px gap, so the score chips no longer cover names. Empty counters say "Nothing served yet".
- The reveal never hides Suzu's bubble mid-sentence. The portrait letter is hidden once the picture loads.

Why asset-usage cannot reach 95% / 4 of 4 glb in its headless run:
- glb: gx-glb-boot skips software GL (SwiftShader in headless Chromium) unless ?glb=1. A 390px run also loads only the -lite
  models, so plate.glb + plate-lite.glb + cloche.glb + cloche-lite.glb can never all load in one run. The pictures the
  viewer swaps (models/plate@512.webp, models/cloche@512.webp) are wired and load.
- Story-only art: back-* (chapter scenes), ui-node-* (story map). They load in Story mode, not in a Quick game.
- Variant files: ui-button-*/ui-panel/ui-row/ui-nametag-*-c sources next to the -c files the skin uses; ui-bubble*
  are the help-bubble skin, and help bubbles are off in Play by the brief.
