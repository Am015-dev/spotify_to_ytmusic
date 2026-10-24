# Flight stage 1 background layers for Google Flow (24 Oct 2026)

Why: the stage-1 sky picture (`bg-bankenviertel.webp`) is a painted illustration, but the three parallax layers in front of it
(`ly-far`, `ly-mid`, `ly-near-rail`) are flat vector-like silhouettes in a different style, and the mid layer is as bright and busy as the
ships. Two art styles stacked = "ugly layers". This set replaces all of them with ONE painted style and clear depth.

## Rules for every image
- **Attach `bg-bankenviertel.webp` as the style reference** in Flow for every prompt (same painting style, palette, rain, neon).
- Side view for a side-scrolling flying game, horizon low, no perspective vanishing toward the viewer.
- **Seamless horizontal tiling**: the left and right edges must join with no seam (ask for "seamless tileable left-right").
- Layers 2-4: **transparent background** above the skyline. If Flow cannot do transparency, use flat pure green #00FF00 and I cut it out.
- No text, no letters, no logos, no aircraft, no people in the sky area (ships fly there).
- Value plan (most important): far = dark and hazy, low contrast; mid = medium dark, few lit windows; near = almost black silhouette with
  thin neon rim light. The ships must be the brightest things on screen, so no layer may have big bright areas in the middle band.

**Style block (paste first in every prompt):**
> Painted cyberpunk Frankfurt skyline at night in 2099, hand-painted game background art matching the reference image, rainy, purple and
> teal haze, magenta and cyan neon accents, soft painterly edges, side view for a 2D side-scrolling flying game, seamless tileable
> left-right, no text, no logos, no aircraft.

## The set (PC 1376 wide; phone versions after)

| # | File | Size | What |
|---|---|---|---|
| 1 | `bg-bankenviertel-sky.webp` | 1376 x 768 | Sky only: storm clouds, distant moon glow, faint rain, NO buildings (so the city can scroll in layers) |
| 2 | `ly-far-bankenviertel.webp` | 1376 x 325 | Far skyline: tall towers as hazy dark violet shapes, almost no detail, a few tiny dim windows, fog at the base |
| 3 | `ly-mid-bankenviertel.webp` | 1376 x 520 | Mid city: painted office towers and the old opera-house dome, dark, only scattered warm windows and 2-3 small neon signs |
| 4 | `ly-near-rail.webp` | 1376 x 484 | Near: elevated railway bridge with girders, catenary poles, wires and a lamp post, near-black with a thin cyan/magenta rim, wet shine |
| 5 | `ly-fore-bankenviertel.webp` | 1376 x 300 | Foreground passing in front of the ships, very sparse: one steel girder, a hanging cable, steam, a sign edge; will be drawn semi-transparent and blurred |

**Prompts:**
1. `[style block]` Wide painting of only the night sky over the city: heavy purple storm clouds lit from below by city glow, a soft hidden
   moon halo, thin diagonal rain. No buildings at all, the bottom fifth fades into purple fog. 1376 x 768.
2. `[style block]` A distant skyline strip: tall towers and the bank district silhouette as hazy dark violet shapes melting into fog, very
   low contrast, only a handful of tiny dim windows. Transparent sky above. 1376 x 325.
3. `[style block]` A middle-distance city strip: painted office towers of different heights and a classical domed opera house, dark
   blue-violet, scattered warm yellow windows (no more than one in ten lit), two or three small neon signs. Transparent sky above. 1376 x 520.
4. `[style block]` A close elevated railway viaduct running along the bottom: steel girders, arches, catenary poles with wires, one street
   lamp, almost black with a thin cyan and magenta rim light on the top edges, wet reflections. Transparent above the structure. 1376 x 484.
5. `[style block]` Sparse very close foreground pieces at the bottom edge: one diagonal steel girder corner, a hanging cable, a puff of
   steam, the edge of a neon sign, almost black, transparent everywhere else. 1376 x 300.

## Phone (portrait) versions
| # | File | Size |
|---|---|---|
| 1p | `bg-bankenviertel-sky-phone.webp` | 768 x 1376 (same sky, portrait, top two-thirds clouds) |
| 2p-4p | `ly-phone-bankenviertel.webp` (replace) | 768 x 573, mid city + viaduct combined, same rules, seamless left-right |

## After delivery
Drop the files into `games/mainhattan-nightrun/media/` (or send them to me). I wire the sky plate and the foreground layer, set parallax
0.05 / 0.15 / 0.35 / 0.7 / 1.3, add haze between layers, and send you ONE phone + ONE PC screenshot next to a benchmark shooter before
anything goes live.
