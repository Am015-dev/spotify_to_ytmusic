# Cauldron Fair: wired, round 3 (W354)

## 3D models (2/2 wired)
- models/bag.webp (+@512) -> the 3D bag that swings in while the hand rummages (ui6.js, already wired; default bag only).
- models/chip.webp (+@512) -> tumbling chip sprite on a draw (ui6.js, already wired).
- Both preloaded in ui12.js; the painted 2D bag/chip stays the fallback.

## 2D wired (1)
- media/title-phone.webp -> the title background on a tall phone (ui5.js `ttlImg`); the painted landscape title stays the fallback.

## Superseded (9)
- Files: btn-draw (code uses btn-draw-c), ui-button-go, ui-button-power, ui-stall, ui-stall-locked (the -c versions are shown).
- Files: ui-iconbtn-k, ui-node-boss-k, ui-node-done-k, ui-node-locked-k, ui-node-open-k (the plain names are shown; -k variants are alternates).
- Flow prompts bag-closed, bag-shake-a, bag-shake-b, bag-open, bag-empty moved to next-wave/flow-2d/cauldron-fair/prompts-superseded.json (the 3D bag covers them).

## Still unused
- Nothing wired is missing. The -c / -k alternates above stay in media/ unused on purpose.
