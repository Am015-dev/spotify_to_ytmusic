---
name: game-look
description: Use before any work on how Mainhattan Nightrun looks (flight or street): blending sprites into the scene, backgrounds and parallax, bullets, explosions, ship and actor size, HUD over play. Makes the game look like one coherent picture instead of pasted layers. Pair it with the impeccable skill (critique/audit/polish/colorize) for the HUD and menus.
---

# Game look: one picture, not pasted layers (owner, 24 Oct 2026: "make everything blend smoothly", "looks sloppy")

Workflow (WORKER-RULES 17): one phone 390x763 + one PC 1440x860 screenshot of normal play FIRST, look at it next to a benchmark-game
screenshot of the same moment (URL only), name the three worst problems, fix those, take one new pair, stop. Never a grid of shots.

## Value and depth (the main reason things look pasted)
- Three planes: far backdrop (dark, low contrast, desaturated, cooler), mid scenery (medium), play layer (highest contrast and
  saturation). The play layer must be the brightest, most saturated thing on screen; a backdrop as busy and bright as the ships is the
  first thing to fix.
- Atmospheric perspective: each plane further back is lighter-or-darker toward the sky colour and less saturated. Haze between planes.
- Parallax ratios grow smoothly toward the camera (e.g. 0.1, 0.3, 0.6, 1.0, foreground 1.3). A layer that barely moves while others
  fly by reads as a wallpaper.
- A foreground layer passing in front (girders, signs, steam, rain streaks) at low alpha sells "flying through" more than any tint.

## Light and palette
- One key light direction for the whole scene; every sprite lit from that side (rim light on the same side as the brightest neon).
- Limit the palette: the backdrop's 2-3 dominant hues define the scene; actors may contrast in hue, never in light direction.
- Reserved colours: enemy bullets get a colour nothing else uses; player shots a second one; pickups a third.

## Sprites
- Use the owner's sprites and ALL their states (idle, attack, hit, defeat, volley, flame, death). A still image where a sheet exists
  is a bug. Never draw an object with fillRect/arc/SVG when an owner sprite or fx sheet exists; ask the owner for missing art.
- Same pixel density for everything on screen: do not scale one sprite 3x and another 0.5x of its source; pick sizes so texel size
  matches within ~1.5x.
- Same outline weight and shading style across actors; mismatched outlines are the clearest "pasted" signal.
- Grounding: contact shadow on the street; in flight, engine glow and light spill on nearby haze.

## Motion
- Nothing moves at constant speed in a straight line except bullets. Ease in/out, curves, banking along velocity.
- Every animation plays at a rate tied to what it shows (run cycle to ground speed, flame flicker steady, explosion full length).

## Feedback that blends
- Hits: short white flash on the sprite (<= 0.1 s), spark at the contact point, never transparency or blinking.
- Explosions: the owner's fx-boom sheets drawn with normal blending (they carry smoke); add only a brief additive core flash.
- Screen shake only for big events; small and short.

## Check before reporting
Look at your one pair next to the benchmark frame and answer in the README, per row SHIPS, BULLETS, ENVIRONMENT, FEEL: what still
looks pasted or sloppy. If the honest answer is "most of it", say so; do not report a probe number as success.
