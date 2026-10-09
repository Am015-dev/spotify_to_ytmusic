# PRO_PLAN: make Overdrive feel professional (investigation worker 22, 2026-10-08)

Alex (verbatim): "The garage builder frontend need to be more organised its like a mess, the perks stats can be much more based on level see how the game 2k drive has them, the city needs more improvements it has lot of divergence from the 2k drive, do we need more assets. can we use the garage builder to make more assets? Investigate with gauntlet loop how to make the game more professional"

- Base: live v87x (brave-carson 96e8e45). `out/v87x/index.html` has the same md5 as the live page. Served locally, normal build (no `?fast=1`), phone 852×393, touch input.
- Research with URLs: `docs/research/LEGO2K_RESEARCH.md`. Reference images: `docs/research/ref/` (15 files, each looked at and captioned).
- Our shots: `docs/shots/pro22/o_*.png`.
- Side-by-side sheets (top row 2K, bottom row ours): `docs/shots/pro22/sbs/1_garage_builder.jpg 2_collection.jpg 3_profile_perks.jpg 4_frankfurt.jpg 5_athens.jpg 6_race_hud.jpg`.
- "2K" below means seen in a reference shot or a cited source. "Ours (design)" means our own invention, not a 2K fact.

## 1. Gauntlet findings (looked at every shot)

| # | Screen | Divergence from 2K (concrete) | Sheet |
|---|---|---|---|
| F1 | Garage | **Two garages that don't match.** Side-panel garage: 6 tabs (RIDES PARTS PAINT HORN BRICKS DRIVER) + 3 footer buttons, with the car in the left 48 % and a stat box covering a third of it. BRICKS opens a second full-screen UI: a 14-button top bar in 4 styles (counter chip, grey glyphs ↶ ↷ ⟳, cyan MIRROR, blue ✚, dark SELECT/BODY/NEW/BASE/CLEAR, yellow DONE), 4 template chips, 9 category chips, 11 parts and 12 colours, so about **50 tap targets** on a phone. The DRIVER tab disappears while in BRICKS. 2K has ONE Body Shop: a name header with 2 budget bars, 3 tiles top right (ZOOM UNDO REDO) and 6 labelled tiles at the bottom (PLACE CANCEL ROTATE SNAP-VERTICAL COLOR MODIFIERS). | 1 |
| F2 | Garage PARTS | The parts list scrolls under the SAVE & DRIVE / STOCK LOOK / BACK footer (the "Stock wings" row is cut). Locked parts are text ("find Brick Pack 7") with no picture. | 1 |
| F3 | Stats | The stat box shows absolute numbers (TOP SPEED 100, ACCEL 99 (−1), GRIP 100, HULL 102 (+2)). The driver level changes nothing you can see. 2K shows **relative chips per car (−2 / +2 / −1 / +2) plus a weight badge** ("VERY LIGHT"); the base comes from the driver level. | 2 |
| F4 | Perks/level | Ours: 14 perks; 8 unlock by beating rivals (flags), 4 by level (3, 4, 12, 14, 18), and slots open at **levels 8 and 16**. Class B/A at 10/20 adds boost tricks. Every level gives +1.2 % top, +2 % accel, +1.2 % handling and +3 % hull to all cars (`carStat`), and **no screen shows it**. 2K: class C → B → A and **each class adds one perk slot** (3 max), a bigger boost meter and a boost ability. The perks screen has one big LVL number with an XP bar, a class badge, 4 tall stat bars with a "level line", and slots labelled C/B/A. | 3 |
| F5 | Profile | A dashboard of 4 boxes: a level-1 badge, **8 counters all at 0** for a new player, perks as 3 tiny chips, and a vehicle list. No hero element, and you can't see what levelling gives you. | 3 |
| F6 | Collection | The collection lives inside the 400 px RIDES panel: **1.5 cards visible**, the first slot is "BUILD YOUR OWN", and there is no loadout view showing street + off-road + boat together. 2K: a full-screen showroom (big car, stat chips, filter tabs, carousel) and a Loadout screen with 3 tilted cards. | 2 |
| F7 | Frankfurt | **The roads run through a flat lawn.** Buildings stand 30–80 m back and far apart; from the start camera it reads as a golf course with towers. Road furniture is just tall lamps: no sidewalks, no kerb-side shops, no benches, bins, bus stops, signs or parked cars along the road. Facades are textured boxes (Kenney + `lzBox`) with **no studs or brick look**. 2K towns have shopfronts at the kerb, parking bays, a prop every few metres, and everything is brick-built. Matches: deep blue sky with brick clouds, grey asphalt with a double yellow line, voxel trees. | 4 |
| F8 | Athens | The same lawn strip between the road and the buildings (real Athens is all pavement and apartment blocks right at the kerb). The street lamps are oversized and blue-grey. The apartment facades with balconies are the best buildings we have, but they are still flat boxes. The tutorial card sits on top of the boost bar, between ◀▶ and BRAKE. | 5 |
| F9 | Race | **The default race mood is "Neon Night"**: a cyberpunk city, hex floor and pink/cyan glow with no LEGO look at all (the "Brick Day" mood exists but isn't the default). The HUD has a small "01/08" top right and no standings list; 2K shows a huge "5TH" plus an 8-row standings list on the left, LAP and time on the right, and the held item above the car. Ours puts the speed number centre-top; 2K's open-world and race HUDs show no speedometer. | 6 |
| F10 | Menus | The title menu ("CHOOSE ACTIVITY" with 4 tilted cards) **already matches 2K closely**. It is our most professional screen, so we should copy its style (white cards, heavy italic, yellow/red ribbons) into the garage and profile. | — |

What only Alex can judge: whether any of this is fun. The shots prove layout and look, not feel.

## 2. Assets: inventory and answer

**What exists (counted in src/):**
- **64 Kenney models** (`50_kenney_data.js` KM_IDX): 17 low-poly buildings, 5 skyscrapers, 6 low-detail buildings, 9 vehicles, 4 boats, 4 trees, and about 15 small props (cone, barrier, dumpster, planter, fence, parasol, awning, stop sign, traffic lights, container, buoy).
- **~20 procedural prop types** (`propDefs` in 53: lamp tree bench bin post hydrant column stop stall table cone barrier crate fence pot car container rock bush lights) plus **~13 extras** (CE_ Athens cafe/moto/cypress/olive/pigeon/taxi, tower, gold, bricks, tlight, awning).
- **Buildings:** procedural boxes (`lzBox`/`lzCyl` + facade canvas textures) and Kenney buildings. **Landmarks:** about 22 hand-coded Frankfurt ones (Römer, EZB, Main Tower, Messeturm, Alte Oper, Kaiserdom…) and 17 Athens ones (Parthenon, Erechtheion, Propylaea, Hephaestus, Olympieion, Zappeion, Stadium…).
- **Brick-built so far:** the cars only (player, rivals, LEGO traffic; 13 templates). Nothing in the world is built from bricks except the voxel trees and clouds.

**Do we need more assets? Yes, but street-level kit, not more buildings:**
1. Sidewalk + kerb strips on all city roads (geometry, not models).
2. A kerb-side street kit: bus stop, kiosk (Athens *periptero*), café tables + parasol, phone box, newspaper stand, bike rack, bollards, flower boxes, parked cars (reuse the traffic geometry), scooters (Athens), minifig pedestrians on the sidewalk.
3. **Brick-look modular facades:** shopfront ground floor (awning + window + door), 2–3 upper-floor modules, a roof cap with studs. Frankfurt: half-timbered Römer-style and 1950s blocks; Athens: apartment blocks with balconies, a taverna, and neoclassical fronts.
4. A few big hero props in 2K style (giant brick statues, signs, a blimp): **Ebbelwoi Bembel jug, Euro sign, a Greek amphora, an olive tree**.

**Can the garage builder author world assets? YES, for anything up to car size, plus facade modules.** Evidence:
- The builder already saves a **compact brick list**: `[{t,x,y,z,r,m,c}]`, where t is a part id from `GB_PC`/CR parts, x/y/z are stud/plate grid positions, r is rotation, m is mirror and c is colour. The live builder car is **45 bricks = 2.6 KB of JSON** (measured in v87x).
- `GB_geo(bricks)` already turns a list into ONE merged geometry (`mergeGeometries`).
- **The world already instances brick-built geometry**: LEGO traffic uses `CR_cityGeo` → `CR_cityPost` → `THREE.InstancedMesh`, with a low-detail mode `CR_LO`. So "brick list → instanced mesh in the city" is proven code, not a new idea.
- **Cost:** at full builder detail the 45-brick car is **≈55k triangles** (≈1.2k per brick; studs are cylinders). That is far too heavy for 100 copies on a phone. The pipeline must **bake** the list: low-detail parts (`CR_LO`), studs only on exposed top faces with 6 segments (or a stud texture, as the roads already use), and hidden faces dropped. Target ≤ 40 tris per brick → a 150-brick kiosk ≈ 6k tris, instanced.
- **Limits:** the build grid is car-sized (about 20×30×12 studs in 2K, ours is a 120-part budget). That is fine for props and facade modules. Whole buildings = tiled facade modules (2–4 modules per floor), not one giant build.
- **File size:** index.html is 2.2 MB against the 3.6 MB cap (1.4 MB headroom). Even so, store assets **next to the page as `assets/props.json`** (like `tune.json`, which `99t_tune.js` already fetches). Compact format: one string per asset, 8 bytes per brick (part index, x, y, z, rot|mirror, colour index), base64 → **50 assets × 150 bricks ≈ 60 KB**, and 0 bytes added to index.html. The page falls back to today's procedural props if the fetch fails.

**Pipeline: BUILD → EXPORT AS ASSET → PLACE**
1. **BUILD:** `?dev=1` opens the builder in ASSET mode: a bigger grid (32×32×24 studs), no wheels or seat required, a name field, and a category (prop / facade-module / hero).
2. **EXPORT:** an "EXPORT ASSET" button writes the compact string plus its bounds and pivot, and copies the JSON (same UX as the TUNE drawer's EXPORT JSON). A worker or Alex pastes it into `src/assets/props.json`; `tools/build.sh` copies it to `out/<ver>/props.json` and deploy.sh ships it like tune.json.
3. **BAKE (in the page, at load):** `PA_bake(list)` → `GB_geo` with low-detail parts + stud culling → one BufferGeometry per asset, cached.
4. **PLACE:** a placement list per city in the same file, either `{a:'kiosk', x, z, ry}` or rules ("every 40 m on the sidewalk of class-2 streets, alternate bus stop / kiosk / bench"). It feeds the existing `lzProps`/`buildHubProps` path → `InstancedMesh` per asset, with colliders from the bounds (rounded, with a road setback; CLAUDE.md lesson 3).
5. **CHECK:** a tool `tools/asset_sheet.js` renders every asset into a contact sheet (3/4 view, 852×393) to LOOK at, and logs tris per asset and total. Gate: ≤ 6k tris per asset and ≤ +150k visible tris per frame; phone FPS unchanged in tPlay.

## 3. Level-based perks and stats (design that fits our game)

2K facts: class C/B/A, one perk slot per class, base stats rise with level, cars differ by relative modifiers and a weight class. Everything else below is **ours (design)**.

- **Driver level 1–30** (keep `lvlOf`). **Class C = 1–9, B = 10–19, A = 20–30** (keep).
- **Perk slots per class like 2K:** 1 at C, 2 at B (lvl 10), 3 at A (lvl 20). This changes today's 8/16 so that slots, class and boost tricks unlock together, one big moment each.
- **Level line:** the four stats Top Speed, Acceleration, Handling and Health use a 0–100 base that rises with level (today's `carStat` multipliers, shown as base 40 at level 1 to 100 at level 30). The profile shows **4 tall bars with a white level line**, as in 2K.
- **Car = relative chips:** each vehicle shows −3…+3 per stat, computed from today's stats relative to the class average, plus a **weight class from the brick count** (Super Light … Massive; 2K's six names). The garage stat box becomes "chips + weight badge" instead of "100 / 99 / 100 / 102".
- **Every level gives something (level road):** each level-up shows a reward card, alternating perk → paint finish → part → driver/horn. Perks unlock **by level** (spread over 2–28); the 8 rival-flag perks stay as "boss perks" (shown as 🚩 in the list). The profile and level-up card show "Next: Lvl 6 · Drift Master".
- **Vehicle level:** today's 4 upgrades × 3 = "Vehicle Lv 0–12", shown as 3 pips per upgrade on the card. Rarity keeps Neat / Cool / Awesome / Super Awesome.
- **Collection rewards (ours):** milestones at 25 / 50 / 75 / 100 % of vehicles + drivers + brick packs, each giving a paint finish or a part. The rewards show in the collection header.
- **Balance:** all perk effects stay inside the existing race-balance caps. No new stat beyond the 4 shown (plus Weight, which is display-only).

## 4. Garage reorganisation (one shell for everything)

```
┌──────────────────────────────────────────────────────────────────────────────┐ 852×393
│[🔧 GARAGE ribbon] [ Hot Rod ▾ ]  🧱 45/120 ▓▓▓░  ⚖ LIGHT      [↶][↷][✓ DONE]│ header 40px
│┌────┐                                                         ┌────────────┐│
││🚗  │ RIDES                                                    │ TOP  +2 ▮▮ ││ chips panel
││🧱  │ BUILD               (car on lit platform,                │ ACC  −1 ▮  ││ (only in
││🎨  │ PAINT                60 % of screen, centred)            │ HAN  +1 ▮  ││  RIDES and
││⚡  │ PERKS                                                    │ HP   +2 ▮▮ ││  PERKS)
││👤  │ DRIVER                                                   └────────────┘│
│└────┘ left rail 56px, icon + 12px label, 5 modes only                       │
│ ┌──────────────────────────────── context bar (1 row, ≤ 6 big tiles) ──────┐ │
│ │ RIDES : [◀ car ▶ carousel of cards ............]  [STREET|OFF|WATER]     │ │
│ │ BUILD : [category ▾][3D part thumbs ......] | [PLACE][ROTATE][MIRROR][🎨] │ │
│ │ PAINT : [FLAT|METAL|CHROME|GLOW] [paint-tin swatches .........] [ALL⇄PART]│ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```
- **5 modes** in a left rail: RIDES (collection + loadout), BUILD (bricks), PAINT, PERKS, DRIVER. PARTS (nose/wings kits) and HORN move into BUILD as categories ("Kits", "Sound").
- **One header** in every mode: car name, build bar, weight badge, UNDO, REDO, DONE. These are the 14 toolbar buttons today; SELECT, BODY, NEW, BASE, CLEAR and the 4 templates go into a "⋯" menu (NEW BUILD → template picker).
- **One context bar** at the bottom with ≤ 6 big labelled tiles, in **one button style** (the title menu's white rounded tiles with heavy italic labels).
- The car always sits in the centre 60 %. Panels never cover it; the stat chips sit in a narrow right column.
- **Acceptance:** at 852×393 at most 12 tap targets visible outside the part strip, 1 button style, no element over the car's bounding box, 12 px minimum text, every mode reachable in 1 tap, nothing scrolls under the footer. Shot set: each mode, plus an iframe check.

## 5. Prioritised list (impact on "professional feel" ÷ effort)

| # | Item | Impact | Effort | Owner | Acceptance check |
|---|---|---|---|---|---|
| 1 | Race default mood = **Brick Day**; Neon Night becomes an option | high | XS | UI | The first race start shot is daylight LEGO; the mood chips are unchanged. |
| 2 | Garage stat box → **relative chips + weight badge** | high | S | systems/UI | No absolute "100" visible; chips −3…+3 match the stat table; the weight class comes from the brick count. |
| 3 | **Garage shell** (wireframe §4): 5-mode rail, one header, one context bar, one style | very high | M | UI | The §4 acceptance list; a quick review of the 5 mode shots. |
| 4 | **Level road**: slots at 1/10/20, perks by level, a level-up reward card, "Next: …" | high | M | systems | Unit check: lvl 9→10 gives slot 2 + class B in one card; the profile shows the next reward; the race caps hold. |
| 5 | **Profile = 2K perks screen**: big LVL + XP bar, class badge, 4 bars + level line, C/B/A slots; counters move to a second tab | high | S | UI | One hero number; no "0" counters on the first screen for a new player. |
| 6 | **Full-screen showroom + loadout** (carousel, filter tabs, 3-card loadout) | med-high | M | UI | ≥ 3 cards visible at 852×393; the loadout shows street+off-road+boat. |
| 7 | **Sidewalks + kerbs + setback cut**: the lawn strip becomes pavement; buildings 4–8 m from the kerb | very high | M | world-art | Shot: from road level no lawn between the road and the facades in the city centre; tPlay wall hits ≤ 1/min (collision must match; lesson 3). |
| 8 | Race HUD: big position + standings list, no centre speedo | med | S | UI | Race shot shows "3RD" ≥ 40 px and 4–8 standings rows that don't cover the controls. |
| 9 | Athens: lamps at real scale/colour; tutorial card moved off the boost bar | med | XS | world-art/UI | Shot: lamp ≤ 6 m; the card's box doesn't intersect the boost bar or controls. |
| 10 | **Asset pipeline** (§2: ASSET mode, EXPORT, props.json, bake, place, contact sheet) | enabler | M-L | pipeline | 1 test asset built in the builder shows in both cities, instanced, ≤ 6k tris; props.json missing → game unchanged; tPlay FPS unchanged. |
| 11 | **Street kit v1** built with the pipeline: bus stop, kiosk, café set, bollards, flower box, bike rack + parked cars on the sidewalk | very high | M | world-art | Road-level shot: a prop every ≤ 15 m on main streets; the contact sheet looked at; tris in budget. |
| 12 | **Brick facades**: shopfront + floor + roof modules (Frankfurt + Athens sets) replacing boxes on the 1st row of buildings | very high | L | world-art | Side-by-side vs 2K town: studs and brick reveals visible at road level; draw calls ≤ +30. |
| 13 | Hero props (Bembel, Euro sign, amphora, giant wrench-style gate) | med | S each | world-art | Each is visible from its district's main road. |
| 14 | Paint finishes FLAT/METALLIC/CHROME/GLOW in PAINT | med | S | UI/art | 4 tabs; each finish visibly different in a garage shot. |

## 6. Releases (smallest first; each ships on its own)

- **R1 "Quick polish" (UI, XS–S): items 1, 2, 9.** Quick review (text/colour/position class). Gives an instant LEGO race look and car cards that read like 2K.
- **R2 "Garage shell" (UI, M): items 3 + 14.** The fix for "garage builder is a mess". Full shot review of every garage mode, plus a tPlay garage trip.
- **R3 "Levels matter" (systems + UI, M): items 4, 5, 6.** Profile, perks and collection rebuilt around the level line. Gate: the race balance checks (tRace) and a profile shot.
- **R4 "Streets" (world-art, M): items 7, 8.** Sidewalks/setback (needs the full gate: tPlay, wall hits, tyre gap) and the race HUD.
- **R5 "Brick city" (pipeline + world-art, L): items 10, 11, 12, 13.** Pipeline first, then the street kit, then the facades. Full gate on each step. Each kit drop is its own deploy.

Order rationale: R1–R3 touch only UI/state (low risk, no driving changes); R4–R5 change the world and collision, so they need tPlay. R5 is the answer to "do we need more assets / can the builder make them": yes, and it is the largest single step toward 2K, so it goes last only because it depends on R4's sidewalks.
