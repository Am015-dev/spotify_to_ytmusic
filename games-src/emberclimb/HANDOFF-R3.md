# Emberclimb round 3 (W358, branch shelf/W358-emberclimb-shell, not deployed)

## Shell adopted (copied, not rebuilt)
- `body.html`: `.gx-app` > `header.gx-bar` (title, hero HP + gold chips, bulb, Rules, Menu) + `.gx-main` > `main.gx-board` (the old `#app` render target) + `aside.gx-dock` (one prompt line, End turn, potions). Title lives in its own `#tscr`. Same markup as redline-rally / SPEC.md.
- `build.py`: inlines shell.js, gx-kit.js (+css), gx-help.js, shell.css, gx-menu.css with the shelf fonts (same block as redline-rally / build-all).
- New `src/help.js`: `GX.init`, rules cards for `GXH` (old rules overlay text, 16 cards, general + per phase with pictures), bulb, `GX.settings` Menu (This run: Relics, Deck; Leave: Restart, Leave run/chapter, Title screen; Sound on/off + Music picker via `GXMUS.open()`; Read: How to play; Tutorial; Tips).
- `ui.js`: own menu + rules overlays removed; top bar/potions moved to bar chips + dock; End turn moved to the dock (`#end` id kept); Settings button on the title.
- All 142ba01 fixes kept (phone hand, hero select switches, shop tap then Buy); in-run Menu > Leave run still leaves a fight.

## Unlocks and portraits
- `campaign.json`: chapters 2/3/4 unlock heroes `hero-s` / `hero-a` / `hero-m` (type portrait); Quick game hero select shows them locked (toast "Beat Story chapter N") until beaten; `?unlock=all` opens all. Relic gating NOT done (the engine relic pool is unchanged).
- Cast portraits use the art loader: stems `cast-guide`, `cast-rival` added to `assets.json` (placeholders until the Flow files arrive), `portrait` hook in `camp.js`.

## Found -> fixed
- Page bar title huge (global h1) -> 15px, hidden on phones.
- Tutorial launched from the Menu drawer -> waits for the drawer to close.
- Audit A (PC, 14-15px bar text) -> 16px at >= 1024; B (campaign lock/number contrast) -> dark discs, white lock; E "Next" and "Show rewards" dead taps -> scenario `begin()` ends a running guide and closes the Story map; Story open ends a running guide; star button marks itself on tap.
- Wrong tap during the guide gives feedback (dock line + toast); End turn is disabled until the guide's End step.

## Results
- `ui-audit.spec.js` phone / phone-s / pc: A0 B0 C0 D0 F0, **E1 each**: "dead button: End turn" on the "Replay the guide" surface (guide fight; the guide kit blocks taps off-target, so the audit sees no change). Fix tried: disable End turn until its step + redraw after the guide starts; still flagged, needs a look at how the guide surface is entered (shared `gx-tutor.js` blocks input before the game handler runs).
- `build-all.py --quick emberclimb` (VIS_SLUGS=","): scenarios 11/11 PASS; smoke.js, tutor-test.js, rules-test.js PASS.
- Not done: played Story ch1 -> ch2 by hand with real taps after the last change (smoke and tutor tests do tap through title, Quick climb, guide); PC menu items only checked by screenshot and the audit.

# W363 polish (branch shelf/W363-emberclimb-polish, from W358 + alex/brave-carson-rbpmlk, not deployed)

## Done
1. **Result screens** (`ui.js` `resultScr`, `UI.showResult`; used by Quick and Story; camp.js overrides `GXC.result` so Story shows the same screen):
   what killed you (`G.killer` set in engine `killHero`, with `G.killIn` fight kind) or the final boss, floors reached / total, final deck list grouped with counts
   (tap a card = large card, tap again closes), relics row (tap = name + text), Story chapter stars + star lines + unlock lines, buttons Play again (`#again`) / Next chapter (`#rnext`, won only) / Story map (`#rmap`) / Title (`#rtitle`).
2. **Enemy intents** (`ui.js` `intentParts`, `intentBox`, `UI.explain`): one code-drawn SVG icon per kind (attack with number, big attack, block, buff/strength, weak, vulnerable, frail, poison,
   burn, slime, daze, sleep, unknown), several icons when a move does several things; tap an intent = panel with one plain sentence per part. New stems in `assets.json` (+ Flow prompts, `tools/gen-assets.js`):
   `intent-weak intent-vuln intent-frail intent-poison intent-burn intent-slime intent-daze intent-unknown` (the old `intent-*` stems stay).
3. **Relic unlocks**: `campaign.json` chapters 2-9 each unlock one relic (type `relic`: clover-dice, gold-tooth, smoking-censer, tin-flute, healing-moss, gale-cloak, whetstone-ring, phoenix-ash).
   Locked relics stay out of the random pool (rewards, shop, events) via `E.lock()`, set from `UI.lockedRelics()` before every `newGame`; `?unlock=all` opens all; start relics of chapters are unaffected.
   Shared change: `'relic'` added to the allowed unlock types in `shell/gx-campaign.js` (additive; goes out with the next build-all).
4. **Temporary art**: `tools/temp-art.js` (game-icons.net glyphs, CC BY 3.0, on code-drawn shapes) -> `temp-art/*.webp`, 85 slots (intents, statuses, orbs, stances, nodes, 19 relics, 9 potions, 4 heroes, 14 enemies, 2 cast, 4 card frames).
   Credits: ASSETS.md bottom + Menu > About. **Deploy copy step:** `cp games-src/emberclimb/temp-art/*.webp games/emberclimb/media/` BEFORE build-all (build only requests stems whose file exists), then run
   `stamp-copyright.py`. Do not copy `CREDITS.md` / `credits.txt`. A Flow file with the same stem replaces any of them. Regenerate: `git clone --depth 1 https://github.com/game-icons/icons.git <dir>; node tools/temp-art.js <dir>`.
   Not yet drawn (code placeholder only): backgrounds, the 100+ card pictures, dice, fx, gems, card back, events.

## Found -> fixed (W363)
- Story intro/outro scenes: Skip button sat on top of Next on every scene. Cause: the game's old `.ghost` CSS rule (position:fixed, unused) matched the shared `.gxc-btn.ghost`. Renamed to `.ec-ghost`.
- Audit A on PC for Menu tab chips (14.1px) and one row hint (14.4px) -> 16px at >= 1024 (game CSS override).
- Result screen was a bare "New climb" button with no cause, deck or relics -> rebuilt (see Done 1); the Story result now uses the same screen.
- Intent bubble showed only a skull for every debuff or junk move -> per-kind icons plus tap-to-explain.
- Local test setup: Playwright 1.56.1 wants a browser build that is not installed; symlink `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` to the 1243 headless shell. A local `media/` folder makes the build ask for files the staging server does not serve (build-all then FAILs with 404s): do not leave one in `games-src/emberclimb/`.

## Open
- Audit (phone-s / phone / pc, A-F): Game surface 0 on all. Remaining items are all the shared Menu panel: tab chips flagged "dead button" (they scroll the panel, no DOM change) and "Music" label contrast 3.0:1 at phone-s. Shared kit, not fixed here. The earlier End-turn-on-guide-replay E item no longer appears now that the audit waits for the menu walk.
- Real-tap runs: Quick defeat on phone (390x763) and Quick climb to a defeat on PC (1440x860) show the new result screen, tapping a deck card opens the large card. A Quick victory by tapping was not reached by the simple bot (it dies); the victory screen was checked through `?scn=ec-result` plus the Story run below.
