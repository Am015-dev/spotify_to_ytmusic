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
