# LEGO car shape research (Speed Champions, City, 2K Drive)

Status: BrickLink/Rebrickable pages return 403 to the fetcher, so IDs were checked via search snippets. Part IDs in section 3 marked V are confirmed; `?` marks anything from memory, including most size figures in section 1.

## 1. Proportions
- Grid: stud pitch 8.0 mm, plate 3.2 mm, brick 9.6 mm (= 3 plates), stud O4.8 x 1.7 mm. 1 brick = 1.2 studs of height.
- Speed Champions was 6 wide up to 2019. In 2020 it became 8 wide (Brickfanatics, V). The 6-wide cars had 4-wide bodies.
- 8-wide chassis lets axles sit 8, 9 or 10 studs apart for different wheelbases (Brickfanatics, V). Cars have room for a driver and navigator, and for a handbrake and gearstick.
- 8-wide typical: length 16-20 studs (~13-16 cm), width 8 studs (6.4 cm), height 9-13 plates (3-4 bricks, roof ~3.5 bricks), wheelbase 9-10 studs ?
- 6-wide typical: length 13-15 studs, width 6, height 8-11 plates ?
- Length:width about 2.2-2.5:1. Height:width about 0.6-0.7:1 for sports cars. SUVs ~0.9.
- Wheels 8-wide: rim Ø18 x 12 mm with tyre 24 x 12 low (rim 18976 + tyre 18977, V). Roughly 3 bricks high, so wheel Ø ~3 studs and ~0.35 of body height. Older 6-wide: 14-16 mm tyres ?
- City cars (minifig scale, 4-5 studs wide): wheel 30027 rim + 30028 tyre (Ø~14 x 6 mm, ?), plus small wheels 74967 (Ø8 x 9, V), mostly a 2-stud axle plate.
- Ride height: body underside ~1 plate above the axle centre line, chassis bottom about 0.5-1 plate above the road. The wheel is 2-3 plates taller than the sill. The wheel overlaps ~2/3 of its height with the body.

## 2. Techniques that give the shape
- Chassis: 8-wide vehicle base ("Vehicle Base 4x10 with axle holders" ?) or 2x8 / 2x10 plates plus axle plates. The width is built from plates, so there are no tall stacked bricks.
- Arches: mudguard plates (2x4 arch, 4x2.5 arch ?) wrap the wheels. Arches are in body colour; the wheel sits half inside.
- Hood and roof: curved slopes (1x2, 2x2, 1x3, 1x4) along the centreline. Tiles on flat top areas, so no studs show. Studs show only in the rear or side details.
- Inverted slopes (45 deg 2x1) at bumpers and sills give the lower lip. Wedge plates (2x3 / 2x4 L+R) taper the nose and tail.
- Windscreens: 2x4x2 / 2x6x2 / 3x4x1-1/3 canopy-type, set back from the nose in trans-black or trans-clear. Side windows are often black (print/sticker).
- Lights: SNOT headlight bricks (1x1 with side stud) and 1x1 round plates/tiles on the front face. Grille is a 1x2 grille tile, or black tile stickers.
- Jumper plates (1x2 with a centre stud) give half-stud offsets, so the nose or tail can be narrower or wider than the body.
- Spoiler: plate with handle or bar, tile with bar holder, on the tail.
- Colour: body is 1-2 colours (+ black trim, trans-black glass, silver/black rims with sticker). Accents in a third colour: stripes, a roof stripe, the hood.

## 3. Common parts (BrickLink design IDs; V = confirmed by a search snippet on BrickOwl/BrickArchitect/LDraw/Toypro/eBay listings, ? = not confirmed)
| Part | ID |
|---|---|
| Slope, Curved 2 x 1 | 11477 (V) |
| Slope, Curved 2 x 2 | 15068 (V) |
| Slope, Curved 3 x 1 no studs | 50950 (V) |
| Slope, Curved 4 x 1 | 61678 / 11153 (V) |
| Slope, Inverted 45 2 x 1 | 3665 (V) |
| Wedge, Plate 3 x 2 Right / Left | 43722 / 43723 (V) |
| Wedge, Plate 4 x 2 Right / Left | 41769 / 41770 (V) |
| Vehicle, Mudguard 4 x 2 x 2/3 with arch, no studs | 3787 (V); 2 x 4 arch variant 3788 (V) |
| Windscreen 4 x 4 x 1 (45 deg) | 6238 (V); newer Speed Champions screens differ per set (?) |
| Brick, Modified 1 x 1 with Headlight | 4070 (V) |
| Tile, Modified 1 x 2 Grille | 2412b (V) |
| Plate, Round 1 x 1 | 4073 (V; newer mould 6141 ?) |
| Tile 1 x 2 / 2 x 2 (with groove) | 3069 / 3068 (V) |
| Plate, Modified 1 x 2 with 1 centre stud (jumper) | 3794 / 15573 (V) |
| Plate, Modified 1 x 2 with Handle on Side | 2540 (V) |
| Vehicle Console / Steering Wheel Holder | 3829 (V) |
| Wheel rim 18 x 12 + tyre 24 x 12 low (8-wide SC) | 18976 + 18977 (V) |
| Wheel 8 x 9 small slicks | 74967 (V) |
| City wheel + tyre | 30027 + 30028 (?) |
| Minifig Crash Helmet | 2446 / 30124 (V) |

## 4. LEGO 2K Drive garage
- Brick-by-brick construction where parts snap together on a stud grid. Parts can be angled, moved, rotated, painted and stickered. Vehicle types: street, off-road, boat. Engine and horn sounds, stickers, Flairs, programmable triggers (padandpixel / toolsandtoys, V).
- Premade cars from City, Creator and Speed Champions are in game (V).
- Look in game (from reviews/screenshots, partly from memory): chunky, toy-like cars, oversized wheels, glossy ABS shading with bevelled edges, studs visible on top of exposed plates, smooth tiled hoods and roofs, saturated 2-3 colour schemes, trans glass.

## 5. Rules for our procedural builder
1. Grid: 1 unit = 1 stud; heights in plates (0.4 stud). Car 8 studs wide, 16-20 long, body bottom at plate 2, body top at 9-10 plates (one brick plus plates), roof at 12-13.
2. Wheel diameter ~3 studs (~1/3 of overall height); axle at 1.5 studs high. The tyre is wider than the rim (rim 12 mm, tyre ~12 mm wide), rims silver/black with dark tyres.
3. Wheel arches: cut a round notch in the body in front of/behind the wheel and wrap it with an arch piece, the wheel ~2/3 inside the body. The body is wider than the wheels by 1/2 stud per side.
4. Cabin: set back from the nose by 4-5 studs, about 2 bricks lower than the tail on sports cars. Use curved slopes for the hood and roof, and an inverted slope at the front/rear bumper lip.
5. Glass: trans-black 2x4x2/2x6x2 windscreen, tilted 30-45 deg. Side windows are flat black.
6. Max 3 colours: body, black trim, glass. Tiles on every flat top surface. Exposed studs only on rear deck or back.
7. Lights: 1x1 round plates or headlight bricks on the front face (white/yellow) and rear face (red); a 1x2 grille tile in the middle of the nose.
8. Taper: nose and tail 1-2 studs narrower via wedges; extra rounding via 0.5-stud offsets (jumper plates).
9. Render: bevel every edge ~0.3 mm look, glossy, flat shading; scale studs on top so they stay visible at 40 m.

Sources: BrickOwl (3787/3788, 61678, 6238, 2446, 3829 listings), BrickArchitect (6238, 2446), LDraw library (11477, 3794a), Toypro (inverted slopes), Brickfanatics (Speed Champions 8-wide, 2K Drive review), BrickLink 18976, BrickOwl 15068, Buka 74967, padandpixel, toolsandtoys.
