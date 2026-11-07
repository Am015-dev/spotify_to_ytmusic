# Kaiten Kitchen: playable pass (W394, 7 Nov 2026)

Bar: a first-time player on a phone (390x763) knows what to do within 60 seconds, and can finish the tutorial, a Quick game and Story stage 1.
Method: shots of title, tutorial steps, first turn, rival turn, scoring and result at 390x763 and 1440x860, looked at as a newcomer.
Tests: `game/tutorial-end.js` (tutorial to the end, both sizes), `game/play-ui.js` (Quick game and Story stage 1 by taps on visible, uncovered UI),
`game/rules-test.js`, `game/sweep.js`, `scripts/ui-audit.spec.js`.

## The 10 worst problems found (before)
| # | Problem (newcomer view) | Fix (after) |
|---|---|---|
| 1 | No "whose turn" banner and no always-visible instruction: the only hint was a first-time bubble that vanished, plus 13px yellow text | Banner chip ("Your turn" / "Odile's turn") and a 15px instruction line on a solid dark backing, two lines at most; the first-turn bubble is gone because the line replaces it |
| 2 | Header said "Round 1/3 · Turn 1..." cut off by five icon buttons | Two-line header on phones: "Round 1 of 3 / Turn 2 of 10" |
| 3 | Reveal showed everyone's pick at once, then only "Reveal!": no idea which dish was whose or what it scored | Covers lift one diner at a time; each step has a caption ("You serve Fish Slice. +5 pair"), the diner glows, others dim, a score pop with the reason |
| 4 | Hand passing was a blur of flying cards with the text "Hands pass along the belt" | Caption "Hands pass: your leftovers go to Odile. A new hand arrives." while the hands slide |
| 5 | Tutorial was a list of "tap this" lines: no reason, no character | Story prologue: Auntie Suzu (portrait disc) gives a reason, the player acts, Suzu reacts; four chapters with a story beat each; rival Odile has a custard bet |
| 6 | Tutorial and help text 13.5px | 15px bubbles, 16px titles; a test asserts >= 14px on every step |
| 7 | Help began with the long rules, no summary | Help opens with "How a turn works" in five short lines, then details, then "What we simplified" |
| 8 | Result was a bare "Odile wins!" with buttons | Result card in the game's voice with every diner's total, winner highlighted, Play again / Menu |
| 9 | The hand looked the same on your turn and while waiting | Your hand glows only on your turn and dims while the table plays |
| 10 | Quick game had no opening beat | A one-line opening from Suzu ("The belt hums, the plates roll. Pick one, pass the rest.") |

## Not done / explained
- Card faces keep the existing painted art and 13px names (two lines, bold) so ten cards fit two rows at 390px; a bigger card would need scrolling.
- Chapter loss variant: the campaign has win outros and boss `taunt` / `praise` lines; there is no separate loss outro text (retry is offered with the taunt).
- Rules check (`rules-check/kaiten-kitchen.md`): WRONG 0, MISSING 0, SIMPLIFIED 4: all four now listed in the help drawer under "What we simplified". Rules fixed 0/0.
