# Tidewake: playable pass (W402, 7 Nov 2026)

Tidewake already had a phone board, a staged 17-step tutorial and a 10-chapter Story. This pass looked at it as a newcomer (390x763 and 1440x860), fixed what was cheap and safe, and lists what is left.
Proof: `game/tutor-test.js` (tutorial played to the end by touch taps, both sizes, 0 problems), `game/ui-play-test.js` (a Quick game and Story chapter 1 played to the result by tapping only visible, uncovered UI at 390x763, 0 console errors), `build-all.py --quick tidewake` PASS, rules-test 38/38.
After-shots: `playable-shots/` (title, first turn, rival turn, result).

## The 10 worst problems, before / after
| # | Problem (first minute) | Status |
|---|---|---|
| 1 | Phone lay turn had no "whose turn / what now" banner; only "Pick, turn, then Place." in small text under the buttons | FIXED: a boxed "Your turn: lay a current." banner above the hand (15px, solid backing); the line under the buttons stays the one instruction |
| 2 | Tutorial bubbles were bare instructions ("Tap the glowing one"), no reason to act | FIXED: prologue "The Lantern Race": Grandmother Osk guides, Cobalt is the rival, every step has a story reason, a reaction and four chapter openers (text in `game/texts.js`, `TUT_TEXT`) |
| 3 | Top bar had 6 buttons (Hint, Crews, Log, Rules, Pieces, Menu) | FIXED: Pieces moved into Menu (audit rule F top bar now 0 on pc, phone) |
| 4 | Title: two big primary buttons (Story, Play now) and a long scrolling setup list on the phone | NOT FIXED: shared start-card layout; Quick start already sits first. Audit F on title: 1 |
| 5 | The first-turn coach bubble covers part of the board | NOT FIXED: the coach kit places it; it dismisses with "Got it" |
| 6 | Hand tiles are line art with a tick/cross badge, no printed name | NOT FIXED: the tick/cross + outcome line is the plain-words effect; per-tile names need new art |
| 7 | Rival turn caption is cut to 8 words | NOT FIXED (log below the board shows the full step list) |
| 8 | Contrast under 4.5:1 on a few painted panels (Menu, Rules drawer, Story map "Act" labels) | NOT FIXED: shared drawer/campaign CSS (read-only); audit B phone 8, pc 22 |
| 9 | Desktop text under 16px in many places (146 nodes) | NOT FIXED: needs a desktop type-scale pass |
| 10 | Phone setup screen leaves the lower half empty | NOT FIXED |

## Audit (rules A-F, staged build): the gate "A-F 0" is NOT met
phone A0 B8 C0 D0 E2 F1 | phone-s A25 B4 C0 D0 E0 F1 | pc A146 B22 C0 D0 E6 F0. Before this pass: phone F5, pc F2. E hits are mostly toggles that are already selected ("dead" = no change on tap) and a locked chapter node.
## Not done from the brief
- Per-step animated rival turns with a caption each: the existing replay already plays a move one beat at a time (`ui2.js`); no new caption layer was added.
- Rules fixes (addendum 2): the rules check found WRONG 0; MISSING 3 are low-confidence reads of the rulebook. W391 changed nothing for this game, so none were touched. Rules fixed 0/3.
- `game/smoke.js` (old jsdom script) is stale: it looks for a button that no longer exists; the build's scenario run and `ui-play-test.js` replace it.
