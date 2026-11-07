# Wildmark R4 fix pass (W364, 7 Nov 2026), answers REVIEW-R3

Branch `shelf/W364-wildmark-fix` (from W360 art + brave-carson). Not deployed. Tested with the temporary art installed locally
(`games/wildmark/media/` = `temp-art/*.webp`, not committed) and again with no art (code-drawn fallbacks).

## Found -> fixed (review item each fix answers)
| Review item | Found | Fixed |
|---|---|---|
| Bug 1 / Top 1 (no art, text-card title) | Title was a text card; portraits grey silhouettes | Title rebuilt in the shelf layout (logo + tag on top, scene behind, actions at the bottom: New here / Play / "Table for Solo 2 3 4" / More options, Story, How to play). Painted `title-bg` when present, else a code-drawn dusk valley (mountains, river, pines, hawk). Missing portraits are now finished crests (character colour, gold ring, emblem animal, initial ribbon), used on the Story map, boss nodes and rewards. With temp art all 47 slots show pictures. |
| Bug 2 / Top 3 (Hard = Normal, Easy too strong) | normal vs hard 48% | AI retune in `src/ai.js` (habitat-majority awareness, denial, better end game for Hard; noisier, shorter-sighted Easy). `ai-gate.js` now also gates Hard vs Normal >= 60% and Easy avg <= 74. Numbers below. |
| Bug 3 / Top 2 (live score without habitat bonuses) | chips used WM.score (no bonus) | Chips, seat buttons and totals use WM.final (same numbers as the Scores drawer and result). Duplicate "Score" pill removed when seat chips show. |
| Bug 4 / Top 4 (two tutorial bubbles) | coach bubble ran during the tutorial | No coach bubble while the tutorial runs (GXH.phase(null) when GXT.running()). Checked: step 1 shows one bubble. |
| Bug 5 (Story ch1 -> ch2 jump) | Easy averaged 82 | Easy weakened (AI pass) + chapter 2 gives you a 2-acorn head start (new `you-acorns` twist in campaign.json, shown on the rival card). |
| Bug 6 / Top 4 (pops pile up) | 1.8 s pops overlapped | 1.3 s, on a dark pill, at most 2 live, the new one in its own row. |
| Bug 7 / Top 4 (stars stacked in a pill) | Wildmark's `.big` button style hit the shared `.gxc-stars.big` row | Scoped override: stars in a row, gold, no pill. Verified 3 stars for 3 goals met. |
| Bug 8 / Top 4 ("Turn it" on one-terrain tiles) | | Hint says "Tap Place (one terrain: no turning)". |
| Bug 9 / Top 4 (toasts cover chips/drawers) | toast at top:64 | In play the toast sits just above the instruction line; no toast while a drawer is open. |
| Bug 10 (menu chips 36 px, clipped label) | shared chips shrink in a scroller | Game CSS: chips 44 px, full labels, wrap (build menu check passes). |
| Bug 11 / Top 2 (rival's move unseen) | only a toast | After a rival's move the view switches to their valley for ~1 s with "Bram's valley: placed a Fox" and the new tile marked; viewing a rival says "<name>'s valley. Tap You to return". PC side panel shows a Season log. |
| Bug 12 (1 px seams in tutorial spotlight) | | NOT fixed: geometry is in shared `shell/gx-tutor.js` (off limits for this task). |
| Bug 13 (outro Skip + Back; Music button) | | Music row hidden until music files exist. Outro Skip/Back NOT fixed: shared `shell/gx-campaign.js`. |
| Top 5 (pattern pictures, why-line) | text-only cards | Hex pattern picture per animal card (first set) in Rules, Scoring cards and the token pop-up; result screen line "Bram won on habitat bonuses +2 vs +8 (yours first)". |
| PC (empty half panel) | | Season log under the market. Phone landscape: market moves to the right so the valley keeps full height. |
| Parity: Online | | Not added: Wildmark has no online mode yet (needs the shared server work, not a 30-min game change). |

Also fixed on the way: token pop-up crashed for card sets without a point table (`a`/`st` undefined); setup summary
precedence bug (always showed the multiplayer text).

## Gate results
See the DONE report for the numbers of the final run (build-all, rules-test, smoke, playthrough, extra-test, story-loss-test,
ui-audit A-F, ai-gate).

## Remaining
- Real painted art (temp art is a placeholder set), tutorial spotlight seams and outro Skip/Back (shared shell), Online.
