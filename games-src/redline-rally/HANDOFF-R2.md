# Redline Rally HANDOFF round 2 (W336)

Branch `shelf/W336-redline`. Built file `redline-rally.html` is NOT committed (orchestrator deploys).

## What changed
1. **Rules cross-check**: `rules-notes.md` now has an 18-row table. 0 numbers changed, 15 VERIFIED, 3 UNSURE (spin-out stress cards, adrenaline condition, lap count): checked from memory only, no rulebook text was available; the owner should check those three against the printed book. `rules-test.js` re-run: 240 games, 0 stuck, 0 invariant failures.
2. **HUD art slots** (all through the existing `data-art` loader, placeholders are coloured dots until the picture exists): `ui-engine-tray` behind the count row (stretched), `icon-heat` + `icon-stress` beside Engine / In hand / Stress in hand, `icon-gear` above the gear label, `icon-lap` + `icon-place` in the top bar pills.
3. **Upgrades mode** (setup screen "Upgrades Off/On", default off, remembered): each human drafts 3 of 6 upgrade cards one at a time (shared pool, 4 copies each), computer drivers draft after; picks are shuffled into the deck; played like a speed card with a bonus (data table `UPG` in `src/data.js`, effects in `resolveNext`/`finishMove`, AI aware of them). New invariant: upgrade count per driver. Pictures: 6 stems `card-upgrade-<id>` (wave 2, 5:7) in `assets.json`; Flow prompts `next-wave/flow-2d/redline-rally/prompts-wave2-ratio-5x7.json`; registered with `register-assets.py` (43 rows). The five "no code slot yet" notes were removed from the slot texts. `gen-assets.py` is stale vs the committed manifest (it would re-write the prompt files): not re-run, new rows were added to `assets.json` directly. Update `gen-assets.py` before using it again.
4. **First-game guide** (`src/tutor.js`, shared `gx-tutor.js`): 7 steps, one staged round (fixed hand, car 3 spaces before a limit-5 corner): goal, pick gear 2, push (4+3, see the burn warning), read the cost, brake (2+2), Go, heat is fuel. Offered as the first title-screen option on a first launch ("New here? Learn in 5 minutes"), later as "Tutorial", in How to play and in the in-game Menu. Never saved; marks done in `gxt-redline-rally`.
5. **Sound**: `src/sound.js`: synthesized effects (tap, gear, card, go, burn, clean corner, spin, boost, slipstream, win, lose) on one context shared with `gameaudio.js` (GA); one mute toggle (title `#sndT`, topbar `#sndB`, in-game Menu) for effects and music, saved in `rr_snd`. Music through `gx-music.js` (GXMUS) with slots menu / game / tense / victory / defeat (a and b); only files that exist in `games/redline-rally/music/<slot>-<a|b>.mp3` are registered at build time (so no 404s, same idea as media); cue list `next-wave/music/redline-rally/cues-wave1.json` (2 versions per slot, mood, bpm, loop, no vocals, no original names). No picker drawer (needs `shell.js`, which this game does not use); GXMUS still picks a/b and shuffles.

## Tests (all pass)
`node rules-test.js` (240 games, half with upgrades); `node r2-test.js` (25 checks on real taps, phone 390x763 + PC 1440x860: guide steps, end card, mute, draft, upgrade card in hand, invariants after 3 rounds, HUD slots, 0 console/page/HTTP errors; needs `PW=<games-src>/node_modules/playwright`); `smoke.js` PASS both sizes, 0 errors; `build-all.py --quick redline-rally` PASS (VIS_SLUGS=","); `guard.py` ok. One screenshot each: `shots/r2-main-phone.png`, `shots/r2-main-pc.png` (git-ignored). Fixes found by the audit: hid the track-name pill under 480 px (it clipped), gear label 13 px.

## Not done / next
Music files and the 6 upgrade pictures need generating; a Music picker drawer would need the shell; no scenario for the draft screen yet; the guide has no drag/rotation test (tap-only).
Merge note: `next-wave/expected-assets.json` is one long line; if another branch registers too, re-run `register-assets.py` after merging instead of hand-merging.

## Round 2b (owner correction: play it, shelf structure, audit)
**Found while playing -> fixed**
- Title was a different layout from the old games (no Story, no first-launch guide order, page scrolled, heading cut off at the top) -> rebuilt as Play / Story chapters / Guide / Quick game options (collapsed on phones) / How to play / Sound; scrollable box starts at the top.
- No shelf shell (bar, board, dock, closable drawers) -> in-game screen is now `gx-app` with `shell.js` + `shell.css`: top bar (Lap, Place, hint bulb, Rules, Sound, Menu), board, dock with the status line and the gear / hand / Go panel; Rules is a drawer (it was a one-off popup).
- On phones the Rules / Sound / Menu buttons were pushed out of the bar -> title hidden under 600 px, tighter buttons.
- First click on Rules showed an empty drawer -> content is filled on every open.
- Duplicated "How to play" heading in the drawer -> removed.
- Result screen in a chapter never reached the campaign -> `GXC.finish(G)`; stale slipstream buttons stay in the panel after the last move (harmless, hidden by the result screen).
- Upgrade card names under 13 px, white-on-orange buttons 3.3:1, PC text under 16 px, `data-engine="G.cars.0.eng"` threw, track-name pill clipped -> short names at 13 px, darker button gradients, 16 px text at PC width, `G.cars[0].eng`, pill hidden on phones.
- Quick game options used a native details element whose closed contents still counted as "covered text" in the scenario audit -> own collapsible (hidden attribute).
- World edge colour of the track fallback did not match the board -> same green.

**New structure (same as the old shelf games)**: shell layout (above); Story = shared `gx-campaign.js` map with `campaign.json` (9 chapters, 3 acts, 3 bosses, twists, stars, easier offer, saved progress) + `CAMPAIGN-DESIGN.md`; guide = `gx-tutor.js` (first option on first launch, and the Story button runs it first on a first visit, then opens the map); help = `gx-help.js` bulb (Suggest hint, 5 rules cards, "How does this work?") + Rules drawer.

**Tests added**: `story-test.js` (map -> chapter 1 and 2 played on real DOM clicks on phone and PC, progress saved, back to the title, 0 errors); `r2-test.js` (guide, upgrades, HUD slots); `look.js` (screenshots for a human look).
**Not done / next**: chapters 3-9 were not played end to end (only 1-2 by test); the Grand Final low-heat and hairpin tight-limit twists are covered by the rules test only through options, not a played chapter; hints flag per chapter is not used (the hint bulb is always on); portraits are emoji (no cast art yet); music picker drawer; the title does not show a Continue button (a race is never saved).

**Independent audit (scripts/ui-audit.spec.js, staged build, phone / phone-s / pc)**: A0 C0 D0 E0 F0 on all three; B1 (the lock emoji on locked chapters, drawn by the shared campaign kit, 1.8:1; the other 6 kit disc items were fixed with a dark disc override in head.html). `build-all.py --quick redline-rally` PASS (6/6 scenarios). E fix: the dock's "resize" button changed the layout mid-audit so later taps hit the canvas; the grab handle (not a button) still resizes. `story-test.js`, `r2-test.js`, `rules-test.js` PASS.
