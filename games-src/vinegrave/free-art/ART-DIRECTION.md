# Vinegrave art direction (vintage expedition set, round 3)

**One look:** a 1920s expedition scrapbook. Every picture is a public-domain photograph, print, map or museum object,
cropped big and centred, colour-graded to one sepia-and-jungle palette, given a little paper grain and a light vignette,
and (cards, sites, guardians, portraits) printed with a thin dark ink line inside a cream margin. No text appears in any picture.
Rebuild everything with `python3 -I vg3.py` (downloads are cached in a temp folder; `--only slot,prefix` rebuilds part).

**Palette** (tritone map of luminance, plus about 20-35 % of the original colour so gold stays gold and jade stays green):
black point #2a1f14 (lifted, so a 118 px phone card does not go muddy), jungle shadow #334d3a, sepia mid #9a6630,
light sepia #e0cc9c, parchment #efe2c0. Accents kept from the originals: jade #3fa07a, gold #d9a441.
Vignette is half strength, mids lifted and contrast raised a little so the subject pops at thumbnail size.

| Slots | How |
|---|---|
| card-* items (expedition gear) | the real object, cut out of its museum photo (flood fill from the edges over smooth regions, soft rim) and set on aged parchment. Where no object photo exists the card shows a period photograph or print mounted as a plate on the same parchment (seaplane, airship, mule, tent, phonograph, hammock, letters). |
| card-* artifacts + card-dread | pre-Columbian objects (masks, gold, jade, vessels, horns, discs, a skull) cut out the same way and set on dark jungle stone with a warm glow. Item cards = light parchment, artifact cards = dark green stone, so the two types read apart at a glance. |
| card-frame-item / art / fear, card-back | redrawn procedurally at 300x420 with the same transparent window as before (x 22-277, y 22-397): brass and wood, green stone and gold, black thorn and jade. The back is a gold temple-and-sun emblem on a green diamond lattice. |
| site-* | 1840s-1900s photographs and prints of ruins, pagodas, banyans, cascades, coast and mist, cropped to 4:3 with captions cut away. Foggy woods for site-hidden-*. |
| guard-* | natural-history plates (Audubon, Haeckel, Seba, Brehm, Hahn, Peale) so the animal reads at a glance; golem = carved stone figure, warden = a stela drawn in 1843 by an expedition artist. Any plate that could not be fetched falls back to a carved animal effigy from the museum set (see CREDITS). |
| idol-* | museum figures cut out on transparent, with a thin ink rim and soft shadow so they sit on any board colour. |
| portrait-* | pre-1929 studio and press photographs of unnamed-in-game people, cropped head and shoulders; portrait-warden is a carved stone head. |
| title-bg, result-*, board-map, map-act1..3, track-bg | title and results: a ruin-in-jungle photograph with a calm dark pool at top centre for the logo; maps: 1500-1762 charts of the Caribbean and Pacific coast graded to ink on parchment. |
| temple-2/6/11, res-*, tr-ship, token-* | round medallions of temple photographs; small objects cut out on transparent. |
| fx-*, icon-*, shrine-slot, explorer-0..3, tr-boot/car/plane | **kept** from vg.py / vg2.py (flat vector): glow overlays, UI glyphs and the four player-colour pawns must stay clean silhouettes at 40 px; a photograph would not read. |

**Why these sources:** museum open-access objects (Met, CC0) are photographed on seamless grey, so they cut out cleanly and look
consistent; Library of Congress press and travel photographs supply the 1900-1925 gear, aircraft and people; Wikimedia Commons
supplies public-domain natural-history plates. Every file's licence is checked (Met `isPublicDomain`; Commons `LicenseShortName`
must say public domain or CC0, so files re-tagged CC BY were rejected).

**Known weak spots:** several gear cards use period stand-ins (the box camera is a camera obscura, the sextant an astrolabe, the radio a telegraph
sounder, the canteen a Pueblo water jar, the dinghy a terracotta boat model); a few artifacts reuse the same gold-pendant family
(gilded beetle, glass moth, idol-fish); thin or openwork objects (idol-moon, bone dice) have rough cut-out edges.
