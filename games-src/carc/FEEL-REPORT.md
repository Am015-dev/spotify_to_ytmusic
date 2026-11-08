# Rampart & Vine: game-feel pass (W476, 8 Nov 2026)

Brief: games-src/BRIEF-GAMEFEEL.md. Rules engine untouched; owner art and asset code untouched (layout, words, motion only).

## Changes
- Rival turn: one growing sentence ("Cobalt draws a tile." -> "Cobalt placed a tile." -> "Cobalt placed a tile and took the road.")
  instead of three lines that replaced each other. Each new line repeats the last one, so nothing is lost. The final line stays
  under "Your turn" as a recap for your whole turn. A rival turn takes 2.4-3.6 s.
- Messages: scoring captions now stay at least 4 s + 1 s per 10 words (readMs in bf.js). The end-of-game caption queue is gone:
  the board pops and the result card show the count.
- Goal card: "How you win" + one sentence ("Have the most points when the last tile is laid.") + 3 short bullets.
- Learn to play, first screen: Tamsin's first line now says how you win in one sentence.
- Vibrate tick when a tile snaps (14 ms) and when a follower lands (10 ms).
- Legal squares glow more strongly (thicker pulsing border, inner glow, slower pulse; reduced-motion respected).
- 14 px floor: tiles-left counter and tutorial button subline were 13 px.
- Desktop: the camera zooms in closer (cell up to 230 px), the rival's move is framed larger, and the tile name shows next to the hand.

## Checks
- logic-test.js: 70/71, the same as before (rule 5 tile-geometry was already a known open failure; the engine is unchanged).
- feel-shots.js (new, touch at 390x844, mouse at 1440x900): a full game finished by touch taps on phone (38 turns, result card),
  no page errors, no stuck state. The only overlap it reports is the score pop meeting the seat chip during the fly-to-score animation.
- Shots: playable-shots/feel/ (title, learn-first, goal, first turn, mid-game t10, rival, result).
