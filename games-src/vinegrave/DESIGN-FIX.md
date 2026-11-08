# Vinegrave: design fix list (D6, 8 Nov 2026)

Shots: `design-shots/vinegrave-{1title,2learn,3goal,4firstturn,4firstturn-b,5mid,6result}-{390,1440}.png`
(390x844, 1440x900). Built with `build-all.py --quick vinegrave`. Scenarios: `?scn=vg-board`, `?scn=vg-result`.
Not tested: a full game by touch. `3goal` re-shows the guided round (the How to play button starts the tutorial, there is no stand-alone Goal card
on screen at game start; the goal text lives only in the Rules sheet, `src/ui3.js` line ~113, and tutorial step "The goal", line ~188).

## Scores (0-10)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 7 | 7 |
| Aim is clear (Learn first screen + Goal card) | 4 | 4 |
| Board and pieces are the screen (phone) | 7 | 7 |
| Art and polish | 6 | 6 |
| Readability (size, contrast, overlap) | 6 | 5 |
| Motion and messages (reading time) | 5 | 5 |
| Responsive (390 and 1440) | 7 | 6 |
| **Overall** | **6.0** | **5.7** |
Gate (every row >= 7) NOT met: aim, art, readability, messages, responsive.

## Fix list, most impact first
1. **No Goal card; the Learn first screen never states how you win.** `2learn-390`: step 1 is story ("The boat is gone and Tamsin is ashore")
   pointing at Trail Notes. The aim only appears at tutorial step "The goal" (src/ui3.js ~188) or in Rules. Change: make the first step of the
   Learn flow and a Goal card shown at every Start (both tutorial and normal) say: "Win by having the most points after 5 rounds." plus 3 bullets:
   "Dig sites and explore ruins for compasses and idols." / "Overcome guardians: 5 points each." / "Dread cards cost 1 point." Remove "Track, temple tiles..." list from the sentence.
   Use the existing `.gxt` step object (`title: 'The goal'`) as step 1, move the story line to step 2.
2. **PC: the "Storm clouds over the vines. Five rounds before the rain." toast sits on top of the "Round 1 of 5 / Your turn / 1 action left" header.**
   `5mid-1440`. Selector: `#toast` (style.css line 148, `top:calc(var(--gx-bar-h) + 54px)`). Change: on `min-width:1000px` anchor `#toast` over the map
   area (left:40%, top:calc(var(--gx-bar-h) + 12px)), never over `#insp`/the side sheet, and keep the 4s + 1s per 10 words rule.
3. **Player strip text is tiny.** `5mid-390`: "Track 0 · Idols 5 · Cards -2" is ~11-12px and runs two lines tall in the plate. Selector: the seat plates
   at the top (`.seat small` / the `Track` line built in `src/ui2.js`). Change: font-size 14px, show only 3 values as icons + numbers at 16px; move "Cards -2" into a tap-to-explain.
4. **Title screen has 9 controls and no art.** `1title-390`: Learn to play, Start a game, Rivals (4 chips), difficulty (3 chips), Friends on this device,
   Story, How to play. Selectors: `#start .tbox`, `.chipb`, `.tsb`. Change: keep Learn to play / Start a game / Story as the three buttons; fold Rivals, difficulty,
   Friends and How to play into a "Game setup" row that opens a sheet; put the existing jungle art behind `#start` (empty slot only).
5. **Result: a tie shows "Defeat".** `6result-390`: You 36, Tamsin 26, Okoro 36 and the banner says "Defeat, Dr Okoro Bell wins" with no tiebreak reason. Selector: result box built in
   `src/ui3.js` ~line 91 (`.rban`, `.win`). Change: when totals tie, add the rule line "Tie on 36. Okoro wins on research track (8 to 3)." and use "Close loss" not "Defeat".
   Also `.tbtn` "Play again" measured 1.1:1 against its own gradient in my script (false positive from the gradient); visually it is fine, so no change.
6. **Seven-row score table on a phone.** Same shot: 3 columns x 8 rows of 14px text. Change: show 3 big totals with a bar per player, "Details" button for the rows.
7. **Market card art is a repeated placeholder** (gold ring) for all six cards on the bottom row at 1440 (`5mid-1440`). Selector: `.cd .pic .ph` (style.css 179-183). Change: wire per-card pictures from
   `assets.json`, or at least tint the ring by card type and show the card's icon larger than the "2" badge.
8. **Hand cards cut off at the right edge on phone** (`4firstturn-b-390` third card clipped, "Pass" button beneath). Add a scroll hint (edge fade) or reduce to 2.3 visible cards with snap.

## What works
Map rows with "explore for 3 compasses" headings are readable at 390. The glow + "Best now: dig at Clear Spring" coaching line is plain and short. Result screen has a big gold Play again button.
