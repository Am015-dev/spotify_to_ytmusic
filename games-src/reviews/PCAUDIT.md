# PCAUDIT: desktop (mouse) audit of every shelf game, 20 Nov 2026

Scope: the 23 deployed builds in `games/<slug>/` on this branch (Mainhattan Overdrive, Mainhattan Nightrun and Deep Signal skipped).
Playwright 1.63 Chromium, mouse only (no touch, `isMobile` false). Sizes asked for: 1366x768, 1920x1080, 1280x720. Extra sizes added because they match real
Windows laptops at 125-150% display scaling: 1366x650 (browser chrome), 1024x576 and 910x512.

## Summary (read this first)

- **No game is UNPLAYABLE at the three requested sizes.** Every game starts by mouse, a ~2 minute run of 200-600 clicks per game and size changes state, and no
  control needed to finish a turn was off-screen. 4 games are POOR, 11 OK, 8 GOOD (table below).
- **The likely cause of "unplayable on PC" is the 999 px breakpoint, not the big screens.** Any desktop window under 1000 CSS px wide (a 1366 laptop at 150% Windows
  scaling is 910x512) gets the phone bottom-sheet layout (`shell.css:35`) on a landscape screen only ~512 px tall. There the board shrinks to a strip and the
  action buttons fall below the fold. Worst: **tidewake** (board ~240 px tall, Place/turn buttons below the fold), also cauldron-fair, final-approach, doorkick-dungeon
  (menu cut), thornbound, hollowbough (see "Small windows").
- Most games already use the shared right dock at >=1000 px, so the layout is board-left / dock-right. The weak spots are (1) fixed-size content that does not grow on
  a big screen (rampart-and-vine, doorkick-dungeon, vale-of-banners, stitchwise), (2) narrow phone-style title/menu cards (360-640 px) on 1920 screens,
  (3) campaign map capped at 560-640 px, (4) no keyboard shortcuts for play.
- Not tested: full games to a result screen, held-mouse drag (code uses pointer events, so it should work), hover-only controls (static check only).
  Five games' bot stalled at a canvas-only step early on (crown-city-smash, nebula-aces, perch-and-plume, shipwreck-isle, tidewake), so their "mid" shots are early-game.

## Ranked table (worst first)

Verdict is for 1366x768 / 1920x1080 / 1280x720 by mouse. "Share" = biggest board/canvas area divided by viewport area (1366 / 1920). `<1000px` = verdict at 910x512
from one early frame, so treat as indicative.

| # | Game | Verdict | `<1000px` | 3 biggest problems | Recommended desktop layout |
|---|------|---------|-----------|--------------------|----------------------------|
| 1 | rampart-and-vine | **POOR** | OK | (1) Board tile is a fixed ~200 px (201 px at 1366, 202 at 1920, 173 at 1280): the play area is 3-4 % of the screen and floats on an empty wood table. (2) No dock: all state sits in two thin strips, seat chips `.seat` ~100 px wide with 12-13 px text and the `Road/Town/Priory/Field` row at 13 px (`carc/game/src/head.html:20`, `skin.css:9`). (3) The tile to place is a 132 px box bottom-centre (`head.html:62`, `#htile`) with the tile description under it; only way to see more is pan/Recentre. | Board fills the centre at full height with zoom-to-fit (tile >= 25 % of the shorter side), hand tile + rotate bottom-left, scores in a right dock (`--gx-dock-w`), rival chip on the left of the top bar. |
| 2 | doorkick-dungeon | **POOR** | POOR | (1) Card text 5.5-8.5 px: `.card .kind` is `clamp(5.5px,..,11px)` (`munch/head.html:221`), `.card .cn` `clamp(8px,..,17px)` (:204), `.gold` 6 px (:219); QA bot logged 8-11 MAJOR tiny-text hits per size (`span.kind`, `span.cn`, `span.gold`). (2) Hand cards stay ~140 px wide at 1920 (5 cards use 760 px of 1920) while the table is empty; reading a card needs a tap-open panel. (3) Right dock (420 px) holds one log card and ~600 px of blank parchment; at 910x512 the title menu is cut below "Heroes at the table". | Table centre, hand across the bottom at 220-260 px wide cards (container font >= 12 px), big hover/click card preview on the right, log + rival chips in the dock. |
| 3 | vale-of-banners | **POOR** | OK | (1) Board is 556x604 at 1366 (32 % share), 520x556 at 1280; only 1012x916 at 1920. (2) Player board is a 3x2 phone grid squeezed into a ~190 px strip left of the board (`#bd` `vale-of-banners/src/head.html:25`), leaving dead space. (3) Dock capped at 330 px (`head.html:168`, `clamp(250px,34vw,330px)`) so it is narrow at 1920. | Board centre at full height, own buildings row at the bottom, rival board on the left, dock (dice, actions) at the right 380-420 px. |
| 4 | stitchwise | **POOR** | POOR | (1) The time-track mini board is ~150 px wide with ~12 px cells next to a 520 px quilt; patch offers live in a scrolling dock (`div.offer.up` off-screen at 1366x650). (2) Own quilt left + rival quilt + track stacked in one column leaves no room for a hand; the score popup (shell drawer, 520 px) covers the whole board when opened. (3) AI-first start: "Aurelia is thinking" for the first turn with nothing to click (looks hung). | Own quilt centre, rival quilt top-right, time track as a full-height strip right of the quilt, patch offers as a horizontal row at the bottom. |
| 5 | short-fuse | OK | POOR | Stacked phone-style rows leave the right 40 % empty; at 1366x768 the hand row touches the bottom edge (no bottom margin); header takes ~170 px (bar + clue bar + turn strip). | Rival stands left/right, own stand bottom with 24 px margin, clue/turn strip in a right dock. |
| 6 | kaiten-kitchen | OK | POOR | Hand strip clipped/partly off at 1280x720 (bottom 14 px); dock (420 px) mostly empty with one info card; setup screen cut at 910x512. | Diner rows in the centre, passing hand bottom, scores + dish info in the dock. |
| 7 | sunglaze | OK | OK | Phone-style factory circles; player wall panel only ~300 px wide at right; title menu card 556 px (`.menugrid`). | Factories centre, own wall panel 40 % width right, rival wall top. |
| 8 | twin-thrones | OK | OK | Main column is 1112 px at 1920 (58 %), no dock, wood on both sides; city rows read small (rival city 25 % of the height empty). | Two city strips centre, pyramid left, log/score dock right. |
| 9 | sands-of-qamar | OK | POOR | Land grid uses 62 % width with ~95x65 px tiles and 12 px tile text; right panel 380 px crammed with "last moves"; menu card 520 px (`shell.css:27`). | Grid centre at full height, auction/log in a wider right dock. |
| 10 | final-approach | OK | POOR | Dock 420 px mostly empty; dice tray bottom-left small; at 910x512 the round dialog covers the board. | Instrument board centre, dice bottom, cockpit log right. |
| 11 | lantern-dive | OK | OK | Title/setup column fixed 760 px (`lantern-dive/game/head.html:110`), setup grid 1180 px wide at every size; setup screen needs scroll at 1366x650. | Setup as two columns at >=1280. |
| 12 | tidewake | OK | **UNPLAYABLE** | Square board (768/1080 px) = 56 % share, dock 300-410 px: fine. At 910x512 the board is a ~240 px tall tilted strip and the sheet (46 dvh, `tidewake/game/head.html:41`, :254) puts Place/Left/Right below the fold. | Keep board square left; dock fixed 360 px right down to 800 px width. |
| 13 | nebula-aces | OK | OK | Arena frame is 64-72 % of the width with nebula art on both sides; right panel ~400 px; camera/zoom controls tiny icons (2 text nodes <12 px). | Fine; widen panel at 1920. |
| 14 | wildmark | OK | POOR | Hex board small in a 1026 px canvas (a 3-tile map uses ~25 % of it) until the map grows; right dock 4 cards stack; coach bubbles cover the board at 1024x576. | Fit-to-content zoom for the board. |
| 15 | perch-and-plume | OK | POOR | Own hand row ~95 px cards with name cropped under 12 chars; title/setup column 360-520 px (`perch-and-plume/src/head.html:172`); at 910x512 "Keep these" floats over the list. | Hand as a bottom row at 160 px cards. |
| 16 | emberclimb | GOOD | POOR | Dock capped 340 px (`emberclimb/src/head.html:292`); hand cards ~150 px; cards cut at the bottom at 910x512. | Keep; hand 190 px cards. |
| 17 | redline-rally | GOOD | OK | Track canvas 76-83 % share; hand/dock right; `Suggest` button overlaps the first card at 1366 (QA overlap x2). | Keep. |
| 18 | crown-city-smash | GOOD | POOR | Board 65-74 % share, dock 410 px; dice tray fine. Bot stalls on canvas dice (use Roll button). | Keep. |
| 19 | cauldron-fair | GOOD | POOR | Board 64-74 %, dock 30 %; at 910x512 the pot is ~140 px tall. | Keep. |
| 20 | hollowbough | GOOD | POOR | Dense but uses full width; "Places" list needs inner scroll at 1366x768 (last row cut); text 13-14 px. | Keep. |
| 21 | thornbound | GOOD | POOR | Board 710-1022 px square + dock + hand: the best desktop layout on the shelf; story map is a 640 px column. | Keep; widen map. |
| 22 | vinegrave | GOOD | POOR | Uses full width; title card 460 px (`vinegrave/src/style.css:207`). | Keep. |
| 23 | shipwreck-isle | GOOD | OK | Board 78-84 % share, dock 17 %; title menu 640 px (`rc/head.html:124`). | Keep. |

(No hover-only or touch-only dead controls were found: every `touchstart` has a matching pointer/click path; drags use `pointerdown/move`. Not verified with a held mouse.)

## Shared causes (one shell change fixes many games)

1. **Phone sheet under 1000 px wide**: `games-src/shell/shell.css:35-47` (`@media (max-width:999px)` turns the dock into a bottom sheet, drawers into 88 dvh sheets)
   and `shell.css:48`. Capped heights at `shell/gx-menu.css:19-20` (44 dvh portrait / 34 dvh landscape) are overridden per game, e.g. `tidewake/game/head.html:41,254`
   (46 / 40 dvh). Fix: only use the sheet for portrait or width < 720; keep the side dock for any landscape window >= 720 px wide.
2. **Shell CSS is copy-pasted into game heads**, so a `shell.css` edit does not reach these until each is rebuilt: `ft/src/head.html:13-19` (sands-of-qamar) and the
   per-game `--gx-dock-w` overrides: `perch-and-plume/src/head.html:10`, `redline-rally/src/head.html:28,185`, `emberclimb/src/head.html:292`,
   `vale-of-banners/src/head.html:168-169`, `lantern-dive/game/head.html:9`. Dock width is capped at 420 px by default (`shell.css:4`), 330-340 px in two games.
3. **Phone flag `html.ph`**: `short <= 500` forces the phone layout (dock width 0) in a short desktop window: `cauldron-fair/src/ui5.js:295`,
   `kaiten/game/src/ui5.js:219`, `lantern-dive/game/src/ui5.js:276`, `final-approach/game/src/ui5.js:116`, `hollowbough/game/src/ui6.js:134`; CSS in
   `cauldron-fair/src/head.html:307`, `final-approach/game/head.html:321`, `kaiten/game/head.html:225`, `lantern-dive/game/head.html:188`.
4. **Fixed-size content that never scales up**: rampart tile (`carc/game/src/head.html:62`, `#htile`), doorkick card font clamps (`munch/head.html:204,219,221`),
   lantern-dive setup 760 px (`lantern-dive/game/head.html:110`). Use `clamp()` against `min(vw, vh)` with a larger max.
5. **Narrow title/menu cards on big screens** (card stays 360-640 px at 1920): `vinegrave/src/style.css:207` (460), `perch-and-plume/src/head.html:172` (360),
   `rc/head.html:124` (640), drawers `shell.css:27` (520) / `:29` (980), tooltips `shell/gx-help.css:4` (300 px). Not wrong, but 23-33 % of a 1920 screen.
6. **Campaign map is a phone column**: `shell/gx-campaign.css:12-13` (`.gxc-screen` 560/640 px), `:42` (`.gxc-path` 560), `:81` (`.gxc-sheet` 560).
7. **No keyboard play**: `shell/shell.js:8` only closes drawers on Escape; `shell/gx-kit.js:193` arrows step the rules gallery. Game shortcuts exist only in
   crown-city-smash (r/p/h/e), shipwreck-isle (h), nebula-aces (t/s/p), rampart-and-vine (r), wildmark (r). Add Space/Enter = primary action, 1-9 = pick, Esc = back.
8. **Viewport meta** is `width=device-width,initial-scale=1` everywhere (fine). `emberclimb/src/head.html:3` and `wildmark/src/head.html:4` add `user-scalable=no`
   (blocks pinch-zoom; harmless on a mouse).
9. **Per-game dock is often empty**: final-approach, kaiten-kitchen, doorkick-dungeon use the 420 px dock for one card; move hand/score there on desktop.

## Small windows (910x512 and 1024x576), not asked for but likely the real complaint

- 910x512 (below the 1000 px breakpoint): tidewake UNPLAYABLE (buttons below the fold, board strip); cauldron-fair, final-approach, doorkick-dungeon (menu cut),
  thornbound (hand cut), hollowbough (cramped), emberclimb (cards cut), perch-and-plume (button over list) are POOR; rampart, nebula, redline, shipwreck, sunglaze, vale OK.
- 1024x576 (>= 1000 px): dock layout holds but boards shrink to ~330 px tall; wildmark and hollowbough get cramped, coach bubbles cover the board.
- Shots: `reviews/PCAUDIT-shots/*-910x512.png`, `*-1024x576.png`.

## Method and shots

- Driver: `games-src/scripts/qa-bot.js` copied with the viewport made configurable (quick phase only, 121 s per game and size, random UI bot, mouse clicks) plus my own
  measurements (largest canvas/board, content width, text under 12 px, off-screen controls, scroll overflow).
- Shots: `games-src/reviews/PCAUDIT-shots/` (26 MB, PNG, palette-reduced): `<slug>-title-1366.png`, `<slug>-mid-1366.png`, `<slug>-mid-1920.png` (resized to 1600 px wide),
  `<slug>-mid-1280.png` for POOR/borderline games, `<slug>-title-1920.png` for 7 games with narrow title cards, plus the small-window shots above.
