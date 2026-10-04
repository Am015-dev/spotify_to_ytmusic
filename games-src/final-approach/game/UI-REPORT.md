# Final Approach UI report

Files (`games-src/final-approach/game/`): `head.html` (CSS), `body.html` (page skeleton), `src/ui1.js` .. `src/ui7.js` (concatenated by `build.py` into `ui.js`), `src/layout.js` (panel geometry),
`src/net.js` + `src/netstrip.js` (online), `build.py` (single-file build, `final-approach.html`), `shoot.js` (screenshots).

## Structure
* **The DOM is the layout, hit and accessibility layer; PixiJS paints under it.** `render()` (ui2) rebuilds `#pz` from `FA.layout(w, h, {mods, me})`: every slot is a real `<button class="slot" data-slot=..>`, every die a `<button class="die" data-s data-d>`,
  the approach strip is a row of `<button class="sp">`. With the painted panel on (`html.fapx`) the DOM keeps its text and hides its own look; `pxSync()` (ui7) then reads the boxes and moves painted sprites there.
  A sprite only shows what its button shows, so the hidden crew member's dice stay `?` on the painted layer too (`px-test.js` checks it).
* **Layout** is one pure function (`layout.js`), used by the DOM layer, the Pixi layer and the paint scripts. Landscape: 1120 logical units wide (both windows across the top, three rows of controls, two dice trays).
  Portrait: 800 wide, 5 rows, the viewer's own tray is wide (`me`), the other tray narrow and not tappable. Height follows the content (`r.ch`), the panel is centred. The phone dock height is computed in `applyPhone()` from the panel height so
  the panel always gets its minimum scale (slots >= 44 px: 390 x 664 and 375 x 553 included).
* **Modes** (ui3): `vs` computer crew mate, `guided` (scripted hands in `GUIDED_SCRIPT`, tips in `TIPS`), `hot` (pass-the-device screen between seats, dice values never in the DOM while nobody holds the device), `watch` (two computers), `net` (online).
* **Screens:** painted title (Play / Online / Resume if a save exists / How to play), setup (airport list by difficulty band, seat cards, level, phone summary line + Configure sheet), story/briefing, guided tips, rules drawer, flight (reference) drawer,
  log drawer, menu drawer (sound, music, graphics, guide, speed), final card with landing checklist and stats.
* **Painted panel (ui7):** plate, frames, wells under every slot (gold ring on legal ones), dice that fly from the tray into the slot (arc, spin, squash and a dust puff), roll-in from above at the start of a round, switches, tokens, dial needle, speed
  gauge needles for both markers, fuel bar, a scrolling approach window with plane tokens, and a landing / crash ending (plane glides in on the runway picture, or tilts and drops with a flash and a shake) before the final card.
  Graphics setting Auto / High / Medium / Low (pixel ratio and particles), registered with PerfHUD; Pixi WebGL, else Pixi's canvas renderer (`?px=canvas`), else the plain DOM view (`?px=0`; also used when WebGL context is lost, in jsdom, or with no Blob URLs).
* **Phone:** `html.ph` switches on by itself (short side <= 500, or coarse pointer and short side <= 600; `?phone=1/0` forces). Portrait: panel on top, dock below with the prompt in the bar; landscape: panel left, a 180-280 px rail right.
  Text >= 13 px, tap targets >= 44 px, no page scroll (checked by `lay-phone.js`).
* **Audio:** `audio/final-approach/` (15 sfx + 1 music, all reused CC0 samples; see its `ASSETS.md`). `SND_MAP` in ui6 maps game events to sounds; silent without Web Audio.
* **Art:** painted by `paint/paint.js` (`art/*.webp`, `art/manifest.json`); drop `art/<id>.png` to replace any piece (sizes in `ART-PROMPTS.md`).

## Tests (run from `game/`, screenshots land in the gitignored `shots/`)
`lay.js` (1366x768, 1920x1080, 768x1024, 1100x700), `lay-phone.js` (390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342), `click.js` (jsdom random clicker, 18 configurations, ANIM=0 and `--anim`), `px-test.js`.
The exact numbers of the last run are in the hand-off message.

## Known gaps
* Layout and painting were judged on Chromium with SwiftShader only: no real phone, no real GPU, no Safari.
* The painted art is a procedurally painted first pass (gouache filters), not hand illustration; `ART-PROMPTS.md` has everything needed to replace it.
* The Hint star shows the normal computer's choice for the player's own seat (one move, with a short reason).
* Reduced-motion users get no flight animations (dice snap into place, no ending animation).
