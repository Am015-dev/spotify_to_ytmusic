# RACE2K plan (race worker 15, 2026-10-07)

Alex: "The races feel slow. Use boat, off-road and racer strategically. Not that narrow. More power-ups."

## 1. LEGO 2K Drive races: what the sources say
Sources: 2K PC manual [S1], Wikipedia [S3], Destructoid [S5], Nintendo Life [S6], GTPlanet physics article [S10], racinggames.gg guides [S8, S11]. The URL list is at the bottom. UNVERIFIED marks anything no source confirmed.

| trait | 2K Drive | source |
|---|---|---|
| Race types | Circuit (laps), and Point-to-Point "using whatever route you think is best" | S1 |
| Field | 6 online and 2 split-screen. AI grid size is UNVERIFIED | S3 |
| Race length | About 2–3 min (one speedrun split: 2:46) | S12 |
| Track width | No number published (UNVERIFIED). On screen: wide open courses that are part of the open world | S6 |
| Transforms | Fully automatic street ↔ off-road ↔ boat by terrain, "go practically anywhere with no slowing down". The swap is an instant brick burst. A manual toggle exists | S6, S9, S1 |
| Shortcuts | Frequent. Many only work because of the auto-transform (water, off-road). AI uses shortcuts too | S6, S7, S5 |
| Boost | A meter refills over time and faster from smashing objects and drifting. Turbines pop out. Brickbash comes on a full meter, and Quickbash is a double-tap | S1, S4, S8 |
| Drafting | Not found in any source; probably absent | — |
| Items | Pickups glow with an icon (purple "?" = random). They respawn and can be fired forward or back. Homing Missile · Ghost · Fruit Blaster (auto turret) · EMP (shield and shockwave) · Teleport (catch-up) · Mines · Web Crasher (blinds and slows) · Square Wheels | S1 |
| Speed and camera | "A good sense of speed". Rubber-banding is strong. FOV and top speed: UNVERIFIED | S2, S3, S5 |

## 2. Our races now (live v87p, measured with `tools/tRace.js`, phone 852×393, real touch)
| | Grand Prix | Westhafen |
|---|---|---|
| Track width W | 18.2 m (every track: `CR_trackW` caps it at 14–20 m; was 48) | 18.2 m |
| Lap (= whole race, LAP 1/1) | 6966 m, 147 s | 3833 m, 95 s |
| Avg / top km/h | 170 / 236 | 145 / 248 |
| Transforms per lap | 2 | 2 (one water section) |
| Wall hits/min | 1.22 | 0.63 |
| Item boxes | flat floor pads with a beam, 3 abreast every ~1 km (grand 21) | 12 |
| Item kinds | 12 already (turbo, shield, rockets, missile, emp, rail, mines, tornado, wall, oil, magnet, storm) | |
| Shortcuts | none: one centre line, both walls closed | none |
Phone buttons in a race: ◀ ▶ BRAKE ITEM BOOST (5; GAS is automatic on touch).

## 3. Plan (each slice ships separately, gated by tRace + 852×393 shots + reviewer)
**a) Speed + width.** W goes from 18.2 to 38 m (2.1×), so lanes, pads and AI spread scale through `CR_LS`. Race top speed is +20 % and acceleration +35 % for every racer (race only, roam untouched). Bigger FOV kick, speed lines, and a boost burst (turbine flash and particles). The AI keeps its rubber band.
**b) Strategic routes.** Each track gets side corridors on the inside of big bends. The inner wall opens at a signed mouth (big arrow boards: "⤷ SHORTCUT · WATER" / "OFF-ROAD"). The corridor runs through a water channel or a dirt piste, and the car auto-transforms there (same 0.25 s swap). It is physically shorter, because the inside line of the bend is covered faster (`ds = v/(1−k·x)`). The trade-off is lower grip, a lower top speed in dirt, mud, and waves/boost rings in water. The AI takes it at a skill-based rate.
**c) Power-ups.** Floating LEGO "?" item bricks replace the floor pads: they spin, burst on pickup and respawn after 3 s, in more rows. A 2K-style item set of six: homing MISSILE, TURBO, SHIELD (EMP pulse), WEB trap (slows and blinds), MINES, LIGHTNING (storm). One slot and the existing ITEM button, so still 5 buttons. The AI already fires items.

Sources: [S1] cdn.2kgames.com/manuals/legodrive/pc/2KGWIN_LEGO_2K_Drive_PC_Online_Manual_ENG.pdf · [S2] gamecritics.com/c-j-salcedo/lego-2k-drive-review · [S3] en.wikipedia.org/wiki/Lego_2K_Drive · [S4] lego.2k.com/drive/features/driving-techniques (snippet) · [S5] destructoid.com/reviews/lego-2k-drive-review-destructoid-lego-racer · [S6] nintendolife.com/reviews/switch-eshop/lego-2k-drive · [S7] totalgamingaddicts.com (snippet) · [S8] racinggames.gg/article/lego-2k-drive-beginners-guide-5-essential-tips-and-tricks-you-need-to-know · [S9] godisageek.com/reviews/lego-2k-drive-review (snippet) · [S10] gtplanet.net/lego-2kdrive-physics-engine-20230516 · [S11] racinggames.gg/article/how-to-boost-start-in-lego-2k-drive · [S12] splits.io/bssc (snippet)
