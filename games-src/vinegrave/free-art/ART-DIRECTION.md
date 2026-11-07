# Vinegrave art direction (free kit, round 2)

**Style:** the same flat-vector family as perch-and-plume (Kenney flat language: no outlines, flat colour, rounded shapes,
soft top light). All objects, scenes and UI are SVG rendered by Chromium (`vg.py`, `vg2.py`, render.js), so edges stay crisp.
No glyph icons, no text in pictures.

| Slots | How |
|---|---|
| card-* items (35 + grant/trail) | one drawn object per card (machete, canteen, sextant, radio, seaplane...) on the same camp scene: canvas tent, ferns, wooden crate top. |
| card-* artifacts (35 + dread) | one drawn artifact per card (masks, idols, discs, horns, vessels, codex...) on the same ruin scene: mossy stone wall, vines, stone ledge, warm glow. |
| card-frame-item/art/fear, card-back | brass/wood, ochre stone and thorn frames with a clear centre; back = temple emblem on a green diamond pattern. |
| site-* (25) | one jungle backdrop per tier (normal, grand, coast, hidden fog + compass) with a site feature: steps, pools, arches, statues, crystals, caves, wreck... |
| guard-* (15) | Kenney Animal Pack Redux heads (CC0, vector @4x) recoloured to stone, mud, ember, glass, bone, jade, with glowing eyes and a coloured aura. |
| idol-* (12) | the same Animal Pack Redux heads in jade or gold on a stone plinth (sun, moon, star drawn flat). |
| res/tr/token/icon/shrine/explorer/temple/fx | small flat objects in the same palette; explorers = helmeted figures in the 4 player colours. |
| title/result/board/maps/track | the stepped temple and jungle layers composed as scenes; island map with terraces, camp and dotted trail. |
| portrait-* (8) | Kenney Toon Characters 1 (CC0), recoloured; the Old Warden = the stone guardian face. |

**Palette:** jungle #2f6b4a / leaf #4f9a5a, ochre #d9a441, teal #2a8a8a, jade #3fa07a, gold #e0b040, stone #9a9488,
wood #9a6a3c, canvas #e2d4b0.

**Why:** no CC0 pack covers 77 distinct 1920s expedition items and ancient artifacts in one hand, so they share one drawn
construction and two shared scenes, like the bird family. Rebuild: `PACKS=<dir> python3 compose.py <outdir>` (PACKS as in wildmark).
