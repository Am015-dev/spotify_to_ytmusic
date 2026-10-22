# Nightrun D1: 22 Oct art delivery, ingest and wiring (handoff)

Branch nr/D1. Follow-up for the orchestrator and the laptop.

## Done
- Ingest: `ingest-assets.py` now also reads `assets.registry.json` (aliases and ids, sizes from `spec`), so the 53 names the old lists did not know are ingested (109 files, 0 fail).
- Sheets: all `games-src/anims/mainhattan-nightrun/sheets/**/*.webp` copied to `media/anim/` (20 new enemy ship sheets, the hull-registered ship loops, character sheets). `ready.json` keeps its anim entries (make-placeholders.py had dropped them) and lists the usable new stills.
- Flight enemies (`foeart.js`): every mapped enemy now draws its own sheet (flame / volley while the shot is armed / death clip where it died, no tint, no shake): edrone echarger eturret egate eflank eswarm emine eshielder esplitter ezbomber esniper ehealer eminelayer ezdrone ecdrone ediver ecrawler ebait, plus road units egtank / egturret (`leak.js`). The gate pylons stand upright (portrait sheet). Death clips are played for every sheet-drawn unit (`art.js` kill handler).
- Stills wired: `fx-decoy-drone` (decoy), `fl-secret` (secret sign). The ach-*, pk-*, fl-*, abup-*, spr-en-gwalker pictures were already looked up by name; they draw as soon as `ready.json` lists them.
- Street characters: sheets are in `media/anim/` and reachable through the existing `ART.anim` / `ART.FM` lookup; street2/streetfeel/streetlook/footq were not touched.
- `guard.py`: narrow exception for `games-src/*/assets.registry.json` (it is generated, 1.7 MB even compact). `asset-registry.py`: a delivery (rows the laptop master still calls NEEDS-ART / HAVE-SOURCE that now have a real file) is a note, not a STOP.
- `fingerprint-test.js`: waits until every enemy ship sheet is decoded before frame 0 (state used to depend on decode timing). With that, all 8 scenario STATE hashes equal `fingerprints.json`; only DRAW hashes changed (new art). fingerprints.json was not updated.

## Delivered but NOT usable as sprites (not listed in ready.json, nothing draws them; need a re-paint on a flat background, single object)
These are whole city scenes or tiny unusable crops, not isolated objects: abup-dd, abup-ecap, abup-trail, beat-drone, billboard-debris, boss-lane-beam, boss-spear, counter-wall, cruiser-beam, flavor-medal-pickup, flavor-train, fx-burn-trail, fx-chain-lightning, fx-glass-aura, fx-gravity-well-power, fx-neon-zone, fx-nova-field, fx-stasis-field, gate-laser-beam, nv-skin-dia, nv-skin-hex, nv-skin-sq, nv-skin-star, nv-skin-tri, nv-tw-gilded, nv-tw-lead, street-enemy-bullet, street-platform, street-relay-pylon.
Their registry rows stay `delivered` by file size, but they are not wired.

## Left for a design decision / other worker
- Hook rows that need positions or layout, not a lookup: ship-addon-pierce / reargun / sidecannons (up2.js:84-86; the art is fine), street pickups `foot/pk-*` and scenery `sc-*` (footart.js `FA.pickup` / `FA.scenery` are called by nothing yet), street layers (streetlook.js, F3).
- gwalker: ship-egwalker has no sheet; `spr-en-gwalker.webp` is ingested and drawn as a still.
