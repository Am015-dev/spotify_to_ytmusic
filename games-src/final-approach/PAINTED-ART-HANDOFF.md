# Final Approach: painted art hand-off (laptop → Linux session, 2026-10-09)

Mostly **no wiring**: as `ART-PROMPTS.md` says, `game/build.py` embeds `art/<id>.png` in place of the painted `art/<id>.webp`, at the size in `art/manifest.json`. Just rebuild.

## `art/<id>.png` (Flow paintings at the exact manifest size)
- **Sky strips** `sky-dawn`, `sky-day`, `sky-dusk`, `sky-night` (1024×192): a centred band from a wide sky painting.
- **Terrain strips** `ter-mountain`, `ter-water`, `ter-city`, `ter-ice`, `ter-plain` (1024×96): the bottom band of a wide terrain painting.
  - These are opaque, with a little sky above the ground. If the game layers them over the sky strip and that looks wrong (`ter-water` shows a cream band), keep the WebP stand-in for that one or key the top band out.
  - Check left–right tiling; `ter-plain` repeats cleanly.
- **Planes** `planeside` and `planegear` (512×200), keyed transparent and centred.
  - The gear-up tail has an orange edge and the gear-down tail is plain blue.
- **Crew** `crew-0` (captain) and `crew-1` (first officer), 256×256.
- **Key art** `title` (1440×810), `end-land` and `end-crash` (1280×720).
- **Not regenerated** (pixel-exact grids and instruments, so they stay with `paint/paint.js`): the atlases `dice`, `tokens`, `icons` and the panels `dial`, `gauge`, `pillbar`, `plate`, `frame`, `tray`, `screen`, `planefront`.

## `games/final-approach/media/` (separate files)
- **Portraits** `camp-<id>.webp`, 256×256: `voss`, `ravi`, `alder`, `foxmere`, `seabright`, `bowlrock`, `cloudspire`, `orrin`, `castlemoor`, `spires`.
  - `palmreach` too (all 11).
  - Set `artBase: 'media/'` in the `GXC.init` call.
- **Card backs** `back-default.webp` (crew cards) and `back-spires.webp` (the campaign `cardback` unlock `spires`).
- **Tables:** `table-night-lake`, `table-storm` and `table-valley`, the campaign `table` unlocks.
- `title-phone.webp` (portrait title).

## Music
`../audio/final-approach/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.
