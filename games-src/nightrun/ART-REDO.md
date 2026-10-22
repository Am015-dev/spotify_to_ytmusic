# Art that is bad by itself (22 Oct 2026, from `qa/assetaudit.js`)

Wiring is fixed behind `?artfix` (code can not make these better). Measured at 390x763 dpr 2 and 1440x860.
Style line for every prompt: "painted comic-book style of the street layers: same purple/teal rain light, thick dark ink outline of constant weight, flat cel shading with a rim light, side view, transparent background (flat white if transparency is not possible), no ground shadow, no text".

## On-foot characters (the "amateur" ones)
What is wrong with all of them: 256 px tall frames, 4 frames per idle at 4 fps, stiff three-quarter pose, hands and weapons drawn small, and no run/shoot frames that match the idle silhouette. Redo as 512 px tall (shown at ~250 device px, so crisp on dpr 2), 8 frames idle, 8 run, 4 shoot, 6 die.

| id | what is wrong | prompt (add the style line) |
|---|---|---|
| kai (anim/kai/*) | stiff front-facing stand, flat jacket, tiny pistol, identical silhouette in every pose | "young courier hero in a dark hooded jacket with teal piping, backpack, pistol raised, pure side view facing right, 512 px tall, idle breathing sheet of 8 frames" |
| grunt | thug with a bat held low and unreadable, brown jacket merges with the street | "street thug in a bright orange jacket and cap, steel pipe over the shoulder, side view facing left, 512 px tall, 8-frame walk" |
| gunman | red scarf / small gun, pose is a stand-still | "red-scarfed gunman, crouched aiming stance, side view, large readable pistol, 512 px tall" |
| bruiser | heavy armour is one flat block, no arm swing | "armoured brute with a huge fist, wide stance, side view, rim light on the armour plates, 512 px tall, 8-frame stomp" |
| knife | knife is 10 px wide in the idle | "green-hooded knife fighter, blade held forward and long, side view, 512 px tall" |
| drone, turret, mech | look fine but are 256 px: the drone and turret are drawn up to 1.3x | same machines at 512 px, transparent background |
| foot/*-idle ... (1024 px poses) | 55 files are still grey PLACEHOLDER cards; never drawn | regenerate after the strips above exist; then delete |

## Low-resolution sources (drawn upscaled, so blurry; the flag counts are from the audit)
| id group | native -> drawn (device px) | fix: regenerate at | prompt |
|---|---|---|---|
| en-shielder, splitter, bomber, sniper, kamikaze, healer, carrier, minelayer | 128 -> 168 (1.3x) | 512x512 | "<enemy role> flying enemy ship, top-down, painted style, transparent background" |
| pk-bubble, stasis, gwell, splint, decoy, dashr, empr, glass, hornet, lance, ovd, zone | 128 -> 168 (1.3x) | 256x256 | "glowing pick-up orb with a small icon inside, rim light, transparent background" |
| fl-captive, lamp, sign, billboard, chest, crate, secret, medal-* | 128 -> 168 (1.3x) | 512x512 | "side-view street prop, same line weight as the street layers, transparent background" |
| ach-* (30), soon-* (7), kit-* (15) | 128 -> 168 (1.3x) | 256x256 | "round medal / badge icon, thick outline, single glyph, transparent background" |
| gk-medic, gk-plate, gk-evasive, diff-*, fx-crown, ac-*, rx-*, rule-*-icon, var-* | 24-96 -> up to 2x | 256x256 | "flat glyph icon in the HUD style, transparent background" |
| wpmount-* (16), spr-ship-drift/lancer/nova | 256x128 -> 336x168 (1.3x) | 512x256 | "weapon mount seen from above, painted, transparent background" |
| bp-blackout | 128 -> 1100 (8.6x) | 1024x1024 | "soft dark vignette, transparent centre" |
| ui-hud-mult, ui-hud-bars | 20-24 px nine-slice | 128x128 | "HUD plate with thick painted frame, nine-slice friendly" |
| anim/ship-e*/flame (small flames) | 29-94 px -> 1.5-1.9x | 256 px wide strip | "engine flame, 6 frames, additive, transparent background" |

## Not in this checkout
The 309 full-size originals (HANDOFF-FULLSIZE-2026-10-22.md) are uncommitted on the laptop, so the audit's THUMB flag finds nothing here. When they land, run `qa/assetaudit.js` again: flat backgrounds on sprites are keyed at load (`ART.fix`), street layers lose enclosed white gaps (`AFX.fixFoot`).
