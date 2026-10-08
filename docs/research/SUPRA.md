# SUPRA: orange street racer family (v88k, alex/od-supra)

Alex's request (2026-10-08): "build variations of the following car: https://www.lego.com/cdn/product-assets/product.bi.core.pdf/6649353.pdf. Look on the web for similar style and include them in the game."
UI names are original; real set numbers / brands appear only here and in code comments.

## Source: 77260 building instructions (lego.com PDF 6649353, 108 pages, downloaded 2026-10-08)
Read from the rendered pages (cover p1, finished car p103–105, parts list p106–107):
- Speed Champions 8-wide car, 292 pieces, 1 minifigure (Brian O'Conner). Retail: brickfact lists 292 parts, April 2026 (UK £22.99, DE €27.99).
- Chassis: 1× black 8-wide car base 6605193 (p106).
- Wheels: 4× tyre 6575731 + 4× silver 5-spoke rim 6610986 (p104 step 121, p107).
- Mudguards: 2× orange wheel-arch 6491330 + 2× orange printed arch 6614371 (green graphic) (p107).
- Windscreen: 1× 6614372 with orange printed frame (p103 step 120). Open targa cockpit, 2 blue seats, black uprights behind the seats, orange bar over them.
- Rear wing: light grey blade (2× 6318584) on two struts with dark grey end plates (p105, p107).
- Side graphic: lime plates (6529086, 6561724, 4529160) + printed panels: the green "tribal" graphic on doors and rear arches.
- Nose: rounded orange curved slopes, dark twin-headlight clusters, black lower intake, low bumper.
- Booklet p3 lists the companion sets: 77256 (time machine car), 77261 (Italian endurance racer, Ferrari logo), 77252 (APXGP F1 car), 77262 (Ken Block '65 Hoonicorn V1: black with gold wheels).

## In-game build (src/98su_supra.js, `SU_car`)
Same builder parts as every template (editable in BUILD): T6x16 chassis, `arch` mudguards, `wL` wheels (wheelbase 10 studs), `ws6` screen, `seat`, `cs14/cs12` curved slopes,
`C8x1` nose/tail curves, `hl` headlights in dark grey, `grl` intakes, `tl` taillights, `diff`, `wing` (8×2 blade on struts), lime `T1x6` side stripe + `flame` decals.
Proportions: stud 8 mm, plate 3.2 mm, brick 9.6 mm (GB_U .6 / GB_PH .24 = 0.4). New part: `wLG` = wheel L with gold rims (77262).

| id | UI name | after | what changes |
|---|---|---|---|
| t_su | Orange Street Racer | 77260 | faithful: orange, targa, blue seats, lime graphics, grey wing |
| t_su_mid | Midnight Street Racer | 77260 | colourway: black body, purple graphics/seats, black wing |
| t_su_gt | Orange Street GT | 77260 | hardtop coupe, no wing (duck-tail spoiler) |
| t_su_wide | Widebody Track Racer | 77260 | widebody: wheels 1 stud out + red flares, white/red track livery, high black wing, plate |
| t_su_sky | Silver Night Tuner | 76917 | silver coupe, blue graphics, wing |
| t_su_pink | Pink Roadster | 77241 | open roadster, pink, black interior |
| t_su_v8 | Black Gold V8 | 77262 | black widebody, gold rims, engine through the hood, spoiler |

RIDES: STREET tab shows "🧡 STREET RACER FAMILY" (4 cards) and "🏁 TUNER FRIENDS" (3) rows first (default sort/filter only).
All are ≤ 10 studs wide and 18 long → BC size check keeps the default handling.

## Similar-style sets (verified online 2026-10-08)
- 76917 2 Fast 2 Furious Nissan Skyline GT-R (R34): 319 pieces, Brian O'Conner. https://www.brickfanatics.com/lego-76917-2-fast-2-furious-nissan-skyline , https://lego.com/en-il/product/2-fast-2-furious-nissan-skyline-gt-r-r34-76917
- 77241 2 Fast 2 Furious Honda S2000: pink convertible, 300 pieces, Suki, June 2025. https://www.brickfanatics.com/lego-speed-champions-fast-furious-honda , https://brickranker.com/news/lego-speed-champions-2-fast-2-furious-honda-s2000-77241-revealed
- 77262 Ken Block's '65 Ford Mustang Hoonicorn V1: 345 pieces, June 2026, new fender elements push the wheels out. https://stonewars.com/news/lego-mustang-hoonicorn-77262/ , https://www.brickfanatics.com/lego-speed-champions-hoonicorn-revealed
- Other JDM references (not built): 76896 Nissan GT-R NISMO (2020, 298 pcs, first Japanese car in the theme) https://brickfact.com/sets/lego-speed-champions-nissan-gt-r-nismo-76896 ; 76901 Toyota GR Supra (2021, 299 pcs, 8-wide) https://www.brickfanatics.com/?p=128093
- 77260 facts: https://brickfact.com/en-gb/sets/lego-speed-champions-the-fast-and-the-furious-toyota-supra-mk4-77260
- No official Speed Champions Mazda RX-7 found (only third-party MOCs), so none built.
- Note: one retailer list gives 77261 as the Supra; the booklet itself shows 77261 = the Ferrari racer and 77260 = the Supra (booklet wins).
