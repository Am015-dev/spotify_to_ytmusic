# PCSHELL: per-game follow-ups (shell change on shelf/W592-pc-shell, 20 Nov 2026)

What the shell now does: the dock is a bottom sheet only when the window is under 720 px wide, or portrait and under 1000 px wide.
Any landscape window 720-999 px wide (a 1366 laptop at 150 % = 910x512, 1024x576 is already >= 1000) gets the side dock, with the board
at full height. Default dock width is `clamp(300px,28vw,520px)`. `shell/gx-menu.css` (loaded last) undoes per-game `(max-width:999px)` sheet
heights and grid rows in that 720-999 landscape band, for pages without `html.ph`. Nothing changes at >= 1000 px except the default dock
width and wider popups at >= 1280 px. Portrait phones are unchanged.

Each game below sets things in its own files, so it is NOT edited here. One line per fix, for that game's fixer.

## 1. Phone flag `html.ph` (short side <= 500 forces the phone layout in a short desktop window)

Suggested rule for all five: keep real phones in landscape (touch), free mouse windows:
`let ph = (short <= 500 && (innerHeight > innerWidth || innerWidth < 720 || matchMedia('(pointer:coarse)').matches)) || (coarse && short <= 600);`
(A plain "portrait or width < 720" would drop 844x390 touch phones out of their phone-landscape layout, so the coarse-pointer term stays.)

- cauldron-fair `src/ui5.js:295`: apply the rule above; head `src/head.html:275` `(max-width:999px)` dock 43dvh -> use `(max-width:719px),(max-width:999px) and (orientation:portrait)`.
- kaiten-kitchen `game/src/ui5.js:219`: same rule; head `game/head.html:223` same media query swap.
- lantern-dive `game/src/ui5.js:276`: same rule; also `--gx-dock-w` at `game/head.html:9` and the 760 px setup column `game/head.html:110`.
- final-approach `game/src/ui5.js:116`: same rule; head `game/head.html:319` same media query swap.
- hollowbough `game/src/ui6.js:134`: same rule.
- Other games with their own `phDetect` (same `s<=500` idea, check with the rule above): tidewake `game/ui7.js:7-8` (also forces html.ph on purpose for landscape >= 1024: keep),
  thornbound `game/src/ui6.js:13`, shipwreck-isle `rc/ph.js:16`, nebula-aces `xw/ui-ph.js:16`, sunglaze `azul/game/src/ui8.js:9`, doorkick-dungeon `munch/ph.js:8`,
  crown-city-smash `kot/phboot.js:11`. stitchwise `src/ui1.js:35` (portrait <= 600 only) and vale-of-banners `src/ui.js:314` are fine.

## 2. Per-game head overrides of the dock (listed, not edited)

- tidewake `game/head.html:41-43,254` (`--gx-sheet-h` 46/40 dvh in `(max-width:999px)`): now neutralised in the 720-999 landscape band by gx-menu.css; swap the
  query to the phone one for clarity. `game/head.html:44` hides `#sheetbtn` only at >= 1000 px: use `(min-width:1000px),(min-width:720px) and (orientation:landscape)`
  (the sheet toggle button still shows next to the side dock at 910x512).
- shipwreck-isle `rc/head.html:260` dock height `var(--gx-sheet-h,48dvh)` in `(max-width:999px)`: same query swap.
- nebula-aces `xw/head.html:39,76,135,173` (`(max-width:999px)` dock border-top, padding, 60dvh summary dock): same query swap.
- perch-and-plume `src/head.html:10` (`--gx-dock-w`), `:161-162,314-315` (`--gx-sheet-h` in `(max-width:999px)`): same query swap.
- redline-rally `src/head.html:28,185` (`--gx-dock-w`), `:146` (`(max-width:999px) and (max-height:520px)` grid), `:194`: check the 910x512 shot after the swap.
- emberclimb `src/head.html:292` (dock capped at 340 px): raise the cap to ~460 px for 1920 screens.
- vale-of-banners `src/head.html:168-169` (dock `clamp(250px,34vw,330px)`): raise the cap.
- wildmark `src/head.html` (`--gx-dock-w:340px`, about 10 `(max-width:999px)` rules for `#mk`, `#acts`, `.seat`, coach): these now apply next to a side dock at 910x512; check.
- sands-of-qamar `ft/src/head.html:13-19`: a copy of the old shell CSS; it will keep the bottom sheet under 1000 px until replaced with the new media queries.
- crown-city-smash (kot) and cauldron-fair: tested on this branch, side dock works at 910x512 and 1024x576 with no head change.
- thornbound and vinegrave use their own layout grid (not the shell dock), so this change does not move them; thornbound already shows board + side panel at 910x512.

## 3. Keyboard

The shell now presses the focused control on Enter/Space, or the first visible enabled primary button when nothing is focused
(`[data-gx-primary]`, `.gx-primary`, `.gxh-ok`, `.gxc-btn.go`, `button.pri`, `.btn.pri`, `.pb.pri`, `button.primary`, `.btn.primary`, `button.go`, `.btn.go`;
inside the open popup first). It runs after the game's own handlers and skips keys a game already handled (`preventDefault`).
A game whose main button has another class should add `data-gx-primary` to it; a game that must not get this sets `GX.noKeys=true`.
