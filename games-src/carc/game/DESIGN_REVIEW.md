# Design review: Rampart and Vine (W478, 8 Nov 2026)

Reviewed against: BRIEF-GAMEFEEL.md, REVIEW-FIX.md (R2), DESIGN-FIX.md (D3), UI-BAR.md. Look: a painted tavern table with painted tiles.
Shots (390x844 touch, 1440x900 mouse, 375x667): `games-src/carc/playable-shots/feel/` 1-title, 2-learn-first, 3-goal,
4-first-turn, 5-mid-t10, 6-rival, 7-result.

## Scores (impeccable critique / design review, 1-10)
| Row | Impeccable | Design review | Why |
|---|---|---|---|
| Board is the screen | 8 | 8 | Whole valley framed and readable (phone cells 54-104 px, PC fills the screen, tray floats) |
| Visual hierarchy | 7 | 7 | Board first, one turn line, tray; the score strip and turn line still use 2 top rows on phone |
| Consistency | 7 | 7 | One button art per role, one status style, one piece style (owner 3D followers on the board) |
| Aesthetic fidelity | 8 | 8 | Painted textures read at tile scale, lit tile bevel, owner table, owner portraits on the rival line |
| States and feedback | 8 | 8 | Glows pulse, tile snaps with a buzz, rival tile flies, turns and lands, score pops never stack |
| Responsive, no overlap | 7 | 7 | feel-audit (e) 0 after 10 turns; follower buttons spread apart; seat chips fit 390 px |
| Accessibility | 7 | 7 | Text >= 14 px on phone, status mirrored to a live region, contrast fixed on Valley complete |
| Words and aim | 8 | 8 | Goal card: one sentence + 3 bullets; board line <= 8 words; COPY-FIX applied |

## What changed (REVIEW-FIX R2, in order)
1. Owner 3D: all 8 .glb load (lite, then full) and the board followers are the owner models, dyed/based in the seat colour.
   Wave 7 inbox art (end-*-b/c, table-castle-hall, table-vineyard-dusk, tex-*-b/c) is not in the repo or inbox yet: end variants
   are pre-wired (used once the files are in media/); tables and texture variants need the files first.
2. Camera: no deep aim zoom; the whole valley stays in view, the newest tile is followed gently; PC fills the screen.
3. Tiles: textures one repeat per tile, wider roads and walls, light and bevel per tile.
4. Rival turn: tile lifts from the bag, flies, turns, lands (about 3 s), then the follower drops and the score pops; no fast captions.
5. Phone overlaps: labels avoid pieces, end pops never stack, "left" fixed, Tamsin bubble unclamped, Valley complete readable,
   status shows one message.
6. logic-test rule 5: passes (71/71) on the merged base.

## Skipped (with reason)
- DESIGN-FIX 7 (extra line on the first follower prompt): the coach already says it once; a second line breaks the 8-word rule.
- DESIGN-FIX 8 (title chips in a disclosure): the start flow is shared with the scenario and feel drivers; left for a shell pass.
- Visual baselines (visual.spec.js): no `.baselines/` files in this sandbox, so those 3 checks cannot run here.
