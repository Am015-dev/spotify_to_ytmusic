# Design review: Vinegrave play screens (W427, 8 Nov 2026)

Reviewed against games-src/BRIEF-GAMEFEEL.md and the owner verdicts. Philosophy: printed 1920s expedition cards, sepia and jungle green.
Shots: this folder (390x844 and 1440x900: title, learn, goal, first-turn, rival-turn, mid-game, result).
The impeccable launcher binary is missing here, so these scores come from looking at the shots against the impeccable and design-review checklists.
No detector was run.

| Item (design-review / impeccable) | Score | Why |
|---|---|---|
| Visual hierarchy | 7 | The board is the screen; one prompt line; the hand is 3 big cards; turn tracker in the dock head. |
| Consistency | 7 | One card frame, one chip style, one button set. Small resource glyphs stay drawn (not photo) on purpose. |
| Aesthetic fidelity | 7 | One public-domain sepia set. Weak: 6 guardian stand-ins and a few rough cut-outs. |
| States and feedback | 7 | Legal targets glow; tap opens a half-width card; points pop with the amount; rival moves are captioned. |
| Motion / game feel | 5 | FAIL: tap-to-select plus a button. No drag, snap, vibrate or camera follow yet. |
| Responsive | 7 | Phone, short phone and PC layouts; ui-audit A-F 0 on phone, phone-s and pc. |
| Accessibility | 7 | Contrast checked by ui-audit B; 44px targets; aria labels on icons; reduced-motion respected. |
| Typography / words | 7 | 14px minimum on phone; prompts are one short line; Goal card has one sentence and 3 bullets. |
| Aim clarity | 8 | Learn to play opens with "Goal: have the most points after 5 rounds"; Play shows a Goal card. |

Must fix (next round): drag the real piece onto a glowing site or into play, with a snap and a vibrate tick; fly cards to the discard pile; follow the rival's explorer on the map.
Should fix: swap the 6 guardian stand-ins for the natural-history plates (vg3.py entries are ready); give hand-card names 2 lines so "Creeping Dread" is not cut off.
What works: the art reads as one antique set; the phone screen shows one thing at a time; Play is clean with Hints behind a toggle.
